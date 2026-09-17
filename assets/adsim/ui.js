/* ADSim - 浏览器界面：渲染 + 交互
 * 依赖：window.ADSim（core/*.js 与 scenarios.js 需先按序加载）
 * 用法：ADSim.UI.mount(document.getElementById('adsim-root'), { scene: 'cut-in' })
 */
(function (root) {
  "use strict";
  const A = root.ADSim = root.ADSim || {};
  const M = A.M;

  const LAYERS = [
    { id: "raw", name: "原始感知（激光点云）", on: true },
    { id: "det", name: "检测与跟踪", on: true },
    { id: "pred", name: "预测轨迹", on: true },
    { id: "plan", name: "规划候选与最优", on: true },
    { id: "ctrl", name: "控制量与参照", on: true }
  ];

  const COLORS = {
    bg: "#0d1117", road: "#161b22", laneLine: "#3d444d", edge: "#57606a",
    ego: "#2f81f7", actor: "#8b949e", ped: "#d29922", staticObs: "#f0883e",
    points: "#58a6ff", det: "#3fb950", track: "#39d353", pred: "#db61a2",
    planCand: "#484f58", planBest: "#3fb950", ctrl: "#f778ba", text: "#c9d1d9"
  };

  function fmt(v, n) {
    if (v === null || v === undefined) return "-";
    if (typeof v === "number") return isFinite(v) ? v.toFixed(n === undefined ? 1 : n) : "∞";
    return String(v);
  }

  function mount(rootEl, opts) {
    const options = Object.assign({ scene: null, width: 900, height: 560, pxPerM: 6.5, speed: 1 }, opts || {});
    const sceneIds = A.scenarios.ids();
    let scene = A.scenarios.get(options.scene || sceneIds[0]);
    let sim = A.Sim.createSimulation(scene, { dt: 0.05, seed: 20260917 });
    let playing = false, speed = options.speed, acc = 0, lastTs = 0;
    let started = false;
    let frame = null, selfTestResult = null;
    const layers = {};
    LAYERS.forEach(function (l) { layers[l.id] = l.on; });

    rootEl.innerHTML = "";
    rootEl.classList.add("adsim");

    /* ---------- DOM 骨架 ---------- */
    const bar = document.createElement("div");
    bar.className = "adsim-bar";
    bar.innerHTML =
      '<button class="adsim-btn adsim-btn--run" data-act="play">▶ 开始运行</button>' +
      '<button class="adsim-btn" data-act="step">⏭ 单步</button>' +
      '<button class="adsim-btn" data-act="reset">↺ 重置</button>' +
      '<label class="adsim-sel">场景<select data-act="scene">' +
      sceneIds.map(function (id) {
        return '<option value="' + id + '"' + (id === scene.id ? " selected" : "") + '>' +
          A.scenarios.get(id).title + '</option>';
      }).join("") + '</select></label>' +
      '<label class="adsim-sel">速度<select data-act="speed">' +
      [0.5, 1, 2, 4].map(function (s) {
        return '<option value="' + s + '"' + (s === 1 ? " selected" : "") + '>' + s + "×</option>";
      }).join("") + '</select></label>' +
      '<span class="adsim-clock" data-out="clock">t = 0.00 s</span>';

    const layerBox = document.createElement("div");
    layerBox.className = "adsim-layers";
    layerBox.innerHTML = LAYERS.map(function (l) {
      return '<label><input type="checkbox" data-layer="' + l.id + '"' + (l.on ? " checked" : "") + '>' +
        l.name + '</label>';
    }).join("");

    const canvas = document.createElement("canvas");
    canvas.className = "adsim-canvas";
    const ctx = canvas.getContext("2d");

    const side = document.createElement("aside");
    side.className = "adsim-side";

    const wrap = document.createElement("div");
    wrap.className = "adsim-wrap";
    wrap.appendChild(canvas);
    wrap.appendChild(side);

    const foot = document.createElement("div");
    foot.className = "adsim-foot";
    foot.innerHTML =
      '<div class="adsim-pipeline">' +
      ["感知", "预测", "决策", "规划", "控制"].map(function (n, i) {
        return '<span class="adsim-stage" data-stage="' + i + '">' + n +
          '<b data-t="' + i + '">-</b></span>' + (i < 4 ? '<i class="adsim-arrow">→</i>' : "");
      }).join("") +
      '</div>' +
      '<div class="adsim-note">算法为真实的简化实现：射线投射感知 → 卡尔曼跟踪 → CTRV 预测 → 有限状态机决策 → Frenet 采样规划 → Pure Pursuit + PID 控制。<b>输入</b>由仿真世界产生。</div>';

    rootEl.appendChild(bar);
    rootEl.appendChild(layerBox);
    rootEl.appendChild(wrap);
    rootEl.appendChild(foot);

    const panel = document.createElement("div");
    panel.className = "adsim-panel";
    panel.innerHTML = '<button class="adsim-btn" data-act="selftest">运行自检（3 场景 × 约 600 步）</button>' +
      '<pre class="adsim-report" data-out="selftest">点击运行：会用固定随机种子跑完三个场景并逐条核对断言。</pre>';
    rootEl.appendChild(panel);
    /* ---------- 视图：自车居中偏下、车头朝上 ---------- */
    const view = { w: options.width, h: options.height, scale: options.pxPerM };
    function fitCanvas() {
      const dpr = root.devicePixelRatio || 1;
      const w = Math.max(320, wrap.clientWidth || options.width);
      const h = Math.max(300, Math.round(w * 0.6));
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view.w = w; view.h = h;
    }
    function toScreen(p, ego) {
      const dx = p.x - ego.x, dy = p.y - ego.y;
      const c = Math.cos(ego.yaw), s = Math.sin(ego.yaw);
      const lx = dx * c + dy * s, ly = -dx * s + dy * c;
      return { x: view.w / 2 - ly * view.scale, y: view.h * 0.7 - lx * view.scale };
    }
    function pathPoly(pts, ego, close) {
      if (!pts || !pts.length) return false;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const q = toScreen(pts[i], ego);
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      }
      if (close) ctx.closePath();
      return true;
    }
    function drawBox(ego, cx, cy, len, wid, yaw, fill, stroke) {
      const cs = M.rectCorners(cx, cy, len, wid, yaw);
      if (!pathPoly(cs, ego, true)) return;
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
    }
    function drawRoad(ego) {
      const road = sim.world.road;
      const halfW = road.laneWidth * road.laneCenters.length;
      pathPoly([{ x: ego.x - 45, y: 0 }, { x: ego.x + 130, y: 0 },
                { x: ego.x + 130, y: halfW }, { x: ego.x - 45, y: halfW }], ego, true);
      ctx.fillStyle = COLORS.road; ctx.fill();
      ctx.strokeStyle = COLORS.edge; ctx.lineWidth = 1.5; ctx.stroke();
      for (let i = 1; i < road.laneCenters.length; i++) {
        const d = road.laneWidth * i;
        pathPoly([{ x: ego.x - 45, y: d }, { x: ego.x + 130, y: d }], ego, false);
        ctx.strokeStyle = COLORS.laneLine; ctx.lineWidth = 1.4;
        ctx.setLineDash([9, 7]); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    function drawScene() {
      const ego = sim.world.ego, road = sim.world.road;
      ctx.clearRect(0, 0, view.w, view.h);
      ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, view.w, view.h);
      drawRoad(ego);

      // 静态障碍（真值轮廓，用于与感知结果对照）
      for (let i = 0; i < sim.world.statics.length; i++) {
        const s = sim.world.statics[i];
        drawBox(ego, s.veh.x, s.veh.y, s.veh.length, s.veh.width, s.veh.yaw,
          "rgba(240,136,62,0.5)", COLORS.staticObs);
      }
      // 其他交通参与者（真值轮廓）
      for (let i = 0; i < sim.world.actors.length; i++) {
        const a = sim.world.actors[i];
        const sz = a.kind === "pedestrian"
          ? [a.radius * 1.4, a.radius * 1.4] : [a.veh.length, a.veh.width];
        drawBox(ego, a.veh.x, a.veh.y, sz[0], sz[1], a.veh.yaw,
          a.kind === "pedestrian" ? "rgba(210,153,34,0.9)" : "rgba(139,148,158,0.85)", COLORS.text);
      }
      // 图层：原始感知
      if (layers.raw && frame) {
        ctx.fillStyle = COLORS.points;
        for (let i = 0; i < frame.points.length; i++) {
          const q = toScreen(frame.points[i], ego);
          ctx.fillRect(q.x - 1.1, q.y - 1.1, 2.2, 2.2);
        }
      }
      // 图层：检测与跟踪
      if (layers.det && frame) {
        for (let i = 0; i < frame.tracks.length; i++) {
          const tr = frame.tracks[i];
          const sz = tr.size || { length: 4.6, width: 1.9 };
          drawBox(ego, tr.x, tr.y, sz.length, sz.width, tr.yaw || 0, null, COLORS.det);
          ctx.beginPath();
          for (let k = 0; k < tr.history.length; k++) {
            const q = toScreen(tr.history[k], ego);
            if (k === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          }
          ctx.strokeStyle = "rgba(63,185,80,0.45)"; ctx.lineWidth = 1; ctx.stroke();
          const q = toScreen({ x: tr.x, y: tr.y }, ego);
          const q2 = toScreen({ x: tr.x + tr.vx * 1.2, y: tr.y + tr.vy * 1.2 }, ego);
          ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q2.x, q2.y);
          ctx.strokeStyle = COLORS.det; ctx.lineWidth = 2; ctx.stroke();
        }
      }
      // 图层：预测轨迹（越粗 = 概率越高）
      if (layers.pred && frame) {
        for (let i = 0; i < frame.predictions.length; i++) {
          const modes = frame.predictions[i].modes;
          for (let k = 0; k < modes.length; k++) {
            ctx.globalAlpha = 0.25 + 0.6 * modes[k].prob;
            pathPoly(modes[k].traj, ego, false);
            ctx.strokeStyle = COLORS.pred; ctx.lineWidth = 1.6; ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      // 图层：规划候选（红=判定为碰撞）与最优轨迹
      if (layers.plan && frame && frame.plan && frame.plan.best) {
        for (let i = 0; i < frame.plan.candidates.length; i++) {
          const cand = frame.plan.candidates[i];
          if (cand === frame.plan.best) continue;
          ctx.globalAlpha = cand.collision.collided ? 0.18 : 0.3;
          pathPoly(cand.traj, ego, false);
          ctx.strokeStyle = cand.collision.collided ? "#f85149" : COLORS.planCand;
          ctx.lineWidth = 1.1; ctx.stroke(); ctx.globalAlpha = 1;
        }
        pathPoly(frame.plan.best.traj, ego, false);
        ctx.strokeStyle = COLORS.planBest; ctx.lineWidth = 2.6; ctx.stroke();
      }
      // 图层：控制量（前视点）
      if (layers.ctrl && frame && frame.command && frame.command.debug.targetPoint) {
        const tp = frame.command.debug.targetPoint;
        const q = toScreen(tp, ego);
        ctx.beginPath(); ctx.arc(q.x, q.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.ctrl; ctx.fill();
      }
      // 自车（最后绘制）
      drawBox(ego, ego.x, ego.y, ego.length, ego.width, ego.yaw, COLORS.ego, "#f0f6fc");
      // 未启动时的引导遮罩
      if (!started) {
        ctx.fillStyle = "rgba(13,17,23,0.74)";
        ctx.fillRect(0, view.h * 0.5 - 48, view.w, 96);
        ctx.textAlign = "center";
        ctx.fillStyle = COLORS.planBest;
        ctx.font = "600 18px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("点击左上角「▶ 开始运行」启动闭环仿真", view.w / 2, view.h * 0.5 - 8);
        ctx.fillStyle = COLORS.text;
        ctx.font = "13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("感知 → 预测 → 决策 → 规划 → 控制，每步 20 ms；可暂停、可单步、可逐层查看中间结果",
          view.w / 2, view.h * 0.5 + 22);
        ctx.textAlign = "left";
      }
      // 画布上的关键读数
      if (frame) {
        ctx.fillStyle = COLORS.text;
        ctx.font = "13px ui-monospace, Menlo, Consolas, monospace";
        ctx.fillText("决策 " + frame.decision.name + "　目标 " + fmt(frame.decision.targetSpeed, 1) +
          " m/s　实际 " + fmt(sim.world.ego.v, 1) + " m/s", 12, 20);
        ctx.fillText("t = " + fmt(frame.time, 2) + " s　步 " + frame.stepIndex, 12, 38);
        if (frame.decision.lead) {
          ctx.fillText("前车 " + frame.decision.lead.id + "：gap " + fmt(frame.decision.lead.gap, 1) +
            " m　TTC " + fmt(frame.decision.lead.ttc, 1) + " s", 12, 56);
        }
      }
    }
    /* ---------- 侧栏面板 ---------- */
    const DOC = {
      perception: "../tech/perception.html", prediction: "../tech/decision.html",
      decision: "../tech/decision.html", planning: "../tech/decision.html", control: "../tech/control.html"
    };
    function card(title, rows, docKey) {
      const body = rows.map(function (r) {
        return '<div class="adsim-kv"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
      }).join("");
      const link = docKey
        ? '<div class="adsim-link"><a href="' + DOC[docKey] + '">深入阅读 →</a></div>' : "";
      return '<div class="adsim-card"><h5>' + title + '</h5>' + body + link + '</div>';
    }
    function updateSide(f) {
      if (!f) return;
      const t = f.timings, d = f.decision, p = f.plan, c = f.command;
      const best = p && p.best;
      const speeds = f.tracks.map(function (x) { return Math.hypot(x.vx, x.vy).toFixed(1); });
      side.innerHTML =
        card("① 感知 Perception", [
          ["激光点数", f.points.length], ["聚类簇", f.clusters.length],
          ["确认轨迹", f.tracks.length],
          ["目标速度估计", speeds.length ? speeds.join(" / ") + " m/s" : "-"],
          ["耗时", fmt(t.perception, 2) + " ms"]
        ], "perception") +
        card("② 预测 Prediction", [
          ["预测目标", f.predictions.length],
          ["模态总数", f.predictions.reduce(function (a, x) { return a + x.modes.length; }, 0)],
          ["主导模态", f.predictions.length
            ? f.predictions[0].primary.name + " (" + (f.predictions[0].primary.prob * 100).toFixed(0) + "%)" : "-"],
          ["耗时", fmt(t.prediction, 2) + " ms"]
        ], "prediction") +
        card("③ 决策 Decision", [
          ["状态", '<span class="adsim-badge">' + d.name + "</span>"],
          ["触发原因", d.reason],
          ["目标速度", fmt(d.targetSpeed, 1) + " m/s"],
          ["状态已保持", fmt(d.stateAge, 1) + " s"],
          ["耗时", fmt(t.decision, 2) + " ms"]
        ], "decision") +
        card("④ 规划 Planning", [
          ["候选轨迹", p.total + " 条"], ["无碰撞候选", p.feasible + " 条"],
          ["最优横向偏移", best ? fmt(best.lateralOffset, 2) + " m" : "-"],
          ["最小碰撞间隙", best ? fmt(best.collision.minClearance, 2) + " m" : "-"],
          ["总代价", best ? fmt(best.cost, 2) : "-"],
          ["耗时", fmt(t.planning, 2) + " ms"]
        ], "planning") +
        card("⑤ 控制 Control", [
          ["车速", fmt(sim.world.ego.v, 2) + " m/s"],
          ["前轮转角", fmt(M.deg(c ? c.steerCmd : 0), 1) + "°"],
          ["加速度指令", fmt(c ? c.accelCmd : 0, 2) + " m/s²"],
          ["前视距离", c ? fmt(c.debug.lookahead, 1) + " m" : "-"],
          ["耗时", fmt(t.control, 2) + " ms"]
        ], "control") +
        card("⑥ 本步耗时", [
          ["感知 / 预测", fmt(t.perception, 2) + " / " + fmt(t.prediction, 2) + " ms"],
          ["决策 / 规划 / 控制", fmt(t.decision, 2) + " / " + fmt(t.planning, 2) + " / " + fmt(t.control, 2) + " ms"],
          ["单步合计", fmt(t.total, 2) + " ms（实时预算 50 ms）"]
        ], null);
    }
    /* ---------- 交互与主循环 ---------- */
    const DT = 0.05;
    let frameCount = 0, reportText = "";
    function syncBar() {
      bar.querySelector('[data-act="play"]').textContent = playing
        ? "⏸ 暂停" : (started ? "▶ 继续运行" : "▶ 开始运行");
      bar.querySelector('[data-out="clock"]').textContent =
        "t = " + (frame ? frame.time.toFixed(2) : "0.00") + " s　" + scene.title;
    }
    function setScene(id) {
      scene = A.scenarios.get(id);
      sim = A.Sim.createSimulation(scene, { dt: DT, seed: 20260917 });
      playing = false; started = false; acc = 0; frame = sim.step();
      bar.querySelector('[data-act="scene"]').value = scene.id;
      syncBar(); updateSide(frame);
    }
    function stepOnce() { started = true; frame = sim.step(); syncBar(); updateSide(frame); }
    function reset() {
      sim.reset(); frame = sim.step(); acc = 0; started = false; playing = false;
      syncBar(); updateSide(frame);
    }
    function togglePlay() { playing = !playing; if (playing) started = true; syncBar(); }

    function runSelfTest() {
      const el = rootEl.querySelector('[data-out="selftest"]');
      const nowMs = function () { return (typeof performance !== "undefined" ? performance.now() : Date.now()); };
      const lines = ["ADSim 自检：固定随机种子（20260917）逐场景跑完整闭环并核对断言", ""];
      let allPass = true;
      for (let i = 0; i < A.scenarios.list.length; i++) {
        const s = A.scenarios.list[i], a = s.assert || {};
        const t0 = nowMs();
        const sim2 = A.Sim.createSimulation(s, { dt: DT, seed: 20260917 });
        for (let k = 0; k < (s.steps || 600); k++) sim2.step();
        const ms = nowMs() - t0, m = sim2.summary();
        const checks = [
          ["无碰撞（重叠 > 5 cm 计为碰撞）", m.collisions <= (a.maxCollisions || 0), "collisions=" + m.collisions],
          ["最小间隙", m.minClearance >= (a.minMinClearance === undefined ? 0 : a.minMinClearance), m.minClearance + " m"],
          ["最大加速度", a.maxAbsAccel === undefined || m.maxAbsAccel <= a.maxAbsAccel, m.maxAbsAccel + " m/s²"],
          ["行驶里程", a.minDistance === undefined || m.distance >= a.minDistance, m.distance + " m"],
          ["出现预期决策状态",
            !a.requireStates || a.requireStates.some(function (st) { return (m.stateRatio[st] || 0) > 0.001; }),
            JSON.stringify(m.stateRatio)]
        ];
        const pass = checks.every(function (c) { return c[1]; });
        allPass = allPass && pass;
        lines.push((pass ? "[PASS] " : "[FAIL] ") + s.title + "（" + s.id + "）　用时 " + ms.toFixed(0) + " ms");
        lines.push("   最小 TTC " + (m.minTTC === null ? "-" : m.minTTC + " s") + "｜最大|jerk| " +
          m.maxAbsJerk + " m/s³｜状态切换 " + m.stateSwitches + " 次｜规划可行率 " +
          (m.planFeasibleRatio * 100).toFixed(1) + "%");
        for (let c = 0; c < checks.length; c++) {
          lines.push("     " + (checks[c][1] ? "OK  " : "FAIL") + " " + checks[c][0] + "：" + checks[c][2]);
        }
        lines.push("");
      }
      lines.push(allPass ? "结论：全部通过" : "结论：存在未通过项");
      reportText = lines.join("\n");
      el.textContent = reportText;
      return allPass;
    }

    function onControlClick(e) {
      const act = e.target && e.target.getAttribute && e.target.getAttribute("data-act");
      if (act === "play") togglePlay();
      else if (act === "step") stepOnce();
      else if (act === "reset") reset();
      else if (act === "selftest") runSelfTest();
    }
    function onControlChange(e) {
      const act = e.target && e.target.getAttribute && e.target.getAttribute("data-act");
      const layer = e.target && e.target.getAttribute && e.target.getAttribute("data-layer");
      if (layer) { layers[layer] = e.target.checked; return; }
      if (act === "scene") setScene(e.target.value);
      else if (act === "speed") speed = parseFloat(e.target.value) || 1;
    }
    bar.addEventListener("click", onControlClick);
    panel.addEventListener("click", onControlClick);
    bar.addEventListener("change", onControlChange);
    layerBox.addEventListener("change", onControlChange);
    if (root.addEventListener) root.addEventListener("resize", fitCanvas);

    function loop(ts) {
      const dts = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
      lastTs = ts;
      if (playing) {
        acc += dts * speed;
        let n = 0;
        while (acc >= DT && n < 10) { frame = sim.step(); acc -= DT; n++; }
      }
      drawScene();
      frameCount++;
      if (frameCount % 4 === 0) { syncBar(); updateSide(frame); }
      if (root.requestAnimationFrame) root.requestAnimationFrame(loop);
    }

    fitCanvas();
    frame = sim.step();
    syncBar(); updateSide(frame);

    /** 对外 API（也挂在 root.adsimApi 上，便于调试） */
    rootEl.adsimApi = {
      setScene: setScene,
      play: function () { playing = true; syncBar(); },
      pause: function () { playing = false; syncBar(); },
      stepOnce: stepOnce, reset: reset, runSelfTest: runSelfTest,
      simulation: function () { return sim; },
      frame: function () { return frame; },
      report: function () { runSelfTest(); return reportText; }
    };
    if (root.requestAnimationFrame) root.requestAnimationFrame(loop);


    return { root: rootEl };
  }

  A.UI = { mount: mount, LAYERS: LAYERS, COLORS: COLORS, fmt: fmt };

  /* 页面存在 #adsim-root 时自动启动（脚本位于页尾，DOM 通常已就绪） */
  if (typeof document !== "undefined") {
    const boot = function () {
      const el = document.getElementById("adsim-root");
      if (el && !el.adsimApi) {
        A.UI.mount(el, { scene: (el.getAttribute && el.getAttribute("data-scene")) || null });
      }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
}(typeof window !== "undefined" ? window : globalThis));
