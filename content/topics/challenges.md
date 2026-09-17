---
id: "pages/challenges.html"
slug: "challenges"
title: "安全与验证 · 驶向未来百科"
description: "自动驾驶的安全与验证体系：功能安全（ISO 26262）、预期功能安全（SOTIF）、网络安全与数据安全、测试验证与评价方法。"
accent: "accent-challenges"
nav_active: "challenges"
hero_kicker: "域 03 · 安全与验证"
hero_h1: "安全与验证：让系统在出错时仍然可控"
hero_lead: "自动驾驶最难的部分不是“会开车”，而是“在意外发生时仍然可控”。本域聚焦功能安全、预期功能安全、网络安全与测试验证——它们共同回答一个问题：凭什么相信这套系统是安全的？"
crumb: "首页|../index.html"
crumb: "安全与验证|"
---

<section class="sec scroll-target" id="quad">
        <div class="sec-head"><span class="no">01</span><h2>为什么“会开”不等于“安全”</h2></div>
        <p>自动驾驶最难的部分不是把车开动，而是<b>证明它在所有意外里都安全</b>。安全与验证要同时回答三类问题：系统自身故障了怎么办（功能安全）、系统没坏但遇到设计没想到的场景怎么办（预期功能安全）、系统被恶意攻击或数据泄露怎么办（网络安全）。此外，还要用仿真、封闭场地与开放道路组成证据链，回答“凭什么说它安全”。</p>

      </section>

      <section class="sec scroll-target" id="four">
        <div class="sec-head"><span class="no">02</span><h2>三大安全支柱（可继续下钻）</h2></div>
        <div class="grid g3">
          <div class="card reveal">
            <div class="ci">🛡️</div><h3>功能安全与预期功能安全</h3>
            <p>ISO 26262 管“系统坏了不会伤人”，ISO 21448（SOTIF）管“系统没坏但遇到设计没想到的情况也不会伤人”。L3+ 的安全论证必须同时通过这两关。</p>
            <span class="tag">ISO 26262</span><span class="tag">SOTIF</span><span class="tag">ASIL</span>
            <a class="more" href="challenges/safety.html">进入专题</a>
          </div>
          <div class="card reveal">
            <div class="ci">🔐</div><h3>网络安全与数据安全</h3>
            <p>智能汽车变成“轮子上的数据中心”，攻击面从 CAN 总线扩展到 OTA、App 与 V2X。ISO/SAE 21434、UN R155/R156 与各国数据法规构成防线。</p>
            <span class="tag">入侵检测</span><span class="tag">OTA</span><span class="tag">隐私</span>
            <a class="more" href="challenges/cybersecurity.html">进入专题</a>
          </div>
          <div class="card reveal">
            <div class="ci">🧪</div><h3>测试与验证</h3>
            <p>“开多少公里才算安全？”答案是：无法只用真实里程证明。仿真、封闭场地、开放道路与数据回环四层金字塔共同构成证据链。</p>
            <span class="tag">仿真</span><span class="tag">封闭场地</span><span class="tag">路测</span>
            <a class="more" href="challenges/testing.html">进入专题</a>
          </div>
        </div>
      </section>

      <section class="sec scroll-target" id="trust">
        <div class="sec-head"><span class="no">03</span><h2>终极难题：如何让社会“信任”它</h2></div>
        <p>技术上的“安全”与社会认知上的“安全”之间存在落差。人类司机平均每小时会造成一定事故率，公众却普遍接受；但一台自动驾驶汽车只要发生一次伤亡事故，就可能被舆论放大为“技术不可靠”。这种<b>“对比基准错位”</b>给行业提出了比工程更难的课题：</p>
        <div class="grid g3">
          <div class="card reveal"><div class="ci">📊</div><h3>透明的数据</h3><p>主动公开安全指标、接管率、事故报告，用可核查的数据说话，而不是只发营销宣传片。</p></div>
          <div class="card reveal"><div class="ci">🎓</div><h3>公众教育</h3><p>让用户分清 L2 与 L4、理解 ODD，避免把辅助驾驶当无人驾驶使用——很多事故源于误用。</p></div>
          <div class="card reveal"><div class="ci">🏛️</div><h3>监管与保险</h3><p>通过准入、认证、责任保险与事故调查制度，把“信任”从口号变成一套可执行的社会契约。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="longtail">
        <div class="sec-head"><span class="no">04</span><h2>什么是“长尾难题”</h2></div>
        <p>自动驾驶研发者常说：常见场景（直行、跟车、转弯）已经解决了 99%，难的是剩下的 1%——</p>
        <ul>
          <li>暴雨、大雾、积雪覆盖车道线、阳光直射造成镜头眩光；</li>
          <li>行人打伞逆行、骑手钻缝、货车掉落的异物、被风吹来的塑料袋；</li>
          <li>临时施工、交警手势、事故现场、动物穿行、罕见车型与加装设备；</li>
          <li>其他车辆“不讲理”的驾驶行为——加塞、急刹、闯红灯。</li>
        </ul>
        <p>长尾问题的核心是<b>“分布极不均匀”</b>：哪怕你用 10 亿公里路测，也很难碰齐全部罕见场景。行业应对它的方法是：仿真场景生成、Corner Case 挖掘、端到端大模型泛化、以及“系统知道自己不会”的谦逊设计——识别不了就降级，详见 <a href="challenges/testing.html">测试与评价</a>。</p>
      </section>

      <section class="sec scroll-target" id="tail">
        <div class="sec-head"><span class="no">05</span><h2>长尾的量化与治理</h2></div>
        <p>长尾不是“少数难例”，而是一条可度量的分布：绝大多数里程是简单场景，极少数场景贡献了绝大多数风险。治理长尾通常分三步：</p>
        <ol class="steps">
          <li><h3>度量</h3><p>用接管率、危险事件率（如 TTC 低于阈值）、模型不确定性与场景覆盖率量化“还有多少不知道”。</p></li>
          <li><h3>挖掘</h3><p>从车队数据中按稀有度与风险排序，主动回传并标注 Corner Case；用仿真生成参数化变体。</p></li>
          <li><h3>收敛</h3><p>针对高频危险场景做专门优化，同时保留保守兜底；用回归测试确保新模型不回退。</p></li>
        </ol>
        <p>关键指标之一是 <b>TTC（Time To Collision）</b>：两车若保持当前运动，还有多少秒相撞。TTC 低于 1.5–2 s 通常被计为危险事件，可作为长尾风险的量化代理。相关方法见 <a href="challenges/testing.html">测试与评价</a>。</p>

      </section>

      <section class="related scroll-target" id="next">
        <h3>选择一条安全支线深入</h3>
        <p style="margin-bottom:10px">最值得优先阅读的是“测试与评价”——它回答“凭什么说安全”；之后是“功能安全与 SOTIF”，理解系统设计与安全的关系。</p>
        <div class="rel-links">
          <a href="challenges/safety.html">功能安全与 SOTIF</a>
          <a href="challenges/cybersecurity.html">网络安全与数据安全</a>
          <a href="challenges/testing.html">测试与验证</a>
          <a href="one-trip.html#step4">一次行程里的降级与兜底</a>
          <a href="regulation.html">法规与政策（落地与产业）</a>
          <a href="../index.html">返回首页</a>
        </div>
      </section>
