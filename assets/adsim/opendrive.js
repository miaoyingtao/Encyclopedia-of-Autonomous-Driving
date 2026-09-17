/* ADSim - OpenDRIVE 轻量解析器（零依赖）
 * 自己写 XML 扫描（不依赖 DOMParser），因此 Node 与浏览器行为完全一致、可单元测试。
 * 支持：<road> 的 planView（line / arc / spiral / poly3 / paramPoly3）、
 *       lanes/laneSection（左右车道 id 与 width）、predecessor/successor 链接拼接。
 * 忽略：junction 拓扑、elevationProfile、superelevation、信号与标志（会记入 warnings）。
 * 坐标约定：OpenDRIVE 与本站同为右手系（x 前、y 左），t 轴向左为正，与本站 d 一致。
 */
(function (root, factory) {
  const isNode = typeof module === "object" && module.exports;
  const M = isNode ? require("./core/math.js") : (root.ADSim || {}).M;
  const mod = factory(M);
  if (isNode) { module.exports = mod; (global.ADSim = global.ADSim || {}).OpenDRIVE = mod; }
  else (root.ADSim = root.ADSim || {}).OpenDRIVE = mod;
})(typeof globalThis !== "undefined" ? globalThis : this, function (M) {
  "use strict";

  /* ---------- 极简 XML → 节点树 ---------- */
  function parseXml(text) {
    // 去掉注释、声明、DOCTYPE
    const src = text.replace(/<!--[\s\S]*?-->/g, "").replace(/<\?[\s\S]*?\?>/g, "");
    const root = { name: "#root", attrs: {}, children: [] };
    const stack = [root];
    const tagRe = /<(\/?)([A-Za-z_][\w.:-]*)((?:\s+[\w.:-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
    let m;
    while ((m = tagRe.exec(src)) !== null) {
      const closing = m[1] === "/", name = m[2], attrText = m[3], selfClose = m[4] === "/";
      if (closing) {
        if (stack.length > 1) stack.pop();
        continue;
      }
      const node = { name: name, attrs: {}, children: [] };
      const attrRe = /([\w.:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      let a;
      while ((a = attrRe.exec(attrText)) !== null) {
        node.attrs[a[1]] = a[2] !== undefined ? a[2] : a[3];
      }
      stack[stack.length - 1].children.push(node);
      if (!selfClose) stack.push(node);
    }
    return root;
  }
  function kids(node, name) {
    const out = [];
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].name === name) out.push(node.children[i]);
    }
    return out;
  }
  function kid(node, name) { return kids(node, name)[0] || null; }
  function num(v, dflt) {
    const x = parseFloat(v);
    return isFinite(x) ? x : (dflt === undefined ? 0 : dflt);
  }

  /* ---------- geometry 采样 ----------
   * 每种 geometry 在“局部坐标（u 向前、v 向左）”上算点，再按 (x, y, hdg) 变换到世界。
   * 返回 { points: [{u, v}], curvAt(k) }，points 不含起点。 */
  function sampleGeometry(geo, ds) {
    const L = num(geo.attrs.length, 0);
    const step = ds || 2.0;
    const n = Math.max(1, Math.round(L / step));
    const pts = [];
    const kind = geo.children.length ? geo.children[0] : { name: "line", attrs: {} };
    const P = kind.attrs;
    const isParam = kind.name === "paramPoly3";
    const pRange = isParam ? (P.pRange || "normalized") : "arcLength";
    const curvOf = [];
    for (let i = 1; i <= n; i++) {
      const s = L * i / n;                 // 弧长参数
      const t = (pRange === "normalized") ? (i / n) : s;   // paramPoly3 的参数 u
      let u = 0, v = 0, curv = 0;
      if (kind.name === "line") {
        u = s;
      } else if (kind.name === "arc") {
        const c = num(P.curvature, 0);
        curv = c;
        if (Math.abs(c) < 1e-9) { u = s; }
        else { const th = c * s; u = Math.sin(th) / c; v = (1 - Math.cos(th)) / c; }
      } else if (kind.name === "spiral") {
        const c0 = num(P.curvStart, 0), c1 = num(P.curvEnd, 0);
        curv = c0 + (c1 - c0) * (s / Math.max(L, 1e-6));
        // 数值积分（把本段再细分为 8 份）
        let hdg = 0, uu = 0, vv = 0;
        const sub = 8, dsub = s / sub;
        for (let k = 0; k < sub; k++) {
          const sc = c0 + (c1 - c0) * ((k + 0.5) * dsub / Math.max(L, 1e-6));
          hdg += sc * dsub;
          uu += Math.cos(hdg) * dsub;
          vv += Math.sin(hdg) * dsub;
        }
        u = uu; v = vv;
      } else if (kind.name === "poly3") {
        u = s; v = num(P.a) + num(P.b) * s + num(P.c) * s * s + num(P.d) * s * s * s;
      } else if (kind.name === "paramPoly3") {
        const aU = num(P.aU), bU = num(P.bU), cU = num(P.cU), dU = num(P.dU);
        const aV = num(P.aV), bV = num(P.bV), cV = num(P.cV), dV = num(P.dV);
        u = aU + bU * t + cU * t * t + dU * t * t * t;
        v = aV + bV * t + cV * t * t + dV * t * t * t;
      } else {
        curv = 0; u = s;
      }
      pts.push({ u: u, v: v, curv: curv });
      curvOf.push(curv);
    }
    return { points: pts, kindName: kind.name, steps: n };
  }

  /** 单条 geometry → 世界坐标采样点（含起点） */
  function geometryToWorld(geo, ds) {
    const x0 = num(geo.attrs.x, 0), y0 = num(geo.attrs.y, 0), hdg0 = num(geo.attrs.hdg, 0);
    const c = Math.cos(hdg0), s = Math.sin(hdg0);
    const toWorld = function (u, v) {
      return { x: x0 + u * c - v * s, y: y0 + u * s + v * c };
    };
    const p0 = toWorld(0, 0);
    const sampled = sampleGeometry(geo, ds);
    const out = [{ x: p0.x, y: p0.y, curv: 0 }];
    for (let i = 0; i < sampled.points.length; i++) {
      const w = toWorld(sampled.points[i].u, sampled.points[i].v);
      out.push({ x: w.x, y: w.y, curv: sampled.points[i].curv });
    }
    if (out.length > 1) out[0].curv = out[1].curv;   // 起点曲率取第一个采样点
    return out;
  }
  /* ---------- 解析为结构化数据 ---------- */
  function parse(text) {
    const doc = parseXml(text);
    const odr = kid(doc, "OpenDRIVE");
    const warnings = [];
    if (!odr) return { header: {}, roads: [], warnings: ["未找到 <OpenDRIVE> 根节点"] };
    const header = kid(odr, "header");
    const roadNodes = kids(odr, "road");
    const roads = [];
    for (let i = 0; i < roadNodes.length; i++) {
      const rn = roadNodes[i];
      const id = rn.attrs.id !== undefined ? rn.attrs.id : String(i);
      const planView = kid(rn, "planView");
      const laness = kid(rn, "lanes");
      const sections = laness ? kids(laness, "laneSection") : [];
      const laneSections = sections.map(function (sec) {
        const readSide = function (sideName) {
          const sideNode = kid(sec, sideName);
          if (!sideNode) return [];
          return kids(sideNode, "lane").map(function (ln) {
            const w = kid(ln, "width");
            return { id: num(ln.attrs.id), type: ln.attrs.type || "none", width: w ? num(w.attrs.a, 3.5) : 3.5 };
          });
        };
        return { s: num(sec.attrs.s, 0), left: readSide("left"), right: readSide("right") };
      });
      const link = kid(rn, "link");
      const readLink = function (name) {
        const n = link ? kid(link, name) : null;
        return n ? { elementType: n.attrs.elementType, elementId: n.attrs.elementId, contactPoint: n.attrs.contactPoint } : null;
      };
      roads.push({
        id: id, name: rn.attrs.name || ("road" + id),
        length: num(rn.attrs.length, 0),
        junction: rn.attrs.junction || "-1",
        geometries: planView ? kids(planView, "geometry") : [],
        laneSections: laneSections,
        predecessor: readLink("predecessor"), successor: readLink("successor")
      });
      if (rn.attrs.junction && rn.attrs.junction !== "-1") {
        warnings.push("road " + id + " 属于 junction " + rn.attrs.junction + "：仅按几何拼接，未解析路口拓扑");
      }
      if (laneSections.length > 1) {
        warnings.push("road " + id + " 含 " + laneSections.length + " 个 laneSection：车道按第一段取用");
      }
      if (kid(rn, "elevationProfile")) warnings.push("road " + id + " 含高程：2D 仿真已忽略");
    }
    return { header: header ? header.attrs : {}, roads: roads, warnings: warnings };
  }

  /** 单条 road → 世界坐标折线（各 geometry 依次拼接） */
  function roadToPolyline(road, ds) {
    let out = [];
    for (let i = 0; i < road.geometries.length; i++) {
      const seg = geometryToWorld(road.geometries[i], ds);
      if (i > 0 && out.length && seg.length) seg.shift();
      out = out.concat(seg);
    }
    return out;
  }

  /** 按 link + contactPoint 串成一条参考线 */
  function chain(parsed, ds) {
    const roads = parsed.roads;
    const warnings = parsed.warnings.slice();
    if (!roads.length) return { points: [], order: [], warnings: warnings.concat("没有可用的 <road>") };
    const byId = {};
    for (let i = 0; i < roads.length; i++) byId[roads[i].id] = roads[i];
    const hasPred = {};
    for (let i = 0; i < roads.length; i++) {
      const p = roads[i].predecessor;
      if (p && p.elementType === "road" && byId[p.elementId]) hasPred[roads[i].id] = true;
    }
    let start = null;
    for (let i = 0; i < roads.length; i++) if (!hasPred[roads[i].id]) { start = roads[i]; break; }
    if (!start) { start = roads[0]; warnings.push("未找到链首（可能存在环），从第一条 road 开始"); }

    const order = [], seen = {};
    let cur = start, reversed = false;
    while (cur && !seen[cur.id]) {
      seen[cur.id] = true;
      order.push({ road: cur, reversed: reversed });
      const nxt = reversed ? cur.predecessor : cur.successor;
      let nextRoad = null, nextReversed = false;
      if (nxt && nxt.elementType === "road" && byId[nxt.elementId]) {
        nextRoad = byId[nxt.elementId];
        nextReversed = (nxt.contactPoint === "start");     // 接到对方起点 → 需反向
      }
      cur = nextRoad; reversed = nextReversed;
    }
    if (order.length < roads.length) {
      warnings.push("仅拼接 " + order.length + " / " + roads.length + " 条 road（其余不连通）");
    }
    let points = [];
    for (let i = 0; i < order.length; i++) {
      let line = roadToPolyline(order[i].road, ds);
      if (order[i].reversed) line = line.slice().reverse();
      if (i > 0 && points.length && line.length) line.shift();
      points = points.concat(line);
    }
    return {
      points: points,
      order: order.map(function (o) { return { id: o.road.id, name: o.road.name, reversed: o.reversed }; }),
      warnings: warnings
    };
  }
  /* ---------- 车道：以“最右侧车道外沿”为 d=0（与本站 Frenet 约定一致） ---------- */
  function lanesOf(road) {
    const sec = road && road.laneSections && road.laneSections[0];
    if (!sec) return { laneWidth: 3.5, laneCenters: [1.75, 5.25], rightWidths: [3.5] };
    const usable = function (arr) {
      return arr.filter(function (l) { return l.id !== 0 && l.type !== "sidewalk" && l.type !== "shoulder"; });
    };
    const right = usable(sec.right).map(function (l) { return l.width; });
    const left = usable(sec.left).map(function (l) { return l.width; });
    const laneWidth = right.length ? right[0] : (left.length ? left[0] : 3.5);
    const centers = [];
    let acc = 0;
    for (let i = 0; i < right.length; i++) { centers.push(acc + right[i] / 2); acc += right[i]; }
    for (let i = 0; i < left.length; i++) { centers.push(acc + left[i] / 2); acc += left[i]; }
    if (!centers.length) centers.push(acc + laneWidth / 2);
    return { laneWidth: laneWidth, laneCenters: centers, rightWidths: right, leftWidths: left };
  }

  /** 生成 ADSim 道路对象：把参考线从“道路中心线”平移到“右边缘”（d=0 为最右车道外沿） */
  function buildRoad(parsed, opts) {
    const o = opts || {};
    const chained = chain(parsed, o.ds || 2.0);
    if (!chained.points.length) return { road: null, warnings: chained.warnings.concat("参考线为空") };
    let first = parsed.roads[0];
    for (let i = 0; i < parsed.roads.length; i++) {
      if (parsed.roads[i].id === chained.order[0].id) first = parsed.roads[i];
    }
    const lanes = lanesOf(first);
    const shift = lanes.rightWidths.reduce(function (a, b) { return a + b; }, 0);
    const pts = chained.points;
    const ref = pts.map(function (p, i) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const yaw = Math.atan2(b.y - a.y, b.x - a.x);
      const nx = Math.sin(yaw), ny = -Math.cos(yaw);        // 右法向
      return { x: p.x + nx * shift, y: p.y + ny * shift, curv: p.curv || 0 };
    });
    return {
      road: {
        ref: ref, laneWidth: lanes.laneWidth, laneCenters: lanes.laneCenters,
        laneCount: lanes.laneCenters.length, length: M.pathLength(ref),
        meta: { source: "opendrive", order: chained.order, warnings: chained.warnings, shift: shift }
      },
      warnings: chained.warnings, order: chained.order
    };
  }

  /* ---------- 内置样例（程序生成，避免额外数据文件） ---------- */
  const SAMPLES = {
    "city-curve": {
      label: "城市弯道（直线 + 圆弧 + 直线，双车道）",
      text: [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<OpenDRIVE>',
        '  <header revMajor="1" revMinor="7" name="ADSimCityCurve" version="1.0" north="120" south="-40" east="200" west="-40"/>',
        '  <road name="CityCurve" length="200" id="1" junction="-1">',
        '    <planView>',
        '      <geometry s="0" x="0" y="0" hdg="0" length="60"><line/></geometry>',
        '      <geometry s="60" x="60" y="0" hdg="0" length="80"><arc curvature="0.0125"/></geometry>',
        '      <geometry s="140" x="127.3177" y="36.7758" hdg="1.0" length="60"><line/></geometry>',
        '    </planView>',
        '    <elevationProfile><elevation s="0" a="0" b="0" c="0" d="0"/></elevationProfile>',
        '    <lanes>',
        '      <laneSection s="0">',
        '        <left><lane id="1" type="driving"><width sOffset="0" a="3.5" b="0" c="0" d="0"/></lane></left>',
        '        <center><lane id="0" type="border"/></center>',
        '        <right><lane id="-1" type="driving"><width sOffset="0" a="3.5" b="0" c="0" d="0"/></lane></right>',
        '      </laneSection>',
        '    </lanes>',
        '  </road>',
        '</OpenDRIVE>'
      ].join("\n")
    },
    "wide-road": {
      label: "三车道直路（左 2 + 右 1，车道宽 3.75 m）",
      text: [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<OpenDRIVE>',
        '  <header revMajor="1" revMinor="7" name="ADSimWideRoad" version="1.0" north="40" south="-40" east="260" west="-40"/>',
        '  <road name="WideRoad" length="240" id="1" junction="-1">',
        '    <planView>',
        '      <geometry s="0" x="0" y="0" hdg="0" length="240"><line/></geometry>',
        '    </planView>',
        '    <lanes>',
        '      <laneSection s="0">',
        '        <left>',
        '          <lane id="1" type="driving"><width sOffset="0" a="3.75" b="0" c="0" d="0"/></lane>',
        '          <lane id="2" type="driving"><width sOffset="0" a="3.75" b="0" c="0" d="0"/></lane>',
        '        </left>',
        '        <center><lane id="0" type="border"/></center>',
        '        <right><lane id="-1" type="driving"><width sOffset="0" a="3.75" b="0" c="0" d="0"/></lane></right>',
        '      </laneSection>',
        '    </lanes>',
        '  </road>',
        '</OpenDRIVE>'
      ].join("\n")
    }
  };

  /** 解析文本 → ADSim 道路（一步到位，供 UI 直接调用） */
  function textToRoad(text, opts) {
    const parsed = parse(text);
    const built = buildRoad(parsed, opts);
    return {
      road: built.road, warnings: built.warnings, order: built.order,
      roads: parsed.roads.length, header: parsed.header
    };
  }

  return {
    parseXml: parseXml, parse: parse, kid: kid, kids: kids, num: num,
    sampleGeometry: sampleGeometry, geometryToWorld: geometryToWorld,
    roadToPolyline: roadToPolyline, chain: chain, lanesOf: lanesOf,
    buildRoad: buildRoad, textToRoad: textToRoad, SAMPLES: SAMPLES
  };
});
