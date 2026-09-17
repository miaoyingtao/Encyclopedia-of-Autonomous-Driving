/* ADSim - 评估指标模块
 * 记录闭环运行的客观指标：碰撞、最小间隙、TTC、加速度/冲击、跟踪误差、状态占比。
 * 注意：本模块是“评分器”，允许使用世界真值——但它不参与控制链路。
 * 对应概念卡：takeover-rate、ttc；正本页：pages/challenges/testing.html
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  function createMetrics() {
    const s = {
      steps: 0, time: 0,
      collisions: 0, minClearance: Infinity, collisionEvents: [],
      minTTC: Infinity, minGap: Infinity,
      maxAbsAccel: 0, maxAbsJerk: 0, sumAbsAccel: 0, sumAbsJerk: 0, accelSamples: 0,
      trackErrSum: 0, trackErrCount: 0,
      distance: 0, prevSpeed: null, prevAccel: 0,
      stateCount: {}, stateSwitches: 0, lastState: null,
      planFeasible: 0, planInfeasible: 0
    };

    return {
      state: s,
      /** 每步记录。gt: {actors: 世界真值障碍, ego, obstacles()} */
      record: function (rec) {
        s.steps++;
        s.time += rec.dt;

        // 行驶距离与加速度/冲击
        if (rec.prevEgo) s.distance += M.V.dist({ x: rec.ego.x, y: rec.ego.y },
          { x: rec.prevEgo.x, y: rec.prevEgo.y });
        const a = rec.ego.a || 0;
        s.maxAbsAccel = Math.max(s.maxAbsAccel, Math.abs(a));
        s.sumAbsAccel += Math.abs(a); s.accelSamples++;
        if (s.prevAccel !== null && rec.dt > 0) {
          const jerk = Math.abs(a - s.prevAccel) / rec.dt;
          s.maxAbsJerk = Math.max(s.maxAbsJerk, jerk);
          s.sumAbsJerk += jerk;
        }
        s.prevAccel = a;

        // 碰撞与最小间隙（真值评分）
        const egoRect = M.rectCorners(rec.ego.x, rec.ego.y, rec.ego.length, rec.ego.width, rec.ego.yaw);
        let stepMin = Infinity;
        for (let i = 0; i < rec.truth.length; i++) {
          const o = rec.truth[i];
          const oc = o.corners();
          const d = rectDistance(egoRect, oc);
          if (d < stepMin) stepMin = d;
          if (d < -COLLISION_DEPTH) {
            s.collisions++;
            s.collisionEvents.push({ t: +s.time.toFixed(2), actor: o.id || o.kind, depth: +(-d).toFixed(3) });
            break;
          }
        }
        if (stepMin < s.minClearance) s.minClearance = stepMin;

        // 安全裕度：与最近前车的 TTC / 间距
        const lead = rec.lead;
        if (lead) {
          if (isFinite(lead.ttc) && lead.ttc < s.minTTC) s.minTTC = lead.ttc;
          if (lead.gap < s.minGap) s.minGap = lead.gap;
        }

        // 跟踪误差：每个真值车辆 → 最近 track 的距离
        for (let i = 0; i < rec.truth.length; i++) {
          const o = rec.truth[i];
          if (o.kind === "cone" || o.isStatic) continue;
          let best = Infinity;
          for (let k = 0; k < rec.tracks.length; k++) {
            const d = M.V.dist({ x: o.veh.x, y: o.veh.y }, { x: rec.tracks[k].x, y: rec.tracks[k].y });
            if (d < best) best = d;
          }
          if (isFinite(best) && best < 8) { s.trackErrSum += best; s.trackErrCount++; }
        }

        // 决策状态占比
        if (rec.decisionName) {
          s.stateCount[rec.decisionName] = (s.stateCount[rec.decisionName] || 0) + 1;
          if (s.lastState && s.lastState !== rec.decisionName) s.stateSwitches++;
          s.lastState = rec.decisionName;
        }
        if (rec.plan) {
          if (rec.plan.feasible > 0) s.planFeasible++; else s.planInfeasible++;
        }
      },

      summary: function () {
        const states = {};
        const total = s.steps || 1;
        for (const k in s.stateCount) states[k] = +(s.stateCount[k] / total).toFixed(3);
        return {
          steps: s.steps, time: +s.time.toFixed(2), distance: +s.distance.toFixed(1),
          collisions: s.collisions,
          collisionEvents: s.collisionEvents.slice(0, 6),
          minClearance: +s.minClearance.toFixed(3),
          minTTC: isFinite(s.minTTC) ? +s.minTTC.toFixed(2) : null,
          minGap: isFinite(s.minGap) ? +s.minGap.toFixed(2) : null,
          maxAbsAccel: +s.maxAbsAccel.toFixed(2),
          meanAbsAccel: +(s.sumAbsAccel / Math.max(1, s.accelSamples)).toFixed(2),
          maxAbsJerk: +s.maxAbsJerk.toFixed(2),
          meanAbsJerk: +(s.sumAbsJerk / Math.max(1, s.accelSamples)).toFixed(2),
          meanTrackErr: s.trackErrCount ? +(s.trackErrSum / s.trackErrCount).toFixed(3) : null,
          stateRatio: states, stateSwitches: s.stateSwitches,
          planFeasibleRatio: +(s.planFeasible / total).toFixed(3)
        };
      }
    };
  }

  /** 两个有向矩形的相对距离（SAT）：
   *  分离时返回最近距离（正）；相交时返回负的重叠深度。
   *  判定口径：重叠深度 > collisionDepth（默认 5 cm）才算“碰撞”，
   *  这与真实系统“擦边 vs 实质接触”的区分一致。 */
  function rectDistance(A, B) {
    const axes = [];
    for (let k = 0; k < 2; k++) {
      const poly = k === 0 ? A : B;
      for (let i = 0; i < 4; i++) {
        const p1 = poly[i], p2 = poly[(i + 1) % 4];
        const ex = p2.x - p1.x, ey = p2.y - p1.y;
        const len = Math.hypot(ex, ey) || 1;
        axes.push({ x: -ey / len, y: ex / len });
      }
    }
    let sep = Infinity, minOverlap = Infinity;
    for (let a = 0; a < axes.length; a++) {
      const ax = axes[a];
      let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
      for (let i = 0; i < 4; i++) {
        const dA = A[i].x * ax.x + A[i].y * ax.y;
        const dB = B[i].x * ax.x + B[i].y * ax.y;
        if (dA < minA) minA = dA; if (dA > maxA) maxA = dA;
        if (dB < minB) minB = dB; if (dB > maxB) maxB = dB;
      }
      const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
      if (overlap < 0) { if (-overlap < sep) sep = -overlap; }
      else if (overlap < minOverlap) minOverlap = overlap;
    }
    if (isFinite(sep)) return sep;      // 分离
    return -minOverlap;                 // 相交：负的重叠深度
  }

  const COLLISION_DEPTH = 0.05;         // 实质接触阈值（m）

  return { createMetrics, rectDistance, COLLISION_DEPTH };
});
