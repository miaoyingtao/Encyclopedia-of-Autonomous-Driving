/**
 * 站内离线搜索（配合 assets/search-data.js）
 * --------------------------------------------------------------
 * - 数据：assets/search-data.js（由 tools/build_search_index.py 生成）
 * - 打开：点击各页右下角悬浮的 🔍 按钮
 * - 索引按需加载，页面初始不会额外下载文件
 * 每个页面在注入本脚本前会设置 window.SITE_PREFIX（如 '../'）用于解析相对路径。
 */
(function () {
  "use strict";

  var PREFIX = window.SITE_PREFIX || "";
  var INDEX_URL = PREFIX + "assets/search-data.js";
  var indexData = null;
  var indexLoading = false;

  var fab, modal, input, results, emptyEl;

  function escForCssClass() { return null; }

  function showMessage(text) {
    results.innerHTML = "";
    emptyEl.hidden = false;
    emptyEl.textContent = text;
  }

  function ensureIndex(cb) {
    if (indexData) { cb(); return; }
    if (indexLoading) { return; }
    indexLoading = true;
    showMessage("正在加载站内索引…");
    var sc = document.createElement("script");
    sc.src = INDEX_URL;
    sc.onload = function () {
      indexLoading = false;
      indexData = window.SEARCH_DATA || [];
      cb();
    };
    sc.onerror = function () {
      indexLoading = false;
      showMessage("索引加载失败，请稍后重试。");
    };
    document.head.appendChild(sc);
  }

  function tokenize(q) {
    return q.toLowerCase().split(/\s+/).filter(Boolean);
  }

  function runSearch() {
    if (!input || !indexData) { return; }
    var q = input.value.trim();
    if (!q) {
      results.innerHTML = "";
      emptyEl.hidden = false;
      emptyEl.textContent = "输入关键词开始搜索，例如：激光雷达、世界模型、L3、Robotaxi、贝叶斯…";
      return;
    }
    var toks = tokenize(q);
    if (!toks.length) { return; }

    var scored = [];
    for (var i = 0; i < indexData.length; i++) {
      var it = indexData[i];
      var title = (it.t || "").toLowerCase();
      var content = (it.c || "").toLowerCase();
      var ok = true;
      var hits = 0;
      for (var k = 0; k < toks.length; k++) {
        var inT = title.indexOf(toks[k]) > -1;
        var inC = content.indexOf(toks[k]) > -1;
        if (!inT && !inC) { ok = false; break; }
        if (inT) hits += 3;
        hits += (content.split(toks[k]).length - 1);
      }
      if (!ok) { continue; }
      var score = hits;
      if (title.indexOf(toks[0]) === 0) score += 50;
      else if (title.indexOf(toks[0]) > -1) score += 20;
      scored.push({ score: score, item: it });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    var top = scored.slice(0, 24);
    results.innerHTML = "";
    emptyEl.hidden = true;
    if (!top.length) {
      emptyEl.hidden = false;
      emptyEl.textContent = "没有找到与“" + q + "”相关的内容。试试更短的关键词。";
      return;
    }
    top.forEach(function (o) {
      var it = o.item;
      var a = document.createElement("a");
      a.className = "search-item";
      a.href = PREFIX + it.u;
      var title = document.createElement("b");
      title.className = "search-item-title";
      title.textContent = it.t;
      var snip = document.createElement("span");
      snip.className = "search-item-snippet";
      snip.textContent = snippet(it.c, q);
      a.appendChild(title);
      a.appendChild(snip);
      results.appendChild(a);
    });
  }

  function snippet(content, q) {
    if (!content) { return ""; }
    var low = content.toLowerCase();
    var idx = low.indexOf(q.toLowerCase());
    var start = 0;
    if (idx > 60) { start = idx - 50; }
    var s = content.slice(start, start + 170);
    s = s.trim();
    if (start > 0) { s = "…" + s; }
    if (start + 170 < content.length) { s = s + "…"; }
    return s;
  }

  function buildModal() {
    modal = document.createElement("div");
    modal.className = "search-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "站内搜索");
    var box = document.createElement("div");
    box.className = "search-box";
    var close = document.createElement("button");
    close.type = "button";
    close.className = "search-close";
    close.textContent = "✕";
    close.setAttribute("aria-label", "关闭搜索");
    close.addEventListener("click", closeModal);

    var head = document.createElement("div");
    head.className = "search-head";
    var ic = document.createElement("span");
    ic.className = "search-ico";
    ic.textContent = "🔍";
    input = document.createElement("input");
    input.className = "search-field";
    input.type = "search";
    input.placeholder = "站内搜索：教程 / 科普 / 领域动态…";
    input.setAttribute("aria-label", "搜索关键词");
    input.autocomplete = "off";
    head.appendChild(ic);
    head.appendChild(input);
    head.appendChild(close);

    results = document.createElement("div");
    results.className = "search-results";
    emptyEl = document.createElement("div");
    emptyEl.className = "search-empty";

    var foot = document.createElement("div");
    foot.className = "search-foot";
    foot.textContent = "回车或点击结果打开页面 · Esc 关闭";

    box.appendChild(head);
    box.appendChild(results);
    box.appendChild(emptyEl);
    box.appendChild(foot);
    modal.appendChild(box);
    document.body.appendChild(modal);

    input.addEventListener("input", function () {
      if (indexData) { runSearch(); }
      else { ensureIndex(runSearch); }
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); if (!indexData) { ensureIndex(runSearch); } else { runSearch(); } }
    });
    modal.addEventListener("mousedown", function (e) { if (e.target === modal) { closeModal(); } });
  }

  function openModal() {
    if (!modal) { buildModal(); }
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    setTimeout(function () { input.focus(); }, 30);
    if (!indexData) {
      showMessage("正在加载站内索引…");
      ensureIndex(function () { runSearch(); });
    } else {
      runSearch();
    }
  }

  function closeModal() {
    if (!modal) { return; }
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    if (input) { input.blur(); }
  }

  function init() {
    fab = document.getElementById("searchFab");
    if (!fab) { return; }
    fab.addEventListener("click", openModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.classList.contains("open")) { closeModal(); }
      var tag = (e.target && e.target.tagName) || "";
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        openModal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
