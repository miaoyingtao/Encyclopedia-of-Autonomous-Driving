/* ADSim - 命令行运行器
 * 用法：
 *   node assets/adsim/run.js                 跑全部场景
 *   node assets/adsim/run.js cut-in 800      跑指定场景、指定步数
 * 输出：每个场景的指标表 + 断言结论；全部通过退出码 0。
 */
const path = require("path");
const Sim = require("./core/sim.js");
const scenarios = require("./scenarios.js");

const args = process.argv.slice(2);
const onlyId = args[0] && isNaN(Number(args[0])) ? args[0] : null;
const steps = parseInt(args[1] || (onlyId ? "0" : "0") || "0", 10) || 600;
const dt = 0.05;

const list = onlyId ? scenarios.list.filter(function (s) { return s.id === onlyId; }) : scenarios.list;
if (!list.length) {
  console.error("未知场景：" + onlyId + "；可选：" + scenarios.ids().join(", "));
  process.exit(2);
}

function pad(s, n) {
  s = String(s);
  while (s.length < n) s += " ";
  return s;
}
function num(v) { return v === null || v === undefined ? "-" : v; }

console.log("ADSim 闭环仿真 · 命令行运行器");
console.log("时间步长 " + dt + " s  预测/规划时域 3 s  随机种子 20260917（结果可复现）");
console.log("");

let allPass = true;
const rows = [];

for (const scene of list) {
  const sim = Sim.createSimulation(scene, { dt: dt, seed: 20260917 });
  const t0 = Date.now();
  for (let i = 0; i < steps; i++) sim.step();
  const wall = Date.now() - t0;
  const s = sim.summary();
  const assert = scene.assert || {};
  const checks = [
    ["无碰撞", s.collisions <= (assert.maxCollisions || 0), "collisions=" + s.collisions],
    ["最小间隙", s.minClearance >= (assert.minMinClearance || 0), s.minClearance + " m"],
    ["最大加速度", assert.maxAbsAccel === undefined || s.maxAbsAccel <= assert.maxAbsAccel, s.maxAbsAccel + " m/s²"],
    ["行驶距离", assert.minDistance === undefined || s.distance >= assert.minDistance, s.distance + " m"],
    ["决策状态", !assert.requireStates || assert.requireStates.some(function (st) {
      return (s.stateRatio[st] || 0) > 0.001;
    }), Object.keys(s.stateRatio).map(function (k) { return k + " " + (s.stateRatio[k] * 100).toFixed(0) + "%"; }).join(" ")]
  ];
  const pass = checks.every(function (c) { return c[1]; });
  allPass = allPass && pass;

  console.log("── " + scene.title + "（" + scene.id + "）  " + (pass ? "通过 ✔" : "失败 ✘"));
  console.log("   " + scene.desc);
  console.log("   " + pad("步数/仿真时长", 18) + s.steps + " / " + s.time + " s");
  console.log("   " + pad("行驶距离", 18) + s.distance + " m");
  console.log("   " + pad("碰撞次数", 18) + s.collisions + (s.collisionEvents.length ? " (" + JSON.stringify(s.collisionEvents) + ")" : ""));
  console.log("   " + pad("最小间隙", 18) + s.minClearance + " m");
  console.log("   " + pad("最小 TTC", 18) + num(s.minTTC) + " s");
  console.log("   " + pad("最小跟车间距", 18) + num(s.minGap) + " m");
  console.log("   " + pad("最大/平均|加速度|", 18) + s.maxAbsAccel + " / " + s.meanAbsAccel + " m/s²");
  console.log("   " + pad("最大|jerk|", 18) + s.maxAbsJerk + " m/s³");
  console.log("   " + pad("平均跟踪误差", 18) + num(s.meanTrackErr) + " m");
  console.log("   " + pad("决策状态切换", 18) + s.stateSwitches + " 次");
  console.log("   " + pad("规划可行比例", 18) + (s.planFeasibleRatio * 100).toFixed(1) + " %");
  console.log("   " + pad("实时性能", 18) + (steps * dt / (wall / 1000)).toFixed(1) + "× 实时（墙钟 " + wall + " ms）");
  for (const c of checks) console.log("     " + (c[1] ? "✔" : "✘") + " " + pad(c[0], 12) + c[2]);
  console.log("");
  rows.push({ id: scene.id, pass: pass, collisions: s.collisions, minClearance: s.minClearance, maxAbsJerk: s.maxAbsJerk });
}

console.log("汇总：" + rows.filter(function (r) { return r.pass; }).length + " / " + rows.length + " 个场景通过" +
  (allPass ? "  ——  全部通过 ✔" : "  ——  存在失败 ✘"));
process.exit(allPass ? 0 : 1);
