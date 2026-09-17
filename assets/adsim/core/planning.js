/* ADSim - 运动规划模块
 * Frenet 采样：横向偏移 × 速度档组合生成候选轨迹 → 碰撞检查 → 多目标代价评估 → 选最优。
 * 对应概念卡：frenet、mpc；正本页：pages/tech/decision.html
 * 约定：只使用感知/预测输出（目标轨迹与占用），不使用世界真值。
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  const PLAN_DEFAULT = {
    horizon: 3.0,          // 规划时域（s）
    dt: 0.2,               // 采样步长（s）
    lateralOffsets: [-1.75, -0.875, 0, 0.875, 1.75],  // 相对“目标车道中心”的横向偏移（m）
    speedOffsets: [-3.0, -1.5, 0, 1.5],           // 相对决策目标速度的偏移（m/s）
    egoRadiusMargin: 0.25, // 自车碰撞圆的额外膨胀（m）
    clearanceWarn: 0.5,    // 最小间隙告警阈值（m）：越小则越少为“避险”而牺牲车道一致性
    lateralTime: 2.0,      // 横向到达目标车道所需时间（s）
    weights: {
      safety: 12.0,        // 安全（间隙越小惩罚越大；侵入即重罚）
      lateral: 0.25,       // 横向加速度（舒适；权重过大将压过决策的变道意图）
      jerk: 0.4,           // 纵向冲击（舒适）
      efficiency: 1.0,     // 与目标速度的偏差
      laneBias: 2.5,       // 偏离决策目标车道的惩罚（要足够强，否则变道会“爬行”）
      boundary: 8.0        // 越过道路边界
    }
  };

  /** 生成候选轨迹簇。ctx: {ego, road, targetSpeed, targetLane, footprints} */
  function generateCandidates(ctx, cfg) {
    const c = Object.assign({}, PLAN_DEFAULT, cfg || {});
    const road = ctx.road, ego = ctx.ego;
    const proj = M.projectOnPath({ x: ego.x, y: ego.y }, road.ref);
    const s0 = proj.s, d0 = proj.d;
    const d0v = ctx.lateralSpeed || 0;   // 当前横向速度：否则每步都从 0 重新起步，变道会“爬行”
    const v0 = ego.v, a0 = ego.a || 0;
    const T = c.horizon;
    const steps = Math.round(T / c.dt);
    const laneCenterD = road.laneCenters[ctx.targetLane] !== undefined ? road.laneCenters[ctx.targetLane] : 0;

    const out = [];
    for (let li = 0; li < c.lateralOffsets.length; li++) {
      for (let si = 0; si < c.speedOffsets.length; si++) {
        const vTarget = Math.max(0, ctx.targetSpeed + c.speedOffsets[si]);
        // 纵向：s(t) 五次多项式，末端速度 = vTarget
        const s1 = s0 + Math.max(2.0, (v0 + vTarget) / 2 * T);
        const sPoly = M.quintic(s0, v0, a0, s1, vTarget, 0, T);
        // 横向：d(t) 五次多项式到“目标车道中心 + 相对偏移”
        // 横向到达时间短于纵向时域，避免滚动重规划导致的横向收敛过慢
        const dTarget = laneCenterD + c.lateralOffsets[li];
        const Td = Math.min(T, c.lateralTime || 2.0);
        const dPoly = M.quintic(d0, d0v, 0, dTarget, 0, 0, Td);

        const traj = [];
        for (let k = 0; k <= steps; k++) {
          const t = k * c.dt;
          const s = M.polyEval(sPoly, t), d = M.polyEval(dPoly, t);
          const v = M.polyEval(M.polyDeriv(sPoly), t);
          const a = M.polyEval(M.polyDeriv2(sPoly), t);
          const ref = M.samplePath(road.ref, s);
          traj.push({
            t: t, s: s, d: d, v: v, a: a,
            x: ref.x - d * Math.sin(ref.yaw),
            y: ref.y + d * Math.cos(ref.yaw),
            yaw: M.normAngle(ref.yaw + Math.atan2(M.polyEval(M.polyDeriv(dPoly), t), Math.max(v, 0.1)))
          });
        }
        out.push({
          id: "d" + c.lateralOffsets[li] + "_v" + c.speedOffsets[si],
          lateral: dTarget, lateralOffset: c.lateralOffsets[li], speedOffset: c.speedOffsets[si],
          vTarget: vTarget, traj: traj, laneError: Math.abs(c.lateralOffsets[li])
        });
      }
    }
    return out;
  }
  /** 在轨迹上按时间线性插值取自车位置 */
  function poseAt(traj, t) {
    if (t <= traj[0].t) return traj[0];
    for (let i = 1; i < traj.length; i++) {
      if (traj[i].t >= t) {
        const a = traj[i - 1], b = traj[i];
        const k = (t - a.t) / Math.max(1e-6, b.t - a.t);
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, t: t, v: a.v + (b.v - a.v) * k };
      }
    }
    return traj[traj.length - 1];
  }

  /** 碰撞检查：自车包络圆 × 预测占用圆（按时间对齐） */
  function checkCollision(traj, footprints, egoHalfWidth, margin) {
    const rEgo = egoHalfWidth + margin;
    let minClearance = Infinity, worstT = 0, collided = false;
    for (let i = 0; i < footprints.length; i++) {
      const circles = footprints[i].circles;
      for (let k = 0; k < circles.length; k++) {
        const cst = circles[k];
        if (cst.t > traj[traj.length - 1].t) continue;
        const ep = poseAt(traj, cst.t);
        const dist = Math.hypot(ep.x - cst.x, ep.y - cst.y);
        const clearance = dist - cst.r - rEgo;
        if (clearance < minClearance) { minClearance = clearance; worstT = cst.t; }
        if (clearance < 0) collided = true;
      }
    }
    return {
      collided: collided,
      minClearance: isFinite(minClearance) ? minClearance : 99,
      worstT: worstT
    };
  }

  /** 多目标代价：安全 / 舒适 / 效率 / 车道一致 / 边界 */
  function cost(cand, ctx, cfg) {
    const c = Object.assign({}, PLAN_DEFAULT, cfg || {});
    const w = c.weights;
    const tr = cand.traj;
    let aLatMax = 0, jerkSum = 0, prevA = null, vDevSum = 0;
    for (let i = 0; i < tr.length; i++) {
      const v = tr[i].v;
      // 横向加速度 a_lat ≈ d²d/dt²（中心差分）：与横向偏移真正相关，
      // 保持车道与变道 3.5 m 会得到不同的代价（旧实现是常数近似，形同虚设）
      let aLat = 0;
      if (i > 0 && i + 1 < tr.length) {
        aLat = Math.abs(tr[i + 1].d - 2 * tr[i].d + tr[i - 1].d) / (c.dt * c.dt);
      }
      if (aLat > aLatMax) aLatMax = aLat;
      if (prevA !== null) jerkSum += Math.abs(tr[i].a - prevA) / c.dt;
      prevA = tr[i].a;
      vDevSum += Math.abs(v - ctx.targetSpeed);
    }
    const n = tr.length;
    const last = tr[n - 1];
    const boundaryLimitLeft = 0.3;
    const boundaryLimitRight = ctx.road.laneWidth * ctx.road.laneCenters.length - 0.3;
    const boundaryViolation = Math.max(0, boundaryLimitLeft - last.d, last.d - boundaryLimitRight);

    const safety = cand.collision.collided
      ? 1000 + 100 * Math.max(0, -cand.collision.minClearance)
      : w.safety * Math.pow(Math.max(0, c.clearanceWarn + 0.6 - cand.collision.minClearance), 2);

    const parts = {
      safety: safety,
      lateral: w.lateral * aLatMax,
      jerk: w.jerk * (jerkSum / n),
      efficiency: w.efficiency * (vDevSum / n),
      lane: w.laneBias * cand.laneError,
      boundary: w.boundary * boundaryViolation * boundaryViolation * 20
    };
    let total = 0;
    for (const k in parts) total += parts[k];
    return { total: total, parts: parts };
  }

  /** 完整规划：采样 → 碰撞检查 → 代价评估 → 选最优 */
  function plan(ctx, cfg) {
    const c = Object.assign({}, PLAN_DEFAULT, cfg || {});
    const cands = generateCandidates(ctx, c);
    const egoHalfWidth = (ctx.ego.width || 1.9) / 2;
    for (let i = 0; i < cands.length; i++) {
      cands[i].collision = checkCollision(cands[i].traj, ctx.footprints || [], egoHalfWidth, c.egoRadiusMargin);
      const cst = cost(cands[i], ctx, c);
      cands[i].cost = cst.total;
      cands[i].costParts = cst.parts;
    }
    let best = null;
    for (let i = 0; i < cands.length; i++) {
      if (!best || cands[i].cost < best.cost) best = cands[i];
    }
    return {
      best: best, candidates: cands,
      feasible: cands.filter(function (x) { return !x.collision.collided; }).length,
      total: cands.length
    };
  }

  return { PLAN_DEFAULT, generateCandidates, poseAt, checkCollision, cost, plan };
});

