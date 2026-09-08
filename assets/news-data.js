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
    "date": "2026-09-08",
    "title": "张一鸣正在亲自打造字节跳动的实时世界模型",
    "summary": "近日，据行业内部消息透露，字节跳动创始人张一鸣已亲自牵头组建核心研发团队，全力推进世界模型项目落地，预计最快下月正式对外推出。作为字节跳动布局AI大模型赛道的重磅级战略产品，该世界模型依托字节跳动多年积累的海量多元场景数据与顶尖技术研发实力，有望在多模态交互、现实场景智能模拟等核心维度实现技术突破……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74cd8bb42faa73f0c686a019c62&url=https%3a%2f%2feu.36kr.com%2fzh%2fp%2f3974146974701186&c=8331223494965863327&mkt=zh-hk",
    "source": "36氪",
    "category": "技术与研究",
    "tags": [
      "世界模型"
    ],
    "_gen": {
      "id": "6ca443b4934e",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    },
    "featured": true
  },
  {
    "date": "2026-09-07",
    "title": "特斯拉Robotaxi下月实现24小时运营，v15技术整合将补齐夜间服务短板",
    "summary": "目前特斯拉Robotaxi服务在美国已实现每周7天运营，运营时间为每天6时至22时，覆盖奥斯汀、达拉斯、休斯敦、迈阿密、奥兰多和坦帕等6座城市。截至今年7月，其Robotaxi车队已在美国两个州累计行驶超过38万英里。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2fauto.news18a.com%2fnews%2fstorys_294500.html&c=2256072505289627155&mkt=zh-hk",
    "source": "news18a.com",
    "category": "出行运营",
    "tags": [
      "OTA",
      "Robotaxi",
      "RoboTaxi",
      "运营"
    ],
    "_gen": {
      "id": "5db102c978d1",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    },
    "featured": true
  },
  {
    "date": "2026-09-07",
    "title": "特斯拉Cybercab无方向盘无人出租车现身奥斯汀街头",
    "summary": "没有方向盘的出租车，真的上路了 特斯拉 Cybercab 已经出现在美国奥斯汀街头：没有司机，没有方向盘，也没有油门和刹车踏板。有人说，这是交通行业的“iPhone 时刻”。但它能否真正改变出行，还要看安全、监管、成本和规模化能力。你敢坐进这样的无人出租车吗？#cybercab #特斯拉……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2fk.sina.com.cn%2farticle_7879996919_m1d5af35f7020027w7e.html&c=10171239880115571952&mkt=zh-hk",
    "source": "新浪网",
    "category": "出行运营",
    "tags": [
      "无人出租"
    ],
    "_gen": {
      "id": "28dfdb5d5f7e",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-07",
    "title": "世界模型赛道再添新赛题！第五届琶洲算法大赛×智能驾驶世界模型 ...",
    "summary": "当前，世界模型正成为自动驾驶领域技术演进的重要方向，依托对物理环境的理解与行为推演能力，为破解复杂非结构化场景感知、决策难题带来新思路。矿山重载车辆在雨雾扬尘环境下，依靠无人驾驶系统精准辨识周边交通参与者与障碍物，平稳通行无信号灯路口——这并非遥不可及的未来图景，而是第五届琶洲算法大赛面向全球开发者……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74cd8bb42faa73f0c686a019c62&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260907A0CH1100&c=17919120665035581422&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "技术与研究",
    "tags": [
      "世界模型",
      "算法"
    ],
    "_gen": {
      "id": "073e3ec01767",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    },
    "featured": true
  },
  {
    "date": "2026-09-07",
    "title": "“从校对到量产车”......塔塔大宇将L2+驾驶辅助系统应用于Maxsen和 ...",
    "summary": "塔塔大宇出行公司于7日宣布,将扩大与RideFlux的合作,在其重型卡车“Maxsen”和中型卡车“Gussen”上应用L2+级驾驶辅助系统。基于其在L4级自动驾驶卡车方面的现有经验,该公司也在为L4级全无人驾驶卡车的商业化奠定基础。3日,塔塔大宇出行在全罗北道群山市的总部与RideFlux签署了一……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74b5f8048e182577b96d2d447fa&url=https%3a%2f%2fwww.mk.co.kr%2fcn%2fbusiness%2f12145821&c=12095645829852931779&mkt=zh-hk",
    "source": "mk.co.kr",
    "category": "量产车型",
    "tags": [
      "量产"
    ],
    "_gen": {
      "id": "54a0e2d12354",
      "feed": "必应资讯·自动驾驶综合",
      "query": "智能驾驶 量产 车型"
    },
    "featured": true
  },
  {
    "date": "2026-09-06",
    "title": "特斯拉：预计将于下月实现 Robotaxi 自动驾驶无人出租车 24 小时全 ...",
    "summary": "IT之家 9 月 6 日消息，特斯拉 AI 负责人 Ashok Elluswamy 本周表示，特斯拉 Robotaxi 自动驾驶无人出租车距离“实现 24 小时全天候运营”已经不远。针对一名希望在深夜使用 Cybercab 出行的用户，他在 X 平台回复称，待“v15……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2ffinance.sina.com.cn%2ftech%2fdigi%2f2026-09-06%2fdoc-iniqvvnz9666870.shtml&c=5230090432677850751&mkt=zh-hk",
    "source": "新浪网",
    "category": "出行运营",
    "tags": [
      "OTA",
      "Robotaxi",
      "RoboTaxi",
      "无人出租"
    ],
    "_gen": {
      "id": "3d29ea6ebf9a",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    },
    "featured": true
  },
  {
    "date": "2026-09-06",
    "title": "特斯拉下月将实现24小时无人驾驶出租车运营，你准备好了吗？",
    "summary": "你是否曾想过在深夜也能享受无人驾驶出租车的便利？ 特斯拉计划下月实现自动驾驶无人出租车24小时全天候运营。近日，特斯拉AI负责人Ashok……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2fwww.sohu.com%2fa%2f1072428312_122354587&c=10918871288710677583&mkt=zh-hk",
    "source": "搜狐",
    "category": "出行运营",
    "tags": [
      "运营"
    ],
    "_gen": {
      "id": "ed62fec0b1dd",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    },
    "featured": true
  },
  {
    "date": "2026-09-06",
    "title": "特斯拉“无人出租车”发布仅数小时就被查！目前已覆盖达拉斯 ...",
    "summary": "3日，美国电动汽车制造商特斯拉在得克萨斯州奥斯汀举行发布活动，推出无人驾驶出租车Cybercab，并宣布开始在当地限定区域提供乘车服务。（早前报道：“方向盘、油门、刹车、后视镜、鼠标、键盘似乎都变得没有用了”）然而就在发布活动结束数小时后，监管机构——美国国家公路交通安全管理局就宣布，对约1000辆……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260906A08NF300&c=8700668861595422975&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "出行运营",
    "tags": [
      "无人出租"
    ],
    "_gen": {
      "id": "f2364d34c6ee",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-06",
    "title": "特斯拉Robotaxi下月实现24小时运营！无人出租车时代真的来了？",
    "summary": "特斯拉正在加速推进无人驾驶出租车的商业化落地。据最新消息，特斯拉Robotaxi有望在下个月实现24小时全天候运营，这意味着无人出租车将从\"限时体验\"正式迈入\"全时段服务\"阶段。对于整个自动驾驶行业来说，这可能是一个里程碑式的时刻。 从限时试运营到24小时全覆盖……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2fwww.sohu.com%2fa%2f1072432069_121292414&c=10128442750637887746&mkt=zh-hk",
    "source": "搜狐",
    "category": "出行运营",
    "tags": [
      "OTA",
      "Robotaxi",
      "RoboTaxi",
      "无人出租"
    ],
    "_gen": {
      "id": "93d35e35ecdd",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    },
    "featured": true
  },
  {
    "date": "2026-09-06",
    "title": "上汽大众ID. ERA 9X开始搭载Momenta R7世界模型",
    "summary": "近日，上汽大众ID.ERA 9X开始搭载Momenta R7世界模型，车辆不再单纯依赖车道线识别，可对复杂动态场景做预判决策，大幅提升复杂场景下智能辅助驾驶的安全性与流畅度。同时，将对在用车辆推送OTA升级……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74cd8bb42faa73f0c686a019c62&url=https%3a%2f%2fwww.msn.cn%2fzh-cn%2fautos%2f%25E7%2594%25B5%25E5%258A%25A8%25E6%25B1%25BD%25E8%25BD%25A6%2f%25E4%25B8%258A%25E6%25B1%25BD%25E5%25A4%25A7%25E4%25BC%2597id-era-9x%25E5%25BC%2580%25E5%25A7%258B%25E6%2590%25AD%25E8%25BD%25BDmomenta-r7%25E4%25B8%2596%25E7%2595%258C%25E6%25A8%25A1%25E5%259E%258B%2far-AA2bF2l7&c=10417834218041079780&mkt=zh-hk",
    "source": "MSN 中国",
    "category": "技术与研究",
    "tags": [
      "搭载",
      "世界模型"
    ],
    "_gen": {
      "id": "77da6abc5b26",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    },
    "featured": true
  },
  {
    "date": "2026-09-05",
    "title": "无方向盘、无油门刹车踏板！特斯拉正式发布量产版Cybercab无人出租车",
    "summary": "据凤凰网报道……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2fwww.chineseherald.co.nz%2fnews%2fcar%2farticle-1788564435486%2f&c=8934273094446809331&mkt=zh-hk",
    "source": "chineseherald.co.nz",
    "category": "出行运营",
    "tags": [
      "量产",
      "无人出租"
    ],
    "_gen": {
      "id": "7aa6e8105f28",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-09-04",
    "title": "特斯拉开始招募Cybercab车队运营商 自动驾驶出租车业务或将向第三方 ...",
    "summary": "特斯拉近日在官网发布了一份面向企业的意向调查表，征集有意购买Cybercab车队或为其运营网络提供基础设施的公司。这一举动表明，特斯拉对这款金色自动驾驶汽车的规划，可能不再局限于亲自运营自动驾驶出租车，而是希望借助外部企业扩大业务规模。不过，这份调查并不能证明特斯拉已经决定向第三方出售自动驾驶汽车。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb753dc184dfda433c09aaf79a3f3&url=https%3a%2f%2fwww.cnbeta.com.tw%2farticles%2ftech%2f1576340.htm&c=9092693975796036954&mkt=zh-hk",
    "source": "cnbeta.com.tw",
    "category": "出行运营",
    "tags": [
      "自动驾驶出租",
      "运营",
      "车队"
    ],
    "_gen": {
      "id": "34c168d2299b",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "自动驾驶出租车 运营"
    }
  },
  {
    "date": "2026-09-03",
    "title": "车东西专访欧摩威自动驾驶及出行事业群中国区高管：欧摩威如何 ...",
    "summary": "作者 | Janson编辑 |……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb746bffc462ba71bd026297ad0dd&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260903A09UIQ00&c=4853524991919849004&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "量产车型",
    "tags": [],
    "_gen": {
      "id": "0b13a05d3ab0",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-09-03",
    "title": "特斯拉无人驾驶Cybercab亮相在即 无方向盘无踏板(图)",
    "summary": "特斯拉将在周四（9月3日）晚于美国德州奥斯汀举行一场活动，外界预计，公司将公布无人驾驶Cybercab的最新进展。活动开始前，特斯拉先在X平台预热，只写了一句话：“没有方向盘，没有踏板。” 新闻 德州 -……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb746bffc462ba71bd026297ad0dd&url=https%3a%2f%2fwww.secretchina.com%2fnews%2fgb%2f2026%2f09%2f04%2f1104364.html&c=8682274418997431730&mkt=zh-hk",
    "source": "secretchina.com",
    "category": "行业动态",
    "tags": [],
    "_gen": {
      "id": "c7a0111acf84",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-09-03",
    "title": "“没有方向盘，没有踏板。”特斯拉预热万众期待的Cybercab最新进展",
    "summary": "特斯拉在 X 平台发帖吊足粉丝胃口，文案写着 “来体验吧” 以及 “没有方向盘，没有踏板”，为周四得克萨斯州奥斯汀举办的仅限受邀者参加的 Cybercab 活动预热。 埃隆・马斯克旗下这家车企，最早于 2024 年 10 月首次对外亮相 Cybercab……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb746bffc462ba71bd026297ad0dd&url=https%3a%2f%2fwww.sohu.com%2fa%2f1071560356_122014422&c=12029502028589723057&mkt=zh-hk",
    "source": "搜狐",
    "category": "出行运营",
    "tags": [],
    "_gen": {
      "id": "b3ef47d50f73",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-09-01",
    "title": "Momenta将与车企合作量产L3级自动驾驶车型 计划探索订阅收费模式",
    "summary": "上汽奥迪E7X将是首个量产搭载车型。Momenta称，在法规条件具备的前提下，L3级自动驾驶车型将在2027年量产……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74b5f8048e182577b96d2d447fa&url=https%3a%2f%2fwww.caixin.com%2f2026-09-01%2f102480477.html&c=1346939783701834073&mkt=zh-hk",
    "source": "财新",
    "category": "量产车型",
    "tags": [
      "量产",
      "车型"
    ],
    "_gen": {
      "id": "c535d097cc4c",
      "feed": "必应资讯·自动驾驶综合",
      "query": "智能驾驶 量产 车型"
    }
  },
  {
    "date": "2026-08-31",
    "title": "智界RX开展L3级自动驾驶准入测试",
    "summary": "此外，新车首发华为智擎新一代高性能电驱，后驱 CLTC 工况效率达 93% 以上；L3 级自动驾驶架构配备 38 个融合感知传感器，含 896 线双光路图像级激光雷达在内的四颗激光雷达，以及供电、通信、感知、转向、制动等全链路冗余。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74e7f7f44f7824bd788a78b05e9&url=https%3a%2f%2ftech.ifeng.com%2fc%2f8w2jU9JBcqO&c=536975692590861361&mkt=zh-hk",
    "source": "tech.ifeng.com",
    "category": "量产车型",
    "tags": [],
    "_gen": {
      "id": "9236c5fe31ea",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-08-31",
    "title": "启境 GT7 官宣满足国家 L3 级自动驾驶架构的设计标准，并完成 L3 准入 ...",
    "summary": "据轩伟介绍， 启境 GT7 已满足国家 L3 级自动驾驶架构的设计标准，并且完成了 L3 的准入测试与申报 ，后续 L3 的规划应用还需等待未来国家部委审核及相关法规要求。 据IT之家此前报道，今年 8 月 19……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74e7f7f44f7824bd788a78b05e9&url=https%3a%2f%2ffinance.sina.com.cn%2ftech%2fdigi%2f2026-08-31%2fdoc-iniqetnx9066379.shtml&c=20792388424190978&mkt=zh-hk",
    "source": "新浪网",
    "category": "政策与准入",
    "tags": [
      "L3 准入",
      "L3准入",
      "标准"
    ],
    "_gen": {
      "id": "2eb3796135db",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-08-31",
    "title": "一锤定音：出台标准并非L3/L4马上可以合法上路",
    "summary": "首部关于自动驾驶安全的强制性国家标准，将于明年7月1日正式实施。有汽车厂家称明年7月1日起，配置L3/L4自动驾驶系统的车辆将会大规模上路行驶。其实这些都是误读，出台标准并非意味着L3/L4的车辆就可以大规模合法上路行驶。中国首部自动驾驶强制性国家标准GB……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74f72f64b76ba3420f122a07faf&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260831A03HES00&c=13352711127678172454&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "政策与准入",
    "tags": [
      "标准"
    ],
    "_gen": {
      "id": "e7c6c3455c2f",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 级自动驾驶 上路试点"
    }
  },
  {
    "date": "2026-08-31",
    "title": "L3自动驾驶时代将至，这三款新能源车一步到位",
    "summary": "2026年7月30日，《智能网联汽车自动驾驶系统安全要求》（GB……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74e7f7f44f7824bd788a78b05e9&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260831A05BOQ00&c=2140365774172756240&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "a30c99fd5888",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-08-31",
    "title": "L3级智驾陆续上车 无人驾驶全面铺开的时代还远吗？",
    "summary": "近期，L3进入倒计时一事再上热门，引发行业广泛讨论。此前，华为乾崑智能汽车解决方案官方宣布一项里程碑数据：华为乾崑智驾车位到车位累计使用次数正式突破1亿次，辅助泊车累计使用次数同步突破10亿次。截至同一时点，乾崑智驾累计辅助驾驶里程已突破141亿公里，搭载乾崑智驾的车辆累计行驶总里程超过406亿公里……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74e7f7f44f7824bd788a78b05e9&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260831A06V5700&c=12777899414829475307&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "量产车型",
    "tags": [],
    "_gen": {
      "id": "809177dc3740",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-08-31",
    "title": "L3/L4自动驾驶强制国标发布 以后车企不能随便吹智驾了",
    "summary": "全国标准信息公共服务平台显示，国家标准《智能网联汽车自动驾驶系统安全要求》（GB44721-2026）的正式文件已经对外公示出炉。这也是我国首部针对L3/L4级智能网联汽车自动驾驶系统安全要求的强制性国标，正式敲定将于2027年7月1日起落地实施，所有在售搭载高阶自动驾驶功能的车型后续都必须符合该标……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74e7f7f44f7824bd788a78b05e9&url=https%3a%2f%2fwww.cnbeta.com.tw%2farticles%2ftech%2f1575724.htm&c=11512138372658285275&mkt=zh-hk",
    "source": "cnbeta.com.tw",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "14be8b365a6e",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-08-30",
    "title": "L3能上路却卖不动，最大卡点是什么？",
    "summary": "国内L3级有条件自动驾驶已经走出封闭测试，部分车型拿到准入许可，在特定城市划定路段开启上路试点，行业普遍把它视作自动驾驶从辅助驾驶迈向真正自动驾驶的关键拐点。但热闹的试点表象之下，大规模面向普通消费者的商业化依旧遥遥无期……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74f72f64b76ba3420f122a07faf&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260830A046CM00&c=326113301650139188&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "2501f7942f3a",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 级自动驾驶 上路试点"
    }
  },
  {
    "date": "2026-08-27",
    "title": "小鹏第二代VLA大模型迎来首次重大升级，AI开始理解“时间”",
    "summary": "8月27日，小鹏集团举办以“TIME 时间”为主题的物理AI分享暨第二代VLA全新版本体验日活动，小鹏第二代VLA大模型迎来首次重大升级，全新XOS 6.3.0版本将于小鹏G9L全球首发。此次模型升级的核心，是让AI开始真正理解时间：从过去对物理世界的静态3D空间理解，进一步走向动态4D时空理解。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74db6e5421781d6f09e0ba2d4e0&url=https%3a%2f%2ffinance.sina.com.cn%2fjjxw%2f2026-08-27%2fdoc-inipuqhm9152555.shtml&c=7257592830649345298&mkt=zh-hk",
    "source": "新浪网",
    "category": "技术与研究",
    "tags": [
      "VLA",
      "大模型",
      "AI"
    ],
    "_gen": {
      "id": "560d0ecea8de",
      "feed": "必应资讯·世界模型与大模型",
      "query": "自动驾驶 大模型 VLA"
    }
  },
  {
    "date": "2026-08-27",
    "title": "21评论丨自动驾驶入法，中国汽车进入“L3时刻”",
    "summary": "近日提交全国人大常委会审议的《中华人民共和国道路交通安全法（修订草案）》，首次明确了自动驾驶汽车的法律地位、上道路行驶条件以及违法责任归属。草案新增“自动驾驶汽车的特别规定”专章，意味着该领域从此由政策试点与标准规范阶段正式进入现实场景的责任规范层面。这既是自动驾驶技术的重要治理节点，也是产业市场发……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74f72f64b76ba3420f122a07faf&url=https%3a%2f%2ffinance.sina.com.cn%2froll%2f2026-08-28%2fdoc-inipuuqq0580708.shtml%3fr%3d0%26tr%3d174&c=12742416091833676329&mkt=zh-hk",
    "source": "新浪网",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "bc1df3058ea6",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 级自动驾驶 上路试点"
    }
  },
  {
    "date": "2026-08-25",
    "title": "新道交法草案自动驾驶专章，车企将如何应对？",
    "summary": "你是否担心自动驾驶汽车在道路上的安全问题？近日，一项新的法规可能为你解决这个痛点。8月25日提请十四届全国人大常委会会议初次审议的道路交通安全法修订草案，设置了“自动驾驶汽车的特别规定”专章……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb746bffc462ba71bd026297ad0dd&url=https%3a%2f%2fwww.sohu.com%2fa%2f1067406738_122354587&c=4775875452340915587&mkt=zh-hk",
    "source": "搜狐",
    "category": "政策与准入",
    "tags": [],
    "_gen": {
      "id": "b7644c2757cd",
      "feed": "必应资讯·自动驾驶综合",
      "query": "自动驾驶 最新 进展"
    }
  },
  {
    "date": "2026-08-25",
    "title": "L3法规落地！深蓝极狐拿下L3准入，鸿蒙蔚小理小米已备战",
    "summary": "谁会第一批吃螃蟹？",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74e7f7f44f7824bd788a78b05e9&url=https%3a%2f%2fwww.msn.cn%2fzh-cn%2fnews%2fother%2fl3%25E6%25B3%2595%25E8%25A7%2584%25E8%2590%25BD%25E5%259C%25B0-%25E6%25B7%25B1%25E8%2593%259D%25E6%259E%2581%25E7%258B%2590%25E6%258B%25BF%25E4%25B8%258Bl3%25E5%2587%2586%25E5%2585%25A5-%25E9%25B8%25BF%25E8%2592%2599%25E8%2594%259A%25E5%25B0%258F%25E7%2590%2586%25E5%25B0%258F%25E7%25B1%25B3%25E5%25B7%25B2%25E5%25A4%2587%25E6%2588%2598%2far-AA2aZQ2Y&c=17080108446825828507&mkt=zh-hk",
    "source": "MSN 中国",
    "category": "政策与准入",
    "tags": [
      "L3 准入",
      "L3准入",
      "法规"
    ],
    "_gen": {
      "id": "a09ff3eb1551",
      "feed": "必应资讯·L3与准入试点",
      "query": "L3 自动驾驶 准入"
    }
  },
  {
    "date": "2026-08-24",
    "title": "字节探索自动驾驶，Seed世界模型团队负责｜36氪独家",
    "summary": "自动驾驶，字节通往具身智能的前一站。",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74cd8bb42faa73f0c686a019c62&url=https%3a%2f%2fwww.msn.com%2fzh-cn%2fnews%2fother%2f%25E5%25AD%2597%25E8%258A%2582%25E6%258E%25A2%25E7%25B4%25A2%25E8%2587%25AA%25E5%258A%25A8%25E9%25A9%25BE%25E9%25A9%25B6-seed%25E4%25B8%2596%25E7%2595%258C%25E6%25A8%25A1%25E5%259E%258B%25E5%259B%25A2%25E9%2598%259F%25E8%25B4%259F%25E8%25B4%25A3-36%25E6%25B0%25AA%25E7%258B%25AC%25E5%25AE%25B6%2far-AA2aPN3o&c=4859231782768938297&mkt=zh-hk",
    "source": "msn.com",
    "category": "技术与研究",
    "tags": [
      "世界模型"
    ],
    "_gen": {
      "id": "2baff2d37868",
      "feed": "必应资讯·世界模型与大模型",
      "query": "世界模型 自动驾驶"
    }
  },
  {
    "date": "2026-08-21",
    "title": "Waymo越来越多，Tesla也来抢生意：无人出租车时代真的来了？",
    "summary": "今天《湾区有约》，从湾区街头越来越常见的Waymo聊起。新一代无人出租车Ojai开始投入运营，它与过去的Jaguar有什么不同？为什么采用中国吉利旗下极氪生产的车辆？Waymo和TeslaFSD、Robotaxi、Cybercab到底有什么区别？普通人未来真的可以买一辆无人车，让它自己 ...",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb752dd364235a425b8cb8c515aab&url=https%3a%2f%2fwww.soundofhope.org%2fpost%2f941652&c=14247740176434630612&mkt=zh-hk",
    "source": "soundofhope.org",
    "category": "出行运营",
    "tags": [
      "无人出租",
      "Waymo"
    ],
    "_gen": {
      "id": "f18e3f8d4132",
      "feed": "必应资讯·Robotaxi与出行",
      "query": "Robotaxi 无人出租车"
    }
  },
  {
    "date": "2026-08-19",
    "title": "汽车开始有了“大模型”：小鹏VLA 2.0真正想改变的，可能不只是自动 ...",
    "summary": "导 读 如果AI大语言模型写错一句话，人可以让它重新生成。 但如果AI控制一辆高速行驶的汽车时判断错了，情况可能就完全不同了。 2026年夏天，人工智能正在跨过这条边界……",
    "link": "http://www.bing.com/news/apiclick.aspx?ref=FexRss&aid=&tid=6a9fb74db6e5421781d6f09e0ba2d4e0&url=https%3a%2f%2fnews.qq.com%2frain%2fa%2f20260819A0DC3X00&c=10959390643100508433&mkt=zh-hk",
    "source": "腾讯新闻",
    "category": "技术与研究",
    "tags": [
      "VLA",
      "大模型"
    ],
    "_gen": {
      "id": "f30f3711493f",
      "feed": "必应资讯·世界模型与大模型",
      "query": "自动驾驶 大模型 VLA"
    }
  }
];

window.NEWS_META = {
  "updatedAt": "2026-09-08",
  "fetchedAt": "2026-09-08T15:20:39+08:00",
  "maxTotal": 30,
  "totalManual": 0,
  "totalAuto": 30,
  "total": 30,
  "removedOldAuto": 0,
  "removedByCap": 6,
  "removedDup": 5,
  "totalFeatured": 8,
  "removedFeaturedCap": 9,
  "sources": [
    [
      "必应资讯·自动驾驶综合",
      5
    ],
    [
      "必应资讯·自动驾驶综合",
      4
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
      10
    ],
    [
      "必应资讯·Robotaxi与出行",
      2
    ]
  ],
  "note": "每次运行只保留最新 30 条：本次抓取覆盖旧的自动条目；手工条目若排不进最新 30 条也会被移出。"
};
