(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  /* 按当前 URL 目录/文件名高亮对应一级导航 */
  var raw = location.pathname.replace(/\\/g, "/").split("/").filter(Boolean);
  var parts = [];
  raw.forEach(function (seg) {
    if (seg.indexOf(":") > -1) return;
    parts.push(seg.replace(/\.html?$/, ""));
  });
  var order = ["index", "overview", "levels", "tech", "scenarios", "challenges", "future"];
  var current = "";
  for (var i = 0; i < order.length; i++) {
    if (parts.indexOf(order[i]) > -1) { current = order[i]; break; }
  }
  if (current) {
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      var href = a.getAttribute("href").replace(/\.html?$/, "").split("/").pop();
      if (href === current) a.classList.add("active");
    });
  }

  var btt = document.querySelector(".btt");
  if (btt) {
    window.addEventListener("scroll", function () {
      btt.classList.toggle("show", window.scrollY > 420);
    });
    btt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  document.querySelectorAll("main table").forEach(function (t) {
    if (!t.parentElement.classList.contains("tbl-wrap")) {
      var wrap = document.createElement("div");
      wrap.className = "tbl-wrap";
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    }
  });
})();
