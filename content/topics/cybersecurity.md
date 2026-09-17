---
id: "pages/challenges/cybersecurity.html"
slug: "cybersecurity"
title: "网络安全与数据安全 · 驶向未来百科"
description: "自动驾驶网络安全专题：攻击面、车载网络入侵、OTA 安全、ISO/SAE 21434、UN R155/R156 与数据隐私。"
accent: "accent-challenges"
nav_active: "challenges"
hero_kicker: "安全与验证 · 专题二"
hero_h1: "网络安全与数据安全"
hero_lead: "一辆 L4 自动驾驶车，本质上是一个 行驶中的数据中心 + 可控物理机器人 。它既带来便利，也把“网络攻击”的后果从丢数据升级为“操控一辆高速行驶的汽车”。安全防线因此成为自动驾驶的入场券。"
crumb: "首页|../../index.html"
crumb: "安全与验证|../../pages/challenges.html"
crumb: "网络安全与数据安全|"
---

<section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">01</span><h2>为什么智能汽车成为攻击目标</h2></div>
        <div class="grid g3">
          <div class="card reveal"><h3>💰 数据价值高</h3><p>车辆采集位置轨迹、行车影像、生物特征甚至车内对话，是“移动的隐私金矿”，可被用于跟踪、勒索或情报活动。</p></div>
          <div class="card reveal"><h3>🎛️ 可远程控制</h3><p>从解锁车门到远程启动、从 OTA 升级到云端调度，功能越“智能”，被远程操控的攻击面就越大。</p></div>
          <div class="card reveal"><h3>💥 物理后果严重</h3><p>与传统 IT 被黑“最多丢数据”不同，车被黑可能直接导致碰撞——攻击的动机与威胁等级完全不同。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="surface">
        <div class="sec-head"><span class="no">02</span><h2>攻击面：从云端到芯片</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>入口</th><th>例子</th><th>风险等级</th></tr></thead>
            <tbody>
              <tr><td>无线远程</td><td>蜂窝网络、蓝牙、Wi-Fi、NFC、V2X</td><td>高——可远距离发起</td></tr>
              <tr><td>手机 App 与云端</td><td>远程控车 App、车企云平台、第三方服务</td><td>高——供应链攻击热点</td></tr>
              <tr><td>近场物理</td><td>USB 口、OBD 诊断口、维修工具</td><td>中——需物理接触，但维修店也难防</td></tr>
              <tr><td>车内网络</td><td>CAN 总线、车载以太网、域控制器间通信</td><td>中——一旦突破一个域，横向移动风险大</td></tr>
              <tr><td>供应链</td><td>Tier1 固件、地图数据、第三方软件、OTA 包</td><td>隐蔽——最经典的“后门”路径</td></tr>
            </tbody>
          </table>
        </div>
        <p>历史上公开演示的破解案例（远程解锁、控制刹车、克隆钥匙）都在提醒行业：<b>攻击者只需要找到一个漏洞，防御者必须守住每一扇门</b>。</p>
      </section>

      <section class="sec scroll-target" id="attack">
        <div class="sec-head"><span class="no">03</span><h2>典型攻击方式一览</h2></div>
        <ul>
          <li><b>远程入侵与控车</b>：通过蜂窝/蓝牙漏洞进入车机，进一步攻破网关，向底盘发送伪造指令；</li>
          <li><b>总线注入</b>：接入 CAN 总线伪造报文（假车速、假刹车灯），干扰 ADAS 判断；</li>
          <li><b>OTA 供应链投毒</b>：攻击升级服务器或利用签名漏洞下发恶意固件；</li>
          <li><b>传感器欺骗</b>：GPS 欺骗让车辆“以为”自己在另一条路；投影/贴纸干扰摄像头识别（对抗样本）；</li>
          <li><b>V2X 消息伪造</b>：广播虚假的“前方事故/急刹”，诱导车队异常制动；</li>
          <li><b>数据勒索与泄露</b>：拖库车主的轨迹、人脸与驾驶数据。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="defense">
        <div class="sec-head"><span class="no">04</span><h2>纵深防御：一层被破，还有下一层</h2></div>
        <p>汽车安全的指导思想是“纵深防御”——不假设单点牢不可破，而是让攻破一层后难以扩大战果：</p>
        <ol class="steps">
          <li><h3>硬件信任根</h3><p>安全芯片/HSM 保存密钥，支持安全启动：从芯片固件到操作系统的每一级都验签，未授权代码无法运行。</p></li>
          <li><h3>网络隔离</h3><p>用网关把娱乐域、智驾域、底盘域隔离：即使车机被攻破，也无法直接向制动系统发指令（“域间最小权限”）。</p></li>
          <li><h3>安全通信</h3><p>车内外通信加密 + 证书认证；V2X 消息带数字签名，防止伪造广播。</p></li>
          <li><h3>入侵检测 IDS</h3><p>监控总线流量与系统行为，发现异常（陌生报文、异常登录）实时告警，类似汽车的“杀毒软件”。</p></li>
          <li><h3>安全 OTA</h3><p>固件包签名校验、断点续传、回滚机制，确保升级过程本身不被劫持。</p></li>
          <li><h3>漏洞管理</h3><p>建立安全响应团队（PSIRT）、漏洞赏金计划与供应链审计，形成持续改进闭环。</p></li>
        </ol>
      </section>

      <section class="sec scroll-target" id="law">
        <div class="sec-head"><span class="no">05</span><h2>监管与标准：安全从“自觉”变“强制”</h2></div>
        <div class="grid g2">
          <div class="card reveal"><h3>📐 ISO/SAE 21434</h3><p>《道路车辆网络安全工程》：把网络安全纳入车辆全生命周期（设计、生产、运维、退役），是目前全球通用的工程标准。</p></div>
          <div class="card reveal"><h3>🌍 UN R155 / R156</h3><p>联合国法规：R155 要求车企建立网络安全管理体系并通过车型认证；R156 管软件更新（OTA）安全。UNECE 成员国新车型已强制适用，中国等也在对标跟进。</p></div>
        </div>
        <p>此外，中国还通过《网络安全法》《数据安全法》《个人信息保护法》及汽车数据安全管理相关规定，对车外数据（人脸、车牌、道路环境）的采集、存储、出境作出限制；测绘相关的地理数据还需符合地图资质与审图要求，见 <a href="../tech/mapping.html">高精地图合规</a>。</p>
      </section>

      <section class="sec scroll-target" id="data">
        <div class="sec-head"><span class="no">06</span><h2>数据安全：自动驾驶的“石油与火药”</h2></div>
        <p>自动驾驶的发展建立在海量真实数据之上，但这些数据同时是敏感资产：</p>
        <ul>
          <li><b>车外数据</b>：道路影像、行人车牌 → 需<b>脱敏</b>（人脸/车牌模糊化）后再用于训练；</li>
          <li><b>位置轨迹</b>：精确到车道的轨迹数据 → 涉及个人行踪，敏感度极高；</li>
          <li><b>生物特征</b>：驾驶员监控（DMS）采集的面部、疲劳状态 → 属敏感个人信息，需单独同意与加密存储；</li>
          <li><b>地理测绘</b>：激光点云、道路影像可能构成测绘成果 → 采集与地图生产需资质，跨境传输受限。</li>
        </ul>
        <p>行业应对原则是“<b>数据最小化 + 车内优先 + 匿名化处理 + 分类分级</b>”：能本地处理的不上传，必须上传的先脱敏，训练数据做联邦学习或合成数据补充，从源头降低泄露风险。</p>
      </section>

      <section class="sec scroll-target" id="std">
        <div class="sec-head"><span class="no">07</span><h2>标准与合规清单</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>标准 / 法规</th><th>作用</th></tr></thead>
            <tbody>
              <tr><td>ISO/SAE 21434</td><td>汽车网络安全工程：威胁分析（TARA）、开发与运维</td></tr>
              <tr><td>UN R155 / R156</td><td>网络安全管理体系（CSMS）与软件更新管理体系（SUMS）</td></tr>
              <tr><td>ISO 24089</td><td>软件更新工程</td></tr>
              <tr><td>GB 44495 / GB 44496</td><td>中国整车信息安全与软件升级相关强制性要求</td></tr>
            </tbody>
          </table>
        </div>
        <p>合规不是一次性认证，而是贯穿设计、开发、运营与 OTA 全生命周期的持续过程，尤其强调漏洞响应与供应链安全。</p>
      </section>

      <section class="related scroll-target" id="next">
        <h3>关联阅读</h3>
        <p style="margin-bottom:10px">网络安全与功能安全共同构成“安全底线”，而测试评价负责验证整条底线。</p>
        <div class="rel-links">
          <a href="safety.html">功能安全与 SOTIF</a>
          <a href="testing.html">测试、验证与评价</a>
          <a href="../regulation.html">法规与政策</a>
          <a href="../tech/v2x.html">V2X 的安全设计</a>
          <a href="../challenges.html">返回安全与验证总览</a>
        </div>
      </section>
