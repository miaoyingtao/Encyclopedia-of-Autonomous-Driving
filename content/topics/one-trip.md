---
id: "pages/one-trip.html"
slug: "one-trip"
title: "一次行程的完整拆解 · 从上车到抵达 · 驶向未来百科"
description: "用一段 3.2 公里城区晚高峰行程，把定位、感知、预测、决策规划、控制执行、安全降级与数据闭环串成一条完整链路：每个环节讲清现场发生了什么、系统内部谁在接力、关键数字是多少。"
accent: "accent-overview"
nav_active: "overview"
hero_kicker: "入门 · 综合演练"
hero_h1: "一次行程的完整拆解：从上车到抵达"
hero_lead: "前面几页把自动驾驶拆成了分级、感知、地图、决策、控制、安全等名词。这一页反过来：只讲一段 11 分钟的真实行程，看这些模块如何在毫秒之间接力，以及当意外发生时，系统凭什么还是安全的。"
crumb: "首页|../index.html"
crumb: "入门|../pages/overview.html"
crumb: "一次行程的完整拆解|"
---

<section class="sec scroll-target" id="howto">
        <div class="sec-head"><span class="no">01</span><h2>本页读法</h2></div>

        <p><b>先记住一句话：这段路能自己开完，不是靠某一个聪明的算法，而是七个模块按毫秒接力、四套安全机制在背后兜底的结果。</b>本页不引入任何新概念——所有名词都在前面的页面出现过，这里只回答一件事：它们在真实场景里怎么配合。</p>
      </section>

      <section class="sec scroll-target" id="overview">
        <div class="sec-head"><span class="no">02</span><h2>行程总览：3.2 公里，六个环节</h2></div>
        <p>我们选一段足够普通、又足够麻烦的行程作为样本：<b>傍晚的城区主干道，晚高峰，下着雨</b>。普通在于它就是你我每天通勤的路；麻烦在于它恰好凑齐了自动驾驶最怕的四类情况——定位退化、临时施工、无保护左转、传感器被脏污。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>项目</th><th>设定</th><th>为什么这样选</th></tr></thead>
            <tbody>
              <tr><td>出发时间</td><td>18:40，晚高峰</td><td>车流密集、加塞多，最能体现“与社会博弈”</td></tr>
              <tr><td>起点 → 终点</td><td>商场地下车库 → 老城区小区门口</td><td>地库出口是典型的定位退化场景</td></tr>
              <tr><td>里程 / 时长</td><td>3.2 公里 / 约 11 分钟</td><td>足够覆盖全部环节，又不至于让读者迷路</td></tr>
              <tr><td>天气</td><td>小雨转中雨，路面反光</td><td>摄像头对比度下降、镜头易被溅污</td></tr>
              <tr><td>关键事件</td><td>1 处临时施工、1 次无保护左转</td><td>分别对应“长尾障碍”与“博弈决策”两大难题</td></tr>
            </tbody>
          </table>
        </div>
        <div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--shadow);overflow-x:auto">
        <svg viewBox="0 0 920 210" role="img" aria-label="一次行程的六个环节示意图：上车出发、主路跟车、施工区、无保护左转、大雨脏污、抵达之后" style="min-width:760px;width:100%;height:auto;font-family:inherit">
          <defs>
            <marker id="otArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2f86eb"/></marker>
            <marker id="otLoop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#94a3b8"/></marker>
          </defs>
          <g font-size="13" text-anchor="middle">
            <rect x="30" y="34" width="130" height="62" rx="12" fill="#e8f0fe" stroke="#2f86eb"/>
            <text x="95" y="62" font-size="13.5" font-weight="700" fill="#0d3b8a">上车出发</text>
            <text x="95" y="81" font-size="11.5" fill="#1f4e8a">定位先接管</text>

            <line x1="162" y1="65" x2="174" y2="65" stroke="#2f86eb" stroke-width="3" marker-end="url(#otArrow)"/>
            <rect x="176" y="34" width="130" height="62" rx="12" fill="#e8f0fe" stroke="#2f86eb"/>
            <text x="241" y="62" font-size="13.5" font-weight="700" fill="#0d3b8a">主路跟车</text>
            <text x="241" y="81" font-size="11.5" fill="#1f4e8a">全链路接力</text>

            <line x1="308" y1="65" x2="320" y2="65" stroke="#2f86eb" stroke-width="3" marker-end="url(#otArrow)"/>
            <rect x="322" y="34" width="130" height="62" rx="12" fill="#fdf3e3" stroke="#dd7a0d"/>
            <text x="387" y="62" font-size="13.5" font-weight="700" fill="#8a4b06">施工区</text>
            <text x="387" y="81" font-size="11.5" fill="#94600c">没见过的东西</text>

            <line x1="454" y1="65" x2="466" y2="65" stroke="#2f86eb" stroke-width="3" marker-end="url(#otArrow)"/>
            <rect x="468" y="34" width="130" height="62" rx="12" fill="#f3e8ff" stroke="#7a3bd0"/>
            <text x="533" y="62" font-size="13.5" font-weight="700" fill="#4c1d95">无保护左转</text>
            <text x="533" y="81" font-size="11.5" fill="#5b21b6">与车流博弈</text>

            <line x1="600" y1="65" x2="612" y2="65" stroke="#2f86eb" stroke-width="3" marker-end="url(#otArrow)"/>
            <rect x="614" y="34" width="130" height="62" rx="12" fill="#fdeceb" stroke="#c81e1e"/>
            <text x="679" y="62" font-size="13.5" font-weight="700" fill="#8a1414">大雨脏污</text>
            <text x="679" y="81" font-size="11.5" fill="#a42020">降级与兜底</text>

            <line x1="746" y1="65" x2="758" y2="65" stroke="#2f86eb" stroke-width="3" marker-end="url(#otArrow)"/>
            <rect x="760" y="34" width="130" height="62" rx="12" fill="#e6f4ea" stroke="#1e7e34"/>
            <text x="825" y="62" font-size="13.5" font-weight="700" fill="#14532d">抵达之后</text>
            <text x="825" y="81" font-size="11.5" fill="#1e7e34">数据闭环</text>

            <text x="95" y="118" font-size="11.5" fill="#64748b">0 km</text>
            <text x="241" y="118" font-size="11.5" fill="#64748b">0.8 km</text>
            <text x="387" y="118" font-size="11.5" fill="#64748b">1.6 km</text>
            <text x="533" y="118" font-size="11.5" fill="#64748b">2.2 km</text>
            <text x="679" y="118" font-size="11.5" fill="#64748b">2.9 km</text>
            <text x="825" y="118" font-size="11.5" fill="#64748b">3.2 km</text>

            <path d="M825 100 V164 H241 V108" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#otLoop)"/>
            <text x="533" y="186" font-size="12.5" fill="#64748b">数据回传 → 场景挖掘 → 仿真复现 → 回归测试 → OTA</text>
          </g>
        </svg>
        </div>
        <p>上图里有一条虚线，它是本页最容易被忽视的部分：<b>抵达不是终点</b>。这一趟产生的难例会回流到云端，变成下一版模型和下一次测试的输入——第 5 个环节专门讲它。</p>
        <p class="sec-sub">下面的每个环节都固定回答同样四个问题：<b>现场发生了什么</b>（直觉）→ <b>系统内部谁在接力</b>（机制）→ <b>关键数字是多少</b>（工程）→ <b>最容易误解什么</b>（纠偏）。你可以只看前两问，也可以逐项深读。</p>
      </section>
      <section class="sec scroll-target" id="step0">
        <div class="sec-head"><span class="no">03</span><h2>环节 0 · 上车出发：先解决“我在哪”</h2></div>
        <p><b>现场：</b>车停在地库 B2，乘客上车、系好安全带、点击“开始行程”。这一刻车几乎收不到卫星信号——混凝土顶盖把 GNSS 挡得严严实实，摄像头里只有昏暗的车库，激光雷达看到的是几根柱子。</p>
        <p><b>系统内部：</b>定位模块不会“等信号”，而是先用<b>惯性推算</b>接管：轮速计数着走了几米，IMU 记着转了几度，再配合车库地图与视觉特征匹配，把车“扶”上坡道。驶出地面后卫星重新可见，<b>RTK 固定解在数秒内收敛</b>，定位才切回“地图 + 卫星”的主模式。整个过程乘客毫无感觉——这正是自动驾驶与手机导航最大的区别之一。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>定位来源</th><th>提供什么</th><th>什么时候会失效</th></tr></thead>
            <tbody>
              <tr><td>GNSS + RTK</td><td>绝对位置，固定解可达厘米级</td><td>地库、隧道、高楼与高架密集的“城市峡谷”</td></tr>
              <tr><td>IMU + 轮速计</td><td>短时间内的相对运动（走了多远、转了多少）</td><td>误差随时间累积，几十秒就会明显漂移</td></tr>
              <tr><td>视觉 / 点云匹配高精地图</td><td>车道级位姿，同时校验地图是否还“新鲜”</td><td>施工改道、路面重铺等环境变化时</td></tr>
              <tr><td>组合定位（滤波 / 优化）</td><td>把上面几路“投票”成一条可信轨迹</td><td>设计目标就是：任何一路失灵，其余仍能兜住</td></tr>
            </tbody>
          </table>
        </div>

        <p>深入阅读：<a href="tech/mapping.html">定位与高精地图</a> · <a href="tech/mapping.html#gnss">GNSS 与 RTK</a> · <a href="tech/mapping.html#slam">点云配准与 SLAM</a> · <a href="tutorial/04-loc-sim-test.html">教程第 3 章</a></p>
      </section>

      <section class="sec scroll-target" id="step1">
        <div class="sec-head"><span class="no">04</span><h2>环节 1 · 主路跟车：全链路的第一次接力</h2></div>
        <p><b>现场：</b>出库右转上主路，车流排成一列缓慢通过路口。前车走走停停，右侧车道一辆车打了转向灯想并进来，绿灯还剩不到 10 秒。</p>
        <p><b>系统内部：</b>这是七个模块第一次完整接力——</p>
        <ol class="steps">
          <li><h3>传感器采集</h3><p>相机约 30 fps、激光雷达约 10 fps、毫米波雷达约 20 fps 同时出数据；时间同步决定它们看到的是不是“同一瞬间”的世界。</p></li>
          <li><h3>感知</h3><p>输出三样东西：动态目标清单（位置、尺寸、朝向、速度与稳定 ID）、可行驶区域与车道语义、以及兜底的占用栅格。</p></li>
          <li><h3>预测</h3><p>为每个交通参与者给出未来 <b>1–5 秒</b>的多条候选轨迹与概率，例如“继续直行 80% / 向右并线 20%”。</p></li>
          <li><h3>行为决策</h3><p>在“跟车 / 变道 / 让行 / 等待”之间做选择：右侧车想并线时，是减速让行还是保持队形？这既有交规约束，也有社会博弈。</p></li>
          <li><h3>运动规划</h3><p>把“继续跟车”变成一条平滑、不碰任何东西、且符合车辆动力学的轨迹：几何路径 + 每个时刻的速度与加速度。</p></li>
          <li><h3>控制与执行</h3><p>控制器算出此刻该打多少方向、给多少扭矩、施加多少制动，交给线控底盘；车辆运动后传感器再测出偏差，闭环修正。</p></li>
        </ol>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>环节</th><th>典型频率</th><th>单次时延预算</th><th>这一环在担心什么</th></tr></thead>
            <tbody>
              <tr><td>传感器采集</td><td>10–30 Hz</td><td>10–30 ms</td><td>曝光与传输：30 Hz 意味着 33 ms 一帧，72 km/h 时车已前进约 0.67 m</td></tr>
              <tr><td>感知推理</td><td>10–30 Hz</td><td>30–100 ms</td><td>BEV 与占用网络是算力大头，靠量化与算子融合压时延</td></tr>
              <tr><td>预测</td><td>10–20 Hz</td><td>10–30 ms</td><td>多模态轨迹生成与打分</td></tr>
              <tr><td>规划</td><td>10–50 Hz</td><td>20–80 ms</td><td>采样或优化，外加碰撞与边界校验</td></tr>
              <tr><td>控制</td><td>50–100 Hz</td><td>5–20 ms</td><td>横纵向解耦，MPC 需要在线求解二次规划</td></tr>
              <tr><td>执行器响应</td><td>—</td><td>转向 100–300 ms</td><td>机械与电机的物理延迟，必须在轨迹里前馈补偿</td></tr>
            </tbody>
          </table>
        </div>
        <div class="math math-left">t_total = t_sense + t_perception + t_plan + t_control + t_actuator<br>d_stop = v · t_total + v² / (2 · a_max)</div>
        <p><b>关键数字：</b>以 72 km/h（20 m/s）为例，若端到端时延 200 ms、最大减速度 6 m/s²，则“发现危险 → 完全停住”需要 20×0.2 + 20²/(2×6) ≈ <b>37 米</b>。换算一下：<b>每多 100 ms 时延，就要多预留约 2 米安全距离</b>——这就是为什么实时性不是“优化项”，而是安全指标。</p>

        <p>深入阅读：<a href="tech.html#latency">实时性与时延预算</a> · <a href="tech/perception.html">环境感知</a> · <a href="tech/decision.html">决策与规划</a> · <a href="tech/control.html">控制执行</a> · <a href="tutorial/02-perception.html">教程第 1 章</a> · <a href="tutorial/03-planning-control.html">第 2 章</a></p>
      </section>
      <section class="sec scroll-target" id="step2">
        <div class="sec-head"><span class="no">05</span><h2>环节 2 · 施工区：遇到“没见过”的东西</h2></div>
        <p><b>现场：</b>行程 1.6 公里处进入施工段：三条车道收成两条，隔离锥桶摆得歪歪扭扭，原有的车道线被新铺的沥青盖住，只留下几段旧标线的残影；雨水在路面上反着光。</p>
        <p><b>系统内部：</b>这一段是“长尾场景”的教科书样本，系统靠三件事接住它。</p>
        <ol class="steps">
          <li><h3>检测“漏”了，但没“丢”</h3><p>锥桶的形状不在标准类别里，又被水花与反光干扰，目标检测给出的往往是一个低置信度框。按<b>召回优先</b>的原则，它会被保留而不是删掉——宁可让规划保守一点，也不能漏掉一个可能撞上的东西。</p></li>
          <li><h3>占用网络兜底</h3><p>目标检测要求“先分类、再画框”，遇到完全不认识的异形物就失效。占用网络换个问法：<b>这个体素有东西吗？</b>它不看类别，只给出“被占据”的空间，于是收窄后的可行驶区域被完整地“画”了出来。</p></li>
          <li><h3>信感知，不信地图</h3><p>高精地图的相对精度是 10–20 cm，但这次施工是今天早上才围起来的——地图没有这个“鲜度”。于是系统以实时感知为准，地图退为背景参考。这也是“轻地图/无图化”被反复讨论的原因：<b>地图的长处是语义先验，短处是更新滞后。</b></p></li>
        </ol>

        <p>深入阅读：<a href="tech/perception.html#understand">BEV 与占用网络</a> · <a href="tech/mapping.html#fresh">地图的“鲜度”</a> · <a href="challenges.html#tail">长尾的量化与治理</a> · <a href="tutorial/02-perception.html#bev">教程第 1 章 · BEV</a></p>
      </section>

      <section class="sec scroll-target" id="step3">
        <div class="sec-head"><span class="no">06</span><h2>环节 3 · 无保护左转：和别人博弈</h2></div>
        <p><b>现场：</b>2.2 公里处的路口没有左转专用箭头灯，只有一个圆饼灯。对向直行车流不断，人行横道上有行人正要过街，左边还有一辆车也想左转——三方共享一个冲突区域，谁都没有绝对的“可以走了”。</p>
        <p><b>系统内部：</b>这类场景考验的是<b>预测 + 行为决策</b>，而不是“开得猛不猛”。</p>
        <ul>
          <li><b>先预测别人的意图：</b>对向来车是匀速直行、还是已经松了油门准备让行？预测模块给出未来 1–5 秒的多条轨迹与概率（例如“直行通过 70% / 减速让行 30%”）。</li>
          <li><b>再决定自己的策略：</b>行业里的通行做法不是“抢”或“死等”，而是<b>可撤销的渐进侵入</b>——先缓慢探入路口，占据冲突点位置，把意图明确传达给对方；只有当对方给出确定信号（明显减速或停住），才继续完成转弯。任何一步如果条件不成立，都能随时退回停止线。</li>
          <li><b>交规是不可交换的硬约束：</b>礼让行人、不闯红灯这类规则属于“绝对项”，不能拿来和通行效率做权衡——这是与人类驾驶习惯最容易冲突的地方。</li>
          <li><b>安全层做数学兜底：</b>形式化安全模型（如 RSS 一类的“责任敏感”约束）要求：<b>即便对方不让、即便自己的预测错了，也不会出现“不可避免的碰撞”</b>。它把“谁该负责”翻译成了可验证的几何条件，是 L3+ 准入论证的重要组成。</li>
          <li><b>V2X 是可选的“外挂”：</b>若路口有路侧单元，车可以直接收到红绿灯倒计时、行人闯入告警，把“猜”变成“知道”。没有它，系统依然要能安全通过——这正是车路协同被定位为“增强而非前提”的原因。</li>
        </ul>

        <p>深入阅读：<a href="tech/decision.html#behavior">行为决策</a> · <a href="tech/decision.html#rss">安全模型：RSS 与形式化验证</a> · <a href="tech/v2x.html">车路协同 V2X</a> · <a href="tutorial/03-planning-control.html">教程第 2 章</a></p>
      </section>
      <section class="sec scroll-target" id="step4">
        <div class="sec-head"><span class="no">07</span><h2>环节 4 · 大雨与脏污：系统如何“认怂”</h2></div>
        <p><b>现场：</b>2.9 公里处雨势突然变大，前车卷起大片水雾，环视摄像头被泥水溅出几块持续污斑；激光雷达的回波里也开始混入雨滴造成的“假点”。对摄像头来说，这几乎是它能遇到的最差光线。</p>
        <p><b>系统内部：</b>这一段最值得看的不是算法，而是<b>系统对自身可信度的判断与退让</b>。整个过程是一条可预期的降级阶梯：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>触发情况</th><th>系统动作</th><th>归属哪套机制</th></tr></thead>
            <tbody>
              <tr><td>单路传感器脏污、图像质量下降</td><td>降低该路权重，其余通道继续工作，融合结果保持可用</td><td>冗余设计（能力互补）</td></tr>
              <tr><td>多路性能同时下降（大雨、水雾）</td><td>主动限速、加大跟车距离、避免紧贴大型车</td><td>ODD 边界管理（SOTIF）</td></tr>
              <tr><td>接近或超出设计运行条件</td><td>L3 向驾驶员请求接管；L4 无人在车内，则由系统自行降级</td><td>人机共驾 / 降级策略</td></tr>
              <tr><td>已无法维持安全行驶</td><td>执行 <b>MRM（最小风险状态）</b>：减速、靠边、必要时停车并呼叫后台</td><td>安全兜底</td></tr>
              <tr><td>硬件失效（如转向或制动通道故障）</td><td>冗余通道接管，安全机制介入并保留可控状态</td><td>ISO 26262 功能安全（ASIL）</td></tr>
            </tbody>
          </table>
        </div>

        <p>深入阅读：<a href="challenges/safety.html">功能安全与 SOTIF</a> · <a href="challenges/failures.html">失效与事故复盘库</a> · <a href="tech/perception/fusion.html">多传感器融合</a> · <a href="tech/perception/radar.html">毫米波雷达</a> · <a href="challenges.html#tail">长尾的量化与治理</a></p>
      </section>

      <section class="sec scroll-target" id="step5">
        <div class="sec-head"><span class="no">08</span><h2>环节 5 · 抵达之后：这次行程才刚开始</h2></div>
        <p><b>现场：</b>车辆停稳，乘客下车。对乘客来说行程结束；对研发团队来说，<b>数据刚刚开始流动</b>——刚才那段施工区和最小 TTC 的记录，比这一趟跑出的里程值钱得多。</p>
        <p><b>系统内部：</b>一条完整的“数据闭环”通常分五步走。</p>
        <ol class="steps">
          <li><h3>筛选回传</h3><p>不可能把全部数据都传回云端（带宽与隐私都扛不住）。系统按触发条件挑片：发生了接管、急刹、危险 TTC、低置信度识别、临时施工等事件的数据优先上传。</p></li>
          <li><h3>场景挖掘</h3><p>云端把车队回传的数据按<b>稀有度与风险</b>排序，找出“最该学”的样本——这正是长尾治理里“挖掘”的一步。</p></li>
          <li><h3>标注与训练</h3><p>人工与自动标注结合，形成训练集；新数据让模型见到它原本没见过的东西，也让出错的判断被纠正。</p></li>
          <li><h3>仿真复现</h3><p>把真实难例参数化，生成成千上万个变体（不同车速、距离、遮挡、光照）在仿真里批量跑完——这是唯一能低成本“重复体验危险”的办法。</p></li>
          <li><h3>回归测试与 OTA</h3><p>新模型必须通过回归测试：<b>不能修好一个问题却弄坏另一个</b>。通过后再经 OTA 下发给车队，能力就这样一圈一圈抬升。</p></li>
        </ol>

        <p>深入阅读：<a href="challenges/testing.html">测试与验证</a> · <a href="tech.html#data-loop">数据闭环</a> · <a href="frontier.html">AI 前沿：世界模型如何生成难例</a> · <a href="tutorial/06-worldmodel.html">教程第 5 章 · 世界模型</a></p>
      </section>
      <section class="sec scroll-target" id="sheet">
        <div class="sec-head"><span class="no">09</span><h2>速查表：这段行程用到的东西</h2></div>
        <p class="sec-sub">下表把本页出现的模块、指标与标准汇总成一张查阅表，方便你回头对照或跳转正本页。</p>
        <h3>① 各模块在本行程中的角色</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>模块</th><th>在本行程中负责什么</th><th>关键频率 / 关键量</th><th>深入阅读</th></tr></thead>
            <tbody>
              <tr><td>定位与高精地图</td><td>回答“我在哪”，提供车道级位姿与语义先验</td><td>车道级；地图相对精度 10–20 cm</td><td><a href="tech/mapping.html">定位与高精地图</a></td></tr>
              <tr><td>环境感知</td><td>输出目标清单、可行驶区域与占用栅格</td><td>10–30 Hz</td><td><a href="tech/perception.html">环境感知</a></td></tr>
              <tr><td>多传感器融合</td><td>时间同步、空间对齐、置信度融合与冗余降级</td><td>相机 30 fps / 激光 10 fps / 雷达 20 fps</td><td><a href="tech/perception/fusion.html">多传感器融合</a></td></tr>
              <tr><td>预测</td><td>推断他人未来 1–5 秒的候选轨迹与概率</td><td>10–20 Hz</td><td><a href="tech/decision.html#predict">预测</a></td></tr>
              <tr><td>行为决策</td><td>在“跟车 / 变道 / 让行 / 等待”间做选择</td><td>百毫秒级</td><td><a href="tech/decision.html#behavior">行为决策</a></td></tr>
              <tr><td>运动规划</td><td>生成平滑、安全、符合动力学的可执行轨迹</td><td>10–50 Hz</td><td><a href="tech/decision.html#motion">运动规划</a></td></tr>
              <tr><td>控制与执行</td><td>闭环跟踪轨迹，输出转向、驱动与制动</td><td>50–100 Hz；执行器 100–300 ms</td><td><a href="tech/control.html">控制执行</a></td></tr>
              <tr><td>安全与验证</td><td>降级、兜底与“凭什么说安全”的证据链</td><td>TTC 1.5–2 s、MRM、ASIL</td><td><a href="challenges.html">安全与验证</a></td></tr>
              <tr><td>车路协同 V2X</td><td>可选增益：红绿灯倒计时、路口告警</td><td>增强而非前提</td><td><a href="tech/v2x.html">车路协同</a></td></tr>
            </tbody>
          </table>
        </div>
        <h3>② 指标与标准速查</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语 / 标准</th><th>一句话含义</th><th>本页出现在</th></tr></thead>
            <tbody>
              <tr><td>ODD · 运行设计条件</td><td>系统愿意“负责”的边界：天气、道路、速度、区域</td><td>环节 4</td></tr>
              <tr><td>TTC · 碰撞时间</td><td>保持当前运动还有几秒会撞上；低于 1.5–2 s 通常记为危险事件</td><td>环节 2、3</td></tr>
              <tr><td>MRM · 最小风险状态</td><td>系统无法继续安全行驶时的兜底动作：减速、靠边、停车并呼叫后台</td><td>环节 4</td></tr>
              <tr><td>RTK 固定解</td><td>卫星定位经差分改正后达到厘米级，是城市定位的主模式之一</td><td>环节 0</td></tr>
              <tr><td>BEV / 占用网络</td><td>俯视栅格表示；逐体素判断“有没有东西”，兜住未知障碍</td><td>环节 2</td></tr>
              <tr><td>接管率 / MTBF</td><td>衡量可靠性的常用指标：多久需要人工介入、平均无故障时间</td><td>延伸阅读</td></tr>
              <tr><td>ISO 26262 · ASIL</td><td>功能安全与其安全完整性等级：管“硬件/软件失效了也别伤人”</td><td>环节 4</td></tr>
              <tr><td>ISO 21448 · SOTIF</td><td>预期功能安全：管“系统没坏、但场景超出预期”的残余风险</td><td>环节 4</td></tr>
              <tr><td>ISO 21434</td><td>道路车辆网络安全：管“被恶意攻击或数据泄露”</td><td>环节 4</td></tr>
            </tbody>
          </table>
        </div>
        <p>术语的完整定义、中英对照与全站标准清单，见 <a href="overview.html#metrics">入门 · 如何量化一辆车的能力</a> 与 <a href="challenges/safety.html#refs">安全与验证 · 标准原文</a>、<a href="regulation.html#std">法规与政策 · 法规与标准清单</a>。</p>
      </section>

      <section class="related scroll-target" id="next">
        <h3>下一步怎么读</h3>
        <p style="margin:0 0 8px">你已经跟着一趟行程走完了全链路，接下来按目的选一条路径即可：</p>
        <ul>
          <li><b>想搞懂每个模块内部怎么做</b>：进 <a href="tech.html">技术域</a>，按“感知 → 定位 → 决策 → 控制”顺序读，每页都标注了对应的教程章节。</li>
          <li><b>想知道“凭什么相信它安全”</b>：进 <a href="challenges.html">安全与验证</a>，从测试金字塔与 SOTIF 读起，再看 <a href="regulation.html">法规与政策</a> 的准入门槛。</li>
          <li><b>想要公式、伪代码与工程坑</b>：进 <a href="tutorial/index.html">系统教程</a>，第 0–5 章正好对应本页出现的每一环。</li>
          <li><b>想跟行业事件对齐</b>：看 <a href="scenarios.html">落地与产业</a> 与 <a href="news.html">领域动态</a>，本页讲的每个概念都能在上面找到现实版本。</li>
        </ul>
        <div class="rel-links">
          <a href="overview.html">回到入门总览</a>
          <a href="levels.html">分级标准 L0–L5</a>
          <a href="tech.html">核心技术</a>
          <a href="challenges.html">安全与验证</a>
          <a href="scenarios.html">落地与产业</a>
          <a href="frontier.html">AI 前沿</a>
          <a href="tutorial/index.html">系统教程</a>
        </div>
        <nav class="chapter-nav" aria-label="页面翻页">
          <a class="chapter-link prev" href="levels.html">
            <span class="chapter-dir">← 上一篇</span>
            <b>分级标准 L0–L5</b>
          </a>
          <a class="chapter-link map" href="overview.html">
            <b>入门总览</b>
          </a>
          <a class="chapter-link next" href="tech.html">
            <span class="chapter-dir">下一篇 →</span>
            <b>核心技术总览</b>
          </a>
        </nav>
      </section>
