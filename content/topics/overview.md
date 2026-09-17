---
id: "pages/overview.html"
slug: "overview"
title: "认识自动驾驶 · 驶向未来百科"
description: "什么是自动驾驶、辅助驾驶与自动驾驶的区别、价值、基本构成与发展简史。"
accent: "accent-overview"
nav_active: "overview"
hero_kicker: "域 01 · 入门"
hero_h1: "认识自动驾驶"
hero_lead: "先建立正确的大框架：自动驾驶到底是什么、和辅助驾驶差在哪、为什么值得发展、一辆车如何“自己开起来”，以及它是怎样一步步走到今天的。"
crumb: "首页|../index.html"
crumb: "入门|"
---

<section class="sec scroll-target" id="what">
        <div class="sec-head"><span class="no">01</span><h2>什么是自动驾驶</h2></div>
        <p>自动驾驶（Autonomous Driving / Self-Driving）的通俗定义是：<b>车辆依靠传感器、计算平台、控制算法与通信等手段，部分或完全替代人类驾驶员，完成观察、判断与操作</b>的一项技术。用行业术语说，它要接管人类的“动态驾驶任务”（DDT），包括横向控制（转向）、纵向控制（加速、制动），以及在驾驶中持续“探测与响应目标与事件”（OEDR）。</p>
        <p>需要注意三个关键词，它们决定了“自动驾驶”到底自动到什么程度：</p>
        <div class="grid g3">
          <div class="card reveal"><b>ODD · 运行设计条件</b><p>天气、道路、速度、地理围栏等限制范围。系统只在“设计好的条件”内负责，例如只在白天高速、无雨、60km/h 以下运行。</p></div>
          <div class="card reveal"><b>DDT · 动态驾驶任务</b><p>驾驶过程中的实时操作与监督，对应“眼观六路、手把方向”。还包括向其他交通参与者表明意图等动作。</p></div>
          <div class="card reveal"><b>OEDR · 目标与事件探测响应</b><p>发现前方障碍、行人横穿、施工改道等并做出反应。OEDR 是全自动驾驶最难的部分之一，详细见 <a href="tech/perception.html">环境感知</a>。</p></div>
        </div>
        <p>由于技术成熟度、法规与责任的差异，“自动驾驶”并不是一个二值状态，而是一条从“人开车”到“车开车”的连续演进路径，因此全球通行做法是把它划分为 L0–L5 六个等级，见 <a href="levels.html">分级标准</a>。</p>
      </section>

      <section class="sec scroll-target" id="ad-vs-adas">
        <div class="sec-head"><span class="no">02</span><h2>辅助驾驶 ≠ 自动驾驶</h2></div>
        <p>普通人最容易混淆的两个概念是“辅助驾驶（ADAS）”与“自动驾驶（AD）”。判断标准只有一条：<b>驾驶过程中，出了事由谁负责、系统故障时由谁兜底。</b></p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>对比项</th><th>辅助驾驶 ADAS（L1–L2）</th><th>自动驾驶 AD（L3–L5）</th></tr></thead>
            <tbody>
              <tr><td>人类角色</td><td>驾驶员必须全程监控，随时准备接管</td><td>L3 需响应接管请求；L4–L5 在限定/全域内无需干预</td></tr>
              <tr><td>谁“在看路”</td><td>人和系统共同监控，责任以人为主</td><td>系统自主完成 OEDR（在 ODD 内）</td></tr>
              <tr><td>典型功能</td><td>自适应巡航 ACC、车道保持 LKA、自动泊车辅助</td><td>城市 NOA、无人 Robotaxi、无人干线物流</td></tr>
              <tr><td>故障兜底</td><td>驾驶员随时接管</td><td>系统设计冗余并执行最小风险策略（靠边停车等）</td></tr>
              <tr><td>法律定位</td><td>属“驾驶辅助系统”，责任仍归驾驶员</td><td>进入“自动驾驶系统”范畴，责任与准入逐步立法</td></tr>
            </tbody>
          </table>
        </div>

      </section>

      <section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">03</span><h2>为什么全世界都在发展自动驾驶</h2></div>
        <div class="grid g3">
          <div class="card reveal"><div class="ci">🛡️</div><h3>安全</h3><p>全球每年因交通事故死亡人数以十万计，其中绝大多数与人为失误有关（疲劳、分心、酒驾、判断失误）。自动驾驶理论上不疲劳、不分心，且反应更快，有望显著降低事故率。</p></div>
          <div class="card reveal"><div class="ci">⏱️</div><h3>效率</h3><p>车流更平稳、跟车更紧密，可提升道路通行能力；解放驾驶时间，让通勤者可以在车内办公或休息。</p></div>
          <div class="card reveal"><div class="ci">🧓</div><h3>普惠出行</h3><p>为老人、残障人士、无驾照人群提供独立出行的可能；无人出租车可降低“拥有一辆车”的门槛，推动出行即服务（MaaS）。</p></div>
          <div class="card reveal"><div class="ci">📦</div><h3>物流降本</h3><p>干线物流面临司机短缺与成本压力，无人驾驶可 24 小时运转；港口、矿区、仓储等重复劳动场景也急需自动化。</p></div>
          <div class="card reveal"><div class="ci">🏭</div><h3>产业带动</h3><p>芯片、传感器、算法、高精地图、通信、整车制造等全链条升级，是许多国家智能制造与智能网联战略的核心抓手。</p></div>
          <div class="card reveal"><div class="ci">🌆</div><h3>城市空间</h3><p>共享无人车更高效使用车辆，可能减少停车需求、重塑街道空间，让城市把土地还给行人、绿化和公共生活。</p></div>
        </div>
        <p class="sec-sub">当然，这些价值都是“潜力”。要真正兑现，必须穿越 <a href="challenges.html">安全、成本、法规与公众信任</a> 四道关口。</p>
      </section>

      <section class="sec scroll-target" id="parts">
        <div class="sec-head"><span class="no">04</span><h2>一辆自动驾驶车由什么构成</h2></div>
        <p>无论哪个等级，自动驾驶都遵循“<b>感知 → 决策 → 执行</b>”的闭环，外加定位、地图、通信与算力等支撑系统：</p>
        <ol class="steps">
          <li><h3>感知层：用“眼睛”看清世界</h3><p>摄像头、激光雷达、毫米波雷达、超声波雷达收集原始数据，算法从中识别车道线、车辆、行人、交通标志与可行驶区域。详见 <a href="tech/perception.html">环境感知</a>。</p></li>
          <li><h3>决策层：用“大脑”决定怎么走</h3><p>预测其他交通参与者的行为，规划全局路径与局部轨迹，做出变道、让行、刹停等决策。详见 <a href="tech/decision.html">决策与规划</a>。</p></li>
          <li><h3>执行层：用“手脚”精确操作</h3><p>线控转向、线控制动与电驱动把规划结果变成平滑、安全的车辆动作。详见 <a href="tech/control.html">控制执行</a>。</p></li>
          <li><h3>支撑系统：让判断更可靠</h3><p>高精地图与组合定位解决“我在哪”，车路协同 V2X 让车“看见”看不见的盲区，车载算力与软件平台负责实时计算。分别见 <a href="tech/mapping.html">定位与地图</a>、<a href="tech/v2x.html">车路协同</a>。</p></li>
        </ol>
      </section>

      <section class="sec scroll-target" id="history">
        <div class="sec-head"><span class="no">05</span><h2>发展简史：从畅想到落地</h2></div>
        <ul class="timeline">
          <li><b>1939 年</b><p>通用汽车在纽约世博会“未来世界”展中展示自动高速公路愿景，自动驾驶进入公众想象。</p></li>
          <li><b>1980 年代</b><p>欧美日启动研究计划（如德国 Prometheus、卡内基梅隆大学 NavLab），在实验道路上实现低速自主行驶。</p></li>
          <li><b>2004–2007</b><p>美国 DARPA 无人车挑战赛连续举办，极大推动感知与规划技术，斯坦福、卡内基梅隆等团队相继完赛。</p></li>
          <li><b>2009–2016</b><p>谷歌启动无人车项目（后独立为 Waymo），积累海量测试里程；特斯拉 2015 年起推出 Autopilot，把辅助驾驶带入量产车。</p></li>
          <li><b>2016–2020</b><p>激光雷达、高精地图、AI 芯片快速成熟；中美出现 Robotaxi 试运营潮；中国多地发放自动驾驶路测牌照。</p></li>
          <li><b>2021–2024</b><p>城市 NOA（导航辅助驾驶）成为量产热点；“端到端”神经网络取代模块化流水线的讨论升温；无人出租车在更多城市收费运营。</p></li>
          <li><b>2025 以后</b><p>技术竞赛从“比演示”转向“比安全与商业闭环”：大规模运营、成本下探、法规细化、车路云一体化成为主线。详见 <a href="future.html">未来展望</a>。</p></li>
        </ul>
      </section>

      <section class="sec scroll-target" id="arch">
        <div class="sec-head"><span class="no">06</span><h2>系统分层：从传感器到车轮的数据流</h2></div>
        <p>一辆自动驾驶车可以抽象成五层，每层有明确的输入输出与时间尺度：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>层</th><th>输入 → 输出</th><th>典型频率</th></tr></thead>
            <tbody>
              <tr><td>传感层</td><td>物理世界 → 原始数据（图像、点云、回波）</td><td>10–30 Hz</td></tr>
              <tr><td>感知与定位层</td><td>原始数据 → 目标列表、可行驶区域、自车位姿</td><td>10–30 Hz</td></tr>
              <tr><td>预测与规划层</td><td>世界描述 → 带时间的轨迹</td><td>10–50 Hz</td></tr>
              <tr><td>控制层</td><td>轨迹 → 转向角、驱动力、制动力</td><td>50–100 Hz</td></tr>
              <tr><td>执行层</td><td>指令 → 车辆运动</td><td>物理响应 100–300 ms</td></tr>
            </tbody>
          </table>
        </div>
        <p>这条链路的每一层都向下游提供<b>带不确定性的结果</b>，而不是绝对真值。因此真正的系统设计问题不是“如何做到 100% 正确”，而是“某一层出错时，下游如何安全降级”。这条思路贯穿本站全部技术页。</p>
        <p>这套分层将在 <a href="one-trip.html">一次行程的完整拆解</a> 里逐环展开：同一个场景从上车到抵达，看每一层如何接力、又在哪里兜底。</p>
      </section>

      <section class="sec scroll-target" id="metrics">
        <div class="sec-head"><span class="no">07</span><h2>如何量化一辆车的自动驾驶能力</h2></div>
        <p>“很智能”不是指标。工程与监管常用下面几类可测量的量：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>维度</th><th>指标</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>安全性</td><td>每百万公里事故 / 严重事故率</td><td>需要极大里程才有统计意义，常与人类驾驶基线对比</td></tr>
              <tr><td>可靠性</td><td>MTBF、接管率 MPK</td><td>接管率需说明 ODD 与是否含安全员</td></tr>
              <tr><td>舒适性</td><td>加速度、jerk、急刹频率</td><td>直接影响乘客接受度</td></tr>
              <tr><td>效率</td><td>平均车速、通行时间、能耗</td><td>与“保守驾驶”存在权衡</td></tr>
              <tr><td>覆盖度</td><td>ODD 范围、场景通过率</td><td>比单一里程更能反映真实能力</td></tr>
            </tbody>
          </table>
        </div>
        <p>比较不同系统时，必须同时看“指标 + ODD + 测试方法”。只报里程不报 ODD，或只报通过率不报场景分布，都无法判断真实水平，详见 <a href="challenges/testing.html">测试与评价</a>。</p>
        <p>上面这五类指标只是框架。全站所有指标（含 TTC、MPK、MTBF、完好性等）的<b>统一定义与口径</b>汇在 <a href="glossary.html#metrics">概念 · 指标 · 标准 索引 · 指标字典</a>。</p>
      </section>

      <section class="related scroll-target" id="next">
        <h3>下一步怎么读</h3>
        <p style="margin-bottom:10px">你已经搭好框架，接下来有两个方向：想知道“车到底怎么分级、责任怎么划分”，进入分级标准；想知道“眼脑手如何工作”，直接深入核心技术。</p>
        <div class="rel-links">
          <a href="levels.html">分级标准 L0–L5</a>
          <a href="one-trip.html">一次行程的完整拆解</a>
          <a href="tech.html">技术总览</a>
          <a href="scenarios.html">落地与产业</a>
          <a href="../index.html">返回首页</a>
        </div>
      </section>
