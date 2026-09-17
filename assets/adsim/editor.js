/* ADSim - 场景编辑器 + OpenDRIVE 导入面板
 * 编辑器：在俯视图上放置/拖动车辆、行人、锥桶、围挡，编辑属性，导出/导入 JSON，
 *         或一键“应用到实验台”（注册成新场景并切换过去）。
 * 导入：解析 .xodr（内置样例 / 本地文件），把道路载入实验台。
 * 依赖：ADSim（core/*、scenarios.js、opendrive.js），在 ui.js 之后加载。
 */
(function (root) {
  "use strict";
  const A = root.ADSim = root.ADSim || {};
  const M = A.M;

  const TYPES = {
    vehicle: { label: "车辆", len: 4.8, wid: 1.9, color: "rgba(139,148,158,0.9)", speed: 8, policy: "constant" },
    pedestrian: { label: "行人", len: 1.1, wid: 1.1, color: "rgba(210,153,34,0.95)", speed: 1.3, policy: "constant" },
    cone: { label: "锥桶", len: 0.8, wid: 0.8, color: "rgba(240,136,62,0.95)", speed: 0, policy: "static" },
    barrier: { label: "围挡", len: 2.4, wid: 0.8, color: "rgba(248,81,73,0.85)", speed: 0, policy: "static" }
  };

  function createState(scene) {
    const road = scene.road;
    const start = A.scenarios.poseOn
      ? A.scenarios.poseOn(road, 40, road.laneWidth * 0.5)
      : { x: 40, y: 1.75, yaw: 0 };
    return {
      road: road,
      ego: { x: start.x, y: start.y, yaw: start.yaw, speed: scene.ego.speed || 8 },
      objects: [], selected: -1, placing: "vehicle",
      baseSceneId: scene.id
    };
  }

  function viewport(state, W, H) {
    let minX = state.ego.x, maxX = state.ego.x, minY = state.ego.y, maxY = state.ego.y;
    const pts = state.road.ref;
    for (let i = 0; i < pts.length; i += 3) {
      if (pts[i].x < minX) minX = pts[i].x;
      if (pts[i].x > maxX) maxX = pts[i].x;
      if (pts[i].y < minY) minY = pts[i].y;
      if (pts[i].y > maxY) maxY = pts[i].y;
    }
    for (let i = 0; i < state.objects.length; i++) {
      const o = state.objects[i];
      if (o.x < minX) minX = o.x;
      if (o.x > maxX) maxX = o.x;
      if (o.y < minY) minY = o.y;
      if (o.y > maxY) maxY = o.y;
    }
    const pad = 18;
    const sx = (W - 2 * pad) / Math.max(1, maxX - minX);
    const sy = (H - 2 * pad) / Math.max(1, maxY - minY);
    const scale = Math.min(sx, sy);
    const usedW = (maxX - minX) * scale, usedH = (maxY - minY) * scale;
    return {
      scale: scale,
      ox: (W - usedW) / 2 - minX * scale,
      oy: H - (H - usedH) / 2 + minY * scale          // y 轴向上
    };
  }
  function toScreen(vp, p) { return { x: p.x * vp.scale + vp.ox, y: -p.y * vp.scale + vp.oy }; }
  function toWorld(vp, p) { return { x: (p.x - vp.ox) / vp.scale, y: -(p.y - vp.oy) / vp.scale }; }
  /** 道路左右边线点（供绘制与命中） */
  function roadEdges(road) {
    const halfW = road.laneWidth * road.laneCenters.length;
    const lower = [], upper = [];
    for (let i = 0; i < road.ref.length; i++) {
      const a = road.ref[Math.max(0, i - 1)], b = road.ref[Math.min(road.ref.length - 1, i + 1)];
      const yaw = Math.atan2(b.y - a.y, b.x - a.x);
      const nx = -Math.sin(yaw), ny = Math.cos(yaw);
      lower.push({ x: road.ref[i].x, y: road.ref[i].y });
      upper.push({ x: road.ref[i].x + nx * halfW, y: road.ref[i].y + ny * halfW });
    }
    return { lower: lower, upper: upper, halfW: halfW };
  }
  function path(ctx, pts, vp, close) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const q = toScreen(vp, pts[i]);
      if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    }
    if (close) ctx.closePath();
  }
  function drawEditor(ctx, state, W, H) {
    const vp = viewport(state, W, H);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
    const edges = roadEdges(state.road);
    // 路面（右边缘 → 左边缘）
    ctx.beginPath();
    for (let i = 0; i < edges.lower.length; i++) {
      const q = toScreen(vp, edges.lower[i]);
      if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    }
    for (let i = edges.upper.length - 1; i >= 0; i--) {
      const q = toScreen(vp, edges.upper[i]);
      ctx.lineTo(q.x, q.y);
    }
    ctx.closePath();
    ctx.fillStyle = "#161b22"; ctx.fill();
    ctx.strokeStyle = "#57606a"; ctx.lineWidth = 1; ctx.stroke();
    // 车道线
    ctx.setLineDash([6, 6]); ctx.strokeStyle = "#3d444d"; ctx.lineWidth = 1;
    for (let k = 1; k < state.road.laneCenters.length; k++) {
      const d = state.road.laneWidth * k;
      const pts = [];
      for (let i = 0; i < state.road.ref.length; i++) {
        const a = state.road.ref[Math.max(0, i - 1)], b = state.road.ref[Math.min(state.road.ref.length - 1, i + 1)];
        const yaw = Math.atan2(b.y - a.y, b.x - a.x);
        const nx = -Math.sin(yaw), ny = Math.cos(yaw);
        pts.push({ x: state.road.ref[i].x + nx * d, y: state.road.ref[i].y + ny * d });
      }
      path(ctx, pts, vp, false);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // 对象
    for (let i = 0; i < state.objects.length; i++) {
      const o = state.objects[i], t = TYPES[o.kind];
      const c = toScreen(vp, o);
      const L = Math.max(6, t.len * vp.scale), Wd = Math.max(6, t.wid * vp.scale);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(-o.yaw);
      ctx.fillStyle = t.color;
      ctx.fillRect(-Wd / 2, -L / 2, Wd, L);
      ctx.lineWidth = (i === state.selected) ? 2 : 1;
      ctx.strokeStyle = (i === state.selected) ? "#79c0ff" : "rgba(255,255,255,0.35)";
      ctx.strokeRect(-Wd / 2 - (i === state.selected ? 2 : 0), -L / 2 - (i === state.selected ? 2 : 0),
        Wd + (i === state.selected ? 4 : 0), L + (i === state.selected ? 4 : 0));
      ctx.restore();
      if (o.speed > 0.1) {
        const q2 = toScreen(vp, { x: o.x + Math.cos(o.yaw) * o.speed * 0.8, y: o.y + Math.sin(o.yaw) * o.speed * 0.8 });
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(q2.x, q2.y);
        ctx.strokeStyle = "#3fb950"; ctx.lineWidth = 1.8; ctx.stroke();
      }
    }
    // 自车
    const e = toScreen(vp, state.ego);
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(-state.ego.yaw);
    ctx.fillStyle = "#2f81f7";
    ctx.fillRect(-Math.max(5, 1.9 * vp.scale / 2), -Math.max(9, 4.8 * vp.scale / 2),
      Math.max(10, 1.9 * vp.scale), Math.max(18, 4.8 * vp.scale));
    ctx.restore();
    // 提示
    ctx.fillStyle = "#8b949e";
    ctx.font = "12px ui-monospace, Menlo, Consolas, monospace";
    const placing = state.placing && TYPES[state.placing] ? TYPES[state.placing].label : "选择";
    ctx.fillText("点击空白处放置「" + placing + "」；拖动对象移动；选中后在右侧改属性", 10, 18);
    ctx.fillText("道路来源 " + (state.road.meta && state.road.meta.source === "opendrive" ? "OpenDRIVE" : "内置") +
      "　车道 " + state.road.laneCenters.length + "　对象 " + state.objects.length + "　自车速度 " + fmt(state.ego.speed, 1) + " m/s", 10, 36);
    return vp;
  }

  function hitTest(state, vp, screenPt) {
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const o = state.objects[i], t = TYPES[o.kind];
      const c = toScreen(vp, o);
      const r = Math.max(12, Math.max(t.len, t.wid) * vp.scale * 0.7);
      if (Math.hypot(screenPt.x - c.x, screenPt.y - c.y) <= r) return i;
    }
    return -1;
  }
  /* ---------- 编辑器面板 ---------- */
  function mountEditor(host) {
    if (typeof document === "undefined") return null;
    const base = host || document.getElementById("adsim-root");
    if (!base || !base.parentNode || base.parentNode.querySelector(".adsim-editor")) return null;

    let state = createState(A.scenarios.get(A.scenarios.ids()[0]));
    const box = document.createElement("section");
    box.className = "adsim-tool adsim-editor";
    box.innerHTML =
      '<h3 class="adsim-tool-title">场景编辑器 <small>拖放对象搭场景；可导出 / 导入 JSON，或一键应用到上方实验台</small></h3>' +
      '<div class="adsim-tool-actions">' +
      '<label class="adsim-sel">底图<select data-act="base">' +
      A.scenarios.ids().map(function (id) {
        return '<option value="' + id + '">' + A.scenarios.get(id).title + "</option>";
      }).join("") + "</select></label>" +
      ["vehicle", "pedestrian", "cone", "barrier"].map(function (k) {
        return '<button class="adsim-btn" data-place="' + k + '">+ ' + TYPES[k].label + "</button>";
      }).join("") +
      '<button class="adsim-btn" data-act="spawnEgo">设自车位置</button>' +
      '<button class="adsim-btn" data-act="clear">清空对象</button>' +
      '<button class="adsim-btn" data-act="export">导出 JSON</button>' +
      '<button class="adsim-btn" data-act="import">导入 JSON</button>' +
      '<button class="adsim-btn adsim-btn--run" data-act="apply">▶ 应用到实验台</button>' +
      "</div>" +
      '<div class="adsim-tool-body">' +
      '<canvas class="adsim-edit-canvas" width="900" height="340"></canvas>' +
      '<aside class="adsim-tool-side">' +
      '<div class="adsim-tool-card" data-out="props"></div>' +
      '<div class="adsim-tool-card"><h5>说明</h5><div class="adsim-tool-note" data-out="note">' +
      "点击空白处放置当前类型；拖动对象移动；点击对象后在左侧改属性。</div></div>" +
      "</aside></div>" +
      '<div class="adsim-tool-foot"><span class="adsim-tool-stats" data-out="stats"></span></div>' +
      '<input type="file" accept=".json,application/json" style="display:none" data-in="json">';
    base.parentNode.insertBefore(box, base.nextSibling);

    const canvas = box.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const propsEl = box.querySelector('[data-out="props"]');
    const noteEl = box.querySelector('[data-out="note"]');
    const statsEl = box.querySelector('[data-out="stats"]');
    const fileEl = box.querySelector('[data-in="json"]');
    let vp = null, dragging = -1, placingEgo = false;

    function redraw() {
      vp = A.Editor.drawEditor(ctx, state, canvas.width, canvas.height);
      propsEl.innerHTML = propsHTML();
      statsEl.innerHTML =
        '<span class="adsim-tool-stat"><i>对象</i>' + state.objects.length + "</span>" +
        '<span class="adsim-tool-stat"><i>自车</i>' + fmt(state.ego.x, 1) + ", " + fmt(state.ego.y, 1) +
        "　" + fmt(state.ego.yaw * 180 / Math.PI, 0) + "°　" + fmt(state.ego.speed, 1) + " m/s</span>";
    }
    function row(label, html) {
      return '<div class="adsim-tool-row"><span>' + label + "</span>" + html + "</div>";
    }
    function propsHTML() {
      const i = state.selected;
      if (i < 0) {
        return "<h5>属性</h5>" + row("自车速度 (m/s)", '<input type="number" step="0.5" data-ego="speed" value="' + fmt(state.ego.speed, 1) + '">') +
          '<div class="adsim-tool-note">未选中对象。可先在此调自车速度，或点击画布上的对象编辑。</div>';
      }
      const o = state.objects[i], t = TYPES[o.kind];
      return "<h5>属性 · " + t.label + "</h5>" +
        row("类型", '<select data-prop="kind">' + Object.keys(TYPES).map(function (k) {
          return '<option value="' + k + '"' + (k === o.kind ? " selected" : "") + ">" + TYPES[k].label + "</option>";
        }).join("") + "</select>") +
        row("x (m)", '<input type="number" step="1" data-prop="x" value="' + fmt(o.x, 1) + '">') +
        row("y (m)", '<input type="number" step="0.5" data-prop="y" value="' + fmt(o.y, 2) + '">') +
        row("朝向 (°)", '<input type="number" step="5" data-prop="yawDeg" value="' + fmt(o.yaw * 180 / Math.PI, 0) + '">') +
        row("速度 (m/s)", '<input type="number" step="0.5" data-prop="speed" value="' + fmt(o.speed, 1) + '">') +
        row("纵向行为", '<select data-prop="policy">' + ["constant", "idm", "static"].map(function (p) {
          return '<option value="' + p + '"' + (p === o.policy ? " selected" : "") + ">" + p + "</option>";
        }).join("") + "</select>") +
        '<button class="adsim-btn" data-act="del">删除该对象</button>';
    }
    /* ---------- 交互 ---------- */
    function ptOf(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }
    canvas.addEventListener("mousedown", function (e) {
      if (!vp) vp = A.Editor.viewport(state, canvas.width, canvas.height);
      const pt = ptOf(e);
      if (placingEgo) {
        const w = A.Editor.toWorld(vp, pt);
        state.ego.x = Math.round(w.x * 10) / 10;
        state.ego.y = Math.round(w.y * 10) / 10;
        placingEgo = false;
        noteEl.textContent = "已设置自车位置。";
        redraw();
        return;
      }
      const hit = A.Editor.hitTest(state, vp, pt);
      if (hit >= 0) {
        state.selected = hit;
        dragging = hit;
        noteEl.textContent = "拖动可移动该对象；左侧可改朝向与速度。";
      } else if (state.placing) {
        const w = A.Editor.toWorld(vp, pt);
        const t = TYPES[state.placing];
        state.objects.push({
          kind: state.placing, x: Math.round(w.x * 10) / 10, y: Math.round(w.y * 10) / 10,
          yaw: 0, speed: t.speed, policy: t.policy
        });
        state.selected = state.objects.length - 1;
        noteEl.textContent = "已放置「" + t.label + "」。";
      } else { state.selected = -1; }
      redraw();
    });
    canvas.addEventListener("mousemove", function (e) {
      if (dragging < 0 || !vp) return;
      const w = A.Editor.toWorld(vp, ptOf(e));
      const o = state.objects[dragging];
      if (o) { o.x = Math.round(w.x * 10) / 10; o.y = Math.round(w.y * 10) / 10; redraw(); }
    });
    canvas.addEventListener("mouseup", function () { dragging = -1; });
    canvas.addEventListener("mouseleave", function () { dragging = -1; });

    /** 把编辑器内容变成新场景并切到实验台 */
    function applyToLab() {
      const baseScene = A.scenarios.get(state.baseSceneId);
      const actors = [], statics = [];
      for (let i = 0; i < state.objects.length; i++) {
        const o = state.objects[i], t = TYPES[o.kind];
        const spec = {
          id: o.kind + (i + 1), x: o.x, y: o.y, yaw: o.yaw,
          speed: o.speed, desiredSpeed: o.speed || 5, policy: o.policy
        };
        if (o.kind === "pedestrian") {
          spec.kind = "pedestrian";
          spec.radius = t.len / 1.4;
          spec.velocity = null;
          actors.push(spec);
        } else if (o.kind === "cone" || o.kind === "barrier") {
          spec.kind = o.kind;
          spec.vehicle = { length: t.len, width: t.wid, maxSpeed: 0, maxAccel: 0 };
          statics.push(spec);
        } else actors.push(spec);
      }
      const scene = {};
      for (const k in baseScene) scene[k] = baseScene[k];
      scene.id = "custom-" + Date.now().toString(36);
      scene.title = "自定义场景";
      scene.desc = "由场景编辑器生成：底图「" + baseScene.title + "」，对象 " + state.objects.length +
        " 个，自车 " + fmt(state.ego.speed, 1) + " m/s。";
      scene.ego = { x: state.ego.x, y: state.ego.y, yaw: state.ego.yaw, speed: state.ego.speed };
      scene.road = state.road;
      scene.actors = actors;
      scene.statics = statics;
      scene.steps = 520;
      scene.assert = { maxCollisions: 0, minMinClearance: -0.5 };
      A.scenarios.list.push(scene);
      const rootEl = document.getElementById("adsim-root");
      const selEl = rootEl ? rootEl.querySelector('[data-act="scene"]') : null;
      if (selEl) {
        const opt = document.createElement("option");
        opt.value = scene.id;
        opt.textContent = scene.title;
        selEl.appendChild(opt);
      }
      if (rootEl && rootEl.adsimApi) rootEl.adsimApi.setScene(scene.id);
      noteEl.textContent = "已应用：新场景已加入实验台场景列表，上方实验台已切换过去（点「▶ 开始运行」即可跑）。";
      redraw();
    }

    function doExport() {
      const data = {
        version: 1, baseScene: state.baseSceneId,
        laneWidth: state.road.laneWidth, laneCenters: state.road.laneCenters,
        roadRef: state.road.ref.map(function (p) { return [Math.round(p.x * 100) / 100, Math.round(p.y * 100) / 100]; }),
        ego: state.ego, objects: state.objects
      };
      const text = JSON.stringify(data, null, 1);
      if (root.navigator && root.Blob && root.URL && root.URL.createObjectURL) {
        const a = document.createElement("a");
        a.href = root.URL.createObjectURL(new root.Blob([text], { type: "application/json" }));
        a.download = "adsim-scene.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        noteEl.textContent = "已导出 adsim-scene.json（" + state.objects.length + " 个对象）。";
      } else {
        noteEl.textContent = "当前环境不支持下载，JSON 已打印到控制台。";
        if (root.console) root.console.log(text);
      }
    }
    /* ---------- 工具栏与属性面板事件 ---------- */
    box.addEventListener("click", function (e) {
      const t = e.target;
      if (!t || !t.getAttribute) return;
      const place = t.getAttribute("data-place");
      if (place) {
        state.placing = (state.placing === place) ? null : place;
        const btns = box.querySelectorAll("[data-place]");
        for (let i = 0; i < btns.length; i++) {
          if (btns[i].getAttribute("data-place") === state.placing) btns[i].classList.add("is-active");
          else btns[i].classList.remove("is-active");
        }
        noteEl.textContent = state.placing ? "已进入放置模式：" + TYPES[place].label : "已退出放置模式。";
        return;
      }
      const act = t.getAttribute("data-act");
      if (act === "spawnEgo") { placingEgo = true; noteEl.textContent = "请在画布上点击，设置自车位置。"; }
      else if (act === "clear") { state.objects = []; state.selected = -1; noteEl.textContent = "已清空对象。"; redraw(); }
      else if (act === "del") { if (state.selected >= 0) state.objects.splice(state.selected, 1); state.selected = -1; redraw(); }
      else if (act === "export") doExport();
      else if (act === "import") fileEl.click();
      else if (act === "apply") applyToLab();
    });
    box.addEventListener("input", function (e) {
      const t = e.target;
      if (!t || !t.getAttribute) return;
      if (t.getAttribute("data-ego") === "speed") {
        state.ego.speed = parseFloat(t.value) || 0;
        redraw();
        return;
      }
      const prop = t.getAttribute("data-prop");
      if (!prop || state.selected < 0) return;
      const o = state.objects[state.selected];
      if (prop === "kind") { o.kind = t.value; o.speed = TYPES[t.value].speed; o.policy = TYPES[t.value].policy; }
      else if (prop === "yawDeg") o.yaw = (parseFloat(t.value) || 0) * Math.PI / 180;
      else if (prop === "policy") o.policy = t.value;
      else o[prop] = parseFloat(t.value) || 0;
      redraw();
    });
    box.addEventListener("change", function (e) {
      const act = e.target && e.target.getAttribute ? e.target.getAttribute("data-act") : null;
      if (act === "base") {
        const sc = A.scenarios.get(e.target.value);
        const keep = state.objects;
        state = createState(sc);
        state.objects = keep;
        noteEl.textContent = "已切换底图：" + sc.title + "（已放置的对象保留）";
        redraw();
      }
    });
    fileEl.addEventListener("change", function () {
      const f = fileEl.files && fileEl.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const data = JSON.parse(String(reader.result));
          if (data.objects) state.objects = data.objects;
          if (data.ego) state.ego = data.ego;
          if (data.roadRef && data.roadRef.length) {
            const ref = data.roadRef.map(function (p) { return { x: p[0], y: p[1] }; });
            const centers = data.laneCenters || [1.75, 5.25];
            state.road = {
              ref: ref, laneWidth: data.laneWidth || 3.5, laneCenters: centers,
              laneCount: centers.length, length: 0
            };
          }
          state.selected = -1;
          noteEl.textContent = "已导入 " + state.objects.length + " 个对象。";
          redraw();
        } catch (err) { noteEl.textContent = "导入失败：" + err.message; }
      };
      reader.readAsText(f);
      fileEl.value = "";
    });

    /* ---------- OpenDRIVE 载入控件（动态插入工具栏） ---------- */
    const actions = box.querySelector(".adsim-tool-actions");
    const odLabel = document.createElement("label");
    odLabel.className = "adsim-sel";
    odLabel.appendChild(document.createTextNode("地图"));
    const odSel = document.createElement("select");
    odSel.innerHTML = '<option value="">导入 OpenDRIVE…</option>' +
      Object.keys(A.OpenDRIVE.SAMPLES).map(function (k) {
        return '<option value="' + k + '">' + A.OpenDRIVE.SAMPLES[k].label + "</option>";
      }).join("") + '<option value="repo">仓库样例 road-with-ramp.xodr</option>';
    odLabel.appendChild(odSel);
    const odBtn = document.createElement("button");
    odBtn.className = "adsim-btn";
    odBtn.textContent = "选本地 .xodr";
    actions.insertBefore(odLabel, actions.firstChild);
    actions.insertBefore(odBtn, odLabel.nextSibling);
    const odFile = document.createElement("input");
    odFile.type = "file";
    odFile.accept = ".xodr";
    odFile.style.display = "none";
    box.appendChild(odFile);

    function loadXodrText(text, label) {
      const r = A.OpenDRIVE.textToRoad(text, { ds: 2 });
      if (!r.road) {
        noteEl.textContent = "解析失败：" + (r.warnings.join("；") || "未知原因");
        return;
      }
      state.road = r.road;
      state.selected = -1;
      noteEl.innerHTML = "已载入地图「" + label + "」：road " + r.roads + " 条、拼接 " + r.order.length +
        " 条、参考线 " + fmt(r.road.length, 1) + " m、车道 " + r.road.laneCenters.length + " 条" +
        (r.warnings.length ? '<br><span class="adsim-tool-warn">' + r.warnings.join("；") + "</span>" : "");
      redraw();
    }
    odSel.addEventListener("change", function () {
      const v = odSel.value;
      if (!v) return;
      if (v === "repo") {
        if (root.fetch) {
          root.fetch("../assets/maps/road-with-ramp.xodr")
            .then(function (res) { return res.text(); })
            .then(function (t) { loadXodrText(t, "road-with-ramp.xodr"); })
            .catch(function (err) {
              noteEl.textContent = "读取失败（file:// 下浏览器禁止 fetch，请改用「选本地 .xodr」）：" + err.message;
            });
        } else {
          noteEl.textContent = "当前环境不支持 fetch，请用「选本地 .xodr」。";
        }
      } else {
        loadXodrText(A.OpenDRIVE.SAMPLES[v].text, A.OpenDRIVE.SAMPLES[v].label);
      }
      odSel.value = "";
    });
    odBtn.addEventListener("click", function () { odFile.click(); });
    odFile.addEventListener("change", function () {
      const f = odFile.files && odFile.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = function () { loadXodrText(String(rd.result), f.name); };
      rd.readAsText(f);
      odFile.value = "";
    });
    redraw();
    return { element: box, state: state, redraw: redraw, apply: applyToLab };
  }
  A.Editor.TYPES = TYPES;
  A.Editor.createState = createState;
  A.Editor.viewport = viewport;
  A.Editor.roadEdges = roadEdges;
  A.Editor.toScreen = toScreen;
  A.Editor.toWorld = toWorld;
  A.Editor.drawEditor = drawEditor;
  A.Editor.hitTest = hitTest;
  A.Editor.mountEditor = mountEditor;

  /* 自动挂载：实验台下方追加场景编辑器 */
  if (typeof document !== "undefined") {
    const bootEd = function () {
      const host = document.getElementById("adsim-root");
      if (host && host.parentNode) A.Editor.mountEditor(host);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootEd);
    else bootEd();
  }

}(typeof window !== "undefined" ? window : globalThis));
