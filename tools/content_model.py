#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
内容模型：front-matter 解析、数据加载与结构校验
============================================================
目录约定
  content/cards/*.md      知识卡（1 知识点 = 1 文件）
  content/topics/*.md     主题页
  content/tutorial/*.md   教程页
  content/data/*.json     concepts / metrics / standards / sources / examples / faqs

front-matter 采用极简 YAML 子集：key: value、key: [a, b]、引号包裹的字符串。
纯标准库实现，无第三方依赖。
"""
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content")

FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?", re.S)

CARD_REQUIRED = ["id", "title", "level", "canonical", "one_liner"]
TOPIC_REQUIRED = ["id", "title"]


class Node(object):
    """一张卡片或一个页面。"""

    def __init__(self, kind, path, meta, body):
        self.kind = kind
        self.path = path
        self.meta = meta
        self.body = body

    def get(self, key, default=None):
        return self.meta.get(key, default)

    @property
    def id(self):
        return self.meta.get("id", "")

    @property
    def rel_path(self):
        return os.path.relpath(self.path, ROOT).replace("\\", "/")

    def __repr__(self):
        return "<%s %s>" % (self.kind, self.id)


def parse_scalar(value):
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        return [parse_scalar(v) for v in inner.split(",")] if inner else []
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    if value in ("true", "false"):
        return value == "true"
    if re.match(r"^-?\d+$", value):
        return int(value)
    return value


def parse_front_matter(text):
    """返回 (meta, body)。无 front-matter 时 meta 为空 dict。"""
    m = FM_RE.match(text)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).split("\n"):
        line = line.rstrip()
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        k, v = key.strip(), parse_scalar(value)
        if k in meta:  # 重复键累积为列表（例如逐条出现的 crumb）
            if not isinstance(meta[k], list):
                meta[k] = [meta[k]]
            meta[k].append(v)
        else:
            meta[k] = v
    return meta, text[m.end():]


def read_text(path):
    with io.open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def load_dir(kind, subdir, required):
    """加载一个目录下的所有 .md，返回 {id: Node}。"""
    out = {}
    base = os.path.join(CONTENT, subdir)
    if not os.path.isdir(base):
        return out
    for name in sorted(os.listdir(base)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(base, name)
        meta, body = parse_front_matter(read_text(path))
        if not meta.get("id"):
            meta["id"] = name[:-3]
        missing = [k for k in required if k not in meta]
        if missing:
            raise ValueError("%s 缺少必填字段: %s" % (path, ", ".join(missing)))
        node = Node(kind, path, meta, body)
        if node.id in out:
            raise ValueError("重复的 id: %s (%s)" % (node.id, path))
        out[node.id] = node
    return out


def load_json(name, default=None):
    path = os.path.join(CONTENT, "data", name + ".json")
    if not os.path.exists(path):
        return default if default is not None else {}
    return json.loads(read_text(path))


class Content(object):
    """全部内容源与关系查询。"""

    def __init__(self):
        self.cards = load_dir("card", "cards", CARD_REQUIRED)
        self.topics = load_dir("topic", "topics", TOPIC_REQUIRED)
        self.tutorial = load_dir("tutorial", "tutorial", ["id", "title"])
        self.concepts = load_json("concepts", {})
        self.metrics = load_json("metrics", {})
        self.standards = load_json("standards", {})
        self.sources = load_json("sources", {})
        self.examples = load_json("examples", {})
        self.faqs = load_json("faqs", {})
        idx = self.concepts.get("cards", {}) if isinstance(self.concepts, dict) else {}
        self.index = idx
        self.groups = self.concepts.get("groups", []) if isinstance(self.concepts, dict) else []

    # ---------- 关系 ----------
    def meta_of(self, card_id):
        return self.index.get(card_id, {})

    def links(self, card_id, key):
        return list(self.meta_of(card_id).get(key, []) or [])

    def prereq(self, card_id):
        return self.links(card_id, "prereq")

    def extends(self, card_id):
        return self.links(card_id, "extends")

    def contrasts(self, card_id):
        return self.links(card_id, "contrasts")

    def group_of(self, card_id):
        return self.meta_of(card_id).get("group", "")

    def cards_in_group(self, group):
        return [cid for cid in self.cards if self.group_of(cid) == group]

    def example(self, example_id):
        return self.examples.get(example_id)

    def faq_list(self, page_id):
        data = self.faqs.get(page_id, {})
        if isinstance(data, list):
            return data
        return data.get("items", []) if isinstance(data, dict) else []

    def debates(self, page_id):
        data = self.faqs.get(page_id, {})
        return data.get("debates", []) if isinstance(data, dict) else []

    # ---------- 校验 ----------
    def validate(self):
        errors, warnings = [], []

        for cid in self.index:
            if cid not in self.cards:
                errors.append("concepts.json 引用了不存在的卡片: %s" % cid)
        for cid in self.cards:
            if cid not in self.index:
                warnings.append("卡片 %s 未登记到 concepts.json（不参与图谱与路径）" % cid)

        for cid in self.index:
            for key in ("prereq", "extends", "contrasts"):
                for target in self.links(cid, key):
                    if target not in self.cards:
                        errors.append("卡片 %s 的 %s 指向不存在的卡片: %s" % (cid, key, target))
            if self.meta_of(cid).get("group") and \
                    self.meta_of(cid)["group"] not in [g.get("id") for g in self.groups]:
                warnings.append("卡片 %s 的分组未在 concepts.json 的 groups 中声明: %s"
                                % (cid, self.meta_of(cid)["group"]))

        for cid, card in self.cards.items():
            page = (card.get("canonical") or "").split("#")[0]
            if not page:
                errors.append("卡片 %s 缺少 canonical 页" % cid)
            stem = os.path.basename(page)[:-5] if page.endswith(".html") else ""
            if stem and stem not in self.topics and stem not in self.tutorial:
                warnings.append("卡片 %s 的 canonical 页在内容源中找不到对应主题: %s" % (cid, page))
            for ex in re.findall(r"\{\{example:([^}|]+)", card.body):
                if ex.strip() not in self.examples:
                    errors.append("卡片 %s 引用了不存在的算例: %s" % (cid, ex.strip()))
            for ref in re.findall(r"\{\{card:([^}|]+)", card.body):
                if ref.strip() == cid:
                    errors.append("卡片 %s 引用了自身" % cid)
                elif ref.strip() not in self.cards:
                    errors.append("卡片 %s 引用了不存在的卡片: %s" % (cid, ref.strip()))

        for tid, topic in self.topics.items():
            for ref in re.findall(r"\{\{card:([^}|]+)", topic.body):
                if ref.strip() not in self.cards:
                    errors.append("主题 %s 引用了不存在的卡片: %s" % (tid, ref.strip()))
            for kind in ("example", "metric", "standard", "source"):
                for ref in re.findall(r"\{\{%s:([^}|]+)" % kind, topic.body):
                    pool = {"example": self.examples, "metric": self.metrics,
                            "standard": self.standards, "source": self.sources}[kind]
                    if ref.strip() not in pool:
                        warnings.append("主题 %s 引用了不存在的 %s: %s" % (tid, kind, ref.strip()))

        WHITE, GREY, BLACK = 0, 1, 2
        color = dict((cid, WHITE) for cid in self.index)

        def visit(cid, stack):
            color[cid] = GREY
            for nxt in self.prereq(cid):
                if nxt not in color:
                    continue
                if color[nxt] == GREY:
                    errors.append("前置关系存在环: %s" % " -> ".join(stack + [cid, nxt]))
                    return
                if color[nxt] == WHITE:
                    visit(nxt, stack + [cid])
            color[cid] = BLACK

        for cid in list(self.index):
            if color.get(cid, WHITE) == WHITE:
                visit(cid, [])

        return errors, warnings

