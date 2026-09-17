/* ADSim - 世界模型与车辆动力学
 * 运动学自行车模型 + 执行器一阶延迟；他车使用 IDM 跟车模型与脚本化行为。
 * 对应概念卡：mpc（车辆模型）、actuator-latency；正本页：pages/tech/control.html
 * 说明：ego 的真值状态只用于渲染与评分；决策/规划只接收感知输出。
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  const DEFAULT_VEHICLE = {
    length: 4.8, width: 1.9, wheelbase: 2.8,
    maxSteer: 0.55,                 // rad（约 31°）
    maxAccel: 3.0, maxDecel: -6.0,
    maxSpeed: 18.0,
    steerTau: 0.18, accelTau: 0.35, // 执行器一阶延迟时间常数（s）
    minGap: 2.0, idmT: 1.6, idmA: 1.5, idmB: 2.0
  };

  function createVehicle(cfg) {
    const c = Object.assign({}, DEFAULT_VEHICLE, cfg || {});
    return {
      cfg: c,
      x: 0, y: 0, yaw: 0, v: 0, a: 0, yawRate: 0, steer: 0,
      steerCmd: 0, accelCmd: 0,
      length: c.length, width: c.width, wheelbase: c.wheelbase,

      /** 运动学自行车模型：yawRate = v/L · tan(δ)，含执行器一阶延迟 */
      step: function (dt) {
        this.steer += (this.steerCmd - this.steer) * Math.min(1, dt / c.steerTau);
        this.a += (this.accelCmd - this.a) * Math.min(1, dt / c.accelTau);
        this.steer = M.clamp(this.steer, -c.maxSteer, c.maxSteer);
        this.a = M.clamp(this.a, c.maxDecel, c.maxAccel);
        this.v = M.clamp(this.v + this.a * dt, 0, c.maxSpeed);
        if (this.v < 0.05 && this.a < 0) this.a = 0;
        this.yawRate = this.v / c.wheelbase * Math.tan(this.steer);
        this.x += this.v * Math.cos(this.yaw) * dt;
        this.y += this.v * Math.sin(this.yaw) * dt;
        this.yaw = M.normAngle(this.yaw + this.yawRate * dt);
        return this;
      },
      corners: function () {
        return M.rectCorners(this.x, this.y, this.length, this.width, this.yaw);
      },
      pose: function () { return { x: this.x, y: this.y, yaw: this.yaw, v: this.v }; }
    };
  }

  /* ---------- IDM 智能驾驶员模型：他车的跟车纵向行为 ---------- */
  /** v 自身速度、vLead 前车速度、gap 净间距 → 期望加速度 */
  function idmAccel(v, vLead, gap, c) {
    const v0 = c.vDesired !== undefined ? c.vDesired : c.maxSpeed;
    const dv = v - vLead;
    const sStar = c.minGap + Math.max(0, v * c.idmT + v * dv / (2 * Math.sqrt(c.idmA * c.idmB)));
    const free = 1 - Math.pow(v / Math.max(v0, 0.1), 4);
    const interact = gap > 0.1 ? Math.pow(sStar / gap, 2) : 4;
    return c.idmA * (free - interact);
  }
  /* ---------- 交通参与者 ---------- */
  /** spec: {id, kind, x, y, yaw, speed, desiredSpeed, policy, script, radius, vehicle} */
  function createActor(spec) {
    const veh = createVehicle(spec.vehicle || {});
    veh.x = spec.x; veh.y = spec.y; veh.yaw = spec.yaw || 0; veh.v = spec.speed || 0;
    veh.cfg.vDesired = spec.desiredSpeed !== undefined ? spec.desiredSpeed : (spec.speed || 8);
    return {
      kind: spec.kind || "vehicle",       // vehicle | pedestrian
      id: spec.id || "actor",
      policy: spec.policy || "constant",  // constant | idm
      script: spec.script || [],          // [{t, speed?, yaw?}]
      radius: spec.radius || 0.45,
      alive: true,
      veh: veh,
      _scripted: 0,
      isStatic: spec.kind === "cone" || spec.kind === "barrier",
      corners: function () {
        if (this.kind === "pedestrian") {
          const r = this.radius;
          return M.rectCorners(this.veh.x, this.veh.y, r * 1.4, r * 1.4, this.veh.yaw);
        }
        return this.veh.corners();
      },
      pose: function () { return this.veh.pose(); }
    };
  }

  /** 世界：包含参考线、自车、动态参与者、静态障碍 */
  function createWorld(scene) {
    const road = scene.road;
    const ego = createVehicle(scene.ego.vehicle || {});
    ego.x = scene.ego.x; ego.y = scene.ego.y; ego.yaw = scene.ego.yaw || 0;
    ego.v = scene.ego.speed || 0;

    const actors = (scene.actors || []).map(createActor);
    const statics = (scene.statics || []).map(createActor);

    return {
      road: road, ego: ego, actors: actors, statics: statics, time: 0,

      /** 全部障碍（真值）：仅供感知扫描与渲染使用 */
      obstacles: function () {
        const out = [];
        for (let i = 0; i < actors.length; i++) if (actors[i].alive) out.push(actors[i]);
        for (let i = 0; i < statics.length; i++) out.push(statics[i]);
        return out;
      },
      /** 车辆类参与者（不含静态障碍） */
      vehicles: function () {
        return actors.filter(function (a) { return a.kind === "vehicle" && a.alive; });
      },

      advance: function (dt) {
        this.time += dt;
        for (let i = 0; i < actors.length; i++) {
          const a = actors[i];
          if (!a.alive) continue;
          applyScript(a, this.time);
          applyLaneScript(a, this.time);

          if (a.kind === "pedestrian") {
            a.veh.x += a.veh.v * Math.cos(a.veh.yaw) * dt;
            a.veh.y += a.veh.v * Math.sin(a.veh.yaw) * dt;
            a.veh.yaw = M.normAngle(a.veh.yaw);
            continue;
          }
          if (a.policy === "idm") {
            const lead = nearestLead(a, actors.concat([{ veh: null }]), road, this.ego);
            const gap = lead ? lead.gap : 200;
            const vLead = lead ? lead.v : a.veh.cfg.vDesired;
            a.veh.accelCmd = M.clamp(idmAccel(a.veh.v, vLead, gap, a.veh.cfg),
              a.veh.cfg.maxDecel, a.veh.cfg.maxAccel);
          } else {
            a.veh.accelCmd = M.clamp((a.veh.cfg.vDesired - a.veh.v) * 1.2,
              a.veh.cfg.maxDecel, a.veh.cfg.maxAccel);
          }
          a.veh.step(dt);
        }
        return this;
      }
    };
  }

  /** 沿参考线找同车道最近前车（他车对自车做出反应的依据，属真值查询） */
  function nearestLead(subject, actors, road, ego) {
    const sx = subject.veh.x, sy = subject.veh.y;
    const sProj = M.projectOnPath({ x: sx, y: sy }, road.ref);
    let best = null;
    const pool = actors.slice();
    if (ego) pool.push({ veh: ego, kind: "vehicle", alive: true });
    for (let i = 0; i < pool.length; i++) {
      const o = pool[i];
      if (o === subject || !o.veh || !o.alive || (o.kind !== undefined && o.kind !== "vehicle")) continue;
      const proj = M.projectOnPath({ x: o.veh.x, y: o.veh.y }, road.ref);
      const ds = proj.s - sProj.s;
      const dd = Math.abs(proj.d - sProj.d);
      if (ds > 0.5 && dd < road.laneWidth * 0.9) {
        const gap = ds - (subject.veh.length + o.veh.length) / 2;
        if (!best || ds < best.ds) best = { ds: ds, gap: Math.max(gap, 0.1), v: o.veh.v };
      }
    }
    return best;
  }

  /** 车道变更脚本：横向按 smoothstep 平移（模拟旁车切入） */
  function applyLaneScript(actor, t) {
    if (actor._laneTo === undefined || actor._laneTo === null) return;
    const k = M.clamp((t - actor._laneT0) / actor._laneDur, 0, 1);
    const s = k * k * (3 - 2 * k);
    // 参考线沿 +x 时，横向偏移即 y 坐标；变道后按脚本速度继续直行
    actor.veh.y = actor._laneFrom + (actor._laneTo - actor._laneFrom) * s;
    actor.veh.yaw = M.normAngle(actor.veh.yaw);
  }

  /** 脚本化行为：按时间点改写期望速度或朝向 */
  function applyScript(actor, t) {
    const sc = actor.script;
    for (let i = actor._scripted; i < sc.length; i++) {
      if (t >= sc[i].t) {
        if (sc[i].speed !== undefined) actor.veh.cfg.vDesired = sc[i].speed;
        if (sc[i].speedNow !== undefined) actor.veh.v = sc[i].speedNow;
        if (sc[i].yaw !== undefined) actor.veh.yaw = sc[i].yaw;
        if (sc[i].yawRate !== undefined) actor.veh.yaw = M.normAngle(actor.veh.yaw + sc[i].yawRate);
        if (sc[i].toD !== undefined) {
          actor._laneFrom = actor.veh.y;
          actor._laneTo = sc[i].toD;
          actor._laneT0 = t;
          actor._laneDur = sc[i].duration || 2.5;
        }
        actor._scripted = i + 1;
      } else break;
    }
  }

  return { DEFAULT_VEHICLE, createVehicle, createActor, createWorld, idmAccel };
});

