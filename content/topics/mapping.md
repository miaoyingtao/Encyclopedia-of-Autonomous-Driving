---
id: "pages/tech/mapping.html"
slug: "mapping"
title: "定位与高精地图 · 驶向未来百科"
description: "自动驾驶定位与高精地图专题：GNSS/RTK、惯性导航、视觉与点云定位、车道级地图与地图鲜度更新。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 专题四"
hero_h1: "定位与高精地图"
hero_lead: "手机导航只需要知道“你在哪条路上”；自动驾驶却需要知道“你在哪个车道、离车道线几厘米”。这背后是组合定位与高精地图两套系统的精密配合。"
crumb: "首页|../../index.html"
crumb: "技术|../../pages/tech.html"
crumb: "定位与高精地图|"
---

<section class="sec scroll-target" id="why">
        <div class="sec-head"><span class="no">01</span><h2>自动驾驶为什么需要“知道自己在哪”</h2></div>
        <p>规划的轨迹、感知的目标、高精地图的车道，全部要转换到同一坐标系才能使用。如果车把自己定位偏了 30 厘米，就可能：把相邻车道的车当成自己车道的障碍、提前或压线变道、在错误的道口转弯。因此：</p>
        <div class="grid g3">
          <div class="card reveal"><h3>🚗 乘用车场景</h3><p>城区复杂高架、多岔路口需要 <b>车道级</b>判断：到底走左边两车道还是右边两车道，差一个车道就是完全不同的路线。</p></div>
          <div class="card reveal"><h3>🛣️ 高速场景</h3><p>需要知道应急车道在哪、匝道在哪、限速从哪开始变——地图的“语义”补充传感器看不远的问题。</p></div>
          <div class="card reveal"><h3>🚛 无人作业</h3><p>港口、矿区要求厘米级停靠与路径重复精度，传感器定位与地图（或虚拟磁钉）必须足够稳定。</p></div>
        </div>
      </section>

      <section class="sec scroll-target" id="hdmap">
        <div class="sec-head"><span class="no">02</span><h2>高精地图里到底有什么</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>对比</th><th>手机导航地图</th><th>高精地图 HD Map</th></tr></thead>
            <tbody>
              <tr><td>精度</td><td>米级</td><td>相对精度 10–20cm，甚至更高</td></tr>
              <tr><td>车道维度</td><td>一般只有“道路级”</td><td>车道级：每条车道的几何、宽度、连接关系、限速</td></tr>
              <tr><td>静态元素</td><td>POI、道路名称</td><td>车道线类型、停止线、路沿、护栏、交通标志的精确位置与语义</td></tr>
              <tr><td>动态元素</td><td>实时路况</td><td>施工、事故、临时管制等动态层（常由云端下发）</td></tr>
              <tr><td>主要用户</td><td>人</td><td>自动驾驶系统（机器可读）</td></tr>
            </tbody>
          </table>
        </div>
        <p>典型高精地图分四层：<b>道路几何层</b>（三维线形）、<b>车道拓扑层</b>（车道间的连接与变道关系）、<b>语义标注层</b>（标志、信号灯、停止线）、<b>动态更新层</b>（施工、事故等临时信息）。</p>
      </section>

      <section class="sec scroll-target" id="techs">
        <div class="sec-head"><span class="no">03</span><h2>定位技术全家桶：没有一种能单打独斗</h2></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>技术</th><th>原理</th><th>优势</th><th>短板</th></tr></thead>
            <tbody>
              <tr><td><b>GNSS + RTK</b></td><td>卫星定位 + 地面基准站差分修正</td><td>全球可用、绝对位置、精度可达 2–10cm（RTK）</td><td>城市峡谷、隧道、地下遮挡严重；依赖差分信号</td></tr>
              <tr><td><b>惯性导航 IMU</b></td><td>加速度计 + 陀螺仪积分推算</td><td>完全自主、高频（数百 Hz）、短时极准</td><td>长时间积分会漂移，需要定期校正</td></tr>
              <tr><td><b>轮速里程计</b></td><td>轮速传感器推算行驶距离</td><td>便宜可靠，辅助纵向推算</td><td>打滑、胎压变化会引入误差</td></tr>
              <tr><td><b>视觉定位</b></td><td>摄像头识别车道线、路牌与地标并匹配地图</td><td>不需要额外信号；语义丰富（“在第 3 车道”）</td><td>光照、雨雾影响</td></tr>
              <tr><td><b>激光点云定位</b></td><td>当前点云与高精地图点云配准</td><td>精度高、不受光照影响，适合封闭园区/港口</td><td>依赖激光雷达与高精点云地图，城市动态物体多时易受干扰</td></tr>
            </tbody>
          </table>
        </div>
        <p>此外，地下车库/隧道还会用到 UWB、蓝牙或“特征匹配”做室内定位；车路协同也可提供路侧基准（见 <a href="v2x.html">V2X</a>）。</p>
      </section>

      <section class="sec scroll-target" id="fusion">
        <div class="sec-head"><span class="no">04</span><h2>组合定位：为什么是“融合”而非“选一”</h2></div>
        <p>GNSS 长期准但短时可能跳变；IMU 短时准但长期漂移。把两者放入<b>卡尔曼滤波</b>类框架融合：IMU 以高频提供平滑位姿，GNSS/视觉/点云匹配定期“纠偏”，得到又平滑又不漂移的定位结果，这叫组合导航。</p>
        <ol class="steps">
          <li><h3>预测</h3><p>用 IMU 数据以 100–200Hz 推算“下一时刻我大概在哪”。</p></li>
          <li><h3>校正</h3><p>每当 GNSS/视觉/点云等绝对观测到来（10Hz 左右），计算残差并修正累计误差。</p></li>
          <li><h3>切换</h3><p>进入隧道 GNSS 失效时，自动切换到“IMU+轮速+视觉”模式，出隧道后再重新收敛，全程位姿不中断。</p></li>
        </ol>
        <p>评价定位系统有三个指标：<b>精度</b>（误差多大）、<b>可用性</b>（多少时间可用）、<b>完好性</b>（能否及时发现并报告自己的错误——对安全至关重要）。</p>
      </section>

      <section class="sec scroll-target" id="fresh">
        <div class="sec-head"><span class="no">05</span><h2>地图会过期：鲜度是最大工程难题</h2></div>
        <p>道路每天都在变：新修车道、改划标线、增设护栏、临时施工。地图一旦过期，自动驾驶可能“自信地开进已不存在的车道”。解决办法有三条：</p>
        <ul>
          <li><b>专业采集车</b>：定期用激光雷达+相机测绘主干道，精度高但成本高、周期长；</li>
          <li><b>众包更新</b>：从每天运营的量产车回传“车道线变化、施工围挡”等线索，系统自动比对、生成更新任务；</li>
          <li><b>动态层下发</b>：事故、封路等分钟级信息通过云端（V2N）实时推送给车辆，见 <a href="v2x.html">V2X 与车路云</a>。</li>
        </ul>
        <p>在中国，制作高精地图需要相应测绘资质并经过审图，采集的地理数据还涉及国家安全与隐私合规，详见 <a href="../challenges/cybersecurity.html">数据安全</a>。</p>
      </section>

      <section class="sec scroll-target" id="trend">
        <div class="sec-head"><span class="no">06</span><h2>“轻地图 / 无图化”之争在吵什么</h2></div>
        <p>近两年不少厂商宣传“无图智驾”，实际含义是<b>不依赖高成本、更新慢的全国高精地图</b>，改为“轻地图 + 实时感知建图”路线：</p>
        <div class="grid g2">
          <div class="card reveal"><h3>🗺️ 重地图路线</h3><p>精确但昂贵：采集、审核、更新成本高，且受测绘资质限制。适合港口、矿区、Robotaxi 固定区域等“高价值小范围”场景。</p></div>
          <div class="card reveal"><h3>🛰️ 轻地图/无图路线</h3><p>用普通导航地图 + 车端实时感知（BEV、车道线重建、占用网络）在线“现画现用”。好处是开城快、成本低；挑战是感知一旦出错就缺少地图先验兜底。</p></div>
        </div>
        <p>行业共识逐渐偏向“<b>场景决定方案</b>”：Robotaxi 与干线重卡仍重度依赖高精地图，量产乘用车则向“轻地图”演进，两者短期内不会互相取代。</p>
      </section>

      <section class="sec scroll-target" id="gnss">
        <div class="sec-head"><span class="no">07</span><h2>GNSS 与 RTK：从米级到厘米级</h2></div>
        <p>GNSS 用“信号传播时间 × 光速”算距离，但接收机测到的是含钟差、电离层 / 对流层延迟与多径的伪距，单点定位精度约 5–10 m。要上车道级，需要差分（DGNSS）、载波相位 RTK 或 PPP-RTK；城市峡谷、隧道、地下车库是天然盲区，必须与 IMU、轮速计、视觉 / 激光里程计融合。</p>

      </section>

      <section class="sec scroll-target" id="slam">
        <div class="sec-head"><span class="no">08</span><h2>点云配准与 SLAM：无 GNSS 时的定位</h2></div>
        <p>GNSS 不可用时，车辆靠“把当前观测与已有地图对齐”来定位，核心是点云配准：ICP 迭代“找最近点—求最优刚体变换”，工程上更常用收敛域更宽的 NDT；“先建图、后定位”是 L4 的常见做法，地图同时提供车道拓扑与语义。</p>

      </section>
