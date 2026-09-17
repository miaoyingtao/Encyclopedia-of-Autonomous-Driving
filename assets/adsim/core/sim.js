/* ADSim - 闭环仿真主循环
 * 每个仿真步依次执行：世界推进 → 感知 → 预测 → 决策 → 规划 → 控制 → 车辆积分 → 评估
 * 真值隔离：世界真值仅用于感知扫描与指标评分；决策与规划只接收 track / prediction 输出。
 * 定位：本闭环假设“理想定位”（ego 位姿由里程计精确给出），定位误差不在范围内。
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const A = isNode ? {
    M: require("./math.js"),
    World: require("./world.js"),
    Perception: require("./perception.js"),
    Prediction: require("./prediction.js"),
    Decision: require("./decision.js"),
    Planning: require("./planning.js"),
    Control: require("./control.js"),
    Metrics: require("./metrics.js")
  } : (root.ADSim || {});
  const mod = factory(A);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (A) {
  "use strict";
  const M = A.M;
  const now = (typeof performance !== "undefined" && performance.now)
    ? function () { return performance.now(); }
    : function () { return Date.now(); };

  const SIM_DEFAULT = { dt: 0.05, seed: 20260917, maxSteps: 1200 };

  function createSimulation(scene, opts) {
    const cfg = Object.assign({}, SIM_DEFAULT, opts || {});
    const dt = cfg.dt;
    const rng = M.Rng(cfg.seed);
    let world = null, tracker = null, decider = null, controller = null, metrics = null;
    let time = 0, steps = 0;

    function reset() {
      world = A.World.createWorld(scene);
      tracker = A.Perception.createTracker(scene.tracker || {});
      decider = A.Decision.createDecider(scene.decision || {});
      controller = A.Control.createController(scene.control || {});
      metrics = A.Metrics.createMetrics();
      time = 0; steps = 0;
    }
    reset();

    /** 执行一个仿真步，返回该步的完整数据（供渲染与评估） */
    function step() {
      const t0 = now();
      const scanCfg = scene.lidar || {};
      const speedLimit = scene.speedLimit || 13.9;

      // ① 世界推进（其他交通参与者）
      world.advance(dt);

      // ② 感知：射线扫描 → 聚类 → 检测 → 跟踪（卡尔曼 + 匈牙利）
      const points = A.Perception.scan(world.ego, world.obstacles(), scanCfg, rng);
      const clusters = A.Perception.cluster(points, scanCfg);
      const detections = A.Perception.toDetections(clusters);
      tracker.step(dt, detections, time);
      const tracks = tracker.tracks.filter(function (t) { return t.confirmed; });
      const tPerception = now() - t0;

      // ③ 预测：多模态轨迹
      const t1 = now();
      const predictions = A.Prediction.predict(tracks, { road: world.road });
      let footprints = [];
      for (let i = 0; i < predictions.length; i++) {
        footprints = footprints.concat(A.Prediction.toFootprints(predictions[i], 0.4, 0.35));
      }
      const tPrediction = now() - t1;

      // ④ 决策：有限状态机（只用 tracks / predictions）
      const t2 = now();
      const egoEstimate = {
        x: world.ego.x, y: world.ego.y, yaw: world.ego.yaw, v: world.ego.v, a: world.ego.a,
        length: world.ego.length, width: world.ego.width,
        wheelbase: world.ego.wheelbase, cfg: world.ego.cfg
      };
      const decision = decider.update({
        ego: egoEstimate, tracks: tracks, road: world.road, time: time, dt: dt, speedLimit: speedLimit
      });
      const tDecision = now() - t2;

      // ⑤ 规划：Frenet 采样 + 碰撞检查 + 代价评估
      const t3 = now();
      // 当前横向速度（相对参考线）：供规划作为横向轨迹的初速度，避免变道爬行
      const egoProj = M.projectOnPath({ x: egoEstimate.x, y: egoEstimate.y }, world.road.ref);
      const egoTanYaw = Math.atan2(egoProj.tangent.y, egoProj.tangent.x);
      const egoLateralSpeed = egoEstimate.v * Math.sin(M.angleDiff(egoEstimate.yaw, egoTanYaw));
      const plan = A.Planning.plan({
        ego: { x: egoEstimate.x, y: egoEstimate.y, yaw: egoEstimate.yaw, v: egoEstimate.v, a: egoEstimate.a, width: world.ego.width },
        road: world.road, targetSpeed: decision.targetSpeed, targetLane: decision.targetLane,
        lateralSpeed: egoLateralSpeed,
        footprints: footprints
      }, scene.planning || {});
      const tPlanning = now() - t3;

      // ⑥ 控制：Pure Pursuit + PID
      const t4 = now();
      const command = controller.compute({
        traj: plan.best.traj, ego: egoEstimate, targetSpeed: decision.targetSpeed, dt: dt
      });
      const tControl = now() - t4;

      // ⑦ 车辆模型积分（执行器延迟在内部模拟）
      const prevEgo = { x: world.ego.x, y: world.ego.y, yaw: world.ego.yaw };
      world.ego.steerCmd = command.steerCmd;
      world.ego.accelCmd = command.accelCmd;
      world.ego.step(dt);

      // ⑧ 评估（允许使用真值，仅用于评分）
      metrics.record({
        dt: dt, ego: world.ego, prevEgo: prevEgo,
        truth: world.obstacles(), tracks: tracks,
        lead: decision.lead, decisionName: decision.name, plan: plan
      });

      time += dt; steps++;

      return {
        time: time, dt: dt, stepIndex: steps,
        points: points, clusters: clusters, detections: detections,
        tracks: tracks, predictions: predictions,
        decision: decision, plan: plan, command: command,
        world: world,
        timings: {
          perception: tPerception, prediction: tPrediction,
          decision: tDecision, planning: tPlanning, control: tControl,
          total: now() - t0
        }
      };
    }

    return {
      step: step, reset: reset,
      get world() { return world; },
      get tracker() { return tracker; },
      get decider() { return decider; },
      get time() { return time; },
      get steps() { return steps; },
      /** 跑到结束或 maxSteps，返回指标摘要 */
      run: function (maxSteps) {
        const limit = maxSteps || cfg.maxSteps;
        let last = null;
        for (let i = 0; i < limit; i++) last = step();
        return { summary: metrics.summary(), last: last };
      },
      summary: function () { return metrics.summary(); }
    };
  }

  return { SIM_DEFAULT, createSimulation, _now: now };
});
