#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML → 内容源 导入器
============================================================
把现有静态页（index.html、pages/**.html）导入为 content/topics/*.md：

  · 头部信息（title / description / accent / 导航高亮 / hero / 面包屑）→ front-matter
  · 标准块（本页读法、本域地图、关键数字、算例、进阶公式、边界与争议、
    FAQ、延伸阅读）→ content/data/pages/<slug>.json（结构化字段）
  · 其余正文（各 sec 章节）→ Markdown 源中的原始 HTML 透传块
    （站点本身已使用 HTML 组件，透传可保证零信息损失）

用法：python tools/import_html.py [--out content]
纯标准库实现。
"""
import argparse
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RE_TITLE = re.compile(r"<title>(.*?)</title>", re.S | re.I)
RE_DESC = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', re.S | re.I)
RE_ACCENT = re.compile(r'<body\s+class=["\']([^"\']*)["\']', re.I)
RE_HERO = re.compile(r'<section class=["\']hero[^"\']*["\']>(.*?)</section>', re.S)
RE_KICKER = re.compile(r'<span class=["\']kicker["\']>(.*?)</span>', re.S)
RE_H1 = re.compile(r"<h1>(.*?)</h1>", re.S)
RE_LEAD = re.compile(r'<p\s+class=["\']lead["\']>(.*?)</p>', re.S)
RE_CRUMB = re.compile(r'<nav class=["\']crumb["\']>(.*?)</nav>', re.S)
RE_CRUMB_A = re.compile(r'<a href=["\']([^"\']+)["\']>(.*?)</a>', re.S)
RE_MAIN = re.compile(r"<main>(.*?)</main>", re.S)
RE_TOC = re.compile(r'<aside class=["\']toc["\'][^>]*>.*?</aside>', re.S)
RE_NAV_ACTIVE = re.compile(r'<a href=["\'][^"\']*pages/(\w+)\.html["\']\s+class=["\']active["\']')

RE_PANEL = re.compile(r'<div class=["\']panel (info|tip|warn|danger)["\']>'
                      r'(?:<span class=["\']pt["\']>(.*?)</span>)?(.*?)</div>', re.S)
RE_PANEL_EMPTY = re.compile(r'<div class=["\']panel (info|tip|warn|danger)["\']>\s*'
                            r'(?:<span class=["\']pt["\']>.*?</span>)?\s*</div>', re.S)
RE_FAQ_BLOCK = re.compile(r'<div class=["\']faq["\']>(.*?)</div>', re.S)
RE_FAQ_SECTION = re.compile(r'<section class=["\']sec scroll-target["\'] id=["\']faq["\']>.*?</section>', re.S)
RE_DETAILS = re.compile(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", re.S)
RE_REFS = re.compile(r'<section class=["\']sec scroll-target["\'] id=["\']refs["\']>(.*?)</section>', re.S)
RE_PAPER = re.compile(r'<div class=["\']paper["\']>(?:<h4>(.*?)</h4>)?(.*?)</div>', re.S)
RE_RELATED = re.compile(r'<section class=["\']related[^"\']*["\']>(.*?)</section>', re.S)
RE_LINKS = re.compile(r'<a href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.S)

SKIP_NAMES = set()


def strip_tags(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = s.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
    return re.sub(r"\s+", " ", s).strip()


def read(path):
    with io.open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def html_files():
    out = []
    idx = os.path.join(ROOT, "index.html")
    if os.path.exists(idx):
        out.append(idx)
    for dp, _dn, fns in os.walk(os.path.join(ROOT, "pages")):
        for fn in sorted(fns):
            if fn.endswith(".html") and fn not in SKIP_NAMES:
                out.append(os.path.join(dp, fn))
    return out


def page_id(path):
    return os.path.relpath(path, ROOT).replace("\\", "/")


PANEL_OPEN = re.compile(r'<div class="panel (info|tip|warn|danger)">')


def balanced_div_end(text, start):
    """从 <div …> 的起始位置找到配对 </div> 的结束下标（-1 表示未闭合）。"""
    depth = 0
    for m in re.finditer(r"<div\b|</div>", text[start:]):
        if m.group(0).startswith("</"):
            depth -= 1
            if depth == 0:
                return start + m.end()
        else:
            depth += 1
    return -1


def extract_panels(work):
    """按平衡匹配提取全部面板，返回 (panels, 去掉面板后的正文)。"""
    panels, out, i = [], [], 0
    while True:
        m = PANEL_OPEN.search(work, i)
        if not m:
            out.append(work[i:])
            break
        end = balanced_div_end(work, m.start())
        if end < 0:
            out.append(work[i:])
            break
        chunk = work[m.start():end]
        hm = re.search(r'<span class="pt">(.*?)</span>', chunk, re.S)
        head = strip_tags(hm.group(1)) if hm else ""
        inner = chunk[m.end() - m.start():]
        inner = re.sub(r"^\s*<span class=\"pt\">.*?</span>", "", inner, count=1, flags=re.S)
        inner = re.sub(r"</div>\s*$", "", inner).strip()
        panels.append({"kind": m.group(1), "head": head, "html": inner})
        out.append(work[i:m.start()])
        i = end
    return panels, "".join(out)


def split_blocks(main_html):
    """把 <main> 内容切成 (panels, faq, refs, related, body)。"""
    work = main_html
    # 剥离最外层容器：<div class="wrap layout2"> … <div> 正文 </div> </div>
    work = re.sub(r"(</div>\s*){2}\s*$", "", work)
    work = re.sub(r'^\s*<div class=["\']wrap[^"\']*["\']>\s*', "", work)
    work = re.sub(r'^\s*<aside class=["\']toc["\'][^>]*>.*?</aside>\s*', "", work, flags=re.S)
    work = re.sub(r"^\s*<div>\s*", "", work, count=1)
    work = re.sub(r"^\s*<div>\s*", "", work, count=1)

    panels, work = extract_panels(work)

    faq = []
    for m in RE_FAQ_BLOCK.finditer(work):
        for d in RE_DETAILS.finditer(m.group(1)):
            faq.append({"q": strip_tags(d.group(1)), "a": d.group(2).strip()})

    refs = []
    for m in RE_REFS.finditer(work):
        for p in RE_PAPER.finditer(m.group(1)):
            refs.append({"head": strip_tags(p.group(1) or ""), "html": p.group(2).strip()})

    related = []
    for m in RE_RELATED.finditer(work):
        for a in RE_LINKS.finditer(m.group(1)):
            related.append({"href": a.group(1), "text": strip_tags(a.group(2))})

    body = RE_TOC.sub("", work)
    body = RE_FAQ_SECTION.sub("", body)
    body = RE_REFS.sub("", body)
    body = RE_RELATED.sub("", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    return panels, faq, refs, related, body


RE_TOC_BLOCK = re.compile(r'<aside class="toc"[^>]*>(.*?)</aside>', re.S)
RE_TOC_LINK = re.compile(r'<a href="([^"]+)"(?:\s+class="([^"]*)")?[^>]*>(.*?)</a>', re.S)


def extract_toc(main_html):
    out = []
    m = RE_TOC_BLOCK.search(main_html)
    if not m:
        return out
    for a in RE_TOC_LINK.finditer(m.group(1)):
        out.append({"href": a.group(1), "cls": a.group(2) or "", "text": strip_tags(a.group(3))})
    return out


def pick(panels, prefix):
    for p in panels:
        if (p["head"] or "").startswith(prefix):
            return p
    return None


def section_title(html, sec_id, tag):
    """提取某个 section 的标题文本（sec_id 为 None 时取第一个 related 区块）。"""
    if sec_id:
        pat = (r'<section class=["\']sec scroll-target["\'] id=["\']%s["\']>\s*'
               r'<div class=["\']sec-head["\']>.*?<%s>(.*?)</%s>' % (sec_id, tag, tag))
    else:
        pat = r'<section class=["\']related[^"\']*["\'][^>]*>\s*<%s>(.*?)</%s>' % (tag, tag)
    m = re.search(pat, html, re.S)
    return strip_tags(m.group(1)) if m else ""


def build_front_matter(path, raw):
    name = os.path.splitext(os.path.basename(path))[0]
    meta = {"id": page_id(path), "slug": name}
    m = RE_TITLE.search(raw)
    meta["title"] = strip_tags(m.group(1)) if m else name
    m = RE_DESC.search(raw)
    meta["description"] = strip_tags(m.group(1)) if m else ""
    m = RE_ACCENT.search(raw)
    body_cls = (m.group(1).strip() if m else "") or ""
    accents = [c for c in body_cls.split() if c.startswith("accent-")]
    meta["accent"] = " ".join(accents) or "accent-tech"
    m = RE_NAV_ACTIVE.search(raw)
    meta["nav_active"] = m.group(1) if m else ""
    meta["hero_kicker"] = meta["hero_h1"] = meta["hero_lead"] = ""
    hero = RE_HERO.search(raw)
    if hero:
        seg = hero.group(1)
        k, h, l = RE_KICKER.search(seg), RE_H1.search(seg), RE_LEAD.search(seg)
        meta["hero_kicker"] = strip_tags(k.group(1)) if k else ""
        meta["hero_h1"] = strip_tags(h.group(1)) if h else meta["title"]
        meta["hero_lead"] = strip_tags(l.group(1)) if l else ""
    trail = []
    crumb = RE_CRUMB.search(raw)
    if crumb:
        for a in RE_CRUMB_A.finditer(crumb.group(1)):
            trail.append({"href": a.group(1), "text": strip_tags(a.group(2))})
        parts = re.split(r'<span class=["\']sep["\']>[^<]*</span>', crumb.group(1))
        last = strip_tags(parts[-1]) if parts else ""
        if last and last not in [t["text"] for t in trail]:
            trail.append({"href": "", "text": last})
    meta["crumb"] = trail
    return meta


def to_source(body_html):
    text = (body_html or "").strip()
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def import_page(path, content_dir):
    raw = read(path)
    meta = build_front_matter(path, raw)
    main = RE_MAIN.search(raw)
    if not main:
        return None
    panels, faq, refs, related, body = split_blocks(main.group(1))

    page = {"faq": faq, "refs": refs, "related": related}
    page["faq_title"] = section_title(main.group(1), "faq", "h2")
    page["refs_title"] = section_title(main.group(1), "refs", "h2")
    page["related_title"] = section_title(main.group(1), None, "h3")
    page["toc"] = extract_toc(main.group(1))
    guide = pick(panels, "本页读法")
    if guide:
        page["read_guide"] = {"head": guide["head"], "kind": guide["kind"], "html": guide["html"]}
    dmap = pick(panels, "本域地图")
    if dmap:
        page["domain_map"] = {"head": dmap["head"], "html": dmap["html"]}
    keyn = pick(panels, "关键数字")
    if keyn:
        page["key_numbers"] = {"head": keyn["head"], "html": keyn["html"]}
    hint = pick(panels, "阅读提示")
    if hint:
        page["read_hint"] = {"head": hint["head"], "html": hint["html"]}
    for p in panels:
        head = p["head"] or ""
        if head.startswith("算一算"):
            page.setdefault("example_blocks", []).append({"head": head, "html": p["html"]})
        elif head.startswith("边界与争议"):
            page["debates"] = {"head": head, "html": p["html"]}
        elif head.startswith("▪ 进阶"):
            page.setdefault("advanced_blocks", []).append({"head": head, "html": p["html"]})

    lines = ["---"]
    for key in ("id", "slug", "title", "description", "accent", "nav_active",
                "hero_kicker", "hero_h1", "hero_lead"):
        val = str(meta.get(key, "")).strip().replace("\n", " ")
        if val:
            lines.append('%s: "%s"' % (key, val.replace('"', "'")))
    for c in meta["crumb"]:
        lines.append('crumb: "%s|%s"' % (c["text"], c["href"]))
    lines.append("---")
    src = "\n".join(lines) + "\n\n" + to_source(body) + "\n"

    topics_dir = os.path.join(content_dir, "topics")
    os.makedirs(topics_dir, exist_ok=True)
    with io.open(os.path.join(topics_dir, meta["slug"] + ".md"), "w",
                 encoding="utf-8", newline="\n") as fh:
        fh.write(src)

    data_dir = os.path.join(content_dir, "data", "pages")
    os.makedirs(data_dir, exist_ok=True)
    with io.open(os.path.join(data_dir, meta["slug"] + ".json"), "w",
                 encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(page, ensure_ascii=False, indent=2))

    return {"id": meta["id"], "slug": meta["slug"], "panels": len(panels),
            "faq": len(faq), "bytes": len(body)}


def main():
    ap = argparse.ArgumentParser(description="把现有 HTML 导入为内容源")
    ap.add_argument("--out", default=os.path.join(ROOT, "content"))
    args = ap.parse_args()
    tot = {"pages": 0, "panels": 0, "faq": 0, "bytes": 0}
    for path in html_files():
        info = import_page(path, args.out)
        if not info:
            continue
        tot["pages"] += 1
        tot["panels"] += info["panels"]
        tot["faq"] += info["faq"]
        tot["bytes"] += info["bytes"]
        print("imported %-44s panels=%-2d faq=%-2d body=%d" %
              (info["id"], info["panels"], info["faq"], info["bytes"]))
    print("---")
    print("pages=%d panels=%d faq=%d body_chars=%d" %
          (tot["pages"], tot["panels"], tot["faq"], tot["bytes"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())



