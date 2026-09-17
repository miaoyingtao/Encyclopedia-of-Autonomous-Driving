---
id: "pages/challenges/safety.html"
slug: "safety"
title: "功能安全与 SOTIF · 驶向未来百科"
description: "自动驾驶功能安全专题：ISO 26262、ASIL 等级、预期功能安全 ISO 21448、L3+ 安全论证。"
accent: "accent-challenges"
nav_active: "challenges"
hero_kicker: "安全与验证 · 专题一"
hero_h1: "功能安全与预期功能安全"
hero_lead: "一辆自动驾驶车要证明自己安全，必须回答两类问题： “系统坏了会不会伤人？” （功能安全）和 “系统没坏，但遇到了设计没想到的情况，会不会伤人？” （预期功能安全）。两道题分别由 ISO 26262 与 ISO 21448 回应。"
crumb: "首页|../../index.html"
crumb: "安全与验证|../../pages/challenges.html"
crumb: "功能安全与 SOTIF|"
---

<section class="sec scroll-target" id="two">
        <div class="sec-head"><span class="no">01</span><h2>先把两类“安全”分开</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>概念</th><th>核心问题</th><th>对应标准</th><th>典型案例</th></tr></thead>
            <tbody>
              <tr><td><b>功能安全</b><br>Functional Safety</td><td>电气/电子系统<b>失效</b>（硬件损坏、软件缺陷）时，会不会导致危害？</td><td>ISO 26262</td><td>线控转向芯片故障导致方向盘锁死</td></tr>
              <tr><td><b>预期功能安全</b><br>SOTIF</td><td>系统<b>没有失效</b>，但因性能局限、场景超出预期或误用，会不会导致危害？</td><td>ISO 21448</td><td>算法把白色卡车当天空，AEB 不触发</td></tr>
              <tr><td><b>网络安全</b><br>Security</td><td>系统被<b>恶意攻击</b>时，会不会导致危害？</td><td>ISO/SAE 21434</td><td>黑客远程注入制动指令</td></tr>
            </tbody>
          </table>
        </div>
        <p>三者合起来才构成完整的“行车安全”拼图。对 L2 而言，人作为最终决策者可以兜住部分风险；对 L3+ 而言，系统自己要成为安全主体，上述每一项都必须做到可论证。</p>
      </section>

      <section class="sec scroll-target" id="fun">
        <div class="sec-head"><span class="no">02</span><h2>ISO 26262：给“失效”上保险</h2></div>
        <p>ISO 26262《道路车辆功能安全》是汽车电子系统开发的金标准，核心思想是<b>“风险越高，要求越严”</b>：</p>
        <div class="grid g2">
          <div class="card reveal"><h3>🔍 HARA 危害分析</h3><p>针对每个功能分析：如果它失效，会造成什么危害？发生的概率（暴露度、可控性）如何？据此定出 ASIL 等级。</p></div>
          <div class="card reveal"><h3>🎯 ASIL A–D 等级</h3><p>ASIL A 最宽松（如车灯控制），ASIL D 最严格（转向、制动等与安全直接相关的系统）。等级越高，要求的冗余、验证与开发流程越苛刻。</p></div>
        </div>
        <p>它落实到工程上就是一套“安全生命周期”：从安全目标（例如“转向失效时车辆必须安全停车”）出发，逐层分配到系统、硬件与软件，再通过测试、审计与安全档案（Safety Case）证明目标达成。</p>

      </section>

      <section class="sec scroll-target" id="sotif">
        <div class="sec-head"><span class="no">03</span><h2>SOTIF：对付“没坏但也错了”</h2></div>
        <p>SOTIF（Safety Of The Intended Functionality，预期功能安全，ISO 21448）关注的是<b>功能本身的能力边界</b>。危险可能来自三个源头：</p>
        <ul>
          <li><b>规格不足</b>：设计时就没考虑到某种场景（例如没定义“交警手动指挥时怎么办”）；</li>
          <li><b>性能局限</b>：传感器或算法在特定条件下达不到要求（如暴雨中摄像头看不清）；</li>
          <li><b>可合理预见误用</b>：用户把 L2 当 L4 用，长时间脱眼（所以人机交互设计也是 SOTIF 的一部分）。</li>
        </ul>
        <p>SOTIF 的方法论是把“已知危险场景”全部消除或控制到可接受，同时尽可能发现“未知危险场景”——后者的工具是场景库挖掘、仿真探索、随机测试与运营数据监控。</p>
      </section>

      <section class="sec scroll-target" id="case">
        <div class="sec-head"><span class="no">04</span><h2>从一起著名事故理解 SOTIF</h2></div>

        <p>由此催生了行业对“<b>可解释性与不确定性量化</b>”的重视：感知要输出的不只是“前方是路”，还应包含“我有多确定”。当不确定性超过阈值，规划层应降级为低速或请求接管。</p>
      </section>

      <section class="sec scroll-target" id="argue">
        <div class="sec-head"><span class="no">05</span><h2>L3+ 如何“论证”自己安全</h2></div>
        <p>Level 3 以上无法靠“多测几万公里”证明安全，行业采用“<b>安全论证（Safety Case）</b>”框架——像写论文一样，用证据链回答“凭什么说它安全”：</p>
        <ol class="steps">
          <li><h3>设计论证</h3><p>冗余架构（双制动、双电源、多传感器）、失效降级策略、最小风险状态设计——从结构上消灭单点失败。</p></li>
          <li><h3>验证论证</h3><p>仿真场景覆盖、封闭场地测试、开放道路路测、极端天气专项——证明系统在 ODD 内满足安全目标。</p></li>
          <li><h3>运行论证</h3><p>运营中的真实数据（接管率、介入率、事故率、里程）持续回传，证明设计与现实一致，并驱动迭代。</p></li>
          <li><h3>组织论证</h3><p>开发企业的安全文化、变更管理、供应商管理、事件响应流程——安全不是某段代码，而是组织能力。</p></li>
        </ol>
        <p>这套论证会提交给监管方（准入审批）、保险公司与公众，并随软件迭代持续更新——安全是一个“过程”，不是一个“结果”。</p>
      </section>

      <section class="sec scroll-target" id="metric">
        <div class="sec-head"><span class="no">06</span><h2>用哪些指标衡量安全</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>指标</th><th>含义</th><th>注意点</th></tr></thead>
            <tbody>
              <tr><td>接管率（Disengagement）</td><td>每千公里系统请求/被强制接管的次数</td><td>只统计“安全员介入”，偏低可能因安全员习惯性接管少</td></tr>
              <tr><td>严重事故率</td><td>每百万公里伤亡/财产事故数</td><td>需与人类司机基线对比，才有意义</td></tr>
              <tr><td>场景覆盖率</td><td>规定场景库中被验证过的比例</td><td>覆盖“定义过的场景”，无法覆盖“未知场景”</td></tr>
              <tr><td>ODD 内可用率</td><td>在允许运行条件下实际可运行的时间占比</td><td>反映“会不会动不动就退出”的体验</td></tr>
              <tr><td>最小风险策略触发率</td><td>系统主动靠边停车的次数</td><td>太低可能说明太激进，太高说明能力不足</td></tr>
            </tbody>
          </table>
        </div>
        <p>行业也在研究“责任敏感安全模型（RSS）”等理论框架：把“谁该为事故负责”的规则数学化，让系统在任何时刻都保持“即使对方违规，我也不负有责任”的安全姿态，为安全论证提供形式化基础。</p>
      </section>

      <section class="sec scroll-target" id="asil">
        <div class="sec-head"><span class="no">07</span><h2>ASIL 定级与安全分析方法</h2></div>
        <p>ISO 26262 用 <b>HARA（危害分析与风险评估）</b>给每个危害定 ASIL 等级。定级由三个维度决定：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>维度</th><th>取值</th><th>含义</th></tr></thead>
            <tbody>
              <tr><td>严重度 S</td><td>S0–S3</td><td>伤害程度，S3 为危及生命</td></tr>
              <tr><td>暴露率 E</td><td>E0–E4</td><td>运行场景出现频率，E4 为高概率</td></tr>
              <tr><td>可控性 C</td><td>C0–C3</td><td>驾驶员 / 乘客能否避免伤害，C3 为几乎不可控</td></tr>
            </tbody>
          </table>
        </div>
        <p>三者组合查表得到 QM（质量管理）到 ASIL D 的等级。例如“高速上制动失效且不可控”通常是 ASIL D，必须做冗余与高诊断覆盖率。定级之后用 <b>FMEA</b>（自下而上找失效模式）与 <b>STPA</b>（自上而下分析系统级不安全控制行为）互补识别风险。</p>
      </section>

      <section class="sec scroll-target" id="sotifproc">
        <div class="sec-head"><span class="no">08</span><h2>SOTIF 的工程流程</h2></div>
        <p>ISO 21448 把“预期功能不足”导致的风险作为独立问题处理，核心是把“未知的不安全”逐步变成“已知并可控”。流程可概括为：</p>
        <ol class="steps">
          <li><h3>定义功能与 ODD</h3><p>明确系统该做什么、在什么条件下做，作为后续分析的边界。</p></li>
          <li><h3>识别危害与触发条件</h3><p>找出“功能正常但输出错误”的场景：逆光、雨雾、异形障碍、罕见交通行为。</p></li>
          <li><h3>评估与改进</h3><p>对每个场景评估风险，通过算法改进、限制 ODD、增加冗余或人机交互来降低风险。</p></li>
          <li><h3>验证与确认</h3><p>用仿真、封闭场地与实车证明残余风险可接受，并持续用运营数据监控。</p></li>
        </ol>
        <p>SOTIF 的关键难点在于“<b>证明未知场景足够少</b>”。工程上通过场景库覆盖度、参数化随机测试与运营影子模式三管齐下，逐步逼近这个目标，详见 <a href="testing.html">测试与评价</a>。</p>
      </section>
