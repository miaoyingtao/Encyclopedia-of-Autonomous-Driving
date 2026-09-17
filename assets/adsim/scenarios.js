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
    return roadOf(ref, laneWidth, laneCount);
  }

  /** 组装道路对象：ref 折线（任意形状）+ 车道配置 */
  function roadOf(ref, laneWidth, laneCount, laneCenters) {
    let centers = laneCenters;
    if (!centers) {
      centers = [];
      for (let i = 0; i < laneCount; i++) centers.push(laneWidth * (i + 0.5));
    }
    return {
      ref: ref, laneWidth: laneWidth, laneCenters: centers,
      laneCount: centers.length, length: M.pathLength(ref)
    };
  }

  /** 由“段”生成参考线：line（直线）/ arc（圆弧）/ spiral（回旋线，曲率线性变化）
   *  采用定步长欧拉积分累积位姿，步长默认 2 m（折角极小，Frenet 投影足够精确）。
   *  seg: {type:'line', length} | {type:'arc', length, radius, dir:+1/-1}
   *       | {type:'spiral', length, fromR, toR, dir}  （fromR/toR 为 ∞ 表示直线） */
  function buildRef(segments, ds, startPose) {
    const step = ds || 2.0;
    const start = startPose || { x: 0, y: 0, yaw: 0 };
    let x = start.x, y = start.y, hdg = start.yaw;
    const ref = [{ x: x, y: y, curv: 0 }];
    for (let si = 0; si < segments.length; si++) {
      const seg = segments[si];
      const n = Math.max(1, Math.round(seg.length / step));
      const dstep = seg.length / n;
      for (let i = 0; i < n; i++) {
        let curv = 0;
        if (seg.type === "arc") {
          curv = (seg.dir || 1) / seg.radius;
        } else if (seg.type === "spiral") {
          const c0 = seg.fromR ? 1 / seg.fromR : 0;
          const c1 = seg.toR ? 1 / seg.toR : 0;
          const k = (i + 0.5) / n;
          curv = (c0 + (c1 - c0) * k) * (seg.dir || 1);
        }
        hdg += curv * dstep;
        x += Math.cos(hdg) * dstep;
        y += Math.sin(hdg) * dstep;
        ref.push({ x: x, y: y, curv: curv });
      }
    }
    return ref;
  }

  /** 由“段”直接生成道路 */
  function roadFromSegments(segments, laneWidth, laneCount, opts) {
    const o = opts || {};
    return roadOf(buildRef(segments, o.ds, o.startPose), laneWidth, laneCount, o.laneCenters);
  }

  /* ---------- 内置地图（供场景与实验台使用） ---------- */
  const MAPS = {
    straight: function () { return straightRoad(300, 3.5, 2); },
    // 城市弯道：直道 → 左弯（R=90，弧长约 94 m）→ 直道
    curve: function () {
      return roadFromSegments([
        { type: "line", length: 70 },
        { type: "arc", length: 95, radius: 90, dir: 1 },
        { type: "line", length: 120 }
      ], 3.5, 2);
    },
    // S 弯：左右交替的连续弯
    sCurve: function () {
      return roadFromSegments([
        { type: "line", length: 50 },
        { type: "spiral", length: 30, fromR: 0, toR: 70, dir: 1 },
        { type: "arc", length: 55, radius: 70, dir: 1 },
        { type: "spiral", length: 30, fromR: 70, toR: 0, dir: 1 },
        { type: "line", length: 20 },
        { type: "spiral", length: 30, fromR: 0, toR: 70, dir: -1 },
        { type: "arc", length: 55, radius: 70, dir: -1 },
        { type: "spiral", length: 30, fromR: 70, toR: 0, dir: -1 },
        { type: "line", length: 90 }
      ], 3.5, 2);
    },
    // 盘山路：连续同向弯 + 一段反弯（考验长曲率下的规划与控制）
    winding: function () {
      return roadFromSegments([
        { type: "line", length: 40 },
        { type: "arc", length: 70, radius: 60, dir: 1 },
        { type: "arc", length: 50, radius: 110, dir: 1 },
        { type: "arc", length: 70, radius: 60, dir: 1 },
        { type: "arc", length: 60, radius: 90, dir: -1 },
        { type: "arc", length: 70, radius: 60, dir: -1 },
        { type: "line", length: 80 }
      ], 3.5, 2);
    },
    // 匝道汇入（车道数 2 的直路，用“加宽区”近似表达：弯道 + 背景车）
    ramp: function () {
      return roadFromSegments([
        { type: "line", length: 60 },
        { type: "spiral", length: 40, fromR: 0, toR: 150, dir: -1 },
        { type: "arc", length: 60, radius: 150, dir: -1 },
        { type: "spiral", length: 40, fromR: 150, toR: 0, dir: -1 },
        { type: "line", length: 120 }
      ], 3.5, 2);
    }
  };

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
          id: "ped", kind: "pedestrian", x: 40, y: 4.5, yaw: -Math.PI / 2, speed: 0, radius: 1.0,
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
        requireStates: ["STOP", "YIELD", "EMERGENCY"], maxAbsAccel: 6.5, minDistance: 40, mustStop: true
      }
    };
  }

  /* ---------- 场景 3：施工区收窄（workzone） ---------- */
  function sceneWorkzone() {
    const LW = 3.5;
    const statics = [];
    // 入口横向警示牌：覆盖右车道（远距离即可被发现）
    statics.push({
      id: "sign", kind: "barrier", x: 156, y: 2.2, yaw: Math.PI / 2, speed: 0,
      vehicle: { length: 3.0, width: 0.9, maxSpeed: 0, maxAccel: 0 }
    });
    // 右车道被施工围挡封闭：只能变道到左侧车道绕行
    for (let x = 160; x <= 186; x += 2.5) {
      statics.push({
        id: "barrier" + x, kind: "barrier", x: x, y: 2.2, yaw: 0, speed: 0,
        vehicle: { length: 2.2, width: 0.9, maxSpeed: 0, maxAccel: 0 }
      });
    }
    return {
      id: "workzone", title: "施工区收窄",
      desc: "施工区限速路段（20 km/h）：右车道被围挡封闭，自车必须提前变道绕行——考验静止障碍识别、变道决策与横向规划。",
      speedLimit: 5.5,                     // 20 km/h（施工区限速）
      lidar: LIDAR, steps: 520,
      road: straightRoad(300, LW, 2),
      ego: { x: 0, y: 1.75, yaw: 0, speed: 5.0 },
      actors: [
        { id: "bg1", x: 150, y: 5.25, yaw: 0, speed: 5.5, desiredSpeed: 5.5, policy: "constant" }
      ],
      statics: statics,
      assert: {
        maxCollisions: 0, minMinClearance: 0.0,
        requireStates: ["LANE_CHANGE"], maxAbsAccel: 6.0, minDistance: 80
      }
    };
  }

  /* ---------- 弧长定位辅助：在参考线上按 s（弧长）与 d（横向偏移）取位姿 ---------- */
  function poseOn(road, s, d) {
    const p = M.samplePath(road.ref, s);
    const nx = -Math.sin(p.yaw), ny = Math.cos(p.yaw);   // 左法向
    return { x: p.x + nx * d, y: p.y + ny * d, yaw: p.yaw };
  }

  /* ---------- 场景 4：弯道跟车（curve-follow） ---------- */
  function sceneCurveFollow() {
    const road = MAPS.curve();
    const LW = road.laneWidth;
    const p0 = poseOn(road, 0, LW * 0.5);
    const lead = poseOn(road, 20, LW * 0.5);
    const bg = poseOn(road, 150, LW * 1.5);
    return {
      id: "curve-follow", title: "弯道跟车",
      desc: "双车道弯道路段（R=90 m 圆弧）：前车为背景目标，本场景主要考验持续曲率下的循迹、横向规划与控制稳定性。",
      speedLimit: 11.1, lidar: LIDAR, steps: 700,
      road: road,
      ego: { x: p0.x, y: p0.y, yaw: p0.yaw, speed: 8.0 },
      actors: [
        {
          id: "lead", x: lead.x, y: lead.y, yaw: lead.yaw, speed: 3.0, desiredSpeed: 3.0, policy: "idm",
          script: [{ t: 8.0, speed: 5.0 }, { t: 14.0, speed: 8.0 }]
        },
        { id: "bg1", x: bg.x, y: bg.y, yaw: bg.yaw, speed: 9.0, desiredSpeed: 9.0, policy: "constant" }
      ],
      statics: [],
      assert: {
        maxCollisions: 0, minMinClearance: -0.05,
        requireStates: ["CRUISE", "FOLLOW"], maxAbsAccel: 5.0, minDistance: 90
      }
    };
  }

  /* ---------- 场景 5：S 弯循迹（s-curve） ---------- */
  function sceneSCurve() {
    const road = MAPS.sCurve();
    const LW = road.laneWidth;
    const p0 = poseOn(road, 0, LW * 0.5);
    const lead = poseOn(road, 95, LW * 0.5);
    const bg = poseOn(road, 200, LW * 1.5);
    return {
      id: "s-curve", title: "S 弯循迹",
      desc: "连续反向弯道（含回旋线过渡段）：变曲率下的横向规划、横向加速度代价与 Pure Pursuit 跟踪稳定性。",
      speedLimit: 13.9, lidar: LIDAR, steps: 760,
      road: road,
      ego: { x: p0.x, y: p0.y, yaw: p0.yaw, speed: 9.0 },
      actors: [
        { id: "lead", x: lead.x, y: lead.y, yaw: lead.yaw, speed: 9.5, desiredSpeed: 9.5, policy: "constant" },
        { id: "bg1", x: bg.x, y: bg.y, yaw: bg.yaw, speed: 10.0, desiredSpeed: 10.0, policy: "constant" }
      ],
      statics: [],
      assert: {
        maxCollisions: 0, minMinClearance: -0.05,
        requireStates: ["CRUISE", "FOLLOW"], maxAbsAccel: 5.0, minDistance: 120
      }
    };
  }

  /* ---------- 场景 6：盘山路（winding） ---------- */
  function sceneWinding() {
    const road = MAPS.winding();
    const LW = road.laneWidth;
    const p0 = poseOn(road, 0, LW * 0.5);
    const lead = poseOn(road, 60, LW * 0.5);
    const bg = poseOn(road, 210, LW * 1.5);
    const cone1 = poseOn(road, 160, LW * 0.35);
    const cone2 = poseOn(road, 166, LW * 0.6);
    return {
      id: "winding", title: "盘山路（连续弯）",
      desc: "长距离连续同向弯 + 一段反弯：低曲率半径下考验规划（横向代价）与控制（前视自适应），并混入一处锥桶。",
      speedLimit: 8.3, lidar: LIDAR, steps: 780,
      road: road,
      ego: { x: p0.x, y: p0.y, yaw: p0.yaw, speed: 7.0 },
      actors: [
        { id: "lead", x: lead.x, y: lead.y, yaw: lead.yaw, speed: 7.0, desiredSpeed: 7.0, policy: "constant" },
        { id: "bg1", x: bg.x, y: bg.y, yaw: bg.yaw, speed: 8.0, desiredSpeed: 8.0, policy: "constant" }
      ],
      statics: [
        { id: "cone1", kind: "cone", x: cone1.x, y: cone1.y, yaw: cone1.yaw, speed: 0,
          vehicle: { length: 0.8, width: 0.8, maxSpeed: 0, maxAccel: 0 } },
        { id: "cone2", kind: "cone", x: cone2.x, y: cone2.y, yaw: cone2.yaw, speed: 0,
          vehicle: { length: 0.8, width: 0.8, maxSpeed: 0, maxAccel: 0 } }
      ],
      assert: {
        maxCollisions: 0, minMinClearance: -0.05,
        requireStates: ["CRUISE", "FOLLOW"], maxAbsAccel: 5.0, minDistance: 110
      }
    };
  }

  const list = [
    sceneCutIn(), scenePedestrian(), sceneWorkzone(),
    sceneCurveFollow(), sceneSCurve(), sceneWinding()
  ];
  return {
    straightRoad: straightRoad, LIDAR: LIDAR, list: list,
    MAPS: MAPS, buildRef: buildRef, roadFromSegments: roadFromSegments,
    roadOf: roadOf, poseOn: poseOn,
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
