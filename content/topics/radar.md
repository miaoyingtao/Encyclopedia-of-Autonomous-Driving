---
id: "pages/tech/perception/radar.html"
slug: "radar"
title: "毫米波雷达 · 驶向未来百科"
description: "自动驾驶毫米波雷达专题：FMCW 测速原理、77GHz 频段、4D 成像雷达与全天候优势。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 传感器深潜 ③ / ⑤"
hero_h1: "毫米波雷达：恶劣天气里的“主力军”"
hero_lead: "在瓢泼大雨、浓雾或漫天黄沙中，摄像头看不清、激光雷达打不远，只有毫米波雷达依然稳定工作——而且它能“直接测速度”，这是其他传感器做不到的。"
crumb: "首页|../../../index.html"
crumb: "技术|../../../pages/tech.html"
crumb: "环境感知|../../../pages/tech/perception.html"
crumb: "毫米波雷达|"
---

<section class="sec scroll-target" id="principle">
        <div class="sec-head"><span class="no">01</span><h2>原理：毫米波与“多普勒效应”</h2></div>
        <p>毫米波雷达发射波长在毫米量级的电磁波（车载主流 76–81GHz，对应波长约 4mm）。它用两种物理效应同时测两件事：</p>
        <div class="grid g2">
          <div class="card reveal"><h3>📏 飞行时间测距</h3><p>像激光雷达一样，测电磁波往返的时间得到距离。主流 FMCW（调频连续波）方案通过频率差解算距离，实现简单、成本低。</p></div>
          <div class="card reveal"><h3>🚀 多普勒效应测速</h3><p>回波的频率会因目标的径向运动而改变（靠近变高、远离变低）。雷达可以<b>在一瞬间直接读出目标的相对速度</b>——摄像头要算好几帧才能估计出速度。</p></div>
        </div>
        <p>毫米波还有一个天然优势：<b>波长比可见光大几千倍</b>，雨滴、雾粒、灰尘对它几乎是“透明的”。这让它在恶劣天气中表现远优于摄像头与激光雷达。</p>
      </section>

      <section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">02</span><h2>为什么 ADAS 和自动驾驶都离不开它</h2></div>
        <div class="grid g3">
          <div class="card reveal"><h3>🛑 法规标配</h3><p>各国新车评价体系（如 Euro NCAP）把 AEB 自动紧急制动、ACC 自适应巡航作为安全标配推动，而这两项功能自诞生起就以毫米波雷达为主传感器。</p></div>
          <div class="card reveal"><h3>🌧️ 全天候兜底</h3><p>夜间、雨雪、雾霾、扬尘中依然可靠，是 L3/L4 在恶劣天气下的“底线传感器”。</p></div>
          <div class="card reveal"><h3>💰 成本极低</h3><p>一颗前向雷达成本仅数百元人民币，却提供数百米探测距离与直接测速，是性价比最高的传感器。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="4d">
        <div class="sec-head"><span class="no">03</span><h2>4D 成像雷达：补上“角度分辨率”的短板</h2></div>
        <p>传统毫米波雷达被诟病为“只能测到一团物体，分不清是车还是护栏”。新一代 4D 成像雷达通过大规模天线阵列（数十通道）合成孔径成像，在传统<b>距离 + 速度 + 方位角</b>之外新增<b>俯仰角（高度）</b>，并输出类似激光雷达的“稀疏点云”：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>对比</th><th>传统毫米波雷达</th><th>4D 成像雷达</th></tr></thead>
            <tbody>
              <tr><td>输出</td><td>几十个目标点（目标级）</td><td>数千到数万点（点云级）</td></tr>
              <tr><td>角度分辨率</td><td>粗（约 10°+）</td><td>显著提升（约 1° 级别）</td></tr>
              <tr><td>能否看高度</td><td>基本不能</td><td>能（过街天桥 vs 限高杆 vs 车辆）</td></tr>
              <tr><td>静止目标识别</td><td>弱（难分辨金属杂波）</td><td>可通过轮廓点云做简单分类</td></tr>
            </tbody>
          </table>
        </div>
        <p>4D 成像雷达让毫米波从“安全冗余件”升级为“可参与感知融合的主力件”，被称为“激光雷达的平价补充”。</p>
      </section>

      <section class="sec scroll-target" id="spec">
        <div class="sec-head"><span class="no">04</span><h2>参数怎么看</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>参数</th><th>含义</th><th>典型量级</th></tr></thead>
            <tbody>
              <tr><td><b>频段</b></td><td>24GHz（短距）与 76–81GHz（长距）</td><td>主流新车转向 77/79GHz：带宽更大、精度更高</td></tr>
              <tr><td><b>探测距离</b></td><td>对车辆可靠探测的距离</td><td>前向长距雷达可达 200–250m+</td></tr>
              <tr><td><b>距离分辨率</b></td><td>区分两个前后目标的能力</td><td>约 4–10cm（取决于带宽）</td></tr>
              <tr><td><b>速度分辨率</b></td><td>区分速度接近目标的能力</td><td>约 0.1–1 km/h 级，测速是看家本领</td></tr>
              <tr><td><b>角度分辨率</b></td><td>区分横向相邻目标的能力</td><td>传统约 10°，4D 成像雷达可到 1–3°</td></tr>
              <tr><td><b>刷新率</b></td><td>每秒输出帧数</td><td>约 15–30Hz</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec scroll-target" id="hard">
        <div class="sec-head"><span class="no">05</span><h2>局限与黑历史：“幽灵刹车”之谜</h2></div>
        <p>毫米波雷达并非万能，最著名的翻车案例是早期 ACC 的<b>“幽灵刹车”</b>——桥下静止的金属路牌、路侧护栏、井盖、隧道接缝被误判为障碍物，导致车辆莫名急刹。原因包括：</p>
        <ul>
          <li><b>多径反射</b>：电磁波在地面/护栏间多次反弹，产生“假目标”；</li>
          <li><b>金属强反射</b>：铁质物体回波特别强，静止杂波难以与真实静止障碍区分；</li>
          <li><b>角度分辨率不足</b>：分不清“车道外的护栏”与“车道内的障碍”。</li>
        </ul>
        <p>对策是<b>多传感器融合</b>：摄像头确认目标语义、激光雷达确认几何，雷达负责测速与全天候兜底。现代系统的“幽灵刹车”已大幅减少，但静止目标处理仍是毫米波雷达感知的难点。</p>
      </section>

      <section class="sec scroll-target" id="layout">
        <div class="sec-head"><span class="no">06</span><h2>车载配置与频段迁移</h2></div>
        <ul>
          <li><b>前向长距雷达</b>：装在格栅/保险杠中央，负责 ACC、AEB 与前车探测（200m+）；</li>
          <li><b>前后角雷达</b>：装在保险杠四角，负责盲区监测、变道辅助、交叉路口预警；</li>
          <li><b>后向雷达</b>：倒车横穿预警与后方碰撞预警。</li>
        </ul>
        <p>频段上，24GHz 曾是主流，但它频带窄、易与其他业务冲突，各国正推动车载雷达转向 <b>76–81GHz</b>（全球法规协调的“车载雷达黄金频段”）。高端车型开始用 4D 成像雷达替代部分传统角雷达。</p>
      </section>

      <section class="sec scroll-target" id="trend">
        <div class="sec-head"><span class="no">07</span><h2>趋势：毫米波雷达的角色升级</h2></div>
        <p>毫米波雷达正从“辅助安全件”走向“感知主力之一”：4D 成像雷达 + 摄像头做<b>前融合</b>（radar-camera fusion）成为行业热点，雷达的稀疏点云为视觉检测提供距离与速度约束，摄像头的语义为雷达点云“分类”。这一组合甚至让部分厂商讨论“去掉激光雷达的 L2+ 方案”，但对 L4 的冗余要求而言，三者并存仍是最稳妥的组合。</p>

      </section>

      <section class="sec scroll-target" id="fmcw">
        <div class="sec-head"><span class="no">08</span><h2>FMCW 信号处理：从 Chirp 到 4D 点云</h2></div>
        <p>车载毫米波雷达普遍采用调频连续波（FMCW）：一个 chirp 内的差频同时携带距离与速度信息，处理链是“距离维 FFT → 多普勒维 FFT → 角度维 FFT → CFAR 检测”。距离分辨率由带宽决定，速度分辨率由相干处理时间决定，角度分辨率由阵列孔径决定——这正是 4D 成像雷达用 MIMO 虚拟阵列扩充孔径的动机。</p>

      </section>

      <section class="sec scroll-target" id="interference">
        <div class="sec-head"><span class="no">09</span><h2>干扰与协同：雷达之间的“互相看不见”</h2></div>
        <p>当路上雷达密度上升，同频干扰成为真实问题：另一辆车的 chirp 落入本车接收机，会产生虚假目标或抬高噪底。常见对策：</p>
        <ul>
          <li><b>波形正交</b>：不同厂商 / 车辆用不同的 chirp 斜率或编码，降低相干干扰概率；</li>
          <li><b>时频资源管理</b>：类似通信的频谱协调，动态避让被占用资源；</li>
          <li><b>干扰检测与抑制</b>：检测异常能量峰值并置零、加窗或做子空间投影；</li>
          <li><b>多传感器校验</b>：把雷达目标与视觉 / 激光雷达交叉验证，剔除“幽灵目标”。</li>
        </ul>
        <p>这也是“幽灵刹车”问题的根源之一：雷达把金属护栏、井盖或干扰回波误判为前方障碍，AEB 误触发。工程上通过提高角度分辨率、多帧一致性校验与融合来降低误报。</p>
      </section>
