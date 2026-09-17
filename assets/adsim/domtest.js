/* ADSim - 浏览器冒烟测试（Node 环境打桩 DOM / Canvas）
 * 用法：node assets/adsim/domtest.js
 * 目的：在没有真实浏览器的环境里，验证“页面能自动挂载、能绘制、能点击、能闭环推进”。
 */
"use strict";

/* ---------- 1. 最小 DOM / Canvas 打桩 ---------- */
const ATTR_RE = /data-(act|out|layer|scene)="([^"]*)"/g;
const ctxStub = {
  calls: 0, fillStyle: "", strokeStyle: "", lineWidth: 1, font: "", globalAlpha: 1, textAlign: "left",
  setTransform() { ctxStub.calls++; }, clearRect() { ctxStub.calls++; }, fillRect() { ctxStub.calls++; },
  beginPath() { ctxStub.calls++; }, moveTo() { ctxStub.calls++; }, lineTo() { ctxStub.calls++; },
  closePath() { ctxStub.calls++; }, fill() { ctxStub.calls++; }, stroke() { ctxStub.calls++; },
  arc() { ctxStub.calls++; }, fillText() { ctxStub.calls++; }, setLineDash() { ctxStub.calls++; },
  save() {}, restore() {}
};
function makeEl(tag) {
  const el = {
    tagName: tag, children: [], _attrs: {}, _byAttr: {}, _listeners: {},
    style: {}, dataset: {}, className: "", clientWidth: 900, textContent: "", _html: "",
    classList: { add() {}, remove() {} },
    setAttribute(k, v) { el._attrs[k] = v; },
    getAttribute(k) { return k in el._attrs ? el._attrs[k] : null; },
    appendChild(c) { el.children.push(c); return c; },
    addEventListener(t, fn) { (el._listeners[t] = el._listeners[t] || []).push(fn); },
    querySelector(sel) {
      const m = /^\[data-([a-z]+)="([^"]*)"\]$/.exec(sel);
      if (!m) return null;
      const key = m[1] + ":" + m[2];
      if (el._byAttr[key]) return el._byAttr[key];
      for (let i = 0; i < el.children.length; i++) {        // 递归查找子元素
        const hit = el.children[i].querySelector ? el.children[i].querySelector(sel) : null;
        if (hit) return hit;
      }
      return null;
    },
    querySelectorAll() { return []; },
    getContext() { return ctxStub; }
  };
  Object.defineProperty(el, "innerHTML", {
    get() { return el._html; },
    set(v) {
      el._html = v; el.children = []; el._byAttr = {};
      let m; ATTR_RE.lastIndex = 0;
      while ((m = ATTR_RE.exec(v))) {
        const child = makeEl("stub");
        child._attrs["data-" + m[1]] = m[2];
        el._byAttr[m[1] + ":" + m[2]] = child;
        el.children.push(child);
      }
    }
  });
  return el;
}
const rootEl = makeEl("div");
rootEl._attrs["data-scene"] = "cut-in";                 // 与页面容器一致
const canvasEl = makeEl("canvas");
const rafQueue = [];
global.document = {
  readyState: "complete",
  getElementById(id) { return id === "adsim-root" ? rootEl : null; },
  createElement(tag) { return tag === "canvas" ? canvasEl : makeEl(tag); },
  addEventListener() {}
};
global.devicePixelRatio = 1;
global.addEventListener = function () {};
global.requestAnimationFrame = function (fn) { rafQueue.push(fn); return rafQueue.length; };
global.window = global;

/* ---------- 2. 按页面顺序加载脚本（等价于页面尾部的 11 个 <script>） ---------- */
const A = global.ADSim = {};
A.M = require("./core/math.js");
A.World = require("./core/world.js");
A.Perception = require("./core/perception.js");
A.Prediction = require("./core/prediction.js");
A.Decision = require("./core/decision.js");
A.Planning = require("./core/planning.js");
A.Control = require("./core/control.js");
A.Metrics = require("./core/metrics.js");
A.Sim = require("./core/sim.js");
A.scenarios = require("./scenarios.js");
require("./ui.js");                                      // 末尾 boot 应自动挂载 #adsim-root

/* ---------- 3. 断言 ---------- */
const results = [];
function ok(cond, name, detail) {
  results.push({ pass: !!cond, name: name, detail: detail === undefined ? "" : String(detail) });
}
const api = rootEl.adsimApi;
ok(!!api, "boot 自动挂载：容器上出现 adsimApi 接口");
ok(rootEl.children.length >= 4, "挂载后生成了工具栏 / 图层栏 / 画布区 / 面板区", rootEl.children.length);
ok(ctxStub.calls > 30, "首帧已绘制到 canvas（含未启动引导遮罩）", ctxStub.calls + " 次绘制调用");
ok(!!api && !!api.frame(), "第 0 帧已生成");

const t0 = api.frame().time;
for (let i = 0; i < 200; i++) api.stepOnce();
const f = api.frame();
ok(Math.abs(f.time - t0 - 200 * 0.05) < 1e-6, "单步 200 次 = 仿真时间 +10.00 s", f.time.toFixed(2) + " s");
ok(f.world.ego.x > 5, "闭环中自车确实在前进", f.world.ego.x.toFixed(1) + " m");
ok(f.points.length > 0, "感知输出点云非空", f.points.length + " 点");

api.play();
const qlen = rafQueue.length;
rafQueue[rafQueue.length - 1](1000);
rafQueue[rafQueue.length - 1](1100);
api.pause();
ok(rafQueue.length > qlen, "播放态下持续注册下一帧回调（渲染循环在跑）");
ok(api.frame().time > f.time, "点击播放推进了仿真时间", api.frame().time.toFixed(2) + " s");

api.setScene("workzone");
ok(api.simulation().world.statics.length > 5, "切换场景会重建世界",
  api.simulation().world.statics.length + " 个静态障碍");

const pass = api.runSelfTest();
const report = api.report();
ok(typeof pass === "boolean", "自检返回布尔结论");
ok(report.indexOf("ADSim 自检") === 0, "自检报告已写入面板");
ok(/\[PASS\]|\[FAIL\]/.test(report), "报告含场景级结论");

/* ---------- 4. 输出 ---------- */
console.log(report);
console.log("");
for (let i = 0; i < results.length; i++) {
  console.log((results[i].pass ? "[PASS] " : "[FAIL] ") + results[i].name +
    (results[i].detail ? "   [" + results[i].detail + "]" : ""));
}
const failed = results.filter(function (r) { return !r.pass; });
console.log("");
console.log("冒烟测试：" + (results.length - failed.length) + " / " + results.length +
  (failed.length ? " 存在失败" : " 全部通过"));
console.log("场景级自检结论：" + (pass ? "全部通过" : "存在未通过项"));
process.exit(failed.length ? 1 : 0);
