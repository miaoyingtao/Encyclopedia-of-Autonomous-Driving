/* ADSim - 预测模块
 * 对每条跟踪轨迹生成多模态未来轨迹：CTRV 运动学推演 × 行为假设
 * （保持车道 / 减速 / 变道），概率由运动学证据归一化得到。
 * 对应概念卡：prediction；正本页：pages/tech/decision.html
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  const PREDICT_DEFAULT = {
    horizon: 3.0,        // 预测时域（s）
    dt: 0.2,             // 预测步长（s）
    decelMode: -1.8,     // “减速”假设的加速度（m/s²）
    laneChangeOffset: 3.5
  };

  /** 单模态 CTRV 推演：从 (x,y,yaw,v,yawRate,accel) 推出未来轨迹 */
  function rollout(pose, cfg) {
    const c = Object.assign({}, PREDICT_DEFAULT, cfg || {});
    const traj = [];
    let x = pose.x, y = pose.y, yaw = pose.yaw, v = pose.v;
    const yawRate = pose.yawRate || 0, accel = pose.accel || 0;
    traj.push({ t: 0, x: x, y: y, yaw: yaw, v: v });
    const steps = Math.round(c.horizon / c.dt);
    for (let i = 1; i <= steps; i++) {
      const dt = c.dt;
      v = Math.max(0, v + accel * dt);
      yaw = M.normAngle(yaw + yawRate * dt);
      x += v * Math.cos(yaw) * dt;
      y += v * Math.sin(yaw) * dt;
      traj.push({ t: i * dt, x: x, y: y, yaw: yaw, v: v });
    }
    return traj;
  }

  /** 单模态“变道”：横向按五次多项式平移，纵向保持 */
  function laneChangeRollout(pose, cfg, targetOffset) {
    const c = Object.assign({}, PREDICT_DEFAULT, cfg || {});
    const lat = M.quintic(0, 0, 0, targetOffset, 0, 0, Math.min(c.horizon, 2.4));
    const traj = [];
    const steps = Math.round(c.horizon / c.dt);
    const T = Math.min(c.horizon, 2.4);
    for (let i = 0; i <= steps; i++) {
      const t = i * c.dt;
      const tc = Math.min(t, T);
      const offset = M.polyEval(lat, tc);
      const v = Math.max(0, pose.v + (pose.accel || 0) * t);
      const along = pose.v * t + 0.5 * (pose.accel || 0) * t * t;
      const yaw = pose.yaw + (M.polyEval(M.polyDeriv(lat), tc) || 0);
      traj.push({
        t: t,
        x: pose.x + Math.cos(pose.yaw) * along - Math.sin(pose.yaw) * offset,
        y: pose.y + Math.sin(pose.yaw) * along + Math.cos(pose.yaw) * offset,
        yaw: yaw, v: v
      });
    }
    return traj;
  }

  /** 由 track 状态构造位姿 */
  function trackPose(tr) {
    const v = Math.hypot(tr.vx, tr.vy);
    return {
      x: tr.x, y: tr.y,
      yaw: (tr.yaw !== undefined && tr.yaw !== null) ? tr.yaw : Math.atan2(tr.vy, tr.vx),
      v: v, yawRate: tr.yawRate || 0, accel: 0
    };
  }

  /** 行为假设权重（越符合当前运动学证据的假设权重越高） */
  function modeWeights(tr, road) {
    const v = Math.hypot(tr.vx, tr.vy);
    const proj = road ? M.projectOnPath({ x: tr.x, y: tr.y }, road.ref) : { d: 0 };
    const lateralOffset = proj.d - (tr.laneCenter !== undefined ? tr.laneCenter : proj.d);
    const movingTowardSide = Math.abs(lateralOffset) > 0.45;
    const fastEnough = v > 3.0;
    const w = { keep: 1.0, decel: v > 5 ? 0.35 : 0.15, laneChange: 0 };
    if (movingTowardSide && fastEnough) w.laneChange = 0.5;
    const sum = w.keep + w.decel + w.laneChange;
    return {
      keep: w.keep / sum, decel: w.decel / sum, laneChange: w.laneChange / sum,
      lateralOffset: lateralOffset
    };
  }
  /** 多模态预测：返回 [{trackId, modes:[{name, prob, traj}], primary, sigma}] */
  function predict(tracks, ctx) {
    const c = Object.assign({}, PREDICT_DEFAULT, (ctx && ctx.cfg) || {});
    const road = ctx && ctx.road;
    const out = [];
    for (let i = 0; i < tracks.length; i++) {
      const tr = tracks[i];
      const pose = trackPose(tr);
      const w = modeWeights(tr, road);
      const modes = [];
      modes.push({ name: "keep", prob: w.keep, traj: rollout(pose, c) });
      if (w.decel > 0.02) {
        modes.push({
          name: "decel", prob: w.decel,
          traj: rollout(Object.assign({}, pose, { accel: c.decelMode }), c)
        });
      }
      if (w.laneChange > 0.02) {
        // 横向偏移偏离车道中心越多，越可能朝该侧变道
        const dir = w.lateralOffset >= 0 ? 1 : -1;
        modes.push({
          name: "laneChange", prob: w.laneChange,
          traj: laneChangeRollout(pose, c, dir * c.laneChangeOffset)
        });
      }
      let sum = 0;
      for (let k = 0; k < modes.length; k++) sum += modes[k].prob;
      for (let k = 0; k < modes.length; k++) modes[k].prob /= (sum || 1);

      let primary = modes[0];
      for (let k = 1; k < modes.length; k++) if (modes[k].prob > primary.prob) primary = modes[k];

      // 轨迹末位置与总不确定度（随预测时长增长）
      out.push({
        trackId: tr.id, modes: modes, primary: primary,
        v: Math.hypot(tr.vx, tr.vy),
        sigma: 0.3 + 0.5 * c.horizon * 0.3,
        footprint: tr.size || { length: 4.6, width: 1.9 }
      });
    }
    return out;
  }

  /** 供规划使用：把预测轨迹按时间采样为占用圆集合（保守膨胀） */
  function toFootprints(pred, dtSample, inflate) {
    const dt = dtSample || 0.4;
    const extra = inflate === undefined ? 0.35 : inflate;
    const out = [];
    for (let i = 0; i < pred.modes.length; i++) {
      const mode = pred.modes[i];
      if (mode.prob < 0.15) continue;             // 低概率模态不计入硬约束
      const r = Math.min(pred.footprint.width, pred.footprint.length) / 2 + extra;
      const pts = [];
      for (let k = 0; k < mode.traj.length; k++) {
        const s = mode.traj[k];
        if (s.t % dt > 1e-6 && Math.abs((s.t % dt)) > 1e-6) continue;
        pts.push({ t: s.t, x: s.x, y: s.y, r: r });
      }
      out.push({ trackId: pred.trackId, mode: mode.name, prob: mode.prob, circles: pts });
    }
    return out;
  }

  return { PREDICT_DEFAULT, rollout, laneChangeRollout, trackPose, modeWeights, predict, toFootprints };
});

