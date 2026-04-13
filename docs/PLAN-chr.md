# 魅力/花花公子路线 - 事件链计划书

> 路线主题：chr 主导 | 核心体验：多段恋爱、选择困难、情感后果  
> 总计 ~35 个事件，覆盖 7 个人生阶段

---

## Birth（出生）— 2 个事件

### chr_birth_angel_kiss

- **标题**: 天使之吻
- **描述**: 你出生的那天，一位路过的精灵贵族称赞你"这孩子笑起来像春风"。镇上的人都说你长得不像这家人——太好看了一点。
- **年龄**: 0 - 1
- **权重**: 10
- **触发条件**: include: `attribute.chr >= 6`; exclude: none
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: chr +1
- **分支**:
  - 分支A（众星捧月）: 邻居们争相来看这个漂亮的孩子，送礼不断 → mny +2, chr +1, set_flag `chr_born_favored`
  - 分支B（树大招风）: 过于出众的长相引来嫉妒，有人说你是妖精的私生子 → chr +1, spr -1, set_flag `chr_born_suspect`

### chr_birth_charming_smile

- **标题**: 天赋微笑
- **描述**: 你还是婴儿时就知道用笑来讨好大人。哭泣？不存在的。只要露出笑容，什么要求都能被满足。
- **年龄**: 0 - 2
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 8`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +2
- **分支**:
  - 分支A（操纵本能）: 你学会了对不同人用不同的笑容来得到想要的东西 → chr +2, int +1, set_flag `chr_social_manipulator`
  - 分支B（真心待人）: 你的笑容发自内心，大家真心喜欢你 → chr +1, spr +1, set_flag `chr_genuine_charm`
  - 分支C（恃宠而骄）: 被宠坏了，开始觉得笑容就是万能钥匙 → chr +1, str -1, mny -1, set_flag `chr_spoiled`

---

## Childhood（童年）— 5 个事件

### chr_childhood_leader

- **标题**: 孩子王
- **描述**: 镇上的孩子们自然而然地围着你转。不是因为你最能打，而是因为你总能让大家开心。你组织了一场"冒险小队"，所有孩子都争着当你的副手。
- **年龄**: 5 - 8
- **权重**: 8
- **触发条件**: include: `attribute.chr >= 7`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +1, spr +1
- **分支**:
  - 分支A（公允之主）: 你公平地分配角色，让每个孩子都觉得被重视 → chr +2, set_flag `chr_fair_leader`
  - 分支B（小独裁者）: 你享受被围绕的感觉，开始排斥不听话的孩子 → chr +1, spr -1, set_flag `chr_bossy`
  - 分支C（众人之友）: 你不固定小队，每天都和不同的人玩 → chr +2, set_flag `chr_social_butterfly`

### chr_childhood_protector

- **标题**: 小小护花使者
- **描述**: 镇上有个总被欺负的孩子，你站出来帮了他/她。对方含着泪说长大了要嫁/娶你。你笑着没当回事，但对方似乎记住了。
- **年龄**: 6 - 9
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 7`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: normal
- **基础效果**: chr +1, spr +1
- **分支**:
  - 分支A（温柔以待）: 你认真对待对方的感激，说"那我们拉钩" → chr +1, set_flag `chr_childhood_promise`
  - 分支B（一笑而过）: 你觉得小孩子的话不能当真，随口敷衍 → chr -1, set_flag `chr_dismissed_promise`

### chr_childhood_favorite

- **标题**: 老师的心头好
- **描述**: 学校里你永远是老师最喜欢的学生。不是因为成绩最好，而是因为你总能把课堂气氛搞得活跃。但你注意到有些同学在背后窃窃私语。
- **年龄**: 7 - 10
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 8`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +1, int +1
- **分支**:
  - 分支A（察言观色）: 你察觉了同学的嫉妒，主动帮他们也会被夸 → chr +2, int +1, set_flag `chr_empathy`
  - 分支B（恃宠生娇）: 反正老师护着你，你变本加厉地享受优待 → chr +1, spr -2, set_flag `chr_arrogant`

### chr_childhood_friendzone

- **标题**: 青梅竹马
- **描述**: 你和邻居家的小孩从小一起长大，关系好到两家人开玩笑说要做亲家。你们分享秘密基地、一起偷摘果园的苹果，无忧无虑。
- **年龄**: 6 - 10
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 6`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1, spr +1
- **分支**:
  - 分支A（两小无猜）: 你们约定长大后要永远在一起 → set_flag `chr_childhood_sweetheart`, chr +1
  - 分支B（模糊边界）: 你觉得对方只是好朋友，但从别人的眼光看你们关系不一般 → set_flag `chr_ambiguous_friendship`, int +1

### chr_childhood_bully_charm

- **标题**: 以德服人
- **描述**: 学校的混混找你麻烦，结果你三言两语就把他们哄笑了。从此他们反而成了你的跟班。
- **年龄**: 8 - 11
- **权重**: 5
- **触发条件**: include: `attribute.chr >= 9`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +2, str +1
- **分支**:
  - 分支A（以善驭人）: 你引导这些孩子向善，帮他们改掉坏习惯 → chr +2, spr +1, set_flag `chr_reformed_gang`
  - 分支B（以利驭人）: 你利用他们当打手，好处是再也不怕被欺负了 → chr +1, spr -2, set_flag `chr_gang_leader`

---

## Teenager（青少年）— 6 个事件

### chr_teen_love_letter

- **标题**: 情书
- **描述**: 你的课桌里出现了一封粉色的信，字迹工整又带着颤抖。没有署名，只有一句"我喜欢你很久了"。这是你人生中第一次被人表白。
- **年龄**: 12 - 15
- **权重**: 9
- **触发条件**: include: `attribute.chr >= 8`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1
- **分支**:
  - 分支A（追查写信人）: 你多方打听找到了写信的人，约对方见面 → chr +2, set_flag `chr_first_admirer_found`
  - 分支B（珍藏不追）: 你觉得这份朦胧的美好不需要戳破，把信仔细收好 → chr +1, spr +1, set_flag `chr_mystery_letter_kept`
  - 分支C（公之于众）: 你在朋友间炫耀这封信，结果传来传去伤了写信人的心 → chr -1, spr -2, set_flag `chr_insensitive_reveal`

### chr_teen_first_love

- **标题**: 初恋
- **描述**: 你终于有了第一个真正意义上的恋人。心跳加速、手心出汗、看到对方就控制不住地笑——原来被魅惑的感觉是这样的。
- **年龄**: 13 - 16
- **权重**: 8
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_first_admirer_found | has.flag chr_childhood_sweetheart`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1, spr +2
- **分支**:
  - 分支A（全心投入）: 你认真对待这段感情，愿意为对方改变 → chr +1, spr +2, set_flag `chr_first_love_serious`
  - 分支B（三分钟热度）: 新鲜感过后你开始觉得无聊，眼神不自觉地飘向别人 → chr +2, spr -2, set_flag `chr_first_love_fickle`
  - 分支C（被甩）: 对方发现你对所有人都很温柔，觉得自己并不特别 → chr -2, spr -1, set_flag `chr_first_heartbreak`

### chr_teen_dance

- **标题**: 星夜舞会
- **描述**: 学院的年度舞会，你收到了三份邀请。你只能选择一个舞伴，但拒绝另外两个人意味着什么，你心里清楚。
- **年龄**: 14 - 17
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 9`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1
- **分支**:
  - 分支A（选择青梅）: 你选了最熟悉的那个人，另外两人礼貌地祝福你 → chr +1, set_flag `chr_chose_familiar`
  - 分支B（选择神秘人）: 你被一张陌生但迷人的面孔吸引，冒险选择了新人 → chr +2, spr -1, set_flag `chr_chose_new`
  - 分支C（三个都跳）: 你试图在不同曲目间换舞伴，结果三个人都生气了 → chr -2, spr -2, set_flag `chr_dance_disaster`

### chr_teen_secret_admirer

- **标题**: 暗恋者的目光
- **描述**: 你感觉总有人在远处注视你，但每次回头都只看到匆匆移开的视线。你的朋友告诉你，隔壁班有个人已经暗恋你一年了。
- **年龄**: 13 - 16
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 8`; exclude: `has.flag chr_insensitive_reveal`
- **unique**: true
- **tag**: love
- **priority**: normal
- **基础效果**: chr +1
- **分支**:
  - 分支A（主动靠近）: 你找机会和对方搭话，发现是个很有趣的人 → chr +1, set_flag `chr_approached_admirer`
  - 分支B（保持距离）: 你不想让对方误会，刻意回避 → chr -1, spr +1, set_flag `chr_kept_distance`

### chr_teen_popularity

- **标题**: 校园偶像
- **描述**: 你成了学校里最受欢迎的人。走到哪里都有人打招呼，午餐时永远不缺同伴。但"受欢迎"和"有朋友"是两回事。
- **年龄**: 14 - 17
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 10`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +2
- **分支**:
  - 分支A（广交朋友）: 你真心对待每个接近你的人，社交圈越来越大 → chr +2, spr +1, set_flag `chr_wide_social`
  - 分支B（内心孤独）: 朋友很多但没有一个真正了解你，夜里觉得空虚 → chr +1, int +1, set_flag `chr_lonely_popular`

### chr_teen_jealousy

- **标题**: 嫉妒的风暴
- **描述**: 你的受欢迎引发了一场风波。两个喜欢你的人在公共场合争吵，所有人都看向你，等你表态。
- **年龄**: 15 - 18
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 9`, `has.flag chr_first_love_fickle | has.flag chr_dance_disaster`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: normal
- **基础效果**: chr -1
- **分支**:
  - 分支A（坦白心意）: 你当众表达了自己的选择，虽然伤害了另一个人 → chr +1, set_flag `chr_made_choice`
  - 分支B（谁都不选）: 你说"你们都值得更好的人"，然后离开了 → chr -1, spr +2, set_flag `chr_chose_none`
  - 分支C（火上浇油）: 你享受被争抢的感觉，暗中挑拨 → chr -2, spr -2, set_flag `chr_manipulator`

---

## Youth（青年）— 7 个事件

### chr_youth_love_triangle

- **标题**: 三角困局
- **描述**: 你同时和两个人暧昧不清——一个是温柔可靠的青梅竹马，一个是热情奔放的冒险者同伴。你知道不能再拖了。
- **年龄**: 18 - 22
- **权重**: 9
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_first_love_serious | has.flag chr_childhood_sweetheart`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1
- **分支**:
  - 分支A（选择安稳）: 你选了青梅竹马，冒险者同伴含泪祝福后远行 → chr +1, spr +2, set_flag `chr_chose_stability`
  - 分支B（选择激情）: 你被冒险者的热情打动，和青梅竹马告别 → chr +2, spr -1, set_flag `chr_chose_passion`
  - 分支C（两个都要）: 你试图同时维持两段关系，开始了双面生活 → chr +2, int +1, set_flag `chr_two_timer`

### chr_youth_rejection

- **标题**: 拒绝的艺术
- **描述**: 一个你并不心动的人鼓起勇气向你表白。对方的真诚让你动容，但你清楚自己没有同样的感情。
- **年龄**: 18 - 23
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 9`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: normal
- **基础效果**: chr +1
- **分支**:
  - 分支A（温柔拒绝）: 你真诚地表达感谢但说明心意，对方虽然伤心但尊重你 → chr +1, spr +1, set_flag `chr_kind_rejection`
  - 分支B（暧昧不清）: 你不忍心拒绝，给了模糊的回应，对方以为还有希望 → chr -1, set_flag `chr_stringing_along`
  - 分支C（冷酷拒绝）: 你直接说"不可能"，干净利落但伤人 → chr -1, str +1, set_flag `chr_cold_rejection`

### chr_youth_secret_lover

- **标题**: 秘密情人
- **描述**: 你和一个不该在一起的人陷入了热恋——可能是贵族的未婚妻/夫，可能是老师的配偶。你们只能在深夜偷偷见面。
- **年龄**: 19 - 24
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 10`, `has.flag chr_two_timer | has.flag chr_chose_passion`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +2, spr -1
- **分支**:
  - 分支A（悬崖勒马）: 你意识到这段关系会毁掉所有人，主动退出 → spr +3, chr -1, set_flag `chr_broke_off_secret`
  - 分支B（铤而走险）: 风险越大越刺激，你深陷其中无法自拔 → chr +2, set_flag `chr_secret_deep`
  - 分支C（被发现）: 秘密曝光了。丑闻像野火一样蔓延 → chr -3, spr -2, mny -3, set_flag `chr_scandal_exposed`

### chr_youth_heartbreak

- **标题**: 被抛弃
- **描述**: 第一次，你被甩了。那个人说："你对所有人都好，我怎么知道自己是不是特别的？"你无言以对。
- **年龄**: 18 - 24
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_two_timer | has.flag chr_stringing_along`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr -2, spr -2
- **分支**:
  - 分支A（深刻反思）: 你第一次认真审视自己的感情模式，决定改变 → chr -1, int +2, spr +2, set_flag `chr_self_reflection`
  - 分支B（自暴自弃）: 反正都这样了，不如更放纵 → chr +1, spr -3, set_flag `chr_hedonist`
  - 分支C（纠缠不放）: 你拼命挽回，变成了自己曾经最讨厌的那种人 → chr -2, set_flag `chr_clingy`

### chr_youth_social_club

- **标题**: 名流圈子
- **描述**: 你被邀请加入城中最顶级的社交俱乐部。这里的人脉和资源令人眼花缭乱，但入场券是你的魅力和一张永远不得罪的嘴。
- **年龄**: 20 - 26
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 10`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +1, mny +2
- **分支**:
  - 分支A（如鱼得水）: 你天生适合这种场合，迅速成为圈子核心 → chr +3, mny +3, set_flag `chr_social_elite`
  - 分支B（保持清醒）: 你享受社交但保持距离，不让自己被吞噬 → chr +1, int +1, set_flag `chr_social_moderate`

### chr_youth_casanova_peak

- **标题**: 风流浪子的巅峰
- **描述**: 你的情史成了酒馆里最热门的谈资。有人说你是天才，有人说你是混蛋。你不在乎——至少看起来不在乎。
- **年龄**: 22 - 28
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 12`, `has.flag chr_social_elite | has.flag chr_two_timer`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +2
- **分支**:
  - 分支A（厌倦游戏）: 你突然觉得一切都很空洞，开始渴望真正的连接 → chr -1, spr +3, set_flag `chr_tired_of_game`
  - 分支B（更上一层）: 你把目标定得更高——追求城中最难追的人 → chr +3, set_flag `chr_ultimate_challenge`
  - 分支C（翻车现场）: 你的某个（或某几个）前任联合起来当众羞辱你 → chr -4, spr -2, set_flag `chr_public_humiliation`

### chr_yuth_fame_cost

- **标题**: 风流的代价
- **描述**: 你的名声开始反噬。有人拒绝和你合作，有人说"和那个人共事不安全"。你第一次意识到魅力不是万能的。
- **年龄**: 24 - 30
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 10`, `has.flag chr_scandal_exposed | has.flag chr_public_humiliation | has.flag chr_hedonist`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: major
- **基础效果**: chr -2, mny -2
- **分支**:
  - 分支A（浪子回头）: 你开始认真改变自己的行为模式，慢慢修复名声 → chr +1, spr +3, set_flag `chr_reformed`
  - 分支B（破罐破摔）: 既然名声已经臭了，不如活得再任性一些 → chr -1, mny -3, set_flag `chr_spiraling`
  - 分支C（换个地方）: 你离开这座城市，去一个没人认识你的地方重新开始 → set_flag `chr_new_start`, chr +1

---

## Adult（成年）— 6 个事件

### chr_adult_social_star

- **标题**: 社交名流
- **描述**: 你成了这座城市的名人。每个宴会都希望有你出席，你的出席本身就是一种社交货币。但你的私人时间几乎为零。
- **年龄**: 28 - 35
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 12`, `has.flag chr_social_elite`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +2, mny +3
- **分支**:
  - 分支A（享受聚光）: 你热爱这种被需要的感觉，来者不拒 → chr +3, spr -2, set_flag `chr_addicted_fame`
  - 分支B（选择性社交）: 你开始只参加真正有意义的聚会，质量优先 → chr +1, mny +1, spr +1, set_flag `chr_selective_social`

### chr_adult_old_flame

- **标题**: 旧情人重逢
- **描述**: 你在一场宴会上遇到了曾经的恋人。岁月在对方脸上留下了痕迹，但那双眼睛还是一样的。对方已经有了家庭。
- **年龄**: 30 - 38
- **权重**: 8
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_first_love_serious | has.flag chr_chose_passion | has.flag chr_broke_off_secret`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1
- **分支**:
  - 分支A（克制祝福）: 你微笑着寒暄，把一切藏在心里 → spr +3, chr +1, set_flag `chr_graceful_past`
  - 分支B（旧情复燃）: 你们开始秘密联系，明知这是深渊 → chr +1, spr -3, set_flag `chr_rekindled`
  - 分支C（坦诚告白）: 你告诉对方"我后悔当初的选择" → chr -1, set_flag `chr_confessed_regret`

### chr_adult_reputation_crisis

- **标题**: 绯闻风暴
- **描述**: 一个心怀不满的前任写了一本关于你的"纪实文学"，在城中畅销。书里的你有三成真实、七成夸张，但读者不在乎。
- **年龄**: 30 - 40
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 9`, `has.flag chr_public_humiliation | has.flag chr_hedonist | has.flag chr_spiraling`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: major
- **基础效果**: chr -3, mny -2
- **分支**:
  - 分支A（法律维权）: 你请了最好的律师起诉诽谤，但真相在舆论面前很无力 → mny -4, chr +1, set_flag `chr_fought_back`
  - 分支B（幽默化解）: 你在公开场合自嘲，反而赢得了一些好感 → chr +2, set_flag `chr_self_deprecating`
  - 分支C（沉默隐退）: 你选择不回应，淡出公众视野 → chr -1, spr +2, set_flag `chr_went_quiet`

### chr_adult_true_love

- **标题**: 真爱的考验
- **描述**: 你终于遇到了一个让你想安定下来的人。但你的过去像幽灵一样缠绕着你——对方的朋友都警告"别和那个人在一起"。
- **年龄**: 28 - 36
- **权重**: 8
- **触发条件**: include: `attribute.chr >= 10`, `has.flag chr_self_reflection | has.flag chr_reformed | has.flag chr_tired_of_game`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1
- **分支**:
  - 分支A（用行动证明）: 你花很长时间用行动证明自己已经改变 → chr +2, spr +3, set_flag `chr_proved_change`
  - 分支B（退缩放弃）: 你害怕对方最终会离开你，主动放弃了 → chr -2, spr -2, set_flag `chr_feared_love`
  - 分支C（旧习难改）: 就在你以为能安定的时候，又一个人出现在你面前 → chr +1, spr -3, set_flag `chr_relapsed`

### chr_adult_marriage_pressure

- **标题**: 婚姻的十字路口
- **描述**: 你的恋人向你求婚了。这是你人生中最重要的选择之一——承诺意味着放弃其他所有可能性。
- **年龄**: 30 - 38
- **权重**: 8
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_proved_change | has.flag chr_chose_stability`; exclude: `has.flag chr_relapsed`
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: none
- **分支**:
  - 分支A（接受）: 你答应了。第一次，你选择了一个人走到最后 → chr +1, spr +4, set_flag `chr_married`
  - 分支B（犹豫）: "给我一些时间。"你不知道自己是在思考还是在逃避 → chr -1, set_flag `chr_hesitant`
  - 分支C（拒绝）: 你发现自己还没准备好为一个人放弃整个世界 → chr -2, spr -1, set_flag `chr_refused_marriage`

### chr_adult_settling_down

- **标题**: 安定还是流浪
- **描述**: 你站在人生的分岔路上。一边是温暖的家和稳定的生活，另一边是永远新的面孔和未知的刺激。
- **年龄**: 32 - 40
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 8`; exclude: none
- **unique**: true
- **tag**: life
- **priority**: normal
- **基础效果**: none
- **分支**:
  - 分支A（扎根）: 你选择了一座城市、一个人、一种生活 → spr +3, chr -1, set_flag `chr_settled`
  - 分支B（漂泊）: 你继续流浪，在每个城市留下一段故事 → chr +2, spr -1, set_flag `chr_eternal_wanderer`
  - 分支C（平衡）: 你找到了一种既有归属又不失自由的方式 → chr +1, spr +1, set_flag `chr_found_balance`

---

## Middle-Age（中年）— 5 个事件

### chr_mid_mature_charm

- **标题**: 成熟的魅力
- **描述**: 岁月没有摧毁你的魅力，反而赋予了它深度。年轻时的锐利变成了温润，你的笑容不再是武器，而是礼物。
- **年龄**: 40 - 50
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 10`, `has.flag chr_reformed | has.flag chr_graceful_past | has.flag chr_settled`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +3, spr +2
- **分支**:
  - 分支A（传道授业）: 你开始指导年轻人如何正确使用自己的魅力 → chr +2, int +2, set_flag `chr_mentor`
  - 分支B（继续享受）: 魅力不减当年，你依然享受社交的快乐 → chr +3, set_flag `chr_aging_gracefully`

### chr_mid_ghosts

- **标题**: 过去的幽灵
- **描述**: 一个你以为这辈子不会再见到的人出现了。对方带着一个孩子——那个孩子的眼睛和你年轻时一模一样。
- **年龄**: 40 - 50
- **权重**: 8
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_two_timer | has.flag chr_secret_deep | has.flag chr_rekindled`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr -1
- **分支**:
  - 分支A（承担责任）: 你决定面对过去，承担应尽的责任 → chr +1, spr +3, mny -3, set_flag `chr_took_responsibility`
  - 分支B（逃避否认）: "这不可能。"你转身离开，但心里知道真相 → chr -2, spr -3, set_flag `chr_denied_child`
  - 分支C（暗中资助）: 你不公开承认，但默默提供经济支持 → chr -1, mny -2, set_flag `chr_secret_support`

### chr_mid_ex_return

- **标题**: 前任的来信
- **描述**: 你收到了一封来自多年前的恋人的信。信里没有怨恨，只有一句："谢谢你教会我什么是爱，也教会我什么不是。"
- **年龄**: 42 - 52
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_kind_rejection | has.flag chr_cold_rejection | has.flag chr_confessed_regret`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: normal
- **基础效果**: chr +1
- **分支**:
  - 分支A（回信释然）: 你写了一封真诚的回信，两个成年人终于和解 → spr +3, set_flag `chr_found_closure`
  - 分支B（不回信）: 有些事情过去就过去了，回信只会搅动沉寂的湖水 → spr +1, set_flag `chr_silent_closure`
  - 分支C（见面叙旧）: 你们约了出来，发现彼此已经不是当年的人了 → chr +1, set_flag `chr_reunion`

### chr_mid_legacy

- **标题**: 风流遗产
- **描述**: 有人开始写你的传记。作者采访了你生命中出现过的人，每个人都讲述了一个完全不同的你。
- **年龄**: 45 - 55
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 10`, `has.flag chr_social_elite`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +2
- **分支**:
  - 分支A（配合传记）: 你坦诚地分享了自己的故事，包括不光彩的部分 → chr +2, spr +2, set_flag `chr_open_biography`
  - 分支B（要求修改）: 你试图控制叙事，只留下正面的形象 → chr -1, set_flag `chr_controlled_narrative`

### chr_mid_health_wake

- **标题**: 身体的警告
- **描述**: 多年的社交应酬和纸醉金迷开始反噬你的身体。医生说如果继续这样下去，你的时间不多了。
- **年龄**: 45 - 55
- **权重**: 5
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_addicted_fame | has.flag chr_hedonist | has.flag chr_spiraling`; exclude: none
- **unique**: true
- **tag**: life
- **priority**: normal
- **基础效果**: chr -2, str -2
- **分支**:
  - 分支A（痛改前非）: 你彻底改变了生活方式，把健康放在第一位 → str +2, spr +2, set_flag `chr_health_reform`
  - 分支B（我行我素）: "与其无聊地活，不如痛快地死。" → chr +1, str -3, set_flag `chr_lived_hard`

---

## Elder（晚年）— 4 个事件

### chr_elder_late_rose

- **标题**: 迟来的玫瑰
- **描述**: 你以为爱情已经和你无关了，直到你遇见了一个人。不再有年轻时的悸动，但有一种更深沉的温暖。你们在夕阳下散步，什么都不说就很美好。
- **年龄**: 60 - 70
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_settled | has.flag chr_found_balance | has.flag chr_refused_marriage`; exclude: none
- **unique**: true
- **tag**: love
- **priority**: major
- **基础效果**: chr +1, spr +3
- **分支**:
  - 分支A（珍惜当下）: 你不再想未来的事，只珍惜在一起的每一天 → spr +3, set_flag `chr_late_love`
  - 分支B（犹豫错失）: 你犹豫太久了，对方以为你没有心意 → chr -1, spr -2, set_flag `chr_missed_last_chance`

### chr_elder_charm_undiminished

- **标题**: 魅力不减
- **描述**: 年轻人惊讶地发现，年迈的你依然是最有趣的人。你的故事、你的幽默、你的温柔——时间带不走你身上最核心的东西。
- **年龄**: 60 - 75
- **权重**: 6
- **触发条件**: include: `attribute.chr >= 12`; exclude: none
- **unique**: true
- **tag**: social
- **priority**: normal
- **基础效果**: chr +2, spr +2
- **分支**:
  - 分支A（分享智慧）: 你把一生的经验传授给年轻人 → chr +2, int +2, set_flag `chr_elder_wisdom`
  - 分支B（继续传奇）: 你依然是社交场上的明星，只是换了一种优雅的方式 → chr +3, set_flag `chr_elder_socialite`

### chr_elder_regret

- **标题**: 月光下的回忆
- **描述**: 在一个安静的夜晚，你独自坐在窗前回忆过往。每一段感情都像流星——美丽但短暂。你开始想，如果当初做了不同的选择，现在会怎样？
- **年龄**: 65 - 80
- **权重**: 7
- **触发条件**: include: `attribute.chr >= 8`, `has.flag chr_lonely_popular | has.flag chr_eternal_wanderer | has.flag chr_feared_love`; exclude: none
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: spr -1
- **分支**:
  - 分支A（释然接受）: "每一段经历都塑造了现在的我。"你微笑着接受了一切 → spr +4, set_flag `chr_accepted_past`
  - 分支B（深陷遗憾）: 你沉浸在"如果当初"的假设中无法自拔 → spr -4, set_flag `chr_consumed_regret`
  - 分支C（提笔写信）: 你给生命中每个重要的人写了信，不管他们还在不在 → spr +2, chr +1, set_flag `chr_final_letters`

### chr_elder_finale

- **标题**: 花花公子的终章
- **描述**: 你的一生就像一首华丽的圆舞曲——旋转、拥抱、分离、再旋转。现在音乐要结束了，你最后看了一眼舞池。
- **年龄**: 70 - 90
- **权重**: 10
- **触发条件**: include: `attribute.chr >= 10`; exclude: none
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: chr +2
- **分支**:
  - 分支A（儿孙满堂）: 你的身边围满了人——爱人、子女、老友。热闹地谢幕 → spr +5, set_flag `chr_surrounded_by_love`
  - 分支B（孤独终老）: 你选择了自由，代价是最后的孤独。但你不后悔 → chr +2, spr -1, set_flag `chr_died_free`
  - 分支C（传奇不朽）: 你的故事被编成了歌谣，在酒馆里传唱。你以一种最花花公子的方式活在了人们口中 → chr +3, set_flag `chr_became_legend`

---

## Flag 依赖关系图

```
chr_born_favored ────────────────────────────→ 影响社交圈起点
chr_born_suspect ─────────────────────────────→ 可能触发特殊剧情
chr_childhood_sweetheart ──→ chr_first_love_serious ──→ chr_youth_love_triangle
chr_ambiguous_friendship ────────────────────→ 影响后续友情/爱情界限
chr_first_admirer_found ───→ chr_teen_first_love
chr_first_love_fickle ────→ chr_teen_jealousy ────→ chr_youth_heartbreak
chr_dance_disaster ───────→ chr_teen_jealousy
chr_two_timer ────────────→ chr_youth_secret_lover ──→ chr_mid_ghosts
                           └→ chr_youth_casanova_peak
chr_scandal_exposed ──────→ chr_youth_fame_cost ────→ chr_adult_reputation_crisis
chr_self_reflection ──────→ chr_adult_true_love ────→ chr_adult_marriage_pressure
chr_reformed ─────────────→ chr_adult_true_love ──→ chr_mid_mature_charm
chr_tired_of_game ────────→ chr_adult_true_love
chr_proved_change ────────→ chr_adult_marriage_pressure
chr_settled ──────────────→ chr_mid_mature_charm ──→ chr_elder_late_rose
chr_eternal_wanderer ─────→ chr_elder_regret
chr_feared_love ──────────→ chr_elder_regret
chr_lonely_popular ───────→ chr_elder_regret
```

## 设计说明

1. **Flag 连锁**：每个阶段的事件通过 flag 环环相扣，确保叙事连贯性
2. **负面体验**：约 40% 的事件/分支包含负面结果（被甩、翻车、孤独、遗憾）
3. **选择困境**：核心体验是"两难选择"，而非简单的对错
4. **人生弧光**：青年放纵 → 中年反思 → 晚年和解，完整的情感成长线
5. **魅力悖论**：高魅力 = 高吸引力 = 高风险，能力本身就是双刃剑
