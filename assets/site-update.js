/**
 * 本站内容维护日期：由 python tools\check_links.py --stamp 自动写入
 * 每次全站内容有增删改后运行一次，日期会显示在各页页脚。
 */

window.SITE_UPDATE = {
  updatedAt: "2026-09-08",
  note: "内容维护日期，由 tools/check_links.py --stamp 写入"
};

(function () {
  var d = window.SITE_UPDATE && window.SITE_UPDATE.updatedAt;
  var el = document.getElementById("site-stamp");
  if (el && d && !el.getAttribute("data-filled")) {
    var p = String(d).split("-");
    el.textContent = "内容维护于 " + (p.length === 3 ? p.join(".") : d);
    el.setAttribute("data-filled", "1");
  }
})();
