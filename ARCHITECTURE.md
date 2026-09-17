# 架构说明（数据驱动的内容系统）

本仓库从"40 个手工 HTML"重构为**数据驱动的内容系统**：内容写在 `content/`，由 `tools/build.py`
渲染成纯静态站 `site/`（URL、样式、脚本与旧版一致，可直接部署到 GitHub Pages）。

## 数据流

```
content/cards/*.md        知识卡（1 个知识点 = 1 个文件）
content/topics/*.md       主题页（= 一个 URL 页面）
content/data/*.json       结构化数据（概念关系 / 指标 / 标准 / 资源 / 算例 / FAQ）
        │
        ├── tools/import_html.py   从旧 HTML 导入内容源（一次性迁移）
        │
        ▼
tools/md.py               Markdown 子集 + 占位符渲染
tools/content_model.py    front-matter 解析、数据加载、结构校验
tools/build.py            渲染 → site/（含搜索索引、图谱、路径）
        │
        ▼
site/**/*.html            部署产物（纯静态）
tools/check_links.py --root site     质检
tools/serve.py                        本地预览
```

## 命令

```powershell
python tools\build.py --check          # 结构校验（卡片引用、关系无环、正本存在）
python tools\build.py --list           # 列出将生成的页面
python tools\build.py                  # 生成 site/
python tools\build.py --report         # 生成并输出与旧版页面的文本相似度
python tools\check_links.py --root site  # 对产物做全站质检
python tools\import_html.py            # 从旧 HTML 重新导入内容源（迁移期使用）
```

## 知识卡模型

`content/cards/<id>.md` 的 front-matter：

| 字段 | 说明 |
| --- | --- |
| `id` | 卡片标识，全站唯一 |
| `title` | 标题（渲染时作为链接文本） |
| `level` | 1 速览 / 2 理解 / 3 工程（三层渲染的依据） |
| `canonical` | **正本页**：`pages/tech/perception.html#calib` 形式；本页应使用 `{{card:id|full}}` |
| `one_liner` | 一句话定义（用于速览层与顺带提及） |
| `prereq` / `extends` / `contrasts` | 关系（图谱与"前置/延伸"导航的数据源） |
| `key_numbers` | 关键数字（用于页面顶部的"关键数字"面板） |

正文用 Markdown 子集书写（`##` 标题、段落、列表、表格、`>` 引用），也允许直接写 HTML
组件（`<div class="panel">` 等会原样透传）。

### 占位符

| 写法 | 效果 |
| --- | --- |
| `{{card:bev}}` | 一句话 + 正本页链接 |
| `{{card:bev\|short}}` | 前两节（用于相邻主题页） |
| `{{card:bev\|full}}` | 完整卡片（含关系；用于正本页） |
| `{{example:time-offset-100ms}}` | 插入算例（`content/data/examples.json`） |
| `{{metric:ttc}}` / `{{standard:iso-26248}}` / `{{source:nuscenes}}` | 插入结构化条目 |

构建期会强制检查：占位符指向的卡片/算例必须存在；`canonical` 必须指向真实主题页；
`prereq` 关系不允许成环。**正本唯一性因此从"人工约定"变成"构建期强制"。**

## 迁移进度（2026-09-17）

| 项 | 状态 |
| --- | --- |
| Markdown / front-matter / 数据模型 | ✅ 完成（`tools/md.py`、`tools/content_model.py`） |
| HTML → 内容源 自动导入 | ✅ 完成：**40 页 / 253 个面板 / 265 条 FAQ / 385 KB 正文** |
| 构建器（模板 + 渲染 + 搜索索引 + 相似度报告） | ✅ 完成（`tools/build.py`） |
| 构建产物质检 | ✅ `check_links.py --root site`：40 页，0 错 0 警 |
| 与原站文本相似度 | ✅ 平均 **0.927**（39 页；最低 one-trip 0.739） |
| 知识卡（`content/cards/*.md`） | ⏳ 待建（清单见下） |
| 主题页改写为卡片引用 | ⏳ 待做（需先有卡片） |
| 概念图谱页 / 学习路径页 / 速览层 | ⏳ 待做（数据结构已就绪：`concepts.json` 的关系字段） |
| `serve.py` / CI 指向 `site/` | ⏳ 待做 |

## 待建卡片清单（按优先级）

> 这些知识点目前分散在多个页面（同一表述出现在 2–5 处）。建成卡片后，各页改为引用即可根治重复。

**第一优先（被引用最多）**
`time-alignment`（时间同步，现出现于 perception/fusion/sensors/camera/one-trip）
`bev`（BEV 表征）、`occupancy-network`（占用网络）、`ttc`（碰撞时间）
`odd`（运行设计条件）、`sotif`、`asil`、`mrm`（最小风险状态）
`gnss-rtk-ppp`、`mpc`、`rss`、`unit-economics`

**第二优先（域内复用）**
感知组：`camera-depth`、`lidar-tof`、`radar-fmcw`、`radar-ghost-brake`、`ultrasonic-temperature`、
`data-association`、`recall-first`、`calibration-drift`
定位组：`imu-dead-reckoning`、`icp-ndt`、`hdmap-layers`、`map-freshness`、`localization-integrity`
决策组：`planning-layers`、`prediction`、`behavior-decision`、`frenet`、`end-to-end`、`actuator-latency`
工程组：`latency-budget`、`compute-platform`、`fail-operational`、`data-loop`、`shadow-mode`

**第三优先（标准、资源与案例）**
`sae-j3016` / `gb-t-40429` / `un-r157` / `iso-34502`；`nuscenes` / `waymo-open` / `kitti` /
`autoware` / `apollo` / `carla`；10 个 `case-*`（失效案例）

## 新增一页的流程

1. 在 `content/topics/` 新建 `<slug>.md`，写 front-matter（`id` 为 URL 路径，如 `pages/foo.html`）
2. 正文用 Markdown 写叙事，重复性知识用 `{{card:…}}` 引用
3. FAQ / 延伸阅读 / 相关阅读写入 `content/data/pages/<slug>.json`
4. `python tools\build.py --check` → `python tools\build.py` → `python tools\check_links.py --root site`

## 已知限制

- `index.html` 与 `pages/news.html` 目前仍直接沿用旧文件（布局特殊），未纳入模板
- `content/topics/*.md` 的正文是导入的 HTML 透传块（保证零信息损失），尚未改写成卡片引用
- 相似度差异主要来自空白与结构细节（如面包屑换行），正文内容无丢失
- `site/` 不入库（`.gitignore`），由构建生成；如需提交产物请先移除该忽略项
