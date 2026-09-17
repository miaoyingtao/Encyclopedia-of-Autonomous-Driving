/* ADSim - 自检脚本
 * 用法：node assets/adsim/selftest.js       （也可在浏览器里运行 runSelfTest()）
 * 内容：模块级单元断言 + 场景级闭环断言；固定随机种子，结果可复现。
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const A = isNode ? {
    M: require("./core/math.js"), World: require("./core/world.js"),
    Perception: require("./core/perception.js"), Prediction: require("./core/prediction.js"),
    Decision: require("./core/decision.js"), Planning: require("./core/planning.js"),
    Control: require("./core/control.js"), Metrics: require("./core/metrics.js"),
    Sim: require("./core/sim.js"), scenarios: require("./scenarios.js")
  } : (root.ADSim || {});
  const report = factory(A);
  if (isNode) {
    module.exports = report;
    if (require.main === module) {
      const pass = report.report();
      process.exit(pass ? 0 : 1);
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (A) {
  "use strict";
  const M = A.M;
  const results = [];

  function near(a, b, tol, name) {
    const pass = Math.abs(a - b) <= tol;
    results.push({ name: name, pass: pass, detail: "got " + fmt(a) + " expect " + fmt(b) + " ±" + tol });
    return pass;
  }
  function ok(cond, name, detail) {
    results.push({ name: name, pass: !!cond, detail: detail || "" });
    return !!cond;
  }
  function fmt(v) { return typeof v === "number" ? (+v.toFixed(4)) : String(v); }

  /* ============ 1. 数学与几何 ============ */
  (function testMath() {
    const h = M.hungarian([[4, 1, 3], [2, 0, 5], [3, 2, 2]]);
    ok(JSON.stringify(h) === JSON.stringify([1, 0, 2]), "math/hungarian 最小代价分配", JSON.stringify(h));

    const q = M.quintic(0, 0, 0, 3, 0, 0, 2);
    near(M.polyEval(q, 2), 3, 1e-9, "math/quintic 末位置约束");
    near(M.polyEval(M.polyDeriv(q), 2), 0, 1e-9, "math/quintic 末速度约束");
    near(M.polyEval(M.polyDeriv2(q), 2), 0, 1e-9, "math/quintic 末加速度约束");

    const hit = M.segIntersect({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 2, y: 0 }, { x: 0, y: 2 });
    ok(hit && Math.abs(hit.t - 0.5) < 1e-9, "math/segIntersect 交点参数", hit && hit.t);

    near(M.raySegment({ x: 0, y: 0 }, { x: 1, y: 0 }, 100, { x: 5, y: -1 }, { x: 5, y: 1 }), 5, 1e-9,
      "math/raySegment 命中距离");
    ok(M.raySegment({ x: 0, y: 0 }, { x: 1, y: 0 }, 100, { x: -5, y: -1 }, { x: -5, y: 1 }) === null,
      "math/raySegment 背向不命中");

    const rect = M.rectCorners(0, 0, 4, 2, 0);
    ok(M.pointInRect({ x: 0, y: 0 }, rect), "math/pointInRect 内部点");
    ok(!M.pointInRect({ x: 3, y: 0 }, rect), "math/pointInRect 外部点");
    ok(M.circleRect(2.5, 0, 0.6, rect), "math/circleRect 相交");
    ok(!M.circleRect(4, 0, 0.6, rect), "math/circleRect 分离");

    const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 10 }];
    near(M.pathLength(path), 10 + Math.hypot(10, 10), 1e-9, "math/pathLength 折线长度");
    const proj = M.projectOnPath({ x: 5, y: 1.5 }, path);
    near(proj.s, 5, 1e-9, "math/projectOnPath 弧长投影");
    near(proj.d, 1.5, 1e-9, "math/projectOnPath 横向偏移（左正右负）");
  }());

  /* ============ 2. 世界与车辆动力学 ============ */
  (function testWorld() {
    const v = A.World.createVehicle({});
    v.v = 10; v.accelCmd = 0; v.steerCmd = 0;
    for (let i = 0; i < 20; i++) v.step(0.05);            // 1.0 s
    near(v.x, 10, 0.05, "world/运动学模型 1 s 前进 ≈ v×t");
    near(v.y, 0, 1e-9, "world/无转向时横向不漂移");

    v.steerCmd = 0.1;
    for (let i = 0; i < 40; i++) v.step(0.05);
    ok(v.yaw > 0, "world/正前轮转角 → 左转（yaw 增大）", v.yaw);
    ok(Math.abs(v.yawRate - v.v / v.wheelbase * Math.tan(v.steer)) < 1e-9,
      "world/偏航角速度符合自行车模型");

    const v2 = A.World.createVehicle({});
    v2.steerCmd = 0.5;
    v2.step(0.02);
    ok(v2.steer < 0.5 && v2.steer > 0, "world/执行器一阶延迟（转角不瞬时到位）", v2.steer);

    const a1 = A.World.idmAccel(10, 5, 8, { vDesired: 15, minGap: 2, idmT: 1.6, idmA: 1.5, idmB: 2 });
    ok(a1 < 0, "world/IDM 间距不足时输出负加速度", a1);
    const a2 = A.World.idmAccel(5, 15, 120, { vDesired: 15, minGap: 2, idmT: 1.6, idmA: 1.5, idmB: 2 });
    ok(a2 > 0, "world/IDM 前方空阔时输出正加速度", a2);
  }());

  /* ============ 3. 感知：扫描 / 聚类 / 跟踪 ============ */
  (function testPerception() {
    const cfg = { range: 60, fovDeg: 90, beams: 121, rangeSigma: 0, angleSigma: 0, clusterEps: 1.6, clusterMinPts: 2 };
    const rect = M.rectCorners(20, 0, 4.8, 1.9, 0);
    const obs = [{ corners: function () { return rect; } }];
    const pts = A.Perception.scan({ x: 0, y: 0, yaw: 0 }, obs, cfg, M.Rng(1));
    let minR = Infinity;
    for (let i = 0; i < pts.length; i++) minR = Math.min(minR, pts[i].r);
    near(minR, 20 - 4.8 / 2, 0.35, "perception/激光命中距离 ≈ 目标前缘距离");

    const clusters = A.Perception.cluster(pts, cfg);
    ok(clusters.length >= 1, "perception/点云聚类生成至少一个簇", clusters.length);
    const dets = A.Perception.toDetections(clusters);
    ok(dets.length >= 1 && Math.abs(dets[0].x - 20) < 3.0,
      "perception/检测中心接近真值", dets[0] && dets[0].x.toFixed(2));

    // 跟踪恒定 8 m/s 目标 15 帧，速度应收敛
    const tracker = A.Perception.createTracker({});
    for (let k = 0; k < 15; k++) {
      const cx = 20 + 8 * k * 0.05;
      const r2 = M.rectCorners(cx, 0, 4.8, 1.9, 0);
      const p2 = A.Perception.scan({ x: 0, y: 0, yaw: 0 }, [{ corners: function () { return r2; } }], cfg, M.Rng(7));
      tracker.step(0.05, A.Perception.toDetections(A.Perception.cluster(p2, cfg)), k * 0.05);
    }
    const tr0 = tracker.tracks[0];
    ok(!!tr0 && Math.abs(Math.hypot(tr0.vx, tr0.vy) - 8) < 2.0,
      "perception/卡尔曼跟踪收敛到真实速度(~8 m/s)", tr0 && Math.hypot(tr0.vx, tr0.vy).toFixed(2));
    ok(tracker.tracks.length === 1, "perception/单一目标只产生一条轨迹", tracker.tracks.length);

    // 数据关联：两个目标不串号
    const tk2 = A.Perception.createTracker({});
    for (let k = 0; k < 10; k++) {
      const d = [
        { x: 20 + 6 * k * 0.05, y: -1.75, yaw: 0, length: 4.8, width: 1.9, n: 12, sigma: 0.2 },
        { x: 30 + 12 * k * 0.05, y: 1.75, yaw: 0, length: 4.8, width: 1.9, n: 12, sigma: 0.2 }
      ];
      tk2.step(0.05, d, k * 0.05);
    }
    ok(tk2.tracks.length === 2, "perception/两个目标保持两条轨迹", tk2.tracks.length);
    if (tk2.tracks.length === 2) {
      const v0 = Math.hypot(tk2.tracks[0].vx, tk2.tracks[0].vy);
      const v1 = Math.hypot(tk2.tracks[1].vx, tk2.tracks[1].vy);
      ok(Math.abs(v0 - 6) < 1.5 && Math.abs(v1 - 12) < 2.0,
        "perception/关联正确（速度分别收敛 6 / 12 m/s）", v0.toFixed(2) + " / " + v1.toFixed(2));
    }
  }());

  /* ============ 4. 预测 ============ */
  (function testPrediction() {
    const t = A.Prediction.rollout({ x: 0, y: 0, yaw: 0, v: 10, yawRate: 0, accel: 0 }, { horizon: 2, dt: 0.1 });
    near(t[t.length - 1].x, 20, 1e-6, "prediction/恒速推演 2 s 前进 20 m");
    const t2 = A.Prediction.rollout({ x: 0, y: 0, yaw: 0, v: 10, yawRate: 0.2, accel: 0 }, { horizon: 1, dt: 0.1 });
    ok(Math.abs(t2[t2.length - 1].yaw - 0.2) < 1e-6, "prediction/偏航率积分正确");
  }());
  /* ============ 5. 决策 ============ */
  (function testDecision() {
    const road = A.scenarios.straightRoad(200, 3.5, 2);
    const ego = { x: 0, y: 1.75, yaw: 0, v: 8, a: 0, length: 4.8, width: 1.9 };
    function mk(x, v) {
      return { id: 1, x: x, y: 1.75, vx: v, vy: 0, yaw: 0, size: { length: 4.8, width: 1.9 }, confirmed: true };
    }
    const d1 = A.Decision.createDecider({});
    const r1 = d1.update({ ego: ego, tracks: [mk(14, 3)], road: road, time: 0, dt: 0.05, speedLimit: 13.9 });
    ok(r1.name === "FOLLOW" || r1.name === "EMERGENCY", "decision/前车近且慢 → 跟车或制动", r1.name);
    ok(r1.targetSpeed <= 8, "decision/目标速度不高于当前车速", r1.targetSpeed);

    const d2 = A.Decision.createDecider({});
    const r2 = d2.update({ ego: ego, tracks: [], road: road, time: 0, dt: 0.05, speedLimit: 13.9 });
    ok(r2.name === "CRUISE", "decision/前方无目标 → 巡航", r2.name);
    ok(Math.abs(r2.targetSpeed - 13.9) < 1e-6, "decision/巡航目标速度 = 道路限速");

    const d3 = A.Decision.createDecider({});
    const ped = { id: 9, x: 12, y: 2.0, vx: -0.5, vy: 1.2, yaw: -1.57, size: { length: 0.6, width: 0.6 }, confirmed: true };
    const r3 = d3.update({ ego: ego, tracks: [ped], road: road, time: 0, dt: 0.05, speedLimit: 13.9 });
    ok(r3.name === "STOP" || r3.name === "YIELD", "decision/横穿目标 → 停车或让行", r3.name);

    const ttc = A.Decision.computeTTC(10, 8, 3);
    near(ttc, 2, 1e-9, "decision/TTC = gap / 相对速度");
    ok(A.Decision.computeTTC(10, 5, 8) === Infinity, "decision/前车更快时 TTC 为无穷");
  }());

  /* ============ 6. 规划 ============ */
  (function testPlanning() {
    const road = A.scenarios.straightRoad(200, 3.5, 2);
    const ctx = {
      ego: { x: 0, y: 1.75, yaw: 0, v: 8, a: 0, width: 1.9 },
      road: road, targetSpeed: 10, targetLane: 0,
      footprints: [{
        trackId: 1, mode: "keep", prob: 1,
        circles: [{ t: 1.0, x: 10, y: 1.75, r: 1.3 }, { t: 2.0, x: 18, y: 1.75, r: 1.3 }]
      }]
    };
    const res = A.Planning.plan(ctx);
    ok(!!res.best, "planning/选出最优轨迹");
    ok(res.candidates.length === 20, "planning/候选轨迹数 = 5 横向 × 4 速度档", res.candidates.length);
    ok(res.best.collision.collided === false, "planning/最优轨迹无碰撞");
    ok(isFinite(res.best.cost) && res.best.cost >= 0, "planning/代价有限且非负",
      res.best.cost && res.best.cost.toFixed(2));
    const blocked = res.candidates.filter(function (c) { return c.collision.collided; }).length;
    ok(blocked > 0, "planning/存在被判碰撞的候选（碰撞检查真的在筛）", blocked);
    ok(res.feasible + blocked === res.total, "planning/可行性统计自洽",
      res.feasible + "+" + blocked + "=" + res.total);

    // 无占用时，应倾向于保持车道（横向代价最小）
    const res2 = A.Planning.plan({
      ego: ctx.ego, road: road, targetSpeed: 10, targetLane: 0, footprints: []
    });
    ok(Math.abs(res2.best.lateral - 1.75) < 1e-9, "planning/无阻碍时选择本车道中心（d=1.75）", res2.best.lateral);
  }());

  /* ============ 7. 控制 ============ */
  (function testControl() {
    const ego = { x: 0, y: 1.75, yaw: 0, v: 5, wheelbase: 2.8, cfg: { maxSteer: 0.55 } };
    const ctrl = A.Control.createController({});
    const straight = [{ x: 5, y: 1.75 }, { x: 15, y: 1.75 }, { x: 25, y: 1.75 }];
    const cc = ctrl.compute({ traj: straight, ego: ego, targetSpeed: 5, dt: 0.05 });
    near(cc.steerCmd, 0, 1e-9, "control/Pure Pursuit 对直线轨迹输出零转角");

    const left = [{ x: 5, y: 3.5 }, { x: 15, y: 6 }, { x: 25, y: 8 }];
    const cc2 = ctrl.compute({ traj: left, ego: ego, targetSpeed: 5, dt: 0.05 });
    ok(cc2.steerCmd > 0, "control/左偏轨迹 → 正转角（左转）", cc2.steerCmd);
    ok(cc2.debug.lookahead >= 4.0 && cc2.debug.lookahead <= 14.0,
      "control/前视距离在自适应范围内", cc2.debug.lookahead);

    const u = A.Control.speedController(10, 5, 0.05, { integral: 0, prevErr: 0 }, {});
    ok(u.accelCmd > 0, "control/PID 速度不足 → 正加速度", u.accelCmd);
    const u2 = A.Control.speedController(2, 10, 0.05, { integral: 0, prevErr: 0 }, {});
    ok(u2.accelCmd < 0, "control/PID 超速 → 负加速度", u2.accelCmd);
    ok(u2.accelCmd >= -6.0, "control/减速度受车辆能力限制", u2.accelCmd);
  }());
  /* ============ 8. 场景级闭环断言 ============ */
  const scenarioReports = [];
  (function testScenarios() {
    for (let i = 0; i < A.scenarios.list.length; i++) {
      const scene = A.scenarios.list[i];
      const sim = A.Sim.createSimulation(scene, { dt: 0.05, seed: 20260917 });
      const steps = scene.steps || 620;
      for (let k = 0; k < steps; k++) sim.step();
      const s = sim.summary();
      const a = scene.assert || {};
      const tag = "scenario/" + scene.id + " ";
      ok(s.collisions <= (a.maxCollisions || 0), tag + "无碰撞", "collisions=" + s.collisions);
      ok(s.minClearance >= (a.minMinClearance || 0),
        tag + "最小间隙 ≥ " + (a.minMinClearance || 0) + " m", s.minClearance + " m");
      if (a.maxAbsAccel !== undefined) {
        ok(s.maxAbsAccel <= a.maxAbsAccel, tag + "最大加速度 ≤ " + a.maxAbsAccel + " m/s²", s.maxAbsAccel);
      }
      if (a.minDistance !== undefined) {
        ok(s.distance >= a.minDistance, tag + "行驶距离 ≥ " + a.minDistance + " m", s.distance + " m");
      }
      if (a.requireStates) {
        const hit = a.requireStates.some(function (st) { return (s.stateRatio[st] || 0) > 0.001; });
        ok(hit, tag + "出现预期状态 " + a.requireStates.join("/"), JSON.stringify(s.stateRatio));
      }
      scenarioReports.push({ id: scene.id, title: scene.title, summary: s, assert: a });
    }
  }());

  /* ============ 报告输出 ============ */
  function report() {
    const failed = results.filter(function (r) { return !r.pass; });
    const pass = failed.length === 0;
    if (typeof console === "undefined") return pass;
    console.log("");
    console.log("ADSim 自检报告 · " + (pass ? "全部通过" : "存在失败"));
    console.log("断言 " + results.length + " 条：通过 " + (results.length - failed.length) + "，失败 " + failed.length);
    console.log("");
    let group = "";
    for (const r of results) {
      const seg = r.name.split("/");
      if (seg[0] !== group) { group = seg[0]; console.log("── " + group); }
      console.log("   " + (r.pass ? "[PASS]" : "[FAIL]") + " " + (seg[1] || r.name) +
        (r.detail ? "   [" + r.detail + "]" : ""));
    }
    console.log("");
    console.log("── 场景闭环指标（每场景 520~620 步，dt=0.05 s）");
    for (const sc of scenarioReports) {
      const s = sc.summary;
      console.log("   " + sc.title + "：" +
        "碰撞 " + s.collisions + "｜最小间隙 " + s.minClearance + " m｜最小 TTC " +
        (s.minTTC === null ? "-" : s.minTTC + " s") + "｜最大|a| " + s.maxAbsAccel + " m/s²｜最大 jerk " +
        s.maxAbsJerk + " m/s³｜里程 " + s.distance + " m｜状态切换 " + s.stateSwitches + " 次");
    }
    console.log("");
    return pass;
  }

  return {
    results: results, report: report, scenarios: scenarioReports,
    summary: function () { return results; }
  };
});
