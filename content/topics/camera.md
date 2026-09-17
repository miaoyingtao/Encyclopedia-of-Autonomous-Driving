---
id: "pages/tech/perception/camera.html"
slug: "camera"
title: "摄像头传感器 · 驶向未来百科"
description: "自动驾驶摄像头专题：CMOS 原理、分辨率与 HDR、单目双目测距、车载布局与光照挑战。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 传感器深潜 ① / ⑤"
hero_h1: "摄像头：自动驾驶的“眼睛”"
hero_lead: "摄像头是唯一能“看懂”颜色、文字与灯光的传感器——它最像人眼，也最容易被光照欺骗。这一页讲清它的原理、参数、测距方式与挑战。"
crumb: "首页|../../../index.html"
crumb: "技术|../../../pages/tech.html"
crumb: "环境感知|../../../pages/tech/perception.html"
crumb: "摄像头|"
---

<section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">01</span><h2>为什么自动驾驶离不开摄像头</h2></div>
        <p>激光雷达能测距、毫米波雷达能测速，但它们都“认不出”世界上的语义信息。只有摄像头能告诉系统：</p>
        <ul>
          <li>红绿灯此刻是<b>红色还是绿色</b>（靠颜色）；</li>
          <li>路牌上写着“限速 40”还是“禁止左转”（靠文字识别）；</li>
          <li>车道线是白虚线还是黄实线、前方是交警在指挥还是普通行人（靠纹理与形状）；</li>
          <li>那个袋子是空的还是在飘动（靠颜色/纹理，激光雷达很难区分）。</li>
        </ul>

      </section>

      <section class="sec scroll-target" id="spec">
        <div class="sec-head"><span class="no">02</span><h2>核心参数怎么看</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>参数</th><th>含义</th><th>为什么重要</th></tr></thead>
            <tbody>
              <tr><td><b>分辨率</b></td><td>像素数量，如 2MP / 8MP</td><td>越高越能看清远方的行人、路牌小字。行业正从 2–3MP 向 8MP 升级——同一颗镜头看得更远更细。</td></tr>
              <tr><td><b>帧率 FPS</b></td><td>每秒拍摄帧数</td><td>高速行驶时帧率不足会导致目标“跳动”；量产前视通常 30fps，越高越有利（数据量也越大）。</td></tr>
              <tr><td><b>视场角 FOV</b></td><td>能看到的角度范围</td><td>广角看得宽但远物小，长焦看得远但视野窄。一台车用多颗不同视场角镜头搭配。</td></tr>
              <tr><td><b>HDR 动态范围</b></td><td>同时记录明暗细节的能力</td><td>隧道出入口、逆光场景下，普通摄像头会“一片黑/一片白”，HDR 能同时保住亮部与暗部细节。</td></tr>
              <tr><td><b>LED 抗闪烁</b></td><td>应对 LED 屏/灯频闪</td><td>LED 交通灯按高频闪烁驱动，普通快门可能拍到“灯灭”的瞬间，需要专门曝光策略（LED Flicker Mitigation）。</td></tr>
              <tr><td><b>芯片尺寸与像素</b></td><td>感光面积、像素大小</td><td>同分辨率下大像素感光更好，夜景噪点更少；大芯片还决定镜头与成本。</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec scroll-target" id="depth">
        <div class="sec-head"><span class="no">03</span><h2>摄像头怎么“测距离”</h2></div>
        <p>单张照片本身没有深度信息，工程上有三种方案“算”出距离：</p>
        <div class="grid g3">
          <div class="card reveal"><h3>📷 单目测距</h3><p>用深度学习从图像语义估算深度：结合已知物体尺寸（车宽、车牌高度）与几何约束反推距离。实现简单、成本低，但属于“估计”，误差随距离与场景变化。</p></div>
          <div class="card reveal"><h3>👀 双目测距</h3><p>用两颗间距固定的摄像头同时拍摄，通过左右图像的“视差”三角测距，与人眼原理一致。近中距精度好，但基线长度限制远距能力，标定要求高。</p></div>
          <div class="card reveal"><h3>🔦 主动光深度</h3><p>投射结构光/红外图案测深度（类似手机 Face ID）。适合近距，车内感知与舱内监控常用。</p></div>
        </div>
        <p>注意：<b>“单目测不准距离”不等于单目方案不安全</b>——纯视觉方案会用时间序列（多帧）与运动视差来约束深度，并用 BEV/占用网络表达空间，实际精度已大幅提升。代价是需要更强的算法与数据闭环。</p>
      </section>

      <section class="sec scroll-target" id="layout">
        <div class="sec-head"><span class="no">04</span><h2>一辆智能车通常装多少颗摄像头</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>位置</th><th>用途</th><th>典型规格</th></tr></thead>
            <tbody>
              <tr><td>前视主摄</td><td>主车道感知：车辆、行人、车道线、交通灯</td><td>8MP，30–120° FOV</td></tr>
              <tr><td>前视长焦</td><td>远距离识别路牌、远车（>150m）</td><td>8MP，窄视场</td></tr>
              <tr><td>周视 / 环视</td><td>车身 360° 覆盖，盲区与变道</td><td>4–6 颗广角/鱼眼</td></tr>
              <tr><td>后视</td><td>倒车、后方来车</td><td>广角</td></tr>
              <tr><td>舱内摄像头</td><td>驾驶员监控 DMS：是否分心、疲劳</td><td>红外，夜间可用</td></tr>
            </tbody>
          </table>
        </div>
        <p>主流 L2+ 车型约 8–11 颗摄像头；更高阶方案还会在车顶加装“瞭望塔式”传感器套件。多颗摄像头画面必须做<b>拼接与时间对齐</b>，才能形成完整的 360° 感知，这依赖 BEV 架构，见 <a href="../perception.html#understand">环境感知页的 BEV 小节</a>。</p>
      </section>

      <section class="sec scroll-target" id="hard">
        <div class="sec-head"><span class="no">05</span><h2>摄像头的“天敌”：光照与天气</h2></div>
        <div class="grid g2">
          <div class="card reveal"><h3>☀️ 强光与黑夜</h3><p>逆光时前方车辆只剩剪影，黑夜中行人几乎不可见。应对：HDR、大光圈、高感光 CMOS，以及红外/微光技术；但物理极限仍存在——这是纯视觉方案被质疑最多的地方。</p></div>
          <div class="card reveal"><h3>🌧️ 雨雾与脏污</h3><p>雨滴造成高光噪点，雾霾降低对比度，泥水遮挡镜头。应对：疏水涂层、雨刮、镜头加热与“脏污自检”；算法上也靠雷达/激光雷达交叉验证。</p></div>
        </div>
        <p>因此，多数 L4 方案不把摄像头作为唯一信息源，而是让它承担“语义主力”，同时用激光雷达与毫米波雷达保证“黑暗与雨雾中仍能看到”，融合策略见 <a href="fusion.html">多传感器融合</a>。</p>
      </section>

      <section class="sec scroll-target" id="trend">
        <div class="sec-head"><span class="no">06</span><h2>摄像头技术趋势</h2></div>
        <ul>
          <li><b>高分辨率普及</b>：8MP 前视成为新旗舰标配，一颗顶过去两颗，同时降低系统复杂度；</li>
          <li><b>事件相机</b>：不按帧拍照、而是记录“像素亮度变化”，纳秒级延迟、超强动态范围，适合高速与强光场景，正在走向车规；</li>
          <li><b>大模型感知</b>：Transformer/BEV 架构让多摄像头在“鸟瞰视角”联合推理，遮挡互补能力显著增强；语言与视觉融合的“大模型感知”延伸见 <a href="../../frontier.html">AI 前沿专题</a>；</li>
          <li><b>纯视觉 vs 融合</b>：特斯拉坚定纯视觉路线，国内多数厂商采用“摄像头为主 + 激光雷达增强”的冗余路线——两条路线短期并存，见 <a href="../perception.html#sensors">环境感知页</a>。</li>
        </ul>
      </section>

      <section class="sec scroll-target" id="model">
        <div class="sec-head"><span class="no">07</span><h2>成像模型与标定：像素如何对应世界</h2></div>
        <p>相机把三维世界投影到二维图像，核心是针孔模型：外参 (R, t) 把世界坐标变换到相机坐标，内参矩阵 K 再投影到像素坐标。真实镜头还要校正径向与切向畸变；工程难点是外参会随颠簸、碰撞、温度变化漂移，需要在线标定持续修正。</p>

      </section>

      <section class="sec scroll-target" id="depth-est">
        <div class="sec-head"><span class="no">08</span><h2>深度估计：单目、双目与视觉基础模型</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>方法</th><th>原理</th><th>精度与代价</th></tr></thead>
            <tbody>
              <tr><td>双目立体</td><td>用左右图像视差 d 求深度：Z = f·B / d</td><td>近距离精度高；依赖基线 B 与纹理，远距离误差迅速增大</td></tr>
              <tr><td>单目几何</td><td>用车道线宽度、车辆尺寸等先验 + 消失点</td><td>成本低；尺度不确定，远距误差大</td></tr>
              <tr><td>单目学习</td><td>用深度真值（激光雷达）监督，端到端回归深度</td><td>稠密但对域偏移敏感，绝对精度有限</td></tr>
              <tr><td>视觉 Transformer</td><td>大模型做单目深度 / 占用预测</td><td>泛化好；算力需求高</td></tr>
            </tbody>
          </table>
        </div>
        <p>关键公式 Z = f·B / d 说明：视差 d 越小，深度 Z 越大、误差也越大——所以双目在远距离并不可靠。这也是量产方案普遍用“视觉 + 雷达 / 激光雷达”互补的原因。</p>
      </section>
