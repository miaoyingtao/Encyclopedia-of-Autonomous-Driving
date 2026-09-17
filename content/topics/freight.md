---
id: "pages/scenarios/freight.html"
slug: "freight"
title: "干线物流 Trucking · 驶向未来百科"
description: "自动驾驶干线物流专题：司机缺口、编队行驶、Hub-to-Hub 模式与 L3/L4 重卡落地路径。"
accent: "accent-scenarios"
nav_active: "scenarios"
hero_kicker: "落地与产业 · 专题二"
hero_h1: "干线物流：高速上的无人车队"
hero_lead: "中国物流成本占 GDP 的比重长期高于发达国家，而重卡司机“招不到、留不住、易疲劳”是行业最痛的结。高速公路的规则化路况，让干线物流成为仅次于封闭场景的自动驾驶落地“第二战场”。"
crumb: "首页|../../index.html"
crumb: "落地与产业|../../pages/scenarios.html"
crumb: "干线物流|"
---

<section class="sec scroll-target" id="pain">
        <div class="sec-head"><span class="no">01</span><h2>先说清楚行业为什么痛</h2></div>
        <div class="grid g3">
          <div class="card reveal"><h3>👷 司机缺口</h3><p>长途货运劳动强度大、与家庭聚少离多，年轻从业者持续减少，老龄化严重。“司机荒”正在成为物流运力的硬约束。</p></div>
          <div class="card reveal"><h3>😴 疲劳驾驶</h3><p>中国法规要求司机连续驾驶不超过 4 小时、必须停车休息，但现实中赶时效带来的疲劳与超时仍是事故主因。</p></div>
          <div class="card reveal"><h3>💰 成本结构</h3><p>干线运输成本中，油费/电费与人力各占相当比重；此外还有保险、维保与空驶。无人化能同时撬动“人”与“能耗”两块成本。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">02</span><h2>为什么高速公路是“次优但真实”的战场</h2></div>
        <div class="grid g2">
          <div class="card reveal"><h3>✅ 有利的一面</h3><p>① 无行人、非机动车与红绿灯，交通主体是“守规则”的机动车；② 车道线清晰、出入口规则固定；③ 路况相对可预测，ODD 容易界定。</p></div>
          <div class="card reveal"><h3>⚠️ 不利的一面</h3><p>① 车速 80–120km/h，反应距离以百米计，一个误判后果严重；② 重卡质量大、制动距离是轿车的两倍以上；③ 长下坡、横风、雨雪与隧道群构成挑战。</p></div>
        </div>
        <p>综合下来，高速干线是“结构化程度高、但安全裕量小”的场景，因此行业普遍选择<b>先“有人监督”，后“无人”</b>的渐进路径。</p>
      </section>

      <section class="sec scroll-target" id="route">
        <div class="sec-head"><span class="no">03</span><h2>三条正在并行的落地路线</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>路线</th><th>形态</th><th>商业模式</th><th>阶段</th></tr></thead>
            <tbody>
              <tr><td><b>量产辅助驾驶</b></td><td>L2/L2+ 前装到新出厂的量产重卡</td><td>按“套件”卖给物流公司/司机，缓解疲劳与油耗</td><td>已规模化销售</td></tr>
              <tr><td><b>Hub-to-Hub 有人监督</b></td><td>高速路段 L3/L4 自动驾驶，两端园区与城市道路由人工司机接驳</td><td>按里程/趟次收费，或“省一名司机”分成</td><td>商业试运营阶段</td></tr>
              <tr><td><b>全无人干线</b></td><td>从仓库到仓库全流程无人（含专用道/封闭园区衔接）</td><td>彻底去掉司机成本</td><td>试点验证，受法规严格限制</td></tr>
            </tbody>
          </table>
        </div>

      </section>

      <section class="sec scroll-target" id="platoon">
        <div class="sec-head"><span class="no">04</span><h2>编队行驶：让卡车“排排坐”省油</h2></div>
        <p>大货车紧跟前车行驶时，后车风阻可降低 10% 以上，这就是“编队（Platooning）”的诱惑。V2V 车车通信让后车能“看见”前车的意图（见 <a href="../tech/v2x.html">V2X</a>），从而安全地保持 10–20 米甚至更近的车距：</p>
        <ul>
          <li><b>头车</b>：由经验司机驾驶或自动驾驶，负责领航与复杂决策；</li>
          <li><b>跟随车</b>：自动驾驶紧密跟随，理论上可逐步实现“无人跟车”；</li>
          <li><b>收益</b>：省油省电、节省司机、降低车队整体事故率；</li>
          <li><b>难点</b>：近距跟车对制动一致性要求极高（头车急刹，后车队列不能追尾），需要车路协同与统一的控制策略支持。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="players">
        <div class="sec-head"><span class="no">05</span><h2>玩家格局：一场“三明治”式合作</h2></div>
        <div class="grid g3">
          <div class="card reveal"><h3>🧠 自动驾驶公司</h3><p>小马智行、智加科技、嬴彻科技、主线科技等提供算法与系统方案，也有的直接运营车队、掌握真实运单与数据。</p></div>
          <div class="card reveal"><h3>🚚 整车厂</h3><p>一汽解放、东风、中国重汽、福田等负责底盘与线控平台，把智驾系统“前装”进新车型，决定量产节奏与可靠性。</p></div>
          <div class="card reveal"><h3>📦 物流与货主</h3><p>顺丰、京东物流、中外运等是最终付费方。它们的诉求很简单：<b>每公里成本更低、时效更稳</b>，而不是“技术酷不酷”。</p></div>
        </div>
        <p>三方共同定义了行业的真实商业节奏：自动驾驶公司掌握技术，整车厂掌握车辆，物流公司掌握货源——任何一方的单打独斗都难以闭环。</p>
      </section>

      <section class="sec scroll-target" id="hard">
        <div class="sec-head"><span class="no">06</span><h2>真实的挑战</h2></div>
        <ul>
          <li><b>成本账</b>：一套 L4 系统的成本需对比“两名长途司机的工资”——单车成本必须降到特定门槛以下才有意义；</li>
          <li><b>法规</b>：货运车辆跨省运营，涉及多省许可；L3/L4 重卡准入与“无人驾驶下事故责任”仍在试点立法，见 <a href="../regulation.html">法规与伦理</a>；</li>
          <li><b>混行交通</b>：高速上有大量非网联的有人驾驶车辆，自动驾驶重卡必须“与不守规矩的邻车共存”；</li>
          <li><b>天气与地形</b>：冬季冰雪路面、山区长下坡是重卡安全的两大难关，ODD 需要严格限制并配备专用策略；</li>
          <li><b>保险</b>：重卡单车货值高、事故损失大，无人化后的保险定价与责任划分仍在探索。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="future">
        <div class="sec-head"><span class="no">07</span><h2>演进方向</h2></div>
        <ul>
          <li>L2+ 前装渗透率提升 → 积累真实货运数据，反哺高阶系统；</li>
          <li>重点线路“高频、固定”优先无人化：京沪、成渝等货流走廊的夜间无人驾驶最先跑通；</li>
          <li>与新能源重卡结合：换电/超充补能 + 无人驾驶，同时压降能耗与人力；</li>
          <li>政策端推动“专用货车通道 + 车路协同”试点，为高速无人化创造可控环境。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="eco">
        <div class="sec-head"><span class="no">08</span><h2>干线物流的量化账</h2></div>
        <p>干线物流的核心成本是燃油、司机与车辆折旧，自动驾驶的价值可用一个简化模型衡量：</p>
        <div class="math math-left">每公里成本 = 燃油 + 司机 + 折旧 + 保险 + 维护<br>自动驾驶收益 ≈ 省下的司机成本 + 编队节油 + 更高周转率</div>
        <p>重卡司机成本在长途干线中占比可达 20%–40%，且面临招工难；编队行驶通过减小车距降低风阻，公开研究显示可节油约 5%–10%。但传感器与冗余成本、以及仍需远程 / 安全员，会抵消部分收益——这也是行业先做“高速 + 固定线路 + 有安全员”的原因。</p>

      </section>

      <section class="related scroll-target" id="next">
        <h3>关联阅读</h3>
        <p style="margin-bottom:10px">干线物流与港口矿区同属“先落地”梯队，但高速场景对控制与法规要求更高。</p>
        <div class="rel-links">
          <a href="port-mining.html">港口与矿区（更早落地）</a>
          <a href="../tech/control.html">重卡的控制难点</a>
          <a href="../tech/v2x.html">编队与车路协同</a>
          <a href="../regulation.html">货运自动驾驶法规</a>
          <a href="../scenarios.html">返回落地与产业总览</a>
        </div>
      </section>
