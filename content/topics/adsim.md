---
id: "pages/adsim.html"
slug: "adsim"
title: "闭环仿真实验台 · 驶向未来百科"
description: "在浏览器里真实运行自动驾驶核心链路：射线感知、卡尔曼跟踪、CTRV 预测、有限状态机决策、Frenet 采样规划与 Pure Pursuit + PID 控制。"
accent: "accent-tech"
nav_active: "tech"
hero_kicker: "技术 · 动手实验"
hero_h1: "闭环仿真实验台"
hero_lead: "这不是动画演示：页面里加载的是一套真实的算法实现——激光射线求交、点云聚类、卡尔曼滤波与匈牙利数据关联、多模态预测、有限状态机、Frenet 采样规划、Pure Pursuit 与 PID——它们按 20 ms 时间步闭环运行，可暂停、可单步、可逐层观察中间结果。"
crumb: "首页|../index.html"
crumb: "技术全景|../pages/tech.html"
crumb: "闭环仿真实验台|"
layout: "full"
styles: ["assets/adsim/adsim.css"]
scripts: ["assets/adsim/core/math.js", "assets/adsim/core/world.js", "assets/adsim/core/perception.js", "assets/adsim/core/prediction.js", "assets/adsim/core/decision.js", "assets/adsim/core/planning.js", "assets/adsim/core/control.js", "assets/adsim/core/metrics.js", "assets/adsim/core/sim.js", "assets/adsim/scenarios.js", "assets/adsim/ui.js"]
---

<div class="panel info">
  <span class="pt">怎么读这个实验台</span>
  <p>左边是闭环的实时画面，右边是每个模块当步的真实输出（含实测耗时）。上方按钮可以播放/暂停、单步推进、切换场景与倍速；图层开关让你只看某一层的中间结果。每个面板右下角的“深入阅读”指向对应的正本页面。</p>
</div>

<div id="adsim-root"></div>

<div class="panel tip">
  <span class="pt">算法是真的，输入是仿真的</span>
  <p><b>真实的部分</b>：感知用射线与障碍物边界求交生成点云，再做距离聚类、卡尔曼滤波（匀速模型）与匈牙利算法数据关联；预测用 CTRV 推演多模态轨迹；决策是带迟滞的有限状态机；规划在 Frenet 系下采样 20 条候选轨迹，逐条做碰撞检查与多目标代价评估；控制是 Pure Pursuit（前视距离随车速自适应）加 PID（含抗积分饱和）；车辆是运动学自行车模型并带执行器一阶延迟。<b>仿真的部分</b>：世界（他车行为、施工围挡、行人横穿）由代码生成，不含真实数据集与感知神经网络；定位被简化为理想定位。因此它能验证“这条软件链路是否闭环、稳定、可复现”，而不是评估真实道路性能。</p>
</div>

<div class="panel info">
  <span class="pt">三个场景各自在考什么</span>
  <p><b>旁车切入</b>：左侧车辆并线到自车前方并减速，场景不启用变道，只能靠跟车与制动化解——考验跟踪收敛速度与纵向安全策略。<b>行人横穿</b>：行人从路侧横穿本车道，考验小尺寸目标的探测、横穿意图识别与停车让行。<b>施工区收窄</b>：施工围挡沿车道边界布置并侵入空间，考验静止障碍识别与车道内居中通行。</p>
</div>

<div class="panel tip">
  <span class="pt">怎么自己复现（不需要浏览器）</span>
  <p>核心栈与界面完全分离，<code>assets/adsim/core/</code> 下的六个模块都是纯 JavaScript，可直接用 Node 运行：<code>node assets/adsim/selftest.js</code> 会跑 65 条模块级与场景级断言并打印指标；<code>node assets/adsim/run.js</code> 会跑完三个场景并输出碰撞、TTC、加速度、jerk、里程与实时性能。随机种子固定，结果可复现。</p>
</div>
