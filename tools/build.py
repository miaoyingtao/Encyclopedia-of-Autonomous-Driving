#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
站点构建器
============================================================
content/（Markdown + JSON） →  site/（纯静态 HTML）

  python tools/build.py            # 生成全站
  python tools/build.py --check    # 只做结构校验
  python tools/build.py --list     # 列出将生成的页面
  python tools/build.py --report   # 生成后输出与旧版的文本相似度报告

设计约束
  · 输出结构与现有站点完全一致（URL、class、脚本引用）
  · 纯标准库；不引入构建框架
  · index.html 与 pages/news.html 属特殊布局，直接沿用旧文件
"""
import argparse
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import md  # noqa: E402
from content_model import Content, ROOT, CONTENT  # noqa: E402

SITE = os.path.join(ROOT, "site")
OLD = ROOT  # 旧站根目录（用于 index/news 与相似度对比）

NAV = [
    ("{p}index.html", "首页", "index"),
    ("{p}pages/overview.html", "入门", "overview"),
    ("{p}pages/tech.html", "技术", "tech"),
    ("{p}pages/challenges.html", "安全与验证", "challenges"),
    ("{p}pages/scenarios.html", "落地与产业", "scenarios"),
    ("{p}pages/frontier.html", "AI 前沿", "frontier"),
    ("{p}pages/tutorial/index.html", "系统教程", "tutorial"),
    ("{p}pages/news.html", "领域动态", "news"),
]

FOOT_TITLE = "驶向未来 · 自动驾驶百科"
FOOT_DESC = "聚焦自动驾驶的技术原理、工程实践与产业落地，兼顾科普与系统教程。仅供学习交流。"

RE_SEC_HEAD = re.compile(
    r'<section class="sec scroll-target" id="([^"]+)">\s*<div class="sec-head">'
    r'<span class="no">([^<]*)</span><h2>(.*?)</h2>', re.S)
RE_SECTION_ID = re.compile(r'<section class="sec scroll-target" id="([^"]+)"')


def prefix_for(rel_out):
    """输出路径 → 资源前缀（如 pages/tech/x.html → ../../）。"""
    depth = rel_out.replace("\\", "/").count("/")
    return "../" * depth


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_head(meta, rel_out):
    p = prefix_for(rel_out)
    out = ['<!DOCTYPE html>', '<html lang="zh-CN">', '<head>',
           '<meta charset="UTF-8">',
           '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
           '<title>%s</title>' % esc(meta.get("title", "")),
           '<meta name="description" content="%s">' % esc(meta.get("description", "")),
           '<link rel="stylesheet" href="%sassets/style.css">' % p,
           '  <link rel="icon" href="%sfavicon.svg" type="image/svg+xml">' % p,
           '</head>']
    return "\n".join(out)


def build_header(meta, rel_out):
    p = prefix_for(rel_out)
    active = meta.get("nav_active", "")
    rows = ['<header class="topbar">', '  <div class="wrap">',
            '    <a class="brand" href="%sindex.html"><span class="brand-logo">🚗</span>'
            '<span>%s</span></a>' % (p, FOOT_TITLE),
            '    <button class="nav-toggle" aria-label="展开菜单" aria-expanded="false">☰</button>',
            '    <nav class="main-nav">']
    for href, text, key in NAV:
        cls = ' class="active"' if key == active else ""
        rows.append('      <a href="%s"%s>%s</a>' % (href.format(p=p), cls, text))
    rows += ['    </nav>', '  </div>', '</header>']
    return "\n".join(rows)


def build_hero(meta, rel_out):
    p = prefix_for(rel_out)
    crumb = ['    <nav class="crumb">']
    trail = meta.get("crumb") or []
    if isinstance(trail, str):
        trail = [trail]
    norm = []
    for c in trail:
        if isinstance(c, str):
            text, _sep, href = c.partition("|")
            norm.append({"text": text.strip(), "href": href.strip()})
        elif isinstance(c, dict):
            norm.append(c)
    for i, c in enumerate(norm):
        if i:
            crumb.append('<span class="sep">/</span>')
        if c.get("href"):
            crumb.append('<a href="%s">%s</a>' % (c["href"], c["text"]))
        else:
            crumb.append('<span>%s</span>' % c["text"])
    crumb.append("    </nav>")
    return "\n".join([
        '<section class="hero hero--inner">', '  <div class="wrap">',
        '    <span class="kicker">%s</span>' % esc(meta.get("hero_kicker", "")),
        '    <h1>%s</h1>' % esc(meta.get("hero_h1", meta.get("title", ""))),
        '    <p class="lead">%s</p>' % esc(meta.get("hero_lead", "")),
        "\n".join(crumb), '  </div>', '</section>'])


def build_footer(meta, rel_out):
    p = prefix_for(rel_out)
    rows = ['<footer class="site-footer">', '  <div class="wrap">',
            '    <div class="footer-grid">', '      <div>',
            '        <p class="footer-title">%s</p>' % FOOT_TITLE,
            '        <p style="max-width:520px">%s</p>' % FOOT_DESC,
            '      </div>', '      <nav class="footer-links">']
    for href, text, _key in NAV:
        rows.append('        <a href="%s">%s</a>' % (href.format(p=p), text))
    rows += ['      </nav>', '    </div>',
             '    <div class="footer-bar"><span>© 2026 %s</span>' % FOOT_TITLE,
             '      <span id="site-stamp" class="site-stamp"></span>', '    </div>',
             '  </div>', '</footer>', '',
             '<button class="btt" aria-label="返回顶部">↑</button>',
             '<script src="%sassets/main.js"></script>' % p,
             '<button class="search-fab" id="searchFab" type="button" aria-label="站内搜索" '
             'title="站内搜索（按 / 或 Esc）">🔍</button>',
             '<script>window.SITE_PREFIX = "%s";</script>' % p,
             '<script src="%sassets/search.js"></script>' % p,
             '  <script src="%sassets/site-update.js"></script>' % p]
    return "\n".join(rows)


def build_toc_from_data(items):
    rows = ['<aside class="toc" aria-label="本页目录">', '  <h4>本页目录</h4>']
    for it in items:
        cls = ' class="%s"' % it["cls"] if it.get("cls") else ""
        rows.append('  <a href="%s"%s>%s</a>' % (it.get("href", "#"), cls, esc(it.get("text", ""))))
    rows.append('</aside>')
    return "\n".join(rows)


def build_toc(body_html):
    """从正文提取章节 → TOC。返回 (toc_html, body_html)。"""
    items = []
    for m in RE_SEC_HEAD.finditer(body_html):
        sec_id, no, title = m.group(1), m.group(2).strip(), re.sub(r"<[^>]+>", "", m.group(3)).strip()
        items.append((sec_id, no, title))
    if not items:
        return "", body_html
    rows = ['<aside class="toc" aria-label="本页目录">', '  <h4>本页目录</h4>']
    for sec_id, no, title in items:
        label = ("%s %s" % (no, title)).strip() if no else title
        rows.append('  <a href="#%s">%s</a>' % (sec_id, esc(label)))
    rows.append('</aside>')
    return "\n".join(rows), body_html


def resolve_placeholder(content, kind, arg, mode, ctx):
    """占位符 → HTML。支持 card / example / metric / standard / source / case。"""
    if kind == "card":
        card = content.cards.get(arg)
        if not card:
            return None
        return render_card(content, card, mode or "short", ctx)
    if kind == "example":
        ex = content.example(arg)
        if not ex:
            return None
        return render_example(ex)
    if kind in ("metric", "standard", "source"):
        pool = {"metric": content.metrics, "standard": content.standards,
                "source": content.sources}[kind]
        item = pool.get(arg)
        if not item:
            return None
        return render_reference(kind, item)
    return None


def render_card(content, card, mode, ctx):
    """卡片三种渲染：full / short / one。"""
    title = card.get("title", card.id)
    link = card.get("canonical", "")
    p = ctx.get("prefix", "")
    anchor = '<a href="%s%s">%s</a>' % (p, link, title) if link else title
    if mode == "one":
        return '<p>%s —— %s <a href="%s%s">详情</a></p>' % (
            anchor, md.inline(card.get("one_liner", "")), p, link)
    body = md.render(card.body, make_resolver(content, ctx))
    if mode == "short":
        # 只取前两节
        parts = re.split(r"(?=<h3>)", body)
        keep = [x for x in parts if x.strip()][:2]
        body = "\n".join(keep)
    rel = []
    for key, label in (("prereq", "前置"), ("extends", "延伸"), ("contrasts", "对比")):
        ids = content.links(card.id, key)
        if ids:
            names = [content.cards[i].get("title", i) for i in ids if i in content.cards]
            rel.append("%s：%s" % (label, "、".join(names)))
    rel_html = ('<p class="sec-sub">%s</p>' % " ｜ ".join(rel)) if rel else ""
    return ('<div class="card reveal" id="card-%s"><h3>%s</h3>%s%s</div>'
            % (card.id, anchor, body, rel_html))


def render_example(ex):
    rows = ['<div class="panel warn">', '  <span class="pt">%s</span>' % esc(ex.get("title", "算一算"))]
    for para in ex.get("body", []):
        rows.append('  <p>%s</p>' % para)
    rows.append('</div>')
    return "\n".join(rows)


def render_reference(kind, item):
    label = {"metric": "指标", "standard": "标准", "source": "资源"}[kind]
    return '<p><b>%s</b> %s</p>' % (label, esc(item.get("title", "")))


def make_resolver(content, ctx):
    def _resolver(kind, arg, mode):
        return resolve_placeholder(content, kind, arg, mode, ctx)
    return _resolver


RE_NO = re.compile(r'<span class="no">(\d+)</span>')


def next_no(body_html, step):
    nums = [int(x) for x in RE_NO.findall(body_html)]
    return (max(nums) + step) if nums else step


def render_faq(items, no, title="常见疑问"):
    if not items:
        return ""
    rows = ['<section class="sec scroll-target" id="faq">',
            '  <div class="sec-head"><span class="no">%02d</span><h2>%s</h2></div>' % (no, esc(title)),
            '  <div class="faq">']
    for it in items:
        rows.append('    <details><summary>%s</summary><p>%s</p></details>'
                    % (it.get("q", ""), it.get("a", "")))
    rows += ['  </div>', '</section>']
    return "\n".join(rows)


def render_refs(items, no, title="延伸阅读"):
    if not items:
        return ""
    rows = ['<section class="sec scroll-target" id="refs">',
            '  <div class="sec-head"><span class="no">%02d</span><h2>%s</h2></div>' % (no, esc(title))]
    for it in items:
        head = '<h4>%s</h4>' % it["head"] if it.get("head") else ""
        rows.append('  <div class="paper">%s%s</div>' % (head, it.get("html", "")))
    rows.append('</section>')
    return "\n".join(rows)


def render_related(items, content, ctx, title="下一步怎么读"):
    if not items:
        return ""
    rows = ['<section class="related scroll-target" id="next">',
            '  <h3>%s</h3>' % esc(title), '  <div class="rel-links">']
    for it in items:
        rows.append('    <a href="%s">%s</a>' % (it["href"], it["text"]))
    rows += ['  </div>', '</section>']
    return "\n".join(rows)


def render_block(block, cls="info"):
    head = block.get("head", "")
    return '<div class="panel %s"><span class="pt">%s</span>%s</div>' % (
        cls, esc(head), block.get("html", ""))


def render_page(topic, content, page, rel_out):
    ctx = {"prefix": prefix_for(rel_out), "page": topic.id}
    meta = topic.meta
    body_src = topic.body
    body_html = md.render(body_src, make_resolver(content, ctx))

    parts = []
    if page.get("read_hint"):
        parts.append(render_block(page["read_hint"], "info"))
    if page.get("read_guide"):
        parts.append(render_block(page["read_guide"], page["read_guide"].get("kind", "tip")))
    if page.get("key_numbers"):
        parts.append(render_block(page["key_numbers"], "info"))
    if page.get("domain_map"):
        parts.append(render_block(page["domain_map"], "info"))
    parts.append(body_html)
    for b in page.get("advanced_blocks", []):
        parts.append(render_block(b, "tip"))
    for b in page.get("example_blocks", []):
        parts.append(render_block(b, "warn"))
    if page.get("debates"):
        parts.append(render_block(page["debates"], "info"))
    parts.append(render_faq(page.get("faq", []), next_no(body_html, 1),
                            page.get("faq_title") or "常见疑问"))
    parts.append(render_refs(page.get("refs", []), next_no(body_html, 2),
                             page.get("refs_title") or "延伸阅读"))
    parts.append(render_related(page.get("related", []), content, ctx,
                                page.get("related_title") or "下一步怎么读"))

    inner = "\n".join(x for x in parts if x)
    toc_html = build_toc_from_data(page["toc"]) if page.get("toc") else build_toc(inner)[0]

    return "\n".join([
        build_head(meta, rel_out), build_header(meta, rel_out), build_hero(meta, rel_out), '',
        '<main>', '  <div class="wrap layout2">',
        indent(toc_html, 4), '',
        '    <div>', indent(inner, 6), '    </div>',
        '  </div>', '</main>', '',
        build_footer(meta, rel_out), '</body>', '</html>', ''])


def indent(block, spaces):
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else line for line in block.split("\n"))


def build_utility(content, rel_out, title, kicker, h1, lead, sections, toc_items=None):
    """生成工具类页面（概念地图 / 学习路径 / 速览层）。"""
    meta = {
        "title": title,
        "description": re.sub(r"\s+", " ", lead)[:150],
        "accent": "accent-overview",
        "nav_active": "overview",
        "hero_kicker": kicker,
        "hero_h1": h1,
        "hero_lead": lead,
        "crumb": [{"text": "首页", "href": "index.html"}, {"text": h1, "href": ""}],
    }
    inner = "\n".join(x for x in sections if x)
    toc_html = build_toc_from_data(toc_items) if toc_items else ""
    return "\n".join([
        build_head(meta, rel_out), build_header(meta, rel_out),
        build_hero(meta, rel_out), '',
        '<main>', '  <div class="wrap layout2">',
        indent(toc_html, 4), '',
        '    <div>', indent(inner, 6), '    </div>',
        '  </div>', '</main>', '',
        build_footer(meta, rel_out), '</body>', '</html>', ''])


def card_relations(content, cid):
    parts = []
    for key, label in (("prereq", "前置"), ("extends", "延伸"), ("contrasts", "对比")):
        ids = content.links(cid, key)
        if ids:
            names = []
            for i in ids:
                c = content.cards.get(i)
                if c:
                    names.append('<a href="#card-%s">%s</a>' % (i, c.get("title", i)))
            if names:
                parts.append("%s %s" % (label, "、".join(names)))
    return " ｜ ".join(parts)


def concept_map_sections(content):
    """概念地图：按分组列出卡片、一句话与关系。"""
    sections, toc, n = [], [], 0
    for g in content.groups:
        cids = content.cards_in_group(g["id"])
        if not cids:
            continue
        n += 1
        toc.append({"href": "#g-%s" % g["id"], "cls": "", "text": g["title"]})
        rows = ['<section class="sec scroll-target" id="g-%s">' % g["id"],
                '  <div class="sec-head"><span class="no">%02d</span><h2>%s</h2></div>' % (n, g["title"]),
                '  <div class="grid g3">']
        for cid in cids:
            card = content.cards[cid]
            rel = card_relations(content, cid)
            rows.append('    <div class="card reveal" id="card-%s">' % cid)
            rows.append('      <h3><a href="%s">%s</a></h3>'
                        % (card.get("canonical", ""), card.get("title", cid)))
            rows.append('      <p>%s</p>' % card.get("one_liner", ""))
            if rel:
                rows.append('      <p class="sec-sub">%s</p>' % rel)
            rows.append('    </div>')
        rows += ['  </div>', '</section>']
        sections.append("\n".join(rows))
    return sections, toc


def path_sections(content):
    """学习路径：按难度分层 + 按依赖顺序排列。"""
    def order(ids):
        seen, out = set(), []

        def visit(cid):
            if cid in seen or cid not in content.cards:
                return
            seen.add(cid)
            for p in content.prereq(cid):
                visit(p)
            out.append(cid)
        for cid in ids:
            visit(cid)
        return out

    levels = [(1, "速览层", "只读一句话，建立印象"),
              (2, "理解层", "知道它是什么、为什么重要、常见误解"),
              (3, "工程层", "含实现要点与量化约束")]
    sections, toc = [], []
    for level, name, desc in levels:
        cids = [cid for cid, c in content.cards.items() if int(c.get("level", 2)) == level]
        if not cids:
            continue
        cids = order(cids)
        toc.append({"href": "#lvl-%d" % level, "cls": "", "text": "%s（%d 张）" % (name, len(cids))})
        rows = ['<section class="sec scroll-target" id="lvl-%d">' % level,
                '  <div class="sec-head"><span class="no">L%d</span><h2>%s</h2></div>' % (level, name),
                '  <p class="sec-sub">%s；按依赖顺序排列，前置在前。</p>' % desc,
                '  <ol class="steps">']
        for cid in cids:
            card = content.cards[cid]
            nums = card.get("key_numbers") or []
            num_html = ('　<span class="tag">%s</span>' % nums[0]) if nums else ""
            rows.append('    <li><h3><a href="%s">%s</a></h3><p>%s%s</p></li>'
                        % (card.get("canonical", ""), card.get("title", cid),
                           card.get("one_liner", ""), num_html))
        rows += ['  </ol>', '</section>']
        sections.append("\n".join(rows))
    return sections, toc


def quick_sections(content):
    """速览层：全部卡片的一句话 + 关键数字。"""
    rows = ['<section class="sec scroll-target" id="all">',
            '  <div class="sec-head"><span class="no">速览</span><h2>全部知识点 · 一句话版</h2></div>',
            '  <div class="tbl-wrap">', '    <table>',
            '      <thead><tr><th>知识点</th><th>一句话</th><th>关键数字</th></tr></thead>',
            '      <tbody>']
    for cid in sorted(content.cards):
        card = content.cards[cid]
        nums = card.get("key_numbers") or []
        rows.append('        <tr><td><a href="%s">%s</a></td><td>%s</td><td>%s</td></tr>'
                    % (card.get("canonical", ""), card.get("title", cid),
                       card.get("one_liner", ""), "；".join(str(x) for x in nums)))
    rows += ['      </tbody>', '    </table>', '  </div>', '</section>']
    return ["\n".join(rows)], [{"href": "#all", "cls": "", "text": "全部知识点"}]


def copy_tree(src, dst, skip_html=False):
    import shutil
    if not os.path.isdir(src):
        return
    for dp, _dn, fns in os.walk(src):
        rel = os.path.relpath(dp, src)
        target = os.path.join(dst, rel) if rel != "." else dst
        os.makedirs(target, exist_ok=True)
        for fn in fns:
            if skip_html and fn.endswith(".html"):
                continue
            shutil.copy2(os.path.join(dp, fn), os.path.join(target, fn))


def build_search_index(site_dir):
    import json
    entries = []
    for dp, _dn, fns in os.walk(site_dir):
        if os.sep + "assets" in dp:
            continue
        for fn in sorted(fns):
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dp, fn)
            raw = ""
            with io.open(path, "r", encoding="utf-8") as fh:
                raw = fh.read()
            rel = os.path.relpath(path, site_dir).replace("\\", "/")
            m = re.search(r"<title>(.*?)</title>", raw, re.S)
            title = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else rel
            body = re.search(r"<main>(.*?)</main>", raw, re.S)
            text = re.sub(r"<[^>]+>", " ", body.group(1)) if body else ""
            text = re.sub(r"\s+", " ", text).strip()[:2800]
            if text:
                entries.append({"u": rel, "t": title, "c": text})
    payload = json.dumps(entries, ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    out = os.path.join(site_dir, "assets", "search-data.js")
    with io.open(out, "w", encoding="utf-8", newline="") as fh:
        fh.write("/**\n * 站内离线搜索索引（由 tools/build.py 自动生成）\n */\n\n"
                 "window.SEARCH_DATA = " + payload + ";\n")
    return len(entries)


def similarity(old_path, new_path):
    import difflib
    if not (os.path.exists(old_path) and os.path.exists(new_path)):
        return None
    a = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", io.open(old_path, encoding="utf-8").read()))
    b = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", io.open(new_path, encoding="utf-8").read()))
    return difflib.SequenceMatcher(None, a, b).ratio()


def build(content, site_dir, report=False):
    if not os.path.isdir(site_dir):
        os.makedirs(site_dir)
    copy_tree(os.path.join(ROOT, "assets"), os.path.join(site_dir, "assets"))
    for name in ("favicon.svg",):
        src = os.path.join(ROOT, name)
        if os.path.exists(src):
            import shutil
            shutil.copy2(src, os.path.join(site_dir, name))

    built, ratios = 0, []
    data_dir = os.path.join(CONTENT, "data", "pages")
    for tid, topic in content.topics.items():
        meta = topic.meta
        rel_out = meta.get("id")  # 例如 pages/tech/perception.html
        out_path = os.path.join(site_dir, rel_out.replace("/", os.sep))
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        page = {}
        pj = os.path.join(data_dir, meta.get("slug", "") + ".json")
        if os.path.exists(pj):
            import json
            page = json.loads(io.open(pj, encoding="utf-8").read())
        html = render_page(topic, content, page, rel_out)
        with io.open(out_path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(html)
        built += 1
        if report:
            r = similarity(os.path.join(ROOT, rel_out.replace("/", os.sep)), out_path)
            if r is not None:
                ratios.append((rel_out, r))

    # 工具页：概念地图 / 学习路径 / 速览层
    util = [
        ("concept-map.html", "概念地图 · 驶向未来百科", "入门 · 工具", "概念地图",
         "按分组浏览全部知识点，并看清它们之间的前置与延伸关系。点标题进正本页，点关系跳到相关卡片。",
         concept_map_sections),
        ("paths.html", "学习路径 · 驶向未来百科", "入门 · 工具", "学习路径",
         "按难度分层（速览 / 理解 / 工程）排列全部知识点，并自动按依赖顺序排好——前置永远排在被依赖项之前。",
         path_sections),
        ("quick.html", "速览 · 驶向未来百科", "入门 · 工具", "五分钟速览",
         "全部知识点的一句话版本，附关键数字。想快速了解全貌时，先读这一页。",
         quick_sections),
    ]
    for rel, title, kicker, h1, lead, fn in util:
        sections, toc_items = fn(content)
        html = build_utility(content, rel, title, kicker, h1, lead, sections, toc_items)
        with io.open(os.path.join(site_dir, rel), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(html)

    # 特殊布局页：index.html 与 news.html 沿用旧文件
    for name in ("index.html", os.path.join("pages", "news.html")):
        src = os.path.join(ROOT, name)
        dst = os.path.join(site_dir, name)
        if os.path.exists(src):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            import shutil
            shutil.copy2(src, dst)

    n_index = build_search_index(site_dir)
    print("built %d topic pages + index/news + search index (%d entries) → %s"
          % (built, n_index, os.path.relpath(site_dir, ROOT)))
    if report and ratios:
        ratios.sort(key=lambda x: x[1])
        print("--- 与旧版文本相似度（最低 15 条）---")
        for rel, r in ratios[:15]:
            print("  %.3f  %s" % (r, rel))
        avg = sum(r for _rel, r in ratios) / len(ratios)
        print("  平均相似度 %.3f（%d 页）" % (avg, len(ratios)))
    return built


def main():
    ap = argparse.ArgumentParser(description="站点构建器")
    ap.add_argument("--check", action="store_true", help="只做结构校验")
    ap.add_argument("--list", action="store_true", help="列出将生成的页面")
    ap.add_argument("--report", action="store_true", help="输出与旧版文本相似度")
    ap.add_argument("--site", default=SITE)
    args = ap.parse_args()

    content = Content()
    errors, warnings = content.validate()
    for w in warnings:
        print("[warn] %s" % w)
    for e in errors:
        print("[error] %s" % e)
    print("cards=%d topics=%d tutorial=%d | errors=%d warnings=%d"
          % (len(content.cards), len(content.topics), len(content.tutorial),
             len(errors), len(warnings)))
    if errors and not args.report:
        return 1
    if args.check or args.list:
        if args.list:
            for tid in sorted(content.topics):
                print("  %s" % tid)
        return 0
    build(content, args.site, report=args.report)
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())



