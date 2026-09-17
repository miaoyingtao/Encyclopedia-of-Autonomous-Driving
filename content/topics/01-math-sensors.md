---
id: "pages/tutorial/01-math-sensors.html"
slug: "01-math-sensors"
title: "第 0 章 · 数学与传感器建模 · 驶向未来"
description: "自动驾驶系统教程第 0 章：线性代数与刚体变换、贝叶斯与卡尔曼滤波、相机与激光雷达几何模型、最小二乘优化。"
accent: "accent-tech"
hero_kicker: "系统教程 · 第 0 章"
hero_h1: "数学基础与传感器建模"
hero_lead: "自动驾驶算法的“母语”是线性代数、概率与优化。这一章用最小必要篇幅把后续章节要用的工具一次补齐，并给相机、激光雷达建立可计算的几何模型。"
crumb: "首页|../../index.html"
crumb: "系统教程|../../pages/tutorial/index.html"
crumb: "第 0 章|"
---

<div class='panel info'><span class='pt'>配套阅读</span><p>想先建立直觉？可先看科普版 <a href='../../pages/tech/perception/camera.html'>摄像头传感器</a>，再回来读公式与推导。</p></div>
      <section class='sec scroll-target' id='obj'>
        <div class='sec-head'><span class='no'>0.1</span><h2>学习目标</h2></div>
        <div class='lesson-meta'><span>难度：基础</span><span>预计：3–4 小时</span><span>前置：大学一年级数学</span></div>
        <p>学完本章，你应该能独立完成：① 写出旋转矩阵与齐次变换，并做坐标系串联；② 写出卡尔曼滤波预测与更新公式并解释每个矩阵；③ 用针孔模型把世界点投影到像素、把激光点云投影到图像；④ 说明最小二乘为什么贯穿标定与定位。</p>
      </section>

      <section class='sec scroll-target' id='linalg'>
        <div class='sec-head'><span class='no'>0.2</span><h2>线性代数与刚体变换</h2></div>
        <p>自动驾驶里到处是“换坐标系”：激光雷达测得一个点，要换到车体、再换到世界、再投影到图像。所有变换都建立在下面三个工具上。</p>
        <h3>内积：向量的“相似度”与投影</h3>
        <div class='math'>a · b = |a| |b| cosθ = Σᵢ aᵢ bᵢ</div>
        <p>归一化内积就是余弦相似度，深度学习里向量检索、跟踪里的“特征相似度”都基于它。向量 a 在单位向量 e 上的投影长度是 a·e，这是后续把误差“投影到某方向”时的直觉来源。</p>
        <h3>旋转矩阵与正交性</h3>
        <div class='math'>二维绕原点逆时针旋转：R(θ) = [[cosθ, −sinθ], [sinθ, cosθ]]</div>
        <p>旋转矩阵的两个性质必须记住：<b>正交性</b> RᵀR = I，因此 <b>R⁻¹ = Rᵀ</b>（求逆＝转置，数值上又稳又快）；<b>行列式为 1</b>，不引入缩放。三维基本旋转是对某一轴的推广，例如绕 z 轴旋转与上式同形，绕 x、y 轴则把 sinθ 项移到对应行列。</p>
        <h3>齐次变换：把“旋转 + 平移”写成一个矩阵</h3>
        <div class='math'>T = [[R, t], [0, 1]]，点 p 的变换写作 p′ = R p + t</div>
        <p>把三维点补成四维齐次坐标 [p; 1] 后，连续两次变换可以直接“矩阵相乘”串联：</p>
        <div class='math'>p_c = T_cb · T_ba · p_a</div>
        <p>其中 T_ba 表示“从 a 系到 b 系”。坐标系串联是感知、定位、规划里最常写的代码，务必亲手推一遍。逆变换也有闭式解，避免对 4×4 矩阵数值求逆：</p>
        <div class='math'>T⁻¹ = [[Rᵀ, −Rᵀt], [0, 1]]</div>
        <div class='panel tip'><span class='pt'>一次练习</span><p>设车体系到世界系的外参 T_wb（先平移 (1,2,0)，再绕 z 轴转 90°），手工把车体系点 (0,1,0) 变换到世界系，再用 T⁻¹ 验算回来。坐标系直觉就建立起来了。</p></div>
      </section>

      <section class='sec scroll-target' id='prob'>
        <div class='sec-head'><span class='no'>0.3</span><h2>概率、高斯分布与贝叶斯公式</h2></div>
        <p>传感器有噪声、估计有不确定性。自动驾驶的状态估计把“世界是什么样”写成概率分布，其中最常用的是高斯分布。</p>
        <h3>贝叶斯公式：新证据如何修正旧信念</h3>
        <div class='math'>P(x | z) = P(z | x) · P(x) / P(z)</div>
        <p>读作“看到观测 z 之后对状态 x 的信念（后验）＝ 观测似然 × 先验信念 ÷ 归一化常数”。卡尔曼滤波、SLAM 后端、贝叶斯滤波都是它的特例。</p>
        <h3>高斯分布：两个参数就够了</h3>
        <div class='math'>p(x) = 1 / √(2π|Σ|) · exp(−½ (x−μ)ᵀ Σ⁻¹ (x−μ))</div>
        <p>μ 是均值（最可能的位置），Σ 是协方差矩阵（不确定度的方向与大小）。二维高斯画成椭圆时，椭圆轴方向由 Σ 的特征向量给出，轴长正比于特征值的平方根。看协方差椭圆是理解“哪条不确定度大”最快的方法。</p>
        <p>高斯分布有个“闭环”性质：线性变换仍高斯、两个高斯相乘（归一化后）仍高斯。这意味着只要系统是线性的、噪声是高斯的，我们就能用有限参数做精确推理——这正是卡尔曼滤波的前提。</p>
      </section>

      <section class='sec scroll-target' id='kf'>
        <div class='sec-head'><span class='no'>0.4</span><h2>卡尔曼滤波：递归地融合预测与观测</h2></div>
        <p>想象你要估计前车位置。你有一个“运动模型”预测它会在哪，也有激光雷达观测告诉你它实际在哪。卡尔曼滤波的智慧是：<b>按各自不确定度加权平均，且只保留上一个时刻的估计</b>（马尔可夫假设），因此每步计算量恒定，适合车载实时运行。</p>
        <h3>系统模型</h3>
        <div class='math math-left'>x_k = F x_(k−1) + B u_k + w_k，w_k ~ N(0, Q)<br>z_k = H x_k + v_k，v_k ~ N(0, R)</div>
        <p>含义：F 是状态转移矩阵（上一时刻状态怎么变到这一时刻）；B 把控制输入 u（油门、转向）变成状态增量；H 把状态映射成观测；Q、R 分别刻画运动模型误差和传感器噪声。</p>
        <h3>两步五式</h3>
        <div class='math math-left'>预测：x̂⁻ = F x̂_(k−1) + B u_k<br>预测：P⁻ = F P_(k−1) Fᵀ + Q<br>更新：K = P⁻ Hᵀ (H P⁻ Hᵀ + R)⁻¹<br>更新：x̂ = x̂⁻ + K (z − H x̂⁻)<br>更新：P = (I − K H) P⁻</div>
        <p>直觉解读：K 是 0 到 1 之间的“信任分配”。P⁻ 小（预测准）或 R 大（观测噪声大）时 K→0，更信预测；反之 K→1，更信观测。括号里的 (z − H x̂⁻) 叫“新息/残差”，就是“观测告诉我、而模型没想到”的部分。</p>
        <div class='paper'><h4>匀速模型实例</h4><p>状态 x = [px, py, vx, vy]ᵀ（位置与速度），采样间隔 Δt，则 F = [[1,0,Δt,0],[0,1,0,Δt],[0,0,1,0],[0,0,0,1]]；只观测位置时 H = [[1,0,0,0],[0,1,0,0]]；若认为加速度随机，把加速度方差放到 Q 的对应位置。这套代码跑起来就是你自己的第一个“目标跟踪器”。</p></div>
        <h3>扩展到非线性：EKF</h3>
        <p>真实运动与观测往往非线性（如转角模型、距离方位观测）。扩展卡尔曼滤波的做法是：运动/观测函数保持不变，只用其一阶泰勒展开（雅可比矩阵）代替 F 与 H：</p>
        <div class='math'>F ≈ ∂f/∂x |ₓ̂ ，H ≈ ∂h/∂x |ₓ̂</div>
        <p>代价是强非线性时一阶近似可能发散。工程上因此还有无迹卡尔曼（UKF，用确定性采样近似传播分布）与粒子滤波（对非高斯分布直接采样），理解主线仍是“预测 + 按不确定度加权更新”。</p>
      </section>

      <section class='sec scroll-target' id='sensor'>
        <div class='sec-head'><span class='no'>0.5</span><h2>传感器几何建模</h2></div>
        <h3>相机：针孔模型与内参</h3>
        <p>相机把三维世界投影成二维像素。针孔模型假设光线过光心，世界点 P 到像素 u 的映射为：</p>
        <div class='math'>z_c · [u, v, 1]ᵀ = K · [R | t] · [X, Y, Z, 1]ᵀ</div>
        <p>其中 [R|t] 是相机外参（把世界系换到相机系），z_c 是点在相机系下的深度，内参矩阵 K 把相机系坐标变成像素：</p>
        <div class='math'>K = [[fx, 0, cx], [0, fy, cy], [0, 0, 1]]</div>
        <p>fx、fy 是焦距的像素度量（fx = f / dx，dx 为像元宽度）；cx、cy 是光心在图像上的像素位置。外参决定“相机装在车的哪里、朝哪看”，内参决定“同样距离的物体在图像上有多大”。</p>
        <p>真实镜头还有畸变：径向畸变让直线变弯（桶形/枕形），切向畸变来自镜头与传感器不完全平行。常用 Brown 模型近似：</p>
        <div class='math math-left'>r² = x² + y²（归一化坐标）<br>x_dist = x(1 + k₁r² + k₂r⁴ + k₃r⁶) + 2p₁xy + p₂(r² + 2x²)<br>y_dist = y(1 + k₁r² + k₂r⁴ + k₃r⁶) + p₁(r² + 2y²) + 2p₂xy</div>
        <p>标定的本质就是：拍棋盘格等已知几何的靶标，优化内外参与畸变系数，使“重投影误差”最小。OpenCV 的 calibrateCamera 和棋盘格标定板是最常见实现。</p>
        <h3>激光雷达：从球坐标到点云</h3>
        <p>机械式激光雷达每个光束有固定的仰角 φ，通过旋转获得水平角 θ，再测量飞行时间得到距离 r。一帧里每个点由 (r, θ, φ) 唯一确定，转成三维坐标：</p>
        <div class='math'>x = r cosφ sinθ，y = r cosφ cosθ，z = r sinφ</div>
        <p>不同雷达的 θ、φ 定义略有差异（谁绕谁转、角零位在哪），读驱动文档时务必核对，这是点云“看起来歪了 90°”的经典来源。固态/半固态雷达用微镜或转镜扫描，帧率与视场角不同，但“按角度+距离建点”的数学一致。</p>
        <h3>把激光点投到图像：外参标定的应用</h3>
        <div class='math'>u = K · (R_ci · P_l + t_ci) / z_c</div>
        <p>R_ci、t_ci 是“激光雷达到相机”的外参。手动观察“投影点是否压在图像中对应物体上”是最直观的外参校验手段；自动标定则把它建成一个多传感器联合优化问题（见 0.6 最小二乘）。</p>
        <div class='panel warn'><span class='pt'>重要提醒</span><p>时间同步与空间标定同样关键：车在动、激光雷达在转、相机在曝光，若时间戳对不齐，哪怕外参精确，投影也会错位。工程上先做时钟同步与运动补偿，再谈空间标定。</p></div>
      </section>

      <section class='sec scroll-target' id='opt'>
        <div class='sec-head'><span class='no'>0.6</span><h2>最小二乘与数值优化</h2></div>
        <p>标定、配准、SLAM 后端、甚至神经网络的训练，底层都是同一个问题：找一组参数，让所有“残差”的平方和最小。</p>
        <div class='math'>min_x Σᵢ ||rᵢ(x)||²</div>
        <p>残差 rᵢ(x) 的典型形式是“预测 − 观测”，例如重投影误差 = 投影像素 − 标注像素。若 r 对 x 线性，可解正规方程 x = (AᵀA)⁻¹Aᵀb；若非线性，用高斯牛顿迭代：每步把 r 在当前 x 处线性化，解线性子问题：</p>
        <div class='math'>δ = −(JᵀJ)⁻¹ Jᵀ r，然后 x ← x + δ</div>
        <p>J 是残差对参数的雅可比矩阵。实际工程常用莱文伯格-马夸特（LM）给 JᵀJ 加阻尼 λ，在“梯度下降的稳健”与“高斯牛顿的快收敛”之间切换，这就是 SLAM 里 ceres/g2o 的核心。深度学习训练本质相同，只是把 Jᵀ 换成随机采样的小批量梯度。</p>
      </section>

      <section class='sec scroll-target' id='eng'>
        <div class='sec-head'><span class='no'>0.7</span><h2>工程要点：新手最容易翻车的五个地方</h2></div>
        <div class='grid g2'>
          <div class='card reveal'><h3>🧭 坐标系约定</h3><p>同项目内必须统一“前/左/上”“北东地/东北天”。建议在代码里把坐标系写成类型或显式命名，杜绝裸数组。</p></div>
          <div class='card reveal'><h3>⏱ 时间戳与延迟</h3><p>图像曝光时刻、点云扫完时刻、IMU 采样时刻各不相同；做融合前先对齐，并记录每个算法阶段的固定延迟。</p></div>
          <div class='card reveal'><h3>🔢 矩阵求逆</h3><p>能用转置或解析解就不数值求逆；数值上优先用 Cholesky/QR 解线性方程，而非直接算逆矩阵。</p></div>
          <div class='card reveal'><h3>📐 单位与量纲</h3><p>角度弧度制、位置米制、速度 m/s；混用 km/h 与 m/s 是最常见的低级 Bug。</p></div>
          <div class='card reveal'><h3>🧪 先单元验证</h3><p>任何坐标变换先喂一个已知点，输出对上了再接入真实数据；这条规则能帮你省下几周调参时间。</p></div>
          <div class='card reveal'><h3>🎲 噪声建模</h3><p>Q、R 别拍脑袋：用一段静止/匀速数据估计观测噪声方差，再用残差检验模型是否匹配。</p></div>
        </div>
      </section>

      <section class='sec scroll-target' id='adv'>
        <div class='sec-head'><span class='no'>0.8</span><h2>进阶：卡尔曼滤波的推导要点</h2></div>
        <p>教材常直接给出卡尔曼公式，这里补上关键推导，帮助理解“为什么是这几个矩阵相乘”。</p>
        <h3>① 高斯乘积：融合两个独立观测</h3>
        <p>若先验 x ~ N(μ₁, σ₁²)，观测 z = x + v，v ~ N(0, σ₂²)，则后验仍为高斯，均值与方差为：</p>
        <div class='math math-left'>μ = (σ₂²·μ₁ + σ₁²·z) / (σ₁² + σ₂²)<br>1/σ² = 1/σ₁² + 1/σ₂²</div>
        <p>这就是“<b>信息相加</b>”：方差倒数（信息量）直接相加。卡尔曼滤波可看作把这一结论推广到多维、带状态转移的情形。</p>
        <h3>② 从贝叶斯递推到 KF</h3>
        <p>预测步把上一时刻后验通过状态转移 F 传播（均值乘 F、协方差被 F 拉伸并叠加过程噪声 Q）；更新步是上面高斯乘积的多维版本，增益 K 就是“先验不确定度”与“观测不确定度”的加权比例。</p>
        <h3>③ 为什么 K 会随 R 变化</h3>
        <p>当观测噪声 R → 0（传感器很准）时 K → H⁻¹，状态几乎完全采纳观测；当 R → ∞ 时 K → 0，状态只信预测。工程上调 Q/R 的比值，等价于调“信模型还是信传感器”。</p>
      </section>

      <section class='sec scroll-target' id='lie'>
        <div class='sec-head'><span class='no'>0.9</span><h2>旋转的进阶表示：四元数、旋转向量与李群</h2></div>
        <p>0.2 节把旋转写成 3×3 矩阵，够用但不适合优化：9 个参数只有 3 个自由度，还带 6 个正交约束，一旦在优化中直接加减就会破坏 RᵀR = I。工程实现里真正被传递、插值、求导的其实是另外几种表示。</p>
        <h3>旋转向量（轴角）与 Rodrigues 公式</h3>
        <p>任何旋转都等价于“绕某个单位轴 n 转 θ 角”，把两者合并成向量 φ = θ·n（大小是角度、方向是转轴）。由 φ 还原旋转矩阵用 Rodrigues 公式：</p>
        <div class='math'>R = I + (sinθ/θ)·[φ]× + ((1 − cosθ)/θ²)·[φ]×²</div>
        <p>其中 [φ]× 是反对称矩阵（叉乘矩阵），[φ]×·v 等于 φ × v。这个公式就是 so(3) 到 SO(3) 的指数映射 exp([φ]×)，θ → 0 时退化为 R ≈ I + [φ]×；反过来用 log(R) 得到旋转向量，可用于求两个旋转之间的“最短旋转量”。</p>
        <h3>四元数：4 个参数、无奇异性</h3>
        <p>单位四元数 q = [w, x, y, z] = [cos(θ/2), n·sin(θ/2)] 用 4 个参数表示旋转，比矩阵省内存、无万向节死锁，是 IMU 姿态、滤波器状态与消息传输的标准格式。两个要点必须记住：</p>
        <div class='math math-left'>单位约束：‖q‖ = 1（数值积分后必须重新归一化）<br>双覆盖：q 与 −q 表示同一个旋转（比较姿态用 |q₁·q₂|，而不是逐元素差）</div>
        <p>与旋转矩阵的互转只涉及乘加（如 R 第一行 = [1−2(y²+z²), 2(xy−wz), 2(xz+wy)]），数值上比“对矩阵做正交化”便宜得多。姿态插值用 slerp（球面线性插值）沿最短弧过渡，优于先转成欧拉角再插值。</p>
        <h3>李群与李代数：为什么优化里要“右乘扰动”</h3>
        <p>SO(3)/SE(3) 是李群：既能相乘，又是可微流形。对旋转求导不能直接写 ∂R/∂R，标准做法是在当前估计处右乘一个小扰动再做一阶近似：</p>
        <div class='math math-left'>R ← R · exp([δθ]×)，δθ ∈ R³ 是 3 维小量<br>∂(R·p)/∂δθ = −R·[p]×（右扰动雅可比）</div>
        <p>于是姿态优化的变量始终是 3 维小量 δθ，更新后再“注入”回旋转矩阵或四元数并归一化。这套机制（配合 SE(3) 上的 exp/log 与伴随矩阵）是 VINS、LIO-SAM、GTSAM 等系统稳定收敛的基础。记不住推导时，先记住三条实用结论：姿态用 4 维存、用 3 维优化、比较用测地距离。</p>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>表示</th><th>参数</th><th>奇异性</th><th>适合做什么</th><th>不适合做什么</th></tr></thead>
            <tbody>
              <tr><td>欧拉角</td><td>3</td><td>有（万向节死锁）</td><td>人机交互、可读的俯仰/横滚/航向</td><td>连续插值、迭代优化</td></tr>
              <tr><td>旋转矩阵</td><td>9（6 个约束）</td><td>无</td><td>坐标变换、复合、投影</td><td>存状态、逐元素插值</td></tr>
              <tr><td>旋转向量</td><td>3</td><td>θ = π 附近弱奇异</td><td>误差量、log 域优化、标定</td><td>长时间直接积分</td></tr>
              <tr><td>四元数</td><td>4（1 个约束）</td><td>无</td><td>姿态积分、滤波状态、通信传输</td><td>未归一化时直接线性插值</td></tr>
            </tbody>
          </table>
        </div>
        <div class='codeblock'>import numpy as np

def hat(v):                      # 反对称矩阵 [v]x
    return np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])

def exp_so3(phi):                # 旋转向量 -> 旋转矩阵（Rodrigues）
    th = np.linalg.norm(phi)
    if th &lt; 1e-8:
        return np.eye(3) + hat(phi)
    k = phi / th
    return np.eye(3) + np.sin(th) * hat(k) + (1 - np.cos(th)) * hat(k) @ hat(k)

def quat_to_R(q):                # 单位四元数 -> 旋转矩阵
    w, x, y, z = q / np.linalg.norm(q)
    return np.array([
        [1-2*(y*y+z*z), 2*(x*y-w*z),   2*(x*z+w*y)],
        [2*(x*y+w*z),   1-2*(x*x+z*z), 2*(y*z-w*x)],
        [2*(x*z-w*y),   2*(y*z+w*x),   1-2*(x*x+y*y)]])</div>
        <div class='panel warn'><span class='pt'>三个高频翻车点</span><p>① 四元数积分后忘记归一化，几十毫秒后旋转矩阵就带上了缩放；② 不同库的欧拉角顺序不同（yaw-pitch-roll 与 RPY 不是一回事），跨库传数据前先对齐定义；③ 对多个四元数直接线性平均会得到非单位四元数，应当用 Markley 方法，或先转成旋转向量再平均。</p></div>
      </section>

      <section class='sec scroll-target' id='filters'>
        <div class='sec-head'><span class='no'>0.10</span><h2>滤波家族：从 KF 到 EKF / UKF / ESKF</h2></div>
        <p>0.4 节的卡尔曼滤波假设“状态转移与观测都是线性函数”。真实系统里两者几乎都是非线性的，于是有了下面这条演进路线。理解它们的差别与失败条件，比背推导更重要。</p>
        <h3>EKF：在当前估计处做一阶线性化</h3>
        <div class='math math-left'>预测：x̂⁻ = f(x̂, u)，P⁻ = F P Fᵀ + Q，其中 F = ∂f/∂x<br>更新：K = P⁻ Hᵀ (H P⁻ Hᵀ + R)⁻¹，H = ∂h/∂x<br>　　　x̂ = x̂⁻ + K (z − h(x̂⁻))，P = (I − K H) P⁻</div>
        <p>做法是把非线性函数在当前估计点做一阶泰勒展开，把雅可比 F、H 当作“局部线性模型”代进 KF 公式。近似误差与“状态不确定度 × 函数曲率”成正比：状态越不确定、函数越弯，EKF 越容易过度自信（协方差偏小）甚至发散，所以工程上必须配一致性检查。</p>
        <h3>UKF：用一组确定性采样点传播分布</h3>
        <p>无迹卡尔曼滤波不再线性化函数，而是取 2n+1 个 sigma 点（n 为状态维数），让它们穿过真正的非线性函数后重建均值与协方差：</p>
        <div class='math math-left'>λ = α²(n + κ) − n，W₀⁽ᵐ⁾ = λ/(n+λ)，W₀⁽ᶜ⁾ = λ/(n+λ) + (1 − α² + β)<br>Wᵢ⁽ᵐ⁾ = Wᵢ⁽ᶜ⁾ = 1 / (2(n+λ))，i = 1…2n</div>
        <p>它对非线性函数具备二阶以上精度，不需要雅可比（对“不可导的黑箱模型”友好），代价是每步要做 2n+1 次函数求值——状态维数到 15–30 维（组合导航量级）时就不便宜了。</p>
        <h3>ESKF：误差状态才是本体</h3>
        <p>组合导航的状态含四元数，直接滤波会遇到“4 参数 3 自由度”的约束问题。误差状态卡尔曼滤波把状态拆成名义状态（大信号，用 IMU 积分传播）与误差状态（小信号，被滤波器估计）：</p>
        <div class='codeblock'>每步执行：
  1) 名义传播：x_nom ← f(x_nom, u)          （四元数积分后归一化）
  2) 误差传播：δx ← F·δx + w，δx = [δp, δv, δθ, δb_a, δb_g]
  3) 观测更新：δx̂ = K·(z − h(x_nom))        （GNSS 位置/速度、轮速、车道匹配）
  4) 注入并重置：x_nom ← x_nom ⊕ δx̂；δx ← 0
  5) 协方差：P ← (I − K H) P (I − K H)ᵀ + K R Kᵀ   （Joseph 形式，保对称正定）</div>
        <p>好处很实在：误差量始终是小量，雅可比稳定且可长期复用同一套解析式；姿态约束自动满足（误差用 3 维旋转向量表示）。这是第 3 章组合导航实现的主线。</p>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>方法</th><th>核心假设</th><th>单步代价</th><th>车载典型用途</th></tr></thead>
            <tbody>
              <tr><td>KF</td><td>线性高斯</td><td>极低</td><td>目标跟踪（常速度模型）、轮速处理</td></tr>
              <tr><td>EKF</td><td>弱非线性 + 小不确定度</td><td>低（需雅可比）</td><td>目标跟踪、GNSS 紧组合、SLAM 后端</td></tr>
              <tr><td>UKF</td><td>中等非线性、函数难求导</td><td>中（2n+1 次求值）</td><td>姿态估计、雷达/视觉的非线性观测</td></tr>
              <tr><td>ESKF</td><td>高维组合导航、流形状态</td><td>中，数值稳定</td><td>GNSS/IMU/轮速组合定位</td></tr>
              <tr><td>粒子滤波</td><td>任意分布、多峰</td><td>高（随维数爆炸）</td><td>全局定位初始化、多假设跟踪</td></tr>
            </tbody>
          </table>
        </div>
        <h3>工程细节：滤波器能不能上车的分水岭</h3>
        <div class='steps'>
          <ol>
            <li><h3>野值门限（gating）</h3><p>更新前先算马氏距离 d² = νᵀ (H P⁻ Hᵀ + R)⁻¹ ν（ν = z − h(x̂⁻) 是新息）。三维观测下 d² &gt; χ²₃,₀.₉₉ ≈ 11.34 就判为野值，直接丢弃而不是硬更新——这是抵抗 GPS 跳点、误匹配的第一道闸。</p></li>
            <li><h3>协方差对称正定</h3><p>每步结束做 P ← (P + Pᵀ)/2 并使用 Joseph 形式更新。长时间运行后出现负特征值，多半是这一步偷懒了。</p></li>
            <li><h3>时间同步与延迟</h3><p>观测与预测必须落在同一时间戳上。GNSS 有几十毫秒延迟、相机有曝光时刻，常用“缓冲 + 回插值”把观测对齐到状态时刻，或在滤波器中显式建模延迟。</p></li>
            <li><h3>可观测性</h3><p>静止时 GNSS 能约束位置，但航向未必可观测（除非有双天线）。先做可观测性分析再决定状态向量里放什么，能省掉大量“滤波器不收敛”的排查时间。</p></li>
          </ol>
        </div>
        <div class='panel info'><span class='pt'>怎么选</span><p>一句话版：能用线性 KF 就用 KF；非线性但维数低、要实时，用 EKF；函数难求导或非线性强，用 UKF；组合导航这类“高维 + 流形 + 长时运行”，用 ESKF；多峰、要全局搜索，才轮到粒子滤波。</p></div>
      </section>
      <section class='sec scroll-target' id='calib'>
        <div class='sec-head'><span class='no'>0.11</span><h2>实操：相机标定（张正友平面标定法）</h2></div>
        <p>0.5 节的针孔模型里有一组内参 fx、fy、cx、cy 与畸变系数，它们不是查手册得到的常数，而是用标定板一张张算出来的。张正友 2000 年的平面标定法之所以成为工业标准，是因为它只需要一块印刷的棋盘格、无需精密三维靶标。</p>
        <h3>模型与待估参数</h3>
        <div class='math math-left'>像素投影：u = fx·X/Z + cx，v = fy·Y/Z + cy<br>径向畸变：x_d = x(1 + k₁r² + k₂r⁴ + k₃r⁶)，r² = x² + y²<br>切向畸变：x_d = x + [2p₁xy + p₂(r² + 2x²)]（y 方向对称）</div>
        <p>内参矩阵 K 有 4 个自由度，畸变常见取 k₁、k₂、p₁、p₂（广角鱼眼再加 k₃ 或用鱼眼模型）。标定板平面上的点满足单应关系，这给了张正友法两条约束：</p>
        <div class='math math-left'>H = K [r₁ r₂ t]（把标定板坐标映到像素）<br>正交约束：r₁ᵀr₂ = 0 且 |r₁| = |r₂|（旋转列向量正交且等长）</div>
        <h3>五个步骤</h3>
        <div class='steps'>
          <ol>
            <li><h3>打印并固定标定板</h3><p>用高精度打印（或专业陶瓷板），贴在硬质平板上。板面不平整是重投影误差偏大的头号原因，玻璃板反光次之。</p></li>
            <li><h3>多姿态采集 15–25 张</h3><p>让板子覆盖画面四角与中心，倾斜 20°–45°、距离远近各有若干张。全部图片都居中、都正对镜头，会让畸变与焦距强相关，标定结果不可信。</p></li>
            <li><h3>角点检测</h3><p>亚像素角点（findChessboardCorners + cornerSubPix）精度决定上限；先转灰度、做自适应直方图均衡，检测更稳。</p></li>
            <li><h3>线性初值 + 非线性精修</h3><p>先用正交约束线性解出 K 的初值与每张图的外参，再用 Levenberg–Marquardt 最小化重投影误差，把畸变一起优化。</p></li>
            <li><h3>验收与固化</h3><p>看整体重投影 RMSE 与误差在图像上的分布（越靠边缘误差越大属正常）。验收后把 K、畸变、图像分辨率、标定日期、标定板类型一起写入标定文件（YAML/JSON），并纳入版本管理。</p></li>
          </ol>
        </div>
        <div class='codeblock'>import cv2, numpy as np, glob

PATTERN = (9, 6)          # 内角点数
SQUARE  = 0.025           # 格子边长（米）
crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1e-3)

objp = np.zeros((PATTERN[0]*PATTERN[1], 3), np.float32)
objp[:, :2] = np.mgrid[0:PATTERN[0], 0:PATTERN[1]].T.reshape(-1, 2) * SQUARE

objpoints, imgpoints, size = [], [], None
for f in sorted(glob.glob('images/*.jpg')):
    img = cv2.imread(f); gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    size = gray.shape[::-1]
    ok, corners = cv2.findChessboardCorners(gray, PATTERN, None)
    if not ok:
        print('skip', f); continue
    corners = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), crit)
    objpoints.append(objp); imgpoints.append(corners)

# 标定：同时估计内参与畸变
rms, K, dist, rvecs, tvecs = cv2.calibrateCamera(objpoints, imgpoints, size, None, None)
print('reprojection RMSE = %.3f px' % rms)
print('K =', K, 'dist =', dist.ravel())

# 保留全部像素（alpha=0）或裁掉黑边（alpha=1）
newK, roi = cv2.getOptimalNewCameraMatrix(K, dist, size, alpha=0)</div>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>验收指标</th><th>合格线</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>整体重投影 RMSE</td><td>&lt; 0.3–0.5 px</td><td>超过 1 px 说明板不平、模糊或角点检测有问题</td></tr>
              <tr><td>单张最大误差</td><td>&lt; 1 px</td><td>个别图特别差直接剔除重标</td></tr>
              <tr><td>角点覆盖</td><td>覆盖四角与中心</td><td>只在中心标定会让畸变参数严重欠约束</td></tr>
              <tr><td>姿态多样性</td><td>倾斜 20°–45° 各若干张</td><td>全正对会放大焦距与深度的相关性</td></tr>
              <tr><td>等效焦距对称性</td><td>|fx − fy| / fx &lt; 1%</td><td>差异过大常是像素非方形或图像被拉伸</td></tr>
            </tbody>
          </table>
        </div>
        <div class='panel warn'><span class='pt'>常见坑</span><p>① 用自动对焦镜头标定后又在行车中改变对焦，等效焦距直接漂移——量产方案要么锁焦、要么做在线自标定；② 卷帘快门在运动中会产生几何畸变，静态标定结果无法覆盖；③ 标定板打印后贴在软纸上会翘曲，几毫米的形变会被吸收进畸变系数里；④ 立体相机要额外做 stereoCalibrate 得到 R、T 并做极线校正（rectify），验收看极线对齐误差而不是单目 RMSE。</p></div>
      </section>

      <section class='sec scroll-target' id='icp'>
        <div class='sec-head'><span class='no'>0.12</span><h2>实操：点云配准与激光-相机外参</h2></div>
        <p>配准（registration）回答的是“两片点云之间的刚体变换是多少”。它是外参标定、点云地图拼接、激光里程计的共同内核。</p>
        <h3>ICP：最小化点对距离</h3>
        <div class='math math-left'>目标：min_{R,t} Σ_i ‖ R·p_i + t − q_i ‖²　（q_i 是 p_i 的最近邻）<br>迭代：① 关联最近邻 → ② 闭式求 R,t → ③ 更新点云 → 回到 ①</div>
        <p>第二步有闭式解（Umeyama/SVD 方法）：先把两组点各自去质心得到 p̃、q̃，构造 H = Σ p̃ᵢ q̃ᵢᵀ，做 SVD 得 H = UΣVᵀ，则 R = V·diag(1, 1, det(VUᵀ))·Uᵀ，t = q̄ − R·p̄。最后那个 diag 项用来防止 det(R) = −1 的镜像解。</p>
        <h3>变体：为什么量产更爱用 NDT 与 GICP</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>方法</th><th>误差度量</th><th>初值要求</th><th>特点</th></tr></thead>
            <tbody>
              <tr><td>Point-to-Point ICP</td><td>点对距离</td><td>高（&lt; 半个体素）</td><td>最简单、收敛慢、对采样密度敏感</td></tr>
              <tr><td>Point-to-Plane</td><td>点到切平面距离</td><td>较高</td><td>结构化表面收敛快数倍，需要法向</td></tr>
              <tr><td>GICP</td><td>概率（协方差加权）</td><td>中</td><td>把局部平面性编码进协方差，兼顾点对与面到面</td></tr>
              <tr><td>NDT</td><td>体素高斯得分场</td><td>中低</td><td>不需要最近邻搜索，对大场景与初值偏移更宽容</td></tr>
              <tr><td>FPFH + RANSAC</td><td>特征描述子匹配</td><td>低（可做全局）</td><td>粗配准，用于给精配准提供初值</td></tr>
              <tr><td>TEASER++</td><td>截断最小二乘 + 图论</td><td>低</td><td>对 70% 以上外点仍鲁棒，几乎可省初值</td></tr>
            </tbody>
          </table>
        </div>
        <p>实践套路是“多分辨率 + 粗到精”：先 2 m 体素降采样做粗配准（或用特征法给出初值），再 0.5 m、0.2 m 逐级精配准。收敛域（basin of convergence）大体与目标尺度、点云重叠度成比例，超出域外一定发散，所以必须监控残差曲线。</p>
        <div class='codeblock'>import open3d as o3d
import numpy as np

src = o3d.io.read_point_cloud('lidar_frame.pcd')
dst = o3d.io.read_point_cloud('map_region.pcd')

T = np.eye(4)
for voxel, max_dist in [(2.0, 1.0), (0.5, 0.3), (0.2, 0.1)]:      # 由粗到精
    s = src.voxel_down_sample(voxel); d = dst.voxel_down_sample(voxel)
    res = o3d.pipelines.registration.registration_icp(
        s, d, max_correspondence_distance=max_dist, init=T,
        estimation_method=o3d.pipelines.registration.TransformationEstimationPointToPlane())
    T = res.transformation
    print('voxel %.1f  fitness %.3f  inlier RMSE %.3f' % (voxel, res.fitness, res.inlier_rmse))
# 验收：fitness（重叠比）&gt; 0.6 且 inlier_rmse 接近雷达测距噪声（1–3 cm）</div>
        <h3>激光-相机外参：目标法 vs 无目标法</h3>
        <p>要建立点云与像素的对应，有两条路：</p>
        <div class='grid g3'>
          <div class='card reveal'><h3>🎯 目标法</h3><p>在标定板上开孔或贴 ArUco/圆孔，图像里提角点、点云里提孔洞圆心，用 PnP 或配准求解 T_cam_lidar。精度高、可复现，但需要专门场地与人工操作。</p></div>
          <div class='card reveal'><h3>🔄 无目标法</h3><p>直接利用场景中的边缘、法向、互信息或跨模态深度一致性做优化。适合量产在线标定与“下线后漂移”的巡检，但可观测性依赖场景丰富度。</p></div>
          <div class='card reveal'><h3>🧪 验证</h3><p>把点云投影到图像上目视检查边缘重合度；量化指标包括投影边缘距离、互信息、标定板重投影误差，以及跑一圈后外参漂移量（重复性）。</p></div>
        </div>
        <div class='panel tip'><span class='pt'>现成工具</span><p>目标法可参考 ankitdhall/lidar_camera_calibration、heethesh/lidar_camera_calibration；无目标法可参考 koide3/direct_visual_lidar_calibration；点云配准库首选 fast_gicp（GICP/VGICP）与 Open3D，鲁棒全局配准用 TEASER++。链接见本章 0.14 节。</p></div>
      </section>
      <section class='sec scroll-target' id='opteng'>
        <div class='sec-head'><span class='no'>0.13</span><h2>数值优化的工程实践：从最小二乘到可上车的求解器</h2></div>
        <p>第 0.6 节给出了最小二乘的形式，这一节讲“真正跑起来”需要的六件事。自动驾驶里 90% 的优化问题都能写成同一句话：<b>让一堆残差的平方和最小</b>——标定、位姿图、BA、轨迹优化、MPC 都是它的变体。</p>
        <h3>① 从高斯牛顿到 LM</h3>
        <div class='math math-left'>高斯牛顿：JᵀJ · Δx = −Jᵀr　（快，但在坏点附近可能发散）<br>LM：　　(JᵀJ + λ·diag(JᵀJ)) · Δx = −Jᵀr　（阻尼，λ 自适应）<br>ρ 下降 → 接受并减小 λ；ρ 上升 → 拒绝并增大 λ</div>
        <h3>② 鲁棒核函数：把外点“压扁”</h3>
        <p>激光里程计里 20% 的误匹配就能把解拉飞。做法是不再最小化 r²，而是最小化 ρ(r)：</p>
        <div class='math math-left'>Huber：ρ(r) = r²/(2δ)（|r| ≤ δ）；δ(|r| − δ/2)（否则），权重 w = min(1, δ/|r|)<br>Cauchy：ρ(r) = (c²/2)·log(1 + (r/c)²)，权重 w = 1/(1 + (r/c)²)</div>
        <p>直观理解：残差越大权重越低，等价于“自动给外点降权”。代价是目标函数非凸，初值差时容易落到局部极小。</p>
        <h3>③ 稀疏性与 Schur 补</h3>
        <p>BA 的 H = JᵀJ 不是稠密的：相机位姿块之间只通过路标点相连。把变量按“位姿 / 路标”分块后，H 呈块箭头形，用 Schur 补先消掉路标（数量最多、彼此独立），只对位姿求解，能把复杂度从 O(n³) 降到接近 O(n)。因子图里的边缘化（marginalization）本质是同一件事：把旧状态消掉，但会在剩余变量间产生“填充”（fill-in），这也是滑动窗口优化的主要数值负担。</p>
        <h3>④ 雅可比怎么做</h3>
        <p>三条路线：解析推导（快、易错）、数值差分（方便验证，代价 n 倍）、自动微分（Ceres 的 Jet 类型、PyTorch/JAX 的 grad，几乎无脑）。工程建议：先用自动微分跑通，再对最耗时的残差手写解析雅可比，用数值差分做单元测试比对。</p>
        <h3>⑤ 求解器选型</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>库</th><th>最适合</th><th>关键能力</th></tr></thead>
            <tbody>
              <tr><td>Ceres Solver</td><td>标定、BA、点云配准等非线性最小二乘</td><td>自动微分、鲁棒核、多种线性求解器</td></tr>
              <tr><td>GTSAM</td><td>因子图 / SLAM / 组合导航</td><td>增量式 iSAM2、流形类型（Rot3/Pose3）</td></tr>
              <tr><td>g2o</td><td>经典位姿图优化</td><td>轻量、易读，适合学习图优化结构</td></tr>
              <tr><td>OSQP / qpOASES</td><td>凸二次规划（MPC、轨迹优化）</td><td>毫秒级求解、支持热启动</td></tr>
              <tr><td>CasADi / acados</td><td>非线性 MPC</td><td>符号建模、自动微分、嵌入式 C 代码生成</td></tr>
              <tr><td>NLopt</td><td>通用非线性约束优化</td><td>算法丰富，适合做方法对比</td></tr>
            </tbody>
          </table>
        </div>
        <h3>⑥ 实时预算与验收</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>环节</th><th>典型周期</th><th>每周期可用优化时间</th><th>常见规模</th></tr></thead>
            <tbody>
              <tr><td>在线标定 / 外参巡检</td><td>1–10 Hz</td><td>20–100 ms</td><td>几十个残差，6 维状态</td></tr>
              <tr><td>激光里程计 / 定位</td><td>10 Hz</td><td>30–80 ms</td><td>千级点面残差，6–15 维状态</td></tr>
              <tr><td>轨迹优化（规划）</td><td>10–20 Hz</td><td>30–60 ms</td><td>数十段轨迹 × 约束</td></tr>
              <tr><td>MPC 控制</td><td>50–100 Hz</td><td>5–15 ms</td><td>N ≈ 10–30 步的 QP</td></tr>
            </tbody>
          </table>
        </div>
        <div class='panel warn'><span class='pt'>排查清单</span><p>优化不收敛时按这个顺序查：① 单位与坐标系是否统一（角度/弧度、米/毫米最容易错）；② 残差量纲是否混用（位置误差与角度误差直接相加会毁掉权重）；③ 初值是否落在收敛域内；④ 是否只是“迭代次数耗尽”被当成收敛（必须打印残差曲线与是否收敛标志）；⑤ 是否缺少鲁棒核导致单个外点主导；⑥ 协方差/信息矩阵是否病态（条件数大时改用 QR 或平方根形式）。</p></div>
      </section>

      <section class='sec scroll-target' id='res'>
        <div class='sec-head'><span class='no'>0.14</span><h2>学习资源地图</h2></div>
        <p>下面按“书 → 课程 → 开源实现 → 工具链”排列，全部为可公开访问的英文/中文资料，建议先用书建立框架，再用代码验证公式。</p>
        <div class='paper'><h4>教材（配合本章最紧）</h4><p>Thrun, Burgard &amp; Fox, <i>Probabilistic Robotics</i>（第 2、3 章覆盖贝叶斯滤波与卡尔曼家族）；Bar-Shalom et al., <i>Estimation with Applications to Tracking and Navigation</i>（工程化估计理论）；Hartley &amp; Zisserman, <i>Multiple View Geometry in Computer Vision</i>（第 7 章讲相机模型与标定）；Nocedal &amp; Wright, <i>Numerical Optimization</i>（LM、信赖域、鲁棒核的数学出处）。</p></div>
        <div class='paper'><h4>在线交互教程</h4><p><a href='https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python'>Kalman and Bayesian Filters in Python</a>（Jupyter 书，含 KF/EKF/UKF/粒子滤波与全部练习解答，最推荐的入门动手材料）；<a href='https://kalmanfilter.net/'>kalmanfilter.net</a>（用数值例子从一维讲到多维）；<a href='https://www.mit.edu/course/16/16.070/www/project/PF_kalman_intro.pdf'>MIT 16.070 卡尔曼滤波导论</a>（十余页讲义，适合通勤时过一遍）。</p></div>
        <div class='paper'><h4>可直接跑的代码</h4><p><a href='https://github.com/rlabbe/filterpy'>filterpy</a>（KF/EKF/UKF/粒子滤波参考实现）、<a href='https://github.com/pykalman/pykalman'>pykalman</a>（含平滑与 EM）、<a href='https://github.com/simondlevy/TinyEKF'>TinyEKF</a>（嵌入式 C/C++ EKF 模板，适合车端移植）；优化与标定用 <a href='http://ceres-solver.org/'>Ceres Solver</a>、<a href='https://gtsam.org/'>GTSAM</a>；点云配准用 <a href='https://github.com/koide3/fast_gicp'>fast_gicp</a> 与 Open3D；鲁棒全局配准用 <a href='https://github.com/MIT-SPARK/TEASER-plusplus'>TEASER++</a>。</p></div>
        <div class='paper'><h4>外参与标定工具</h4><p><a href='https://github.com/ankitdhall/lidar_camera_calibration'>lidar_camera_calibration</a>（目标法 ROS 包）、<a href='https://github.com/heethesh/lidar_camera_calibration'>heethesh/lidar_camera_calibration</a>（轻量目标法）、<a href='https://github.com/koide3/direct_visual_lidar_calibration'>direct_visual_lidar_calibration</a>（无目标法，含 ROS2 支持）。</p></div>
        <div class='paper'><h4>进阶论文</h4><p>Kalman, “A New Approach to Linear Filtering and Prediction Problems” (1960)；Julier &amp; Uhlmann, “Unscented Filtering and Nonlinear Estimation” (2004)；Zhang, “A Flexible New Technique for Camera Calibration” (2000)；<a href='https://arxiv.org/abs/1711.02508'>Sola, “Quaternion kinematics for the error-state Kalman filter” (2017)</a>（ESKF 的事实标准参考）。</p></div>
        <div class='panel info'><span class='pt'>本站其他资源</span><p>整站外部资源总览见 <a href='resources.html'>教程资源库</a>；本章的滤波器与优化知识会在 <a href='../../pages/tech/perception.html'>科普·环境感知</a> 与第 3 章的组合导航中反复出现。</p></div>
      </section>

      <section class='sec scroll-target' id='quiz'>
        <div class='sec-head'><span class='no'>0.16</span><h2>自测题（先动手，再点开答案）</h2></div>
        <div class='faq'>
          <details><summary>Q6：为什么姿态优化要用“3 维小量”而不是直接优化四元数的 4 个分量？</summary><p>四元数带单位约束（4 参数只有 3 个自由度），直接优化会不断破坏 ‖q‖ = 1；用 3 维旋转向量作为误差量，约束自动满足，雅可比也稳定。更新完再注入并归一化即可。</p></details>
          <details><summary>Q7：EKF 什么情况下会“过度自信”？</summary><p>当状态不确定度大、非线性强（如大角度转弯、近距强透视）时，一阶泰勒展开忽略的高阶项被低估，估出的协方差偏小，滤波器对新观测越来越不信任，最终发散。</p></details>
          <details><summary>Q8：ICP 收敛域大概多大？怎么提高成功率？</summary><p>通常要求初始位姿误差小于“点云尺度/体素大小”的量级（一般几厘米到半米）。工程做法是多分辨率由粗到精、先做 FPFH+RANSAC 或 TEASER++ 粗配准给初值，并监控残差曲线。</p></details>
          <details><summary>Q9：为什么标定时要“倾斜标定板”，而不是全部正对镜头？</summary><p>正交约束 r₁ᵀr₂ = 0 需要非平凡的三维姿态信息才能同时约束焦距与主点。全部正对时深度与焦距强相关，解出的参数在别的距离上就失效。</p></details>
          <details><summary>Q10：MPC 每周期只解一次 QP，为什么还要“热启动”？</summary><p>相邻控制周期的解通常非常接近，把上一周期的解作为初始点能显著减少迭代次数（常可减少数倍求解时间），并让求解时间更可预测，满足实时性要求。</p></details>
        </div>
        <div class='faq'>
          <details><summary>Q0：车体系 x 前、y 左、z 上时，绕 z 轴转 +90° 会把“正前方”变成什么方向？</summary><p>旋转矩阵作用在 [1,0,0]ᵀ 上得到 [cos90, sin90, 0]ᵀ = [0,1,0]ᵀ，即正左方。这就是“左转为正”的直观含义，也是后续 Frenet 与航向角 θ 的符号约定来源。</p></details>
          <details><summary>Q1：旋转矩阵为什么求逆等于转置？</summary><p>旋转不改变向量长度与夹角，因此 RᵀR = I（正交性），两边同左乘 R⁻¹ 得 R⁻¹ = Rᵀ。</p></details>
          <details><summary>Q2：卡尔曼更新公式中，观测噪声 R 趋于无穷大时，估计 x̂ 会变成什么？</summary><p>K → 0，x̂ → x̂⁻，即完全相信运动模型预测、忽略观测。</p></details>
          <details><summary>Q3：针孔模型里，同一个物体放远一倍，在图像上大约缩小多少？</summary><p>投影坐标约与深度成反比（u ≈ fx·X/Z），所以距离翻倍，成像高度约为原来一半。</p></details>
          <details><summary>Q4：为什么车规里常用 EKF/UKF 而很少直接用完整粒子滤波？</summary><p>车载算力与实时性约束：粒子滤波用大量采样近似任意分布，精度高但计算量随状态维数指数上升，难以在嵌入式平台跑高频。</p></details>
          <details><summary>Q5：LM 阻尼 λ 很大时算法近似哪种方法，很小呢？</summary><p>λ 大时近似梯度下降（稳健、收敛慢）；λ 小时近似高斯牛顿（快、可能发散）。</p></details>
        </div>
      </section>

      <nav class='chapter-nav' aria-label='讲义翻页'>
      <span class='chapter-link gap'></span>
      <a class='chapter-link map' href='index.html'>
        <b>课程地图</b>
      </a>
      <a class='chapter-link next' href='02-perception.html'>
        <span class='chapter-dir'>下一讲 →</span>
        <b>第 1 章 · 感知与状态估计</b>
      </a>
      </nav>
