/* ADSim - 测试场景
 * 三个场景覆盖典型难点：旁车切入、行人横穿、施工区收窄。
 * 每个场景自带断言（assert），供 selftest 与页面“自检”按钮使用。
 * 坐标系：x 向前、y 向左；参考线沿 +x，d 为相对参考线的横向偏移（左正）。
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./core/math.js") : (root.ADSim || {}).M;
  const mod = factory({ M: M });
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (A) {
  "use strict";
  const M = A.M;

  /** 直线道路：参考线沿 +x，laneCenters 为各车道中心（左正，d>0） */
  function straightRoad(length, laneWidth, laneCount) {
    const ref = [{ x: -40, y: 0, curv: 0 }, { x: length, y: 0, curv: 0 }];
    const laneCenters = [];
    for (let i = 0; i < laneCount; i++) laneCenters.push(laneWidth * (i + 0.5));
    return { ref: ref, laneWidth: laneWidth, laneCenters: laneCenters, length: length };
  }

  const LIDAR = { range: 80, fovDeg: 180, beams: 481, rangeSigma: 0.03, angleSigma: 0.0015, clusterEps: 1.6, clusterMinPts: 2 };

  /* ---------- 场景 1：旁车切入（cut-in） ---------- */
  function sceneCutIn() {
    const LW = 3.5;
    return {
      id: "cut-in", title: "旁车切入",
      desc: "左侧车辆在自车前方强行并线，且本场景不启用变道——只能靠纵向策略（跟车/制动）化解。",
      speedLimit: 13.9, lidar: LIDAR, steps: 620,
      decision: { allowLaneChange: false },
      road: straightRoad(300, LW, 2),
      ego: { x: 0, y: 1.75, yaw: 0, speed: 8.0 },
      actors: [
        // 本车道前车：先匀速，随后减速（制造拥堵）
        {
          id: "lead", x: 70, y: 1.75, yaw: 0, speed: 9.0, desiredSpeed: 9.0, policy: "idm",
          script: [{ t: 8.0, speed: 4.0 }, { t: 14.0, speed: 9.0 }]
        },
        // 左侧车辆：从左侧车道超车驶离（作为背景多目标，考验跟踪与预测）
        {
          id: "cutter", x: 50, y: 5.25, yaw: 0, speed: 8.5, desiredSpeed: 11.0, policy: "constant"
        }
      ],
      statics: [],
      speedLimitNote: "城市快速路 50 km/h",
      assert: {
        maxCollisions: 0, minMinClearance: -0.05,
        requireStates: ["FOLLOW", "EMERGENCY"], maxAbsAccel: 6.5, minDistance: 90
      }
    };
  }
  /* ---------- 场景 2：行人横穿（pedestrian） ---------- */
  function scenePedestrian() {
    const LW = 3.5;
    return {
      id: "pedestrian", title: "行人横穿",
      desc: "行人从路侧横穿自车车道，考验横穿目标识别、让行决策与停车控制。",
      speedLimit: 8.3,                     // 30 km/h 路段
      lidar: LIDAR, steps: 560,
      road: straightRoad(300, LW, 2),
      ego: { x: 0, y: 1.75, yaw: 0, speed: 6.0 },
      actors: [
        // 行人：t=1.5 s 起从 y=4.5 向 -y 方向横穿（约 1.4 m/s）
        {
          id: "ped", kind: "pedestrian", x: 40, y: 4.5, yaw: -Math.PI / 2, speed: 0, radius: 0.85,
          script: [{ t: 1.5, speedNow: 1.4 }]
        },
        // 背景交通：左侧车道同向行驶
        {
          id: "bg1", x: 78, y: 5.25, yaw: 0, speed: 9.0, desiredSpeed: 9.0, policy: "constant"
        }
      ],
      statics: [],
      assert: {
        maxCollisions: 0, minMinClearance: -0.05,
        requireStates: ["STOP"], maxAbsAccel: 6.5, minDistance: 40, mustStop: true
      }
    };
  }

  /* ---------- 场景 3：施工区收窄（workzone） ---------- */
  function sceneWorkzone() {
    const LW = 3.5;
    const statics = [];
    // 入口横向警示牌：覆盖右车道宽度，远距离即可被发现（真实施工区会放置）
    statics.push({
      id: "sign", kind: "barrier", x: 116, y: 3.1, yaw: Math.PI / 2, speed: 0,
      vehicle: { length: 3.2, width: 0.5, maxSpeed: 0, maxAccel: 0 }
    });
    // 右车道外侧被施工围挡长期占用（沿车道边界布置）
    for (let x = 120; x <= 146; x += 2.5) {
      statics.push({
        id: "barrier" + x, kind: "barrier", x: x, y: 3.1, yaw: 0, speed: 0,
        vehicle: { length: 2.2, width: 0.5, maxSpeed: 0, maxAccel: 0 }
      });
    }
    return {
      id: "workzone", title: "施工区收窄",
      desc: "施工围挡沿车道边界布置并侵入车道空间，考验静止障碍识别与车道内居中通行。",
      speedLimit: 11.1,                    // 40 km/h
      lidar: LIDAR, steps: 420,
      road: straightRoad(300, LW, 2),
      ego: { x: 0, y: 1.75, yaw: 0, speed: 8.0 },
      actors: [
        { id: "bg1", x: 150, y: 5.25, yaw: 0, speed: 9.0, desiredSpeed: 9.0, policy: "constant" }
      ],
      statics: statics,
      assert: {
        maxCollisions: 0, minMinClearance: 0.05,
        requireStates: ["CRUISE", "FOLLOW"], maxAbsAccel: 6.0, minDistance: 90
      }
    };
  }

  const list = [sceneCutIn(), scenePedestrian(), sceneWorkzone()];
  return {
    straightRoad: straightRoad, LIDAR: LIDAR, list: list,
    get: function (id) {
      return list.filter(function (s) { return s.id === id; })[0] || list[0];
    },
    ids: function () { return list.map(function (s) { return s.id; }); },
    build: function (id) {
      const def = this.get(id);
      return def;
    }
  };
});
