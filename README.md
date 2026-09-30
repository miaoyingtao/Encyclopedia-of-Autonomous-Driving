# 驶向未来 · 自动驾驶百科（静态站点）

面向大众的自动驾驶中文科普/教程静态站：分层科普页 + 系统讲义 + LLM/世界模型前沿内容 + “领域动态”自动抓取模块。

## 本地运行

```powershell
python tools\serve.py
```

然后访问 <http://127.0.0.1:8765/pages/news.html>。“🔄 刷新动态”按钮会调用本地服务运行 `tools/news_fetcher.py`。
仅浏览也可以直接双击 `index.html`（`file://`），但刷新按钮会禁用。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `content/` | **权威内容源**：`cards/` 知识卡 40 张、`topics/` 主题页 40 个、`data/` 结构化数据（概念关系 / FAQ / 算例） |
| `index.html` / `pages/` | 旧站快照（40 个 HTML，全部使用相对路径，可直接放入子目录部署） |
| `site/` | 构建产物（`.gitignore` 忽略，由 CI 重建）：**44 个 HTML** = 40 个内容页 + 3 个工具页 + 首页 |
| `assets/` | 样式、脚本、站内搜索索引、领域动态数据 `news-data.js`、ADSim 仿真实验台（`adsim/`） |
| `favicon.svg` | 站点图标 |
| `tools/` | Python 工具：`build.py` 构建内容源、`news_fetcher.py` 抓取、`serve.py` 本地服务、`check_links.py` 质检、`import_html.py` 导入 |
| `.github/workflows/` | GitHub Pages 部署与自动抓取（见下） |

## GitHub Pages + Actions 部署（成本 ¥0）

站点由两个工作流驱动：

1. `.github/workflows/pages.yml` —— 每次 push 到 `main` 自动发布；
2. `.github/workflows/refresh.yml` —— 每天北京时间 09:00 / 21:00 自动抓取新闻并提交 `assets/news-data.js`，
   并显式派发 `pages.yml` 完成发布（`GITHUB_TOKEN` 的提交不会触发其它工作流）；`pages.yml` 另设每天
   北京时间 09:45 / 21:45 的兜底重建。也可在 Actions 页手动 `Run workflow`。

### 第一次部署步骤

```powershell
# 1) 在 GitHub 新建一个仓库（公开仓库即可用免费的 GitHub Pages；私有仓库需要付费计划）
# 2) 回到本项目目录
git init
git add -A
git commit -m "init: autonomous driving wiki site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main

# 3) 打开仓库 Settings → Pages：
#    Build and deployment → Source 选 “GitHub Actions”，保存。
```

首次 push 后，Actions 的 `pages.yml` 会运行并把站点发布到：

```
https://<你的用户名>.github.io/<仓库名>/
```

之后无需任何操作：领域动态每天定时自动抓取、覆盖旧条目并重新发布；正文内容有改动时直接
`git push` 即可。

### 部署版行为差异

- 线上是纯静态托管，不能执行 Python，因此新闻页的“刷新动态”按钮会自动禁用，
  并提示“由 GitHub Actions 定时自动更新”。
- 本地 `python tools\serve.py` 模式下按钮仍可手动触发抓取。

### 日常维护

```powershell
python tools\build.py --check             # 内容结构校验（卡片引用、canonical、前置关系无环）
python tools\build.py                     # 由 content/ 生成 site/
python tools\check_links.py --root site   # 产物质检：应输出“错误 0 个，警告 0 个”
python tools\check_links.py --stamp       # 旧站快照质检 + 更新页脚维护日期
```

> 中国大陆访问 GitHub Pages 可能不稳定；若面向国内读者，可把本项目目录原样部署到国内轻量
> 服务器（Nginx/Caddy + cron 抓取），或使用 Cloudflare Pages 等免费 CDN。

## 工具文档

抓取规则、去重/精选配置、质检与定时任务详见 [`tools/README.md`](tools/README.md)。
