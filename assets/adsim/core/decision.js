/* ADSim - 行为决策模块
 * 有限状态机：巡航 / 跟车 / 变道 / 让行 / 停车 / 紧急制动。
 * 每个状态都有进入与退出判据（含迟滞），避免状态在阈值附近抖动。
 * 对应概念卡：rss、ttc；正本页：pages/tech/decision.html
 * 约定：本模块只使用感知与预测输出（不含世界真值）。
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  const STATES = {
    CRUISE: "CRUISE", FOLLOW: "FOLLOW", LANE_CHANGE: "LANE_CHANGE",
    YIELD: "YIELD", STOP: "STOP", EMERGENCY: "EMERGENCY"
  };

  const DECISION_DEFAULT = {
    timeGap: 1.6,          // 期望时距（s）：安全距离 = timeGap × v + minGap
    minGap: 3.0,           // 静止时最小净间距（m）
    ttcFollow: 6.0,        // TTC 低于此值进入跟车
    ttcEmergency: 2.2,     // TTC 低于此值触发紧急制动
    yieldGap: 22.0,        // 让行判定的纵向关注距离（m）
    laneChangeClearance: 14.0,  // 变道所需的后方净空（m）
    laneChangeSpeedGain: 1.5,   // 前车慢于此差值才考虑变道（m/s）
    allowLaneChange: true,      // 某些场景/ODD 不启用变道（只考验纵向策略）
    releaseHysteresis: 1.35,     // 退出跟车的距离迟滞系数
    maxLaneIndex: 1
  };

  /** 计算 TTC（若前车更快则视为无穷） */
  function computeTTC(gap, v, vLead) {
    const dv = v - vLead;
    if (dv <= 0.2) return Infinity;
    return gap / dv;
  }

  /** 在参考线坐标系下筛选本车道前方的目标 */
  function selectLead(ego, tracks, road, cfg) {
    const egoProj = M.projectOnPath({ x: ego.x, y: ego.y }, road.ref);
    let best = null;
    for (let i = 0; i < tracks.length; i++) {
      const tr = tracks[i];
      const proj = M.projectOnPath({ x: tr.x, y: tr.y }, road.ref);
      const ds = proj.s - egoProj.s;
      const dd = proj.d - egoProj.d;
      if (ds <= 0.5 || ds > 90) continue;
      const halfWidth = (tr.size ? tr.size.width : 1.9) / 2;
      if (Math.abs(dd) > halfWidth + road.laneWidth * 0.55) continue;   // 不在本车道
      const gap = ds - ego.length / 2 - (tr.size ? tr.size.length : 4.6) / 2;
      if (!best || ds < best.ds) {
        best = {
          id: tr.id, ds: ds, gap: Math.max(gap, 0.1), d: dd,
          v: Math.hypot(tr.vx, tr.vy), track: tr
        };
      }
    }
    if (best) best.ttc = computeTTC(best.gap, ego.v, best.v);
    return best;
  }

  /** 变道可行性：检查目标车道前后净空 */
  function checkLaneChange(ego, tracks, road, state, cfg) {
    const targetLane = state.targetLane;
    const laneD = road.laneCenters[targetLane];
    const egoProj = M.projectOnPath({ x: ego.x, y: ego.y }, road.ref);
    let frontClear = Infinity, rearClear = Infinity, frontV = Infinity;
    for (let i = 0; i < tracks.length; i++) {
      const tr = tracks[i];
      const proj = M.projectOnPath({ x: tr.x, y: tr.y }, road.ref);
      if (Math.abs(proj.d - laneD) > road.laneWidth * 0.6) continue;
      const ds = proj.s - egoProj.s;
      const v = Math.hypot(tr.vx, tr.vy);
      if (ds > 0) {
        const gap = ds - (tr.size ? tr.size.length : 4.6) / 2 - ego.length / 2;
        if (gap < frontClear) { frontClear = gap; frontV = v; }
      } else {
        const gap = -ds - ego.length / 2 - (tr.size ? tr.size.length : 4.6) / 2;
        if (gap < rearClear) rearClear = gap;
      }
    }
    return {
      ok: frontClear > cfg.minGap + ego.v * 0.6 && rearClear > cfg.laneChangeClearance,
      frontClear: frontClear, rearClear: rearClear, frontV: frontV, laneD: laneD
    };
  }
  /** 状态机：每个仿真步调用一次，返回决策结果 */
  function createDecider(cfg) {
    const c = Object.assign({}, DECISION_DEFAULT, cfg || {});
    let state = { name: STATES.CRUISE, targetLane: 1, since: -1e9, reason: "初始化" };
    let emergencyLatch = false;

    /** 当前所处车道索引（带滞回：变道过程中不来回跳，避免规划“撤回车道”） */
    function currentLaneIndex(ego, road, prevLane) {
      const proj = M.projectOnPath({ x: ego.x, y: ego.y }, road.ref);
      if (prevLane !== undefined && prevLane !== null && road.laneCenters[prevLane] !== undefined) {
        if (Math.abs(proj.d - road.laneCenters[prevLane]) < road.laneWidth * 0.62) return prevLane;
      }
      let idx = 0, bestD = Infinity;
      for (let i = 0; i < road.laneCenters.length; i++) {
        const dd = Math.abs(road.laneCenters[i] - proj.d);
        if (dd < bestD) { bestD = dd; idx = i; }
      }
      return idx;
    }

    /** 横穿目标检测：小尺寸、低速或横向运动、位于自车走廊内 */
    function crossingTarget(ego, tracks, road) {
      const egoProj = M.projectOnPath({ x: ego.x, y: ego.y }, road.ref);
      let worst = null;
      for (let i = 0; i < tracks.length; i++) {
        const tr = tracks[i];
        const proj = M.projectOnPath({ x: tr.x, y: tr.y }, road.ref);
        const ds = proj.s - egoProj.s;
        if (ds < -2 || ds > c.yieldGap) continue;
        const size = tr.size ? Math.max(tr.size.length, tr.size.width) : 1.0;
        if (size > 2.5) continue;                        // 尺寸像车 → 不按行人处理
        if (Math.abs(proj.d - egoProj.d) > 4.5) continue;
        const v = Math.hypot(tr.vx, tr.vy);
        // 在参考线坐标系下分解速度：横向速度占优且非零 = 正在横穿
        const tan = proj.tangent;
        const vAlong = tr.vx * tan.x + tr.vy * tan.y;
        const vLat = -tr.vx * tan.y + tr.vy * tan.x;
        const lateralMotion = Math.abs(vLat) > 0.3 && Math.abs(vLat) > Math.abs(vAlong) * 0.7;
        // 静止小障碍（施工围挡、锥桶）交给“静止障碍 → 变道/绕行”逻辑，不在此判为行人
        if (lateralMotion) {
          if (!worst || ds < worst.ds) worst = { ds: ds, d: proj.d, v: v, id: tr.id, track: tr };
        }
      }
      return worst;
    }

    return {
      get state() { return state; },

      /** ctx: {ego, tracks, road, dt, time, speedLimit} → 决策结果（只用感知/预测输出） */
      update: function (ctx) {
        const ego = ctx.ego, road = ctx.road, tracks = ctx.tracks;
        const t = ctx.time || 0;
        const speedLimit = ctx.speedLimit || 13.9;

        const lead = selectLead(ego, tracks, road, c);
        const desiredGap = c.minGap + c.timeGap * ego.v;
        const crossed = crossingTarget(ego, tracks, road);
        const laneIdx = currentLaneIndex(ego, road, state.targetLane);

        let name = state.name, targetLane = state.targetLane, reason = state.reason;
        let targetSpeed = speedLimit;

        // ① 紧急制动：只对“运动前车”的快速逼近触发；
        //    静止障碍（围挡/锥桶）不在此处理，交给“变道绕行 / 跟停”逻辑
        const ttc = lead ? lead.ttc : Infinity;
        const gap = lead ? lead.gap : Infinity;
        const movingLead = lead && lead.v > 0.5;
        if (movingLead && (ttc < c.ttcEmergency || gap < c.minGap * 0.8)) emergencyLatch = true;
        if (emergencyLatch && (!lead || (ttc > c.ttcEmergency * 1.4 && gap > c.minGap * 1.6))) {
          emergencyLatch = false;
        }

        let forced = false;
        if (emergencyLatch) {
          name = STATES.EMERGENCY;
          targetSpeed = 0;
          forced = true;
          reason = lead ? ("TTC " + ttc.toFixed(1) + " s < " + c.ttcEmergency + " s")
                        : "制动锁存中";
        } else if (crossed && crossed.ds < 12) {
          // ② 横穿目标已进入走廊 → 停车让行
          name = STATES.STOP; targetSpeed = 0; forced = true;
          reason = "前方 " + crossed.ds.toFixed(1) + " m 有横穿目标（v=" + crossed.v.toFixed(1) + " m/s）";
        } else if (crossed) {
          name = STATES.YIELD; forced = true;
          targetSpeed = Math.min(speedLimit, Math.max(0, (crossed.ds - 4) * 1.2));
          reason = "让行：观察横穿目标（" + crossed.ds.toFixed(1) + " m）";
        }
        // ③ 变道 / 跟车 / 巡航判定（仅在未被强制状态占用时执行）
        if (!forced) {
          const slowLead = lead && (lead.v < ego.v - c.laneChangeSpeedGain || lead.v < 0.5);
          // 前方是静止障碍（围挡/锥桶）时不受“期望间距”限制：早变道，别等到停下
          const staticBlock = lead && lead.v < 0.5 && lead.ds < 60;
          const blocked = lead && (gap < Math.min(desiredGap, 30) || staticBlock);
          let candidate = -1;
          if (c.allowLaneChange !== false && slowLead && blocked) {
            for (let li = 0; li < road.laneCenters.length; li++) {
              if (li === laneIdx) continue;
              const chk = checkLaneChange(ego, tracks, road, { targetLane: li }, c);
              if (chk.ok && chk.frontClear > 12) { candidate = li; break; }
            }
          }

          if (state.name === STATES.LANE_CHANGE) {
            const chk = checkLaneChange(ego, tracks, road, { targetLane: targetLane }, c);
            const proj = M.projectOnPath({ x: ego.x, y: ego.y }, road.ref);
            if (Math.abs(proj.d - road.laneCenters[targetLane]) < 0.4 && (!lead || gap > desiredGap)) {
              name = STATES.CRUISE; targetLane = laneIdx; reason = "变道完成";
            } else if (!chk.ok && gap < c.minGap * 2) {
              name = STATES.FOLLOW; targetLane = laneIdx; reason = "变道取消：目标车道净空不足";
            } else {
              reason = "变道中：驶向车道 " + targetLane;
            }
          } else if (candidate >= 0) {
            name = STATES.LANE_CHANGE; targetLane = candidate;
            reason = "变道：前车 v=" + (lead ? lead.v.toFixed(1) : "-") + " m/s 偏慢，邻道净空充足";
          } else if (lead && gap < desiredGap * c.releaseHysteresis) {
            name = STATES.FOLLOW; targetLane = laneIdx;
            const gapErr = gap - desiredGap;
            targetSpeed = M.clamp(lead.v + gapErr * 0.8, 0, speedLimit);
            reason = "跟车：" + lead.id + " gap=" + gap.toFixed(1) + " m，TTC=" +
              (isFinite(ttc) ? ttc.toFixed(1) + " s" : "∞");
          } else {
            name = STATES.CRUISE; targetLane = laneIdx;
            reason = "巡航：前方无约束";
          }
        }

        if (name !== state.name) state.since = t;
        state = {
          name: name, targetLane: targetLane, since: state.since, reason: reason,
          targetSpeed: M.clamp(targetSpeed, 0, speedLimit),
          lead: lead ? { id: lead.id, gap: lead.gap, ttc: lead.ttc, v: lead.v, ds: lead.ds } : null,
          crossing: crossed ? { id: crossed.id, ds: crossed.ds, v: crossed.v } : null,
          laneIndex: laneIdx,
          stateAge: t - state.since
        };
        return state;
      },
      reset: function () {
        state = { name: STATES.CRUISE, targetLane: 1, since: -1e9, reason: "重置" };
        emergencyLatch = false;
      }
    };
  }

  return { STATES, DECISION_DEFAULT, computeTTC, selectLead, checkLaneChange, createDecider };
});

