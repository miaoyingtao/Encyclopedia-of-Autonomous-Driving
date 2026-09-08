#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
站内离线搜索索引生成器
================================================================
遍历站点全部 HTML，抽取 <main> 正文文本并写入 assets/search-data.js，
供前端 assets/search.js 做无需服务器的站内搜索。

用法：python tools/build_search_index.py
内容改完后重新运行一次即可让搜索包含最新文本。
"""
import html as html_lib
import io
import json
import os
import re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "search-data.js")
MAX_BODY = 2800


class TextExtractor(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.skip_depth += 1
        if self.skip_depth == 0 and tag in ("p", "div", "section", "li", "h1", "h2", "h3", "h4", "h5", "h6", "br", "tr", "table"):
            self.out.append(" ")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript") and self.skip_depth > 0:
            self.skip_depth -= 1

    def handle_data(self, data):
        if self.skip_depth == 0:
            self.out.append(data)

    def text(self):
        s = "".join(self.out)
        s = re.sub(r"\s+", " ", s)
        return s.strip()


def clean_entities(s):
    return html_lib.unescape(s).strip()


def extract_region(s, start_tag, end_tag):
    i = s.find(start_tag)
    j = s.find(end_tag, i + 1)
    if i < 0 or j < 0:
        return None
    return s[i + len(start_tag):j]


def main():
    entries = []
    html_files = []
    for dp, _, fns in os.walk(ROOT):
        if ".git" in dp or "tools" in dp:
            continue
        for fn in fns:
            if fn.endswith(".html"):
                html_files.append(os.path.join(dp, fn))
    html_files.sort()
    for p in html_files:
        rel = os.path.relpath(p, ROOT).replace("\\", "/")
        with io.open(p, encoding="utf-8-sig") as fh:
            raw = fh.read()
        mt = re.search(r"<title>(.*?)</title>", raw, re.S | re.I)
        title = clean_entities(mt.group(1)) if mt else os.path.basename(p)
        md = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', raw, re.S | re.I)
        desc = clean_entities(md.group(1)) if md else ""
        region = extract_region(raw, "<main", "</main>")
        body = ""
        if region is not None:
            parser = TextExtractor()
            parser.feed(region)
            body = parser.text()
        content = (desc + " " + body).strip()
        if not content:
            continue
        entries.append({"u": rel, "t": title, "c": content[:MAX_BODY]})
    payload = json.dumps(entries, ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    header = (
        "/**\n"
        " * 站内离线搜索索引（由 tools/build_search_index.py 自动生成）\n"
        " * 每次内容变更后请重新运行：python tools/build_search_index.py\n"
        " */\n"
    )
    body = header + "\nwindow.SEARCH_DATA = " + payload + ";\n"
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, "w", encoding="utf-8", newline="") as fh:
        fh.write(body)
    print("indexed pages:", len(entries), "| output:", os.path.relpath(OUT, ROOT), "| bytes:", len(body.encode("utf-8")))


if __name__ == "__main__":
    main()