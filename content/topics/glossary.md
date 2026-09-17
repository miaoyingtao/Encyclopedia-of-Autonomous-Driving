---
id: "pages/glossary.html"
slug: "glossary"
title: "概念 · 指标 · 标准 索引 · 驶向未来百科"
description: "自动驾驶全站索引：术语表（ODD/DDT/OEDR/BEV/SOTIF/VLA 等）、指标字典（TTC/MPK/mAP/完好性 等）与标准法规清单（SAE J3016、ISO 26262/21448/21434、UN R155/R157 等），每条给出定义与正本页链接。"
accent: "accent-overview"
nav_active: "overview"
hero_kicker: "入门 · 查阅工具"
hero_h1: "概念 · 指标 · 标准 索引"
hero_lead: "全站唯一一本'字典'。读到陌生缩写、想知道某个指标怎么比才公平、或者要查某条标准的适用范围时，来这里。 每条都给出定义，并指向真正展开讲解的那一页 ——那个页面叫做该概念的'正本页'。"
crumb: "首页|../index.html"
crumb: "入门|../pages/overview.html"
crumb: "概念 · 指标 · 标准 索引|"
---

<section class="sec scroll-target" id="howto">
        <div class="sec-head"><span class="no">01</span><h2>怎么用这一页</h2></div>

        <p><b>一句话理解本页的定位：它是索引，不是教程。</b>这里的每条定义都只有 1–3 句，目的是让你"三秒内知道这是什么、该去哪读"；真正讲清原理、权衡与例子的内容在各自的正本页（术语表最后一列）。如果只想找关键词，也可以直接按 <b>/</b> 打开站内搜索。</p>
      </section>

      <section class="sec scroll-target" id="terms">
        <div class="sec-head"><span class="no">02</span><h2>术语表</h2></div>
        <p class="sec-sub">按主题分组而非字母排序，因为中文与英文缩写混排时字母序帮助有限；同一主题内的术语放在一起，更容易建立联系。</p>

        <h3 id="terms-core">2.1 分级与责任</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>它是什么 / 为什么重要</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td><b>ODD</b><br>Operational Design Domain<br>运行设计条件</td><td>系统"愿意负责"的边界：天气、道路类型、速度、地理区域。<b>讨论任何自动驾驶能力，先问它的 ODD 是什么</b>——超出 ODD 就不是它的问题，而是人的问题。</td><td><a href="levels.html#odd">分级标准 · ODD</a></td></tr>
              <tr><td><b>DDT</b><br>Dynamic Driving Task<br>动态驾驶任务</td><td>驾驶过程中的实时操作与监督：横向控制（转向）、纵向控制（加减速），以及持续的目标与事件探测响应。</td><td><a href="overview.html#what">入门 · 什么是自动驾驶</a></td></tr>
              <tr><td><b>OEDR</b><br>Object and Event Detection and Response</td><td>发现前方障碍、行人横穿、施工改道等并做出反应。它是"自动驾驶最难的部分之一"，也是 L3 与 L2 的分界线所在。</td><td><a href="overview.html#what">入门 · 什么是自动驾驶</a></td></tr>
              <tr><td><b>ADAS</b><br>Advanced Driver Assistance Systems<br>辅助驾驶</td><td>L1–L2 的驾驶辅助功能，人始终是驾驶主体与责任主体。与"自动驾驶"的关键差别不是功能多少，而是<b>责任归属</b>。</td><td><a href="overview.html#ad-vs-adas">辅助驾驶 ≠ 自动驾驶</a></td></tr>
              <tr><td><b>接管</b><br>Takeover</td><td>人从系统手中接过驾驶权。L3 要求驾驶员响应接管请求；L4 在 ODD 内通常无需接管，由系统自行降级。</td><td><a href="levels.html#resp">责任转移与接管</a></td></tr>
              <tr><td><b>MRM</b><br>Minimal Risk Maneuver / Condition<br>最小风险状态</td><td>系统已无法继续安全行驶时的兜底动作：减速、打双闪、靠边停车，必要时呼叫后台。<b>它是所有安全设计的最后一道闸门。</b></td><td><a href="challenges/safety.html">功能安全与 SOTIF</a></td></tr>
              <tr><td><b>DSSAD</b><br>Data Storage System for Automated Driving</td><td>类似"黑匣子"的事件数据记录系统：留存系统激活状态、接管请求时刻、传感器数据与操作日志。<b>事故定责靠它，而不是靠口供。</b></td><td><a href="regulation.html#liability">事故责任怎么分</a></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="terms-sensor">2.2 感知与传感器</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>它是什么 / 为什么重要</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td><b>BEV</b><br>Bird's Eye View<br>鸟瞰视角</td><td>把多相机图像统一投影到以自车为中心的俯视坐标系，让感知与规划使用同一套空间语言。它是当前主流感知架构的基础表征。</td><td><a href="tech/perception.html#understand">BEV 与占用网络</a></td></tr>
              <tr><td><b>占用网络</b><br>Occupancy Network</td><td>不分类别，逐体素回答"这里有没有东西"。<b>目标检测对未知异形障碍会失效，占用网络能兜住。</b></td><td><a href="tech/perception.html#understand">BEV 与占用网络</a></td></tr>
              <tr><td><b>多传感器融合</b><br>Sensor Fusion</td><td>解决三个问题：时间同步、空间对齐、置信度融合。按融合层级分后融合、前融合与特征级融合，直接决定系统能否在单路传感器失效时继续工作。</td><td><a href="tech/perception/fusion.html">多传感器融合</a></td></tr>
              <tr><td><b>数据关联</b><br>Data Association</td><td>判断"哪个观测对应哪条航迹"。目标稀疏用最近邻，工程主流是全局最近邻（匈牙利算法），密集模糊场景用 JPDA 或多假设跟踪（MHT）。</td><td><a href="tech/perception/fusion.html#association">数据关联与航迹管理</a></td></tr>
              <tr><td><b>召回优先</b></td><td>检测策略上的取向：<b>宁可误报，不可漏检</b>。配合时间一致性过滤与分级动作（先减速再避让）来抑制误报带来的体验损失。</td><td><a href="tech/perception.html#faq">感知常见疑问</a></td></tr>
              <tr><td><b>去畸变</b><br>Motion Compensation</td><td>激光雷达逐点扫描需几十毫秒，期间车辆已前进可能超过 1 米；必须按各点时刻把点云补偿回同一坐标系，否则目标被"拉长"甚至分裂。</td><td><a href="tech/perception/lidar.html#pipeline">点云处理流水线</a></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="terms-loc">2.3 定位与地图</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>它是什么 / 为什么重要</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td><b>GNSS / RTK</b></td><td>卫星定位 / 载波相位差分定位。单点约 5–10 米，RTK 固定解可达厘米级，但城市峡谷与隧道是天然盲区。</td><td><a href="tech/mapping.html#gnss">GNSS 与 RTK</a></td></tr>
              <tr><td><b>PPP-RTK</b></td><td>精密单点定位结合状态空间改正，兼顾精度与广域覆盖，是传统 RTK 网络之外的另一种厘米级方案。</td><td><a href="tech/mapping.html#gnss">GNSS 与 RTK</a></td></tr>
              <tr><td><b>IMU</b><br>Inertial Measurement Unit<br>惯性测量单元</td><td>加速度计 + 陀螺仪，短时极准（数百 Hz）、长时间积分会漂移。定位体系里它是"平滑器"，不是"绝对基准"。</td><td><a href="tech/mapping.html#techs">定位技术全家桶</a></td></tr>
              <tr><td><b>ICP / NDT</b></td><td>点云配准的两种经典方法：迭代最近点（ICP）与正态分布变换（NDT）。后者收敛域更宽，工程更常用。</td><td><a href="tech/mapping.html#slam">点云配准与 SLAM</a></td></tr>
              <tr><td><b>SLAM</b><br>Simultaneous Localization and Mapping</td><td>同步定位与建图。"先建图、后定位"是 L4 的常见做法，地图同时提供车道拓扑与语义。</td><td><a href="tech/mapping.html#slam">点云配准与 SLAM</a></td></tr>
              <tr><td><b>轻地图 / 无图化</b></td><td>不是"不要地图"，而是不再依赖高成本、更新慢的全国高精地图，改用普通导航地图 + 车端实时感知建图。<b>收益是开城快、成本低；代价是少了一层先验兜底。</b></td><td><a href="tech/mapping.html#trend">轻地图/无图化之争</a></td></tr>
              <tr><td><b>众包更新</b></td><td>从每天运营的量产车回传"车道线变化、施工围挡"等线索，自动比对并生成地图更新任务，解决地图"鲜度"问题。</td><td><a href="tech/mapping.html#fresh">地图的鲜度</a></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="terms-plan">2.4 决策与控制</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>它是什么 / 为什么重要</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td><b>Frenet 坐标</b></td><td>以参考线为基准的(s, d)参数化：s 表示沿路走的距离，d 表示横向偏移。它把弯弯曲曲的路径规划问题"拉直"，是轨迹采样与优化的常用坐标系；曲率过大时会失效，需回退笛卡尔坐标。</td><td><a href="tutorial/03-planning-control.html">教程第 2 章</a></td></tr>
              <tr><td><b>MPC</b><br>Model Predictive Control<br>模型预测控制</td><td>滚动时域优化：每个周期解一次带约束的优化问题，只用第一步控制量，下一周期再重解。控制层常用，因为它能自然处理约束（如转向角限幅、避障边界）。</td><td><a href="tech/control.html#algo">控制算法</a></td></tr>
              <tr><td><b>RSS</b><br>Responsibility Sensitive Safety</td><td>责任敏感安全模型：把"谁该负责"翻译成可验证的几何约束，要求系统即便面对他人违规也不制造"不可避免的碰撞"。它是 L3+ 安全论证的重要组成部分。</td><td><a href="tech/decision.html#rss">安全模型：RSS 与形式化验证</a></td></tr>
              <tr><td><b>jerk</b><br>加加速度</td><td>加速度的变化率。它决定"坐着晕不晕"——同样是刹车，jerk 大就顿挫，jerk 小就平顺。舒适性指标里它比加速度更敏感。</td><td><a href="overview.html#metrics">如何量化能力</a></td></tr>
              <tr><td><b>Fail-safe / Fail-operational</b></td><td>失效即安全 / 失效仍可运行。L2 及以下多用前者（失效后退出智驾、提示接管）；L3+ 必须是后者（双制动、双转向、双电源、双计算通道），否则无法完成最小风险机动。</td><td><a href="tech.html#safety-arch">安全架构与降级</a></td></tr>
              <tr><td><b>2oo2 / 2oo3 表决</b></td><td>冗余通道的仲裁方式：2oo2 表示两路必须一致，2oo3 表示三路取多数。用于识别并隔离出错通道，是"异构冗余优先于同构冗余"原则的落地形式。</td><td><a href="tech.html#safety-arch">安全架构与降级</a></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="terms-ai">2.5 AI 前沿</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>它是什么 / 为什么重要</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td><b>LLM / VLM / VLA</b></td><td>大语言模型（处理文字）/ 视觉语言模型（同时看图与字）/ 视觉-语言-动作模型（直接输出动作或轨迹）。它们让车"听懂人话、看懂没见过的物体"，但<b>能力更强 ≠ 责任转移</b>。</td><td><a href="frontier.html">AI 前沿</a></td></tr>
              <tr><td><b>端到端</b><br>End-to-End</td><td>用一个网络把传感器输入直接映射为轨迹或控制指令，少写规则、更像人类；代价是黑盒难解释、需要海量数据。量产主流是"端到端提上限 + 规则层保下限"。</td><td><a href="tech/decision.html#learning">端到端与学习型规划</a></td></tr>
              <tr><td><b>世界模型</b><br>World Model</td><td>预测"世界接下来会怎样"的生成式模型：可用于生成仿真难例、在车端预演决策后果。<b>追求的是"预测可信"，而不是"画面好看"。</b></td><td><a href="frontier.html#worldmodel">世界模型</a></td></tr>
              <tr><td><b>扩散模型 / 流匹配</b></td><td>当前生成式轨迹与视频建模的主流方法：从噪声逐步去噪（或沿流场积分）生成样本。它让"多模态轨迹生成"变得自然——同一场景可以给出多种合理解。</td><td><a href="tutorial/06-worldmodel.html">教程第 5 章 · 世界模型</a></td></tr>
              <tr><td><b>量化 / 蒸馏 / 剪枝</b></td><td>把大模型压缩到车端可跑的三种手段：降低数值精度、用大模型教小模型、裁掉冗余参数。它们是"大模型上车"的前提条件。</td><td><a href="frontier.html#deploy">车载部署：量化与蒸馏</a></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="terms-safe">2.6 安全与合规</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>它是什么 / 为什么重要</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td><b>ASIL</b><br>Automotive Safety Integrity Level</td><td>ISO 26262 的汽车安全完整性等级（A–D，D 最高）。<b>风险越高，要求越严</b>——它决定冗余、诊断覆盖率与开发流程的严格程度。ASIL D 不等于"绝对可靠"，只是当前工业方法能达到的最高要求。</td><td><a href="challenges/safety.html#fun">ISO 26262 与 ASIL</a></td></tr>
              <tr><td><b>SOTIF</b><br>Safety of the Intended Functionality<br>预期功能安全</td><td>管"系统没坏，但判断错了"：性能局限、场景超出预期、可预见的误用。<b>26262 管失效，21448 管边界</b>，两者共同构成 L3+ 的安全论证。</td><td><a href="challenges/safety.html#sotif">SOTIF 预期功能安全</a></td></tr>
              <tr><td><b>TARA</b><br>Threat Analysis and Risk Assessment</td><td>威胁分析与风险评估。网络安全设计的入口：先识别资产与攻击面，再评估影响与可行性，最后落成防护要求。</td><td><a href="challenges/cybersecurity.html#defense">纵深防御体系</a></td></tr>
              <tr><td><b>CSMS / SUMS</b></td><td>网络安全管理体系 / 软件更新管理体系，分别对应 UN R155 与 R156，是车型认证的前置条件——它要求企业"有制度、可追溯"，而不只是"产品做对"。</td><td><a href="challenges/cybersecurity.html#std">标准与合规清单</a></td></tr>
              <tr><td><b>影子模式</b><br>Shadow Mode</td><td>模型在后台"离线跑"，与人类驾驶或当前策略比对，出现分歧、接管、急刹时自动回传难例。<b>它是数据闭环的入口，也是"不打扰用户"的验证方式。</b></td><td><a href="tech.html#data-loop">数据闭环</a></td></tr>
            </tbody>
          </table>
        </div>

        <h3 id="terms-comm">2.7 通信与运营</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>它是什么 / 为什么重要</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td><b>V2V / V2I / V2P / V2N</b></td><td>车与车 / 车与路 / 车与人 / 车与网通信。理念是让车"提前知道"彼此意图，尤其适合红绿灯倒计时、路口冲突与"鬼探头"预警。</td><td><a href="tech/v2x.html#what">V2X 是什么</a></td></tr>
              <tr><td><b>DSRC / C-V2X</b></td><td>两条车联网技术路线：DSRC（IEEE 802.11p 系）与 C-V2X（蜂窝系，含 LTE-V2X / 5G-V2X）。中国主推 C-V2X。</td><td><a href="tech/v2x.html#routes">两条技术路线</a></td></tr>
              <tr><td><b>PC5</b></td><td>C-V2X 的直连通信接口：车与车、车与路直接通信，<b>不依赖基站覆盖</b>，几百米范围、低时延——这是"红绿灯倒计时可用"的技术前提。</td><td><a href="tech/v2x.html#faq">V2X 常见疑问</a></td></tr>
              <tr><td><b>OBU / RSU</b></td><td>车载单元 / 路侧单元。车端与前装系统打通后，路侧信息才能参与驾驶决策；这也是"老车享受不到新基建红利"的原因。</td><td><a href="tech/v2x.html#cloud">车路云一体化</a></td></tr>
              <tr><td><b>远程支持比（1:N）</b></td><td>一名远程操作员可同时监控的车辆数。它是运营成本最关键的杠杆之一：从 1:1 到 1:10 的变化，直接决定无人化能否省下人力成本。</td><td><a href="scenarios/robotaxi.html#unit">单位经济模型</a></td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="sec scroll-target" id="metrics">
        <div class="sec-head"><span class="no">03</span><h2>指标字典</h2></div>
        <p class="sec-sub">同一句话在不同公司嘴里的含义可能不同。这里给出全站使用的统一口径 —— 引用任何指标时，请连同它的 <b>ODD、是否含安全员、统计口径</b> 一起看。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>分组</th><th>指标</th><th>定义与口径要点</th><th>正本页</th></tr></thead>
            <tbody>
              <tr><td rowspan="3"><b>安全性</b></td><td>每百万公里事故率 / 严重事故率</td><td>需极大里程才有统计意义，通常与"人类驾驶基线"对比；只报里程不报 ODD 没有意义。</td><td><a href="overview.html#metrics">如何量化能力</a></td></tr>
              <tr><td><b>TTC</b>（Time To Collision）</td><td>保持当前运动还有几秒会相撞。<b>TTC 低于 1.5–2 s 通常计为危险事件</b>，是长尾风险的量化代理。</td><td><a href="challenges.html#tail">长尾的量化与治理</a></td></tr>
              <tr><td>危险事件率</td><td>单位里程内的危险事件数（常以 TTC 阈值或急刹为触发），用来衡量"离事故有多近"。</td><td><a href="challenges/testing.html#metric">安全评价指标</a></td></tr>
              <tr><td rowspan="2"><b>可靠性</b></td><td><b>MTBF</b>（平均无故障时间）</td><td>系统/部件平均多久出一次故障，用于硬件与冗余设计评估。</td><td><a href="overview.html#metrics">如何量化能力</a></td></tr>
              <tr><td><b>接管率 MPK</b></td><td>每千公里需要人工介入的次数。<b>必须注明 ODD 范围、是否含安全员、接管的定义</b>（安全风险还是体验优化），否则不可比。</td><td><a href="challenges/testing.html#faq">测试与验证 FAQ</a></td></tr>
              <tr><td><b>舒适性</b></td><td>加速度 / jerk / 急刹频率</td><td>直接影响乘客接受度。同一段路，"平顺"与"顿挫"的差别往往来自 jerk 控制而非速度。</td><td><a href="overview.html#metrics">如何量化能力</a></td></tr>
              <tr><td rowspan="2"><b>效率</b></td><td>平均车速 / 通行时间 / 能耗</td><td>与"保守驾驶"存在权衡：更稳妥的策略通常更慢、更耗能。</td><td><a href="overview.html#metrics">如何量化能力</a></td></tr>
              <tr><td>空驶率 / 载客率</td><td>运营指标：空驶越多越亏，载客率 = 有客里程 ÷ 总里程，是单位经济的第一杠杆。</td><td><a href="scenarios/robotaxi.html#unit">单位经济模型</a></td></tr>
              <tr><td rowspan="2"><b>覆盖度</b></td><td>ODD 范围</td><td>能跑哪些路、什么天气、什么时段。比单一里程更能反映真实能力。</td><td><a href="levels.html#odd">ODD 运行设计域</a></td></tr>
              <tr><td>场景通过率 / 覆盖率</td><td>不仅要看"跑了多少条场景"，还要看参数空间是否被充分探索、危险边界是否被逼近。</td><td><a href="challenges/testing.html#scenario">场景库与覆盖率</a></td></tr>
              <tr><td rowspan="4"><b>感知</b></td><td><b>IoU</b>（交并比）</td><td>预测框与真值框的重叠程度；通常 IoU ≥ 0.5（严格任务 0.7）且类别正确才算命中。</td><td><a href="tutorial/02-perception.html">教程第 1 章</a></td></tr>
              <tr><td><b>mAP</b></td><td>按置信度排序后取精确率-召回率曲线下面积的平均，是检测任务的标准指标；3D 检测在 BEV 空间按距离区间分组报告。</td><td><a href="tech/perception.html#metrics">感知评价指标</a></td></tr>
              <tr><td><b>NDS</b>（nuScenes 检测分数）</td><td>10 项加权平均（mAP 权重 5，5 项误差各 1）。<b>NDS 高不完全等于定位精度高。</b></td><td><a href="tutorial/02-perception.html">教程第 1 章</a></td></tr>
              <tr><td><b>MOTA / AMOTA / IDSW</b></td><td>多目标跟踪指标：MOTA 综合漏检、误检与 ID 切换；AMOTA 为平均化版本；<b>IDSW（ID 切换）是规划层最怕的量</b>。</td><td><a href="tech/perception.html#metrics">感知评价指标</a></td></tr>
              <tr><td rowspan="3"><b>定位</b></td><td>精度（Accuracy）</td><td>误差有多大。量产通常要求"车道级正确"（误差 &lt; 50 cm 且判断对车道），而非处处 2 cm。</td><td><a href="tech/mapping.html#faq">定位常见疑问</a></td></tr>
              <tr><td>可用性（Availability）</td><td>多少时间能给出可用解（如 RTK 固定解率），决定 ODD 的连续性。</td><td><a href="tech/mapping.html#fusion">组合定位原理</a></td></tr>
              <tr><td><b>完好性</b>（Integrity）</td><td><b>系统知不知道自己错了。</b>比精度更关键：误差 10 cm 但如实报告置信度的系统，比误差 5 cm 却"自信地错"的系统更安全。</td><td><a href="tech/mapping.html#faq">定位常见疑问</a></td></tr>
              <tr><td rowspan="2"><b>商业化</b></td><td>每公里成本 / 单位经济</td><td>不等式：每公里总成本 &lt; 每公里收入。成本含折旧、能源、运维、保险与远程支持。</td><td><a href="scenarios/robotaxi.html#biz">商业模式与成本账</a></td></tr>
              <tr><td>远程支持比 / 回本周期</td><td>1 名远程操作员监控多少辆车；回本周期 ≈ 车辆总成本 ÷ 日毛利。</td><td><a href="scenarios/robotaxi.html#unit">单位经济模型</a></td></tr>
            </tbody>
          </table>
        </div>

      </section>
      <section class="sec scroll-target" id="standards">
        <div class="sec-head"><span class="no">04</span><h2>标准与法规清单</h2></div>
        <p class="sec-sub">下表汇总全站提到过的标准与法规。它们不是"加分项"，而是产品能否上市、事故能否定责的前置条件。<b>条款细节请以标准原文为准</b>，本表只回答"管什么、谁必须做"。</p>
        <h3>4.1 安全与功能类</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>编号</th><th>管什么</th><th>谁必须做</th><th>站内展开</th></tr></thead>
            <tbody>
              <tr><td><b>ISO 26262</b></td><td>道路车辆功能安全（ASIL A–D）：电气/电子系统<b>失效</b>时也不能伤人</td><td>所有含电子电气安全相关系统的车型</td><td><a href="challenges/safety.html#fun">ISO 26262 与 ASIL</a></td></tr>
              <tr><td><b>ISO 21448（SOTIF）</b></td><td>预期功能安全：系统<b>没失效</b>但判断错误、场景超出预期、可预见误用</td><td>L2+ 智能驾驶系统，L3+ 必须</td><td><a href="challenges/safety.html#sotif">SOTIF 预期功能安全</a></td></tr>
              <tr><td><b>UL 4600</b></td><td>自动驾驶安全案例：如何组织"凭什么说安全"的论证过程</td><td>做 L4/L5 商业化运营的企业</td><td><a href="challenges/safety.html#refs">标准原文与延伸阅读</a></td></tr>
              <tr><td><b>SAE J1739</b> / <b>SAE J3061</b></td><td>FMEA（失效模式与影响分析）/ 网络安全指南</td><td>设计与安全分析团队</td><td><a href="challenges/safety.html#refs">安全分析方法</a></td></tr>
              <tr><td><b>AEC-Q100</b></td><td>车规芯片可靠性认证（温度、振动、寿命）</td><td>芯片厂商、域控制器与整车</td><td><a href="tech.html#faq">技术栈常见疑问</a></td></tr>
              <tr><td><b>IEC 60825</b></td><td>激光产品人眼安全等级（车载激光雷达需达 Class 1）</td><td>激光雷达厂商与整车厂</td><td><a href="tech/perception/lidar.html#faq">激光雷达常见疑问</a></td></tr>
            </tbody>
          </table>
        </div>
        <h3>4.2 分级、准入与责任类</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>编号</th><th>管什么</th><th>谁必须做</th><th>站内展开</th></tr></thead>
            <tbody>
              <tr><td><b>SAE J3016</b> / <b>GB/T 40429</b></td><td>驾驶自动化分级（L0–L5）与术语定义，划定责任边界</td><td>车企宣传、监管准入、保险定价的共同语言</td><td><a href="levels.html#standards">中国与 SAE 标准</a></td></tr>
              <tr><td><b>UN R157（ALKS）</b></td><td>L3 车道保持系统的准入、接管流程与数据记录要求</td><td>进入 UNECE 成员国市场的 L3 车型</td><td><a href="regulation.html#std">法规与标准清单</a></td></tr>
              <tr><td><b>UN R152</b></td><td>自动紧急制动（AEB）相关要求</td><td>乘用车与商用车</td><td><a href="regulation.html#std">法规与标准清单</a></td></tr>
              <tr><td><b>中国测试与示范规范</b></td><td>道路测试牌照、安全员要求、示范应用与事故上报</td><td>在华开展测试与运营的企业</td><td><a href="regulation.html#cn">中国的监管路径</a></td></tr>
              <tr><td><b>地方条例</b></td><td>如深圳智能网联汽车管理条例：明确"无驾驶人"车辆的法律地位与事故处理</td><td>在相应城市运营的企业</td><td><a href="regulation.html#cn">中国的监管路径</a></td></tr>
              <tr><td><b>德国 StVG §1d–1l</b></td><td>《自动驾驶法》：L4 在限定区域内合法上路与责任规则</td><td>在德运营的 L4 车辆</td><td><a href="regulation.html#world">全球监管地图</a></td></tr>
            </tbody>
          </table>
        </div>
        <h3>4.3 网络安全与软件更新类</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>编号</th><th>管什么</th><th>谁必须做</th><th>站内展开</th></tr></thead>
            <tbody>
              <tr><td><b>ISO 21434</b></td><td>道路车辆网络安全工程：把安全纳入设计、生产、运维、退役的全生命周期</td><td>所有联网车辆</td><td><a href="challenges/cybersecurity.html#law">监管与标准</a></td></tr>
              <tr><td><b>UN R155 / R156</b></td><td>网络安全管理体系（CSMS）/ 软件更新管理体系（SUMS）</td><td>UNECE 成员国新车型（强制认证）</td><td><a href="challenges/cybersecurity.html#std">标准与合规清单</a></td></tr>
              <tr><td><b>ISO 24089</b></td><td>软件更新工程：OTA 流程、版本追溯与回滚</td><td>具备 OTA 能力的车企</td><td><a href="challenges/cybersecurity.html#std">标准与合规清单</a></td></tr>
              <tr><td><b>GB 44495 / GB 44496</b></td><td>中国整车信息安全与软件升级相关强制性要求</td><td>中国市场销售的智能网联车型</td><td><a href="challenges/cybersecurity.html#std">标准与合规清单</a></td></tr>
              <tr><td><b>中国数据与测绘法规</b></td><td>车外数据（人脸、车牌）脱敏、地理数据出境与审图要求</td><td>采集与使用车端数据的企业（与图商）</td><td><a href="challenges/cybersecurity.html#data">数据与隐私</a></td></tr>
            </tbody>
          </table>
        </div>
        <h3>4.4 测试、场景与部件类</h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>编号</th><th>管什么</th><th>谁必须做</th><th>站内展开</th></tr></thead>
            <tbody>
              <tr><td><b>ISO 34501 / 34502</b></td><td>场景术语 / 基于场景的安全评估方法</td><td>做仿真测试与安全论证的团队</td><td><a href="challenges/testing.html#refs">标准与延伸阅读</a></td></tr>
              <tr><td><b>ISO 17386 / 22839</b></td><td>低速辅助泊车系统（MLLS）/ 低速障碍物检测</td><td>泊车辅助与 AVP 产品</td><td><a href="tech/perception/ultrasonic.html">超声波雷达专题</a></td></tr>
              <tr><td><b>ISO 23374</b></td><td>自动代客泊车系统（AVP）</td><td>AVP 产品与停车场改造方</td><td><a href="scenarios/delivery-avp.html">末端配送与自动泊车</a></td></tr>
              <tr><td><b>3GPP / ETSI ITS-G5 / CAM·DENM</b></td><td>V2X 通信标准（LTE-V2X / NR-V2X 与 ITS-G5 两系）</td><td>车联网设备与车企</td><td><a href="tech/v2x.html#refs">标准与规范</a></td></tr>
              <tr><td><b>中国车联网频段规定</b></td><td>直连通信使用 5905–5925 MHz 频段的管理要求</td><td>V2X 设备厂商与车路协同项目</td><td><a href="tech/v2x.html#refs">标准与规范</a></td></tr>
            </tbody>
          </table>
        </div>

      </section>
      <section class="sec scroll-target" id="abbr">
        <div class="sec-head"><span class="no">05</span><h2>中英对照速查</h2></div>
        <p class="sec-sub">读论文、看发布会、查标准时最常撞见的缩写，一表对齐。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>缩写</th><th>英文全称</th><th>中文</th></tr></thead>
            <tbody>
              <tr><td>ADAS</td><td>Advanced Driver Assistance Systems</td><td>高级驾驶辅助系统</td></tr>
              <tr><td>ODD</td><td>Operational Design Domain</td><td>运行设计条件/域</td></tr>
              <tr><td>DDT / OEDR</td><td>Dynamic Driving Task / Object and Event Detection and Response</td><td>动态驾驶任务 / 目标与事件探测响应</td></tr>
              <tr><td>MRM</td><td>Minimal Risk Maneuver</td><td>最小风险状态/机动</td></tr>
              <tr><td>SOTIF</td><td>Safety of the Intended Functionality</td><td>预期功能安全</td></tr>
              <tr><td>ASIL</td><td>Automotive Safety Integrity Level</td><td>汽车安全完整性等级</td></tr>
              <tr><td>TARA</td><td>Threat Analysis and Risk Assessment</td><td>威胁分析与风险评估</td></tr>
              <tr><td>CSMS / SUMS</td><td>Cyber Security / Software Update Management System</td><td>网络安全管理体系 / 软件更新管理体系</td></tr>
              <tr><td>DSSAD</td><td>Data Storage System for Automated Driving</td><td>自动驾驶事件数据记录系统</td></tr>
              <tr><td>BEV</td><td>Bird's Eye View</td><td>鸟瞰视角（俯视栅格）</td></tr>
              <tr><td>VLA / VLM / LLM</td><td>Vision-Language-Action / Vision-Language / Large Language Model</td><td>视觉-语言-动作 / 视觉语言 / 大语言模型</td></tr>
              <tr><td>MPC</td><td>Model Predictive Control</td><td>模型预测控制</td></tr>
              <tr><td>RSS</td><td>Responsibility Sensitive Safety</td><td>责任敏感安全模型</td></tr>
              <tr><td>GNSS / RTK / PPP</td><td>Global Navigation Satellite System / Real-Time Kinematic / Precise Point Positioning</td><td>卫星导航 / 实时动态差分 / 精密单点定位</td></tr>
              <tr><td>IMU</td><td>Inertial Measurement Unit</td><td>惯性测量单元</td></tr>
              <tr><td>SLAM</td><td>Simultaneous Localization and Mapping</td><td>同步定位与建图</td></tr>
              <tr><td>ICP / NDT</td><td>Iterative Closest Point / Normal Distributions Transform</td><td>迭代最近点 / 正态分布变换（点云配准）</td></tr>
              <tr><td>FMCW / TOF</td><td>Frequency Modulated Continuous Wave / Time of Flight</td><td>调频连续波 / 飞行时间测距</td></tr>
              <tr><td>ISP / HDR</td><td>Image Signal Processor / High Dynamic Range</td><td>图像信号处理 / 高动态范围</td></tr>
              <tr><td>DMS</td><td>Driver Monitoring System</td><td>驾驶员监控系统</td></tr>
              <tr><td>V2V / V2I / V2P / V2N</td><td>Vehicle to Vehicle / Infrastructure / Pedestrian / Network</td><td>车-车 / 车-路 / 车-人 / 车-网</td></tr>
              <tr><td>C-V2X / DSRC</td><td>Cellular V2X / Dedicated Short Range Communications</td><td>蜂窝车联网 / 专用短程通信</td></tr>
              <tr><td>OBU / RSU</td><td>On-Board Unit / Road Side Unit</td><td>车载单元 / 路侧单元</td></tr>
              <tr><td>TTC</td><td>Time To Collision</td><td>碰撞时间</td></tr>
              <tr><td>MPK</td><td>Miles/Kilometers Per Intervention</td><td>接管率指标（每千公里接管次数）</td></tr>
              <tr><td>MTBF</td><td>Mean Time Between Failures</td><td>平均无故障时间</td></tr>
              <tr><td>IoU / mAP / NDS</td><td>Intersection over Union / mean Average Precision / nuScenes Detection Score</td><td>交并比 / 平均精度均值 / nuScenes 检测分数</td></tr>
              <tr><td>MOTA / AMOTA / IDSW</td><td>Multiple Object Tracking Accuracy / ID Switch</td><td>多目标跟踪精度 / ID 切换次数</td></tr>
              <tr><td>ATE / ASE / AOE / AVE / AAE</td><td>Average Translation/Scale/Orientation/Velocity/Attribute Error</td><td>平均平移/尺度/朝向/速度/属性误差</td></tr>
              <tr><td>SIL / HIL</td><td>Software / Hardware In the Loop</td><td>软件在环 / 硬件在环测试</td></tr>
              <tr><td>AVP / NOA</td><td>Automated Valet Parking / Navigate on Autopilot</td><td>自动代客泊车 / 导航辅助驾驶</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="related scroll-target" id="next">
        <h3>接下来去哪</h3>
        <p style="margin-bottom:10px">本页是工具页，不参与线性阅读。按目的选择：</p>
        <ul>
          <li><b>刚建立概念</b> → 回到 <a href="overview.html">入门</a>，或直接看 <a href="one-trip.html">一次行程的完整拆解</a>。</li>
          <li><b>想横向对比传感器</b> → <a href="tech/sensors.html">传感器横评：10 个维度对照</a>。</li>
          <li><b>想比较场景的商业化</b> → <a href="scenarios/business.html">商业化与单位经济</a>。</li>
          <li><b>要查某个指标怎么算</b> → 回到本页 <a href="#metrics">指标字典</a>。</li>
        </ul>
        <div class="rel-links">
          <a href="overview.html">入门</a>
          <a href="levels.html">分级标准 L0–L5</a>
          <a href="tech.html">技术</a>
          <a href="challenges.html">安全与验证</a>
          <a href="scenarios.html">落地与产业</a>
          <a href="one-trip.html">一次行程的完整拆解</a>
          <a href="tutorial/index.html">系统教程</a>
        </div>
        <nav class="chapter-nav" aria-label="页面翻页">
          <a class="chapter-link prev" href="one-trip.html">
            <span class="chapter-dir">← 相关页</span>
            <b>一次行程的完整拆解</b>
          </a>
          <a class="chapter-link map" href="overview.html">
            <b>入门总览</b>
          </a>
          <a class="chapter-link next" href="../index.html">
            <span class="chapter-dir">返回 →</span>
            <b>首页</b>
          </a>
        </nav>
      </section>
