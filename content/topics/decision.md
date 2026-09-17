---
id: "pages/tech/decision.html"
slug: "decision"
title: "决策与规划 Planning · 驶向未来百科"
description: "自动驾驶决策与规划专题：全局路径规划、行为决策、运动规划、轨迹预测与端到端规划。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 专题二"
hero_h1: "决策与规划 Decision & Planning"
hero_lead: "感知告诉系统“世界长什么样”，决策与规划负责回答“我接下来怎么开”。它把驾驶员的经验——跟车、变道、让行、避险——变成可计算、可验证的算法。"
crumb: "首页|../../index.html"
crumb: "技术|../../pages/tech.html"
crumb: "决策与规划|"
---

<section class="sec scroll-target" id="layers">
        <div class="sec-head"><span class="no">01</span><h2>决策与规划的三层结构</h2></div>
        <p>决策规划通常按“时间尺度”分成三层，越往下刷新越快、颗粒度越细：</p>
        <ol class="steps">
          <li><h3>全局路径规划（秒~分钟级）</h3><p>从 A 到 B 走哪条路：类似手机导航，在路网图上搜索最优路线，考虑距离、时间、收费与交通管制。</p></li>
          <li><h3>行为决策（百毫秒级）</h3><p>当前路段我该“跟车、变道、超车、让行、停车等待还是靠边”？结合交规、意图与礼貌性做“驾驶策略”选择。</p></li>
          <li><h3>运动规划（10–100 毫秒级）</h3><p>把“我要变道”变成一条<b>平滑、安全、符合车辆动力学</b>的轨迹：几何路径 + 每一时刻的速度/加速度。这是真正的“打方向盘”之前的最关键一步。</p></li>
        </ol>
        <p>三层之间通过接口衔接：全局规划给出途经点，行为决策圈定驾驶模式，运动规划输出可执行的轨迹，最后交给 <a href="control.html">控制执行</a>
          <a href="../frontier.html">大模型与智驾前沿</a> 去跟踪。</p>
      </section>

      <div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--shadow);overflow-x:auto;margin:18px 0">
        <svg viewBox="0 0 920 220" role="img" aria-label="决策规划的三层结构：时间尺度越往下越短、颗粒度越细" style="min-width:760px;width:100%;height:auto;font-family:inherit">
          <g font-size="12.5">
            <text x="20" y="48" fill="#0f172a" font-weight="700">全局路径规划</text>
            <rect x="150" y="30" width="700" height="26" rx="8" fill="#dbeafe" stroke="#2563eb"/>
            <text x="500" y="48" fill="#1e40af" text-anchor="middle">秒 – 分钟级：从 A 到 B 走哪条路（路网搜索、车道级拓扑）</text>

            <text x="20" y="108" fill="#0f172a" font-weight="700">行为决策</text>
            <rect x="150" y="90" width="380" height="26" rx="8" fill="#dcfce7" stroke="#16a34a"/>
            <text x="340" y="108" fill="#14532d" text-anchor="middle">百毫秒级：跟车 / 变道 / 让行 / 等待</text>

            <text x="20" y="168" fill="#0f172a" font-weight="700">运动规划</text>
            <rect x="150" y="150" width="220" height="26" rx="8" fill="#ede9fe" stroke="#7c3aed"/>
            <text x="260" y="168" fill="#4c1d95" text-anchor="middle">10–100 ms：生成可行轨迹</text>

            <text x="150" y="204" fill="#334155">越往下：刷新频率越高、颗粒度越细、对时延越敏感。三层通过"途经点 → 驾驶模式 → 轨迹"衔接。</text>
          </g>
        </svg>
      </div>

      <section class="sec scroll-target" id="predict">
        <div class="sec-head"><span class="no">02</span><h2>预测：最难的是“别人会怎么做”</h2></div>
        <p>自动驾驶的行车安全不只取决于自己开得好，还取决于能否预判他人。预测模块吃进感知输出，吐出每个交通参与者未来 1–5 秒的候选轨迹与概率：</p>
        <div class="grid g3">
          <div class="card reveal"><h3>📐 运动学外推</h3><p>假设对方保持当前运动（匀速/匀加速/恒定转角）外推位置。简单可靠，适合 0.5 秒内的短时预测。</p></div>
          <div class="card reveal"><h3>🎯 意图驱动</h3><p>结合地图与场景推断意图：这辆车在左转车道减速，大概率要左转；行人在斑马线旁张望，可能准备过街。</p></div>
          <div class="card reveal"><h3>♟️ 交互博弈</h3><p>我的变道会让旁车减速吗？两个车同时抢道谁会先让？把“预测”和“决策”放进博弈框架，是车流密集场景的关键。</p></div>
        </div>

      </section>

      <section class="sec scroll-target" id="route">
        <div class="sec-head"><span class="no">03</span><h2>全局路径规划：在路网上搜索最优</h2></div>
        <p>自动驾驶用的路网比手机导航更精细：除了“道路”，还包括<b>车道级拓扑</b>（哪个车道能直行、哪个只能左转）、限制条件（货车禁行、时段限行）与动态信息（封路、事故）。常用算法包括：</p>
        <ul>
          <li><b>图搜索</b>：A*、Dijkstra 及其变体，在离散路网上求最短/最快路径；</li>
          <li><b>分层规划</b>：先粗粒度规划到“片区”，再细化到“车道”，减少计算量；</li>
          <li><b>动态重规划</b>：遇到前方拥堵或封路时，在毫秒~秒级内重算，给出绕行方案。</li>
        </ul>
        <p>全局路径与高精地图深度耦合，地图如何组织与更新，见 <a href="mapping.html">定位与高精地图</a>。</p>
      </section>

      <section class="sec scroll-target" id="behavior">
        <div class="sec-head"><span class="no">04</span><h2>行为决策：驾驶的“选择题”</h2></div>
        <p>行为决策层维护着一个“驾驶策略”状态机。经典实现是有限状态机（FSM）：正常行驶 →（发现慢车）→ 跟车/请求变道 →（变道安全）→ 变道 →（汇入）→ 正常行驶。状态之外还要处理大量交规与礼仪逻辑：</p>
        <div class="grid g2">
          <div class="card reveal"><h3>🚦 交规约束</h3><p>红灯停、礼让行人、禁止实线变道、公交车道限时、学校区域限速……这些必须“绝对遵守”，否则系统再安全也不能上路。</p></div>
          <div class="card reveal"><h3>🚙 社会博弈</h3><p>没有红绿灯的路口谁先走？拥堵匝道要不要“拉链式交替通行”？被加塞时是让还是顶？行为决策要平衡<b>安全、效率与可预期性</b>。</p></div>
          <div class="card reveal"><h3>🧭 场景策略</h3><p>路口转弯、环岛进出、高速汇入/汇出、窄路会车等各有专门策略模板，可理解为“驾驶知识库”。</p></div>
          <div class="card reveal"><h3>🎮 学习增强</h3><p>越来越多系统用模仿学习/强化学习从海量数据中学“老司机的选择”，再把学到的策略与规则层、安全层叠加使用。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="motion">
        <div class="sec-head"><span class="no">05</span><h2>运动规划：生成一条“能开的曲线”</h2></div>
        <p>运动规划把离散决策变成连续轨迹，需要同时满足四类约束：</p>
        <ul>
          <li><b>安全约束</b>：任何时刻车身与障碍物的距离 > 安全裕量，且要为不可预测行为保留“反应距离”；</li>
          <li><b>动力学约束</b>：汽车不能横着走——轨迹曲率受最大转向角限制，速度受抓地力与最大制动能力限制；</li>
          <li><b>舒适度约束</b>：加速度与“加速度的变化率（jerk）”要小，避免乘客前仰后合；</li>
          <li><b>交规约束</b>：不压双黄线、限速内行驶、转向灯与轨迹一致。</li>
        </ul>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>方法家族</th><th>思路</th><th>代表</th></tr></thead>
            <tbody>
              <tr><td>采样搜索</td><td>随机/栅格采样可行轨迹再筛选</td><td>RRT、格点搜索</td></tr>
              <tr><td>曲线构造</td><td>用多项式/贝塞尔/样条拼接平滑曲线</td><td>五次多项式、螺旋线</td></tr>
              <tr><td>数值优化</td><td>把轨迹定义为优化变量，求满足约束的最优解</td><td>MPC 模型预测控制、二次规划</td></tr>
              <tr><td>端到端生成</td><td>神经网络直接输出轨迹/控制量，再经安全校验</td><td>行为克隆、VLA 模型</td></tr>
            </tbody>
          </table>
        </div>
        <p>实际量产系统普遍采用“<b>候选轨迹生成 + 代价函数评估</b>”框架：一次生成几十上百条候选，按安全、效率、舒适、交规的加权代价打分，选出最优并持续重规划（典型频率 10–50Hz）。</p>
      </section>

      <section class="sec scroll-target" id="math">
        <div class="sec-head"><span class="no">06</span><h2>规划问题的数学形式</h2></div>
        <p>运动规划本质上是一个带约束的最优控制问题：在车辆动力学、道路边界与执行器限幅的约束下，最小化“安全性 + 效率 + 舒适性”的代价。工程上常用 Frenet 坐标把横向—纵向解耦，横向用五次多项式保证加速度连续（jerk 有界）。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>方法</th><th>代表算法</th><th>优点</th><th>局限</th></tr></thead>
            <tbody>
              <tr><td>采样 + 打分</td><td>状态格采样、轨迹束</td><td>直观、易并行、可解释</td><td>高维空间采样爆炸，可能漏掉最优解</td></tr>
              <tr><td>图搜索</td><td>A*、Hybrid A*、Lattice</td><td>启发式可采纳时有最优性保证</td><td>离散化误差，动态障碍处理麻烦</td></tr>
              <tr><td>数值优化</td><td>二次规划（QP）、非线性 MPC</td><td>能显式处理约束，轨迹平滑</td><td>非凸问题易陷局部最优，实时性压力大</td></tr>
              <tr><td>学习型</td><td>模仿学习、强化学习、端到端</td><td>上限高、少写规则</td><td>可解释性与安全验证困难</td></tr>
            </tbody>
          </table>
        </div>

      </section>

      <section class="sec scroll-target" id="learning">
        <div class="sec-head"><span class="no">07</span><h2>端到端：让网络自己学会开车</h2></div>
        <p>“模块化”流水线里，感知误差会逐级放大；而“端到端”用一个神经网络直接吃传感器输入、输出控制指令或轨迹，规则写不出来的场景（复杂博弈、罕见路况）有机会靠数据学会。</p>
        <div class="grid g2">
          <div class="card reveal"><h3>📈 上限与风险</h3><p>学习型系统的上限更高、更像人类，但它是黑盒：你不知道它“为什么”这么开，出了问题难以归因。这正是它与汽车工业“可审计”传统冲突的地方。</p></div>
          <div class="card reveal"><h3>🛡️ 工业界折中</h3><p>当前主流不是“全端到端”，而是：神经网络负责感知与大部分决策，外层保留规则与安全校验层；轨迹先过碰撞检查，再交执行。也就是“<b>用端到端提上限，用规则保下限</b>”。</p></div>
        </div>
        <p class="sec-sub">当端到端与大模型结合，就演进为 VLA（视觉-语言-动作）等形态：模型既能用语言描述“看到了什么”，也能直接把语言指令与画面翻译成行驶动作，详见 <a href="../frontier.html">AI 前沿：LLM 与世界模型</a>。</p>
      </section>

      <section class="sec scroll-target" id="safety">
        <div class="sec-head"><span class="no">08</span><h2>规划的“安全兜底”设计</h2></div>
        <p>规划层必须承认“我一定会算错”，因此需要多层保险：</p>
        <ol class="steps">
          <li><h3>实时碰撞检查</h3><p>每条候选轨迹先与所有障碍物的“预测占用”做时空碰撞检查，不合格直接淘汰。</p></li>
          <li><h3>最坏情况预留</h3><p>跟车距离按“前车瞬间急刹”设计；路口减速按“盲区里突然窜出行人”设计。</p></li>
          <li><h3>紧急策略</h3><p>检测到不可避免碰撞时，选择“相对最不坏”的处置并全力制动；AEB 等底层安全系统独立于智驾决策存在。</p></li>
          <li><h3>最小风险状态</h3><p>发现自己超出 ODD 或自身状态异常时，规划主动降级：减速、打双闪、变到应急车道并靠边停车。这是 L3+ 的基本功，详见 <a href="../levels.html#l2-l3">L2→L3 分水岭</a>。</p></li>
        </ol>
      </section>

      <section class="sec scroll-target" id="rss">
        <div class="sec-head"><span class="no">09</span><h2>安全模型：RSS 与形式化验证</h2></div>
        <p>“不撞车”不能只靠经验调参。业界提出过一些可计算的安全模型，最著名的是 Mobileye 的 <b>RSS（Responsibility Sensitive Safety，责任敏感安全）</b>，它用一组数学规则定义“谁该负责”：</p>
        <div class="math math-left">跟车纵向安全距离：<br>d_min = v_r·t_r + ½·a_max·t_r² + (v_r + a_max·t_r)²/(2·b_min) − v_f²/(2·b_max)<br>横向：仅在“有路权”且对方未违规时，才允许并线或通过</div>
        <p>其中 t_r 为反应时间，a_max 为最大加速度，b_min / b_max 为双方最大减速度。RSS 把“合理谨慎”形式化为可验证的不等式，规划器只要保证不违反这些约束，就认为处于安全状态。它的价值在于<b>可证明、可审计</b>；局限在于对复杂交互（无保护左转、多车博弈）仍偏保守。</p>
        <p>另一条路线是<b>形式化验证</b>：用可达集分析（reachability analysis）计算“未来所有可能状态”，只要可达集与障碍物占用集不相交，就证明不会碰撞。工具如 CORA、Flow* 可处理线性或简单非线性系统，但对高维感知输入仍需简化。</p>

      </section>
