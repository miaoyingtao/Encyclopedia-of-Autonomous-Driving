/* ADSim - 模块实验室（Lab）
 * 让每个模块可以被单独实验：调参数、只跑该模块、看专用图表。
 * 设计：每个 lab 自带一个独立的仿真实例（不干扰主实验台），
 *       参数改动 → 重建场景/sim → 跑固定步数 → 收集序列 → 画图。
 * 依赖：ADSim（core/*、scenarios.js、opendrive.js），在 ui.js 之后加载。
 */
(function (root) {
  "use strict";
  const A = root.ADSim = root.ADSim || {};
  const M = A.M;

  const STEPS = 420;          // 每个 lab 的运行步数
  const DT = 0.05;

  /* ---------- 基础绘图工具（canvas） ---------- */
  function axes(ctx, w, h, pad, yLabel) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, 10); ctx.lineTo(pad, h - pad); ctx.lineTo(w - 10, h - pad);
    ctx.stroke();
    ctx.fillStyle = "#8b949e";
    ctx.font = "11px ui-monospace, Menlo, Consolas, monospace";
    if (yLabel) ctx.fillText(yLabel, pad + 4, 14);
  }
  function series(ctx, values, x0, x1, y0, y1, pad, w, h, color, width) {
    if (!values.length) return;
    const sx = function (i) { return pad + (w - pad - 12) * (i / Math.max(1, values.length - 1)); };
    const sy = function (v) { return (h - pad) - (h - pad - 14) * ((v - y0) / (y1 - y0 || 1)); };
    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
      const px = sx(i), py = Math.max(10, Math.min(h - pad, sy(values[i])));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = color; ctx.lineWidth = width || 1.6; ctx.stroke();
  }
  function bars(ctx, items, pad, w, h) {
    if (!items.length) return;
    const maxV = Math.max.apply(null, items.map(function (it) { return it.value; }).concat([1e-6]));
    const bw = (w - pad - 16) / items.length;
    ctx.font = "11px ui-monospace, Menlo, Consolas, monospace";
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const bh = (h - pad - 34) * (it.value / maxV);
      const x = pad + 6 + i * bw, y = (h - pad - 16) - bh;
      ctx.fillStyle = it.color || "#2f81f7";
      ctx.fillRect(x + 4, y, Math.max(6, bw - 10), bh);
      ctx.fillStyle = "#c9d1d9";
      ctx.fillText(it.label, x + 4, h - pad - 2);
      ctx.fillStyle = "#8b949e";
      ctx.fillText(it.text !== undefined ? it.text : it.value.toFixed(2), x + 4, y - 3);
    }
  }
  function timeline(ctx, statesList, pad, w, h, colorOf) {
    const n = statesList.length;
    if (!n) return;
    const bw = (w - pad - 12) / n;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = colorOf(statesList[i]);
      ctx.fillRect(pad + i * bw, h - pad - 22, Math.max(1, bw + 0.5), 18);
    }
  }
  /* ---------- 场景/仿真装配（只覆盖 lab 关心的字段，不改动原场景） ---------- */
  function cloneScene(base, patch) {
    const s = {};
    for (const k in base) s[k] = base[k];
    for (const k in (patch || {})) {
      const v = patch[k];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const merged = {};
        for (const kk in base[k]) merged[kk] = base[k][kk];
        for (const kk in v) merged[kk] = v[kk];
        s[k] = merged;
      } else { s[k] = v; }
    }
    return s;
  }
  function runScene(sceneId, steps, patch, collect) {
    const base = A.scenarios.get(sceneId);
    const scene = cloneScene(base, patch);
    const sim = A.Sim.createSimulation(scene, { dt: DT, seed: 20260917 });
    const data = collect ? collect.init() : {};
    for (let i = 0; i < steps; i++) {
      const f = sim.step();
      if (collect) collect.step(f, data, sim);
    }
    return { scene: scene, sim: sim, summary: sim.summary(), data: data };
  }
  /** 真值 → 最近 track 的距离（感知误差） */
  function truthError(frame, sim) {
    const truth = sim.world.obstacles();
    let sum = 0, n = 0;
    for (let i = 0; i < truth.length; i++) {
      const o = truth[i];
      let best = Infinity;
      for (let k = 0; k < frame.tracks.length; k++) {
        const dd = Math.hypot(o.veh.x - frame.tracks[k].x, o.veh.y - frame.tracks[k].y);
        if (dd < best) best = dd;
      }
      if (isFinite(best) && best < 25) { sum += best; n++; }
    }
    return n ? sum / n : 0;
  }
  function mean(arr) {
    if (!arr.length) return 0;
    let s = 0;
    for (let i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }
  function percent(counts, total) {
    const out = {};
    for (const k in counts) out[k] = counts[k] / Math.max(1, total);
    return out;
  }

  /* ---------- 五个实验室 ---------- */
  const LABS = [
    {
      id: "perception", title: "感知",
      desc: "改激光与聚类参数，看“点云 → 检测 → 跟踪”的质量如何变化。曲线是每步的平均跟踪误差（估计位置与真值的距离）。",
      scene: "cut-in",
      params: [
        { key: "beams", label: "激光波束数", min: 61, max: 721, step: 40, value: 481 },
        { key: "rangeSigma", label: "测距噪声 σ(m)", min: 0, max: 0.3, step: 0.01, value: 0.03 },
        { key: "clusterMinPts", label: "聚类最小点数", min: 1, max: 6, step: 1, value: 2 },
        { key: "clusterEps", label: "聚类邻域(m)", min: 0.6, max: 3, step: 0.2, value: 1.6 }
      ],
      run: function (p) {
        const r = runScene(this.scene, STEPS, {
          lidar: { beams: p.beams, rangeSigma: p.rangeSigma, clusterMinPts: p.clusterMinPts, clusterEps: p.clusterEps }
        }, {
          init: function () { return { err: [], pts: 0, tracks: 0, n: 0, lastFrame: null }; },
          step: function (f, d, sim) {
            d.err.push(truthError(f, sim));
            d.pts += f.points.length; d.tracks += f.tracks.length; d.n++;
            d.lastFrame = f;
          }
        });
        const d = r.data;
        const last = d.lastFrame;
        return {
          charts: [
            { type: "series", title: "平均跟踪误差 (m) / 步", series: [{ values: d.err, color: "#3fb950", label: "误差" }] },
            { type: "bars", title: "本步统计", items: [
              { label: "点数", value: last.points.length, color: "#58a6ff" },
              { label: "簇", value: last.clusters.length, color: "#d29922" },
              { label: "轨迹", value: last.tracks.length, color: "#3fb950" }
            ] }
          ],
          stats: [
            ["平均跟踪误差", mean(d.err).toFixed(3) + " m"],
            ["平均点数/步", (d.pts / Math.max(1, d.n)).toFixed(1)],
            ["平均轨迹数/步", (d.tracks / Math.max(1, d.n)).toFixed(2)],
            ["运行步数", String(STEPS)]
          ]
        };
      }
    },
    {
      id: "prediction", title: "预测",
      desc: "在上一步的跟踪结果上重跑预测：调预测时域与行为假设，看多模态分叉与概率如何变化。",
      scene: "cut-in",
      params: [
        { key: "horizon", label: "预测时域(s)", min: 1, max: 5, step: 0.5, value: 3 },
        { key: "decelMode", label: "减速假设(m/s²)", min: -4, max: -0.5, step: 0.2, value: -1.8 },
        { key: "laneChangeOffset", label: "变道偏移(m)", min: 2, max: 5, step: 0.25, value: 3.5 }
      ],
      run: function (p) {
        const r = runScene(this.scene, 140, null, {
          init: function () { return { lastFrame: null, tracks: [] }; },
          step: function (f, d) { d.lastFrame = f; d.tracks = f.tracks; }
        });
        const road = r.sim.world.road;
        const preds = A.Prediction.predict(r.data.tracks, {
          road: road, cfg: { horizon: p.horizon, decelMode: p.decelMode, laneChangeOffset: p.laneChangeOffset }
        });
        const first = preds[0];
        const items = first ? first.modes.map(function (m) {
          return { label: m.name, value: m.prob, text: (m.prob * 100).toFixed(0) + "%", color: "#db61a2" };
        }) : [];
        return {
          charts: [
            { type: "bars", title: "首个目标的模态概率", items: items },
            { type: "bars", title: "预测规模", items: [
              { label: "目标", value: preds.length, color: "#58a6ff" },
              { label: "模态", value: preds.reduce(function (a, x) { return a + x.modes.length; }, 0), color: "#db61a2" },
              { label: "轨迹点", value: first ? first.modes.length * first.modes[0].traj.length : 0, color: "#3fb950" }
            ] }
          ],
          stats: [
            ["预测目标数", String(preds.length)],
            ["模态构成", first ? first.modes.map(function (m) { return m.name + " " + (m.prob * 100).toFixed(0) + "%"; }).join(" / ") : "-"],
            ["主导模态", first ? first.primary.name : "-"],
            ["时域 / 步长", p.horizon + " s / " + A.Prediction.PREDICT_DEFAULT.dt + " s"]
          ]
        };
      }
    },
    {
      id: "decision", title: "决策",
      desc: "调状态机阈值，看决策状态序列如何变化。时间线是每一步的状态；统计给出状态占比与切换次数。",
      scene: "cut-in",
      params: [
        { key: "ttcEmergency", label: "紧急制动 TTC(s)", min: 1, max: 5, step: 0.2, value: 2.2 },
        { key: "timeGap", label: "期望时距(s)", min: 0.8, max: 3, step: 0.1, value: 1.6 },
        { key: "minGap", label: "最小净间距(m)", min: 1.5, max: 8, step: 0.5, value: 3 },
        { key: "yieldGap", label: "让行关注距离(m)", min: 8, max: 40, step: 2, value: 22 }
      ],
      run: function (p) {
        const r = runScene(this.scene, STEPS, {
          decision: { ttcEmergency: p.ttcEmergency, timeGap: p.timeGap, minGap: p.minGap, yieldGap: p.yieldGap }
        }, {
          init: function () { return { states: [], counts: {}, switches: 0, last: null }; },
          step: function (f, d) {
            const n = f.decision.name;
            d.states.push(n);
            d.counts[n] = (d.counts[n] || 0) + 1;
            if (d.last && d.last !== n) d.switches++;
            d.last = n;
          }
        });
        const colors = {
          CRUISE: "#3fb950", FOLLOW: "#2f81f7", LANE_CHANGE: "#d29922",
          YIELD: "#db61a2", STOP: "#f0883e", EMERGENCY: "#f85149"
        };
        const ratio = percent(r.data.counts, STEPS);
        return {
          charts: [
            { type: "timeline", title: "决策状态时间线（每一步一格）", states: r.data.states, colors: colors },
            { type: "bars", title: "状态占比", items: Object.keys(ratio).map(function (k) {
              return { label: k.slice(0, 7), value: ratio[k], text: (ratio[k] * 100).toFixed(0) + "%", color: colors[k] || "#58a6ff" };
            }) }
          ],
          stats: [
            ["状态切换次数", String(r.data.switches)],
            ["里程", r.summary.distance.toFixed(1) + " m"],
            ["最小 TTC", r.summary.minTTC === null ? "-" : r.summary.minTTC + " s"],
            ["最小间隙", r.summary.minClearance + " m"],
            ["碰撞", String(r.summary.collisions)]
          ]
        };
      }
    },
    {
      id: "planning", title: "规划",
      desc: "调代价权重，看最优轨迹如何改变。条形图是最优候选的代价分量（越小越好，碰撞会加 1000 惩罚）。",
      scene: "workzone",
      params: [
        { key: "safety", label: "安全权重", min: 0, max: 30, step: 1, value: 12 },
        { key: "lateral", label: "横向舒适权重", min: 0, max: 2, step: 0.05, value: 0.25 },
        { key: "laneBias", label: "车道一致权重", min: 0, max: 6, step: 0.25, value: 2.5 },
        { key: "efficiency", label: "效率权重", min: 0, max: 3, step: 0.1, value: 1 }
      ],
      run: function (p) {
        const r = runScene(this.scene, STEPS, {
          planning: {
            weights: {
              safety: p.safety, lateral: p.lateral, jerk: 0.4,
              efficiency: p.efficiency, laneBias: p.laneBias, boundary: 8.0
            }
          }
        }, {
          init: function () { return { best: null, feasible: 0, total: 0, at: 200 }; },
          step: function (f, d) {
            if (f.stepIndex === d.at && f.plan && f.plan.best) {
              d.best = f.plan.best; d.feasible = f.plan.feasible; d.total = f.plan.total;
            }
          }
        });
        const b = r.data.best;
        const parts = b ? b.costParts : null;
        const items = parts ? Object.keys(parts).map(function (k) {
          return { label: k, value: parts[k], text: parts[k].toFixed(2), color: "#f0883e" };
        }) : [];
        return {
          charts: [
            { type: "bars", title: "最优候选的代价分量（第 " + r.data.at + " 步）", items: items },
            { type: "bars", title: "候选与可行性", items: [
              { label: "候选", value: r.data.total, color: "#58a6ff" },
              { label: "可行", value: r.data.feasible, color: "#3fb950" },
              { label: "碰撞", value: Math.max(0, r.data.total - r.data.feasible), color: "#f85149" }
            ] }
          ],
          stats: [
            ["最优横向偏移", b ? b.lateralOffset.toFixed(2) + " m" : "-"],
            ["最优总代价", b ? b.cost.toFixed(2) : "-"],
            ["最小碰撞间隙", b ? b.collision.minClearance.toFixed(2) + " m" : "-"],
            ["里程 / 碰撞", r.summary.distance.toFixed(1) + " m / " + r.summary.collisions]
          ]
        };
      }
    },
    {
      id: "control", title: "控制",
      desc: "调前视距离与 PID 增益，看速度跟踪与横向误差。蓝=目标速度，绿=实际速度，橙=横向偏差，粉=|前轮转角|。",
      scene: "s-curve",
      params: [
        { key: "lookaheadBase", label: "前视基准(m)", min: 1, max: 12, step: 0.5, value: 4.2 },
        { key: "lookaheadGain", label: "前视增益(s)", min: 0, max: 1.5, step: 0.05, value: 0.6 },
        { key: "kp", label: "PID Kp", min: 0, max: 3, step: 0.05, value: 1.1 },
        { key: "ki", label: "PID Ki", min: 0, max: 1.5, step: 0.05, value: 0.35 },
        { key: "kd", label: "PID Kd", min: 0, max: 0.4, step: 0.01, value: 0.06 }
      ],
      run: function (p) {
        const r = runScene(this.scene, STEPS, {
          control: {
            lookaheadBase: p.lookaheadBase, lookaheadGain: p.lookaheadGain,
            kp: p.kp, ki: p.ki, kd: p.kd
          }
        }, {
          init: function () { return { vTgt: [], vAct: [], latErr: [], steer: [] }; },
          step: function (f, d, sim) {
            d.vTgt.push(f.decision.targetSpeed);
            d.vAct.push(sim.world.ego.v);
            const proj = M.projectOnPath({ x: sim.world.ego.x, y: sim.world.ego.y }, sim.world.road.ref);
            const lane = sim.world.road.laneCenters[f.decision.targetLane] !== undefined
              ? sim.world.road.laneCenters[f.decision.targetLane] : proj.d;
            d.latErr.push(proj.d - lane);
            d.steer.push(Math.abs(f.command ? f.command.steerCmd : 0));
          }
        });
        const d = r.data;
        let sq = 0;
        for (let i = 0; i < d.vTgt.length; i++) sq += Math.pow(d.vTgt[i] - d.vAct[i], 2);
        const absLat = d.latErr.map(Math.abs);
        return {
          charts: [
            { type: "series", title: "速度：目标 vs 实际 (m/s)", series: [
              { values: d.vTgt, color: "#2f81f7" }, { values: d.vAct, color: "#3fb950" }] },
            { type: "series", title: "横向偏差 (m) 与 |前轮转角| (rad)", series: [
              { values: d.latErr, color: "#f0883e" }, { values: d.steer, color: "#db61a2" }] }
          ],
          stats: [
            ["速度跟踪 RMSE", Math.sqrt(sq / Math.max(1, d.vTgt.length)).toFixed(3) + " m/s"],
            ["平均 |横向偏差|", mean(absLat).toFixed(3) + " m"],
            ["最大 |横向偏差|", Math.max.apply(null, absLat.concat([0])).toFixed(3) + " m"],
            ["最大 |前轮转角|", (Math.max.apply(null, d.steer.concat([0])) * 180 / Math.PI).toFixed(1) + "°"],
            ["里程 / 碰撞", r.summary.distance.toFixed(0) + " m / " + r.summary.collisions]
          ]
        };
      }
    }
  ];

  /* ---------- UI 挂载：在实验台下方追加实验室面板 ---------- */
  function mount(host) {
    if (typeof document === "undefined") return null;
    const base = host || document.getElementById("adsim-root");
    if (!base || !base.parentNode) return null;
    if (base.parentNode.querySelector(".adsim-lab")) return null;

    const box = document.createElement("section");
    box.className = "adsim-lab";
    box.innerHTML =
      '<h3 class="adsim-lab-title">模块实验室 <small>单独调参、单独观察；用独立的仿真实例运行，不影响上方主实验台</small></h3>' +
      '<div class="adsim-lab-tabs">' + LABS.map(function (l) {
        return '<button class="adsim-btn" data-lab="' + l.id + '">' + l.title + "</button>";
      }).join("") + "</div>" +
      '<p class="adsim-lab-desc" data-out="desc"></p>' +
      '<div class="adsim-lab-body">' +
      '  <div class="adsim-lab-params" data-out="params"></div>' +
      '  <div class="adsim-lab-charts" data-out="charts"></div>' +
      "</div>" +
      '<div class="adsim-lab-foot">' +
      '<button class="adsim-btn adsim-btn--run" data-act="run">▶ 运行本实验</button>' +
      '<span class="adsim-lab-stats" data-out="stats"></span></div>';
    base.parentNode.insertBefore(box, base.nextSibling);

    let current = LABS[0];
    let values = {};
    const descEl = box.querySelector('[data-out="desc"]');
    const paramsEl = box.querySelector('[data-out="params"]');
    const chartsEl = box.querySelector('[data-out="charts"]');
    const statsEl = box.querySelector('[data-out="stats"]');

    function buildParams() {
      values = {};
      paramsEl.innerHTML = current.params.map(function (pr) {
        values[pr.key] = pr.value;
        return '<label class="adsim-lab-param"><span>' + pr.label + "</span>" +
          '<input type="range" min="' + pr.min + '" max="' + pr.max + '" step="' + pr.step +
          '" value="' + pr.value + '" data-param="' + pr.key + '">' +
          '<b data-val="' + pr.key + '">' + pr.value + "</b></label>";
      }).join("");
    }
    function buildCharts() {
      chartsEl.innerHTML = "";
      for (let i = 0; i < 2; i++) {
        const fig = document.createElement("figure");
        fig.className = "adsim-lab-chart";
        const cap = document.createElement("figcaption");
        const cv = document.createElement("canvas");
        cv.width = 640; cv.height = 200;
        fig.appendChild(cap); fig.appendChild(cv);
        chartsEl.appendChild(fig);
      }
    }
    function drawCharts(result) {
      const figs = chartsEl.children;
      for (let i = 0; i < figs.length; i++) {
        const chart = result.charts[i];
        const cv = figs[i].children[1];
        const ctx = cv.getContext("2d");
        const w = cv.width, h = cv.height, pad = 34;
        figs[i].children[0].textContent = chart ? chart.title : "";
        if (!chart) { axes(ctx, w, h, pad); continue; }
        if (chart.type === "series") {
          axes(ctx, w, h, pad);
          for (let k = 0; k < chart.series.length; k++) {
            const s = chart.series[k];
            let lo = Infinity, hi = -Infinity;
            for (let j = 0; j < s.values.length; j++) {
              if (s.values[j] < lo) lo = s.values[j];
              if (s.values[j] > hi) hi = s.values[j];
            }
            if (!isFinite(lo)) continue;
            if (hi - lo < 1e-6) hi = lo + 1;
            const m = (hi - lo) * 0.12;
            series(ctx, s.values, 0, 1, lo - m, hi + m, pad, w, h, s.color || "#2f81f7", 1.7);
          }
        } else if (chart.type === "bars") {
          axes(ctx, w, h, pad);
          bars(ctx, chart.items, pad, w, h);
        } else if (chart.type === "timeline") {
          axes(ctx, w, h, pad);
          timeline(ctx, chart.states, pad, w, h, function (name) { return chart.colors[name] || "#484f58"; });
          ctx.fillStyle = "#8b949e";
          ctx.font = "11px ui-monospace, Menlo, Consolas, monospace";
          ctx.fillText("共 " + chart.states.length + " 步（每格一步）", pad + 4, h - pad - 28);
        }
      }
    }
    function runLab() {
      const nowMs = function () { return (typeof performance !== "undefined" ? performance.now() : Date.now()); };
      const t0 = nowMs();
      let result;
      try {
        result = current.run(values);
      } catch (err) {
        statsEl.textContent = "运行失败：" + (err && err.message ? err.message : String(err));
        return;
      }
      const ms = nowMs() - t0;
      drawCharts(result);
      statsEl.innerHTML = (result.stats || []).map(function (s) {
        return '<span class="adsim-lab-stat"><i>' + s[0] + "</i>" + s[1] + "</span>";
      }).join("") + '<span class="adsim-lab-stat"><i>本次耗时</i>' + ms.toFixed(0) + " ms</span>";
    }
    function selectLab(id) {
      for (let i = 0; i < LABS.length; i++) if (LABS[i].id === id) current = LABS[i];
      const btns = box.querySelectorAll("[data-lab]");
      for (let i = 0; i < btns.length; i++) {
        if (btns[i].getAttribute("data-lab") === current.id) btns[i].classList.add("is-active");
        else btns[i].classList.remove("is-active");
      }
      descEl.textContent = current.desc;
      buildParams();
      buildCharts();
      runLab();
    }
    box.addEventListener("click", function (e) {
      const t = e.target;
      const labId = t && t.getAttribute ? t.getAttribute("data-lab") : null;
      if (labId) { selectLab(labId); return; }
      const act = t && t.getAttribute ? t.getAttribute("data-act") : null;
      if (act === "run") runLab();
    });
    box.addEventListener("input", function (e) {
      const key = e.target && e.target.getAttribute ? e.target.getAttribute("data-param") : null;
      if (!key) return;
      values[key] = parseFloat(e.target.value);
      const b = box.querySelector('[data-val="' + key + '"]');
      if (b) b.textContent = e.target.value;
    });
    selectLab(LABS[0].id);
    return { element: box, run: function () { runLab(); }, select: selectLab };
  }

  A.Labs = { LABS: LABS, mount: mount, runScene: runScene, _draw: { axes: axes, series: series, bars: bars, timeline: timeline } };

  /* 自动挂载：页面存在 #adsim-root 时，在它下面追加实验室面板 */
  if (typeof document !== "undefined") {
    const bootLabs = function () {
      const host = document.getElementById("adsim-root");
      if (host && host.parentNode) A.Labs.mount(host);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootLabs);
    else bootLabs();
  }

}(typeof window !== "undefined" ? window : globalThis));
