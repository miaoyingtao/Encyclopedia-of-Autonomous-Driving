---
id: "pages/tech/perception/fusion.html"
slug: "fusion"
title: "多传感器融合 · 驶向未来百科"
description: "自动驾驶多传感器融合专题：前融合/后融合、时间同步、空间标定、置信度融合与冲突处理。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 传感器深潜 ⑤ / ⑤"
hero_h1: "多传感器融合"
hero_lead: "摄像头、激光雷达、毫米波雷达各自“会一种武功”，融合系统则把它们编排成一支球队：谁的状态好谁主攻，谁失灵了其他人立刻补位——这是 L4 安全感的来源。"
crumb: "首页|../../../index.html"
crumb: "技术|../../../pages/tech.html"
crumb: "环境感知|../../../pages/tech/perception.html"
crumb: "多传感器融合|"
---

<section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">01</span><h2>为什么必须做融合</h2></div>
        <p>回顾前四个专题，每种传感器都有“一票否决”的盲区：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>传感器</th><th>最怕什么</th><th>谁的短板它来补</th></tr></thead>
            <tbody>
              <tr><td>摄像头</td><td>黑夜、逆光、雨雾</td><td>→ 激光雷达与毫米波雷达在弱光下依然工作</td></tr>
              <tr><td>激光雷达</td><td>雨雾衰减、黑色/玻璃物体</td><td>→ 毫米波穿透雨雾，摄像头识别语义</td></tr>
              <tr><td>毫米波雷达</td><td>角度分辨率低、静止杂波</td><td>→ 摄像头与激光雷达提供精细几何与分类</td></tr>
              <tr><td>超声波雷达</td><td>距离短、吸声物体</td><td>→ 环视摄像头负责“看见”并理解场景</td></tr>
            </tbody>
          </table>
        </div>
        <p>融合带来两重收益：<b>能力互补</b>（1+1&gt;2 的感知上限）与<b>冗余备份</b>（某一路失效后系统仍可用）。后者不仅是工程偏好，更是功能安全的硬性要求——L4 失去单一传感器必须仍能安全运行，见 <a href="../../challenges/safety.html">功能安全专题</a>。</p>
      </section>

      <section class="sec scroll-target" id="levels">
        <div class="sec-head"><span class="no">02</span><h2>融合的三个层级</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>层级</th><th>做法</th><th>优点</th><th>缺点</th></tr></thead>
            <tbody>
              <tr><td><b>后融合</b>（目标级）</td><td>每个传感器先独立检测出“目标列表”，再把目标按位置/ID 合并</td><td>模块解耦、可解释、任一路升级不影响其他路；好调试</td><td>信息被“压缩”过一次，融合已无法挽回单路漏检</td></tr>
              <tr><td><b>特征级融合</b></td><td>各传感器提取中间特征（图像特征图、点云特征），在网络中融合后再做检测</td><td>兼顾精度与工程可实现性，目前主流</td><td>需要精心设计网络结构，标定误差影响大</td></tr>
              <tr><td><b>前融合</b>（数据级）</td><td>先把原始图像、点云、雷达数据对齐到同一表示（如 BEV），再统一推理</td><td>信息保留最完整，理论上限最高，还能补单路漏检</td><td>数据量大、算力要求高，对时间/空间标定极其敏感</td></tr>
            </tbody>
          </table>
        </div>
        <p>有趣的是：主流技术正从“后融合”走向“前融合/特征融合”——因为深度学习让“在更早阶段合并数据”变得可行，BEV 鸟瞰视角就是前融合的典型载体。</p>
      </section>

      <div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--shadow);overflow-x:auto;margin:18px 0">
        <svg viewBox="0 0 920 240" role="img" aria-label="三路传感器帧率不同，必须对齐到统一时基" style="min-width:760px;width:100%;height:auto;font-family:inherit">
          <g font-size="12">
            <text x="20" y="54" fill="#0f172a" font-weight="700">相机 30 fps</text>
            <text x="20" y="104" fill="#0f172a" font-weight="700">毫米波 20 fps</text>
            <text x="20" y="154" fill="#0f172a" font-weight="700">激光雷达 10 fps</text>

            <line x1="170" y1="50" x2="870" y2="50" stroke="#cbd5e1" stroke-width="1.5"/>
            <line x1="170" y1="100" x2="870" y2="100" stroke="#cbd5e1" stroke-width="1.5"/>
            <line x1="170" y1="150" x2="870" y2="150" stroke="#cbd5e1" stroke-width="1.5"/>

            <circle cx="170" cy="50" r="5" fill="#0ea5e9"/><circle cx="277" cy="50" r="5" fill="#0ea5e9"/><circle cx="384" cy="50" r="5" fill="#0ea5e9"/><circle cx="491" cy="50" r="5" fill="#0ea5e9"/><circle cx="598" cy="50" r="5" fill="#0ea5e9"/><circle cx="705" cy="50" r="5" fill="#0ea5e9"/><circle cx="812" cy="50" r="5" fill="#0ea5e9"/>

            <circle cx="170" cy="100" r="5" fill="#16a34a"/><circle cx="332" cy="100" r="5" fill="#16a34a"/><circle cx="494" cy="100" r="5" fill="#16a34a"/><circle cx="656" cy="100" r="5" fill="#16a34a"/><circle cx="818" cy="100" r="5" fill="#16a34a"/>

            <circle cx="170" cy="150" r="5" fill="#7c3aed"/><circle cx="495" cy="150" r="5" fill="#7c3aed"/><circle cx="820" cy="150" r="5" fill="#7c3aed"/>

            <text x="170" y="176" fill="#64748b" text-anchor="middle">0 ms</text>
            <text x="495" y="176" fill="#64748b" text-anchor="middle">100 ms</text>
            <text x="820" y="176" fill="#64748b" text-anchor="middle">200 ms</text>

            <line x1="494" y1="34" x2="494" y2="164" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="5 4"/>
            <text x="494" y="24" fill="#b91c1c" font-weight="700" text-anchor="middle">统一时基 t_k（三路都要插值到这个时刻）</text>

            <text x="20" y="212" fill="#334155" font-size="12.5">未对齐的代价：100 ms 的时间偏差，在 72 km/h 下相当于约 2 m 的空间错位——同一目标会在不同传感器里"落在两个位置"。</text>
          </g>
        </svg>
      </div>

      <section class="sec scroll-target" id="steps">
        <div class="sec-head"><span class="no">03</span><h2>融合的工程四步走</h2></div>
        <ol class="steps">
          <li><h3>标定</h3><p>先做内参标定（镜头畸变、雷达收发对准），再做外参标定（每个传感器相对车体的精确位置与朝向）。标定误差 1°，在 100 米外就是 1.7 米的错位——融合的前提是“坐标系对齐”。</p></li>
          <li><h3>时间同步</h3><p>摄像头 30fps、激光雷达 10Hz、雷达 20Hz，各自触发时刻不同。120km/h 下 50ms 就是 1.7 米，必须用硬件同步或软件插值把数据对齐到同一时刻。</p></li>
          <li><h3>坐标统一</h3><p>把图像像素、点云坐标、雷达回波都转换到统一的“车体坐标系”（常见：车辆后轴中心原点）。</p></li>
          <li><h3>融合推理</h3><p>在统一空间里做检测/跟踪/预测：同一目标的多路观测互相印证，得到更稳的 ID、更高的置信度与更准确的轨迹。</p></li>
        </ol>

      </section>

      <section class="sec scroll-target" id="conflict">
        <div class="sec-head"><span class="no">04</span><h2>当传感器“吵架”时听谁的</h2></div>
        <p>融合系统的日常不是“一致同意”，而是处理分歧：摄像头看到前方有“行人”，激光雷达却在那个位置“没点”……这时系统怎么做？</p>
        <ul>
          <li><b>按能力分配权重</b>：不同条件下各传感器置信度不同——白天摄像头权重高，雨夜毫米波雷达权重高，测距时激光雷达意见优先；</li>
          <li><b>时序一致性校验</b>：单帧“幽灵目标”往往不稳定，若多帧持续存在才确认为真目标，可滤除大部分杂波；</li>
          <li><b>保守优先原则</b>：安全相关判断上“宁可信其有”——雷达误报与视觉漏检相比，前者只是多刹一脚，后者可能酿成事故；</li>
          <li><b>置信度传播</b>：每个目标都带“来源传感器数量 + 各源置信度”，下游决策可根据证据强度决定激进还是保守。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="hard">
        <div class="sec-head"><span class="no">05</span><h2>融合的真实工程挑战</h2></div>
        <div class="grid g2">
          <div class="card reveal"><h3>📐 标定鲁棒性</h3><p>热胀冷缩、碰撞变形都会破坏外参。车规需要“终身自标定”能力，这是实验室系统与量产系统最大的差距之一。</p></div>
          <div class="card reveal"><h3>🧮 算力与带宽</h3><p>前融合要把 8 路摄像头 + 点云 + 雷达数据同时送进网络，对总线带宽与 NPU 算力要求极高。</p></div>
          <div class="card reveal"><h3>🔁 误差传播</h3><p>雷达测角误差、点云配准误差会一起进入融合结果；如果各源系统误差同向，融合并不会“负负得正”。</p></div>
          <div class="card reveal"><h3>🧪 验证复杂度</h3><p>融合系统的测试状态空间爆炸：单一传感器各失效一种、部分失效组合、标定漂移等，都需要仿真与实车覆盖（见 <a href="../../challenges/testing.html">测试与评价</a>）。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="future">
        <div class="sec-head"><span class="no">06</span><h2>未来：从“传感器融合”走向“统一感知”</h2></div>
        <p>过去融合是“把多路结果加起来”；现在的方向是<b>在训练中让网络自己学如何最优融合</b>：</p>
        <ul>
          <li><b>BEV 统一空间</b>：所有传感器先投影到鸟瞰网格，感知、预测、规划在同一坐标系里完成，天然可融合；</li>
          <li><b>传感器 Token 化</b>：摄像头图像、点云、雷达各自变成“Token 序列”，让 Transformer 大模型自主决定如何交叉引用（类似多模态大模型）；</li>
          <li><b>端到端联合优化</b>：感知融合结果直接参与规划损失的反向传播，让融合“为驾驶目标服务”，而不是孤立地追求“检测更准”。</li>
        </ul>
        <p>这意味着“融合”将不再是一个独立的工程模块，而成为整个智能驾驶模型的内生能力。相关的端到端趋势见 <a href="../../future.html">未来展望</a>，系统的前沿科普见 <a href="../../frontier.html">AI 前沿：LLM 与世界模型</a>。</p>
      </section>

      <section class="sec scroll-target" id="math">
        <div class="sec-head"><span class="no">07</span><h2>数学基础：贝叶斯与卡尔曼滤波</h2></div>
        <p>融合的本质是“用多路带噪观测估计同一状态”。贝叶斯公式给出统一框架：后验 ∝ 似然 × 先验；当系统线性、噪声高斯时，它退化为卡尔曼滤波——只需维护均值与协方差，R 越小表示越信任该传感器。</p>

      </section>

      <section class="sec scroll-target" id="association">
        <div class="sec-head"><span class="no">08</span><h2>数据关联与航迹管理</h2></div>
        <p>多传感器融合必须回答“哪个观测对应哪条航迹”，这就是数据关联：目标稀疏时用最近邻，工程主流是全局最近邻（匈牙利算法），密集模糊场景可用 JPDA 或多假设跟踪（MHT）。关联之外还要做航迹管理，避免虚假目标与 ID 闪烁。</p>

      </section>
