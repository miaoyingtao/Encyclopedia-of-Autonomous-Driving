---
id: "pages/tech/perception/ultrasonic.html"
slug: "ultrasonic"
title: "超声波雷达 · 驶向未来百科"
description: "自动驾驶超声波雷达专题：自动泊车原理、近距离探测、APA/AVP 与探头布局。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 传感器深潜 ④ / ⑤"
hero_h1: "超声波雷达：低速泊车的“贴身侍卫”"
hero_lead: "停车入位时，那些藏在保险杠里的“小黑点”就是超声波雷达。它只负责最后几米，却让自动泊车从“科幻”变成十万元级汽车的标配功能。"
crumb: "首页|../../../index.html"
crumb: "技术|../../../pages/tech.html"
crumb: "环境感知|../../../pages/tech/perception.html"
crumb: "超声波雷达|"
---

<section class="sec scroll-target" id="principle">
        <div class="sec-head"><span class="no">01</span><h2>原理：声呐的汽车版</h2></div>
        <p>超声波雷达发射约 40–60kHz 的超声波脉冲，计算声波碰到障碍物后返回的时间，按声速（约 340m/s）换算距离：</p>
        <ul>
          <li><b>工作距离</b>：0.15–5 米（声波衰减快，探测天然是“近程”的）；</li>
          <li><b>精度</b>：厘米级，近距离非常可靠；</li>
          <li><b>成本</b>：单颗仅几十元，整车一整套也不过百元级；</li>
          <li><b>波束形状</b>：呈锥形向外扩散，能量集中在探头正前方附近。</li>
        </ul>
        <p>因为超声波传播速度远低于光/电磁波，同样的时间测量误差换算成距离误差也更小——这让它在“贴身距离”反而比毫米波雷达更精细。</p>
      </section>

      <section class="sec scroll-target" id="use">
        <div class="sec-head"><span class="no">02</span><h2>超声波雷达在做什么</h2></div>
        <div class="grid g3">
          <div class="card reveal"><h3>🅿️ 泊车辅助</h3><p>前后倒车雷达：判断与墙、车、立柱的距离，发出越来越急促的提示音，是 APA 自动泊车的基础传感器。</p></div>
          <div class="card reveal"><h3>🚪 低速防撞</h3><p>侧向探头用于防“开门杀”（检测靠近的骑行者）与窄路通行辅助，低速蠕行时提供近距离盲区保护。</p></div>
          <div class="card reveal"><h3>🏢 场端感知</h3><p>在自动代客泊车 AVP 的停车场，也可在地面/车位部署超声波与感知设备，辅助空车位检测（详见 <a href="../../scenarios/delivery-avp.html">配送与泊车场景</a>）。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="layout">
        <div class="sec-head"><span class="no">03</span><h2>探头怎么布局</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>配置</th><th>数量与位置</th><th>能力</th></tr></thead>
            <tbody>
              <tr><td>基础倒车雷达</td><td>后保 4 颗</td><td>倒车测距报警</td></tr>
              <tr><td>前后 8 颗</td><td>前 4 + 后 4</td><td>APA 自动泊车（侧方位+垂直入位）基础配置</td></tr>
              <tr><td>12–16 颗</td><td>前后 + 两侧</td><td>记忆泊车、遥控泊车，两侧覆盖更完整</td></tr>
            </tbody>
          </table>
        </div>
        <p>探头间距与安装角需要精心设计，让锥形波束互相搭接、不留探测盲区；多个探头同时工作时还要做“编码轮询”，避免你发我收的串扰。</p>
      </section>

      <section class="sec scroll-target" id="spec">
        <div class="sec-head"><span class="no">04</span><h2>关键参数</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>参数</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td><b>中心频率</b></td><td>常见 40/48/58kHz；频率越高指向性越好但衰减更快</td></tr>
              <tr><td><b>探测范围</b></td><td>典型 0.15–4.5m；近距离盲区由安装高度与波束决定</td></tr>
              <tr><td><b>盲区</b></td><td>离探头 0.15m 以内探测不到——所以还要靠影像与“最后一脚”人工确认</td></tr>
              <tr><td><b>测角能力</b></td><td>弱：只能判断“有没有 + 大概方位”，无法给出精细轮廓</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec scroll-target" id="hard">
        <div class="sec-head"><span class="no">05</span><h2>超声波雷达的局限</h2></div>
        <ul>
          <li><b>距离短</b>：只能覆盖 5 米以内，车速一快就“来不及反应”，因此只用于泊车/低速工况；</li>
          <li><b>材质敏感</b>：对软织物、草从、锥桶等吸声物体探测不稳定；对斜面可能产生“漏测”；</li>
          <li><b>环境干扰</b>：泥水覆盖探头、冰雪冻结、暴雨中的风噪都会降低灵敏度，甚至误报；</li>
          <li><b>分辨率低</b>：无法区分“墙上的凸起”和“细铁杆”，无法给车一个精确轮廓。</li>
        </ul>
        <p>因此现代泊车系统都把超声波与<b>环视鱼眼摄像头</b>结合：摄像头看车位线做“语义判断”，超声波测贴身距离做“安全底线”，两者互补。</p>
      </section>

      <section class="sec scroll-target" id="trend">
        <div class="sec-head"><span class="no">06</span><h2>智能泊车的演进路线</h2></div>
        <ol class="steps">
          <li><h3>APA 自动泊车辅助</h3><p>驾驶员在车内按住按钮，系统自动完成转向与加减速，超声波 + 环视实时闭环。</p></li>
          <li><h3>记忆泊车 / 遥控泊车</h3><p>车学会用户常去的固定车位（家、公司），沿记忆路线自动泊入；人在车外用手机遥控“最后一米”。</p></li>
          <li><h3>AVP 自动代客泊车</h3><p>驾驶员在商场门口下车，车自己开到预约车位；取车时一键召唤。依赖停车场“场端地图/设备”或纯车端方案，是 L4 级泊车场景，详见 <a href="../../scenarios/delivery-avp.html">场景专题</a>。</p></li>
        </ol>
      </section>

      <section class="sec scroll-target" id="signal">
        <div class="sec-head"><span class="no">08</span><h2>测距原理与信号处理</h2></div>
        <p>超声波雷达发射 40–58 kHz 脉冲、接收回波测距，原理同样是飞行时间。声速随温度变化（约 331.4 + 0.6·T m/s），不做温度补偿会带来约 6% 的测距误差；波束角大、存在 15–30 cm 盲区，因此只适合低速近距补盲。</p>

      </section>
