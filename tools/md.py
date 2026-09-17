#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Markdown 子集渲染器（纯标准库，无第三方依赖）
============================================================
本站内容源只使用一组克制的语法，避免引入完整 Markdown 解析器：

  标题      ## / ### / ####
  段落      空行分隔
  无序列表  - 或 *（连续行合并为一个 <ul>）
  有序列表  1. 2. …（连续行合并为一个 <ol>）
  引用      > （渲染为 <div class="panel info">）
  分隔线    ---
  表格      | a | b |  上一行或下一行为 |---|---|
  代码块    ```lang … ```
  行内      **粗体**  *斜体*  `代码`  [文本](链接)
  HTML 块   以 < 开头的行原样透传（本站大量使用 <div class="panel"> 等）
  占位符    {{kind:arg}} 或 {{kind:arg|mode}}，交给 resolver 处理

resolver(kind, arg, mode) -> str，返回 HTML 片段；返回 None 时保留原文。
"""
import re

PLACEHOLDER = re.compile(r"\{\{(?P<kind>[a-z_]+):(?P<arg>[^}|]+?)(?:\|(?P<mode>[a-z_]+))?\}\}")
_UL = re.compile(r"^\s*[-*]\s+(.*)$")
_OL = re.compile(r"^\s*\d+\.\s+(.*)$")
_HEAD = re.compile(r"^(#{2,4})\s+(.*)$")
_TABLE_ROW = re.compile(r"^\s*\|(.+)\|\s*$")
_SEP_ROW = re.compile(r"^\s*\|[\s:|-]+\|\s*$")


def inline(text, resolver=None):
    """渲染行内标记与占位符。"""
    if resolver is not None:
        def _sub(m):
            html = resolver(m.group("kind"), m.group("arg").strip(), m.group("mode") or "")
            return html if html is not None else m.group(0)
        text = PLACEHOLDER.sub(_sub, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\[([^\]]+?)\]\(([^)\s]+?)\)", r'<a href="\2">\1</a>', text)
    return text


def _table(rows, resolver):
    if not rows:
        return ""
    head = [c.strip() for c in rows[0]]
    body = rows[1:]
    out = ["<div class=\"tbl-wrap\"><table>", "<thead><tr>"]
    for c in head:
        out.append("<th>%s</th>" % inline(c, resolver))
    out.append("</tr></thead><tbody>")
    for r in body:
        out.append("<tr>")
        for cell in r:
            out.append("<td>%s</td>" % inline(cell.strip(), resolver))
        out.append("</tr>")
    out.append("</tbody></table></div>")
    return "\n".join(out)


def render(text, resolver=None):
    """把内容源文本渲染为 HTML 片段（不含外层容器）。"""
    lines = (text or "").replace("\r\n", "\n").split("\n")
    out = []
    i, n = 0, len(lines)
    para = []

    def flush_para():
        if para:
            out.append("<p>%s</p>" % inline(" ".join(para).strip(), resolver))
            para.clear()

    while i < n:
        raw = lines[i]
        s = raw.strip()

        # 空行
        if not s:
            flush_para()
            i += 1
            continue

        # 代码块
        if s.startswith("```"):
            flush_para()
            lang = s[3:].strip()
            i += 1
            buf = []
            while i < n and not lines[i].strip().startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1
            cls = "codeblock"
            out.append('<div class="%s"%s>%s</div>' % (
                cls, (' data-lang="%s"' % lang) if lang else "", "\n".join(buf)))
            continue

        # HTML 块：原样透传（含其后续的缩进行）
        if raw.lstrip().startswith("<"):
            flush_para()
            out.append(raw.rstrip())
            i += 1
            continue

        # 标题
        m = _HEAD.match(s)
        if m:
            flush_para()
            level = len(m.group(1))
            out.append("<h%d>%s</h%d>" % (level, inline(m.group(2).strip(), resolver), level))
            i += 1
            continue

        # 分隔线
        if s in ("---", "***", "___"):
            flush_para()
            out.append("<hr>")
            i += 1
            continue

        # 表格
        if _TABLE_ROW.match(s) and i + 1 < n and _SEP_ROW.match(lines[i + 1].strip()):
            flush_para()
            rows = []
            while i < n and _TABLE_ROW.match(lines[i].strip()):
                if not _SEP_ROW.match(lines[i].strip()):
                    cells = lines[i].strip().strip("|").split("|")
                    rows.append(cells)
                i += 1
            out.append(_table(rows, resolver))
            continue

        # 引用
        if s.startswith("> "):
            flush_para()
            buf = []
            while i < n and lines[i].strip().startswith("> "):
                buf.append(lines[i].strip()[2:])
                i += 1
            out.append('<div class="panel info"><span class="pt">%s</span><p>%s</p></div>' % (
                inline(buf[0], resolver),
                inline(" ".join(buf[1:]).strip(), resolver) if len(buf) > 1 else ""))
            continue

        # 无序列表
        if _UL.match(s):
            flush_para()
            out.append("<ul>")
            while i < n and _UL.match(lines[i].strip()):
                out.append("<li>%s</li>" % inline(_UL.match(lines[i].strip()).group(1), resolver))
                i += 1
            out.append("</ul>")
            continue

        # 有序列表
        if _OL.match(s):
            flush_para()
            out.append('<ol class="steps">')
            while i < n and _OL.match(lines[i].strip()):
                item = _OL.match(lines[i].strip()).group(1)
                # 支持 "标题：正文" 形式 → <h3> 分节
                if "：" in item and len(item.split("：")[0]) <= 18:
                    head, rest = item.split("：", 1)
                    out.append("<li><h3>%s</h3><p>%s</p></li>" % (
                        inline(head, resolver), inline(rest.strip(), resolver)))
                else:
                    out.append("<li>%s</li>" % inline(item, resolver))
                i += 1
            out.append("</ol>")
            continue

        # 独占一行的占位符 → 块级输出（避免被 <p> 包裹）
        if resolver is not None:
            pm = PLACEHOLDER.fullmatch(s)
            if pm:
                html = resolver(pm.group("kind"), pm.group("arg").strip(),
                                pm.group("mode") or "")
                if html is not None:
                    flush_para()
                    out.append(html)
                    i += 1
                    continue

        # 普通段落
        para.append(s)
        i += 1

    flush_para()
    return "\n".join(out)


def plain_text(text, resolver=None):
    """提取纯文本（用于搜索索引与长度统计）。"""
    html = render(text, resolver)
    html = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", html).strip()
