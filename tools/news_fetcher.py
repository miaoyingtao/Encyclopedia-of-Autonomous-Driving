#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
领域动态自动抓取器
================================================================
从可配置的资讯源(RSS/Atom 或 必应/谷歌新闻检索)定时拉取最新新闻，
按关键词过滤、分类、去重后，自动重写 assets/news-data.js。

设计要点
----------------------------------------------------------------
- 纯 Python 标准库实现，无需 pip 安装任何依赖。
- assets/news-data.js 中手工维护的条目(不含 _gen 字段)永远保留；
  自动抓取的条目(含 _gen 字段)每次整体替换，并裁剪过期自动条目。
- 站点页面只读取 assets/news-data.js，抓取器不触碰任何 HTML。

用法
----------------------------------------------------------------
  python tools/news_fetcher.py                 # 按默认配置更新数据
  python tools/news_fetcher.py --print         # 只打印本次抓取结果，不写文件
  python tools/news_fetcher.py --days 30       # 只看近30天的新闻
  python tools/news_fetcher.py --limit 40      # 单次最多新增40条

定时自动更新(Windows 示例)
----------------------------------------------------------------
  schtasks /Create /TN "AutonomousDriveNews" /SC DAILY /ST 09:00 /TR
      "powershell -NoProfile -ExecutionPolicy Bypass -File C:\\path\\tools\\update_news.ps1"
"""
import argparse
import datetime as dt
from difflib import SequenceMatcher
import email.utils
import hashlib
import html as html_lib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zlib

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CONFIG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "news_sources.json")
DEFAULT_OUTPUT = os.path.join(ROOT, "assets", "news-data.js")

DATA_START = "window.NEWS_DATA"
META_START = "window.NEWS_META"


def log(msg):
    sys.stderr.write(msg.rstrip() + "\n")


def localname(tag):
    return tag.rsplit("}", 1)[-1]


def fetch_bytes(url, cfg_network):
    ua = cfg_network.get("userAgent", "Mozilla/5.0")
    timeout = float(cfg_network.get("timeoutSeconds", 15))
    retries = int(cfg_network.get("retries", 2))
    last = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": ua, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*"}
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read()
                ctype = resp.headers.get("Content-Encoding", "")
                if "gzip" in ctype:
                    raw = zlib.decompress(raw, 16 + zlib.MAX_WBITS)
                elif "deflate" in ctype:
                    try:
                        raw = zlib.decompress(raw)
                    except zlib.error:
                        raw = zlib.decompress(raw, -zlib.MAX_WBITS)
                return raw
        except Exception as exc:  # noqa: BLE001 - 网络层需要捕获一切异常后重试
            last = exc
            if attempt < retries:
                time.sleep(1.5 * (attempt + 1))
    log("  [warn] 抓取失败: %s (%s)" % (url, last))
    return None


def strip_html(text):
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_lib.unescape(text)
    return re.sub(r"\s+", " ", text).strip()



def title_key(title):
    """生成标题去重键：去掉短前缀(如“某某视点 | ”)、全部空白并小写。"""
    t = title or ""
    t = re.sub(r"[｜|]\s*", "", t)
    t = re.sub(r"^[^：:]{1,14}[：:]", "", t)
    return compact(t)


def compact_with_aliases(text, aliases):
    """标题压缩并做品牌别名归一（小写、去空白后替换），用于同事件去重与精选判断。"""
    c = compact(text)
    if aliases:
        for key in sorted(aliases, key=lambda k: len(compact(k)), reverse=True):
            ck = compact(key)
            cv = compact(aliases[key])
            if ck and cv and ck != cv and ck in c:
                c = c.replace(ck, cv)
    return c


ACTION_WORDS = (
    "发布", "首发", "上市", "量产", "预售", "交付", "测试", "试点", "准入", "开城",
    "上线", "运营", "商用", "融资", "合作", "签约", "收购", "升级", "更名", "推出",
    "召回", "亮相", "预热", "路测", "扩区", "扩展", "开通", "下线", "突破", "落地",
    "接入", "投用", "注册", "上牌", "发牌", "获批", "获准", "路测", "进京", "出海",
    "招募", "招标", "裁员", "重组", "订单", "加码", "投资", "涨价", "降价", "道歉",
    "整改", "事故", "召回", "警示", "约谈",
)


BRAND_TOKENS = (
    "小鹏", "特斯拉", "比亚迪", "蔚来", "理想", "华为", "问界", "鸿蒙智行", "智界",
    "小米", "百度", "萝卜快跑", "滴滴", "小马智行", "文远知行", "地平线", "禾赛",
    "速腾聚创", "英伟达", "高通", "大疆", "元戎启行", "轻舟智航", "智己", "极氪",
    "极狐", "深蓝", "阿维塔", "岚图", "领克", "吉利", "长安", "广汽", "上汽", "奇瑞",
    "长城", "赛力斯", "江淮", "北汽", "东风", "一汽", "埃安", "腾势", "路特斯", "极星",
    "Waymo", "Zoox", "Cruise", "Aurora", "Mobileye", "Momenta", "Nuro", "Rivian",
    "Lucid", "Gatik", "Kodiak", "Torc", "Plus", "Pony", "WeRide", "AutoX",
)


def event_tokens(title, aliases):
    """提取标题的“事件指纹”：品牌实体 + 拉丁产品词 + 数字 + 动作词。

    两个标题若在同一时间窗内指纹相同，基本可判定为同一事件的转述，
    用它兜底那些措辞差异较大（相似度低于阈值）的同事件报道。
    """
    c = compact_with_aliases(title, aliases)
    toks = set()
    # 1) 品牌实体（含经别名归一后出现的规范名）
    for b in BRAND_TOKENS:
        cb = compact(b)
        if cb and cb in c:
            toks.add(cb)
    # 2) 拉丁/数字产品词（首字母为字母），如 robotaxi、cybercab、vla、l3、g9l
    for w in re.findall(r"[a-z][a-z0-9]*", c):
        if len(w) >= 2:
            toks.add(w)
    # 3) 纯数字（区分融资额、里程、投放数量等），如 24、200、56
    for w in re.findall(r"\d+", c):
        if len(w) >= 2:
            toks.add(w)
    # 4) 动作/事件词
    for w in ACTION_WORDS:
        cw = compact(w)
        if cw and cw in c:
            toks.add(cw)
    return frozenset(sorted(toks))


def dedupe_entries(entries, sim_threshold, aliases=None, fuzzy_days=1):
    """同事件去重：链接精确去重 + 标题（别名归一）精确去重 + 事件指纹/相似度去重。

    - 标题别名归一后完全相同：不限日期，只保留一条；
    - 事件指纹相同（≥2 个签名词）且日期差 <= fuzzy_days 天：视为同一事件；
    - 标题相似度 >= sim_threshold 且日期差 <= fuzzy_days 天：视为同一事件；
    - 手工条目在前、featured 条目优先；靠前或精选/手工的条目被保留。
    """
    kept = []
    links = set()
    seen_keys = []  # (date, title_key, event_key, kept_index)
    for e in entries:
        lk = norm_link(e.get("link", ""))
        if lk and lk in links:
            continue
        key = compact_with_aliases(e.get("title", "") or "", aliases)
        if len(key) > 8:
            ek = event_tokens(e.get("title", "") or "", aliases)
            dup_idx = None
            d = e.get("date", "")
            # a) 标题完全相同 -> 不限日期
            for sd, sk, sek, ix in seen_keys:
                if key == sk:
                    dup_idx = ix
                    break
            # b) 事件指纹相同且日期差在窗口内
            if dup_idx is None and ek and len(ek) >= 2 and sim_threshold > 0:
                for sd, sk, sek, ix in seen_keys:
                    if not sd or not d:
                        continue
                    try:
                        diff = abs((dt.date.fromisoformat(d) - dt.date.fromisoformat(sd)).days)
                    except ValueError:
                        diff = 0 if d == sd else 999
                    if diff <= fuzzy_days and sek == ek:
                        dup_idx = ix
                        break
            # c) 相似度达标且日期差在窗口内
            if dup_idx is None and sim_threshold > 0:
                for sd, sk, sek, ix in seen_keys:
                    if not sd or not d:
                        continue
                    try:
                        diff = abs((dt.date.fromisoformat(d) - dt.date.fromisoformat(sd)).days)
                    except ValueError:
                        diff = 0 if d == sd else 999
                    if diff <= fuzzy_days and SequenceMatcher(None, key, sk).ratio() >= sim_threshold:
                        dup_idx = ix
                        break
            if dup_idx is not None:
                prev = kept[dup_idx]
                if (e.get("featured") and not prev.get("featured")) or (prev.get("_gen") and not e.get("_gen")):
                    kept[dup_idx] = e
                continue
            seen_keys.append((e.get("date", ""), key, ek, len(kept)))
        if lk:
            links.add(lk)
        kept.append(e)
    return kept


def featured_words(cfg):
    """返回配置中精选关键词的压缩列表；featured.enabled=false 时返回空。"""
    ft = cfg.get("featured", {}) or {}
    if not ft.get("enabled", True):
        return []
    return [compact(w) for w in ft.get("titleKeywords", []) if compact(w)]


def cap_featured(entries, cfg):
    """最多保留 maxFeatured 条精选（按传入顺序，通常是日期倒序）。"""
    ft = cfg.get("featured", {}) or {}
    if not ft.get("enabled", True):
        return 0, 0
    mx = int(ft.get("maxFeatured", 8))
    kept_n = 0
    removed = 0
    for e in entries:
        if e.get("featured"):
            if kept_n >= mx:
                e.pop("featured", None)
                removed += 1
            else:
                kept_n += 1
    return kept_n, removed


def run_selftest():
    """离线的去重/精选逻辑自检，不联网、不写文件。"""
    aliases = {"XPeng": "小鹏", "Tesla": "特斯拉", "文远知行": "文远知行",
               "无人驾驶出租车": "自动驾驶出租车", "自动驾驶出租车": "自动驾驶出租车",
               "无人出租车": "自动驾驶出租车", "全天候运营": "24小时运营"}
    pool = [
        {"date": "2026-09-06", "title": "小鹏汽车宣布L3级自动驾驶进入量产阶段", "link": "http://a.test/1"},
        {"date": "2026-09-06", "title": "小鹏L3级自动驾驶宣布进入量产阶段", "link": "http://b.test/2"},
        {"date": "2026-09-07", "title": "特斯拉Robotaxi在奥斯汀正式上线运营", "link": "http://c.test/3", "featured": True},
        {"date": "2026-09-08", "title": "特斯拉Robotaxi在奥斯汀正式上线运营（扩区）", "link": "http://d.test/4"},
        {"date": "2026-09-07", "title": "小鹏G7正式上市", "link": "http://e.test/5"},
        {"date": "2026-09-07", "title": "小鹏X9正式上市", "link": "http://f.test/6"},
        {"date": "2026-09-07", "title": "自动驾驶 世界模型 与 VLA 的最新进展", "link": "http://g.test/7"},
        {"date": "2026-09-08", "title": "无人驾驶出租车Robotaxi在深圳开启商业化运营", "link": "http://h.test/8"},
        {"date": "2026-09-06", "title": "特斯拉下月将实现24小时Robotaxi无人出租车运营，你准备好了吗？", "link": "http://i.test/9"},
        {"date": "2026-09-06", "title": "特斯拉Robotaxi：下月即将实现全天候运营，自动驾驶出租车迎来新时代！", "link": "http://j.test/10"},
    ]
    out = dedupe_entries(pool, 0.66, aliases=aliases, fuzzy_days=1)
    titles = [e["title"] for e in out]
    ok_exact = sum(1 for t in titles if "量产阶段" in t) == 1
    ok_fuzzy = sum(1 for t in titles if "奥斯汀正式上线运营" in t) == 1
    ok_distinct = ("小鹏G7正式上市" in titles) and ("小鹏X9正式上市" in titles)
    ok_featured = any(e.get("featured") for e in out)
    ok_event = sum(1 for x in titles if x in (
        "特斯拉下月将实现24小时Robotaxi无人出租车运营，你准备好了吗？",
        "特斯拉Robotaxi：下月即将实现全天候运营，自动驾驶出租车迎来新时代！")) == 1
    ok = ok_exact and ok_fuzzy and ok_distinct and ok_featured and ok_event and len(out) == 7
    print(json.dumps({
        "ok": bool(ok),
        "kept": len(out),
        "ok_exact": ok_exact,
        "ok_fuzzy": ok_fuzzy,
        "ok_distinct": ok_distinct,
        "ok_featured": ok_featured,
        "ok_event": ok_event,
    }, ensure_ascii=False, indent=2))
    return 0 if ok else 1


def parse_date(text):
    if not text:
        return None
    text = text.strip()
    try:
        return email.utils.parsedate_to_datetime(text).date()
    except Exception:
        pass
    m = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", text)
    if m:
        try:
            return dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return None
    m = re.search(r"(\d{4})/(\d{1,2})/(\d{1,2})", text)
    if m:
        try:
            return dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return None
    return None


def child(el, name):
    for c in el:
        if localname(c.tag) == name:
            return c
    return None


def child_text(el, name):
    c = child(el, name)
    return c.text.strip() if c is not None and c.text else None


def all_links(el):
    """优先 rel=alternate 或 text/html 的链接，其次才是其它 link。"""
    primary = []
    fallback = []
    for c in el:
        if localname(c.tag) != "link":
            continue
        href = c.get("href")
        if not href and c.text and c.text.strip():
            href = c.text.strip()
        if not href:
            continue
        rel = (c.get("rel") or "").lower()
        if rel == "alternate" or c.get("type") == "text/html":
            primary.append(href)
        else:
            fallback.append(href)
    return primary + fallback


def parse_feed(raw):
    """返回 {'type':'rss'|'atom', 'title':str, 'items':[dict]}"""
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        log("  [warn] XML 解析失败: %s" % exc)
        return None
    tag = localname(root.tag)
    feed_title = ""
    items = []
    if tag == "feed":  # Atom
        t = child(root, "title")
        feed_title = strip_html(t.text) if t is not None and t.text else ""
        for el in root:
            if localname(el.tag) != "entry":
                continue
            title = child_text(el, "title") or ""
            links = all_links(el)
            link = links[0] if links else ""
            date = parse_date(child_text(el, "published") or child_text(el, "updated"))
            summary = strip_html(child_text(el, "summary") or child_text(el, "content") or "")
            src = ""
            sc = child(el, "source")
            if sc is not None:
                st = child(sc, "title")
                if st is not None and st.text:
                    src = strip_html(st.text)
            items.append({"title": title, "link": link, "desc": summary, "date": date, "src": src})
    else:  # RSS (2.0 / 1.0 / RDF)
        ch = None
        for el in root:
            if localname(el.tag) == "channel":
                ch = el
                break
        if ch is not None:
            t = child(ch, "title")
            feed_title = strip_html(t.text) if t is not None and t.text else ""
        for el in root.iter():
            if localname(el.tag) != "item":
                continue
            title = child_text(el, "title") or ""
            link = child_text(el, "link") or ""
            if not link:
                ls = all_links(el)
                link = ls[0] if ls else ""
            date = parse_date(child_text(el, "pubDate") or child_text(el, "date"))
            summary = strip_html(child_text(el, "description") or "")
            src = child_text(el, "source") or ""
            items.append({"title": title, "link": link, "desc": summary, "date": date, "src": src})
    return {"type": tag, "title": feed_title, "items": items}


def build_url(source, query, cfg_network):
    kind = source.get("kind", "rss")
    q = urllib.parse.quote(query)
    if kind == "bing":
        return "https://www.bing.com/news/search?q=%s&format=rss&setlang=zh-hans" % q
    if kind == "google":
        return "https://news.google.com/rss/search?q=%s&hl=zh-CN&gl=CN&ceid=CN:zh-Hans" % q
    return source["url"]


def norm_link(link):
    link = (link or "").strip()
    if not link:
        return ""
    try:
        pu = urllib.parse.urlsplit(link)
        query = urllib.parse.parse_qsl(pu.query)
        keep = [(k, v) for k, v in query if not k.lower().startswith("utm_") and k not in ("fbclid", "gclid", "spm")]
        path = pu.path.rstrip("/")
        return urllib.parse.urlunsplit((pu.scheme.lower(), pu.netloc.lower(), path, urllib.parse.urlencode(keep), ""))
    except ValueError:
        return link


CN_HOST_NAMES = {
    "news.qq.com": "腾讯新闻", "qq.com": "腾讯新闻", "sohu.com": "搜狐", "msn.cn": "MSN 中国",
    "xinhuanet.com": "新华网", "news.cn": "新华网", "people.com.cn": "人民网", "cctv.com": "央视网",
    "thepaper.cn": "澎湃新闻", "163.com": "网易新闻", "sina.com.cn": "新浪网", "sina.cn": "新浪网",
    "workercn.cn": "工人日报", "zqrb.cn": "证券日报", "cnmo.com": "CNMO 科技", "ithome.com": "IT之家",
    "autohome.com.cn": "汽车之家", "gasgoo.com": "盖世汽车", "36kr.com": "36氪", "jiemian.com": "界面新闻",
    "yicai.com": "第一财经", "caixin.com": "财新", "ofweek.com": "OFweek", "stdaily.com": "科技日报",
    "miit.gov.cn": "工信部", "gov.cn": "中国政府网", "cq.gov.cn": "重庆市政府网", "bj.gov.cn": "北京市政府网",
    "mtr.com.cn": "中国汽车报", "cheshi.com": "车市网", "d1ev.com": "第一电动", "evpartner.com": "电动汽车网",
}


def guess_media(link):
    """从跳转链接还原真实媒体名称（Bing/Google 资讯链接通常带 url 参数）。"""
    target = link or ""
    try:
        pu = urllib.parse.urlsplit(target)
        if "news/search" not in target or "apiclick" in target:
            for k, v in urllib.parse.parse_qsl(pu.query):
                if k.lower() == "url" and v:
                    target = urllib.parse.unquote(v)
                    break
        pu = urllib.parse.urlsplit(target)
        host = (pu.netloc or "").lower()
    except ValueError:
        return ""
    for prefix in ("www.", "m.", "news.", "finance.", "auto.", "auto."):
        if host.startswith(prefix):
            host = host[len(prefix):]
            break
    if host in CN_HOST_NAMES:
        return CN_HOST_NAMES[host]
    parts = host.split(".")
    for i in range(1, len(parts)):
        key = ".".join(parts[i:])
        if key in CN_HOST_NAMES:
            return CN_HOST_NAMES[key]
    return host or ""


def norm_title(title):
    t = re.sub(r"[\W_]+", "", (title or "").lower())
    return t[:80]


def classify_item(title, text, hint, rules):
    cats = rules.get("cats", {})
    scores = {}
    matched_words = {}  # category -> list
    low_all = compact(text)
    low_title = compact(title)
    for cat, wordmap in cats.items():
        total = 0
        words = []
        for w in wordmap.get("strong", []):
            cw = compact(w)
            if cw and cw in low_all:
                total += 3
                words.append(w)
        for w in wordmap.get("weak", []):
            cw = compact(w)
            if cw and cw in low_all:
                total += 1
                words.append(w)
        if total:
            scores[cat] = total
            matched_words[cat] = words
    best = None
    if scores:
        best = max(scores, key=lambda c: scores[c])
    if best is None and hint:
        best = hint
    if best is None:
        best = "行业动态"
    # 只把出现在标题里的命中词作为标签，避免摘要噪音
    tags = []
    for _cat, words in matched_words.items():
        for w in words:
            cw = compact(w)
            if cw and cw in low_title and w not in tags and len(w) >= 2:
                tags.append(w)
    return best, tags[:4]


def read_existing(path):
    if not os.path.exists(path):
        return [], {}
    try:
        with open(path, "r", encoding="utf-8-sig") as fh:
            text = fh.read()
    except OSError as exc:
        log("  [warn] 读取现有数据失败: %s" % exc)
        return [], {}
    entries = extract_json_var(text, DATA_START)
    meta = extract_json_var(text, META_START)
    if not isinstance(entries, list):
        return None, {}
    if not isinstance(meta, dict):
        meta = {}
    return entries, meta


def extract_json_var(text, marker):
    """定位 JS 变量赋值并返回其 JSON 值。

    优先尝试从后往前匹配（真正赋值通常在文件末尾；注释或示例也可能提到该变量名）。
    """
    positions = []
    pos = text.find(marker)
    while pos != -1:
        positions.append(pos)
        pos = text.find(marker, pos + 1)
    for idx in reversed(positions):
        jb = text.find("[", idx)
        jc = text.find("{", idx)
        candidates = [j for j in (jb, jc) if j >= 0]
        candidates.sort()
        for j in candidates:
            val = extract_balanced(text, j)
            if val is not None:
                return val
    return None


def extract_balanced(text, start):
    """从 text[start] 开始提取配对的 JSON 值（字符串内容不参与计数）。"""
    stack = []
    in_str = False
    esc = False
    pairs = {"[": "]", "{": "}"}
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch in pairs:
            stack.append(ch)
        elif ch in ("]", "}"):
            if stack and pairs[stack[-1]] == ch:
                stack.pop()
                if not stack:
                    return json.loads(text[start : i + 1])
            else:
                return None
    return None


def compact(text):
    """去掉全部空白并小写，用于中英文/空格不敏感匹配，例如 World Model == WorldModel。"""
    return re.sub(r"\s+", "", (text or "").lower())


def text_contains(text, words):
    low = compact(text)
    for w in words or []:
        cw = compact(w)
        if cw and cw in low:
            return True
    return False


def run(argv=None):
    ap = argparse.ArgumentParser(description="自动驾驶领域动态自动抓取器")
    ap.add_argument("--config", default=DEFAULT_CONFIG, help="源配置文件路径")
    ap.add_argument("--output", default=None, help="输出文件路径（默认取配置文件 output）")
    ap.add_argument("--days", type=int, default=None, help="只看最近 N 天的新闻（默认按配置）")
    ap.add_argument("--limit", type=int, default=None, help="最终最多保留条数（默认 30，更旧自动删除）")
    ap.add_argument("--print", action="store_true", help="只打印抓取结果，不写文件")
    ap.add_argument("--quiet", action="store_true", help="只输出错误")
    ap.add_argument("--allow-empty", action="store_true", help="允许在抓取为空时仍写入空列表")
    args = ap.parse_args(argv)

    try:
        with open(args.config, "r", encoding="utf-8-sig") as fh:
            cfg = json.load(fh)
    except Exception as exc:
        log("[error] 读取配置失败 %s: %s" % (args.config, exc))
        return 1

    net = cfg.get("network", {})
    fetch_days = args.days if args.days else int(net.get("fetchDays", 45))
    max_per_query = int(net.get("maxPerQuery", 12))
    max_total = args.limit if args.limit is not None else int(net.get("maxTotal", 30))
    ded_cfg = cfg.get("dedupe", {}) or {}
    aliases = ded_cfg.get("aliases", {}) or {}
    fuzzy_days = int(ded_cfg.get("fuzzyDays", 0) or 0)
    sim_threshold = float(ded_cfg.get("simThreshold", net.get("dedupeTitleSimilarity", 0.66)))
    feat_cfg = cfg.get("featured", {}) or {}
    feat_words = featured_words(cfg)
    out_path = args.output or os.path.join(ROOT, cfg.get("output", "assets/news-data.js").replace("/", os.sep))
    rules = cfg.get("classify", {})
    deny_all = rules.get("deny", [])

    today = dt.date.today()
    oldest = today - dt.timedelta(days=fetch_days)

    # 手工条目与历史自动条目
    existing, old_meta = read_existing(out_path)
    if existing is None:
        log("[error] 现有数据文件无法解析，为避免覆盖手工内容已中止。请检查 %s" % out_path)
        return 1
    manual = [e for e in existing if "_gen" not in e]
    old_auto = [e for e in existing if "_gen" in e]
    log("现有数据：手工 %d 条 / 自动 %d 条 / 共 %d 条" % (len(manual), len(old_auto), len(existing)))

    collected = []  # 本次新抓取的合格条目
    seen_links = set()
    seen_titles = set()
    source_stats = []

    enabled_sources = [s for s in cfg.get("sources", []) if s.get("enabled", True)]
    if not enabled_sources:
        log("[error] 没有启用的资讯源，请在 %s 中设置 enabled: true" % args.config)
        return 1

    for source in enabled_sources:
        name = source.get("name", "未命名源")
        hint = source.get("categoryHint", "") or ""
        if source.get("kind", "rss") in ("bing", "google"):
            queries = source.get("queries", [])
        else:
            queries = [None]
        per_source_count = 0
        for query in queries:
            url = build_url(source, query or "", net)
            if not args.quiet:
                log("抓取源：%s | %s" % (name, query or url))
            raw = fetch_bytes(url, net)
            if not raw:
                continue
            feed = parse_feed(raw)
            if not feed:
                continue
            feed_title = feed.get("title") or name
            n = 0
            for it in feed.get("items", []):
                if per_source_count >= max_per_query:
                    break
                title = strip_html(it.get("title") or "")
                desc = it.get("desc") or ""
                link = (it.get("link") or "").strip()
                if not title or not link:
                    continue
                if it.get("date") is None or it["date"] < oldest:
                    continue
                hay = title + " " + desc
                must = source.get("must") or []
                if must and not text_contains(hay, must):
                    continue
                if text_contains(hay, source.get("deny") or []) or text_contains(hay, deny_all):
                    continue
                lk = norm_link(link)
                tk = norm_title(title)
                if lk and lk in seen_links:
                    continue
                if tk and len(tk) > 12 and tk in seen_titles:
                    continue
                seen_links.add(lk)
                if tk and len(tk) > 12:
                    seen_titles.add(tk)
                cat, tags = classify_item(title, hay, hint, rules)
                summary = (desc or title)
                if len(summary) > 150:
                    summary = summary[:150].rsplit(" ", 1)[0].rstrip("，。、；") + "……"
                digest = hashlib.sha256((lk or tk or title).encode("utf-8")).hexdigest()[:12]
                media = strip_html(it.get("src") or "")
                if not media:
                    media = guess_media(link)
                collected.append({
                    "date": it["date"].isoformat(),
                    "title": title,
                    "summary": summary,
                    "link": link,
                    "source": media or name,
                    "category": cat,
                    "tags": tags,
                    "_gen": {"id": digest, "feed": name, "query": query or ""},
                })
                if feat_words and any(w in compact(title) for w in feat_words):
                    collected[-1]["featured"] = True
                seen_links.add(digest)
                n += 1
                per_source_count += 1
            source_stats.append((name, n))
            if not args.quiet:
                log("  命中 %d 条" % n)

    
    # —— 去重：链接精确去重 + 标题精确/模糊去重；手工条目排在前面，优先保留 ——
    raw_candidates = manual + collected
    # 同事件有多个报道时，优先保留“更新的报道”（手工条目仍排最前）
    raw_candidates.sort(key=lambda e: (0 if "_gen" not in e else 1, e.get("date", "") or ""))
    before_dedupe = len(raw_candidates)
    final_candidates = dedupe_entries(raw_candidates, sim_threshold, aliases, fuzzy_days)
    removed_dup = before_dedupe - len(final_candidates)

    # —— 滚动替换：按日期倒序只保留最新 max_total 条，更旧的全部删除 ——
    final_candidates.sort(key=lambda e: (e.get("date", ""), e.get("title", "")), reverse=True)
    removed_by_cap = 0
    if len(final_candidates) > max_total:
        removed_by_cap = len(final_candidates) - max_total
        final_candidates = final_candidates[:max_total]
    removed_old_auto = len(old_auto)

    total_featured, removed_feat_cap = cap_featured(final_candidates, cfg)

    # 安全保护：本次一个都没抓到且已有数据时，不覆盖为“空列表”
    if not args.print and not args.allow_empty and not final_candidates and existing:
        log("[error] 本次抓取结果为空（联网失败或被过滤），为保护现有内容不写入空文件。请检查网络后重试，或临时加 --allow-empty 强制写入空列表。")
        return 1

    if args.print:
        out = {
            "fetchedAt": dt.datetime.now().isoformat(timespec="seconds"),
            "maxTotal": max_total,
            "removedOldAuto": removed_old_auto,
            "removedByCap": removed_by_cap,
            "count": len(final_candidates),
            "items": final_candidates,
        }
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 0

    meta = {
        "updatedAt": today.isoformat(),
        "fetchedAt": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
        "maxTotal": max_total,
        "totalManual": len(manual),
        "totalAuto": len([e for e in final_candidates if "_gen" in e]),
        "total": len(final_candidates),
        "removedOldAuto": removed_old_auto,
        "removedByCap": removed_by_cap,
        "removedDup": removed_dup,
        "totalFeatured": total_featured,
        "removedFeaturedCap": removed_feat_cap,
        "sources": [[sname, n] for sname, n in source_stats],
        "note": "每次运行只保留最新 %d 条：本次抓取覆盖旧的自动条目；手工条目若排不进最新 %d 条也会被移出。" % (max_total, max_total),
    }

    if not args.quiet:
        for sname, n in source_stats:
            log("源命中：%-40s %d" % (sname, n))
        log("旧自动条目删除 %d 条；因超过 %d 条上限移除 %d 条" % (removed_old_auto, max_total, removed_by_cap))
        log("写入 %s（手工 %d / 自动 %d，共 %d 条）" % (out_path, len(manual), len(final_candidates) - len(manual), len(final_candidates)))

    write_data_file(out_path, final_candidates, meta, old_meta)
    return 0


def write_data_file(path, entries, meta, old_meta):
    """把条目写成站点可读的 window.NEWS_DATA / window.NEWS_META。"""
    header = (
        "/**\n"
        " * 领域动态 · 数据源（可自动生成，也可手工维护）\n"
        " * --------------------------------------------------------------\n"
        " * 本文件通常由 tools/news_fetcher.py 自动重写：每次运行把本次抓取结果整段\n"
        " * 写入并替换旧自动条目，只按日期保留最新 N 条（默认 30，见 maxTotal），\n"
        " * 更旧的直接删除；链接与同一天相似标题自动去重，避免重复动态。\n"
        " * 手工新增：在数组中追加一个对象，字段含 date/title/summary/link/source/category/tags。\n"
        " * 自动更新：python tools/news_fetcher.py  （配置见 tools/news_sources.json）\n"
        " * 页面每次打开都会读取本文件渲染，改完保存刷新即生效。\n"
        " */\n"
    )
    payload_entries = json.dumps(entries, ensure_ascii=False, indent=2)
    payload_meta = json.dumps(meta, ensure_ascii=False, indent=2)
    payload_entries = payload_entries.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    payload_meta = payload_meta.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    body = (
        header
        + "\n"
        + DATA_START
        + " = "
        + payload_entries
        + ";\n\n"
        + META_START
        + " = "
        + payload_meta
        + ";\n"
    )
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(body)


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    if "--selftest" in argv:
        return run_selftest()
    return run(argv)


if __name__ == "__main__":
    sys.exit(main())