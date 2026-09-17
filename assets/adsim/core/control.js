/* ADSim - 控制模块
 * 横向：Pure Pursuit（前视距离随车速自适应）→ 期望前轮转角
 * 纵向：PID（含积分限幅与抗饱和）→ 期望加速度
 * 对应概念卡：mpc、actuator-latency；正本页：pages/tech/control.html
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  const CONTROL_DEFAULT = {
    lookaheadBase: 4.2,   // 前视距离 = base + gain × v
    lookaheadGain: 0.6,
    minLookahead: 4.0,
    maxLookahead: 14.0,
    kp: 1.1, ki: 0.35, kd: 0.06,
    integralLimit: 6.0,
    maxSteer: 0.55,
    maxAccel: 3.0, maxDecel: -6.0
  };

  /** Pure Pursuit：在轨迹上取前视点，由几何关系求前轮转角 */
  function purePursuit(traj, ego, cfg) {
    const c = Object.assign({}, CONTROL_DEFAULT, cfg || {});
    const ld = M.clamp(c.lookaheadBase + c.lookaheadGain * ego.v, c.minLookahead, c.maxLookahead);
    let acc = 0, target = traj[traj.length - 1], prev = { x: ego.x, y: ego.y };
    for (let i = 0; i < traj.length; i++) {
      acc += Math.hypot(traj[i].x - prev.x, traj[i].y - prev.y);
      prev = traj[i];
      if (acc >= ld) { target = traj[i]; break; }
    }
    const dx = target.x - ego.x, dy = target.y - ego.y;
    const dist = Math.max(0.5, Math.hypot(dx, dy));
    const alpha = M.angleDiff(Math.atan2(dy, dx), ego.yaw);
    const steer = Math.atan2(2 * ego.wheelbase * Math.sin(alpha), dist);
    const maxSteer = (ego.cfg && ego.cfg.maxSteer) || c.maxSteer;
    return {
      steerCmd: M.clamp(steer, -maxSteer, maxSteer),
      lookahead: ld, alpha: alpha, target: { x: target.x, y: target.y }
    };
  }

  /** PID 纵向速度控制（state 由调用方持有，跨步保留） */
  function speedController(targetSpeed, v, dt, st, cfg) {
    const c = Object.assign({}, CONTROL_DEFAULT, cfg || {});
    const err = targetSpeed - v;
    st.integral = M.clamp(st.integral + err * dt, -c.integralLimit, c.integralLimit);
    const deriv = (err - st.prevErr) / Math.max(1e-4, dt);
    st.prevErr = err;
    const u = c.kp * err + c.ki * st.integral + c.kd * deriv;
    // 抗积分饱和：输出饱和且误差同号时停止积分累积
    const sat = M.clamp(u, c.maxDecel, c.maxAccel);
    if (Math.abs(u - sat) > 1e-6 && err * (u - sat) > 0) st.integral -= err * dt;
    return {
      accelCmd: sat, err: err,
      parts: { p: c.kp * err, i: c.ki * st.integral, d: c.kd * deriv }
    };
  }

  /** 控制总成：横向 + 纵向，输出到车辆的执行器指令 */
  function createController(cfg) {
    const c = Object.assign({}, CONTROL_DEFAULT, cfg || {});
    const st = { integral: 0, prevErr: 0 };
    return {
      cfg: c, state: st,
      reset: function () { st.integral = 0; st.prevErr = 0; },
      /** ctx: {traj(最优轨迹), ego, targetSpeed, dt} → {steerCmd, accelCmd, debug} */
      compute: function (ctx) {
        const lat = purePursuit(ctx.traj, ctx.ego, c);
        const lon = speedController(ctx.targetSpeed, ctx.ego.v, ctx.dt, st, c);
        return {
          steerCmd: lat.steerCmd,
          accelCmd: lon.accelCmd,
          debug: {
            lookahead: lat.lookahead, alpha: lat.alpha,
            speedErr: lon.err, pidParts: lon.parts,
            targetPoint: lat.target
          }
        };
      }
    };
  }

  return { CONTROL_DEFAULT, purePursuit, speedController, createController };
});
