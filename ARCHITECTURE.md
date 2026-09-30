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

## 迁移进度（2026-09-30）

| 项 | 状态 |
| --- | --- |
| Markdown / front-matter / 数据模型 | ✅ |
| HTML → 内容源 自动导入 | ✅ 40 页 / 253 面板 / 265 FAQ / 385 KB |
| 构建器（模板 + 渲染 + 搜索索引 + 相似度报告） | ✅ |
| 构建产物质检 | ✅ `check_links.py --root site`：**44 页，0 错 0 警** |
| 与原站文本相似度 | ✅ 平均 **0.927** |
| 知识卡 | ✅ **40 张全部落地**（`build.py --check`：cards=40 topics=40，0 错 0 警；分组见下节） |
| 概念地图 / 学习路径 / 速览层 | ✅ `site/concept-map.html`、`site/paths.html`、`site/quick.html`（由卡片关系自动生成） |
| `serve.py` 托管 `site/` | ✅（默认 site/，`--root` 可覆盖） |
| CI 构建 + 部署 | ✅ `pages.yml`：`build.py` → `check_links --root site` → 部署 `site/`，并每日兜底重建；`refresh.yml` 抓取后显式派发部署 |
| 闭环仿真实验台（ADSim） | ✅ `site/pages/adsim.html` + `assets/adsim/`：6 个场景、81 条自检断言、3 个模块 Lab、OpenDRIVE 导入与场景编辑器 |
| 主题页改写为卡片引用 | 🟡 仅 `perception.md` / `fusion.md` 共 3 处 `{{card:…}}`；其余 38 页正文仍是导入的 HTML 透传（零信息损失），待逐段替换 |

## 知识卡现状（40 张，按 `content/data/concepts.json` 的 groups 分组）

**分级与责任**（1）：`odd`
**感知与传感器**（18）：`bev` `occupancy-network` `time-alignment` `gnss-rtk-ppp` `calibration` `camera-depth` `camera-hdr-isp` `lidar-tof` `lidar-wavelength` `lidar-compensation` `radar-fmcw` `radar-ambiguity` `radar-ghost-brake` `ultrasonic-physics` `ultrasonic-temperature` `sensor-fusion` `data-association` `recall-first`
**决策与控制**（3）：`mpc` `rss` `end-to-end`
**安全与合规**（4）：`ttc` `sotif` `asil` `mrm`
**定位与地图**（9）：`imu-dead-reckoning` `icp-ndt` `slam` `hdmap-layers` `map-freshness` `crowdsourced-update` `map-less-debate` `localization-integrity` `lane-level-accuracy`
**系统与工程**（2）：`redundancy` `data-loop`
**AI 前沿**（1）：`world-model`
**场景与商业**（2）：`unit-economics` `takeover-rate`

40 张全部已登记到 `concepts.json`（未登记会触发 `build.py --check` 的“未登记”警告），因此
概念地图、学习路径与速览层三张工具页覆盖全部知识点。继续扩充卡片时的顺序：先在
`concepts.json` 登记 `group` 与 `prereq/extends/contrasts`，再写 `content/cards/<id>.md`。

## 新增一页的流程

1. 在 `content/topics/` 新建 `<slug>.md`，front-matter 的 `id` 即 URL 路径（如 `pages/foo.html`）
2. 正文用 Markdown 写叙事，重复性知识用 `{{card:…}}` 引用
3. FAQ / 延伸阅读 / 相关阅读写入 `content/data/pages/<slug>.json`
4. `python tools\build.py --check` → `python tools\build.py` → `python tools\check_links.py --root site`

## 已知限制

- **根目录下的旧 HTML 仍然存在**，作为迁移前快照与回滚点；它们**不再是权威内容**，
  权威内容在 `content/`。`index.html` 与 `pages/news.html` 目前仍由旧文件直接复制进产物。
- `content/topics/*.md` 的正文是导入的 HTML 透传块（保证零信息损失），尚未改写成卡片引用
- 相似度差异主要来自空白与结构细节，正文内容无丢失
- `site/` 不入库（`.gitignore`），由构建生成；CI 中同样先构建再部署
- `build.py` 复制 `assets/` → `site/assets/` 时只增不删：手工放进 `site/` 的临时文件不会被清理
  （`site/` 本身不入库，删除目录重新构建即恢复干净）
- `tools/build_search_index.py` 是旧站遗留脚本：它遍历仓库根下所有 HTML（含 `site/`），
  因此会同时索引旧站快照与构建产物；构建产物自己的索引由 `build.py` 写入 `site/assets/search-data.js`

