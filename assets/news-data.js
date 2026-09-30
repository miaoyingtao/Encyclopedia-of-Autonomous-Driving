/**
 * 领域动态 · 数据源（可自动生成，也可手工维护）
 * --------------------------------------------------------------
 * 本文件通常由 tools/news_fetcher.py 自动重写：每次运行把本次抓取结果整段
 * 写入并替换旧自动条目，只按日期保留最新 N 条（默认 30，见 maxTotal），
 * 更旧的直接删除；链接与同一天相似标题自动去重，避免重复动态。
 * 手工新增：在数组中追加一个对象，字段含 date/title/summary/link/source/category/tags。
 * 自动更新：python tools/news_fetcher.py  （配置见 tools/news_sources.json）
 * 页面每次打开都会读取本文件渲染，改完保存刷新即生效。
 */

window.NEWS_DATA = [
  {
    "date": "2026-09-29",
    "title": "详解英伟达VLA自动驾驶模型Alpamayo架构和训练方法",
    "summary": "今年，英伟达 Alpamayo Summit 的第二场分论坛，讲的是整个开放生态的核心——推理模型本身。主讲人 Yurong You 是英伟达自动驾驶研究组的高级研究科学家，Alpamayo 模型的主要作者之一。这次演讲他分享了英伟达Alpamayo……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca548e0d9429391346ed557144aa8&url=https%3a%2f%2fview.inews.qq.com%2fa%2f20260930A000DM00&c=17867179842109963208&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "技术与研究",
    "tags": [
      "VLA"
    ],
    "_gen": {
      "id": "69cb84bcefd2",
      "feed": "必应资讯·世界模型与大模型",
      "query": "自动驾驶 大模型 VLA"
    },
    "featured": true
  },
  {
    "date": "2026-09-29",
    "title": "特斯拉获300亿美元新信贷额度，全面加速Cybercab无人出租车与Optimus量产",
    "summary": "特斯拉 宣布已敲定总额达300亿美元的新增信贷额度，重点用于支持Cybercab无人驾驶出租车（Robotaxi）、Optimus人形机器人以及Tesla Semi卡车的规模化研发与量产建设……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca55b69a84fc18d261906bbc7d48e&url=https%3a%2f%2fwww.chinaz.com%2fainews%2f31422.shtml&c=8054330365939915070&mkt=zh-hk",
    "source": "chinaz.com",
    "category": "出行运营",
    "tags": [
      "量产",
      "无人出租"
    ],
    "_gen": {
      "id": "b12391929598",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    },
    "featured": true
  },
  {
    "date": "2026-09-29",
    "title": "特斯拉Cybercab正式下线运营：无方向盘无人出租车每公里仅0.8元 ...",
    "summary": "Cybercab下线事件标志着无人驾驶出租车从概念正式迈入商业化运营。2025年9月，特斯拉在美国奥斯汀街头全面投放了这款没有方向盘、刹车踏板和后视镜的Robotaxi，每公里出行成本仅0.8元人民币，仅为传统网约车平均水平的十分之一。这意味着你花一杯奶茶的钱，就能完成一次点对点通勤——而且全程无需……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca55b69a84fc18d261906bbc7d48e&url=https%3a%2f%2f3g.china.com%2fact%2fnews%2f10000169%2f20260930%2f49772664.html&c=5028525715141449221&mkt=zh-hk",
    "source": "3g.china.com",
    "category": "出行运营",
    "tags": [
      "无人出租",
      "运营"
    ],
    "_gen": {
      "id": "37ba65aab094",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-29",
    "title": "余承东：智界RX是鸿蒙智行30万级唯一L3级自动驾驶架构车型",
    "summary": "9月28日，鸿蒙智行智界RX及新品发布会举行。华为常务董事、产品投资评审委员会主任、终端BG董事长余承东出席并发言。会上，余承东宣布鸿蒙智行将强化尊界、享界、智界、尚界“四界”布局，并发布智界RX、新款智界R7及享界V8三款产品。余承东在发言中这样表述：“智界RX是鸿蒙智行30万级唯一搭载L3级自动……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca53bf0a2415bb3f14b8bae10afca&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260929A09OCF00&c=5831065056422478617&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "量产车型",
    "tags": [
      "车型"
    ],
    "_gen": {
      "id": "529ae91009a2",
      "feed": "必应资讯·自动驾驶综合",
      "query": "智能驾驶 量产 车型"
    }
  },
  {
    "date": "2026-09-29",
    "title": "余承东谈l3自动驾驶架构设计",
    "summary": "9月28日鸿蒙智行发布会上，余承东首次系统阐释了L3自动驾驶的设计哲学——它不是硬件堆砌，而是一套覆盖八大关键节点的全链路冗余架构。 一、从L2到L3：安全逻辑的代际切换 责任主体转移：L2辅助驾驶始终以人为主导，系统遇到特殊情况会立即退出；而L3激活后，系统承担动态驾驶任务，人只需在必要时接管……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca550e26f448baf5b54dc532c29d6&url=https%3a%2f%2fcj.sina.com.cn%2farticles%2fview%2f7879996684%2f1d5af350c06801p1ao&c=13031386758170749804&mkt=zh-hk",
    "source": "新浪网",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "3426806b099c",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-09-29",
    "title": "世界模型公司推荐指南：四类玩家的技术路径与场景适配",
    "summary": "世界模型赛道正处于从技术研发向产业落地的关键阶段。当前赛道参与者类型多元，技术路线与落地方向各有侧重。对于寻求技术合作、方案落地的产业方而言，快速甄别不同企业的能力边界与场景适配性，是降低选型成本、提升合作效率的核心前提。本次深度梳理严格依托企业官方披露的技术成果、落地案例与行业公开认证信息，以核心……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca540fa054a60b5d487069c682735&url=https%3a%2f%2fnews.zol.com.cn%2f1254%2f12549163.html&c=18293770616844322092&mkt=zh-hk",
    "source": "zol.com.cn",
    "category": "技术与研究",
    "tags": [
      "世界模型"
    ],
    "_gen": {
      "id": "00785f07205b",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    },
    "featured": true
  },
  {
    "date": "2026-09-29",
    "title": "QNX与智驾新程neueHCT携手加速全球智能驾驶部署，并获德系主流车企 ...",
    "summary": "BlackBerry有限公司（纽约证券交易所代码：BB；多伦多证券交易所代码：BB）旗下业务部门QNX与由地平线与欧摩威集团（AUMOVIO）合资成立的智能驾驶公司智驾新程neueHCT近日宣布，搭载QNX技术的智驾新程HCT……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca53bf0a2415bb3f14b8bae10afca&url=https%3a%2f%2ffinance.sina.com.cn%2ftech%2froll%2f2026-09-30%2fdoc-initnsei2948000.shtml&c=5501908477138681313&mkt=zh-hk",
    "source": "新浪网",
    "category": "量产车型",
    "tags": [],
    "_gen": {
      "id": "72630c62282d",
      "feed": "必应资讯·自动驾驶综合",
      "query": "智能驾驶 量产 车型"
    }
  },
  {
    "date": "2026-09-29",
    "title": "L3级自动驾驶准入周期开启 强制性国标将于2027年7月1日实施",
    "summary": "【导语】随着首批L3级有条件自动驾驶车型准入许可发放、强制性国家标准获批发布，我国自动驾驶正从技术验证进入准入管理阶段。强制性国标《智能网联汽车自动驾驶系统安全要求》（GB……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca550e26f448baf5b54dc532c29d6&url=https%3a%2f%2fwww.sohu.com%2fa%2f1082293131_122957505&c=12318488059956405219&mkt=zh-hk",
    "source": "搜狐",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "9ec1bcb54553",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-09-28",
    "title": "“稳步迈进自动驾驶新时代”为主题，2026世界智能网联汽车大会定档 ...",
    "summary": "9月28日，2026世界智能网联汽车大会新闻发布会在北京召开。工业和信息化部装备工业一司副司长郝立顺，交通运输部科技司副司长翁优灵，北京市经济和信息化局副局长苏国斌，工业和信息化部装备工业发展中心主任、世界智能网联汽车大会组委会秘书长瞿国春，北京经济技术开发区管委会副主任、北京市智慧城市基础设施与智……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca53495b143e88baf533a33eb7387&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260929A0168V00&c=3384287118930717839&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "政策与准入",
    "tags": [
      "智能网联汽车"
    ],
    "_gen": {
      "id": "022efcd8e32a",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-09-28",
    "title": "L3准入周期开启，智界RX的L3硬件预埋逻辑",
    "summary": "L3正从PPT走向现实。在重庆内环快速路，你可能会看到挂着“渝AD0001Z”的L3级自动驾驶汽车已经开始在限定路段行驶。政策端，2026年7月30日，工信部组织制定的国内首部针对L3级、L4级自动驾驶系统的强制性国家标准《智能网联汽车自动驾驶系统安全要求》（GB44721—2026）已获准发布，2……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca550e26f448baf5b54dc532c29d6&url=https%3a%2f%2fm.163.com%2fnews%2farticle%2fL7UK22VS05199NPP.html&c=758592029276280986&mkt=zh-hk",
    "source": "网易新闻",
    "category": "政策与准入",
    "tags": [
      "L3 准入",
      "L3准入"
    ],
    "_gen": {
      "id": "21516497ae64",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    },
    "featured": true
  },
  {
    "date": "2026-09-28",
    "title": "2026世界模型赛道优质企业盘点：聚焦具身大脑与端侧世界模型产业化 ...",
    "summary": "星源智成立于2025年8月1日，由北京智源人工智能研究院深度孵化，是国内专注具身大脑赛道、深耕端侧具身世界模型的核心科创企业。企业成立初期入选2025世界机器人大会中国最具成长潜力机器人公司TOP50榜单，现阶段为Pre-A轮融资，累计融资突破10亿元人民币，获得高瓴、中科 创星 ...",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca540fa054a60b5d487069c682735&url=https%3a%2f%2fnews.zol.com.cn%2f1254%2f12546713.html&c=2427584902553493619&mkt=zh-hk",
    "source": "zol.com.cn",
    "category": "技术与研究",
    "tags": [
      "世界模型"
    ],
    "_gen": {
      "id": "36b11adef747",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    },
    "featured": true
  },
  {
    "date": "2026-09-27",
    "title": "从自动驾驶到具身智能，一套基础模型真的能通吃吗？",
    "summary": "现在很多企业探索让自动驾驶和具身智能使用相似的基础模型。 小鹏已经将VLA 2.0、Robotaxi和人形机器人纳入Physical AI布局，并提出以物理世界基础模型支撑不同智能载体。 学术界也有研究让同一个模型跨越车辆、轮式机器人、无人机等不同载体完成导航任务……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca540fa054a60b5d487069c682735&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260927A0426000&c=14973806596430381174&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "技术与研究",
    "tags": [
      "具身智能"
    ],
    "_gen": {
      "id": "26a87bdd1c89",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    },
    "featured": true
  },
  {
    "date": "2026-09-26",
    "title": "端到端走到今天，边缘场景还是自动驾驶跨不过的那道坎吗？",
    "summary": "端到端被公认为实现L3级自动驾驶的最优路径，在端到端刚出来的时候，自动驾驶行业很多人都认为这一技术是实现 L3甚至L4自动驾驶最有可能的路径。但其黑箱特性使其在面对边缘场景时只能猜。面对施工路段、侧翻车辆等极端情况时，这个短板足以致命。端到端技术发展到现在，也延伸出了 ...",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca548e0d9429391346ed557144aa8&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260926A0350Y00&c=16794121364280385072&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "技术与研究",
    "tags": [
      "端到端"
    ],
    "_gen": {
      "id": "aa76b8c57ebb",
      "feed": "必应资讯·世界模型与大模型",
      "query": "自动驾驶 大模型 VLA"
    },
    "featured": true
  },
  {
    "date": "2026-09-26",
    "title": "Cybercab两座省成本 Robotaxi赛道开始算运营账",
    "summary": "文｜定焦One 金玙璠 编辑 | 魏佳 9月初，特斯拉Cybercab已经在美国奥斯汀开始收费载客。 截至9月3日，特斯拉在得州登记了420辆自动驾驶车辆，其中Cybercab有45辆，其余主要是Model Y。Cybercab目前还只在奥斯汀部分区域运营，规模不大……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca55b69a84fc18d261906bbc7d48e&url=https%3a%2f%2fmolihua.org%2fmh-2363968%2f&c=6978696285285919758&mkt=zh-hk",
    "source": "molihua.org",
    "category": "出行运营",
    "tags": [
      "OTA",
      "Robotaxi",
      "RoboTaxi",
      "运营"
    ],
    "_gen": {
      "id": "dc82a05eceb1",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    },
    "featured": true
  },
  {
    "date": "2026-09-25",
    "title": "为什么中国和美国走在无人驾驶前列？",
    "summary": "【为什么中国和美国走在无人驾驶前列？】想象一下，你叫来一辆网约车，打开车门，却发现驾驶座上空无一人。别慌，你可能坐上了一辆Robotaxi（无人驾驶出租车）。目前，中国已有十多个城市提供Robotaxi服务。美国特斯拉也于今年9月在得克萨斯州奥斯汀开始使用Cybercab提供有限的Robotaxi服……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca55b69a84fc18d261906bbc7d48e&url=https%3a%2f%2ffinance.sina.com.cn%2fjjxw%2f2026-09-25%2fdoc-iniszvzy9435795.shtml&c=6511551565882103336&mkt=zh-hk",
    "source": "新浪网",
    "category": "出行运营",
    "tags": [],
    "_gen": {
      "id": "aa78fcb18a3e",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-24",
    "title": "朱华荣倡议L3级以上自动驾驶准入互认：一次认证全球通行有多难？3 ...",
    "summary": "长安汽车董事长朱华荣在2026世界新能源汽车大会上提出L3级以上自动驾驶准入互认倡议，基于联合国ADS……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca550e26f448baf5b54dc532c29d6&url=https%3a%2f%2fauto.sina.cn%2f2026-09-24%2fdetail-iniswrrf5454875.d.html%3fvt%3d4&c=11578267561413216100&mkt=zh-hk",
    "source": "新浪网",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "9cfea3272ff6",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-09-23",
    "title": "梅赛德斯-奔驰携手Wayve：未来两年将实现AI自动驾驶量产，豪华车 ...",
    "summary": "梅赛德斯-奔驰（Mercedes-Benz）近日宣布与英国初创公司Wayve达成正式量产协议，计划在未来两年内将其前沿的“AIDriver”人工智能驾驶系统集成到新一代奔驰车型中。这一举措标志着Wayve的AI技术首次进军豪华车市场，双方的合作关系也因此得以进一步深化，奔驰早些时候已参与了Wayve……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca53bf0a2415bb3f14b8bae10afca&url=https%3a%2f%2fwww.sohu.com%2fa%2f1080113777_122066676&c=16932724238511753201&mkt=zh-hk",
    "source": "搜狐",
    "category": "量产车型",
    "tags": [
      "量产",
      "AI"
    ],
    "_gen": {
      "id": "05ec20c08f2d",
      "feed": "必应资讯·自动驾驶综合",
      "query": "智能驾驶 量产 车型"
    }
  },
  {
    "date": "2026-09-23",
    "title": "Mobileye Drive™ 推动德国自动驾驶出行升级",
    "summary": "德国联邦车辆运输管理局（KBA）的数据证实，持有有效 L4 级测试许可的车辆中，超过60% 搭载 Mobileye Drive™。 德国大多数持有有效 L4 级自动驾驶测试许可的车辆，均搭载 Mobileye Drive™系统。 德国已然跻身全球自动驾驶汽车创新的首选市场，Mobileye……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca53495b143e88baf533a33eb7387&url=https%3a%2f%2fwww.eeworld.com.cn%2fqcdz%2feic737318.html&c=6861760374367083795&mkt=zh-hk",
    "source": "eeworld.com.cn",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "8e6b7cbb6204",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-09-22",
    "title": "前特斯拉、英伟达高管执掌现代汽车自动驾驶业务 剑指2029年量产",
    "summary": "智通财经APP获悉，今年早些时候，曾在英伟达(NVDA.US)和特斯拉(TSLA.US)从事自动驾驶技术研发与商业化工作的Minwoo……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca53495b143e88baf533a33eb7387&url=https%3a%2f%2fview.inews.qq.com%2fa%2f20260922A02QIZ00&c=10727502460140579875&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "量产车型",
    "tags": [
      "量产"
    ],
    "_gen": {
      "id": "0f174f04e51f",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-09-21",
    "title": "现代汽车为Waymo造车：寄望无人驾驶出租车抵消电动车需求放缓冲击",
    "summary": "智通财经APP获悉，现代汽车正将自动驾驶出租车运营商视为其电动车的一个重要新需求来源，计划为 Alphabet(GOOGL.US)旗下的 Waymo制造“数以万计”的 Ioniq 5 Robotaxi。现代汽车首席执行官何塞·穆尼奥斯(José……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca564499040f6b343e36000854528&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260921A02PBV00&c=1554135268040016309&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "出行运营",
    "tags": [
      "Waymo"
    ],
    "_gen": {
      "id": "c4e8cfcf28e7",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "自动驾驶出租车 运营"
    }
  },
  {
    "date": "2026-09-21",
    "title": "开环闭环双榜夺魁 千里智驾 WA-JEPA 重塑自动驾驶世界模型范式",
    "summary": "近日，千里智驾联合电子科技大学、东南大学、北京邮电大学、天津大学发布并开源世界—动作模型WA-JEPA，为自动驾驶模型如何理解场景、预测未来并生成驾驶动作，探索了一条新的技术路径……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca540fa054a60b5d487069c682735&url=https%3a%2f%2fwww.sohu.com%2fa%2f1079016169_322372&c=6189237276933198019&mkt=zh-hk",
    "source": "搜狐",
    "category": "技术与研究",
    "tags": [
      "世界模型"
    ],
    "_gen": {
      "id": "0b5689578cf6",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    }
  },
  {
    "date": "2026-09-20",
    "title": "何小鹏称2026年可实现自动驾驶？跳过L3直入L4，这3个证据让质疑闭嘴+FAQ",
    "summary": "何小鹏断言2026年将直接从L2跃迁至L4全自动驾驶，跳过L3。本文基于特斯拉FSD V14.2实测、小鹏VLA2.0架构、Robotaxi量产下线、第二代VLA大模型升级等核心事实，分三个维度论证这一判断的可信度，并针对不同用户给出购车/使用建议。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca548e0d9429391346ed557144aa8&url=https%3a%2f%2fauto.sina.cn%2f2026-09-20%2fdetail-inisktzu7293351.d.html%3fvt%3d4&c=3200185483393397114&mkt=zh-hk",
    "source": "新浪网",
    "category": "出行运营",
    "tags": [],
    "_gen": {
      "id": "366218d966c0",
      "feed": "必应资讯·世界模型与大模型",
      "query": "自动驾驶 大模型 VLA"
    }
  },
  {
    "date": "2026-09-18",
    "title": "特斯拉Cybercab带火Robotaxi赛道 无人出行商业化拐点渐近",
    "summary": "无方向盘、无制动踏板的特斯拉Cybercab开启中国巡展，再度将全球Robotaxi赛道的讨论推向新高潮。业内专家认为，无人驾驶出租车所代表的无人出行业态，后续落地推广节奏有望提速，并将带动产业链上下游共同受益。放眼国内，车企与自动驾驶企业正加紧布局Robotaxi赛道，持续拓展商业化落地版图。多位……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca55b69a84fc18d261906bbc7d48e&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260918A02CS500&c=15780741028984926396&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "出行运营",
    "tags": [
      "OTA",
      "Robotaxi",
      "RoboTaxi"
    ],
    "_gen": {
      "id": "8520e2da64c7",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-18",
    "title": "L3自动驾驶最新视频背后：法律定责、国标落地、首批车型上路，2027 ...",
    "summary": "2026年8月，L3自动驾驶迎来历史性转折——道路交通安全法修订草案首次明确“激活状态违法由车企担责”，强制国标GB 44721-2026同步发布，首批长安深蓝SL03、极狐阿尔法S5获准入试点。本文从法律破冰、安全标准、商业落地三个维度拆解，告诉你L3何时能用、怎么用、出了事谁负责。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca556711a48cd8c59d214be5dc0e6&url=https%3a%2f%2fauto.sina.cn%2f2026-09-18%2fdetail-inisfiik8631095.d.html%3fvt%3d4&c=8265245859278041711&mkt=zh-hk",
    "source": "新浪网",
    "category": "政策与准入",
    "tags": [
      "车型"
    ],
    "_gen": {
      "id": "09229055af6b",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 级自动驾驶 上路试点"
    }
  },
  {
    "date": "2026-09-18",
    "title": "L3自动驾驶可以上路了吗？首批车型已获准，但只限这两座城+FAQ",
    "summary": "2025年12月，长安深蓝SL03和极狐阿尔法S成为全国首批获L3准入的车型，在北京、重庆指定高速/快速路试点。但普通车主暂无法购买使用，需等2026年国家法规正式落地。本文从商业化进展、真实体验门槛、法律责任划分三个维度拆解，并给出分人群购买建议。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca556711a48cd8c59d214be5dc0e6&url=https%3a%2f%2fk.sina.com.cn%2farticle_7879996685_1d5af350d06802h388.html&c=5198060731859301068&mkt=zh-hk",
    "source": "新浪网",
    "category": "政策与准入",
    "tags": [
      "车型"
    ],
    "_gen": {
      "id": "50c2e763495d",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 级自动驾驶 上路试点"
    }
  },
  {
    "date": "2026-09-17",
    "title": "自动驾驶出事车企先举证！道路交通安全法修订草案设专章，9月25日 ...",
    "summary": "2026年8月25日，《中华人民共和国道路交通安全法（修订草案）》提请十四届全国人大常委会第二十四次会议初次审议。这是该法自2004年施行以来首次系统性修订，新增\"自动驾驶汽车的特别规定\"专章共9条（第95条至第103条），对自动驾驶与辅助驾驶的法律边界、激活状态下的违法处理、事故责任调查、交强险制……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca53495b143e88baf533a33eb7387&url=https%3a%2f%2ffinance.sina.com.cn%2froll%2f2026-09-17%2fdoc-inisayam0335568.shtml&c=2185978620939115109&mkt=zh-hk",
    "source": "新浪网",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "2839eb60e1d3",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-09-16",
    "title": "智界RX获批L3级自动驾驶道路测试牌照，全链路冗余架构把“未来价值 ...",
    "summary": "近日，智界RX正式获批L3级自动驾驶道路测试牌照。这意味着，其L3级自动驾驶架构不仅停留在设计层面，更进入公开道路验证阶段。对于一款面向主流价位市场的智能SUV而言，这张牌照的价值不止于“获准测试”，更在于它释放出一个清晰信号：L3正从豪华旗舰的专属标签，变成主流消费者可以提前锁定、长期受益的“未来……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca550e26f448baf5b54dc532c29d6&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260916A0D45400&c=9088470883626686057&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "83047b640b50",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-09-15",
    "title": "特斯拉无人出租车来华，国内Robotaxi已在接单",
    "summary": "特斯拉的无人驾驶出租车，要来中国了。但这次，它只负责站台，不负责接单……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca55b69a84fc18d261906bbc7d48e&url=https%3a%2f%2fwww.sohu.com%2fa%2f1076437793_120440806&c=18199155606231024137&mkt=zh-hk",
    "source": "搜狐",
    "category": "出行运营",
    "tags": [
      "OTA",
      "Robotaxi",
      "RoboTaxi",
      "无人出租"
    ],
    "_gen": {
      "id": "e7b65d9917d8",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-14",
    "title": "特斯拉无人出租车Robotaxi将搭载FSD V15，下月开始全天候运营",
    "summary": "IT之家 9 月 14 日消息，特斯拉目前在已落地市场开展的商业化网约车业务，都设有固定运营时段，但全天候无人驾驶服务很快就要到来。特斯拉 AI 业务高管表示，下一代 FSD 架构正式上线后，将最终实现 24 小时不间断载人运营。该消息由特斯拉 AI 副总裁阿肖克 · 埃卢斯瓦米（Ashok……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca55b69a84fc18d261906bbc7d48e&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260914A0924D00&c=8021867741281607470&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "出行运营",
    "tags": [
      "搭载",
      "OTA",
      "Robotaxi",
      "RoboTaxi"
    ],
    "_gen": {
      "id": "ee3468541bf0",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-14",
    "title": "中国自动驾驶科技公司获西班牙首张L4级自动驾驶乘用车运营牌照",
    "summary": "中新社广州9月10日电 (记者 蔡敏婕)中国自动驾驶科技公司文远知行10日发布消息称，该企业获得西班牙首张L4级自动驾驶乘用车运营牌照，获准在公共道路开展车辆部署，这标志着西班牙首次在国家层面为L4级Robotaxi(自动驾驶出租车)开放准入……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6abca564499040f6b343e36000854528&url=https%3a%2f%2ffinance.sina.com.cn%2froll%2f2026-09-10%2fdoc-inirveaq9288415.shtml&c=15975418122423512580&mkt=zh-hk",
    "source": "新浪网",
    "category": "出行运营",
    "tags": [
      "运营"
    ],
    "_gen": {
      "id": "c786de35a125",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "自动驾驶出租车 运营"
    }
  }
];

window.NEWS_META = {
  "updatedAt": "2026-09-30",
  "fetchedAt": "2026-09-30T14:00:06+08:00",
  "maxTotal": 30,
  "totalManual": 0,
  "totalAuto": 30,
  "total": 30,
  "removedOldAuto": 30,
  "removedByCap": 12,
  "removedDup": 2,
  "totalFeatured": 8,
  "removedFeaturedCap": 9,
  "sources": [
    [
      "必应资讯·自动驾驶综合",
      9
    ],
    [
      "必应资讯·自动驾驶综合",
      3
    ],
    [
      "必应资讯·世界模型与大模型",
      5
    ],
    [
      "必应资讯·世界模型与大模型",
      3
    ],
    [
      "必应资讯·L3与准入试点",
      9
    ],
    [
      "必应资讯·L3与准入试点",
      3
    ],
    [
      "必应资讯·Robotaxi与出行",
      9
    ],
    [
      "必应资讯·Robotaxi与出行",
      3
    ]
  ],
  "note": "每次运行只保留最新 30 条：本次抓取覆盖旧的自动条目；手工条目若排不进最新 30 条也会被移出。"
};
