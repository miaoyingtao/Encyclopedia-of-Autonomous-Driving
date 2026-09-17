---
id: "pages/tutorial/02-perception.html"
slug: "02-perception"
title: "第 1 章 · 感知与状态估计 · 驶向未来"
description: "自动驾驶系统教程第 1 章：2D/3D 目标检测、BEV 与占用网络、多传感器融合、多目标跟踪与评价指标。"
accent: "accent-tech"
hero_kicker: "系统教程 · 第 1 章"
hero_h1: "感知：检测、融合、跟踪与占用"
hero_lead: "感知的任务是把传感器原始数据变成“结构化世界描述”：哪里有什么、以什么速度动、以及哪些空间被占用。本章覆盖 2D/3D 检测、BEV 与占用网络、传感器融合和多目标跟踪的数学模型。"
crumb: "首页|../../index.html"
crumb: "系统教程|../../pages/tutorial/index.html"
crumb: "第 1 章|"
---

<div class='panel info'><span class='pt'>配套阅读</span><p>想先建立直觉？可先看科普版 <a href='../../pages/tech/perception.html'>环境感知</a>，再回来读公式与推导。</p></div>
      <section class='sec scroll-target' id='obj'>
        <div class='sec-head'><span class='no'>1.1</span><h2>学习目标</h2></div>
        <div class='lesson-meta'><span>难度：进阶</span><span>预计：4–5 小时</span><span>前置：第 0 章</span></div>
        <p>学完本章，你应该能：① 看懂 IoU、mAP、MOTA 等指标的定义并手算小例子；② 说清 BEV 网格的坐标公式与主流“图像转 BEV”的两条路线；③ 画出多传感器融合 + 卡尔曼跟踪的数据流；④ 理解为什么占用网络比“只输出目标框”更适合安全兜底。</p>
      </section>

      <section class='sec scroll-target' id='out'>
        <div class='sec-head'><span class='no'>1.2</span><h2>感知输出：规划真正需要的“世界描述”</h2></div>
        <p>规划不关心像素，只关心语义化的空间与运动。感知的对外接口至少包含三类：</p>
        <div class='grid g3'>
          <div class='card reveal'><h3>🚗 动态目标</h3><p>每个目标：类型、3D 位置与尺寸、航向、速度、加速度、置信度、以及被连续跟踪的全局 ID。</p></div>
          <div class='card reveal'><h3>🛣️ 静态结构</h3><p>车道线、路沿、停止线、可行驶区域、红绿灯状态——决定“能往哪开、该不该停”。</p></div>
          <div class='card reveal'><h3>🧱 占用空间</h3><p>BEV 栅格或 3D 体素的“占用 + 语义”，用于兜住“没被识别成目标”的未知障碍。</p></div>
        </div>
        <div class='panel info'><span class='pt'>设计原则</span><p>检测的目标是“召回一切会撞的东西”，宁可误报让规划保守，不可漏检让规划盲目。因此感知与规划之间常有“保守性过滤”策略：无法置信的目标保留一段时间，而不是立刻删除。</p></div>
      </section>

      <section class='sec scroll-target' id='det2d'>
        <div class='sec-head'><span class='no'>1.3</span><h2>2D 目标检测：从框到语义</h2></div>
        <p>检测器输出每帧图像中目标的类别、边框与置信度。评价检测质量最核心的量是交并比：</p>
        <div class='math'>IoU(A,B) = |A ∩ B| / |A ∪ B|</div>
        <p>通常 IoU ≥ 0.5（严格任务用 0.7）且类别正确才算一个“检测对”。把检测结果按置信度排序，可画出精确率-召回率曲线，曲线下按固定召回点取平均得到 mAP，这是检测任务的标准指标。</p>
        <p>损失函数由三部分构成：</p>
        <div class='math math-left'>分类损失：L_cls = −y log p − (1−y) log(1−p)（二值交叉熵）<br>定位损失：L_box = Σ (SmoothL1(bᵢ − b̂ᵢ)) 或 1 − GIoU<br>总损失：L = λ_cls L_cls + λ_box L_box</div>
        <p>其中 SmoothL1 在误差小时用二次、大时用一次，比纯 L2 对大离群值更稳健。架构演进主线上，从 R-CNN 的两阶段（先提候选再分类），到 YOLO 的单阶段（网格直接回归），再到 DETR 把检测当成“集合预测问题”用 Transformer 直接输出框集合、去掉锚框与 NMS 后处理。</p>
        <p>单帧检测只是“快照”，误检与漏检都要靠时间维度修正——这就是 1.7 跟踪存在的理由。</p>
      </section>

      <section class='sec scroll-target' id='det3d'>
        <div class='sec-head'><span class='no'>1.4</span><h2>3D 检测：从图像/点云得到带姿态的盒子</h2></div>
        <h3>三维框的表示</h3>
        <p>3D 框通常用中心点 (cx, cy, cz)、尺寸 (w, l, h) 与绕 z 轴的航向 θ 表示（俯视下是一个旋转矩形）。给定一个点相对框中心的局部坐标 (x′, y′)，把它转回世界系的公式就是第 0 章的旋转平移：</p>
        <div class='math'>p = R_z(θ) · [x′, y′, 0]ᵀ + [cx, cy, cz]ᵀ</div>
        <h3>三种主流输入路线</h3>
        <div class='grid g3'>
          <div class='card reveal'><h3>📷 纯视觉</h3><p>成本低，但单目存在尺度-深度歧义：同一成像可以对应“近而小”与“远而大”。常用解法是融合运动信息（多帧三角化）、地面假设与深度估计网络。</p></div>
          <div class='card reveal'><h3>📡 激光点云</h3><p>直接测距，3D 框更可信。稠密点云可用体素化网络（稀疏卷积），轻量方案把点云按柱体压缩成伪图像（PointPillars 风格）再走 2D 检测结构。</p></div>
          <div class='card reveal'><h3>🔀 多模态</h3><p>相机给纹理语义、激光给几何深度，在 1.6 的“特征级融合”中取长补短，是量产高性能方案的主流。</p></div>
        </div>
        <p>3D 检测的评价在 BEV 空间计算旋转 IoU（IoU 3D 或 BEV IoU），并按距离区间（0–30 m、30–60 m、60 m+）分组报告，因为远距离性能才是真实差距所在。对速度/朝向这类连续量常用角度残差的 sin/cos 编码来避免“350° vs 10° 被当成 340° 误差”的环回问题。</p>
      </section>

      <section class='sec scroll-target' id='bev'>
        <div class='sec-head'><span class='no'>1.5</span><h2>BEV 与占用网络：站在车顶看世界</h2></div>
        <h3>BEV 栅格是规划的主坐标系</h3>
        <p>规划在“俯视”的平面坐标系里工作，因此感知最好也直接输出俯视表示。一个 BEV 栅格就是一张俯视图，参数由原点、分辨率与尺寸决定：</p>
        <div class='math'>网格(i, j) 的中心点 = (x_min + i·r + r/2, y_min + j·r + r/2)</div>
        <p>反过来说，已知一个世界点 (x, y) 找它落在哪个格子：i = floor((x − x_min) / r)。代码里所有“坐标 ↔ 栅格”互转都该收敛到这一个函数，并配套单元测试。</p>
        <h3>图像怎么变成 BEV：两条技术路线</h3>
        <div class='grid g2'>
          <div class='card reveal'><h3>🌅 Lift-Splat 思路（显式深度）</h3><p>网络先为每个像素预测一个深度分布，把图像特征“抬升”成沿射线的三维点（lift），再按外参把所有相机散射到统一 BEV 栅格里（splat）。类似“把每张图的像素铲到地面上铺平”。</p></div>
          <div class='card reveal'><h3>🎯 BEVFormer 思路（隐式 query）</h3><p>固定一组 BEV 网格查询，每个查询通过可变形注意力去各相机图像采样特征。相当于“先问每个栅格里有什么，再回图像里找证据”。Transformer 统一了时序建模，也能吸收上一帧 BEV 特征。</p></div>
        </div>
        <h3>占用网络：连“说不出名字的东西”也算进去</h3>
        <p>目标检测要求“先分类再画框”，遇到没见过的异形障碍就失效。占用网络把空间离散成体素，让网络对每个体素直接预测“是否被占用 + 语义类别”：</p>
        <div class='math'>L = Σ_voxel 交叉熵(类别) + λ_freespace 对空闲区间的监督</div>
        <div class='codeblock'>for t in 每帧：
  输入：多相机图像（+ 可选雷达点云）
  1. 生成 BEV / 3D 体素查询（分辨率 0.1–0.4 m）
  2. 跨相机采样特征并融合时序
  3. 解码每个体素：占用概率 + 语义类别（+ 速度流）
  4. 后处理：取占用概率阈值为 0.2–0.5，传给规划做碰撞检查</div>
        <p>占用网络的重要扩展是 Occupancy Flow：不只给当前占用，还给未来 1–2 秒的“占用随速度流动”的预测，可直接作为规划器的动态障碍约束。</p>
      </section>

      <section class='sec scroll-target' id='fusion'>
        <div class='sec-head'><span class='no'>1.6</span><h2>多传感器融合：在哪个层面融合？</h2></div>
        <div class='grid g3'>
          <div class='card reveal'><h3>① 数据级</h3><p>点云与图像像素级对齐后拼接，信息损失最少，但对标定与算力要求最高，量产较少单独使用。</p></div>
          <div class='card reveal'><h3>② 特征级</h3><p>各模态各自提取特征后在中间层融合（如 BEV 特征相加/注意力融合），是当前 3D 检测与占用网络的主流。</p></div>
          <div class='card reveal'><h3>③ 目标级</h3><p>各传感器独立检测，再在“目标列表”层面用 IoU 匹配合并，简单透明，但较难处理不同模态互相矛盾的情况。</p></div>
        </div>
        <p>无论哪种融合，<b>时间同步</b>都是前提。激光雷达帧、相机曝光与 IMU 采样时刻不同，常用运动补偿把各传感器数据外推到同一时刻：已知目标速度 v 与时间差 Δt，则</p>
        <div class='math'>p(t₀) ≈ p(t₁) − v · Δt（对平移），航向角同理 θ(t₀) ≈ θ(t₁) − ω·Δt</div>
        <p>空间上的“对齐”就是外参链：相机与激光雷达都外参到车体，任何两传感器之间都可通过车体互相换算（T_cam_lidar = T_cam_body · T_body_lidar）。</p>
      </section>

      <section class='sec scroll-target' id='track'>
        <div class='sec-head'><span class='no'>1.7</span><h2>多目标跟踪：让“框”变成连续的“轨迹”</h2></div>
        <p>跟踪解决三件事：同一目标跨帧怎么对上（数据关联）、目标运动状态怎么估计（滤波）、目标何时出生/消亡（生命周期）。标准流程：</p>
        <div class='codeblock'>每帧 t：
  1. 用 KF 预测每个已跟踪目标的新位置（0.4 节，常速度模型）
  2. 把预测框与新检测框按 IoU / 特征距离算匹配代价矩阵 C
  3. 用匈牙利算法求最小代价匹配，代价大于阈值的判为“新目标”或“失配”
  4. 匹配成功 → KF 更新；连续失配 N 帧 → 轨迹删除
  5. 连续匹配 M 帧 → 轨迹从 tentative 升为 confirmed 并分配全局 ID</div>
        <p>匈牙利算法解决“N 个旧目标 × M 个新检测，怎么配对使总代价最小”的指派问题，复杂度约 O(N³)，对几十个目标足够快。实践中常用“级联匹配”：先给置信度高、被遮挡久的目标更高优先级，避免 ID 频繁切换。</p>
        <p>单靠运动关联不够时，加上外观特征：为每个目标维护一个重识别特征向量，用余弦距离衡量“是不是同一个人/同一辆车”，这就是 DeepSORT 类方法的思路。遮挡时运动模型外推 + 外观记忆是保持 ID 的关键。</p>
      </section>

      <section class='sec scroll-target' id='eval'>
        <div class='sec-head'><span class='no'>1.8</span><h2>评价指标：离线准 ≠ 路上稳</h2></div>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>指标</th><th>公式/含义</th><th>关注什么</th></tr></thead>
            <tbody>
              <tr><td>mAP</td><td>各类别 AP（P-R 曲线面积）的平均</td><td>检测精度（IoU 阈值可调）</td></tr>
              <tr><td>MOTA</td><td>1 − (FN + FP + IDSW) / GT</td><td>跟踪整体质量，漏检/误检/换 ID 都扣分</td></tr>
              <tr><td>MOTP</td><td>匹配对间的平均位置误差</td><td>定位精度</td></tr>
              <tr><td>IDF1</td><td>ID 层面的 F1</td><td>ID 保持能力</td></tr>
              <tr><td>占用 IoU</td><td>预测占用与真值占用的交并比</td><td>占用网络的几何准确度</td></tr>
            </tbody>
          </table>
        </div>
        <div class='panel warn'><span class='pt'>工程提醒</span><p>离线指标高不等于路上可靠：要按场景分层看长尾（夜间、逆光、雨雾、异形车、遮挡起步），并关注“指标高但恰好漏掉罕见危险”的情况。量产团队常同时维护一套“安全关键场景回归集”，任何模型迭代必须先过它。</p></div>
      </section>

      <section class='sec scroll-target' id='adv'>
        <div class='sec-head'><span class='no'>1.9</span><h2>进阶：检测的损失函数与标签分配</h2></div>
        <p>“模型学得好不好”很大程度上由损失函数与正负样本分配决定，这是工程中最容易被忽视的部分。</p>
        <h3>① 分类 + 回归的联合损失</h3>
        <div class='math math-left'>L = λ_cls·L_cls + λ_box·L_box + λ_obj·L_obj<br>L_cls 常用交叉熵 / Focal Loss，L_box 常用 L1 + GIoU</div>
        <p>Focal Loss 通过 (1−p)^γ 降低易分样本权重，缓解正负样本极度不平衡；GIoU / DIoU 在 IoU 为零时仍提供梯度，改善小目标与远距离框的回归。</p>
        <h3>② 标签分配：谁算正样本</h3>
        <p>Anchor-based 方法用 IoU 阈值划分正负；Anchor-free 方法（FCOS）用中心度加权；DETR 用<b>匈牙利匹配</b>做一对一分配，从而避免 NMS：</p>
        <div class='math math-left'>σ̂ = argmin_σ Σ_i L_match(y_i, ŷ_{σ(i)})<br>一对一匹配保证每个真值只对应一个预测，天然去重</div>
        <h3>③ 3D 检测的特殊损失</h3>
        <p>3D 框需要回归中心、尺寸、朝向与速度。朝向 θ 存在周期性（θ 与 θ+2π 等价），直接回归会不连续，通常用 sin/cos 双通道编码，或用 bin 分类 + 残差回归。</p>
      </section>

      <section class='sec scroll-target' id='dataset'>
        <div class='sec-head'><span class='no'>1.10</span><h2>数据集与评测细节：指标到底在量什么</h2></div>
        <p>1.8 节给了指标的名字，这一节把它们落到具体数据集上。选错数据集或指标口径，是“论文指标很高、实车表现很差”的头号原因。</p>
        <h3>三大公开数据集</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>数据集</th><th>传感器</th><th>规模</th><th>标注</th><th>主要指标</th></tr></thead>
            <tbody>
              <tr><td>KITTI</td><td>双目 + 激光 + GPS/IMU</td><td>约 15k 帧</td><td>2D/3D 框、里程计、光流</td><td>3D AP（IoU 0.7）、里程计误差</td></tr>
              <tr><td>nuScenes</td><td>6 相机 + 5 雷达 + 1 激光</td><td>1000 段 × 20 s，约 40 万帧</td><td>23 类 3D 框、跟踪 ID、占用</td><td>mAP + 5 项误差 → NDS</td></tr>
              <tr><td>Waymo Open</td><td>5 相机 + 1 激光</td><td>1150 段，约 20 万帧</td><td>3D 框、跟踪、运动预测</td><td>mAP（按距离分层）、minADE/minFDE</td></tr>
            </tbody>
          </table>
        </div>
        <h3>为什么 nuScenes 用“中心距离”而不是 IoU 判定 TP</h3>
        <p>3D 框的尺寸与朝向标注本身带误差，用 IoU 判定会把“位置对、尺寸略偏”的正检错判为误检。nuScenes 改用二维中心距离阈值，并按类别给不同阈值：</p>
        <div class='math math-left'>TP 判定：‖c_pred − c_gt‖₂ ≤ d_th，d_th ∈ {0.5, 1.0, 2.0, 4.0} m（按类别）<br>mAP = 对 4 个阈值分别算 AP，再对所有类别求平均<br>NDS = (1/10)·[5·mAP + Σ(1 − min(1, mTP))]，TP ∈ {ATE, ASE, AOE, AVE, AAE}</div>
        <p>其中 ATE/ASE/AOE/AVE/AAE 分别是平移、尺度、朝向、速度、属性误差。注意 NDS 里 mAP 被放大了 5 倍权重——这意味着“检出来”比“检得准”对分数影响更大，读榜单时不要只看 NDS 排名。</p>
        <h3>跟踪指标：AMOTA 与 MOTA 的区别</h3>
        <p>MOTA 把漏检、误检与 ID 切换都算作错误，但它在召回率很低时反而可能“好看”（少检少错）。nuScenes 采用 AMOTA：对召回率从 0 到 1 逐点计算 MOTA 再平均，同时用 AMOTP 衡量定位精度。ID switch（IDSW）单独看：它直接对应“目标是否被稳定跟踪”，是规划最在意的量。</p>
        <div class='panel warn'><span class='pt'>四个评测陷阱</span><p>① 类别不均衡：卡车、拖车样本极少，总体 mAP 会被小汽车主导，必须看分类别指标；② 距离分层缺失：只看 0–50 m 全场景指标，会掩盖远距（&gt; 50 m）性能崩塌；③ 阈值偷跑：在测试集上调置信度阈值等于变相过拟合；④ 工具版本：同一模型换一版评测脚本结果可能差 1–2 个点，论文对比必须注明版本与提交哈希。</p></div>
      </section>

      <section class='sec scroll-target' id='timesync'>
        <div class='sec-head'><span class='no'>1.11</span><h2>标定与时间同步实操：融合的隐形前提</h2></div>
        <p>1.6 节说“融合前必须先对齐时空”，这一节给出工程落地做法。空间对齐靠外参链，时间对齐靠硬件触发或插值，两者任一出错，融合都会退化成“两个各自为战的传感器”。</p>
        <h3>坐标约定先统一</h3>
        <div class='math math-left'>车体系（ISO 8855 风格）：x 向前、y 向左、z 向上；原点通常取后轴中心<br>传感器外参：T_body_sensor = [R | t]，任何两传感器之间 T_A_B = T_A_body · T_body_B</div>
        <h3>时间同步的四条路线</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>方案</th><th>精度</th><th>代价</th><th>适用</th></tr></thead>
            <tbody>
              <tr><td>硬件触发 + 共同时钟（PPS/GPRMC、gPTP）</td><td>微秒级</td><td>需专用同步线与支持 PTP 的交换机</td><td>量产传感器方案</td></tr>
              <tr><td>PTP（IEEE 1588）</td><td>亚微秒–微秒</td><td>交换机与网卡需支持</td><td>以太网相机/雷达</td></tr>
              <tr><td>NTP</td><td>毫秒–数十毫秒</td><td>零成本</td><td>仅对“非实时数据”（日志、地图更新）可接受</td></tr>
              <tr><td>软件时间戳（收到时刻）</td><td>几十毫秒抖动</td><td>零成本</td><td>原型验证，不可用于运动补偿</td></tr>
            </tbody>
          </table>
        </div>
        <h3>运动补偿：把各时刻数据外推到同一时刻</h3>
        <p>即使硬件同步，点云仍是在约 100 ms 内扫完的（旋转式激光雷达），帧内每个点的时间戳不同。做法是用位姿插值把每点都变换到帧参考时刻：</p>
        <div class='math math-left'>对每个点 pᵢ（时间戳 tᵢ）：p_ref = T_ref_body(t_ref) · T_body_sensor(tᵢ) · pᵢ<br>T_body(tᵢ) ≈ 由 IMU/轮速插值（线性插值 + 四元数 slerp）得到</div>
        <div class='codeblock'># 点云去畸变（motion compensation）伪代码
poses = load_interpolated_poses(start_ts, end_ts)   # 用 IMU/轮速插值到每点时间戳
ref = poses.at(frame_ts)
for pt in cloud.points:
    T = poses.at(pt.t)                 # 该点曝光/测距时刻的车体位姿
    pt.xyz = (ref.inverse() @ T).transform(pt.xyz)

# 相机与激光对齐（不同时刻）：
# 已知目标速度 v、时间差 dt（毫秒级）时，可做一阶近似补偿
# p_cam(t0) ≈ p_cam(t1) - R * v * dt   ；航向 θ(t0) ≈ θ(t1) - ω * dt</div>
        <div class='panel tip'><span class='pt'>验收方法</span><p>① 在直线匀速行驶时，把点云投影到图像上，检查灯柱、路肩边缘是否重影（重影宽度 ≈ 速度 × 时间误差）；② 打方向盘绕圈，检查地面点云是否被“抹开”；③ 记录各传感器时间戳差的标准差，超过半个点云扫描周期就必须修同步链路。</p></div>
      </section>
      <section class='sec scroll-target' id='impl'>
        <div class='sec-head'><span class='no'>1.12</span><h2>从零实现：IoU / NMS / 匈牙利匹配 / 最小跟踪器</h2></div>
        <p>这四个小函数是感知后处理的全部家当。把它们手写一遍，比读十篇论文更能理解后处理对最终指标的影响。</p>
        <h3>① 3D 旋转框的 IoU</h3>
        <p>两个俯视旋转矩形的交并比没有像轴对齐框那样一行公式的闭式解，工程上有三种做法：多边形裁剪（Sutherland–Hodgman）算精确交面积、把旋转框离散成 BEV 栅格近似、或按“中心距 + 尺寸比”做快速近似。前两种精度足够，第三种只用于候选筛选。</p>
        <div class='codeblock'>import numpy as np

def corners_bev(cx, cy, w, l, yaw):
    """把 3D 框投影到 BEV，返回 4 个角点（逆时针）"""
    c, s = np.cos(yaw), np.sin(yaw)
    dx = np.array([ l/2, -l/2, -l/2,  l/2])
    dy = np.array([ w/2,  w/2, -w/2, -w/2])
    return np.stack([cx + c*dx - s*dy, cy + s*dx + c*dy], axis=1)

def poly_area(poly):                     # 鞋带公式
    x, y = poly[:, 0], poly[:, 1]
    return 0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))

def clip_poly(subject, clip):            # Sutherland-Hodgman
    def inside(p, a, b):
        return (b[0]-a[0])*(p[1]-a[1]) - (b[1]-a[1])*(p[0]-a[0]) >= 0
    def inter(p, q, a, b):
        t = ((a[0]-p[0])*(a[1]-b[1]) - (a[1]-p[1])*(a[0]-b[0])) / \
            ((a[0]-b[0])*(p[1]-q[1]) - (a[1]-b[1])*(p[0]-q[0]))
        return p + t * (q - p)
    out = list(subject)
    for i in range(len(clip)):
        a, b = clip[i], clip[(i+1) % len(clip)]
        inp, out = out, []
        for j in range(len(inp)):
            p, q = inp[j-1], inp[j]
            if inside(q, a, b):
                if not inside(p, a, b): out.append(inter(p, q, a, b))
                out.append(q)
            elif inside(p, a, b):
                out.append(inter(p, q, a, b))
        if not out: return np.zeros((0, 2))
    return np.array(out)

def iou_bev(box_a, box_b):
    pa = corners_bev(*box_a); pb = corners_bev(*box_b)
    inter = poly_area(clip_poly(pa, pb))
    return inter / (poly_area(pa) + poly_area(pb) - inter + 1e-9)</div>
        <h3>② NMS 与它的变体</h3>
        <div class='codeblock'>def nms(boxes, scores, iou_thr=0.4):
    order = scores.argsort()[::-1]
    keep = []
    while order.size &gt; 0:
        i = order[0]; keep.append(i)
        if order.size == 1: break
        ious = np.array([iou_bev(boxes[i], boxes[j]) for j in order[1:]])
        order = order[1:][ious &lt;= iou_thr]        # 抑制重叠框
    return keep
# 变体：类别相关阈值（行人 0.3、车辆 0.5）；soft-NMS（按 IoU 衰减分数而非直接删除）
# 注意：NMS 在拥堵场景容易把相邻两辆车压成一个，闭环评测里表现为漏检</div>
        <h3>③ 匈牙利匹配（数据关联）</h3>
        <p>跟踪的核心是“上一帧的 M 个目标与这一帧的 N 个检测怎么配对代价最小”，这是标准的指派问题，用匈牙利算法（scipy 里一行）即可：</p>
        <div class='codeblock'>from scipy.optimize import linear_sum_assignment
import numpy as np

def associate(tracks, dets, iou_thr=0.2, feat_w=0.3):
    C = np.full((len(tracks), len(dets)), 1e6)
    for i, tr in enumerate(tracks):
        for j, de in enumerate(dets):
            iou = iou_bev(tr.last_box, de.box)
            d_feat = 1.0 - np.dot(tr.feat, de.feat) / (np.linalg.norm(tr.feat)*np.linalg.norm(de.feat) + 1e-9)
            # 代价 = 位置代价 + 外观代价；类别不同直接禁止匹配
            if tr.cls != de.cls: continue
            C[i, j] = (1 - iou) + feat_w * d_feat
    rows, cols = linear_sum_assignment(C)
    matches = [(r, c) for r, c in zip(rows, cols) if C[r, c] &lt; 1e6 and
               iou_bev(tracks[r].last_box, dets[c].box) &gt; iou_thr]
    return matches</div>
        <h3>④ 最小可用跟踪器（常速度卡尔曼）</h3>
        <p>状态取 x = [px, py, vx, vy]ᵀ，观测 z = [px, py]ᵀ，系数矩阵如下。跟踪里 90% 的问题出在“新目标何时确认、丢失多久删除”这两个计数阈值上，而不是滤波公式本身。</p>
        <div class='math math-left'>F = [[1, 0, dt, 0], [0, 1, 0, dt], [0, 0, 1, 0], [0, 0, 0, 1]]，H = [[1, 0, 0, 0], [0, 1, 0, 0]]<br>Q = q·GᵀG（G 为噪声增益矩阵，q 控制“信模型”程度）<br>生命周期：连续 M 帧匹配 → 升级为 confirmed；连续 N 帧失配 → 删除（M≈3、N≈3–5 是常见起点）</div>
      </section>

      <section class='sec scroll-target' id='evo'>
        <div class='sec-head'><span class='no'>1.13</span><h2>算法演进与横向对比：三条技术主线</h2></div>
        <p>感知的论文数量极多，但工程上真正被反复使用的思路只有三条：点云的稀疏化处理、图像到 BEV 的视图变换、以及“不依赖框”的占用表征。下表按主线梳理代表工作。</p>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>阶段</th><th>代表方法</th><th>输入</th><th>关键思想</th></tr></thead>
            <tbody>
              <tr><td>点云直接处理</td><td>PointNet/PointNet++、PointRCNN、VoteNet</td><td>激光点云</td><td>点集对称函数、点级提议、霍夫投票</td></tr>
              <tr><td>体素/柱体化</td><td>VoxelNet、SECOND、PointPillars</td><td>激光点云</td><td>稀疏卷积与柱体编码，把检测变成 2D 卷积问题（实时性突破）</td></tr>
              <tr><td>中心化与无锚框</td><td>CenterPoint、SFA3D</td><td>激光点云</td><td>预测热力图中心 + 回归尺寸/朝向，省掉锚框调参</td></tr>
              <tr><td>图像转 BEV（Lift-Splat）</td><td>LSS、BEVDet、Fast-BEV</td><td>多相机</td><td>显式预测每像素深度分布，把特征“抬”到 3D 再压平</td></tr>
              <tr><td>图像转 BEV（Query）</td><td>DETR3D、PETR、BEVFormer</td><td>多相机（可加时序）</td><td>用 BEV/3D query 通过注意力反查图像特征，无需深度监督</td></tr>
              <tr><td>多模态融合</td><td>BEVFusion</td><td>相机 + 激光</td><td>统一到 BEV 特征空间做特征级融合，兼顾几何与语义</td></tr>
              <tr><td>占用预测</td><td>MonoScene、OccNet、SurroundOcc、TPVFormer</td><td>多相机（+ 激光）</td><td>直接预测体素占用与语义，覆盖“不是任何已知类别”的障碍</td></tr>
              <tr><td>稀疏与端到端</td><td>SparseDrive、UniAD、VAD</td><td>多相机（+ 激光）</td><td>稀疏 query 取代稠密 BEV，感知与规划联合优化</td></tr>
              <tr><td>世界模型与生成</td><td>OccWorld、DriveDreamer 等</td><td>多相机</td><td>预测未来占用/视频，用于规划预演与数据生成（见第 5 章）</td></tr>
            </tbody>
          </table>
        </div>
        <h3>怎么读这张表</h3>
        <div class='grid g3'>
          <div class='card reveal'><h3>📈 精度维度</h3><p>从点云直接处理 → 柱体/体素 → 中心化 → 稀疏 query，检测精度每两三年上一个台阶，但算力需求同样在涨。</p></div>
          <div class='card reveal'><h3>⚡ 实时维度</h3><p>量产真正关心在固定算力下的帧率与延迟。PointPillars、Fast-BEV、SparseDrive 这类“够准且够快”的路线往往比榜单第一名更有工程价值。</p></div>
          <div class='card reveal'><h3>🛡️ 安全维度</h3><p>从“输出框”走向“输出占用 + 不确定度”，才能覆盖异形障碍与分类失败，这也是占用网络迅速成为主流的根本原因。</p></div>
        </div>
      </section>
      <section class='sec scroll-target' id='fail'>
        <div class='sec-head'><span class='no'>1.14</span><h2>失败模式与安全兜底：感知最真实的那部分</h2></div>
        <p>感知的评测指标衡量“平均表现”，而安全取决于“最坏情况”。下表是量产中最常被记录、也最需要针对性设计的失效模式。</p>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>场景</th><th>典型失效</th><th>工程对策</th></tr></thead>
            <tbody>
              <tr><td>逆光 / 隧道出入口</td><td>相机过曝或欠曝，目标整体丢失</td><td>多曝光融合、HDR、隧道口短时降级为雷达/激光主用</td></tr>
              <tr><td>雨雪雾 / 溅水</td><td>激光点云衰减与被遮挡，雷达多径</td><td>点云质量自评估、雷达与视觉冗余、天气下的限速与 ODD 收缩</td></tr>
              <tr><td>大车遮挡（鬼探头）</td><td>被遮挡目标在出现前完全没有观测</td><td>遮蔽区域推理、减速策略、V2X 协同（见第 3 章）</td></tr>
              <tr><td>异形障碍（散落货物、施工水马）</td><td>不属于任何训练类别，检测器直接忽略</td><td>占用网络兜底 + 未知障碍的保守绕行策略</td></tr>
              <tr><td>拖车 / 挂车 / 长货</td><td>框尺寸与朝向回归失败，跟踪 ID 频繁跳变</td><td>多帧形状估计、铰接目标专用模型或规则约束</td></tr>
              <tr><td>地面反光 / 水面 / 井盖</td><td>激光产生虚假近距离点，误检为障碍</td><td>地面分割、时序一致性过滤（连续 N 帧才上报）</td></tr>
              <tr><td>夜间无路灯 + 深色行人</td><td>低对比度导致漏检</td><td>红外/热成像融合、低照度增强、夜间限速</td></tr>
            </tbody>
          </table>
        </div>
        <h3>四条通用兜底原则</h3>
        <div class='steps'>
          <ol>
            <li><h3>不确定就上报，别静默丢弃</h3><p>目标因置信度低被过滤时，应把“某处可能有东西”作为低置信度条目传给规划，让规划用保守策略处理，而不是当作没有。</p></li>
            <li><h3>时序一致性校验</h3><p>真实目标会连续出现且运动连续。只在一帧出现的检出，先不进入目标列表；连续 2–3 帧确认后再上报，可消掉大量虚警。</p></li>
            <li><h3>多传感器交叉验证</h3><p>相机检出但激光没有对应回波（或反之）时，降低置信度而不是直接采信，同时触发传感器健康度检查。</p></li>
            <li><h3>传感器健康度监控</h3><p>统计点云点数、有效回波比例、图像清晰度/曝光、时间戳抖动。任一指标越界即进入降级流程（限速、请求接管），这也是 SOTIF 要求的运行监控（见第 3 章）。</p></li>
          </ol>
        </div>
        <div class='panel info'><span class='pt'>接口设计建议</span><p>感知输出给规划的每条目标最好都带“不确定度与来源”：位置协方差、类别置信度、被遮挡比例、来自哪个传感器。规划才能据此调整安全距离，而不是把一个点估计当作确定事实。</p></div>
      </section>

      <section class='sec scroll-target' id='res'>
        <div class='sec-head'><span class='no'>1.15</span><h2>学习资源地图</h2></div>
        <div class='paper'><h4>综述（先读这三篇）</h4><p><a href='https://arxiv.org/abs/2209.05324'>BEV 感知综述（Delving into the Devils of BEV Perception）</a>：把多相机 BEV 的方法、评测与配方讲得最全；<a href='https://arxiv.org/abs/2405.02595'>基于视觉的 3D 占用预测综述</a>：占用网络的方法族与指标；<a href='https://arxiv.org/abs/1912.12033'>深度学习点云处理综述</a>：点云表征的基础脉络。</p></div>
        <div class='paper'><h4>数据集与评测</h4><p><a href='https://www.nuscenes.org/nuscenes'>nuScenes</a> 与 <a href='https://github.com/nutonomy/nuscenes-devkit'>nuscenes-devkit</a>（mAP/NDS/AMOTA 的官方实现，读代码胜过读定义）；<a href='https://waymo.com/open/'>Waymo Open Dataset</a>（大规模激光与运动预测）；<a href='http://www.cvlibs.net/datasets/kitti/'>KITTI</a>（经典基准与里程计）。</p></div>
        <div class='paper'><h4>代码与工具箱</h4><p><a href='https://github.com/open-mmlab/OpenPCDet'>OpenPCDet</a>、<a href='https://github.com/open-mmlab/mmdetection3d'>MMDetection3D</a>（3D 检测一站式复现与训练）；<a href='https://github.com/fundamentalvision/BEVFormer'>BEVFormer</a> 与 <a href='https://github.com/OpenDriveLab/Birds-eye-view-Perception'>BEV 感知 cookbook</a>；占用预测看 <a href='https://github.com/weiyithu/SurroundOcc'>SurroundOcc</a>、<a href='https://github.com/astra-vision/MonoScene'>MonoScene</a>；跟踪看 <a href='https://github.com/FoundationVision/ByteTrack'>ByteTrack</a>、<a href='https://github.com/xinshuoweng/AB3DMOT'>AB3DMOT</a>、<a href='https://github.com/mikel-brostrom/boxmot'>BoxMOT</a>。</p></div>
        <div class='paper'><h4>标定与融合</h4><p><a href='https://github.com/ankitdhall/lidar_camera_calibration'>lidar_camera_calibration</a>（目标法）、<a href='https://github.com/koide3/direct_visual_lidar_calibration'>direct_visual_lidar_calibration</a>（无目标法）、<a href='https://arxiv.org/abs/2205.13542'>BEVFusion</a>（特征级融合代表工作）。</p></div>
        <div class='panel info'><span class='pt'>延伸</span><p>完整外部资源清单见 <a href='resources.html'>教程资源库</a>；本章的占用与预测输出会在第 2 章的规划约束中使用。</p></div>
      </section>

      <section class='sec scroll-target' id='quiz'>
        <div class='sec-head'><span class='no'>1.17</span><h2>自测题</h2></div>
        <div class='faq'>
          <details><summary>Q6：nuScenes 的 NDS 里为什么把 mAP 乘 5？</summary><p>NDS 用 10 项加权平均：mAP 权重 5、其余 5 项误差（ATE/ASE/AOE/AVE/AAE）各权重 1。设计意图是强调“检出来”比“检得准”更重要，但也意味着 NDS 高不完全等于定位精度高。</p></details>
          <details><summary>Q7：同一辆车在相邻两帧被检成两个不同 ID，属于哪个指标的问题？</summary><p>ID switch（IDSW），也是 AMOTA/MOTA 的扣分项之一。它通常由数据关联失败（IoU 骤降、遮挡）或生命周期阈值不合理引起，规划层最怕这个量。</p></details>
          <details><summary>Q8：为什么“软件时间戳”不能用于运动补偿？</summary><p>软件时间戳记录的是数据到达时刻，包含驱动、传输与调度抖动（几十毫秒）。以 20 m/s 行驶时 30 ms 误差对应约 0.6 m 位移，融合会直接错位。</p></details>
          <details><summary>Q9：NMS 阈值调高会有什么副作用？</summary><p>阈值过高（过于严格）会把相邻的两个真实目标压成一个，表现为拥堵场景漏检；阈值过低则同类重叠框残留，误检增加。工程上常按类别设不同阈值并做时序确认。</p></details>
          <details><summary>Q10：为什么说占用网络比检测框更适合安全兜底？</summary><p>检测框依赖预定类别与形状假设，遇到散落货物、异形施工物会失效；占用网络直接回答“这个体素能不能走”，对未知类别同样给出几何占用，是规划碰撞检查的通用接口。</p></details>
        </div>
        <div class='faq'>
          <details><summary>Q1：BEV 分辨率 0.1 m、范围 x∈[−50, 50]，某目标中心 x=3.45，它落在哪列？</summary><p>令 x_min = −50、r = 0.1，则 i = floor((3.45+50)/0.1) = floor(534.5) = 534。</p></details>
          <details><summary>Q2：为什么单目 3D 检测普遍比激光 3D 检测难？</summary><p>单目只有二维投影，深度信息需要从几何线索与先验推断；激光直接测距，几何无歧义。</p></details>
          <details><summary>Q3：跟踪中“目标在帧间消失又出现”，如何减少 ID 切换？</summary><p>保留轨迹并预测（遮挡时用运动模型外推 + 外观特征缓存），设置合理的失配删除帧数；重新出现时优先与旧轨迹关联。</p></details>
          <details><summary>Q4：占用网络相比“目标框 + 障碍物检测”的增量价值是什么？</summary><p>它不依赖“先识别类别再画框”，能表示异形/未知障碍与不可行驶区域，天然适合作为规划的碰撞约束。</p></details>
          <details><summary>Q5：特征级融合为什么需要严格的时间同步？</summary><p>特征层面已经“分不清”哪个时刻，若两模态时刻错位，网络会把不同世界状态当成同一时刻融合，产生幻影或重影。</p></details>
        </div>
      </section>

      <nav class='chapter-nav' aria-label='讲义翻页'>
      <a class='chapter-link prev' href='01-math-sensors.html'>
        <span class='chapter-dir'>← 上一讲</span>
        <b>第 0 章 · 数学与传感器建模</b>
      </a>
      <a class='chapter-link map' href='index.html'>
        <b>课程地图</b>
      </a>
      <a class='chapter-link next' href='03-planning-control.html'>
        <span class='chapter-dir'>下一讲 →</span>
        <b>第 2 章 · 决策规划与控制</b>
      </a>
      </nav>
