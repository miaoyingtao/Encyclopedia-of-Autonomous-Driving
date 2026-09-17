#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
站点一致性检查器
================================================================
检查全站 HTML：内部链接与锚点、脚本/样式引用、导航完整性、重复 id、
标签配对、换行/编码规范，并给出维护性建议（如索引过期）。

用法：
  python tools\\check_links.py           # 全部检查，有问题时退出码 1
  python tools\\check_links.py --quiet   # 只输出错误
  python tools\\check_links.py --stamp   # 检查后把今天的日期写入 assets/site-update.js
  python tools\\check_links.py --print-index   # 打印索引摘要
"""
import argparse
import datetime as dt
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
UPDATE_FILE = os.path.join(ASSETS, "site-update.js")
SEARCH_INDEX = os.path.join(ASSETS, "search-data.js")


def set_root(path):
    """切换被检查的根目录（默认仓库根；构建产物在 site/）。"""
    global ROOT, ASSETS, UPDATE_FILE, SEARCH_INDEX
    ROOT = os.path.abspath(path)
    ASSETS = os.path.join(ROOT, "assets")
    UPDATE_FILE = os.path.join(ASSETS, "site-update.js")
    SEARCH_INDEX = os.path.join(ASSETS, "search-data.js")

NAV_PAT = re.compile(r'<nav\s+class=["\'](main-nav|footer-links)["\']>')
TAG_RE = re.compile(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)((?:\"[^\"]*\"|'[^']*'|[^>\"'])*)>")
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
SKIP_SELFCLOSE = True


def log(msg):
    sys.stderr.write(msg.rstrip() + "\n")


def is_external(url):
    return bool(re.match(r"^(https?:|mailto:|tel:|javascript:|data:)", url))


def html_files():
    out = []
    for dp, _, fns in os.walk(ROOT):
        if ".git" in dp or "tools" in dp:
            continue
        for fn in fns:
            if fn.endswith(".html"):
                out.append(os.path.join(dp, fn))
    return sorted(out)


def split_href(href):
    if "#" in href:
        path, frag = href.split("#", 1)
        return path, frag
    return href, ""


def check_page(path, issues, warns):
    rel = os.path.relpath(path, ROOT).replace("\\", "/")
    with io.open(path, encoding="utf-8-sig") as fh:
        s = fh.read()
    if s.startswith("\ufeff"):
        issues.append("%s: 文件带 BOM" % rel)
    if "\r\n" in s:
        issues.append("%s: 使用 CRLF 换行" % rel)

    # 1) 内部链接与锚点
    seen_ids = set(re.findall(r'id=["\']([^"\']+)["\']', s))
    for m in re.finditer(r'href=["\']([^"\']+)["\']', s):
        href = m.group(1)
        if is_external(href):
            continue
        path_part, frag = split_href(href)
        if not path_part:
            if frag and frag not in seen_ids:
                issues.append("%s: 锚点不存在 #%s" % (rel, frag))
            continue
        base_dir = os.path.dirname(rel)
        tgt = path_part if not base_dir else os.path.normpath(os.path.join(base_dir, path_part))
        tgt = tgt.replace("\\", "/")
        full = os.path.join(ROOT, tgt)
        if not os.path.exists(full):
            issues.append("%s: 链接目标不存在 -> %s" % (rel, href))
            continue
        if frag:
            with io.open(full, encoding="utf-8-sig") as fh2:
                tgt_html = fh2.read()
            if ('id="%s"' % frag) not in tgt_html and ("id='%s'" % frag) not in tgt_html:
                issues.append("%s: 锚点 #%s 不存在于 %s" % (rel, frag, tgt))

    # 2) 静态资源引用存在
    for m in re.finditer(r'(?:src|href)=["\']((?:\.\./)*assets/[^"\']+)["\']', s):
        ref = m.group(1)
        base_dir = os.path.dirname(rel)
        tgt = ref if not base_dir else os.path.normpath(os.path.join(base_dir, ref))
        if not os.path.exists(os.path.join(ROOT, tgt)):
            issues.append("%s: 资源不存在 -> %s" % (rel, ref))

    # 3) 导航中“领域动态”应各出现一次
    blocks = []
    for m in NAV_PAT.finditer(s):
        end = s.find("</nav>", m.end())
        if end == -1:
            issues.append("%s: <nav> 未闭合" % rel)
            continue
        blocks.append(s[m.start():end])
    if len(blocks) >= 2 and sum(1 for b in blocks if "领域动态" in b) != 2:
        issues.append("%s: 主导航/页脚中“领域动态”链接数异常" % rel)

    # 4) 搜索组件
    if 'id="searchFab"' not in s:
        issues.append("%s: 缺少站内搜索按钮(id=searchFab)" % rel)
    if "SITE_PREFIX" not in s or "assets/search.js" not in s:
        issues.append("%s: 缺少搜索脚本引用" % rel)
    if 'id="site-stamp"' not in s:
        issues.append("%s: 缺少页脚维护日期占位(id=site-stamp)" % rel)
    if "assets/site-update.js" not in s:
        issues.append("%s: 缺少维护日期脚本引用(site-update.js)" % rel)
    if 'rel="icon"' not in s and "rel='icon'" not in s:
        issues.append("%s: 缺少 favicon 引用" % rel)

    # 5) 重复 id（排除同一行多个相同 id 的模板情况）
    counts = {}
    for i in re.findall(r'id=["\']([^"\']+)["\']', s):
        counts[i] = counts.get(i, 0) + 1
    for i, c in counts.items():
        if c > 1:
            issues.append("%s: 重复 id #%s (%d 次)" % (rel, i, c))

    # 6) 常见标签粗配对
    for tag in ("section", "div", "nav", "main", "header", "footer", "aside", "button"):
        o = len(re.findall(r"<%s(?:\s|>)" % tag, s))
        c = len(re.findall(r"</%s>" % tag, s))
        if o != c:
            warns.append("%s: <%s> %d vs </%s> %d" % (rel, tag, o, tag, c))

    # 7) 搜索索引新鲜度
    if os.path.exists(SEARCH_INDEX):
        idx_mtime = os.path.getmtime(SEARCH_INDEX)
        if os.path.getmtime(path) > idx_mtime + 1:
            warns.append("%s: 修改时间晚于搜索索引，建议运行 python tools\\build_search_index.py" % rel)


def page_prefix(rel):
    """按页面相对根目录的层级计算资源前缀，如 ../ 或 ../../。"""
    return "../" * rel.count("/")


def inject_stamp_markup(path, rel):
    """给单个页面补齐页脚维护日期占位与 site-update.js 引用（幂等）。"""
    with io.open(path, encoding="utf-8-sig") as fh:
        s = fh.read()
    changed = False
    if 'id="site-stamp"' not in s:
        m = re.search(r"<div\s+class=[\"']footer-bar[\"'][^>]*>.*?(</div>)", s, re.S)
        if m:
            idx = m.start(1)
            s = s[:idx] + "\n      <span id=\"site-stamp\" class=\"site-stamp\"></span>\n    " + s[idx:]
            changed = True
    if "assets/site-update.js" not in s:
        prefix = page_prefix(rel)
        tag = '<script src="%sassets/site-update.js"></script>' % prefix
        if "</body>" in s:
            s = s.replace("</body>", "  " + tag + "\n</body>", 1)
            changed = True
    if changed:
        with io.open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(s)
    return changed


def inject_favicon(path, rel):
    """给单个页面补 <link rel="icon">（幂等）。"""
    with io.open(path, encoding="utf-8-sig") as fh:
        s = fh.read()
    if 'rel="icon"' in s or "rel='icon'" in s:
        return False
    prefix = page_prefix(rel)
    tag = '<link rel="icon" href="%sfavicon.svg" type="image/svg+xml">' % prefix
    if "</head>" in s:
        s = s.replace("</head>", "  " + tag + "\n</head>", 1)
        with io.open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(s)
        return True
    return False


def stamp_update():
    """写入维护日期 JS，并给全站页面补齐页脚标记与 favicon（幂等）。"""
    today = dt.date.today().isoformat()
    body = (
        "/**\n"
        " * 本站内容维护日期：由 python tools\\check_links.py --stamp 自动写入\n"
        " * 每次全站内容有增删改后运行一次，日期会显示在各页页脚。\n"
        " */\n"
        "\n"
        "window.SITE_UPDATE = {\n"
        '  updatedAt: "%s",\n'
        '  note: "内容维护日期，由 tools/check_links.py --stamp 写入"\n'
        "};\n"
        "\n"
        "(function () {\n"
        "  var d = window.SITE_UPDATE && window.SITE_UPDATE.updatedAt;\n"
        '  var el = document.getElementById("site-stamp");\n'
        '  if (el && d && !el.getAttribute("data-filled")) {\n'
        '    var p = String(d).split("-");\n'
        '    el.textContent = "内容维护于 " + (p.length === 3 ? p.join(".") : d);\n'
        '    el.setAttribute("data-filled", "1");\n'
        "  }\n"
        "})();\n" % today
    )
    with io.open(UPDATE_FILE, "w", encoding="utf-8", newline="") as fh:
        fh.write(body)
    n_patched = 0
    n_icon = 0
    for p in html_files():
        rel = os.path.relpath(p, ROOT).replace("\\", "/")
        if inject_stamp_markup(p, rel):
            n_patched += 1
        if inject_favicon(p, rel):
            n_icon += 1
    log("维护日期 %s 已写入 %s；补齐页脚标记 %d 页、favicon %d 页。" % (
        today, os.path.relpath(UPDATE_FILE, ROOT), n_patched, n_icon))


def main():
    ap = argparse.ArgumentParser(description="站点一致性检查器")
    ap.add_argument("--quiet", action="store_true", help="只输出错误")
    ap.add_argument("--stamp", action="store_true", help="检查后写入今天的维护日期")
    ap.add_argument("--print-index", action="store_true", help="打印搜索索引统计")
    ap.add_argument("--root", default=None, help="被检查的根目录（默认仓库根；构建产物用 site）")
    args = ap.parse_args()

    if args.root:
        set_root(args.root)

    if args.stamp:
        stamp_update()

    issues = []
    warns = []
    for p in html_files():
        check_page(p, issues, warns)
    for w in warns:
        if not args.quiet:
            log("[warn] " + w)
    for i in issues:
        log("[error] " + i)

    if args.print_index and os.path.exists(SEARCH_INDEX):
        with io.open(SEARCH_INDEX, encoding="utf-8") as fh:
            txt = fh.read()
        try:
            data = json.loads(txt[txt.index("["): txt.rindex("]") + 1])
            log("搜索索引条目数：%d" % len(data))
        except Exception:
            log("搜索索引无法解析")

    log("共检查 %d 个 HTML，错误 %d 个，警告 %d 个。" % (len(html_files()), len(issues), len(warns)))
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())