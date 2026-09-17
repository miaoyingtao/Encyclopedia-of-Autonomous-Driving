---
id: "pages/news.html"
slug: "news"
title: "领域动态 · 自动驾驶前沿资讯 · 驶向未来百科"
description: "自动驾驶领域动态页：L3 准入与量产、世界模型、VLA、Robotaxi 等最新行业事件与权威资讯，支持分类筛选、关键词搜索与时间排序。"
accent: "accent-future"
nav_active: "news"
hero_kicker: "领域动态 · 前沿快讯"
hero_h1: "自动驾驶领域动态"
hero_lead: "把分散在政策、量产、研究与出行运营中的最新事件聚合到一处：L3 准入到哪一步了？世界模型与 VLA 上车了吗？Robotaxi 扩展到哪些城市？并标注原始出处供你追查。"
crumb: "首页|../index.html"
crumb: "领域动态|"
---

<section class="sec" id="list">
      <div class="sec-head"><span class="no">动态</span><h2>最新动态列表</h2><p class="news-updated" id="news-updated"></p></div>

      <div class="news-toolbar" id="news-app">
        <div class="news-filters" id="news-filters" aria-label="按分类筛选"></div>
        <div class="news-actions">
          <button class="news-sort" id="news-refresh" type="button" title="获取最新动态">🔄 刷新动态</button>
          <input class="news-search" id="news-search" type="search" placeholder="搜索标题 / 摘要 / 来源 / 标签…" aria-label="搜索动态">
          <button class="news-sort" id="news-sort" type="button" title="切换时间排序">最新在前 ↓</button>
        </div>
      </div>

      <p class="news-refresh-note" id="news-refresh-note" hidden></p>
      <p class="news-status" id="news-status"></p>
      <div class="news-grid" id="news-grid"></div>
      <div class="news-empty" id="news-empty" hidden>
        没有符合条件的动态。可清空搜索词或切换分类后再试。
      </div>
    </section>

  </div>
