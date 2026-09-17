---
id: "pages/scenarios/delivery-avp.html"
slug: "delivery-avp"
title: "末端配送与自动泊车 · 驶向未来百科"
description: "自动驾驶末端配送车与自动代客泊车 AVP 场景专题：最后一公里配送、低速物流机器人、停车场泊车。"
accent: "accent-scenarios"
nav_active: "scenarios"
hero_kicker: "落地与产业 · 专题四"
hero_h1: "末端配送与自动泊车：身边的自动驾驶"
hero_lead: "对多数普通人而言，第一辆“自动驾驶车”可能不是出租车，而是小区门口慢悠悠的无人配送车；第一次“无人驾驶”体验也可能是商场里自己开去停车位的车。小而美的场景，正在悄悄进入日常。"
crumb: "首页|../../index.html"
crumb: "落地与产业|../../pages/scenarios.html"
crumb: "末端配送与自动泊车|"
---

<section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">01</span><h2>“最后一公里”为什么最贵</h2></div>
        <p>物流行业有个经验法则：<b>一件快递从分拨中心到用户手中的“最后一公里”，成本可占全程的三到四成</b>。原因是末端高度依赖人力——分拣、装车、爬楼、打电话，效率上不去。快递员与外卖骑手也长期面临高强度、高流动性的问题。无人化如果能替代其中一部分“跑腿”，商业价值立竿见影。</p>
        <div class="grid g3">
          <div class="card reveal"><h3>📦 快递末端</h3><p>从快递驿站/网点到小区楼栋的短驳，场景相对固定，是当前无人配送车最主流的落地形态。</p></div>
          <div class="card reveal"><h3>🥡 即时零售/外卖</h3><p>商超订单、餐饮外卖的“最后三公里”，时效要求更高，正在局部试点。</p></div>
          <div class="card reveal"><h3>🏫 园区与校园</h3><p>大学、产业园、医院内部送件送餐，边界明确、路况简单，最早跑通商业闭环。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="delivery">
        <div class="sec-head"><span class="no">02</span><h2>无人配送车长什么样、怎么运营</h2></div>
        <div class="grid g2">
          <div class="card reveal"><h3>🛺 车体形态</h3><p>通常是无驾驶舱的小型车辆：载重几十到几百公斤，时速 15–25km/h，走非机动车道与人行道；传感器以摄像头 + 激光雷达/毫米波雷达为主，成本控制在“能替代一个配送员年薪”的量级内。</p></div>
          <div class="card reveal"><h3>🎛️ 运营形态</h3><p>“快递驿站 → 小区自提柜/楼栋”或“门店 → 用户楼下”。用户收到取件码，到车旁扫码开柜取件。车由云端调度与远程监控员值守，每天按固定线路循环。</p></div>
        </div>
        <p>在国内，无人配送车需要按地方规定申请上路权限（如限定区域、限定时段、限定车道），头部企业在北京、深圳、杭州等地获得了常态化运营资质。它当前的法律身份介于“机动车”与“非机动车”之间，路权问题仍在探索，见 <a href="../regulation.html">法规与伦理</a>。</p>
      </section>

      <section class="sec scroll-target" id="tech-d">
        <div class="sec-head"><span class="no">03</span><h2>配送车的技术栈：低速却“不简单”</h2></div>
        <p>不要因为车速慢就低估配送车：它要在<b>人车混行的窄路</b>上穿行，面对的是整个自动驾驶里最难预测的群体——行人与骑行者。</p>
        <ul>
          <li><b>感知</b>：360° 多传感器融合，重点识别行人意图（突然横穿、儿童跑动）；</li>
          <li><b>地图</b>：小区与园区高精地图 + 实时避障，地图随季节与施工频繁更新；</li>
          <li><b>交互</b>：与行人“眼神交流”的替代方案——灯光、语音提示“请注意，车辆转弯”；</li>
          <li><b>取件交互</b>：货柜格口控制、二维码/取件码验证，涉及 IoT 与云端协同；</li>
          <li><b>远程介入</b>：过窄路口、被围观、设备异常时，由远程安全员接管操作。</li>
        </ul>
        <p>更完整的低速感知难点可回看 <a href="../tech/perception.html">环境感知</a> 与 <a href="../tech/perception/ultrasonic.html">超声波雷达</a>。</p>
      </section>

      <section class="sec scroll-target" id="avp">
        <div class="sec-head"><span class="no">04</span><h2>AVP：把“停车”交给车</h2></div>
        <p>AVP（Automated Valet Parking，自动代客泊车）指用户把车开到商场/机场入口后下车，车辆自己完成“找车位 → 泊入”，取车时一键召唤到出口。它被视为 L4 自动驾驶最先规模化的商用场景之一：</p>
        <ol class="steps">
          <li><h3>下车</h3><p>用户在落客区下车，用手机 App 发起“自动泊车”。</p></li>
          <li><h3>巡航</h3><p>车辆低速驶入停车场，通过传感器 + 场端设施定位，沿可用车位行驶。</p></li>
          <li><h3>泊入</h3><p>识别空车位并自动泊入，熄火上锁。</p></li>
          <li><h3>召唤</h3><p>用户返回时一键召唤，车自动开到上客区。</p></li>
        </ol>
        <p>对车主的价值是省去“找车位 + 倒车入库”的时间；对商场的价值是<b>提升车位周转率</b>——同样的面积能服务更多车辆，这正是 AVP 商业模式的支点。</p>
      </section>

      <section class="sec scroll-target" id="routes-a">
        <div class="sec-head"><span class="no">05</span><h2>AVP 的两条技术路线</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>路线</th><th>做法</th><th>优点</th><th>短板</th></tr></thead>
            <tbody>
              <tr><td><b>车端自学习（记忆泊车）</b></td><td>车辆自己学习“家/公司”固定车位的路线，之后沿记忆自动行驶泊入</td><td>不依赖停车场改造，量产车即可 OTA 获得</td><td>只认固定路线；停车场变动后会失效；跨陌生停车场不行</td></tr>
              <tr><td><b>场端改造 AVP</b></td><td>停车场部署地图、感知设备与通信，向车辆下发车位与路线</td><td>陌生停车场也能用；车端成本低；可统一调度、提升周转</td><td>依赖业主投资与运营维护；跨场普及慢</td></tr>
            </tbody>
          </table>
        </div>
        <p>主流趋势是两者结合：车端具备“无场端也能低速自主”的能力，场端信息作为增强。这与单车智能与车路协同的关系同构，见 <a href="../tech/v2x.html">V2X</a>。</p>
      </section>

      <section class="sec scroll-target" id="hard">
        <div class="sec-head"><span class="no">06</span><h2>共同的拦路虎</h2></div>
        <ul>
          <li><b>路权与身份</b>：配送车走人行道还是非机动车道？出事故算车还是算机器人？法律身份未定，扩张就受限；</li>
          <li><b>复杂人际环境</b>：老人小孩突然靠近、车辆被围观拍照、被故意挪动，都需要专门的产品设计与安全策略；</li>
          <li><b>物业协同</b>：进小区要谈门禁、进写字楼要打通电梯——“最后 100 米”其实是商务谈判问题；</li>
          <li><b>停车场适配</b>：AVP 的跨场复制需要海量停车场地图与系统对接，进度远慢于单场演示；</li>
          <li><b>经济模型</b>：配送车折旧、运维、远程值守成本 vs 替代人力的收益，在订单密度低的区域仍未打平。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="future">
        <div class="sec-head"><span class="no">07</span><h2>演进方向</h2></div>
        <ul>
          <li><b>配送车从“送快递”走向“移动服务点”</b>：无人售货、移动充电、巡检安防共用同一底盘，摊薄单车成本；</li>
          <li><b>AVP 成为 Robotaxi 的一环</b>：无人出租车的“停车/取车”天然需要 AVP 能力，两者技术同源；</li>
          <li><b>场景融合</b>：园区里配送车、接驳车、清洁车共用一张调度地图，形成“低速无人车生态”。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="eco">
        <div class="sec-head"><span class="no">08</span><h2>末端配送的单位经济</h2></div>
        <p>末端配送的成本大头是“最后一公里”的人力。无人配送车的账可以这样算：</p>
        <div class="math">单件成本 = (车辆折旧 + 电费 + 运维 + 远程支持) / 日均单量</div>
        <p>关键变量是日均单量与远程支持比。低速车单车成本低，但载货量小、需要频繁往返；若日均单量上不去，单位成本可能高于人工。这也是无人配送长期停留在“园区 / 校园试点”的原因——只有在订单密度足够高的封闭区域，模型才成立。</p>
      </section>

      <section class="related scroll-target" id="next">
        <h3>关联阅读</h3>
        <p style="margin-bottom:10px">配送与泊车是低速无人驾驶的代表，也是普通人最容易体验的入口。</p>
        <div class="rel-links">
          <a href="robotaxi.html">Robotaxi：更高速的兄弟场景</a>
          <a href="../tech/perception.html">低速场景的感知挑战</a>
          <a href="../regulation.html">配送车路权与法规</a>
          <a href="../scenarios.html">返回落地与产业总览</a>
        </div>
      </section>
