# 运势/天命路线计划书（luk 主导）

> 目标：~25 个事件，两条子线交织
> 核心主题：运气不可控，好运也可能是诅咒

---

## 子线 A：幸运儿（天降好运 → 幸运传说 → 命运之子）

### luk_child_lucky_find
- **标题**: 地上的亮闪闪
- **描述**: 你在路边捡到了一个闪闪发光的东西。可能是宝石，也可能是碎玻璃。
- **年龄**: 4 - 8
- **权重**: 6
- **触发条件**: include: attribute.luk >= 6 / exclude: has.flag.lucky_find
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: luk +1
- **分支**:
  1. **揣进口袋** (prob: 0.6) → mny +2, set_flag lucky_find, successText: "一块货真价实的宝石！你开心地把它藏在枕头底下。"
  2. **交给大人** (prob: 0.4) → chr +1, luk +1, successText: "大人们夸你诚实。虽然东西被没收了，但你收获了信任。"

### luk_child_miracle_escape
- **标题**: 擦肩而过
- **描述**: 一辆失控的马车朝你冲来，你莫名其妙地毫发无伤。但那之后的夜晚，你总做噩梦。
- **年龄**: 5 - 10
- **权重**: 5
- **触发条件**: include: attribute.luk >= 8 / exclude: has.flag.miracle_escape
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: luk +2
- **分支**:
  1. **吓傻了** (prob: 0.5) → spr -1, set_flag miracle_escape, successText: "你站在原地一动不动，马车擦着你的衣角飞过。所有人都在喊'奇迹'，但你只想哭。"
  2. **迅速闪开** (prob: 0.5) → str +1, luk +1, set_flag miracle_escape, successText: "你的身体比大脑先动了。后来有人说你是被命运之手推了一把。"

### luk_youth_winning_ticket
- **标题**: 神秘奖券
- **描述**: 一个陌生人塞给你一张彩券，说"你会需要的"。你还没来得及问，他就消失在人群中。
- **年龄**: 12 - 16
- **权重**: 5
- **触发条件**: include: attribute.luk >= 10 / exclude: has.flag.winning_ticket
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: luk +1
- **分支**:
  1. **去兑奖** (prob: 0.5) → mny +5, set_flag winning_ticket, successText: "一等奖。你一夜之间成了镇上最有钱的年轻人。但周围人的目光变了。"
  2. **扔掉** (prob: 0.3) → spr +1, successText: "你总觉得这东西不对劲。也许你错过了什么，也许你躲过了什么。"
  3. **送给朋友** (prob: 0.2) → chr +2, mny +3, set_flag winning_ticket, successText: "你的朋友中了奖，分了你一半。他说这是你应得的。真朋友就是这样。"

### luk_youth_lucky_encounter
- **标题**: 命运的交叉点
- **描述**: 你在暴雨中躲进一个山洞，发现里面住着一个奇怪的老人。他似乎一直在等你。
- **年龄**: 13 - 17
- **权重**: 4
- **触发条件**: include: attribute.luk >= 12 / exclude: has.flag.mysterious_mentor
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: luk +1
- **分支**:
  1. **听他说话** (prob: 0.5) → int +3, spr +2, set_flag mysterious_mentor, successText: "老人给你讲了一整夜的故事——关于命运、选择和代价。临走时他说：'你被选中了，但被选中不一定是好事。'"
  2. **礼貌告辞** (prob: 0.5) → luk +2, successText: "你直觉告诉你该走。老人没有挽留，只是在你身后叹了口气。"

### luk_adult_lucky_business
- **标题**: 歪打正着
- **描述**: 你本来是去买面包的，结果稀里糊涂签下了一笔大生意。
- **年龄**: 18 - 28
- **权重**: 5
- **触发条件**: include: attribute.luk >= 14 / exclude: has.flag.lucky_business
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: mny +3, luk +1
- **分支**:
  1. **见好就收** (prob: 0.4) → mny +5, set_flag lucky_business, successText: "你赚了一笔就撤了。后来听说接手的人赔了个精光。有时候，幸运就是知道什么时候停下。"
  2. **加大投入** (prob: 0.4) → mny +8 或 mny -5, set_flag lucky_business, successText: "要么一夜暴富，要么血本无归。命运的硬币在空中翻转……" (failureText: "你输光了。运气这种东西，果然不是靠得住的。")
  3. **把机会让给朋友** (prob: 0.2) → chr +3, successText: "你的朋友因此发了财，到处说你是他的贵人。你什么都没得到，但得到了比钱更珍贵的东西。"

### luk_adult_fate_letter
- **标题**: 无名信件
- **描述**: 你收到了一封没有署名的信，信中预言了明天将要发生的事。第二天，预言应验了。
- **年龄**: 20 - 30
- **权重**: 4
- **触发条件**: include: attribute.luk >= 15 & has.flag.mysterious_mentor / exclude: has.flag.fate_letter
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: spr +2
- **分支**:
  1. **追寻寄信人** (prob: 0.4) → spr +3, set_flag fate_seeker, successText: "你开始追踪信的来源，却发现每一条线索都指向一个不可能的答案——你自己。"
  2. **烧掉信件** (prob: 0.3) → luk +2, successText: "你把信烧了。有些东西不该知道。但灰烬中浮现出新的字迹……"
  3. **按信行事** (prob: 0.3) → mny +4, luk +1, set_flag fate_letter, successText: "你按照信中的指示行动，避开了灾难，还得到了意外之财。但代价是什么？你还没想明白。"

### luk_adult_lucky_legend
- **标题**: 幸运传说
- **描述**: 你的好运已经成了传说。人们开始崇拜你、追随你，也有人嫉妒你。
- **年龄**: 25 - 35
- **权重**: 4
- **触发条件**: include: attribute.luk >= 20 & (has.flag.lucky_business | has.flag.winning_ticket) / exclude: has.flag.lucky_legend
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: luk +2, chr +2
- **分支**:
  1. **享受名声** (prob: 0.4) → chr +4, mny +3, set_flag lucky_legend, successText: "你成了'幸运之子'，无论走到哪里都有人请你摸他们的头。但你开始觉得……好运正在慢慢减少。"
  2. **低调行事** (prob: 0.4) → spr +3, set_flag lucky_legend, successText: "你选择隐姓埋名。传说仍在流传，但主角已经退场。也许这样更好。"
  3. **利用名声敛财** (prob: 0.2) → mny +8, chr -3, set_flag lucky_legend, successText: "你开始收钱'传递好运'。钱来得很快，但朋友走得更忙。"

### luk_adult_luck_curse
- **标题**: 幸运的代价
- **描述**: 你发现每次好运降临，身边的人就会遭遇不幸。这不是巧合。
- **年龄**: 25 - 38
- **权重**: 3
- **触发条件**: include: attribute.luk >= 18 & has.flag.lucky_legend / exclude: has.flag.luck_curse_realized
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: spr -2
- **分支**:
  1. **接受命运** (prob: 0.3) → luk +3, spr -3, set_flag luck_curse_realized, successText: "你接受了这个残酷的事实。此后你的运气更好了——因为已经没有人留在你身边可以被夺走了。"
  2. **拒绝运气** (prob: 0.4) → spr +4, luk -5, set_flag luck_curse_realized, successText: "你主动放弃了运气。从此以后你开始经历接连不断的倒霉事，但至少身边的人安全了。这值得吗？"
  3. **寻求破解** (prob: 0.3) → int +3, spr +2, set_flag luck_curse_realized, successText: "你踏上了寻找真相的旅程。也许在世界的某个角落，有人知道如何解开这个诅咒。"

### luk_mid_chosen_one
- **标题**: 命运之子
- **描述**: 古老的预言应验了——你就是那个被选中的人。但预言没有说被选中意味着什么。
- **年龄**: 30 - 40
- **权重**: 3
- **触发条件**: include: attribute.luk >= 25 & has.flag.fate_letter / exclude: has.flag.chosen_one
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: luk +3, spr +3
- **分支**:
  1. **接受使命** (prob: 0.4) → all_attributes +2, set_flag chosen_one, successText: "你踏上了命运之路。身边的人越来越少，但你知道，这就是你的命。"
  2. **反抗命运** (prob: 0.4) → str +3, spr +3, luk -3, set_flag chosen_one, successText: "你撕碎了预言书。'我的人生我做主。'但命运似乎并不在意你的态度。"
  3. **将使命传给他人** (prob: 0.2) → chr +5, luk -5, successText: "你找到了另一个合适的人选，将'被选中'的命运转移了出去。他感激涕零，你如释重负。但夜深人静时，你会不会想：我丢掉的是诅咒，还是恩赐？"

### luk_mid_blessing_of_fortune
- **标题**: 幸运女神的微笑
- **描述**: 一位自称幸运女神的神使出现在你面前，说你是万中无一的幸运儿，可以获得一份祝福。
- **年龄**: 28 - 42
- **权重**: 3
- **触发条件**: include: attribute.luk >= 22 & has.flag.lucky_legend / exclude: has.flag.fortune_blessing
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: luk +2
- **分支**:
  1. **要财富** (prob: 0.3) → mny +10, set_flag fortune_blessing, successText: "金币如雨般落下。你成了这片大陆上最富有的人之一。但你发现，钱越多，越睡不好。"
  2. **要健康** (prob: 0.3) → str +5, spr +3, set_flag fortune_blessing, successText: "你感到前所未有的精力充沛。你的身体似乎永远不会衰老。但看着身边的人一个一个老去……"
  3. **要智慧** (prob: 0.2) → int +5, spr +2, set_flag fortune_blessing, successText: "你看透了很多事情。但有些真相，知道了反而是负担。"
  4. **什么也不要** (prob: 0.2) → luk +5, spr +5, set_flag fortune_blessing, successText: "神使笑了。'万中无一不是因为运气，是因为选择。'她消失了，留下你站在原地，觉得自己也许做了最正确的决定。"

---

## 子线 B：赌徒（小赌 → 大赢/大输 → 赌神/倾家荡产）

### luk_youth_first_bet
- **标题**: 第一次赌局
- **描述**: 你的朋友带你去了地下赌场。骰子的声音像心跳一样诱人。
- **年龄**: 12 - 16
- **权重**: 5
- **触发条件**: include: attribute.luk >= 7 / exclude: has.flag.first_gamble
- **unique**: true
- **tag**: gamble
- **priority**: normal
- **基础效果**: luk +1
- **分支**:
  1. **小试牛刀** (prob: 0.5) → mny +2, set_flag first_gamble, successText: "你赢了！虽然钱不多，但那种心跳加速的感觉让你上瘾了。"
  2. **赢了就走** (prob: 0.3) → mny +1, luk +2, set_flag first_gamble, successText: "你赢了一把就离开了。赌场老板看着你的背影，若有所思。"
  3. **输光离开** (prob: 0.2) → mny -2, spr +1, set_flag first_gamble, successText: "你把零花钱全输了。但这次教训让你学到了：赌桌上没有赢家。"

### luk_youth_dice_roll
- **标题**: 命运骰子
- **描述**: 一个旅行商人向你兜售一颗"命运骰子"。他说掷出六点就能实现一个愿望。
- **年龄**: 10 - 15
- **权重**: 4
- **触发条件**: include: attribute.luk >= 9 / exclude: has.flag.fate_dice
- **unique**: true
- **tag**: gamble
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **买下来掷** (prob: 0.5) → mny -1, luk +3 或 luk -2, set_flag fate_dice, successText: "骰子在桌上旋转了很久……终于停了。" (failureText: "不是六点。商人耸耸肩收走了钱。也许命运骰子只是个骗局，也许你运气不够。")
  2. **不买** (prob: 0.5) → spr +1, successText: "你摇摇头走开了。背后传来商人低沉的笑声：'你会回来的。'"

### luk_adult_high_stakes
- **标题**: 豪赌之夜
- **描述**: 地下赌场的高桌向你发出了邀请。入场费：你全部的身家。
- **年龄**: 18 - 30
- **权重**: 4
- **触发条件**: include: attribute.luk >= 12 & has.flag.first_gamble / exclude: has.flag.high_stakes_gamble
- **unique**: true
- **tag**: gamble
- **priority**: normal
- **基础效果**: luk +1
- **分支**:
  1. **梭哈** (prob: 0.3) → mny +12, luk +2, set_flag high_stakes_gamble, successText: "你把所有筹码推了上去。当牌面翻开的那一刻，全场寂静——然后爆发出欢呼声。你是今晚的王者。"
  2. **梭哈——输了** (prob: 0.3) → mny -8, set_flag high_stakes_gamble, set_flag gambler_ruined, successText: "你把所有筹码推了上去。牌面翻开的瞬间，你的世界崩塌了。一夜间，你什么都没有了。"
  3. **及时收手** (prob: 0.4) → mny +3, spr +2, set_flag high_stakes_gamble, successText: "你在赢了一轮后果断离场。赌场老板说你是他见过的最聪明的人——也是最无趣的。"

### luk_adult_gambling_debt
- **标题**: 债务深渊
- **描述**: 你欠了赌场一大笔钱。他们给了你一个选择：还钱，或者替他们办一件事。
- **年龄**: 20 - 32
- **权重**: 4
- **触发条件**: include: has.flag.gambler_ruined / exclude: has.flag.gambling_debt_resolved
- **unique**: true
- **tag**: gamble
- **priority**: major
- **基础效果**: mny -3, spr -2
- **分支**:
  1. **替他们办事** (prob: 0.4) → mny +3, chr -3, spr -2, set_flag gambling_debt_resolved, set_flag underworld_connection, successText: "你替赌场完成了一桩见不得光的交易。债消了，但你手上沾了洗不掉的东西。"
  2. **打工还债** (prob: 0.4) → str +3, int +1, set_flag gambling_debt_resolved, successText: "你开始了漫长的还债之路。三年苦工，你不仅还清了债，还练出了一身腱子肉。"
  3. **跑路** (prob: 0.2) → luk -3, mny -5, set_flag gambling_debt_resolved, set_flag fugitive, successText: "你连夜逃离了这座城市。身后的追债人越来越近，你必须永远跑在他们的前面。"

### luk_adult_gamble_king
- **标题**: 赌神的诞生
- **描述**: 你已经在赌桌上赢了一百场。人们叫你"赌神"，没有人敢和你对赌。
- **年龄**: 25 - 38
- **权重**: 3
- **触发条件**: include: attribute.luk >= 20 & has.flag.high_stakes_gamble & !has.flag.gambler_ruined / exclude: has.flag.gamble_king
- **unique**: true
- **tag**: gamble
- **priority**: major
- **基础效果**: luk +2, mny +5
- **分支**:
  1. **开赌场** (prob: 0.4) → mny +10, set_flag gamble_king, set_flag casino_owner, successText: "你开了自己的赌场。从赌徒变成庄家——这是赌博世界里的阶级跃升。但你知道，庄家的每一分钱都沾着别人的血泪。"
  2. **金盆洗手** (prob: 0.4) → spr +4, chr +2, set_flag gamble_king, successText: "你宣布退休。赌场轰动了。有人说你是传奇，有人说你是逃兵。但你知道，能主动离开赌桌的人，才是真正的赢家。"
  3. **接受终极赌局** (prob: 0.2) → luk +5, mny +15 或 death, set_flag gamble_king, successText: "一个神秘人向你发起了终极挑战：赌上一切，包括你的命。" (failureText: "命运终桓没有站在你这边。赌神的传说，就此终结。")

### luk_mid_gambler_redemption
- **标题**: 赌徒的救赎
- **描述**: 倾家荡产后，你站在人生的十字路口。要么继续沉沦，要么重新开始。
- **年龄**: 28 - 40
- **权重**: 3
- **触发条件**: include: has.flag.gambler_ruined & has.flag.gambling_debt_resolved / exclude: has.flag.gambler_redemption
- **unique**: true
- **tag**: gamble
- **priority**: normal
- **基础效果**: spr +1
- **分支**:
  1. **重新站起来** (prob: 0.5) → str +2, spr +3, mny +3, set_flag gambler_redemption, successText: "你用颤抖的双手签下了第一份工作合同。从零开始不可怕，可怕的是没有勇气重新开始。"
  2. **一蹶不振** (prob: 0.3) → spr -3, mny -2, set_flag gambler_redemption, successText: "你没能走出来。酒精和绝望成了你最好的朋友。但故事还没结束——也许有人会拉你一把。"
  3. **以赌制赌** (prob: 0.2) → luk +4, mny +6 或 mny -10, set_flag gambler_redemption, successText: "你决定最后一搏。这是你最后的机会。" (failureText: "最后一搏变成了最后的毁灭。你失去了一切，包括希望。")

---

## 跨子线事件（luck 与 gamble 都可能触发）

### luk_adult_black_cat
- **标题**: 黑猫横路
- **描述**: 一只黑猫从你面前穿过。有人说不吉利，有人说这反而是最大的幸运。
- **年龄**: 15 - 35
- **权重**: 6
- **触发条件**: include: attribute.luk >= 5 / exclude: has.flag.black_cat_encounter
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **跟着黑猫走** (prob: 0.4) → luk +3, mny +2, set_flag black_cat_encounter, successText: "黑猫带你走进了一条小巷，巷子尽头是一袋被人遗弃的金币。也许是幸运，也许只是巧合。"
  2. **绕路走** (prob: 0.3) → spr +1, successText: "你选择避开。宁可信其有。"
  3. **摸摸黑猫** (prob: 0.3) → chr +1, luk +1, set_flag black_cat_encounter, successText: "黑猫在你掌心蹭了蹭，发出满足的呼噜声。你笑了——管它吉不吉利，猫是猫。"

### luk_mid_second_chance
- **标题**: 第二次机会
- **描述**: 你犯了一个大错，所有人都说你完了。但命运给了你一张底牌。
- **年龄**: 25 - 40
- **权重**: 4
- **触发条件**: include: attribute.luk >= 16 & (has.flag.gambler_ruined | has.flag.luck_curse_realized) / exclude: has.flag.second_chance
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: luk +1
- **分支**:
  1. **抓住机会** (prob: 0.5) → mny +5, chr +2, set_flag second_chance, successText: "你从谷底爬了上来。第二次机会不是每个人都能得到的，你知道这次不能再浪费了。"
  2. **让给别人** (prob: 0.3) → chr +4, spr +3, set_flag second_chance, successText: "你把机会让给了比你更需要的人。有人笑你傻，但你的心前所未有地平静。"
  3. **犹豫不决** (prob: 0.2) → luk -2, successText: "你想了太久，机会消失了。命运不耐烦地转过身去。"

### luk_mid_prophecy_fulfilled
- **标题**: 预言成真
- **描述**: 多年前那个神秘老人说的话，现在应验了。你终于明白了"被选中"的真正含义。
- **年龄**: 35 - 50
- **权重**: 3
- **触发条件**: include: attribute.luk >= 22 & has.flag.fate_letter & has.flag.chosen_one / exclude: has.flag.prophecy_fulfilled
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: spr +3, luk +2
- **分支**:
  1. **完成宿命** (prob: 0.5) → all_attributes +3, set_flag prophecy_fulfilled, set_flag undying_legend, successText: "你完成了命运赋予你的使命。你的名字将被刻在历史上，千年不朽。但代价是……你已经不是你自己了。"
  2. **改写预言** (prob: 0.3) → spr +5, luk +3, set_flag prophecy_fulfilled, successText: "你用不同于预言的方式完成了使命。命运之书被改写，你证明了人可以选择自己的结局。"
  3. **拒绝预言** (prob: 0.2) → str +3, spr +3, set_flag prophecy_fulfilled, successText: "你当着所有人的面否定了预言。'我不相信命运，我只相信选择。'在场的人有的嘲笑你，有的崇拜你。"

### luk_elder_luck_legacy
- **标题**: 运气的传承
- **描述**: 你老了，人们问你一生中最大的幸运是什么。
- **年龄**: 50 - 70
- **权重**: 3
- **触发条件**: include: attribute.luk >= 20 & has.flag.lucky_legend / exclude: has.flag.luck_legacy
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: spr +2
- **分支**:
  1. **"是遇见了对的人"** (prob: 0.4) → chr +3, spr +3, set_flag luck_legacy, successText: "你说最大的幸运不是金钱也不是名声，而是在对的时间遇见了对的人。听的人沉默了。"
  2. **"是每次死里逃生"** (prob: 0.3) → luk +2, set_flag luck_legacy, successText: "你细数了一生中与死亡擦肩而过的时刻。每一刻都让你后怕，也让你庆幸。"
  3. **"没有最大的幸运"** (prob: 0.3) → spr +4, set_flag luck_legacy, successText: "你摇摇头说，运气是公平的，没有最好，只有刚好。说完你笑了，眼角的皱纹里藏着整个故事。"

### luk_elder_final_roll
- **标题**: 最后一掷
- **描述**: 生命的赌桌上，你还有最后一颗骰子。你打算怎么用？
- **年龄**: 55 - 75
- **权重**: 3
- **触发条件**: include: has.flag.gamble_king & has.flag.lucky_legend / exclude: has.flag.final_roll
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: luk +1
- **分支**:
  1. **豪赌一把** (prob: 0.4) → mny +10 或 mny -8, set_flag final_roll, successText: "你推出最后一颗骰子。它是你一生的缩影——跌宕起伏，精彩绝伦。" (failureText: "最后一掷，输了。但你微笑着——因为赌了一辈子，总算输得心甘情愿。")
  2. **把骰子送给孙子** (prob: 0.4) → chr +4, set_flag final_roll, set_flag legacy_passed, successText: "你把骰子放在孙子手心。'运气不能传承，但勇气可以。'孩子握紧了骰子，眼里闪着光。"
  3. **把骰子留在桌上** (prob: 0.2) → spr +5, set_flag final_roll, successText: "你没有掷。你只是把骰子放在赌桌上，转身离开了。有些局，不参与就是最大的赢。"

---

## 事件总计

| 编号 | 事件ID | 子线 | 年龄段 | 优先级 |
|------|--------|------|--------|--------|
| 1 | luk_child_lucky_find | 幸运儿 | 4-8 | normal |
| 2 | luk_child_miracle_escape | 幸运儿 | 5-10 | normal |
| 3 | luk_youth_winning_ticket | 幸运儿 | 12-16 | normal |
| 4 | luk_youth_lucky_encounter | 幸运儿 | 13-17 | major |
| 5 | luk_adult_lucky_business | 幸运儿 | 18-28 | normal |
| 6 | luk_adult_fate_letter | 幸运儿 | 20-30 | major |
| 7 | luk_adult_lucky_legend | 幸运儿 | 25-35 | major |
| 8 | luk_adult_luck_curse | 幸运儿 | 25-38 | major |
| 9 | luk_mid_chosen_one | 幸运儿 | 30-40 | major |
| 10 | luk_mid_blessing_of_fortune | 幸运儿 | 28-42 | major |
| 11 | luk_mid_prophecy_fulfilled | 幸运儿 | 35-50 | major |
| 12 | luk_elder_luck_legacy | 幸运儿 | 50-70 | normal |
| 13 | luk_youth_first_bet | 赌徒 | 12-16 | normal |
| 14 | luk_youth_dice_roll | 赌徒 | 10-15 | normal |
| 15 | luk_adult_high_stakes | 赌徒 | 18-30 | normal |
| 16 | luk_adult_gambling_debt | 赌徒 | 20-32 | major |
| 17 | luk_adult_gamble_king | 赌徒 | 25-38 | major |
| 18 | luk_mid_gambler_redemption | 赌徒 | 28-40 | normal |
| 19 | luk_elder_final_roll | 赌徒 | 55-75 | major |
| 20 | luk_adult_black_cat | 跨线 | 15-35 | normal |
| 21 | luk_mid_second_chance | 跨线 | 25-40 | normal |
| 22 | luk_mid_fortune_wheel | 跨线 | 20-35 | normal |
| 23 | luk_mid_lucky_orphan | 跨线 | 8-14 | normal |
| 24 | luk_adult_serendipity | 跨线 | 18-30 | normal |
| 25 | luk_elder_dice_of_fate | 跨线 | 50-70 | major |

> 注：编号 22-25 为下方的补充事件

### luk_mid_fortune_wheel
- **标题**: 命运转盘
- **描述**: 嘉年华上有一个巨大的转盘，奖品从金币到诅咒什么都有。你手里只有一枚硬币。
- **年龄**: 20 - 35
- **权重**: 5
- **触发条件**: include: attribute.luk >= 10 / exclude: has.flag.fortune_wheel
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: luk +1
- **分支**:
  1. **转一把** (prob: 0.5) → mny +5 或 spr -2, set_flag fortune_wheel, successText: "转盘停在了一袋金币上！人群欢呼。" (failureText: "转盘停在了一个黑色格子上。摊主笑着说：'下次好运。'你总觉得哪里不对劲。")
  2. **在旁边看** (prob: 0.3) → spr +1, int +1, successText: "你观察了几轮，发现转盘有猫腻。聪明人不下注。"
  3. **帮别人转** (prob: 0.2) → chr +2, successText: "你帮一个小孩转了转盘，他赢了最大的奖品。他高兴得跳起来抱住了你。"

### luk_mid_lucky_orphan
- **标题**: 孤儿的幸运星
- **描述**: 你在孤儿院发现了四叶草。院长说这代表好运。
- **年龄**: 8 - 14
- **权重**: 4
- **触发条件**: include: has.flag.orphan / exclude: has.flag.lucky_orphan
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: luk +2
- **分支**:
  1. **保存起来** (prob: 0.5) → spr +2, set_flag lucky_orphan, successText: "你把四叶草夹在书里。虽然它不会带来真正的幸运，但它提醒你：即使在最黑暗的地方，也有美好的东西。"
  2. **送给朋友** (prob: 0.5) → chr +2, luk +1, set_flag lucky_orphan, successText: "你把四叶草送给了一直照顾你的朋友。也许真正的幸运，是有人值得你付出。"

### luk_adult_serendipity
- **标题**: 不期而遇
- **描述**: 你在旅途中偶然遇到了改变你一生的人或事。这种事只可能发生在你身上。
- **年龄**: 18 - 30
- **权重**: 5
- **触发条件**: include: attribute.luk >= 14 / exclude: has.flag.serendipity
- **unique**: true
- **tag**: luck
- **priority**: normal
- **基础效果**: luk +1
- **分支**:
  1. **抓住机缘** (prob: 0.5) → int +2, chr +2, mny +2, set_flag serendipity, successText: "你在错误的时间去了错误的地方，却遇到了对的人。从此你的人生轨迹彻底改变了。"
  2. **擦肩而过** (prob: 0.3) → spr +1, successText: "你犹豫了一秒，机会就消失了。但你总觉得，也许它还会回来。"
  3. **主动制造"偶然"** (prob: 0.2) → int +3, luk +2, set_flag serendipity, successText: "你假装不经意，其实是精心策划。别人以为你运气好，只有你知道——运气也是可以设计的。"

### luk_elder_dice_of_fate
- **标题**: 命运之骰
- **描述**: 在生命的暮年，你回望一生，终于明白了运气的真谛。
- **年龄**: 50 - 70
- **权重**: 3
- **触发条件**: include: attribute.luk >= 18 & has.flag.luck_legacy / exclude: has.flag.dice_of_fate
- **unique**: true
- **tag**: luck
- **priority**: major
- **基础效果**: spr +3, luk +2
- **分支**:
  1. **写下回忆录** (prob: 0.5) → int +2, set_flag dice_of_fate, set_flag memoir_written, successText: "你把一生的幸运与不幸都写了下来。后人读到了，说：'原来运气是可以驾驭的。'你笑了，什么都没说。"
  2. **静静回忆** (prob: 0.5) → spr +4, set_flag dice_of_fate, successText: "你坐在夕阳下，回忆着每一次好运和厄运。它们交织在一起，就像编织一张网。你的人生，就是那张网。"