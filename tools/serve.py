#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本站本地托管 + 一键刷新服务
================================================================
浏览器受安全限制，无法直接执行本机 Python 脚本。因此“领域动态”页的
“刷新动态”按钮需要本服务配合：

  python tools\\serve.py
  浏览器打开 http://127.0.0.1:8765/pages/news.html
  点击“刷新动态” -> 服务端自动运行 tools/news_fetcher.py -> 页面自动重载

功能
----------------------------------------------------------------
- 以纯静态方式托管站点根目录（与直接双击 HTML 等价，只是多了 HTTP 头）。
- POST /api/refresh  运行抓取器并返回最新统计（同源，仅限本机调用）。
- GET  /api/status   返回数据更新时间等状态（调试用）。
纯标准库实现，无第三方依赖。
"""
import argparse
import json
import mimetypes
import os
import subprocess
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT_REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.dirname(os.path.abspath(__file__))
FETCHER = os.path.join(TOOLS, "news_fetcher.py")
DATA_FILE = os.path.join(ROOT_REPO, "assets", "news-data.js")
SITE = os.path.join(ROOT_REPO, "site")
INDEX = "index.html"
# 托管根目录：优先构建产物 site/，没有则退回仓库根（迁移前状态）
ROOT = SITE if os.path.isdir(SITE) else ROOT_REPO

sys.path.insert(0, TOOLS)


def read_meta():
    try:
        import news_fetcher as nf
        _entries, meta = nf.read_existing(DATA_FILE)
        if meta is None:
            meta = {}
        return meta
    except Exception:
        return {}


def run_fetcher(timeout=240):
    env = dict(os.environ)
    env["PYTHONIOENCODING"] = "utf-8"
    proc = subprocess.run(
        [sys.executable, FETCHER],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        env=env,
    )
    return proc


class SiteHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "ADNewsServer/1.0"

    def log_message(self, fmt, *args):  # 精简控制台日志
        sys.stderr.write("[serve] %s\n" % (fmt % args))

    # ---------- 工具 ----------
    def _send(self, code, body, ctype="text/plain; charset=utf-8", cache="no-cache"):
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", cache)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _json(self, code, obj):
        self._send(code, json.dumps(obj, ensure_ascii=False), "application/json; charset=utf-8")

    # ---------- 路由 ----------
    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        path = parsed.path
        if path.rstrip("/") == "/api/status":
            meta = read_meta()
            self._json(200, {"ok": True, "updatedAt": meta.get("updatedAt", ""), "total": meta.get("total", 0), "maxTotal": meta.get("maxTotal", 30)})
            return
        self._serve_static(path)

    def do_POST(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path.rstrip("/") == "/api/refresh":
            self._handle_refresh()
            return
        self._json(404, {"ok": False, "message": "接口不存在：仅支持 /api/refresh"})

    def do_HEAD(self):
        parsed = urllib.parse.urlsplit(self.path)
        self._serve_static(parsed.path, head=True)

    # ---------- 静态文件 ----------
    def _serve_static(self, url_path, head=False):
        if url_path in ("", "/"):
            rel = INDEX
        else:
            rel = url_path.lstrip("/")
        full = os.path.realpath(os.path.join(ROOT, rel.replace("/", os.sep)))
        if not full.startswith(os.path.realpath(ROOT)) or not os.path.isfile(full):
            self._send(404, "Not Found: " + url_path)
            return
        ctype, _enc = mimetypes.guess_type(full)
        if ctype is None:
            ctype = "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"):
            ctype += "; charset=utf-8"
        with open(full, "rb") as fh:
            data = fh.read()
        self._send(200, data, ctype)
        if head:
            self.close_connection = True

    # ---------- 刷新 ----------
    def _handle_refresh(self):
        try:
            proc = run_fetcher()
        except subprocess.TimeoutExpired:
            self._json(500, {"ok": False, "message": "抓取超时（>240s），请稍后再试或直接运行 python tools\\news_fetcher.py"})
            return
        stdout_tail = (proc.stdout or "").strip().splitlines()[-15:]
        stderr_tail = (proc.stderr or "").strip().splitlines()[-15:]
        if proc.returncode != 0:
            self._json(500, {
                "ok": False,
                "returncode": proc.returncode,
                "message": "抓取脚本执行失败（returncode=%d），请查看本地服务控制台或直接运行 tools\\news_fetcher.py" % proc.returncode,
                "stdout": stdout_tail,
                "stderr": stderr_tail,
            })
            return
        meta = read_meta()
        self._json(200, {
            "ok": True,
            "updatedAt": meta.get("updatedAt", ""),
            "total": meta.get("total", 0),
            "maxTotal": meta.get("maxTotal", 30),
            "removedOldAuto": meta.get("removedOldAuto", 0),
            "message": "抓取完成，已更新 %s 条动态" % meta.get("total", 0),
        })


def main():
    ap = argparse.ArgumentParser(description="本站托管 + 一键刷新服务")
    ap.add_argument("--host", default="127.0.0.1", help="监听地址（默认 127.0.0.1，仅本机可访问）")
    ap.add_argument("--port", type=int, default=8765, help="监听端口（默认 8765）")
    ap.add_argument("--root", default=None, help="托管根目录（默认 site/，不存在则用仓库根）")
    args = ap.parse_args()
    global ROOT
    if args.root:
        ROOT = os.path.abspath(args.root)
    server = ThreadingHTTPServer((args.host, args.port), SiteHandler)
    url = "http://%s:%d/pages/news.html" % (args.host, args.port)
    print("自动驾驶百科本地服务已启动：")
    print("  " + url)
    print("（点击该页“刷新动态”即可自动运行抓取脚本；Ctrl+C 停止）")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
        server.server_close()


if __name__ == "__main__":
    main()