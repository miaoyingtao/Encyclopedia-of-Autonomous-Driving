---
id: "pages/tech/sensors.html"
slug: "sensors"
title: "传感器横评 · 摄像头·雷达·激光雷达·超声波 · 驶向未来百科"
description: "四种车载传感器在 10 个维度上的横向对照：测什么、量程与分辨率、雨雾夜间表现、静态小物体、成本与量产成熟度、典型装配，以及每种传感器的致命短板与兜底方案。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 传感器对照"
hero_h1: "传感器横评：四种传感器，十个维度"
hero_lead: "摄像头、毫米波雷达、激光雷达、超声波雷达——它们不是'谁替代谁'的关系，而是四种不同的物理原理在互相补盲。这一页把分散在四个专题里的参数与局限收进一张表，帮你在 3 分钟内回答：'我的场景该配哪几种？'"
crumb: "首页|../../index.html"
crumb: "技术|../../pages/tech.html"
crumb: "环境感知|perception.html"
crumb: "传感器横评|"
---

<section class="sec scroll-target" id="howto">
        <div class="sec-head"><span class="no">01</span><h2>怎么选传感器</h2></div>
        <p><b>先记住结论：没有"全能传感器"，只有"互补组合"。</b>选型要同时回答三个问题 —— <b>① ODD 里有没有雨雾与夜间？② 车速多高（决定反应距离）？③ 系统失效时，车上有没有人能兜底？</b>三个答案不同，组合就不同。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>典型方案</th><th>传感器组合</th><th>为什么这样配</th></tr></thead>
            <tbody>
              <tr><td><b>量产 L2+（高速 / 城区 NOA）</b></td><td>多颗摄像头 + 1 前向毫米波 + 4 角毫米波 + 8–12 颗超声波；前向激光雷达为"安全增强件"（选装或高配）</td><td>人始终监督并兜底，因此优先"成本可控 + 语义丰富"；雷达负责全天候与测速，摄像头负责看懂世界，超声波负责贴脸距离</td></tr>
              <tr><td><b>L4 无人化（Robotaxi / 无人卡车）</b></td><td>多颗激光雷达（含长距与补盲）+ 多相机 + 4D 成像毫米波 + 超声波</td><td>没人兜底，必须"异构冗余"：任何单一路径失效后，其余传感器仍能支撑最小风险机动，且要有独立的故障检测</td></tr>
              <tr><td><b>封闭低速（港口 / 矿区 / 园区）</b></td><td>激光雷达 + 相机 + 毫米波为主，超声波按需</td><td>环境可控、路线固定、车速低，可用高精点云地图把定位与感知做得很稳；扬尘与颠簸是主要挑战</td></tr>
            </tbody>
          </table>
        </div>

      </section>

      <section class="sec scroll-target" id="compare">
        <div class="sec-head"><span class="no">02</span><h2>十个维度总对照</h2></div>
        <p class="sec-sub">下表把四个传感器专题中的"参数怎么看"与"局限"两节汇总。数字为量级参考，实际以具体型号规格书为准。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>维度</th><th>摄像头</th><th>毫米波雷达</th><th>激光雷达</th><th>超声波</th></tr></thead>
            <tbody>
              <tr><td><b>测什么</b></td><td>语义：颜色、纹理、文字、形状</td><td>距离 + <b>速度</b>（多普勒）</td><td>高精度三维几何（点云）</td><td>近距距离</td></tr>
              <tr><td><b>典型量程</b></td><td>取决镜头，远距需长焦</td><td>远（前向长距型可达百米级）</td><td>因型号差异大：半固态多为数十米，长距型可达百米级</td><td>0.15–5 m</td></tr>
              <tr><td><b>空间/角分辨率</b></td><td>高（像素级）</td><td>低（4D 成像雷达显著提升）</td><td>高</td><td>低（波束约几十度）</td></tr>
              <tr><td><b>测速能力</b></td><td>间接（需多帧估计）</td><td><b>直接且准</b></td><td>中（多帧估计，FMCW 可直接测速）</td><td>弱</td></tr>
              <tr><td><b>雨雾表现</b></td><td>差（对比度下降、镜头易脏污）</td><td><b>好</b>（波长远大于雨滴）</td><td>中（雨滴产生噪点、浓雾缩短距离）</td><td>差（衰减快）</td></tr>
              <tr><td><b>夜间 / 强光</b></td><td>差（眩光、明暗突变）</td><td>好</td><td>好（不受光照影响）</td><td>好</td></tr>
              <tr><td><b>静态小物体</b></td><td>依赖算法与训练分布</td><td><b>弱</b>（易被护栏/井盖误触发，见"幽灵刹车"）</td><td><b>强</b></td><td>强（贴脸距离）</td></tr>
              <tr><td><b>成本档位</b></td><td>低</td><td>低</td><td>中—高（国产化后快速下探）</td><td>极低</td></tr>
              <tr><td><b>量产成熟度</b></td><td>成熟</td><td>成熟</td><td>快速成熟（机械→半固态→固态）</td><td>成熟</td></tr>
              <tr><td><b>典型装配</b></td><td>环视 5–11 颗</td><td>1 前向 + 4 角（+ 短距若干）</td><td>乘用车 0–1 颗；Robotaxi 多颗</td><td>8–12 颗</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--shadow);overflow-x:auto;margin:18px 0">
        <svg viewBox="0 0 920 250" role="img" aria-label="四种传感器的强项与短板，以及它们如何形成互补与冗余" style="min-width:760px;width:100%;height:auto;font-family:inherit">
          <g text-anchor="middle">
            <rect x="20" y="26" width="190" height="84" rx="12" fill="#e0f2fe" stroke="#0ea5e9"/>
            <text x="115" y="52" font-size="14" font-weight="700" fill="#075985">摄像头</text>
            <text x="115" y="74" font-size="11.5" fill="#0c4a6e">强项：语义（颜色 / 文字）</text>
            <text x="115" y="92" font-size="11.5" fill="#b45309">短板：眩光、夜间</text>

            <rect x="250" y="26" width="190" height="84" rx="12" fill="#dcfce7" stroke="#16a34a"/>
            <text x="345" y="52" font-size="14" font-weight="700" fill="#14532d">毫米波雷达</text>
            <text x="345" y="74" font-size="11.5" fill="#166534">强项：测速、全天候</text>
            <text x="345" y="92" font-size="11.5" fill="#b45309">短板：角分辨率低</text>

            <rect x="480" y="26" width="190" height="84" rx="12" fill="#ede9fe" stroke="#7c3aed"/>
            <text x="575" y="52" font-size="14" font-weight="700" fill="#4c1d95">激光雷达</text>
            <text x="575" y="74" font-size="11.5" fill="#5b21b6">强项：高精度三维几何</text>
            <text x="575" y="92" font-size="11.5" fill="#b45309">短板：雨雾、脏污遮挡</text>

            <rect x="710" y="26" width="190" height="84" rx="12" fill="#fef3c7" stroke="#d97706"/>
            <text x="805" y="52" font-size="14" font-weight="700" fill="#78350f">超声波</text>
            <text x="805" y="74" font-size="11.5" fill="#92400e">强项：贴身的最后几米</text>
            <text x="805" y="92" font-size="11.5" fill="#b45309">短板：量程极短（0.15–5 m）</text>

            <line x1="115" y1="112" x2="350" y2="176" stroke="#94a3b8" stroke-width="1.6"/>
            <line x1="345" y1="112" x2="420" y2="176" stroke="#94a3b8" stroke-width="1.6"/>
            <line x1="575" y1="112" x2="500" y2="176" stroke="#94a3b8" stroke-width="1.6"/>
            <line x1="805" y1="112" x2="570" y2="176" stroke="#94a3b8" stroke-width="1.6"/>

            <rect x="300" y="180" width="320" height="52" rx="12" fill="#f1f5f9" stroke="#475569"/>
            <text x="460" y="202" font-size="13" font-weight="700" fill="#0f172a">融合与冗余：不是叠加，而是互相补盲</text>
            <text x="460" y="221" font-size="11.5" fill="#334155">任意单路退化时，其余通道仍能支撑降级运行</text>
          </g>
        </svg>
      </div>

      <section class="sec scroll-target" id="fatal">
        <div class="sec-head"><span class="no">03</span><h2>每种传感器的“一票否决”</h2></div>
        <p>所谓"冗余"，本质是<b>用一个传感器的长处去补另一个的致命短板</b>。所以选型时最该问的不是"它有多强"，而是"它什么时候会彻底失效，那时谁来接"。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>传感器</th><th>致命短板</th><th>典型触发场景</th><th>谁来兜底</th></tr></thead>
            <tbody>
              <tr><td><b>摄像头</b></td><td>依赖光照与对比度</td><td>夜间、逆光、隧道口明暗突变、镜头被泥水遮挡</td><td>毫米波雷达与激光雷达顶上；仍不达标则限速/降级</td></tr>
              <tr><td><b>毫米波雷达</b></td><td>角分辨率低、对静止小物体与金属反射易误判</td><td>金属护栏、井盖、桥梁接缝 → "幽灵刹车"</td><td>视觉/激光雷达交叉验证 + 多帧一致性校验</td></tr>
              <tr><td><b>激光雷达</b></td><td>雨雾衰减、易被脏污遮挡</td><td>中到大雨、浓雾、泥水飞溅到视窗</td><td>毫米波雷达兜底 + 限制 ODD + 自清洁与脏污自检</td></tr>
              <tr><td><b>超声波</b></td><td>量程极短、角分辨率低、受温度影响</td><td>车速稍高即无意义；细柱与斜面反射弱</td><td>仅用于低速近距补盲，泊车时与环视摄像头互证</td></tr>
            </tbody>
          </table>
        </div>

      </section>

      <section class="sec scroll-target" id="why-fusion">
        <div class="sec-head"><span class="no">04</span><h2>为什么必须融合</h2></div>
        <p>知道了短板，就能理解融合的真正任务不是"把图叠在一起"，而是解决三件事：</p>
        <ol class="steps">
          <li><h3>时间同步</h3><p>相机约 30 fps、激光约 10 fps、雷达约 20 fps。若对齐误差 100 ms，在 72 km/h 下就是约 <b>2 米</b> 的错位——足够让同一个目标在不同传感器里"落在两个位置"。</p></li>
          <li><h3>空间对齐</h3><p>标定每个传感器的外参，把观测投影到统一坐标系。标定一旦漂移，目标就会"错位"，导致关联失败、ID 闪烁甚至把两辆车合并成一辆。</p></li>
          <li><h3>置信度融合与降级</h3><p>多路证据互相印证并给出统一 ID；某一路退化时降低其权重，其余通道继续工作。这也是"传感器越多越安全"这句话的<b>真正前提</b>——没有这套机制，数量只会带来复杂度。</p></li>
        </ol>
        <p>融合按层级分为后融合、前融合与特征级融合，各自的取舍（可解释性 vs 精度上限）见 <a href="perception/fusion.html#levels">融合的三个层级</a>；工程实现细节见 <a href="perception/fusion.html">多传感器融合专题</a> 与 <a href="../tutorial/02-perception.html">教程第 1 章</a>。</p>
      </section>

      <section class="sec scroll-target" id="cost">
        <div class="sec-head"><span class="no">05</span><h2>成本与装配趋势</h2></div>
        <p>传感器方案最终由成本决定。近几年的三条主线：</p>
        <ul>
          <li><b>国产化与规模化</b>：激光雷达从"十几万元一颗"降到千元级区间，毫米波雷达与摄像头芯片更大规模上车——<b>同一套能力，成本每年都在变</b>。</li>
          <li><b>平台化车型</b>：面向无人的车辆可以去掉方向盘与踏板，把传感器布置重新设计（前装而非后装），摊薄单车成本。</li>
          <li><b>路线之争尚未收敛</b>：纯视觉主张"以算法与数据换成本"，多传感器主张"以异构冗余换安全下限"。判断标准不是"谁更先进"，而是在<b>各自 ODD 内的每公里安全事件率</b>，见 <a href="../challenges/testing.html#metric">安全评价指标</a>。</li>
        </ul>

      </section>
      <section class="sec scroll-target" id="params">
        <div class="sec-head"><span class="no">06</span><h2>参数术语速查</h2></div>
        <p class="sec-sub">看规格书时最容易混淆的一组词。<b>注意区分"精度"与"分辨率"</b>——前者是"错得多少"，后者是"能否分开两个目标"。</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>术语</th><th>含义</th><th>为什么重要</th></tr></thead>
            <tbody>
              <tr><td><b>视场角 FOV</b></td><td>视场覆盖的角度范围（水平/垂直）</td><td>决定盲区大小；单颗传感器无法同时兼顾"看得远"与"看得宽"</td></tr>
              <tr><td><b>角分辨率</b></td><td>能区分两个相邻方向目标的最小角度差</td><td>毫米波雷达的短板所在；4D 成像雷达用 MIMO 虚拟阵列扩充孔径来改善</td></tr>
              <tr><td><b>量程 Range</b></td><td>可探测的最远距离</td><td>与车速共同决定反应时间；重卡尤其看重</td></tr>
              <tr><td><b>距离 / 速度分辨率</b></td><td>能分开的最近两目标间距 / 最小速度差</td><td>雷达的距离分辨率由带宽决定、速度分辨率由相干处理时间决定</td></tr>
              <tr><td><b>点频 / 点云密度</b></td><td>每秒输出的点数</td><td>决定几何细节与远处目标的可见性</td></tr>
              <tr><td><b>帧率</b></td><td>每秒完成多少次完整扫描/成像</td><td>直接影响时延预算与运动估计精度</td></tr>
              <tr><td><b>多普勒效应</b></td><td>目标运动导致的频率偏移</td><td>毫米波雷达"直接测速"的物理基础</td></tr>
              <tr><td><b>线数（激光雷达）</b></td><td>垂直方向的扫描层数</td><td>与角分辨率共同决定点云"稠不稠"</td></tr>
              <tr><td><b>波长</b></td><td>激光雷达 905 nm / 1550 nm；毫米波 76–81 GHz（约 4 mm）</td><td>决定人眼安全等级上限、穿透性与成本</td></tr>
              <tr><td><b>TOPS（算力）</b></td><td>每秒万亿次运算的标称值</td><td><b>标称 ≠ 有效</b>：还要看算子支持率、内存带宽与功耗折损</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="related scroll-target" id="next">
        <h3>接下来怎么读</h3>
        <p style="margin-bottom:10px">这一页解决"怎么选"，下一步可以看"选完之后怎么用"：</p>
        <div class="rel-links">
          <a href="perception.html">环境感知总览</a>
          <a href="perception/fusion.html">多传感器融合</a>
          <a href="perception/lidar.html">激光雷达专题</a>
          <a href="perception/radar.html">毫米波雷达专题</a>
          <a href="decision.html">决策与规划</a>
          <a href="../challenges/testing.html">安全评价指标</a>
          <a href="../glossary.html">概念 · 指标 · 标准 索引</a>
          <a href="../tech.html">返回技术总览</a>
        </div>
        <nav class="chapter-nav" aria-label="页面翻页">
          <a class="chapter-link prev" href="perception.html">
            <span class="chapter-dir">← 上一篇</span>
            <b>环境感知</b>
          </a>
          <a class="chapter-link map" href="../tech.html">
            <b>技术总览</b>
          </a>
          <a class="chapter-link next" href="decision.html">
            <span class="chapter-dir">下一篇 →</span>
            <b>决策与规划</b>
          </a>
        </nav>
      </section>
