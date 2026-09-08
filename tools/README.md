# 领域动态 · 自动抓取与一键刷新

本站是纯静态站点，“领域动态”数据保存在 `assets/news-data.js`。本目录提供一整套工具，让它可以：

- **一键刷新**：在 `pages/news.html` 页面点“🔄 刷新动态”，自动联网抓取并更新列表；
- **命令行更新**：手动运行 `python tools\news_fetcher.py`；
- **定时更新**：用 Windows 任务计划程序每天自动执行。

> 所有脚本均为纯 Python 标准库实现，不需要 `pip install` 任何依赖。

## 工具文件一览

| 文件 | 作用 |
| --- | --- |
| `news_fetcher.py` | 抓取器：联网拉取新闻 → 关键词过滤 → 去重 → 自动分类 → 重写 `assets/news-data.js` |
| `news_sources.json` | 资讯源与分类规则配置（源地址、检索词、过滤词、`maxTotal`、去重阈值等） |
| `serve.py` | 本地托管 + 一键刷新服务：托管全站页面，并提供 `/api/refresh`、`/api/status` 接口 |
| `check_links.py` | 全站质检：内部链接/锚点/资源/组件/编码检查；`--stamp` 写维护日期并自动补全页脚标记与 favicon |
| `build_search_index.py` | 站内离线搜索索引生成器：内容变更后运行一次，🔍 即可搜到最新文本 |
| `update_news.ps1` / `update_news.bat` | 定时/一键更新入口（调用 `news_fetcher.py`） |
| `README.md` | 本文档 |

> 站点渲染逻辑无需改动：页面每次打开都会读取 `assets/news-data.js`。
> 抓取器只改数据文件，不会改动任何 HTML。

## 两种使用方式

### 方式一：网页按钮一键刷新（推荐）

浏览器出于安全限制，不能直接执行本机 Python。因此“刷新动态”按钮需要借助随附的本地服务 `serve.py`：

```powershell
python tools\serve.py
```

看到启动提示后，在浏览器打开：

```
http://127.0.0.1:8765/pages/news.html
```

点列表右上角的“🔄 刷新动态”→ 服务端自动运行 `news_fetcher.py`（约 10–60 秒）→ 页面自动重载为最新 30 条。

- 换端口：`python tools\serve.py --port 9000`，并访问对应端口地址。
- 默认只监听 `127.0.0.1`（仅本机），不要改成 `0.0.0.0` 暴露到局域网/公网。
- 直接双击 HTML（`file://`）仍可浏览，但按钮会被禁用并提示先启动服务。

### 方式二：命令行直接更新

```powershell
cd C:\project\codex_test
python tools\news_fetcher.py
```

执行后重新打开 `pages/news.html` 或首页即可看到最新动态。

## GitHub Pages 自动部署（免费）

仓库已内置两个工作流：

- `.github/workflows/pages.yml` —— push 到 `main` 即发布静态站（先重建搜索索引并跑 `check_links.py`）。
- `.github/workflows/refresh.yml` —— 每天北京时间 09:00 / 21:00 运行
  `python tools/news_fetcher.py`，提交变化后的 `assets/news-data.js`，从而触发重新发布；抓取失败时不会覆盖旧数据。

部署到 GitHub Pages 的完整步骤见仓库根目录 `README.md`。部署版为纯静态，无 Python 服务，新闻页
“刷新动态”按钮会自动变为禁用并提示改为自动更新。

## 全站质检与页脚维护日期

内容增删改之后建议按下面顺序维护一次：

```powershell
python tools\build_search_index.py   # ① 重建站内搜索索引（会显示“indexed pages: 34”）
python tools\check_links.py          # ② 全站质检：应输出“错误 0 个，警告 0 个”
python tools\check_links.py --stamp  # ③ 写入今日日期到 assets/site-update.js（页脚显示“内容维护于 …”）
```

- `check_links.py` 每次检查 34 个页面：内部链接与锚点、静态资源、主导航/页脚完整性、重复 id、常见标签配对、BOM/CRLF、搜索索引是否过期。
- `--stamp` 是幂等的：自动生成 `assets/site-update.js`，并给每个页面补齐页脚 `<span id="site-stamp">`、`site-update.js` 引用与 `<link rel="icon">`（站点 favicon 为根目录 `favicon.svg`）。
- 深色模式与移动端样式集中在 `assets/style.css` 末尾的“主题增强”段，改动页面后无需另建样式文件。
- 其他参数：`--quiet` 只输出错误、`--print-index` 打印搜索索引条数。

## 这个 URL 是什么原理

`http://127.0.0.1:8765/pages/news.html` 中的各部分是：

- `http://` —— 通过 HTTP 协议访问，页面拥有真正的“网站源”，浏览器才允许 `fetch('/api/refresh')` 这类同源请求；
- `127.0.0.1` —— 回环地址，表示访问本机自己，不经过外网；
- `8765` —— `serve.py` 监听的端口；
- `/pages/news.html` —— 路由：`serve.py` 收到请求后，把它拼到站点根目录，等价于返回 `pages/news.html` 文件内容。

整个请求链：

```
浏览器(pages/news.html)
   │  POST /api/refresh   （同源，浏览器允许）
   ▼
serve.py（本地 HTTP 服务）
   │  subprocess 启动 python
   ▼
news_fetcher.py（抓取 → 过滤 → 去重 → 保留最新 30 条）
   │  写文件
   ▼
assets/news-data.js（更新）
   ▲   location.reload() 后重新加载该脚本
   └────────── 页面渲染最新列表
```

`file://` 双击模式做不到一键刷新，因为浏览器没有“网站服务器”这一中间层，也绝不允许网页启动本机程序。

## 本地服务接口

- `GET /api/status` —— 返回数据更新时间与条数，便于调试：
  ```json
  { "ok": true, "updatedAt": "2026-09-08", "total": 30, "maxTotal": 30 }
  ```
- `POST /api/refresh` —— 同步运行 `tools/news_fetcher.py`，完成后返回：
  ```json
  { "ok": true, "total": 30, "updatedAt": "2026-09-08", "removedOldAuto": 29 }
  ```
  若抓取失败会返回 `{ "ok": false, "message": "…" }` 与脚本末尾日志。
- 静态文件一律带 `Cache-Control: no-cache`，保证刷新后浏览器拿到最新 `news-data.js`，而不是旧缓存。

## 常用参数（news_fetcher.py）

```powershell
python tools\news_fetcher.py --print      # 只预览本次将抓到的条目，不写文件
python tools\news_fetcher.py --days 30    # 只看最近 30 天内的新闻
python tools\news_fetcher.py --limit 20   # 最终只保留最新 20 条（默认 30）
python tools\news_fetcher.py --config 路径\news_sources.json
python tools\news_fetcher.py --output 路径\news-data.js
python tools\news_fetcher.py --selftest     # 离线自检去重/精选逻辑，不联网不写文件
python tools\news_fetcher.py --allow-empty  # 危险：抓取为空时也强制写入空列表（一般不要用）
```

## 数据规则（滚动最新 N 条）

- **滚动列表**：每次运行把本次抓取结果**整段替换**旧的自动条目，再按 `date` 倒序只保留最新
  `network.maxTotal` 条（默认 **30**），更旧的全部直接删除，列表不会越积越长。
- **去重**：链接精确去重；标题（品牌/中英别名归一后）完全相同不限日期只保留一条；同一
  `dedupe.fuzzyDays` 天内，标题相似度 ≥ 相似度阈值（默认 `0.66`）或“事件指纹”相同
  （品牌 + 产品词 + 数字 + 动作词，见 `tools/news_fetcher.py` 的 `event_tokens`）视为同一事件。
  同一事件有多个报道时优先保留日期更新的那一条；手工条目永远排最前。
- **手工条目**：数据文件中不带 `_gen` 字段的对象视为手工条目。它们参与最新排序；若排在最新
  `maxTotal` 条之外，也会被移出显示。想多留可调大 `maxTotal`。给对象加 `"featured": true`
  会显示“★ 精选”角标，并可在动态页用“★ 只看精选”筛选。
- **精选标记**：自动抓取时标题命中 `featured.titleKeywords` 会被打上 `featured` 标记；
  `featured.maxFeatured`（默认 8）控制最多保留几条，超出部分自动取消标记。
- **空结果保护**：如果某次抓取联网全失败、一个条目都没抓到，脚本会**拒绝覆盖**现有数据并报错，
  避免把列表清空；确认要清空时才用 `--allow-empty`。
- **安全保护**：若 `assets/news-data.js` 无法解析，脚本会中止且不写入，避免覆盖现有内容。

## 配置资讯源（news_sources.json）

- `network.maxTotal` —— 列表条数上限（默认 30）。
- `network.dedupeTitleSimilarity` —— 同一天相似标题去重阈值（0–1）。
- `network.fetchDays` —— 只收录最近 N 天新闻（默认 45）。
- 源类型 `kind`：
  - `"bing"` —— 按检索词自动生成必应新闻 RSS，`queries` 可写多个词；
  - `"google"` —— 谷歌资讯检索（国内网络通常不可用，可在外网环境启用）；
  - `"rss"` / `"atom"` —— 直接订阅固定地址，例如 Waymo 官方博客
    `https://blog.waymo.com/feeds/posts/default`。
- 每个源可设置：`must`（命中任一关键词才收录）、`deny`（命中即排除）、`categoryHint`
  （无法自动归类时使用的默认分类）。
- 自动分类关键词在 `classify.cats`（strong 权重 3，weak 权重 1），五类取值：
  政策与准入 / 技术与研究 / 量产车型 / 出行运营 / 行业动态（兜底）。

## 定时自动更新（Windows 任务计划程序）

### 方式 A：图形界面（推荐）

1. `Win+R` 输入 `taskschd.msc` 打开任务计划程序；
2. 创建基本任务，名称如 `AutonomousDriveNews`，触发器选「每天」并设时间（如 09:00）；
3. 操作选「启动程序」：
   - 程序：`powershell.exe`
   - 参数：`-NoProfile -ExecutionPolicy Bypass -File "C:\project\codex_test\tools\update_news.ps1"`
   - 起始于：`C:\project\codex_test`
4. 勾选「只在用户登录时运行」；电脑需联网。

### 方式 B：命令行

```powershell
schtasks /Create /F /TN "AutonomousDriveNews" /SC DAILY /ST 09:00 /IT `
  /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"C:\project\codex_test\tools\update_news.ps1\""
```

查看与手动触发：

```powershell
schtasks /Query /TN "AutonomousDriveNews" /V /FO LIST
schtasks /Run /TN "AutonomousDriveNews"
```

## 常见问题

- **按钮提示“请先运行 python tools/serve.py”**：当前是用 `file://` 双击打开的，
  请先 `python tools\serve.py`，再访问 `http://127.0.0.1:8765/pages/news.html`。
- **按钮提示“无法连接本地服务”**：服务未启动，或端口不一致（页面端口 ≠ 服务端口）。
- **刷新失败 / 抓取全失败**：多为网络不通或被限流。可稍后重试，或调大 `retries / timeoutSeconds`；
  失败时原数据不会被破坏。
- **刷新成功但列表没变化**：说明本次抓取结果与上一版差异很小或仍是最新 30 条，
  可查看 `assets/news-data.js` 里的 `NEWS_META`（更新时间、删除/替换条数）。
- **端口被占用**：换端口 `python tools\serve.py --port 9000`。
- **列表太长/太短**：调整 `network.maxTotal`；想看到更早新闻可调大 `fetchDays`。
- **仍有重复**：可在 `tools/news_sources.json` 的 `dedupe` 段调大 `simThreshold`、调大
  `fuzzyDays`（允许跨几天判重）或补充 `aliases` 别名归一（如中英文品牌名）；不同媒体的同一事件
  报道措辞差异极大时，文本去重无法保证 100% 识别。
- **某源总是分错类**：给该源设置 `categoryHint`；噪音关键词加入 `deny`。
- **需要英文官方源**：默认配置已附 Waymo 官方博客等示例，改为 `"enabled": true` 即可。