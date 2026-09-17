---
id: "pages/tutorial/05-llm-vla.html"
slug: "05-llm-vla"
title: "第 4 章 · LLM/VLM/VLA 端到端智驾 · 驶向未来"
description: "自动驾驶系统教程第 4 章：多模态 token 化、端到端轨迹监督与损失、语言条件驾驶、VLA 架构与部署、开放词汇感知、评测与安全。"
accent: "accent-tech"
hero_kicker: "系统教程 · 第 4 章"
hero_h1: "LLM 与 VLA：让“会说话的大模型”开车"
hero_lead: "这一章不再停留在“大模型能帮自动驾驶做什么”的科普层面，而是进入建模细节：图像、点云、语言、轨迹如何变成同一个模型的 Token？端到端策略的损失函数到底长什么样？VLA 上车要解决哪些延迟与算力问题？学完你能自己搭出一个最小可训练的驾驶策略基线。"
crumb: "首页|../../index.html"
crumb: "系统教程|../../pages/tutorial/index.html"
crumb: "第 4 章|"
---

<div class='panel info'><span class='pt'>配套阅读</span><p>想先建立直觉？可先看科普版 <a href='../../pages/frontier.html'>AI 前沿</a>，再回来读公式与推导。</p></div>
      <section class='sec scroll-target' id='obj'>
        <div class='sec-head'><span class='no'>4.1</span><h2>学习目标与前置</h2></div>
        <div class='lesson-meta'><span>难度：高阶</span><span>预计：6–8 小时</span><span>前置：教程 0–3 章 + 科普 AI 前沿</span></div>
        <p>学完本章，你应该能：① 说清视觉/激光/语言/轨迹各自如何“Token 化”并拼进一个 Transformer；② 写出行为克隆与轨迹回归的损失，并解释为什么会产生分布偏移；③ 设计一个“语言条件轨迹预测”的最小数据样本格式；④ 画出 VLA 的车载部署链路并估算延迟瓶颈；⑤ 用 minADE、约束违反率等指标客观评测一个端到端模型。</p>
        <p>概念先修：<a href='../frontier.html'>AI 前沿专题（科普）</a>给出“是什么”；本章负责“怎么建模、怎么训练、怎么验证”。</p>
      </section>

      <section class='sec scroll-target' id='token'>
        <div class='sec-head'><span class='no'>4.2</span><h2>表征统一：一切皆 Token</h2></div>
        <p>端到端大模型的起点是把异构输入变成“同一本字典里的词”。每个模态都有自己的 Token 化方式：</p>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>输入</th><th>Token 化方式</th><th>典型粒度</th></tr></thead>
            <tbody>
              <tr><td>图像</td><td>切 patch 后线性投影（ViT 式）或 CNN 特征图压平</td><td>16×16 或 32×32 像素 / patch</td></tr>
              <tr><td>BEV 栅格</td><td>把多相机融合出的 BEV 特征按 cell 拉平成序列</td><td>0.5 m/cell 级别（配合 Transformer）</td></tr>
              <tr><td>点云</td><td>体素化后用稀疏卷积提特征，取非空体素/柱体 token</td><td>0.1–0.2 m 体素</td></tr>
              <tr><td>文本/指令</td><td>BPE/词表分词（LLM 原生格式）</td><td>子词级</td></tr>
              <tr><td>自车状态/地图</td><td>数值归一化后拼成向量，或转成文本描述</td><td>速度、档位、导航意图等</td></tr>
              <tr><td>轨迹输出</td><td>连续轨迹离散成“轨迹词表”（K-means 聚类）或用 special token 引导回归</td><td>见 4.3</td></tr>
            </tbody>
          </table>
        </div>
        <p>数学上，图像 patch 的线性投影就是一次矩阵乘加可学习偏置：</p>
        <div class='math'>e_p = W_e · flatten(x_p) + b_e，e_p ∈ R^d</div>
        <p>拿到所有模态的 token 序列后，把它们拼成长序列送入自注意力层。自注意力的核心是“每对 token 之间算相关性再加权聚合”：</p>
        <div class='math math-left'>Q = X W_Q，K = X W_K，V = X W_V<br>Attention(Q,K,V) = softmax( QKᵀ / √d_k ) · V</div>
        <p>这正是第 2 章里“BEV query 到相机采样”背后同一套机制：BEVFormer 的每个 cell token 通过可变形注意力去图像特征里“问问题”，而 LLM 让文本 token 也能与视觉 token 互相“问答”。所谓“多模态大模型”，本质就是<b>把异构信号翻译进同一序列、用同一套注意力去建模它们的关系</b>。</p>
        <div class='panel tip'><span class='pt'>理解建议</span><p>亲手把一段 4 秒、10 Hz 的环视视频“Token 化”：算一算总 token 数（帧数 × patch 数）。你会发现视觉 token 远多于文本，工程上大量技巧（空间下采样、时序降采样、token 压缩）都在解决同一个问题——序列太长，注意力代价是 O(N²)。</p></div>
      </section>

      <section class='sec scroll-target' id='bc'>
        <div class='sec-head'><span class='no'>4.3</span><h2>端到端策略：从行为克隆到强化学习</h2></div>
        <h3>行为克隆：把“老司机怎么开”学下来</h3>
        <p>最直接的端到端训练是行为克隆（BC）：在状态 o（历史观测）下，专家动作 a*（真值轨迹/控制）已知，用最大似然训练策略 π_θ：</p>
        <div class='math'>θ* = argmax_θ Σ_{(o,a*)∈D} log π_θ(a* | o)</div>
        <p>连续动作通常假设高斯输出，等价于最小化轨迹回归损失。若轨迹是逐点回归：</p>
        <div class='math'>L = Σ_t SmoothL1( ŷ_t − y*_t )，ŷ_t = 策略输出的未来航点</div>
        <p>若把动作做成离散“词表”（如把每个速度/转向量化为 128 档，或用 K-means 把整条轨迹聚类成轨迹词），就变成标准的 token 预测，用交叉熵训练：</p>
        <div class='math'>L = −Σ_i log p(w_i | w_{&lt;i}, o)，w_i 为第 i 个动作/轨迹 token</div>
        <p>自回归地逐 token 生成轨迹，与 LLM 生成句子完全同构——这也是“把驾驶当成文本生成”的核心技巧（代表性研究如 Waymo EMMA：将未来轨迹表示为轨迹 token，用多模态大模型自回归解码）。</p>
        <div class='panel warn'><span class='pt'>行为克隆的致命缺陷：分布偏移</span><p>训练数据是“专家在正常状态下的动作”，而部署时模型任何小偏差都会把车带进训练分布之外的状态；在分布外，BC 没有学过“如何纠正自己”，误差会累积（compounding error）。经典对策包括：</p>
          <ul>
            <li><b>DAgger</b>：用当前策略开，人类纠正其动作，把“纠正样本”加入训练集，迭代逼向专家闭环行为。</li>
            <li><b>风险敏感加权</b>：对高风险样本（近距离、高相对速度）加重损失权重。</li>
            <li><b>目标条件化</b>：不只学“平均动作”，还学“给定意图/导航目标的动作分布”，减少多模态平均导致的模糊（下节）。</li>
          </ul>
        </div>
        <h3>强化学习：为“安全与效率”直接优化</h3>
        <p>BC 只能模仿数据里的行为；想学“数据里没有但更安全”的行为，需要用奖励信号做强化学习。目标函数是期望折扣回报：</p>
        <div class='math'>J(θ) = E_{τ~π_θ}[ Σ_{t≥0} γᵗ r(s_t, a_t) ]</div>
        <p>策略梯度定理给出无偏估计：</p>
        <div class='math'>∇_θ J = E[ ∇_θ log π_θ(a|s) · A(s,a) ]</div>
        <p>A 是优势函数（该动作比平均水平好多少）。PPO 用重要性采样比率加裁剪，防止更新步长过大导致训练崩溃：</p>
        <div class='math'>L^CLIP = E[ min( r(θ)·A，clip(r(θ), 1−ε, 1+ε)·A ) ]</div>
        <p>其中 r(θ) = π_θ(a|s) / π_old(a|s) 是新旧策略的比值。驾驶奖励通常由多目标组成：</p>
        <div class='math'>r = w₁·进度 + w₂·舒适(低 jerk) + w₃·规则(限速/车道) + w₄·安全(最小 TTC/间距) − w₅·碰撞惩罚</div>
        <p>工业界常见的折中是：<b>BC 起步 + RL 微调 + 规则安全层保底</b>。纯 RL 在真实道路直接探索不可接受，因此 RL 多跑在仿真里，再配合真实数据回归。</p>
      </section>

      <section class='sec scroll-target' id='llm'>
        <div class='sec-head'><span class='no'>4.4</span><h2>LLM/VLM 接入驾驶的三种方式</h2></div>
        <div class='grid g3'>
          <div class='card reveal'><h3>① 开放词汇感知</h3><p>传统检测器词表封闭。借助图文对齐模型，把“任意文字描述”与图像区域特征做相似度匹配，识别没见过的物体。</p></div>
          <div class='card reveal'><h3>② 场景理解与推理</h3><p>VLM 把环视画面 + 地图文本理解成一段“场景报告”，支持交通灯状态、事故现场等复杂语义问答与推理。</p></div>
          <div class='card reveal'><h3>③ 语言条件决策</h3><p>把导航、交规、乘客意图作为条件，让策略在给定语义约束下输出轨迹——语言成为“可组合的意图接口”。</p></div>
        </div>
        <h3>① 开放词汇：文本与视觉的余弦匹配</h3>
        <p>把类别/描述文字 t 与候选区域特征 v 都映射到同一语义空间，用余弦相似度打分：</p>
        <div class='math'>score(region, t) = cos( E_text(t), E_vis(region) ) = E_text(t)·E_vis(region) / (|E_text| |E_vis|)</div>
        <p>于是“前方是不是一个倒了的施工牌”这类新词条，不需要重新训练检测头，只要给一段文字描述。工程上常把开放词汇输出再接到<b>规则校验</b>：模型“认为”是障碍，宁可保守也不漏。</p>
        <h3>② VLM 场景理解：把世界“读成文字”</h3>
        <p>设视觉 token 序列为 V，文本 token 为 T，送入多模态 Transformer 后生成回答/中间表征 Y。训练目标是文本最大似然：</p>
        <div class='math'>L = −Σ log p(y_i | V, T, y_{&lt;i})</div>
        <p>这种模型可以成为驾驶系统的“慢通道”：低频（1–10 Hz）理解全局语义（如交警手势、事故形态），把结论以结构化文本/向量交给高频规划器。它也能做 Chain-of-Thought——先写“前车刹车灯亮、左侧车道空、预计 3 秒后变道”再输出动作，给黑盒决策一个可读的中间推理。</p>
        <h3>③ 语言条件策略：让约束“说进”模型里</h3>
        <p>把策略写成条件分布：</p>
        <div class='math'>π_θ(a | o, c)，c = 导航/交规/乘客指令的文本编码</div>
        <p>训练样本形如：观测片段 o + 指令 c（“前方施工，走最左侧车道”“在第二个红绿灯右转”）+ 真值轨迹 a*。推理时把用户语音转成文本 c，模型在 c 的条件下生成轨迹。相比“用户指令 → 规则层改参数”的硬编码，语言条件让一个模型学会多种意图，并天然支持“不要压实线”这类难以参数化的软约束。</p>
        <div class='codeblock'>最小数据样本格式（JSON 结构示意）：
{
  id: 000001,
  observation: [环视图像 0..5 @10Hz ×4s, 自车速度/转向, 地图意图],
  instruction: 前方车道收窄，提前并入左侧车道,
  trajectory: [未来 6s 每 0.5s 一个航点 (x, y, v, heading)],
  safety_meta: { 最近障碍距离, 限速, 是否施工区 }
}</div>
      </section>

      <section class='sec scroll-target' id='vla'>
        <div class='sec-head'><span class='no'>4.5</span><h2>VLA 架构与车载部署</h2></div>
        <h3>VLA = 视觉语言模型 + 动作输出</h3>
        <p>VLA（Vision-Language-Action）在 VLM 之上加一路“动作头”，把“看懂”延伸到“会开”。典型组件：</p>
        <div class='codeblock'>环视相机 → 视觉编码器(ViT/CNN) → patch token
                                    ↓ 投影层(MLP / Q-Former 风格)
语音/导航 → 分词器 → 文本 token ──→ LLM 主干(decoder-only)
                                    ↓ 动作头
            自回归输出：文本解释 + 轨迹 token / 控制 token
                                    ↓ 轨迹解码 → 安全校验 → 控制</div>
        <p>几个必须想清楚的工程选择：</p>
        <div class='grid g2'>
          <div class='card reveal'><h3>🎯 动作空间</h3><p>连续航点回归 vs 离散动作词表 vs 分层（先用 token 选意图/模式，再回归细粒度轨迹）。离散化把控制问题变成“下一个词预测”，与预训练语言模型无缝衔接。</p></div>
          <div class='card reveal'><h3>📉 自回归延迟</h3><p>逐 token 解码延迟随序列长度线性增长；车载方案用并行解码、量化、剪枝与“小模型车端 + 大模型云端”分层。频率标定常以“每帧 10–50 ms 内输出”为工程目标，具体取决于 ODD 要求。</p></div>
          <div class='card reveal'><h3>🖥 车端资源</h3><p>数百 TOPS 的域控制器跑 7B–70B 参数量级需 INT8/FP8 量化与算子定制；纯软件方案之外，常保留一套轻量传统端到端/规则兜底。</p></div>
          <div class='card reveal'><h3>🧩 多任务头</h3><p>同一骨干同时输出目标框、占用、红绿灯与轨迹，可共享视觉特征、降低重复计算；但任务间损失平衡需要仔细调节。</p></div>
        </div>
        <div class='panel info'><span class='pt'>怎么理解 2025 年的“VLA 上车”</span><p>2025 年 8 月前后，理想、小鹏、元戎启行等相继宣布 VLA 大模型进入量产叙事，核心卖点是把“语言理解 + 场景理解 + 动作规划”放进一个网络，并支持语音指令直接改变驾驶行为。需要冷静区分的三点：第一，量产仍以 L2/L2+ 监督驾驶为主；第二，“VLA”在不同公司指代的具体结构并不相同；第三，能跑通不等于已通过全部安全论证——这正是本章最后两节要讨论的。</p></div>
      </section>

      <section class='sec scroll-target' id='data'>
        <div class='sec-head'><span class='no'>4.6</span><h2>数据与训练配方</h2></div>
        <h3>样本如何组装</h3>
        <p>端到端大模型的数据以“驾驶片段 + 对齐标注”为单位。每段片段约 8–30 s，切成（观测窗口 2–4 s，预测窗口 4–10 s）的训练对。需要对齐的模态包括：传感器时间戳、自车真值状态、高精地图、指令文本、未来轨迹。</p>
        <h3>训练配方（三个阶段是常见做法）</h3>
        <ol class='steps'>
          <li><h3>预训练（可选，通用底座）</h3><p>在海量图文/视频上得到通用视觉与语言能力，为“世界常识”打底；资源有限可跳过，直接加载开源 VLM 权重。</p></li>
          <li><h3>驾驶对齐微调</h3><p>用驾驶样本做多任务训练：场景理解 + 轨迹预测 + 指令跟随。轨迹损失与文本损失加权：L_total = L_llm + λ_traj L_traj + λ_aux L_aux。</p></li>
          <li><h3>闭环优化</h3><p>仿真里做 DAgger/RL 微调，重点修正“离线损失低但闭环会撞”的行为。</p></li>
        </ol>
        <h3>真值从哪来</h3>
        <p>轨迹真值可以直接用车记录的自车状态（对“学习自车怎么开”足够）；但若学“聪明行为”，需要把人类司机的完整轨迹、接管前后片段都标注出来。接管片段是最珍贵的训练信号：它标出了“模型哪里不够好”。语言指令真值可自动改写自导航意图模板，再用大模型扩充表达多样性。</p>
        <div class='panel warn'><span class='pt'>数据陷阱</span><p>① 传感器与真值时间戳不对齐会让损失“教错动作”；② 全部数据来自自家车/自家场景会产生偏差，跨车型、跨城市要单独回归；③ 轨迹多模态（直行/变道都合理）时，平均损失会鼓励“骑在两条路中间”的模糊轨迹——需要多假设输出或离散轨迹词表来规避。</p></div>
      </section>

      <section class='sec scroll-target' id='eval'>
        <div class='sec-head'><span class='no'>4.7</span><h2>评测体系：离线指标 ≠ 会开车</h2></div>
        <div class='grid g2'>
          <div class='card reveal'><h3>📏 开环轨迹误差</h3><p>minADE_K：K 条候选轨迹里，与真值平均位移误差最小的一条；minFDE_K：只看终点误差。开环误差低是必要不充分条件。</p></div>
          <div class='card reveal'><h3>🎮 闭环仿真</h3><p>把模型放进仿真器自跑，统计碰撞率、出界率、任务完成率、平均进度、舒适度（jerk/横向加速度）与接管次数。这才是“会不会开车”的主指标。</p></div>
          <div class='card reveal'><h3>🗣 语言与指令指标</h3><p>指令跟随成功率、对“为什么这样开”的回答一致性、幻觉探测（模型声称看见不存在障碍/错误解释决策的比例）。</p></div>
          <div class='card reveal'><h3>🔒 安全漏斗指标</h3><p>预测违反约束率、安全层触发频率、最坏情况 TTC/间距分布、ODD 越界检测率。安全层的触发率不是越低越好，而是要与“危险场景实际占比”对得上。</p></div>
        </div>
        <p>minADE 的定义要能默写：给定 K 条预测轨迹 ŷ⁽ᵏ⁾ 与真值 y，先对每条算逐时刻 L2 的平均，再取 K 条中的最小：</p>
        <div class='math'>minADE_K = (1/N)·Σᵢ min_k (1/T)·Σₜ ‖ŷ⁽ᵏ⁾ₜ − yₜ‖₂</div>
        <p>评测端到端模型还有一个容易踩的坑：<b>同一模型在真值传感器输入上表现好，不代表在带噪声/延迟/失真的真车上好</b>。因此进阶评测必须注入传感器噪声、丢帧、延迟与天气扰动做鲁棒性测试。</p>
      </section>

      <section class='sec scroll-target' id='safety'>
        <div class='sec-head'><span class='no'>4.8</span><h2>安全边界与落地架构</h2></div>
        <p>大模型输出动作前必须经过独立于模型的安全层。推荐的双环架构是：</p>
        <div class='codeblock'>VLA/端到端模型（提议者）：生成候选轨迹 + 置信度 + 文本解释
      ↓
安全校验层（验证者，规则/几何/动力学）：
  1) 碰撞检查（占用栅格 + 预测）
  2) 动力学可行性（曲率/加加速度限幅）
  3) 交规与 ODD 边界（实线、限速、可行驶域）
  4) 不确定性拒绝（OOD/低置信度时直接拒绝）
      ↓
通过 → 下发控制；不通过 → 保守降级（减速/靠边/请求接管）</div>
        <p>为什么不能“信模型”：大模型有<b>幻觉</b>（编造场景）、<b>过度自信</b>（低置信也敢输出）、<b>分布外失效</b>（训练里没见过的场景）。所以安全论证永远分层：<b>模型负责上限，规则/物理层负责下限</b>，与 SOTIF（ISO 21448）和功能安全（ISO 26262）的框架对接。可延伸阅读 <a href='../challenges/safety.html'>科普·安全体系</a> 与第 3 章 3.8 节。</p>
      </section>

      <section class='sec scroll-target' id='adv'>
        <div class='sec-head'><span class='no'>4.9</span><h2>进阶：动作表示与扩散策略</h2></div>
        <h3>① 动作怎么“token 化”</h3>
        <p>VLA 要输出连续控制量，必须先把动作离散化或参数化。常见三种做法：</p>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>表示</th><th>做法</th><th>特点</th></tr></thead>
            <tbody>
              <tr><td>离散动作 token</td><td>把转向 / 加速度分桶，逐 token 自回归生成</td><td>与 LLM 接口统一；量化误差与序列长度是代价</td></tr>
              <tr><td>连续回归头</td><td>在特征后接 MLP 直接回归动作</td><td>精度高、无离散误差；但丢失多模态性</td></tr>
              <tr><td>扩散 / 流匹配</td><td>用扩散模型从噪声生成动作序列</td><td>能表达多模态分布，推理步数是瓶颈</td></tr>
            </tbody>
          </table>
        </div>
        <h3>② 扩散策略（Diffusion Policy）</h3>
        <p>扩散模型把“生成动作”看作逐步去噪：从高斯噪声 a^K 出发，学习反向过程 a^{k−1} = μ(a^k, k, 观测)，最终得到一条动作序列。相比单峰回归，它能表示“左转或直行都合理”这种多模态分布，且训练稳定。代价是推理需要多步去噪，车端实时性压力大，常用蒸馏、DDIM 加速或减少去噪步数。</p>
        <h3>③ 行为克隆的分布偏移</h3>
        <p>模仿学习只在专家轨迹附近有数据，一旦模型偏离就进入训练时没见过的状态，误差不断累积（covariate shift）。缓解手段包括 DAgger（在线让专家纠正模型状态）、加入恢复数据，以及用世界模型 / 仿真做闭环数据增强。</p>
      </section>

      <section class='sec scroll-target' id='tf'>
        <div class='sec-head'><span class='no'>4.10</span><h2>Transformer 机制复盘：驾驶场景下要特别关注的细节</h2></div>
        <p>4.2 节给了一行注意力公式，这里补齐在驾驶模型里真正决定成败的几个细节。</p>
        <h3>注意力到底在算什么</h3>
        <div class='math math-left'>A = softmax(Q Kᵀ / √d_k)，输出 = A V<br>Q = X W_Q，K = X W_K，V = X W_V（X 为 token 序列）</div>
        <p>Q·Kᵀ 度量“每个 token 有多想看每个 token”，softmax 归一成权重，再对 V 加权求和。驾驶里三处高频用法：BEV query 到图像特征采样（BEVFormer 式）、目标之间的交互建模（轨迹预测）、语言 token 与视觉 token 的跨模态对齐（VLA）。</p>
        <h3>位置信息：为什么是 RoPE</h3>
        <p>注意力本身对顺序不敏感，必须注入位置。绝对位置编码简单但外推差；旋转位置编码（RoPE）把位置变成一个随位置旋转的相位，使注意力分数只依赖相对距离，长度外推与长序列表现更好，已成为主流 LLM 的默认选择。对驾驶模型的意义：希望模型能泛化到“训练时没见过的更长历史/更长预测时域”。</p>
        <h3>因果掩码与训练/推理的不对称</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>概念</th><th>作用</th><th>驾驶里的影响</th></tr></thead>
            <tbody>
              <tr><td>因果掩码（causal mask）</td><td>预测第 i 个 token 时屏蔽未来 token</td><td>保证训练与自回归推理一致；轨迹 token 必须按时间顺序生成</td></tr>
              <tr><td>KV cache</td><td>缓存历史 K、V，避免重复计算</td><td>自回归生成动作时显存/带宽的主要开销来源</td></tr>
              <tr><td>教师强制（teacher forcing）</td><td>训练时用真值 token 作为输入</td><td>推理时输入自己的预测，分布偏移会累积（与 BC 的 compounding error 同源）</td></tr>
              <tr><td>注意力复杂度 O(N²)</td><td>序列长度的平方</td><td>环视视频 token 数上万，必须做时空降采样或稀疏注意力</td></tr>
            </tbody>
          </table>
        </div>
        <div class='panel warn'><span class='pt'>驾驶场景的三个额外难点</span><p>① token 数巨大：4 秒环视视频轻松超过 10⁵ 个视觉 token，注意力的平方代价不可接受；② 时序因果性强：动作会影响未来观测，不能像文本那样随意遮挡；③ 多模态输出：同一场景下“左转/直行”都合理，单峰回归会输出“平均的、物理上不存在的动作”。</p></div>
      </section>

      <section class='sec scroll-target' id='family'>
        <div class='sec-head'><span class='no'>4.11</span><h2>模型谱系与横向对比：从模块化到端到端</h2></div>
        <p>同样叫“端到端”，不同工作差异巨大。下表按“是否显式建模中间表征”“是否用语言”两个维度梳理。</p>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>类别</th><th>代表工作</th><th>核心思路</th><th>优点 / 代价</th></tr></thead>
            <tbody>
              <tr><td>模块化（非端到端）</td><td>Apollo / Autoware 的全栈</td><td>感知→预测→规划→控制分模块，接口明确</td><td>可解释、可局部迭代；模块间误差传递与信息损失</td></tr>
              <tr><td>规划导向端到端</td><td><a href='https://github.com/OpenDriveLab/UniAD'>UniAD</a>、<a href='https://github.com/hustvl/VAD'>VAD</a></td><td>感知/预测/规划联合训练，规划损失反传全网络</td><td>减少接口损失；需要大量标注与算力</td></tr>
              <tr><td>稀疏端到端</td><td><a href='https://github.com/swc-17/SparseDrive'>SparseDrive</a> 等</td><td>用稀疏实例 token 取代稠密 BEV，提速</td><td>实时性更好；稀疏表征设计调参难度高</td></tr>
              <tr><td>模仿学习基线</td><td><a href='https://github.com/autonomousvision/transfuser'>TransFuser</a></td><td>多模态特征融合 + 行为克隆输出轨迹</td><td>结构简单、易复现；对分布外场景脆弱</td></tr>
              <tr><td>扩散式策略</td><td><a href='https://github.com/hustvl/DiffusionDrive'>DiffusionDrive</a> 等</td><td>用扩散/流匹配生成多模态轨迹</td><td>多模态表达强；推理步数是瓶颈</td></tr>
              <tr><td>语言条件驾驶</td><td><a href='https://github.com/Tsinghua-MARS-Lab/DriveVLM'>DriveVLM</a>、<a href='https://github.com/OpenDriveLab/DriveLM'>DriveLM</a></td><td>视觉语言模型做场景理解/推理，再输出规划或问答</td><td>泛化与可解释性好；延迟与幻觉风险</td></tr>
              <tr><td>VLA 基座</td><td><a href='https://github.com/openvla/openvla'>OpenVLA</a>、<a href='https://github.com/Physical-Intelligence/openpi'>π0 / openpi</a></td><td>视觉 + 语言 → 动作 token/连续动作块</td><td>跨任务泛化强；数据规模与控制频率是难点</td></tr>
            </tbody>
          </table>
        </div>
        <h3>怎么选：三个决策问题</h3>
        <div class='steps'>
          <ol>
            <li><h3>要不要保留显式中间表征？</h3><p>有显式感知/占用输出，便于单独验证与安全兜底；纯端到端更简洁但问题定位困难。工业界普遍倾向“显式占用 + 学习规划”的混合方案。</p></li>
            <li><h3>动作表示是离散 token 还是连续块？</h3><p>离散 token 与 LLM 接口统一、易表达多模态，但有量化误差；连续回归精度高但易“取平均”；扩散/流匹配兼顾多模态与精度，代价是推理步数。</p></li>
            <li><h3>推理算力预算多少？</h3><p>车端每周期通常只有几十毫秒预算。视觉 token 数、模型参数量与推理步数三者互相挤压，必须先定预算再选模型，而不是反过来。</p></li>
          </ol>
        </div>
      </section>
      <section class='sec scroll-target' id='recipe'>
        <div class='sec-head'><span class='no'>4.12</span><h2>训练配方与轨迹 Token 化：从数据到可训练的样本</h2></div>
        <p>4.6 节讲了数据来源，这一节给出“怎么把一段驾驶数据变成训练样本”，以及三阶段训练配方。</p>
        <h3>样本构造：一条样本长什么样</h3>
        <div class='codeblock'>{
  "scene_id": "2026-05-12/run_0317",     # 场景与车次
  "inputs": {
    "cameras":   {"front": [t-1.9s ... t], "left": [...], ...},  # 环视时序（降采样）
    "lidar_bev": "voxel_or_bev_tensor",                          # 可选
    "ego_state": {"v": 11.2, "yaw_rate": 0.02, "accel": 0.3},    # 自车状态
    "nav":       {"route": ["lane_12", "lane_18"], "turn": "left"},
    "language":  "前方路口左转，注意右侧非机动车"                 # 可选指令/解释
  },
  "targets": {
    "future_traj": [[x, y, yaw, v], ...  for t+0.1s ... t+4.0s],  # 未来轨迹（10 Hz）
    "action_tokens": [1023, 1188, 1201, ...],                     # 轨迹 token（见下）
    "occupancy_future": "optional"
  },
  "meta": {"weather": "rain", "split": "train", "label_quality": "auto+human"}
}</div>
        <h3>轨迹 Token 化的两种做法</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>做法</th><th>怎么建词表</th><th>优点</th><th>缺点</th></tr></thead>
            <tbody>
              <tr><td>逐点离散化</td><td>把 (Δx, Δy, Δyaw) 或 (曲率, 加速度) 分桶，各轴独立编码</td><td>实现简单、组合空间大</td><td>token 数多（每帧若干 token），自回归步数多</td></tr>
              <tr><td>整条轨迹聚类</td><td>对海量真实轨迹做 K-means（K = 1024–8192），每簇一个 token</td><td>一条轨迹一个 token，推理快、天然多模态</td><td>词表粒度决定精度上限，需要在线细化</td></tr>
            </tbody>
          </table>
        </div>
        <div class='math math-left'>整条轨迹聚类：T* = argmin_{c∈C} ‖ traj − c ‖²（C 为聚类中心集合，离线构建）<br>训练目标：L = −Σ log p(w_i | w_&lt;i, 观测, 指令)（交叉熵，等价于“学人类开法”）</div>
        <h3>三阶段训练配方</h3>
        <div class='steps'>
          <ol>
            <li><h3>视觉-语言预训练（或直接复用开源基座）</h3><p>用大规模图像-文本数据获得通用视觉语义能力。直接使用 OpenVLA/π0 等开源基座能省掉这一步，代价是要接受其模态与分辨率限制。</p></li>
            <li><h3>驾驶数据监督微调</h3><p>用真实驾驶日志做模仿学习：输入环视时序 + 自车状态 + 指令，输出未来轨迹或动作 token。关键工程点：数据均衡（按场景类型、速度、天气分层采样），避免模型只会“直行跟随”。</p></li>
            <li><h3>偏好对齐 / 闭环微调</h3><p>用人类偏好（安全、舒适、合规的排序）或闭环仿真奖励做 DPO/RL 微调，把“像人”推向“更安全更舒适”。这一步最容易引入分布偏移，必须配合回归集。</p></li>
          </ol>
        </div>
        <div class='panel tip'><span class='pt'>四个实用技巧</span><p>① 历史降采样：远的历史用低帧率、近的历史用高帧率，token 省一半而信息损失很小；② 指令增强：把导航意图、限速、天气转成文本描述，能让同一模型适应不同 ODD；③ 反事实增强：用仿真/世界模型生成“同一场景不同自车动作”的样本（见第 5 章）；④ 恢复数据：专门采集/构造“偏离后如何纠回”的样本，缓解 compounding error（4.3 节）。</p></div>
      </section>

      <section class='sec scroll-target' id='deploy'>
        <div class='sec-head'><span class='no'>4.13</span><h2>车端部署与推理优化：把大模型塞进几十毫秒</h2></div>
        <p>4.5 节给了部署链路，这一节给出可执行的优化清单与延迟预算方法。</p>
        <h3>延迟预算：先分解，再优化</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>环节</th><th>典型耗时</th><th>优化手段</th></tr></thead>
            <tbody>
              <tr><td>图像预处理（去畸变、缩放、归一化）</td><td>2–10 ms</td><td>GPU 上做、融合算子、固定输入尺寸</td></tr>
              <tr><td>视觉编码器（ViT/CNN）</td><td>10–40 ms</td><td>降分辨率、KV 共享、通道剪枝、INT8 量化</td></tr>
              <tr><td>LLM 解码（自回归）</td><td>每 token 2–10 ms</td><td>减少输出 token 数（整条轨迹一个 token）、批处理、投机解码</td></tr>
              <tr><td>扩散/流匹配采样</td><td>K 步 × 每步代价</td><td>减少步数、蒸馏（少步学生模型）、DDIM/一致性模型</td></tr>
              <tr><td>后处理与安全校验</td><td>1–5 ms</td><td>与模型推理并行，安全层独立于网络</td></tr>
            </tbody>
          </table>
        </div>
        <div class='math math-left'>端到端延迟 ≈ 预处理 + 编码器 + (输出 token 数 × 每 token 解码) + 采样 + 校验<br>例：10 + 25 + (1 × 4) + 0 + 3 ≈ 42 ms → 约 20 Hz，满足规划频率下限</div>
        <h3>六项落地技术</h3>
        <div class='grid g3'>
          <div class='card reveal'><h3>⚙️ 量化</h3><p>FP16 几乎无损；INT8 需校准（注意 LayerNorm、softmax 敏感层保留高精度）；INT4 只在部分权重上可行。</p></div>
          <div class='card reveal'><h3>🧩 图优化与算子融合</h3><p>导出 ONNX/TensorRT，融合 LayerNorm+GELU、注意力算子，减少显存往返。</p></div>
          <div class='card reveal'><h3>💾 KV Cache 管理</h3><p>长上下文时缓存是带宽瓶颈；可做量化缓存或按注意力重要性淘汰。</p></div>
          <div class='card reveal'><h3>🔀 并行与流水线</h3><p>感知网络与大模型分卡/分流并行；安全校验与轨迹后处理并行执行。</p></div>
          <div class='card reveal'><h3>⏱️ 时间片调度</h3><p>大模型低频（如 2–5 Hz）输出意图/轨迹骨架，控制层高频跟踪并在两帧间插值。</p></div>
          <div class='card reveal'><h3>🛡️ 降级策略</h3><p>推理超时或输出越界时，立即切回规则/优化规划器，保证“慢但安全”。</p></div>
        </div>
        <div class='panel warn'><span class='pt'>上线前必做的三项验证</span><p>① 最坏情况延迟（含缓存未命中、并发负载）而不是平均延迟；② 数值一致性：量化前后在离线数据集上的输出差异分布（不能只看均值）；③ 失效模式测试：输入退化（过曝、遮挡、脏污）时模型是否输出荒谬轨迹，以及安全层能否拦住。</p></div>
      </section>
      <section class='sec scroll-target' id='eval2'>
        <div class='sec-head'><span class='no'>4.14</span><h2>开环与闭环评测实操：怎么判断“会不会开车”</h2></div>
        <p>4.7 节讲了指标定义，这一节给出评测流程与常见坑。核心原则：<b>开环指标用于快速迭代，闭环指标用于准入判断，两者都不能单独作为安全证据。</b></p>
        <h3>开环评测：快、但有系统性偏差</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>指标</th><th>定义</th><th>能说明什么</th><th>不能说明什么</th></tr></thead>
            <tbody>
              <tr><td>L2 位移误差</td><td>预测轨迹与真值轨迹的逐点距离</td><td>轨迹回归的平均精度</td><td>多模态是否正确、是否安全</td></tr>
              <tr><td>minADE / minFDE</td><td>K 条候选中最好的那条的平均/终点误差（2.11 节）</td><td>模型是否生成了接近真值的选项</td><td>概率分配是否合理</td></tr>
              <tr><td>碰撞率（离线）</td><td>预测轨迹与真值障碍框的相交比例</td><td>安全趋势的相对比较</td><td>真实交互下的安全性（真值轨迹≠唯一安全解）</td></tr>
              <tr><td>舒适度</td><td>jerk、加速度、曲率极值分布</td><td>乘坐体验</td><td>是否让行、是否合规</td></tr>
            </tbody>
          </table>
        </div>
        <div class='panel warn'><span class='pt'>开环的致命问题</span><p>开环用真值历史作为输入，模型永远处在“训练分布内”，误差不会累积——这与实车完全不同。因此开环指标好但闭环崩溃的例子非常常见。任何模型上线前必须有闭环评测，哪怕是在简化仿真里。</p></div>
        <h3>闭环评测流水线</h3>
        <div class='codeblock'>1) 选基准与场景集
   - 快速迭代：NAVSIM（非反应式伪仿真，成本低、可复现）
   - 中等成本：nuPlan（反应式仿真，交通参与者会响应自车）
   - 高保真：CARLA Leaderboard / Bench2Drive（传感器级 + 完整交通）
2) 统一输入输出契约：传感器格式、地图、控制接口、评测频率
3) 批量运行：每场景多随机种子（至少 3 次），记录完整日志
4) 指标分层统计：按场景类型（无保护左转、环岛、施工、加塞）、
   按 ODD（白天/夜间/雨）、按速度区间分别统计
5) 失败分类：碰撞（车/人/静态物）、违规（压线/闯灯/逆行）、
   迟滞（该走不走）、过激（激进抢行）
6) 与基线对比：至少与“规则规划器”和“上一版本模型”各比一次</div>
        <h3>把指标翻译成结论</h3>
        <div class='tbl-wrap'>
          <table>
            <thead><tr><th>现象</th><th>可能原因</th><th>下一步</th></tr></thead>
            <tbody>
              <tr><td>开环好、闭环差</td><td>模型未学过纠错（compounding error），或对交互不敏感</td><td>加恢复数据/DAgger、用反应式仿真重训</td></tr>
              <tr><td>闭环“保守到不动”</td><td>安全惩罚过重或不确定性估计过大</td><td>调整代价权重，检查不确定度标定</td></tr>
              <tr><td>少数场景反复失败</td><td>场景族覆盖不足（如无保护左转）</td><td>定向采集 + 世界模型生成该场景变体</td></tr>
              <tr><td>指标忽高忽低</td><td>随机种子敏感、评测场景过少</td><td>增加种子与场景数，报告置信区间</td></tr>
            </tbody>
          </table>
        </div>
        <div class='panel info'><span class='pt'>安全论证的边界</span><p>即使闭环分数很高，也只能说明“在被测场景集里表现良好”，不能证明安全。安全论证需要场景覆盖度分析（SOTIF）、独立安全层验证与运行监控共同支撑（见第 3 章 3.15 节）。</p></div>
      </section>

      <section class='sec scroll-target' id='res'>
        <div class='sec-head'><span class='no'>4.15</span><h2>学习资源地图</h2></div>
        <div class='paper'><h4>综述与入门</h4><p><a href='https://arxiv.org/abs/2307.04370'>端到端自动驾驶进展综述</a> 与 <a href='https://arxiv.org/abs/2306.16927'>End-to-end Autonomous Driving: Challenges and Frontiers</a>（先建立全貌）；<a href='https://github.com/OpenDriveLab/End-to-end-Autonomous-Driving'>End-to-end-Autonomous-Driving 资源库</a>（持续更新的论文与代码索引）。</p></div>
        <div class='paper'><h4>开源模型与代码</h4><p>端到端：<a href='https://github.com/OpenDriveLab/UniAD'>UniAD</a>、<a href='https://github.com/hustvl/VAD'>VAD</a>、<a href='https://github.com/swc-17/SparseDrive'>SparseDrive</a>、<a href='https://github.com/autonomousvision/transfuser'>TransFuser</a>、<a href='https://github.com/hustvl/DiffusionDrive'>DiffusionDrive</a>；VLA：<a href='https://github.com/openvla/openvla'>OpenVLA</a>、<a href='https://github.com/Physical-Intelligence/openpi'>openpi（π0）</a>，中文动手教程见 <a href='https://github.com/datawhalechina/every-embodied'>动手学具身智能</a>。</p></div>
        <div class='paper'><h4>语言与推理</h4><p><a href='https://github.com/Tsinghua-MARS-Lab/DriveVLM'>DriveVLM</a>（视觉语言模型做驾驶推理）、<a href='https://github.com/OpenDriveLab/DriveLM'>DriveLM</a>（图结构问答数据集与基线）；扩散策略入门看 <a href='https://diffusion-policy.cs.columbia.edu/'>Diffusion Policy 官方项目页</a>。</p></div>
        <div class='paper'><h4>评测与基准</h4><p><a href='https://github.com/Thinklab-SJTU/Bench2Drive'>Bench2Drive</a>（CARLA 闭环端到端评测）、<a href='https://github.com/autonomousvision/navsim'>NAVSIM</a>（低成本规划评测）、<a href='https://leaderboard.carla.org/'>CARLA Leaderboard</a>；<a href='https://zh.d2l.ai/'>动手学深度学习</a> 用于补 Transformer 与扩散模型基础。</p></div>
        <div class='panel info'><span class='pt'>延伸</span><p>完整清单见 <a href='resources.html'>教程资源库</a>；下一章的世界模型正是“用生成模型补数据、做规划预演”的自然延伸。</p></div>
      </section>

      <section class='sec scroll-target' id='quiz'>
        <div class='sec-head'><span class='no'>4.17</span><h2>自测题</h2></div>
        <div class='faq'>
          <details><summary>Q6：因果掩码在驾驶模型里为什么不能随便去掉？</summary><p>去掉后模型在预测第 i 个动作时会“看到”未来的真值动作，训练指标虚高，但自回归推理时拿不到未来信息，部署后性能骤降。掩码保证训练与推理一致。</p></details>
          <details><summary>Q7：为什么视觉 token 数是端到端模型的核心约束？</summary><p>注意力代价随序列长度平方增长。4 秒环视视频按 patch 展开可达 10⁵ 量级 token，直接全量注意力在车端算力下不可行，必须做时空降采样、token 压缩或稀疏注意力。</p></details>
          <details><summary>Q8：整条轨迹聚类成 token 有什么代价？</summary><p>词表粒度决定精度上限：K 太小时相邻轨迹被压到同一 token，输出“不够准”；K 太大则分类头变大、罕见 token 训练不足。工程上常配合“token 粗选 + 回归细化”两段式。</p></details>
          <details><summary>Q9：量化到 INT8 时最该警惕什么？</summary><p>敏感层（LayerNorm、softmax、注意力分数）与激活分布尾部。做法是逐层校准、对这些层保留 FP16，并用离线数据集比较量化前后的输出差异分布，而不只是平均误差。</p></details>
          <details><summary>Q10：闭环分数很高，能作为安全证据吗？</summary><p>不能。闭环只说明在被测场景集上表现良好；安全论证还需要场景覆盖度分析（SOTIF）、独立安全层的验证、失效模式测试与运行监控，构成完整的安全案例。</p></details>
        </div>
        <div class='faq'>
          <details><summary>Q1：为什么“把轨迹写成文本 token”能让 LLM 学会开车？</summary><p>轨迹 token 与文本 token 共用同一序列和同一套自回归机制：模型按“上一时刻上下文预测下一个 token”的同一原则预测下一个动作 token；语言预训练带来的常识与多模态理解也被迁移进来。</p></details>
          <details><summary>Q2：行为克隆的误差累积为什么必然发生？</summary><p>策略输出的任何小偏差都会改变后续状态；训练分布里没有这些偏差状态，模型在这些新状态上没有“纠错示范”可学，误差逐帧叠加。DAgger 用在线纠正样本填补这些状态。</p></details>
          <details><summary>Q3：minADE_K 为什么取“K 条里最好的一条”？它的缺点是什么？</summary><p>它衡量“模型是否生成了至少一条接近真值的轨迹”，忽略了概率分配——模型可能把概率全压在错误轨迹上。因此还要看 miss rate、预测概率与真值的一致性。</p></details>
          <details><summary>Q4：VLA 输出前为什么要过独立的几何校验层？</summary><p>因为轨迹损失低只说明“像训练数据”，不保证“物理可行、几何无碰撞、合法”；安全层用占用栅格与动力学约束做形式化校验，防止模型幻觉与分布外失效传导到执行器。</p></details>
          <details><summary>Q5：为什么把动作离散成 token 有时比直接回归连续值更好？</summary><p>① 离散化天然支持多模态（不同轨迹簇对应不同 token），避免“平均到两难中间”；② 与语言模型的自回归训练无缝一致；③ 便于做分类损失校准不确定性。代价是精度受词表粒度限制，需足够密的词表或分层细化。</p></details>
        </div>
      </section>

      <nav class='chapter-nav' aria-label='讲义翻页'>
      <a class='chapter-link prev' href='04-loc-sim-test.html'>
        <span class='chapter-dir'>← 上一讲</span>
        <b>第 3 章 · 定位·仿真·测试</b>
      </a>
      <a class='chapter-link map' href='index.html'>
        <b>课程地图</b>
      </a>
      <a class='chapter-link next' href='06-worldmodel.html'>
        <span class='chapter-dir'>下一讲 →</span>
        <b>第 5 章 · 世界模型</b>
      </a>
      </nav>
