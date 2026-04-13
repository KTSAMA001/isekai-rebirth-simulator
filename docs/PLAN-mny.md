# 家境/商业路线计划书（mny 主导）

> 目标：~30 个事件，三条子线
> 核心主题：商业的起伏（暴富和破产）、金钱与道德的抉择

---

## 子线 A：商人（小本经营 → 商路 → 商业帝国）

### mny_child_market_day
- **标题**: 集市的诱惑
- **描述**: 妈妈带你去赶集。五颜六色的摊位、吆喝的商人、讨价还价的声音——这个世界的运转方式让你着迷。
- **年龄**: 5 - 9
- **权重**: 6
- **触发条件**: include: attribute.mny >= 3 / exclude: has.flag.market_fascinated
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: mny +1, int +1
- **分支**:
  1. **学着叫卖** (prob: 0.5) → chr +1, mny +1, set_flag market_fascinated, successText: "你学着摊主的样子吆喝起来。旁边的大人们被逗笑了，一个商人夸你有天赋。"
  2. **数零花钱** (prob: 0.3) → int +2, set_flag market_fascinated, successText: "你蹲在角落认真地数着铜板。怎样才能变更多？这个问题在你小小的脑袋里扎了根。"
  3. **被偷了钱** (prob: 0.2) → mny -1, spr +1, set_flag market_fascinated, successText: "一个小偷摸走了你的铜板。你大哭了一场，但也记住了一个教训：钱要看好。"

### mny_youth_first_trade
- **标题**: 第一笔生意
- **描述**: 你发现镇上的浆果在城里能卖三倍的价钱。一个疯狂的念头冒了出来。
- **年龄**: 10 - 14
- **权重**: 5
- **触发条件**: include: attribute.mny >= 5 & attribute.int >= 6 / exclude: has.flag.first_trade
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: mny +2
- **分支**:
  1. **进货倒卖** (prob: 0.5) → mny +4, int +1, set_flag first_trade, successText: "你用攒下的零花钱收购了满满一篮浆果，带到城里卖了个好价钱。第一桶金！虽然只有几枚银币，但成就感无与伦比。"
  2. **找合伙人** (prob: 0.3) → mny +2, chr +2, set_flag first_trade, successText: "你找了一个朋友合伙。赚得少了点，但有人一起承担风险的感觉不错。"
  3. **被坑了** (prob: 0.2) → mny -2, int +2, set_flag first_trade, successText: "城里的商人用花言巧语压了你的价。你亏了，但你学到了：商场上，心软是最大的敌人。"

### mny_youth_apprentice
- **标题**: 商人学徒
- **描述**: 镇上的老商人看你机灵，问你要不要当学徒。这是正经的从商之路。
- **年龄**: 12 - 16
- **权重**: 5
- **触发条件**: include: attribute.mny >= 7 & has.flag.first_trade / exclude: has.flag.merchant_apprentice
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: mny +2, int +2
- **分支**:
  1. **拜师学艺** (prob: 0.6) → mny +3, int +3, set_flag merchant_apprentice, successText: "老商人教你看货、算账、察言观色。他说：'做生意的秘诀不是赚钱，是让人觉得赚了钱。'"
  2. **自学成才** (prob: 0.4) → int +2, chr +1, successText: "你谢过老商人，决定自己摸索。也许会走弯路，但自己踩过的坑才记得住。"

### mny_adult_caravan
- **标题**: 第一支商队
- **描述**: 你攒够了启动资金，组建了自己的第一支商队。目的地：边境之城。
- **年龄**: 18 - 26
- **权重**: 5
- **触发条件**: include: attribute.mny >= 10 & has.flag.merchant_apprentice / exclude: has.flag.first_caravan
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: mny +3
- **分支**:
  1. **安全路线** (prob: 0.4) → mny +4, set_flag first_caravan, successText: "虽然利润一般，但货全到了。稳扎稳打，这就是你的风格。"
  2. **冒险捷径** (prob: 0.3) → mny +8 或 mny -3, set_flag first_caravan, successText: "你走了危险的山路，避开了关卡税。利润翻倍！" (failureText: "山路遇上了盗匪。你失去了一半的货，但至少人没事。")
  3. **与同行联手** (prob: 0.3) → mny +3, chr +2, set_flag first_caravan, successText: "你和另一支商队结伴同行，互相照应。这次赚得不多，但你多了一个人脉。"

### mny_adult_trade_route
- **标题**: 打通商路
- **描述**: 你发现了一条被遗忘的古老商路。如果打通它，你就是这条线路上唯一的商人。
- **年龄**: 22 - 32
- **权重**: 4
- **触发条件**: include: attribute.mny >= 14 & has.flag.first_caravan / exclude: has.flag.trade_route_pioneer
- **unique**: true
- **tag**: merchant
- **priority**: major
- **基础效果**: mny +3, int +1
- **分支**:
  1. **投入全部资源** (prob: 0.4) → mny +10, set_flag trade_route_pioneer, successText: "你花了半年时间，终于打通了这条商路。沿途的村庄视你为恩人，竞争对手对你望尘莫及。商业帝国，从这里开始。"
  2. **找人合作开发** (prob: 0.4) → mny +5, chr +2, set_flag trade_route_pioneer, successText: "你找了三个合作伙伴分摊风险。利润少了一半，但你获得了一个可靠的商业联盟。"
  3. **卖掉情报** (prob: 0.2) → mny +6, set_flag trade_route_pioneer, successText: "你没有亲自开发，而是把路线情报卖给了大商会。赚了一笔快钱，但也失去了最大的机会。"

### mny_mid_merchant_empire
- **标题**: 商业帝国
- **描述**: 你的商号遍布大陆，从粮食到军火，从布匹到宝石，都有你的生意。但帝国越大，敌人越多。
- **年龄**: 30 - 42
- **权重**: 3
- **触发条件**: include: attribute.mny >= 22 & has.flag.trade_route_pioneer / exclude: has.flag.merchant_master
- **unique**: true
- **tag**: merchant
- **priority**: major
- **基础效果**: mny +5, chr +2
- **分支**:
  1. **垄断市场** (prob: 0.3) → mny +10, chr -3, set_flag merchant_master, successText: "你用低价挤垮了所有竞争对手。市场上只剩你的商号。商人敬畏你，百姓怨恨你。你终于明白，成功的代价是孤独。"
  2. **合理竞争** (prob: 0.4) → mny +6, chr +3, set_flag merchant_master, successText: "你保持良性竞争，与同行共存。赚得少了点，但睡得着觉。"
  3. **回馈社会** (prob: 0.3) → mny +4, chr +5, spr +2, set_flag merchant_master, successText: "你用利润建设学校、修桥铺路。人们叫你'善人商人'。钱不是目的，是手段——你终于想通了。"

### mny_mid_trade_war
- **标题**: 商战
- **描述**: 一个强大的竞争对手向你宣战了。不是刀剑，而是价格、货源和人脉的全面战争。
- **年龄**: 28 - 40
- **权重**: 4
- **触发条件**: include: attribute.mny >= 16 & has.flag.trade_route_pioneer / exclude: has.flag.trade_war
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: mny -2
- **分支**:
  1. **正面硬刚** (prob: 0.3) → mny +5 或 mny -8, set_flag trade_war, successText: "你用资本碾压对手，他破产了。但你花了一大笔钱，而且……这是你想要的结果吗？" (failureText: "你低估了对手。这场商战耗尽了你的积蓄，你被迫缩减规模。")
  2. **联合其他商家** (prob: 0.4) → mny +2, chr +3, set_flag trade_war, successText: "你联合了其他小商家组成联盟，共同对抗大商会。团结就是力量——这是你从小就明白的道理。"
  3. **谈判和解** (prob: 0.3) → mny +1, int +2, chr +1, set_flag trade_war, successText: "你主动提出和解。不是认输，是看清了：商战没有赢家，只有消耗。对方也累了，于是你们坐下来喝了一杯。"

---

## 子线 B：投资（第一笔投资 → 市场博弈 → 金融大亨）

### mny_youth_savings
- **标题**: 存钱罐
- **描述**: 你把零花钱存进了一个陶罐里。半年后打开一看——真的变多了（虽然只是因为没花）。
- **年龄**: 6 - 10
- **权重**: 6
- **触发条件**: include: attribute.mny >= 4 / exclude: has.flag.savings_habit
- **unique**: true
- **tag**: investment
- **priority**: normal
- **基础效果**: mny +1
- **分支**:
  1. **继续存** (prob: 0.5) → mny +2, spr +1, set_flag savings_habit, successText: "你决定继续存下去。积少成多，这是你的人生哲学。"
  2. **拿去买东西** (prob: 0.3) → chr +1, successText: "你买了一个漂亮的小玩具。钱没了，但快乐是真实的。"
  3. **借给朋友** (prob: 0.2) → chr +1, mny -1, set_flag savings_habit, successText: "朋友说下周还。你觉得帮助别人比存钱更有意义。（下周他真的还了吗？）"

### mny_adult_first_investment
- **标题**: 第一笔投资
- **描述**: 一个朋友邀请你入股他的炼金工坊。他说这是稳赚不赔的买卖。
- **年龄**: 18 - 26
- **权重**: 5
- **触发条件**: include: attribute.mny >= 8 / exclude: has.flag.first_investment
- **unique**: true
- **tag**: investment
- **priority**: normal
- **基础效果**: mny +1
- **分支**:
  1. **投了** (prob: 0.5) → mny +6 或 mny -4, set_flag first_investment, successText: "炼金工坊大获成功，你的投资翻了三倍！" (failureText: "工坊炸了。字面意思上的炸了。你的投资化为了灰烬。")
  2. **谨慎观望** (prob: 0.3) → int +2, successText: "你决定先看看情况。三个月后工坊确实成功了，但你错过了最佳入场时机。不过至少你没亏。"
  3. **投一半** (prob: 0.2) → mny +2, set_flag first_investment, successText: "你投入了一半资金，降低了风险也降低了回报。但这是你学到的第一个投资原则：永远别梭哈。"

### mny_adult_market_crash
- **标题**: 市场崩盘
- **描述**: 传言王国要打仗，物价暴跌。所有人都在抛售，有人在哭，有人在笑。
- **年龄**: 22 - 35
- **权重**: 4
- **触发条件**: include: attribute.mny >= 12 & has.flag.first_investment / exclude: has.flag.market_crash_survivor
- **unique**: true
- **tag**: investment
- **priority**: major
- **基础效果**: mny -3
- **分支**:
  1. **抄底** (prob: 0.3) → mny +12 或 mny -10, set_flag market_crash_survivor, successText: "你在所有人恐惧时买入，在所有人贪婪时卖出。巴菲特如果在这里，一定会给你点赞。" (failureText: "市场继续下跌。你抄在了半山腰。也许这次，恐惧是对的。")
  2. **止损离场** (prob: 0.4) → mny -2, spr +2, set_flag market_crash_survivor, successText: "你果断割肉离场。亏了，但保住了本金。活着，才有翻本的机会。"
  3. **按兵不动** (prob: 0.3) → mny -1, int +2, set_flag market_crash_survivor, successText: "你什么都没做。风暴过去了，你的资产缩水了一些，但没有伤筋动骨。有时候，不动就是最好的策略。"

### mny_adult_market_boom
- **标题**: 牛市来临
- **描述**: 新大陆发现了稀有矿脉，所有相关商品的价格都在飞涨。你的仓库里正好有一批存货。
- **年龄**: 24 - 36
- **权重**: 4
- **触发条件**: include: attribute.mny >= 14 / exclude: has.flag.market_boom
- **unique**: true
- **tag**: investment
- **priority**: normal
- **基础效果**: mny +4
- **分支**:
  1. **全部抛售** (prob: 0.4) → mny +8, set_flag market_boom, successText: "你在最高点清仓了。赚得盆满钵满。有人问你怎么知道该在那时候卖，你说：'直觉。'其实是恐惧。"
  2. **继续持有** (prob: 0.3) → mny +3 或 mny -2, set_flag market_boom, successText: "你觉得还能涨……" (failureText: "泡沫破了。你从云端跌回了地面。")
  3. **分批卖出** (prob: 0.3) → mny +5, int +1, set_flag market_boom, successText: "你分三批卖出了存货。不是最高的价格，但胜在稳健。投资最重要的不是赚最多，是睡得最香。"

### mny_mid_financial_tycoon
- **标题**: 金融大亨
- **描述**: 你已经不满足于做生意了。你想掌控市场本身。
- **年龄**: 30 - 45
- **权重**: 3
- **触发条件**: include: attribute.mny >= 22 & has.flag.market_crash_survivor & has.flag.market_boom / exclude: has.flag.financial_tycoon
- **unique**: true
- **tag**: investment
- **priority**: major
- **基础效果**: mny +5, int +2
- **分支**:
  1. **建立银行** (prob: 0.3) → mny +10, set_flag financial_tycoon, set_flag bank_founder, successText: "你创立了这片大陆上第一家私人银行。钱生钱——这是你信仰的宗教。"
  2. **操控市场** (prob: 0.3) → mny +8, chr -4, spr -2, set_flag financial_tycoon, successText: "你学会了如何用信息差赚钱。低买高卖是合法的，但良心……那是另一回事。"
  3. **急流勇退** (prob: 0.4) → mny +4, spr +4, set_flag financial_tycoon, successText: "你在巅峰时期选择了退出。圈子里的人不理解，但你清楚：贪婪是深渊，你不想掉下去。"

### mny_mid_insider_trading
- **标题**: 内幕消息
- **描述**: 你获得了一条别人不知道的消息：王国即将与邻国签订贸易协定。如果你提前行动，可以大赚一笔。
- **年龄**: 28 - 42
- **权重**: 4
- **触发条件**: include: attribute.mny >= 16 & has.flag.first_investment / exclude: has.flag.insider_trading
- **unique**: true
- **tag**: investment
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **利用消息** (prob: 0.4) → mny +8, spr -3, chr -1, set_flag insider_trading, successText: "你赚了一大笔。但你知道这笔钱的来路不正。每当夜深人静，你总觉得有人在看着你。"
  2. **举报** (prob: 0.3) → chr +3, spr +2, mny -1, set_flag insider_trading, successText: "你向当局举报了这条内幕消息的来源。你失去了赚钱的机会，但保住了清白。"
  3. **无视** (prob: 0.3) → spr +1, successText: "你把消息当作没听到。也许你错过了一笔横财，但你不用背负任何东西。"

---

## 子线 C：贵族（继承 → 封地治理 → 政治博弈）

### mny_child_noble_birth
- **标题**: 贵族之子
- **描述**: 你出生在一个古老的贵族家庭。银汤匙、佣人、家庭教师——这就是你的世界。
- **年龄**: 4 - 8
- **权重**: 4
- **触发条件**: include: attribute.mny >= 12 / exclude: has.flag.noble_upbringing
- **unique**: true
- **tag**: noble
- **priority**: normal
- **基础效果**: mny +2, chr +1
- **分支**:
  1. **享受生活** (prob: 0.4) → chr +2, set_flag noble_upbringing, successText: "你从小就知道自己与众不同。最好的食物、最好的老师、最好的一切。但你隐约觉得，外面的世界更有趣。"
  2. **厌倦奢华** (prob: 0.3) → int +2, spr +1, set_flag noble_upbringing, successText: "你偷偷溜出庄园，看到了真正的世界。那些在泥地里玩耍的孩子，比你快乐得多。"
  3. **被严格管教** (prob: 0.3) → str +1, int +2, set_flag noble_upbringing, successText: "你的父亲坚信'虎父无犬子'，你从五岁开始就要学礼仪、剑术和管理。没有童年，只有训练。"

### mny_youth_inheritance
- **标题**: 意外继承
- **描述**: 你的叔父——一个你几乎不认识的人——去世了，把一座庄园留给了你。
- **年龄**: 14 - 20
- **权重**: 4
- **触发条件**: include: attribute.mny >= 8 & attribute.luk >= 8 / exclude: has.flag.inherited_estate
- **unique**: true
- **tag**: noble
- **priority**: normal
- **基础效果**: mny +5
- **分支**:
  1. **接受遗产** (prob: 0.5) → mny +5, set_flag inherited_estate, set_flag lord, successText: "你成了一片土地的主人。但庄园年久失修，佃户怨声载道——这到底是遗产还是负担？"
  2. **卖给亲戚** (prob: 0.3) → mny +3, successText: "你把庄园卖给了另一个亲戚。虽然少赚了点，但你不想被绑在一个破庄园上。"
  3. **捐给教会** (prob: 0.2) → spr +4, chr +2, successText: "你把庄园捐给了当地教会。人们都说你是圣人。但你的亲戚们……不那么想。"

### mny_adult_fief_management
- **标题**: 封地治理
- **描述**: 你的领地需要决策：修路还是修城墙？减税还是加税？每一个选择都有代价。
- **年龄**: 20 - 32
- **权重**: 4
- **触发条件**: include: has.flag.lord | has.flag.inherited_estate / exclude: has.flag.fief_managed
- **unique**: true
- **tag**: noble
- **priority**: normal
- **基础效果**: int +1
- **分支**:
  1. **重税高压** (prob: 0.3) → mny +6, chr -3, set_flag fief_managed, successText: "你收重税充实了国库，但百姓的日子越来越苦。你在领主的城堡里数钱，窗外是愤怒的目光。"
  2. **减税惠民** (prob: 0.4) → mny -2, chr +4, spr +2, set_flag fief_managed, successText: "你减轻了百姓的负担。虽然手头紧了，但领地的人民对你感恩戴德。民心，是最好的投资。"
  3. **发展商业** (prob: 0.3) → mny +4, int +2, set_flag fief_managed, successText: "你招商引资，发展领地经济。几年后，你的封地成了最繁华的地方之一。做领主和做生意，原来是一个道理。"

### mny_adult_political_marriage
- **标题**: 政治联姻
- **描述**: 一个强大的邻国领主提出联姻。这是一桩纯商业交易——你的财富交换他的权力。
- **年龄**: 20 - 30
- **权重**: 4
- **触发条件**: include: attribute.mny >= 14 & (has.flag.lord | has.flag.noble_upbringing) / exclude: has.flag.political_marriage
- **unique**: true
- **tag**: noble
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **同意联姻** (prob: 0.4) → mny +8, chr +2, set_flag political_marriage, set_flag married, successText: "婚礼盛大而隆重。你看着对面那个陌生人，心想：这就是权力的代价。"
  2. **拒绝** (prob: 0.3) → spr +3, mny -2, successText: "你拒绝了。有些人用婚姻换权力，你不愿意。但得罪了一个强大的邻居……后果自负。"
  3. **谈判条件** (prob: 0.3) → mny +4, int +2, set_flag political_marriage, set_flag married, successText: "你同意了，但提出了自己的条件。对方被你的谈判技巧折服了——也许这段婚姻不会太糟。"

### mny_mid_power_struggle
- **标题**: 宫廷博弈
- **描述**: 王都的政治风云变幻。有人要拉拢你，有人要扳倒你。你站在棋盘中央，既是棋手也是棋子。
- **年龄**: 28 - 42
- **权重**: 3
- **触发条件**: include: attribute.mny >= 18 & has.flag.political_marriage / exclude: has.flag.power_struggle
- **unique**: true
- **tag**: noble
- **priority**: major
- **基础效果**: int +2
- **分支**:
  1. **站队强者** (prob: 0.3) → mny +6, chr -2, set_flag power_struggle, successText: "你选择了最强的一方。他赢了，你也跟着水涨船高。但你永远记得：站队有风险，下注需谨慎。"
  2. **保持中立** (prob: 0.4) → int +3, spr +2, set_flag power_struggle, successText: "你谁也不站，谁也不得罪。风暴过后你完好无损，但也没有得到任何好处。明哲保身，是一门艺术。"
  3. **自己争权** (prob: 0.3) → mny +5, chr +2, set_flag power_struggle, set_flag royal_recognized, successText: "你拉拢各方势力，组建了自己的政治派系。国王注意到了你——你是敌人还是盟友，取决于他怎么想。"

### mny_mid_estate_crisis
- **标题**: 封地危机
- **描述**: 旱灾席卷了你的领地。粮食减产，百姓饥荒。你的粮仓里还有存粮——但这些粮够你卖个好价钱。
- **年龄**: 30 - 45
- **权重**: 3
- **触发条件**: include: has.flag.fief_managed / exclude: has.flag.estate_crisis
- **unique**: true
- **tag**: noble
- **priority**: major
- **基础效果**: mny -2, spr -1
- **分支**:
  1. **开仓放粮** (prob: 0.4) → mny -5, chr +5, spr +4, set_flag estate_crisis, successText: "你打开了粮仓。百姓们含泪跪下感谢你。你失去了一半的财富，但赢得了所有人心。"
  2. **高价卖粮** (prob: 0.3) → mny +6, chr -5, set_flag estate_crisis, successText: "你趁机抬高粮价。金库满了，但领地里充满了怨恨的目光。也许有一天，这些目光会变成燃烧的火把。"
  3. **求援** (prob: 0.3) → mny -2, chr +2, int +1, set_flag estate_crisis, successText: "你向其他领主请求援助。有人帮忙了，有人嘲笑了。你学会了一件事：灾难见人心。"

---

## 跨子线事件

### mny_adult_charity_dilemma
- **标题**: 乞丐的手
- **描述**: 一个衣衫褴褛的老人向你伸出了手。你口袋里有很多钱，也有很多理由不给。
- **年龄**: 18 - 35
- **权重**: 6
- **触发条件**: include: attribute.mny >= 10 / exclude: has.flag.charity_dilemma
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **慷慨解囊** (prob: 0.4) → mny -1, chr +2, spr +2, set_flag charity_dilemma, successText: "你掏出了一把银币。老人含泪感谢你。也许这些钱改变不了什么，但至少今天有人吃饱了。"
  2. **无视走开** (prob: 0.4) → successText: "你低头走过。世界上有太多需要帮助的人，你帮不完。但那天晚上，你做了一个不安的梦。"
  3. **给他工作** (prob: 0.2) → mny -1, chr +3, int +1, set_flag charity_dilemma, successText: "你没有给钱，而是给了一份工作。'授人以鱼不如授人以渔'——老人含泪点头。"

### mny_mid_bankruptcy
- **标题**: 破产
- **描述**: 一切都完了。糟糕的投资、被骗的货款、天灾人祸……你失去了所有的钱。
- **年龄**: 25 - 45
- **权重**: 3
- **触发条件**: include: attribute.mny >= 12 & (has.flag.market_crash_survivor | has.flag.trade_war) / exclude: has.flag.bankrupt
- **unique**: true
- **tag**: merchant
- **priority**: major
- **基础效果**: mny -10, spr -3
- **分支**:
  1. **东山再起** (prob: 0.3) → str +3, spr +2, set_flag bankrupt, successText: "你咬牙从头开始。所有认识你的人都觉得你疯了，但你知道——从零开始的人，无所畏惧。"
  2. **一蹶不振** (prob: 0.3) → spr -4, set_flag bankrupt, successText: "你接受了自己的失败。也许有些人就是不适合成功。你在酒馆里度过了余生，给每个愿意听的人讲你的故事。"
  3. **寻求帮助** (prob: 0.4) → chr +2, set_flag bankrupt, successText: "你向老朋友求助。有人伸出了手，有人关上了门。你终于看清了谁是真正的朋友。"

### mny_mid_philanthropy
- **标题**: 回馈
- **描述**: 你已经赚够了钱。现在的问题是：你要用它做什么？
- **年龄**: 35 - 55
- **权重**: 4
- **触发条件**: include: attribute.mny >= 20 & has.flag.financial_tycoon | has.flag.merchant_master / exclude: has.flag.philanthropy
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: chr +2
- **分支**:
  1. **建学校** (prob: 0.3) → mny -4, chr +4, spr +3, set_flag philanthropy, set_flag school_founder, successText: "你建了一所学校，免费招收穷人家的孩子。有人说你傻，但你知道：知识才是真正的财富。"
  2. **存起来留给后代** (prob: 0.4) → mny +2, set_flag philanthropy, successText: "你把财产精心打理，准备留给下一代。家族的延续，比个人的名声更重要。"
  3. **继续投资** (prob: 0.3) → mny +5, successText: "你选择继续扩大商业版图。钱生钱，永远不嫌多。但你也开始思考：尽头在哪里？"

### mny_elder_business_legacy
- **标题**: 商业遗产
- **描述**: 你老了。你建立的商业帝国需要有人继承。
- **年龄**: 50 - 70
- **权重**: 3
- **触发条件**: include: has.flag.merchant_master | has.flag.financial_tycoon / exclude: has.flag.business_legacy
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: spr +2
- **分支**:
  1. **传给子女** (prob: 0.4) → chr +2, set_flag business_legacy, set_flag has_successor, successText: "你的孩子接管了生意。虽然能力不及你，但有你打下的基础，应该不会出大问题。应该吧。"
  2. **传给最优秀的员工** (prob: 0.3) → int +2, chr +3, set_flag business_legacy, successText: "你把生意交给了跟随你多年的老伙计。血缘不是唯一的标准，能力才是。"
  3. **解散** (prob: 0.3) → spr +4, set_flag business_legacy, successText: "你解散了商业帝国。'属于我的时代过去了。'你没有留恋，只有释然。"

### mny_elder_rich_mans_regret
- **标题**: 富人的遗憾
- **描述**: 你坐在空荡荡的豪宅里，身边堆满了金币，却没有一个朋友。
- **年龄**: 55 - 75
- **权重**: 3
- **触发条件**: include: attribute.mny >= 20 & !has.flag.married & !has.flag.parent / exclude: has.flag.rich_regret
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: spr -1
- **分支**:
  1. **写信给旧友** (prob: 0.4) → chr +2, spr +3, set_flag rich_regret, successText: "你给所有失散多年的朋友写了信。有人回了，有人没回。但那些回信，比金库里所有的金币都珍贵。"
  2. **把财产捐了** (prob: 0.3) → mny -10, chr +5, spr +5, set_flag rich_regret, successText: "你把所有财产捐给了孤儿院。空了的金库，满了的内心。"
  3. **什么都不做** (prob: 0.3) → spr -3, set_flag rich_regret, successText: "你坐在那里，继续数金币。金币碰撞的声音在空荡的豪宅里回响，像是在嘲笑你。"

### mny_adult_smuggler_offer
- **标题**: 灰色地带
- **描述**: 一个走私商向你提出了合作：把违禁品藏在你的货物里运过边境。报酬丰厚。
- **年龄**: 20 - 35
- **权重**: 4
- **触发条件**: include: attribute.mny >= 8 & has.flag.first_caravan / exclude: has.flag.smuggler_choice
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **拒绝** (prob: 0.5) → spr +2, chr +1, set_flag smuggler_choice, successText: "你果断拒绝。君子爱财，取之有道。走私商耸耸肩走了，去找下一个目标。"
  2. **同意** (prob: 0.3) → mny +6, spr -3, set_flag smuggler_choice, set_flag underworld_connection, successText: "你赚了一大笔黑钱。但你知道，这条路的尽头要么是监狱，要么是更深的深渊。"
  3. **举报** (prob: 0.2) → chr +3, int +1, set_flag smuggler_choice, successText: "你向守卫举报了走私商。他被抓了，你获得了一笔赏金。但你也多了一个敌人。"

### mny_mid_commercial_war_fleet
- **标题**: 远洋贸易
- **描述**: 传闻东方有一片富庶的大陆。你需要组建船队，跨越未知的海洋。
- **年龄**: 28 - 42
- **权重**: 3
- **触发条件**: include: attribute.mny >= 18 & has.flag.merchant_master / exclude: has.flag.ocean_trade
- **unique**: true
- **tag**: merchant
- **priority**: major
- **基础效果**: mny -3
- **分支**:
  1. **亲自率队** (prob: 0.3) → mny +12 或 death, set_flag ocean_trade, successText: "你站在船头，看着地平线。三个月后，你带回了满船的香料和丝绸。" (failureText: "海洋是残酷的。风暴吞噬了你的船队。你的商业帝国，沉入了深海。")
  2. **派代理人去** (prob: 0.4) → mny +5 或 mny -4, set_flag ocean_trade, successText: "代理人带回了好消息！" (failureText: "代理人带回了坏消息……船在半路被海盗劫了。")
  3. **投资别人的船队** (prob: 0.3) → mny +3, set_flag ocean_trade, successText: "你投资了一支经验丰富的船队，作为小股东分享利润。风险小，回报也小，但至少你还活着。"

---

## 事件总计

| 编号 | 事件ID | 子线 | 年龄段 | 优先级 |
|------|--------|------|--------|--------|
| 1 | mny_child_market_day | 商人 | 5-9 | normal |
| 2 | mny_youth_first_trade | 商人 | 10-14 | normal |
| 3 | mny_youth_apprentice | 商人 | 12-16 | normal |
| 4 | mny_adult_caravan | 商人 | 18-26 | normal |
| 5 | mny_adult_trade_route | 商人 | 22-32 | major |
| 6 | mny_mid_merchant_empire | 商人 | 30-42 | major |
| 7 | mny_mid_trade_war | 商人 | 28-40 | normal |
| 8 | mny_youth_savings | 投资 | 6-10 | normal |
| 9 | mny_adult_first_investment | 投资 | 18-26 | normal |
| 10 | mny_adult_market_crash | 投资 | 22-35 | major |
| 11 | mny_adult_market_boom | 投资 | 24-36 | normal |
| 12 | mny_mid_financial_tycoon | 投资 | 30-45 | major |
| 13 | mny_mid_insider_trading | 投资 | 28-42 | normal |
| 14 | mny_child_noble_birth | 贵族 | 4-8 | normal |
| 15 | mny_youth_inheritance | 贵族 | 14-20 | normal |
| 16 | mny_adult_fief_management | 贵族 | 20-32 | normal |
| 17 | mny_adult_political_marriage | 贵族 | 20-30 | normal |
| 18 | mny_mid_power_struggle | 贵族 | 28-42 | major |
| 19 | mny_mid_estate_crisis | 贵族 | 30-45 | major |
| 20 | mny_adult_charity_dilemma | 跨线 | 18-35 | normal |
| 21 | mny_mid_bankruptcy | 跨线 | 25-45 | major |
| 22 | mny_mid_philanthropy | 跨线 | 35-55 | normal |
| 23 | mny_elder_business_legacy | 跨线 | 50-70 | normal |
| 24 | mny_elder_rich_mans_regret | 跨线 | 55-75 | normal |
| 25 | mny_adult_smuggler_offer | 跨线 | 20-35 | normal |
| 26 | mny_mid_commercial_war_fleet | 跨线 | 28-42 | major |

> 注：共 26 个核心事件。以下补充 4 个事件达到 ~30 个。

### mny_youth_allowance_choice
- **标题**: 零花钱的选择
- **描述**: 父母给了你一笔零花钱。你可以花掉、存起来、或者投资。
- **年龄**: 8 - 12
- **权重**: 6
- **触发条件**: include: attribute.mny >= 3 / exclude: has.flag.allowance_choice
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: mny +1
- **分支**:
  1. **买糖果** (prob: 0.4) → chr +1, successText: "你买了满满一袋糖果，分给了小伙伴。快乐是无价的。"
  2. **存起来** (prob: 0.4) → mny +1, spr +1, set_flag allowance_choice, successText: "你把钱藏在了枕头底下。'积少成多'——你虽然不太懂这个道理，但本能告诉你要存钱。"
  3. **买工具** (prob: 0.2) → int +1, str +1, set_flag allowance_choice, successText: "你买了一套小工具，开始修理邻居家的东西，赚取外快。小小年纪就有商业头脑。"

### mny_adult_debt_collector
- **标题**: 讨债
- **描述**: 有人欠你一大笔钱不还。你打听到了他的住处。
- **年龄**: 20 - 35
- **权重**: 4
- **触发条件**: include: attribute.mny >= 10 / exclude: has.flag.debt_collector
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **暴力讨债** (prob: 0.3) → mny +3, str +2, chr -3, set_flag debt_collector, successText: "你带人去把他的家搬空了。钱收回来了，但你看着他哭泣的孩子，心里有一丝不安。"
  2. **宽限期限** (prob: 0.4) → chr +2, spr +1, set_flag debt_collector, successText: "你给了他更多时间。三个月后他如数归还，还多给了一些作为感谢。善良，有时候是最好的投资。"
  3. **免除债务** (prob: 0.3) → spr +3, chr +2, set_flag debt_collector, successText: "你说'算了'。那人跪下给你磕了三个头。你损失了一笔钱，但获得了一个愿意为你赴汤蹈火的人。"

### mny_mid_tax_evasion
- **标题**: 税务官来了
- **描述**: 王国的税务官来查账了。你的账本……不太干净。你可以补缴、贿赂、或据理力争。
- **年龄**: 30 - 50
- **权重**: 4
- **触发条件**: include: attribute.mny >= 14 & (has.flag.merchant_master | has.flag.financial_tycoon) / exclude: has.flag.tax_evasion
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **补缴税款** (prob: 0.4) → mny -5, chr +2, set_flag tax_evasion, successText: "你乖乖补缴了税款。心疼，但心安。"
  2. **贿赂税务官** (prob: 0.3) → mny -2, chr -2, set_flag tax_evasion, set_flag underworld_connection, successText: "你塞了一袋金币给税务官。他笑着离开了。但你现在有了一个把柄在他手里。"
  3. **据理力争** (prob: 0.3) → int +2, set_flag tax_evasion, successText: "你拿出了一堆文件证明你的税务是合法的。税务官被你的专业精神震慑了，悻悻离开。"

### mny_elder_merchant_retirement
- **标题**: 最后的账本
- **描述**: 你合上了最后一本账本。一生的商业生涯，浓缩在这些数字里。
- **年龄**: 55 - 75
- **权重**: 3
- **触发条件**: include: has.flag.business_legacy / exclude: has.flag.merchant_retirement
- **unique**: true
- **tag**: merchant
- **priority**: normal
- **基础效果**: spr +3
- **分支**:
  1. **满意** (prob: 0.5) → spr +3, set_flag merchant_retirement, set_flag peaceful_retirement, successText: "你看着账本上的数字，露出了微笑。这一生，值了。"
  2. **遗憾** (prob: 0.3) → spr +1, set_flag merchant_retirement, successText: "你看着那些数字，摇了摇头。赚了很多，也失去了很多。如果能重来……算了，没有如果。"
  3. **继续工作** (prob: 0.2) → str -1, mny +2, set_flag merchant_retirement, set_flag never_retired, successText: "你合上账本，又打开了新的一本。退休？不存在的。工作到死，这就是商人的宿命。"