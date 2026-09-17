/* ADSim - 感知模块
 * ① 激光雷达模拟：射线与障碍物边界求交（含测距/角度噪声）
 * ② 点云聚类：基于距离的连通域聚类
 * ③ 目标跟踪：匀速卡尔曼滤波 + 匈牙利数据关联（马氏距离门限）
 * 对应概念卡：lidar-wavelength、data-association、time-alignment
 * 正本页：pages/tech/perception.html、pages/tech/perception/lidar.html
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) module.exports = mod;
  else root.ADSim = Object.assign(root.ADSim || {}, mod);
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  /* ---------- 小型矩阵工具（卡尔曼滤波用，固定维数） ---------- */
  function matZero(n, m) {
    const a = [];
    for (let i = 0; i < n; i++) a.push(new Array(m).fill(0));
    return a;
  }
  function matMul(A, B) {
    const n = A.length, k = B.length, m = B[0].length;
    const C = matZero(n, m);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < m; j++) {
        let s = 0;
        for (let t = 0; t < k; t++) s += A[i][t] * B[t][j];
        C[i][j] = s;
      }
    return C;
  }
  function matT(A) {
    const n = A.length, m = A[0].length, B = matZero(m, n);
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) B[j][i] = A[i][j];
    return B;
  }
  function matAdd(A, B) {
    return A.map(function (row, i) { return row.map(function (v, j) { return v + B[i][j]; }); });
  }
  function matSub(A, B) {
    return A.map(function (row, i) { return row.map(function (v, j) { return v - B[i][j]; }); });
  }
  /** 2×2 逆（位置协方差求马氏距离用） */
  function inv2(A) {
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (Math.abs(det) < 1e-12) return [[0, 0], [0, 0]];
    return [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]];
  }

  const SCAN_DEFAULT = {
    range: 60, fovDeg: 200, beams: 81,          // 前向 200° 视场
    rangeSigma: 0.03, angleSigma: 0.0015,       // 测距 3 cm、角度噪声
    clusterEps: 1.1, clusterMinPts: 3,
    rngSeed: 20260917
  };

  /* ---------- ① 激光扫描：射线 × 障碍物矩形边界求交 ---------- */
  /** 返回点云 [{x, y, r, angle}]（世界坐标系），含噪声；无命中返回 range 处最大量程点 */
  function scan(ego, obstacles, cfg, rng) {
    const c = Object.assign({}, SCAN_DEFAULT, cfg || {});
    const rand = rng || M.Rng(c.rngSeed);
    const half = M.rad(c.fovDeg) / 2;
    const pts = [];
    for (let b = 0; b < c.beams; b++) {
      const ang = ego.yaw - half + (2 * half) * b / (c.beams - 1);
      const dir = { x: Math.cos(ang), y: Math.sin(ang) };
      let bestT = c.range;
      for (let k = 0; k < obstacles.length; k++) {
        const cs = obstacles[k].corners();
        for (let i = 0; i < 4; i++) {
          const hit = M.raySegment({ x: ego.x, y: ego.y }, dir, bestT, cs[i], cs[(i + 1) % 4]);
          if (hit !== null && hit < bestT) bestT = hit;
        }
      }
      if (bestT >= c.range) continue;                  // 未命中：视为无回波
      const r = Math.max(0.3, bestT + M.gaussian(rand) * c.rangeSigma);
      const a = ang + M.gaussian(rand) * c.angleSigma;
      pts.push({ x: ego.x + r * Math.cos(a), y: ego.y + r * Math.sin(a), r: r, angle: a });
    }
    return pts;
  }
  /* ---------- ② 点云聚类：基于距离的连通域（BFS） ---------- */
  /** points: [{x,y,r,angle}] → 簇 [{pts, cx, cy, n}] */
  function cluster(points, cfg) {
    const c = Object.assign({}, SCAN_DEFAULT, cfg || {});
    const n = points.length, visited = new Array(n).fill(false);
    const eps2 = c.clusterEps * c.clusterEps;
    const out = [];
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      const queue = [i], group = [];
      visited[i] = true;
      while (queue.length) {
        const cur = queue.pop();
        group.push(points[cur]);
        for (let j = 0; j < n; j++) {
          if (visited[j]) continue;
          const dx = points[cur].x - points[j].x, dy = points[cur].y - points[j].y;
          if (dx * dx + dy * dy <= eps2) { visited[j] = true; queue.push(j); }
        }
      }
      if (group.length >= c.clusterMinPts) out.push(group);
    }
    return out.map(function (g) {
      let sx = 0, sy = 0;
      for (let i = 0; i < g.length; i++) { sx += g[i].x; sy += g[i].y; }
      return { pts: g, cx: sx / g.length, cy: sy / g.length, n: g.length };
    });
  }

  /** PCA 主方向：估计目标朝向（轿车为长条目标，长轴即朝向） */
  function pcaYaw(pts) {
    let mx = 0, my = 0;
    for (let i = 0; i < pts.length; i++) { mx += pts[i].x; my += pts[i].y; }
    mx /= pts.length; my /= pts.length;
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].x - mx, dy = pts[i].y - my;
      sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
    }
    sxx /= pts.length; syy /= pts.length; sxy /= pts.length;
    return 0.5 * Math.atan2(2 * sxy, sxx - syy);
  }

  /** 簇 → 检测 [{x, y, yaw, length, width, n}]（世界坐标） */
  function toDetections(clusters) {
    return clusters.map(function (cl) {
      const yaw = pcaYaw(cl.pts);
      // 在估计朝向下求点集的投影范围 → 长宽
      let maxU = -Infinity, minU = Infinity, maxV = -Infinity, minV = Infinity;
      const c = Math.cos(-yaw), s = Math.sin(-yaw);
      for (let i = 0; i < cl.pts.length; i++) {
        const dx = cl.pts[i].x - cl.cx, dy = cl.pts[i].y - cl.cy;
        const u = dx * c - dy * s, v = dx * s + dy * c;
        if (u > maxU) maxU = u; if (u < minU) minU = u;
        if (v > maxV) maxV = v; if (v < minV) minV = v;
      }
      const length = Math.max(0.7, maxU - minU), width = Math.max(0.5, maxV - minV);
      return {
        x: cl.cx, y: cl.cy, yaw: yaw,
        length: length, width: width, n: cl.n,
        // 观测噪声随可见点数量下降（点越多，中心越可信）
        sigma: M.clamp(1.2 / Math.sqrt(cl.n), 0.12, 0.6)
      };
    });
  }
  /* ---------- ③ 目标跟踪：匀速卡尔曼滤波 + 匈牙利数据关联 ---------- */
  const TRACK_DEFAULT = {
    gate: 9.0,             // 马氏距离²门限（≈3σ）
    qPos: 0.35, qVel: 1.6, // 过程噪声
    maxMisses: 8,          // 连续丢失帧数上限（小目标回波稀疏时保持轨迹）
    confirmHits: 2         // 转为“确认轨迹”所需命中数
  };

  function createTracker(cfg) {
    const c = Object.assign({}, TRACK_DEFAULT, cfg || {});
    let nextId = 1;
    const tracks = [];

    function makeTrack(det, t) {
      const s = det.sigma || 0.4, s2 = s * s;
      return {
        id: nextId++, x: det.x, y: det.y, vx: 0, vy: 0,
        P: [[s2, 0, 0, 0], [0, s2, 0, 0], [0, 0, 9, 0], [0, 0, 0, 9]],
        size: { length: det.length, width: det.width },
        age: 1, hits: 1, misses: 0, confirmed: false,
        yaw: det.yaw, yawRate: 0, lastSeen: t, nPoints: det.n,
        history: [{ x: det.x, y: det.y, t: t }]
      };
    }

    /** 状态预测：x = Fx，P = F P Fᵀ + Q（匀速模型） */
    function predictTrack(tr, dt, withNoise) {
      tr.x += tr.vx * dt;
      tr.y += tr.vy * dt;
      const P = tr.P;
      const p00 = P[0][0] + dt * (P[2][0] + P[0][2]) + dt * dt * P[2][2];
      const p01 = P[0][1] + dt * (P[2][1] + P[0][3]) + dt * dt * P[2][3];
      const p02 = P[0][2] + dt * P[2][2];
      const p03 = P[0][3] + dt * P[2][3];
      const p10 = P[1][0] + dt * (P[3][0] + P[1][2]) + dt * dt * P[3][2];
      const p11 = P[1][1] + dt * (P[3][1] + P[1][3]) + dt * dt * P[3][3];
      const p12 = P[1][2] + dt * P[3][2];
      const p13 = P[1][3] + dt * P[3][3];
      tr.P = [
        [p00, p01, p02, p03], [p10, p11, p12, p13],
        [p02, p12, P[2][2], P[2][3]], [p03, p13, P[2][3], P[3][3]]
      ];
      if (withNoise) {
        const a = dt * dt * dt / 3 * c.qVel, b = dt * dt / 2 * c.qVel, qv = dt * c.qVel;
        tr.P[0][0] += a + c.qPos * dt; tr.P[1][1] += a + c.qPos * dt;
        tr.P[2][2] += qv; tr.P[3][3] += qv;
        tr.P[0][2] += b; tr.P[2][0] += b; tr.P[1][3] += b; tr.P[3][1] += b;
      }
      return tr;
    }

    /** 卡尔曼更新：K = P Hᵀ S⁻¹；x += Kν；P = (I − KH)P */
    function updateTrack(tr, det) {
      const P = tr.P;
      const r = (det.sigma || 0.4) * (det.sigma || 0.4);
      const S = [[P[0][0] + r, P[0][1]], [P[1][0], P[1][1] + r]];
      const Si = inv2(S);
      const PHt = [[P[0][0], P[0][1]], [P[1][0], P[1][1]], [P[2][0], P[2][1]], [P[3][0], P[3][1]]];
      const K = matMul(PHt, Si);
      const nu = [det.x - tr.x, det.y - tr.y];
      tr.x += K[0][0] * nu[0] + K[0][1] * nu[1];
      tr.y += K[1][0] * nu[0] + K[1][1] * nu[1];
      tr.vx += K[2][0] * nu[0] + K[2][1] * nu[1];
      tr.vy += K[3][0] * nu[0] + K[3][1] * nu[1];
      const KH = matZero(4, 4), I = matZero(4, 4);
      for (let i = 0; i < 4; i++) { KH[i][0] = K[i][0]; KH[i][1] = K[i][1]; I[i][i] = 1; }
      tr.P = matMul(matSub(I, KH), P);
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
        const m = (tr.P[i][j] + tr.P[j][i]) / 2;
        tr.P[i][j] = m; tr.P[j][i] = m;
      }
      tr.size = { length: det.length, width: det.width };
      tr.nPoints = det.n;
      tr.hits++; tr.misses = 0;
      if (tr.hits >= c.confirmHits) tr.confirmed = true;
      const sp = Math.hypot(tr.vx, tr.vy);
      if (sp > 0.4) tr.yaw = Math.atan2(tr.vy, tr.vx);
    }
    /** 马氏距离²（S = H P Hᵀ + R）——关联门限的度量 */
    function mahalanobis2(tr, det) {
      const P = tr.P;
      const r = (det.sigma || 0.4) * (det.sigma || 0.4);
      const S = [[P[0][0] + r, P[0][1]], [P[1][0], P[1][1] + r]];
      const Si = inv2(S);
      const dx = det.x - tr.x, dy = det.y - tr.y;
      return dx * dx * Si[0][0] + dx * dy * (Si[0][1] + Si[1][0]) + dy * dy * Si[1][1];
    }

    return {
      tracks: tracks,
      /** 一步：预测 → 关联（匈牙利）→ 更新 → 生命周期管理 */
      step: function (dt, detections, t) {
        for (let i = 0; i < tracks.length; i++) predictTrack(tracks[i], dt, true);

        const nT = tracks.length, nD = detections.length;
        const matchedT = new Array(nT).fill(false), matchedD = new Array(nD).fill(false);
        if (nT > 0 && nD > 0) {
          const cost = [];
          for (let i = 0; i < nT; i++) {
            const row = [];
            for (let j = 0; j < nD; j++) {
              const d2 = mahalanobis2(tracks[i], detections[j]);
              row.push(d2 <= c.gate ? d2 : Infinity);
            }
            cost.push(row);
          }
          const a = M.hungarian(cost);
          for (let i = 0; i < nT; i++) {
            const j = a[i];
            if (j >= 0 && isFinite(cost[i][j])) {
              updateTrack(tracks[i], detections[j]);
              matchedT[i] = true; matchedD[j] = true;
            }
          }
        }
        for (let i = 0; i < nT; i++) if (!matchedT[i]) tracks[i].misses++;
        for (let j = 0; j < nD; j++) if (!matchedD[j]) tracks.push(makeTrack(detections[j], t));

        for (let i = tracks.length - 1; i >= 0; i--) {
          const tr = tracks[i];
          tr.age++;
          tr.history.push({ x: tr.x, y: tr.y, t: t });
          if (tr.history.length > 40) tr.history.shift();
          if (tr.misses > c.maxMisses) tracks.splice(i, 1);
        }
        return tracks;
      },
      reset: function () { tracks.length = 0; nextId = 1; }
    };
  }
  /* @@PERC4@@ */
  return { SCAN_DEFAULT, TRACK_DEFAULT, scan, cluster, toDetections, pcaYaw, createTracker,
    _mat: { matMul: matMul, matT: matT, matAdd: matAdd, matSub: matSub, inv2: inv2, matZero: matZero } };
});


