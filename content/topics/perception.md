---
id: "pages/tech/perception.html"
slug: "perception"
title: "环境感知 Perception · 驶向未来百科"
description: "自动驾驶环境感知专题：传感器方案、目标检测与跟踪、BEV 鸟瞰视角、占用网络与多传感器融合。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 专题一"
hero_h1: "环境感知 Perception"
hero_lead: "环境感知是自动驾驶的“眼睛与耳朵”：用多种传感器采集数据，用算法把数据翻译成“路上有什么、它们要去哪”。本页可从“传感器”继续下钻到四级细节页。"
crumb: "首页|../../index.html"
crumb: "技术|../../pages/tech.html"
crumb: "环境感知|"
---

<section class="sec scroll-target" id="q">
        <div class="sec-head"><span class="no">01</span><h2>感知层要回答哪些问题</h2></div>
        <p>如果把驾驶比作写作，感知就是“读题”。一台自动驾驶车每秒都要回答：</p>
        <div class="grid g3">
          <div class="card reveal"><h3>🧱 静态环境</h3><p>车道线在哪、路沿在哪、停止线与红绿灯状态、限速标志、施工区域——这是“可行驶区域”的边界。</p></div>
          <div class="card reveal"><h3>🚶 动态目标</h3><p>前方车辆、行人、骑行者、动物的<b>位置、尺寸、朝向、速度与加速度</b>，并且要逐帧跟踪，保持同一目标的 ID 不混乱。</p></div>
          <div class="card reveal"><h3>🔮 意图与预测</h3><p>那个行人是要继续走还是停下？旁车是想变道还是只是偏移？预测他们未来 1–3 秒的轨迹，是决策规划的前提。</p></div>
        </div>
        <p>感知输出的不是“一张照片”，而是结构化的“<b>交通参与者清单 + 可行驶区域 + 地图语义</b>”，直接交给下游的决策规划模块。</p>
      </section>

      <section class="sec scroll-target" id="sensors">
        <div class="sec-head"><span class="no">02</span><h2>传感器：没有一种方案是完美的</h2></div>
        <p>主流传感器有四种，它们的物理原理决定了各自的擅长与短板。L2 时代一颗摄像头也许够用；L4 时代普遍采用“互为冗余、能力互补”的多传感器组合：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>传感器</th><th>原理</th><th>擅长</th><th>短板</th><th>角色</th></tr></thead>
            <tbody>
              <tr><td><b>摄像头</b></td><td>被动接收可见光/红外</td><td>颜色、纹理、文字、交通灯、车道线，信息最丰富</td><td>光照敏感；单目测距需估算</td><td>语义之王</td></tr>
              <tr><td><b>激光雷达</b></td><td>发射激光束测反射时间</td><td>高精度 3D 点云、远距测距、不受光照影响</td><td>雨雾衰减；分辨率低于视觉；成本较高（正在快速下降）</td><td>几何之王</td></tr>
              <tr><td><b>毫米波雷达</b></td><td>发射毫米波测多普勒频移</td><td>直接测速、全天候（雨雪雾）、远距、便宜</td><td>角度分辨率低、难以分辨静止物体细节</td><td>全天候测速</td></tr>
              <tr><td><b>超声波雷达</b></td><td>发射超声波测往返时间</td><td>厘米级近距离测距、成本极低</td><td>距离短（数米）、易受脏污干扰</td><td>低速泊车守卫</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec scroll-target" id="sensor-pages">
        <div class="sec-head"><span class="no">03</span><h2>继续下钻：每种传感器一页读懂</h2></div>
        <p>以下四个四级页面深入讲解每种传感器：物理原理、参数怎么看、代表厂商与未来趋势，外加融合策略专题：</p>
        <div class="grid g3">
          <div class="card reveal"><div class="ci">📷</div><h3>摄像头</h3><p>分辨率、HDR、夜视与测距方式，为什么它是“语义之王”。</p><a class="more" href="perception/camera.html">读摄像头专题</a></div>
          <div class="card reveal"><div class="ci">🔦</div><h3>激光雷达</h3><p>TOF 与 FMCW、机械/半固态/固态路线，以及价格如何被打到千元级。</p><a class="more" href="perception/lidar.html">读激光雷达专题</a></div>
          <div class="card reveal"><div class="ci">📡</div><h3>毫米波雷达</h3><p>4D 成像雷达如何补上角度分辨率短板，恶劣天气下的主力。</p><a class="more" href="perception/radar.html">读毫米波雷达专题</a></div>
          <div class="card reveal"><div class="ci">🔊</div><h3>超声波雷达</h3><p>自动泊车与盲区守护的近距离专家，便宜但距离短。</p><a class="more" href="perception/ultrasonic.html">读超声波雷达专题</a></div>
          <div class="card reveal"><div class="ci">🧩</div><h3>多传感器融合</h3><p>时间同步、空间对齐、前/后融合，1+1 如何大于 2。</p><a class="more" href="perception/fusion.html">读融合专题</a></div>
        </div>
      </section>

      <section class="sec scroll-target" id="algo">
        <div class="sec-head"><span class="no">04</span><h2>感知算法：从像素到“理解”的流水线</h2></div>
        <ol class="steps">
          <li><h3>检测与分割</h3><p>目标检测框出“哪里有车、哪里有人”；语义分割给每个像素分类（路面/天空/车辆）；实例分割进一步区分“哪辆车是哪辆”。</p></li>
          <li><h3>多目标跟踪</h3><p>把每一帧的检测结果串成轨迹：卡尔曼滤波预测下一帧位置，再用匈牙利算法等做数据关联，给每个目标稳定 ID。</p></li>
          <li><h3>状态估计</h3><p>融合连续帧信息估算目标的速度、加速度与朝向——单帧图像无法直接得到“速度”，必须靠时间维度。</p></li>
          <li><h3>轨迹预测</h3><p>用运动学模型或神经网络预测目标未来轨迹，输出多条带概率的“候选意图”，例如“直行 80% / 右转 20%”。</p></li>
          <li><h3>建图输出</h3><p>把检测、跟踪、预测结果与车道线、红绿灯一起整理成“环境模型”，交给决策规划模块。</p></li>
        </ol>

      </section>

      <section class="sec scroll-target" id="understand">
        <div class="sec-head"><span class="no">05</span><h2>从“看见”到“理解”：BEV 与占用网络</h2></div>
{{card:bev|full}}

{{card:occupancy-network|full}}

      </section>

      <section class="sec scroll-target" id="fusion">
        <div class="sec-head"><span class="no">06</span><h2>为什么要做多传感器融合</h2></div>
        <p>融合不是“把图叠在一起”，而是解决三个工程问题：</p>
        <ul>
          <li><b>时间同步</b>：摄像头 30fps、激光雷达 10fps、雷达 20fps，必须对齐到同一时刻，否则高速行驶时 100ms 误差就是好几米。</li>
          <li><b>空间对齐</b>：标定每个传感器的外参（相对车身的位姿），把所有数据投影到统一坐标系。</li>
          <li><b>置信度融合</b>：同一目标的多条观测要互相印证、给出一致 ID 与更高置信度；某一路传感器被遮挡或脏污时，其余通道继续工作。</li>
        </ul>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>融合方式</th><th>做法</th><th>特点</th></tr></thead>
            <tbody>
              <tr><td>后融合</td><td>每种传感器先各自出检测结果，再在“目标层”合并</td><td>实现简单、可解释、便于单路升级，但信息利用率低</td></tr>
              <tr><td>前融合</td><td>先把原始点云/图像/雷达数据对齐，再统一做检测</td><td>信息保留充分、精度上限高，但对标定与算力要求高</td></tr>
              <tr><td>特征级融合</td><td>各传感器各自提取中间特征，在网络深层融合</td><td>精度与鲁棒性的折中，目前主流研究方向</td></tr>
            </tbody>
          </table>
        </div>
        <p>融合策略的完整原理与案例见 <a href="perception/fusion.html">多传感器融合专题</a>。</p>
      </section>

      <section class="sec scroll-target" id="compute">
        <div class="sec-head"><span class="no">07</span><h2>感知对算力的“胃口”有多大</h2></div>
        <p>感知是车载算力最大的消费者：多路 8MP 摄像头视频流、数十万点/秒的点云、实时运行的多个神经网络，都要求在毫秒级完成。这推动车载 AI 芯片走向“大算力 + 专用加速”：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>芯片层级</th><th>典型代表（示例）</th><th>定位</th></tr></thead>
            <tbody>
              <tr><td>大算力中央计算芯片</td><td>英伟达 Thor、地平线征程 6 等</td><td>面向 L3/L4，数百到上千 TOPS，统一承载感知与规控</td></tr>
              <tr><td>量产辅助驾驶 SoC</td><td>Mobileye EyeQ 系列、TI、高通等</td><td>面向 L2/L2+，数十到数百 TOPS，讲究性价比</td></tr>
              <tr><td>安全冗余 MCU</td><td>英飞凌 AURIX 等</td><td>不跑 AI，负责安全监控与降级控制，ASIL-D 级</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec scroll-target" id="detection">
        <div class="sec-head"><span class="no">08</span><h2>检测与跟踪：从 2D 框到 3D 轨迹</h2></div>
        <p>检测回答“这一帧有什么”，跟踪回答“它还是刚才那辆车吗”。2D 检测从 Anchor-based 演进到 Anchor-free / Query-based；3D 检测主流分体素化、柱状化与点直接处理三派；跟踪用“预测—关联—更新”给目标稳定 ID，ID 跳变是下游规划误判的重要来源。</p>

      </section>

      <section class="sec scroll-target" id="calib">
        <div class="sec-head"><span class="no">09</span><h2>标定与时间同步：感知的“隐形地基”</h2></div>
        <p>多传感器系统里，标定误差会直接变成检测误差。标定通常分三类：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>类型</th><th>标定什么</th><th>常用方法</th></tr></thead>
            <tbody>
              <tr><td>内参标定</td><td>相机焦距、主点、畸变系数</td><td>棋盘格 / 圆点靶标 + 张正友标定法</td></tr>
              <tr><td>外参标定</td><td>各传感器相对车身的位姿（旋转 + 平移）</td><td>联合标定场、手眼标定、基于特征或运动的方法</td></tr>
              <tr><td>在线标定</td><td>行驶中监测外参是否漂移（颠簸、碰撞、老化）</td><td>用车道线 / 地面点 / 里程计约束做在线优化</td></tr>
            </tbody>
          </table>
        </div>
        <p>时间同步同样关键：摄像头曝光、激光雷达扫描、雷达采样、IMU 采样必须统一到同一时间基准。工程上给每个数据包打<b>硬件时间戳</b>，用 PTP / gPTP 同步到微秒级，软件层按时间戳插值对齐。若同步误差 50 ms，72 km/h 下就是约 1 m 的空间错位。</p>

      </section>

      <section class="sec scroll-target" id="metrics">
        <div class="sec-head"><span class="no">10</span><h2>感知评价指标：离线准 ≠ 路上稳</h2></div>
        <p>不同任务用不同指标，关键是要与“行车安全”挂钩，而不是只刷数据集分数：</p>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>任务</th><th>常用指标</th><th>含义与局限</th></tr></thead>
            <tbody>
              <tr><td>2D 检测</td><td>mAP（IoU 阈值 0.5 / 0.75）</td><td>不同 IoU 阈值差异大，比较时必须固定协议</td></tr>
              <tr><td>3D 检测</td><td>NDS、mAP、ATE</td><td>NDS 综合 mAP 与属性误差；ATE 反映中心点定位精度</td></tr>
              <tr><td>跟踪</td><td>MOTA、IDF1、ID Switch</td><td>MOTA 常被漏检主导，需结合 IDF1 看 ID 稳定性</td></tr>
              <tr><td>预测</td><td>minADE / minFDE、Miss Rate</td><td>只看“最优候选”会掩盖多模态覆盖不足</td></tr>
              <tr><td>端到端</td><td>推理延迟、帧率、内存占用</td><td>车端硬约束，必须与精度一起报告</td></tr>
            </tbody>
          </table>
        </div>
        <p>更重要的是<b>分层评测</b>：公开数据集看通用能力，自建 ODD 场景库看“关键场景召回”，实车影子模式看“与人类驾驶的一致性”。离线指标高但长尾漏检，是量产中真实存在的陷阱，详见 <a href="../challenges/testing.html">测试与评价</a>。</p>
      </section>
