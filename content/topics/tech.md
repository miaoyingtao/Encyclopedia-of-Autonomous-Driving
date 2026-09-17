---
id: "pages/tech.html"
slug: "tech"
title: "核心技术 · 驶向未来百科"
description: "自动驾驶核心技术总览：环境感知、决策规划、控制执行、定位与高精地图、车路协同 V2X。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "域 02 · 技术"
hero_h1: "自动驾驶的核心技术"
hero_lead: "自动驾驶本质上是把“会开车的人”拆解成可工程化的能力：看清世界、想好动作、精准执行，并用地图、通信与安全机制兜底。本主题可继续下钻到各子技术。"
crumb: "首页|../index.html"
crumb: "技术|"
---

<section class="sec scroll-target" id="pipeline">
        <div class="sec-head"><span class="no">01</span><h2>一套完整的技术栈长什么样</h2></div>
        <p>一辆 L4 级自动驾驶车，内部就像一套“实时操作系统 + AI 大脑 + 精密底盘”：传感器把物理世界数字化，算法把它变成决策，执行器把决策变成车轮的每一度转向与每一次制动。整个链条以毫秒级延迟闭环运行：</p>
        <div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--shadow);overflow-x:auto">
        <svg viewBox="0 0 920 330" role="img" aria-label="自动驾驶技术栈流程示意图" style="min-width:760px;width:100%;height:auto;font-family:inherit">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2563eb"/></marker>
            <marker id="arrUp" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 10L5 0L10 10z" fill="#94a3b8"/></marker>
          </defs>
          <g font-size="13.5" text-anchor="middle">
            <rect x="20" y="40" width="130" height="64" rx="12" fill="#e0f2fe" stroke="#0ea5e9"/>
            <text x="85" y="68" font-weight="700" fill="#075985">传感器</text>
            <text x="85" y="88" fill="#0c4a6e">摄像·雷达·激光</text>

            <line x1="150" y1="72" x2="198" y2="72" stroke="#2563eb" stroke-width="3" marker-end="url(#arr)"/>
            <rect x="200" y="40" width="150" height="64" rx="12" fill="#dbeafe" stroke="#2563eb"/>
            <text x="275" y="68" font-weight="700" fill="#1e40af">环境感知</text>
            <text x="275" y="88" fill="#1e3a8a">识别·跟踪·预测</text>

            <line x1="350" y1="72" x2="398" y2="72" stroke="#2563eb" stroke-width="3" marker-end="url(#arr)"/>
            <rect x="400" y="40" width="150" height="64" rx="12" fill="#c7d2fe" stroke="#6366f1"/>
            <text x="475" y="68" font-weight="700" fill="#3730a3">决策与规划</text>
            <text x="475" y="88" fill="#312e81">选路·避障·轨迹</text>

            <line x1="550" y1="72" x2="598" y2="72" stroke="#2563eb" stroke-width="3" marker-end="url(#arr)"/>
            <rect x="600" y="40" width="150" height="64" rx="12" fill="#ede9fe" stroke="#8b5cf6"/>
            <text x="675" y="68" font-weight="700" fill="#5b21b6">控制执行</text>
            <text x="675" y="88" fill="#4c1d95">转向·制动·驱动</text>

            <line x1="750" y1="72" x2="798" y2="72" stroke="#2563eb" stroke-width="3" marker-end="url(#arr)"/>
            <rect x="800" y="40" width="100" height="64" rx="12" fill="#d1fae5" stroke="#059669"/>
            <text x="850" y="72" font-weight="700" fill="#065f46">车辆</text>

            <line x1="550" y1="180" x2="550" y2="112" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#arrUp)"/>
            <rect x="20" y="180" width="230" height="60" rx="12" fill="#fef9c3" stroke="#eab308"/>
            <text x="135" y="205" font-weight="700" fill="#713f12">定位与高精地图</text>
            <text x="135" y="225" fill="#854d0e">“我在哪·车道在哪”</text>

            <rect x="345" y="180" width="230" height="60" rx="12" fill="#ffedd5" stroke="#f97316"/>
            <text x="460" y="205" font-weight="700" fill="#7c2d12">车路协同 V2X</text>
            <text x="460" y="225" fill="#9a3412">“看见红绿灯与盲区”</text>

            <rect x="670" y="180" width="230" height="60" rx="12" fill="#fce7f3" stroke="#ec4899"/>
            <text x="785" y="205" font-weight="700" fill="#831843">仿真与数据闭环</text>
            <text x="785" y="225" fill="#9d174d">“用千万场景训练验证”</text>
          </g>
        </svg>
        </div>

      </section>

      <section class="sec scroll-target" id="topics">
        <div class="sec-head"><span class="no">02</span><h2>技术专题（可继续下钻）</h2></div>
        <div class="grid g2">
          <div class="card reveal">
            <div class="ci">👁️</div><h3>环境感知 Perception</h3>
            <p>如何把摄像头、激光雷达、毫米波雷达的数据变成“前方 80 米有行人、右侧车道可以变道”的结构化理解。含传感器逐个深挖。</p>
            <span class="tag">摄像头</span><span class="tag">激光雷达</span><span class="tag">毫米波雷达</span><span class="tag">BEV/占用网络</span>
            <a class="more" href="tech/perception.html">进入专题并下钻</a>
          </div>
          <div class="card reveal">
            <div class="ci">🧮</div><h3>决策与规划 Decision & Planning</h3>
            <p>预测行人下一秒的动向，再算出一条安全、舒适、符合交规的轨迹——从全局路径到每秒数十次的局部重规划。</p>
            <span class="tag">行为预测</span><span class="tag">运动规划</span><span class="tag">强化学习</span>
            <a class="more" href="tech/decision.html">进入专题</a>
          </div>
          <div class="card reveal">
            <div class="ci">🎛️</div><h3>控制执行 Control</h3>
            <p>让规划出的轨迹真正落到方向盘与刹车上：线控底盘、横纵向控制算法、执行器冗余与故障降级。</p>
            <span class="tag">线控转向</span><span class="tag">线控制动</span><span class="tag">MPC</span>
            <a class="more" href="tech/control.html">进入专题</a>
          </div>
          <div class="card reveal">
            <div class="ci">📍</div><h3>定位与高精地图 Localization & HD Map</h3>
            <p>厘米级回答“我在哪”，用车道级地图补足传感器看不远的局限，并应对隧道、地下车库等无 GNSS 环境。</p>
            <span class="tag">GNSS/RTK</span><span class="tag">惯性导航</span><span class="tag">点云配准</span>
            <a class="more" href="tech/mapping.html">进入专题</a>
          </div>
          <div class="card reveal">
            <div class="ci">📡</div><h3>车路协同 V2X</h3>
            <p>让车与车、车与路、车与云端对话：看见被遮挡的行人、接收红绿灯倒计时、提前感知前方事故。</p>
            <span class="tag">V2V/V2I/V2N</span><span class="tag">C-V2X</span><span class="tag">车路云一体化</span>
            <a class="more" href="tech/v2x.html">进入专题</a>
          </div>
          <div class="card reveal">
            <div class="ci">🔋</div><h3>算力平台 Compute</h3>
            <p>支撑上述一切的“车载超级电脑”：AI 芯片、域控制器、高带宽传感器接口与安全实时操作系统，算力以每秒万亿次（TOPS）计。</p>
            <span class="tag">域控制器</span><span class="tag">TOPS</span><span class="tag">车规级</span>
            <a class="more" href="tech/perception.html#compute">在感知页看算力小节</a>
          </div>
          <div class="card reveal">
            <div class="ci">🧠</div><h3>AI 大模型与智驾前沿</h3>
            <p>大语言模型 LLM、多模态大模型（VLM/VLA）与世界模型如何进入汽车：从“听懂人话”“识别没见过的东西”，到让模型在脑海里预演未来几秒再开车。</p>
            <span class="tag">LLM</span><span class="tag">VLM/VLA</span><span class="tag">世界模型</span><span class="tag">端到端</span>
            <a class="more" href="frontier.html">进入 AI 前沿专题</a>
          </div>
        </div>
      </section>

      <section class="sec scroll-target" id="base">
        <div class="sec-head"><span class="no">03</span><h2>算力平台：从工控机到车规域控制器</h2></div>
        <p>算法能跑多快，取决于芯片的<b>有效算力</b>，而不只是标称 TOPS。真实可用算力还要扣除算子支持率、内存带宽与热设计功耗的折损。行业通常按算力与安全等级分成三档：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>层级</th><th>典型算力</th><th>功耗与形态</th><th>典型用途</th></tr></thead>
            <tbody>
              <tr><td><b>安全 MCU / 安全岛</b></td><td>&lt; 1 TOPS，甚至无 NPU</td><td>数瓦，ASIL-D，独立供电</td><td>看门狗、线控仲裁、AEB 兜底、最小风险机动</td></tr>
              <tr><td><b>量产 ADAS SoC</b></td><td>数十至数百 TOPS</td><td>10–50 W，单板或域控</td><td>L2/L2+ 高速与泊车，追求 TOPS/W 与成本</td></tr>
              <tr><td><b>中央计算平台</b></td><td>500–2000+ TOPS</td><td>100–300 W，需主动散热</td><td>L3/L4 多传感器 + 大模型，统一承载感知与规控</td></tr>
            </tbody>
          </table>
        </div>
        <p>选型时不能只看 TOPS，要同时评估三件事：① <b>算力利用率</b>——同样 254 TOPS，能否高效跑你的 BEV/Transformer，取决于 NPU 对算子（如 deformable attention、scatter）的支持；② <b>内存带宽</b>——多路 8MP 视频与点云是带宽密集型负载，LPDDR5 的带宽常先于算力成为瓶颈；③ <b>车规与安全</b>——AEC-Q100、ISO 26262 ASIL 等级、-40~85 ℃ 工作范围与 15 年寿命。</p>

      </section>

      <section class="sec scroll-target" id="latency">
        <div class="sec-head"><span class="no">04</span><h2>实时性：频率预算与端到端时延</h2></div>
        <p>“算法正确”不等于“能上车”。自动驾驶是硬实时闭环：从传感器曝光到执行器动作，整条链路必须在车辆前进的安全距离内完成。工程上把链路拆成可度量的频率与延迟预算：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>环节</th><th>典型频率</th><th>单次时延预算</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>传感器采集</td><td>10–30 Hz</td><td>曝光 + 传输 10–30 ms</td><td>30 Hz 对应 33 ms/帧，72 km/h 时车辆已前进约 0.67 m</td></tr>
              <tr><td>感知推理</td><td>10–30 Hz</td><td>30–100 ms</td><td>BEV/占用网络是算力大头，常用量化与算子融合压时延</td></tr>
              <tr><td>预测</td><td>10–20 Hz</td><td>10–30 ms</td><td>多模态轨迹生成 + 打分</td></tr>
              <tr><td>规划</td><td>10–50 Hz</td><td>20–80 ms</td><td>采样/优化 + 碰撞与边界校验</td></tr>
              <tr><td>控制</td><td>50–100 Hz</td><td>5–20 ms</td><td>横纵向解耦，MPC 需在线求解二次规划</td></tr>
              <tr><td>执行器响应</td><td>—</td><td>转向 100–300 ms</td><td>机械与电机/液压的物理延迟，需在轨迹中前馈补偿</td></tr>
            </tbody>
          </table>
        </div>
        <div class="math math-left">t_total = t_sense + t_perception + t_plan + t_control + t_actuator<br>d_stop = v · t_total + v² / (2·a_max)</div>
        <p>以 72 km/h（20 m/s）为例，若端到端时延 200 ms、最大减速度 6 m/s²，则“发现→停住”的距离约为 20×0.2 + 20²/(2×6) ≈ 37 m。这意味着每多 100 ms 时延，就要多留约 2 m 安全余量——高速场景对时延极其敏感。</p>

      </section>

      <section class="sec scroll-target" id="software">
        <div class="sec-head"><span class="no">05</span><h2>车载软件架构：中间件与确定性调度</h2></div>
        <p>自动驾驶程序不是一堆独立进程，而是运行在实时操作系统上的分布式系统。算法要落地，必须先解决“谁在什么时候算、数据怎么可靠送达”的问题：</p>
        <div class="grid g2">
          <div class="card reveal"><h3>🧩 通信中间件</h3><p>ROS 2 基于 DDS 提供发布/订阅与 QoS（可靠性、历史深度、截止时间），支持零拷贝共享内存；AUTOSAR Adaptive 用 SOA + SOME/IP 承载车控服务。两者常在同一域控制器内共存，用桥接层打通。</p></div>
          <div class="card reveal"><h3>⏱ 确定性调度</h3><p>关键任务用 SCHED_FIFO / 时间触发调度 + CPU 亲和性绑定，避免被非关键任务抢占；大模型推理走独立 NPU 队列，与安全监控进程在资源上隔离。</p></div>
          <div class="card reveal"><h3>🕒 时间同步</h3><p>多传感器融合依赖统一时间基准，用 PTP（IEEE 1588）或 gPTP 做硬件时间戳，误差控制在微秒级。时间戳错位是“鬼影/拖影”的常见根因。</p></div>
          <div class="card reveal"><h3>🔄 OTA 与回滚</h3><p>双分区 A/B 升级，失败自动回滚；功能安全相关软件的升级需满足 ISO 24089 与法规要求，并保留可追溯的版本与标定数据。</p></div>
        </div>
        <div class="codeblock"># 典型域控制器进程/线程划分（示意）
safety_monitor   (RT, 1 kHz)   —— 看门狗、心跳、降级仲裁，ASIL-D
sensor_driver    (RT, 100 Hz)  —— 时间戳打标、零拷贝入共享内存
perception_gpu   (30 Hz)       —— BEV/占用网络，独立 NPU 队列
prediction       (20 Hz)       —— 多模态轨迹 + 概率
planning         (20–50 Hz)    —— 采样/优化 + 碰撞校验
control          (100 Hz)      —— 横纵向 MPC/PID
logging/upload   (尽力而为)     —— 影子模式、Corner Case 回传</div>
      </section>

      <section class="sec scroll-target" id="safety-arch">
        <div class="sec-head"><span class="no">06</span><h2>安全架构：冗余、监控与降级</h2></div>
        <p>安全不是某个模块的属性，而是整个系统的架构属性。ISO 26262 管“随机硬件失效”，ISO 21448（SOTIF）管“功能正常但判断错误”，两者共同决定架构：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>机制</th><th>解决的问题</th><th>典型实现</th></tr></thead>
            <tbody>
              <tr><td>Fail-safe（失效即安全）</td><td>单点失效后进入安全状态</td><td>L2 及以下：退出智驾、提示接管，AEB 独立兜底</td></tr>
              <tr><td>Fail-operational（失效可运行）</td><td>单点失效后仍能完成最小风险机动</td><td>L3+：双制动回路、双转向电机、双电源、双计算通道</td></tr>
              <tr><td>2oo2 / 2oo3 表决</td><td>识别并隔离错误通道</td><td>异构双通道结果比对，分歧时降级到保守策略</td></tr>
              <tr><td>安全监控器</td><td>发现“算得不对 / 来不及”</td><td>独立 MCU 监控心跳、超时与输出合理性，直接触发 MRM</td></tr>
              <tr><td>MRM（最小风险机动）</td><td>超出 ODD 或系统异常时保底</td><td>减速、打双闪、靠边停车，或维持车道直到驾驶员接管</td></tr>
            </tbody>
          </table>
        </div>
        <p>架构设计的基本准则是<b>“异构冗余优先于同构冗余”</b>：两套相同软件会同时犯同一个错，而“视觉 + 激光雷达”“规则 + 学习”“A 芯片 + B 芯片”的异构组合才能覆盖共因失效。标准条款与量化指标见 <a href="challenges/safety.html">功能安全与 SOTIF</a>。</p>
      </section>

      <section class="sec scroll-target" id="data-loop">
        <div class="sec-head"><span class="no">07</span><h2>数据闭环：从里程到有效样本</h2></div>
        <p>“跑了多少万公里”不是有效指标，真正决定能力上限的是<b>有效危险样本的密度</b>。工程上的数据闭环通常包含四个环节：</p>
        <ol class="steps">
          <li><h3>影子模式与自动触发</h3><p>模型在后台“离线跑”，与人类驾驶或当前策略比对；出现分歧、接管、急刹、近距离切入时自动打标回传。触发条件必须可解释、可复现。</p></li>
          <li><h3>场景挖掘与切片</h3><p>用感知结果 + 车辆信号把长时序数据切成场景片段（路口、加塞、鬼探头、施工区），按稀有度、危险度与模型不确定性排序，优先送标。</p></li>
          <li><h3>主动学习与标注</h3><p>优先标注模型置信度低、预测熵高或集成模型分歧大的样本，用最少的标注量换取最大的能力提升。</p></li>
          <li><h3>仿真回归与灰度</h3><p>新模型先在数十万条场景库上回归（不得回退既有能力），再按车队灰度 OTA，用真实数据验证后全量推送。</p></li>
        </ol>

      </section>

      <section class="sec scroll-target" id="standards">
        <div class="sec-head"><span class="no">08</span><h2>关键标准与法规索引</h2></div>
        <p>读技术文档时，下面这些编号会反复出现。它们不是“加分项”，而是产品能否上市的前置条件。全站出现的标准与法规（含“管什么、谁必须做”）汇总在 <a href="glossary.html#standards">概念 · 指标 · 标准 索引 · 标准清单</a>：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>标准 / 法规</th><th>覆盖范围</th><th>与本站的关系</th></tr></thead>
            <tbody>
              <tr><td>ISO 26262</td><td>道路车辆功能安全（ASIL A–D）</td><td>硬件冗余、失效处理、安全生命周期</td></tr>
              <tr><td>ISO 21448 (SOTIF)</td><td>预期功能安全</td><td>感知/预测/规划“没坏但判断错”的风险</td></tr>
              <tr><td>ISO 21434</td><td>汽车网络安全</td><td>OTA、通信、攻击面与纵深防御</td></tr>
              <tr><td>SAE J3016 / GB/T 40429</td><td>驾驶自动化分级</td><td>L0–L5 的责任边界与 ODD 定义</td></tr>
              <tr><td>UN R157 (ALKS)</td><td>车道保持系统法规</td><td>L3 高速场景的准入与接管要求</td></tr>
              <tr><td>ISO 34502 / UL 4600</td><td>场景测试与安全论证</td><td>仿真、路测与安全案例的评估方法</td></tr>
              <tr><td>ISO 24089</td><td>软件更新工程</td><td>OTA 流程与回滚</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec scroll-target" id="schools">
        <div class="sec-head"><span class="no">09</span><h2>三大技术流派之争</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>流派</th><th>核心思路</th><th>优势</th><th>挑战</th></tr></thead>
            <tbody>
              <tr><td><b>模块化（传统）</b></td><td>感知、预测、规划、控制各自独立成模块，层层传递结果</td><td>可解释、易调试、便于逐项验证与安全审计</td><td>模块间误差累积、规则写不完所有场景</td></tr>
              <tr><td><b>端到端（学习型）</b></td><td>用一个神经网络把传感器输入直接映射为控制指令</td><td>少写规则、更像人类、上限高，近期借助大模型快速发展</td><td>黑盒难解释、数据依赖强、需要海量高质量数据与仿真验证</td></tr>
              <tr><td><b>车路协同（网联型）</b></td><td>不只靠单车智能，让“聪明的车+智慧的路+云端大脑”分工协作</td><td>超视距感知、缓解单车成本与长尾难题</td><td>依赖基础设施投资与运营方协同，规模化慢</td></tr>
            </tbody>
          </table>
        </div>
        <p class="sec-sub">现实中厂商多采用“混合路线”：主干用端到端模型提升能力上限，同时保留模块化安全兜底与可审计接口。这条路线的演化见 <a href="future.html">未来展望</a>；与 LLM、世界模型结合的完整脉络见 <a href="frontier.html">AI 前沿专题</a>。</p>
      </section>

      <section class="related scroll-target" id="next">
        <h3>深入哪一条支线？</h3>
        <p style="margin-bottom:10px">建议按兴趣选择：想了解“用什么传感器、如何识别”，进入环境感知；想看“车怎么自己决定路线”，进入决策与规划；想了解与交通设施联动，进入车路协同。</p>
        <div class="rel-links">
          <a href="tech/perception.html">环境感知（可下钻到传感器）</a>
          <a href="tech/decision.html">决策与规划</a>
          <a href="tech/control.html">控制执行</a>
          <a href="tech/mapping.html">定位与高精地图</a>
          <a href="tech/v2x.html">车路协同 V2X</a>
          <a href="frontier.html">AI 大模型与智驾前沿</a>
          <a href="tutorial/index.html">系统教程（进阶讲义）</a>
          <a href="challenges/testing.html">仿真与测试验证</a>
        </div>
      </section>
