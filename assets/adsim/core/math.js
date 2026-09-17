/* ADSim - 数学与几何基础
 * 自治驾驶仿真栈底层工具：角度/向量、坐标系变换、几何求交、多项式轨迹、
 * 匈牙利分配、可复现随机数。
 * 对应概念卡：frenet、data-association、calibration
 * 浏览器：window.ADSim.M   Node：require('./math.js')
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ADSim = Object.assign(root.ADSim || {}, { M: factory() });
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const EPS = 1e-9;
  const TAU = Math.PI * 2;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  /** 角度归一化到 (-π, π] */
  function normAngle(a) {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
  }
  function angleDiff(target, current) { return normAngle(target - current); }

  /* ---------- 二维向量（纯函数，返回新对象） ---------- */
  const V = {
    add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
    sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
    scale: (a, k) => ({ x: a.x * k, y: a.y * k }),
    dot: (a, b) => a.x * b.x + a.y * b.y,
    cross: (a, b) => a.x * b.y - a.y * b.x,
    norm: (a) => Math.hypot(a.x, a.y),
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
    unit: (a) => { const n = Math.hypot(a.x, a.y) || EPS; return { x: a.x / n, y: a.y / n }; },
    rot: (a, yaw) => {
      const c = Math.cos(yaw), s = Math.sin(yaw);
      return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
    }
  };

  /* ---------- 坐标系变换与参考线 ---------- */
  /** 世界 → 自车局部（自车朝向为 +x） */
  function worldToLocal(p, origin, yaw) {
    const d = V.sub(p, origin);
    const c = Math.cos(-yaw), s = Math.sin(-yaw);
    return { x: d.x * c - d.y * s, y: d.x * s + d.y * c };
  }
  function localToWorld(p, origin, yaw) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return { x: origin.x + p.x * c - p.y * s, y: origin.y + p.x * s + p.y * c };
  }
  /** 沿折线按弧长取位姿 → {x,y,yaw,curv} */
  function samplePath(path, s) {
    if (!path || path.length === 0) return { x: 0, y: 0, yaw: 0, curv: 0 };
    let acc = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      const seg = V.dist(a, b);
      if (s <= acc + seg || i === path.length - 2) {
        const t = seg > EPS ? clamp((s - acc) / seg, 0, 1) : 0;
        return {
          x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t),
          yaw: Math.atan2(b.y - a.y, b.x - a.x),
          curv: (a.curv || 0) * (1 - t) + (b.curv || 0) * t
        };
      }
      acc += seg;
    }
    const last = path[path.length - 1];
    return { x: last.x, y: last.y, yaw: 0, curv: last.curv || 0 };
  }
  function pathLength(path) {
    let acc = 0;
    for (let i = 0; i < path.length - 1; i++) acc += V.dist(path[i], path[i + 1]);
    return acc;
  }
  /** 点在参考线上的投影 → {s, d, idx, tangent}（d 左正右负） */
  function projectOnPath(p, path) {
    let best = { s: 0, d: Infinity, idx: 0, tangent: { x: 1, y: 0 } };
    let acc = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      const ab = V.sub(b, a), len = V.norm(ab);
      if (len < EPS) continue;
      const t = clamp(V.dot(V.sub(p, a), ab) / (len * len), 0, 1);
      const q = { x: a.x + ab.x * t, y: a.y + ab.y * t };
      const dst = V.dist(p, q);
      if (dst < best.d) {
        const tan = V.unit(ab);
        const n = { x: tan.y, y: -tan.x };
        best = { s: acc + len * t, d: -V.dot(V.sub(p, a), n), idx: i, tangent: tan };
      }
      acc += len;
    }
    return best;
  }
  /* ---------- 几何求交与碰撞检测 ---------- */
  /** 线段求交 → {t,u}，无交返回 null */
  function segIntersect(a, b, c, d) {
    const r = V.sub(b, a), s = V.sub(d, c);
    const den = V.cross(r, s);
    if (Math.abs(den) < EPS) return null;
    const qp = V.sub(c, a);
    const t = V.cross(qp, s) / den, u = V.cross(qp, r) / den;
    if (t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS) return { t, u };
    return null;
  }
  /** 射线（origin + dir*t, 0≤t≤maxT）与线段求交 → 最近命中距离 或 null */
  function raySegment(origin, dir, maxT, c, d) {
    const r = V.scale(dir, maxT), s = V.sub(d, c);
    const den = V.cross(r, s);
    if (Math.abs(den) < EPS) return null;
    const qp = V.sub(c, origin);
    const t = V.cross(qp, s) / den, u = V.cross(qp, r) / den;
    if (t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS) return Math.max(0, t * maxT);
    return null;
  }
  function distPointSeg(p, a, b) {
    const ab = V.sub(b, a), len2 = V.dot(ab, ab);
    if (len2 < EPS) return V.dist(p, a);
    const t = clamp(V.dot(V.sub(p, a), ab) / len2, 0, 1);
    return V.dist(p, { x: a.x + ab.x * t, y: a.y + ab.y * t });
  }
  /** 有向矩形四角（中心、长、宽、朝向） */
  function rectCorners(cx, cy, len, wid, yaw) {
    const hx = len / 2, hy = wid / 2;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return [[hx, hy], [hx, -hy], [-hx, -hy], [-hx, hy]].map(function (pt) {
      return { x: cx + pt[0] * c - pt[1] * s, y: cy + pt[0] * s + pt[1] * c };
    });
  }
  function pointInRect(p, corners) {
    let sign = 0;
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i], b = corners[(i + 1) % corners.length];
      const cr = V.cross(V.sub(b, a), V.sub(p, a));
      if (Math.abs(cr) < EPS) continue;
      const sg = cr > 0 ? 1 : -1;
      if (sign === 0) sign = sg; else if (sg !== sign) return false;
    }
    return true;
  }
  /** 圆与有向矩形相交判定 */
  function circleRect(cx, cy, r, corners) {
    const p = { x: cx, y: cy };
    if (pointInRect(p, corners)) return true;
    for (let i = 0; i < corners.length; i++) {
      if (distPointSeg(p, corners[i], corners[(i + 1) % corners.length]) <= r) return true;
    }
    return false;
  }

  /* ---------- 多项式轨迹（Frenet 采样用） ---------- */
  /** 升幂系数多项式求值 */
  function polyEval(c, t) {
    let v = 0, p = 1;
    for (let i = 0; i < c.length; i++) { v += c[i] * p; p *= t; }
    return v;
  }
  function polyDeriv(c) {
    const d = [];
    for (let i = 1; i < c.length; i++) d.push(c[i] * i);
    return d.length ? d : [0];
  }
  function polyDeriv2(c) {
    const d = [];
    for (let i = 2; i < c.length; i++) d.push(c[i] * i * (i - 1));
    return d.length ? d : [0];
  }
  /** 五次多项式：给定两端 p/v/a 与时长 T → 升幂系数 */
  function quintic(p0, v0, a0, p1, v1, a1, T) {
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T, T5 = T4 * T;
    const c0 = p0, c1 = v0, c2 = a0 / 2;
    const A = [[T3, T4, T5], [3 * T2, 4 * T3, 5 * T4], [6 * T, 12 * T2, 20 * T3]];
    const rhs = [p1 - (c0 + c1 * T + c2 * T2), v1 - (c1 + 2 * c2 * T), a1 - 2 * c2];
    const x = solve3(A, rhs);
    return [c0, c1, c2, x[0], x[1], x[2]];
  }
  function solve3(A, b) {
    const M = A.map(function (row, i) { return row.concat([b[i]]); });
    for (let i = 0; i < 3; i++) {
      let pivot = i;
      for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > Math.abs(M[pivot][i])) pivot = r;
      const tmp = M[i]; M[i] = M[pivot]; M[pivot] = tmp;
      if (Math.abs(M[i][i]) < EPS) M[i][i] = EPS;
      for (let r = 0; r < 3; r++) {
        if (r === i) continue;
        const f = M[r][i] / M[i][i];
        for (let c = i; c < 4; c++) M[r][c] -= f * M[i][c];
      }
    }
    return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
  }
  /* ---------- 匈牙利算法（最小代价分配） ----------
   * 输入代价矩阵 cost[i][j]（可含 Infinity 表示禁止匹配）
   * 返回 assign[i] = j，未匹配为 -1。n > m 时内部转置。
   */
  function hungarian(cost) {
    const n0 = cost.length;
    if (n0 === 0) return [];
    const m0 = cost[0].length;
    if (m0 === 0) return new Array(n0).fill(-1);
    let C = cost, transposed = false;
    if (n0 > m0) {
      C = [];
      for (let j = 0; j < m0; j++) {
        const row = [];
        for (let i = 0; i < n0; i++) row.push(cost[i][j]);
        C.push(row);
      }
      transposed = true;
    }
    const n = C.length, m = C[0].length, INF = Number.POSITIVE_INFINITY;
    const u = new Array(n + 1).fill(0), v = new Array(m + 1).fill(0);
    const p = new Array(m + 1).fill(0), way = new Array(m + 1).fill(0);
    for (let i = 1; i <= n; i++) {
      p[0] = i;
      let j0 = 0;
      const minv = new Array(m + 1).fill(INF), used = new Array(m + 1).fill(false);
      do {
        used[j0] = true;
        const i0 = p[j0];
        let delta = INF, j1 = -1;
        for (let j = 1; j <= m; j++) {
          if (used[j]) continue;
          const cur = C[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
        if (!isFinite(delta)) break;
        for (let j = 0; j <= m; j++) {
          if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else { minv[j] -= delta; }
        }
        j0 = j1;
      } while (j0 >= 0 && p[j0] !== 0);
      if (j0 < 0) continue;
      do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
    }
    if (transposed) {
      const inv = new Array(m).fill(-1);
      for (let j = 1; j <= m; j++) if (p[j]) inv[j - 1] = p[j] - 1;
      const out = new Array(n0).fill(-1);
      for (let j = 0; j < m; j++) if (inv[j] >= 0) out[inv[j]] = j;
      return out;
    }
    const assign = new Array(n).fill(-1);
    for (let j = 1; j <= m; j++) if (p[j]) assign[p[j] - 1] = j - 1;
    return assign;
  }

  /* ---------- 可复现随机数与滤波 ---------- */
  /** mulberry32：同种子 → 同序列（自检可复现的关键） */
  function Rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** 标准正态（Box-Muller）：传感器噪声用 */
  function gaussian(rng) {
    let u = 0, v = 0;
    while (u <= EPS) u = rng();
    while (v <= EPS) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  }
  function lowpass(prev, x, alpha) { return prev + alpha * (x - prev); }

  return {
    EPS, clamp, lerp, deg, rad, normAngle, angleDiff,
    V, worldToLocal, localToWorld, samplePath, pathLength, projectOnPath,
    segIntersect, raySegment, distPointSeg, rectCorners, pointInRect, circleRect,
    polyEval, polyDeriv, polyDeriv2, quintic,
    hungarian, Rng, gaussian, lowpass
  };
});
