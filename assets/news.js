/**
 * 领域动态 · 渲染与交互
 * --------------------------------------------------------------
 * 依赖：assets/news-data.js（先加载，提供 window.NEWS_DATA）
 * 能力：
 *   1. pages/news.html —— 全量动态列表：分类筛选 + 关键词搜索 + 排序切换；
 *   2. 首页 index.html  —— 最新动态预览：自动取前 N 条。
 * 维护者无需改动本文件，只要编辑 news-data.js 中的数组即可。
 */
(function () {
  "use strict";

  var data = (window.NEWS_DATA || []).slice();
  var CAT_ORDER = ["政策与准入", "技术与研究", "量产车型", "出行运营", "行业动态"];
  var state = { cat: "全部", query: "", asc: false, feat: false };

  function usedCategories() {
    var used = [];
    data.forEach(function (item) {
      if (used.indexOf(item.category) === -1) used.push(item.category);
    });
    return CAT_ORDER.filter(function (c) { return used.indexOf(c) !== -1; });
  }

  function sortList(arr, asc) {
    return arr.slice().sort(function (a, b) {
      if (a.date === b.date) return 0;
      return asc ? (a.date < b.date ? -1 : 1) : (a.date > b.date ? -1 : 1);
    });
  }

  function matchItem(item) {
    if (state.cat !== "全部" && item.category !== state.cat) return false;
    if (state.feat && !item.featured) return false;
    if (!state.query) return true;
    var q = state.query.toLowerCase();
    var hay = (item.title + " " + item.summary + " " + item.source + " " +
      item.category + " " + (item.tags || []).join(" ")).toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function filteredItems() {
    var arr = data.filter(matchItem);
    return sortList(arr, state.asc);
  }

  function fmtDate(d) {
    var p = String(d || "").split("-");
    if (p.length < 3) return d || "";
    return p[0] + "." + p[1] + "." + p[2];
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /* 单条卡片（首页与动态页共用） */
  function cardNode(item) {
    var card = el("article", "card news-item");
    if (item.featured) card.classList.add("is-featured");
    var top = el("div", "news-top");
    top.appendChild(el("time", "news-date", fmtDate(item.date)));
    var side = el("div", "news-top-side");
    if (item.featured) side.appendChild(el("span", "badge featured", "★ 精选"));
    side.appendChild(el("span", "news-cat", item.category));
    top.appendChild(side);
    card.appendChild(top);

    var h3 = el("h3");
    var a = el("a", "news-title", item.title);
    a.href = item.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    h3.appendChild(a);
    card.appendChild(h3);

    card.appendChild(el("p", "news-sum", item.summary));

    if (item.tags && item.tags.length) {
      var tags = el("div", "news-tags");
      item.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
      card.appendChild(tags);
    }

    var foot = el("div", "news-foot");
    foot.appendChild(el("span", "news-src", "来源：" + item.source));
    var more = el("a", "more news-more", "阅读原文");
    more.href = item.link;
    more.target = "_blank";
    more.rel = "noopener noreferrer";
    foot.appendChild(more);
    card.appendChild(foot);
    return card;
  }

  function renderList(grid) {
    grid.innerHTML = "";
    var items = filteredItems();
    var empty = document.getElementById("news-empty");
    if (!items.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    items.forEach(function (item) { grid.appendChild(cardNode(item)); });
  }

  function setStatus(statusEl) {
    if (!statusEl) return;
    var items = filteredItems();
    var featN = items.filter(function (x) { return x.featured; }).length;
    var badgeTxt = data.some(function (x) { return x.featured; })
      ? "，其中精选 " + featN + " 条" : "";
    statusEl.textContent = "共收录 " + data.length + " 条，当前显示 " + items.length + " 条" + badgeTxt +
      (state.cat !== "全部" || state.query || state.feat ? "（已按条件筛选）" : "");
  }

  function renderAll() {
    var grid = document.getElementById("news-grid");
    if (grid) renderList(grid);
    setStatus(document.getElementById("news-status"));
    var sortBtn = document.getElementById("news-sort");
    if (sortBtn) sortBtn.textContent = state.asc ? "最早在前 ↑" : "最新在前 ↓";
  }

  /* ===== 动态页 ===== */
  function initPage() {
    var app = document.getElementById("news-app");
    if (!app || !document.getElementById("news-grid")) return;

    var filterBar = document.getElementById("news-filters");
    if (filterBar) {
      var cats = ["全部"].concat(usedCategories());
      cats.forEach(function (c) {
        var chip = el("button", "chip", c);
        chip.type = "button";
        chip.dataset.cat = c;
        if (c === "全部") chip.classList.add("on");
        chip.addEventListener("click", function () {
          state.cat = chip.dataset.cat;
          filterBar.querySelectorAll(".chip").forEach(function (b) {
            b.classList.toggle("on", b === chip);
          });
          renderAll();
        });
        filterBar.appendChild(chip);
      });
    }

    if (filterBar) {
      var featBtn = el("button", "chip news-feat", "★ 只看精选");
      featBtn.type = "button";
      featBtn.title = "只显示被标记为“精选”的重要动态";
      featBtn.setAttribute("aria-pressed", "false");
      filterBar.appendChild(featBtn);
      featBtn.addEventListener("click", function () {
        state.feat = !state.feat;
        featBtn.classList.toggle("on", state.feat);
        featBtn.setAttribute("aria-pressed", state.feat ? "true" : "false");
        renderAll();
      });
    }

    var search = document.getElementById("news-search");
    if (search) {
      search.addEventListener("input", function () {
        state.query = search.value.trim();
        renderAll();
      });
    }

    var sortBtn = document.getElementById("news-sort");
    if (sortBtn) {
      sortBtn.addEventListener("click", function () {
        state.asc = !state.asc;
        renderAll();
      });
    }


    /* 一键刷新：仅当页面通过本机服务(http)打开时可用 */
    var refreshBtn = document.getElementById("news-refresh");
    var refreshNote = document.getElementById("news-refresh-note");
    if (refreshBtn && refreshNote) {
      var viaHttp = /^https?:$/.test(location.protocol);
      var viaLocalHttp = viaHttp && /^(127\.0\.0\.1|localhost|\[::1\]|::1)$/.test(location.hostname);
      if (!viaHttp) {
        refreshBtn.disabled = true;
        refreshBtn.title = "file:// 模式无法运行 Python，请先启动 python tools/serve.py";
        refreshNote.hidden = false;
        refreshNote.textContent = "提示：当前以 file:// 方式打开，浏览器不能执行本机 Python。请先运行 python tools/serve.py，再用 http://127.0.0.1:8765/pages/news.html 打开本页，点击“刷新动态”即可自动抓取并更新列表。";
        refreshNote.className = "news-refresh-note hint";
      } else if (!viaLocalHttp) {
        refreshBtn.disabled = true;
        refreshBtn.title = "线上静态托管无法执行 Python，由 GitHub Actions 定时自动更新";
        refreshNote.hidden = false;
        var onlineUpd = (window.NEWS_META && window.NEWS_META.updatedAt) ? "，数据更新：" + fmtDate(window.NEWS_META.updatedAt) : "";
        refreshNote.textContent = "提示：当前是线上静态版本，无需手动刷新；领域动态由 GitHub Actions 定时抓取并自动发布" + onlineUpd + "。";
        refreshNote.className = "news-refresh-note hint";
      } else {
        refreshBtn.addEventListener("click", function () {
          if (refreshBtn.disabled) return;
          refreshBtn.disabled = true;
          var oldText = refreshBtn.textContent;
          refreshBtn.textContent = "刷新中…";
          refreshNote.hidden = false;
          refreshNote.textContent = "正在运行 python tools/news_fetcher.py 联网抓取，请稍候（约 10–60 秒）…";
          refreshNote.className = "news-refresh-note ok";
          fetch("/api/refresh", { method: "POST", cache: "no-store" })
            .then(function (resp) {
              return resp.json().catch(function () {
                return { ok: false, message: "服务响应异常（HTTP " + resp.status + "）" };
              });
            })
            .then(function (data) {
              if (data && data.ok) {
                refreshNote.textContent = "刷新成功：共 " + data.total + " 条（数据更新 " + data.updatedAt + "），正在重新加载列表…";
                setTimeout(function () { location.reload(); }, 900);
              } else {
                refreshBtn.disabled = false;
                refreshBtn.textContent = oldText;
                refreshNote.textContent = "刷新失败：" + ((data && data.message) || "未知错误") + "。可运行 python tools/news_fetcher.py 排查。";
                refreshNote.className = "news-refresh-note err";
              }
            })
            .catch(function (err) {
              refreshBtn.disabled = false;
              refreshBtn.textContent = oldText;
              refreshNote.textContent = "刷新失败：无法连接本地服务（" + err + "）。请确认已运行 python tools/serve.py。";
              refreshNote.className = "news-refresh-note err";
            });
        });
      }
    }

    var updated = document.getElementById("news-updated");
    if (updated && window.NEWS_META && window.NEWS_META.updatedAt) {
      updated.textContent = "数据更新：" + fmtDate(window.NEWS_META.updatedAt);
    }

    renderAll();
  }

  /* ===== 首页预览 ===== */
  function initHome() {
    var grid = document.getElementById("home-news-grid");
    if (!grid) return;
    var limit = parseInt(grid.getAttribute("data-count") || "4", 10);
    var items = sortList(data, false).slice(0, limit);
    if (!items.length) {
      var emptyHome = document.getElementById("home-news-empty");
      if (emptyHome) emptyHome.hidden = false;
      return;
    }
    items.forEach(function (item) { grid.appendChild(cardNode(item)); });
    var more = document.getElementById("home-news-more");
    if (more) more.hidden = false;
  }

  function boot() {
    initPage();
    initHome();
  }

  window.NewsFeed = {
    page: initPage,
    home: initHome,
    reload: function () { renderAll(); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();