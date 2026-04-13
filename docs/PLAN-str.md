# 体魄/战士路线 — 事件链计划书

> 路线属性：**STR 主导**
> 三条子线：格斗家 / 佣兵 / 守护者
> 事件总数：~35 个，覆盖 7 个阶段

---

## 阶段一：觉醒（6-10 岁）— 力量的萌芽

### str_1_playground_bully
- **标题**: 操场霸凌
- **描述**: 巷子口的大孩子又在欺负低年级的学生了。你攥紧了拳头——那个被推倒在地的小家伙正用求助的眼神看着你。
- **年龄**: 6 - 9
- **权重**: 8
- **触发条件**: include: `attribute.str >= 6`
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: 
  - `chr -1`（不管选什么，打架的名声都不好听）
- **分支**:
  - 分支A「挺身而出」: 你冲上去一拳把为首的大孩子打翻在地。虽然赢了，但手背蹭破了皮，老师的训斥也来了。 → `str +3`, `chr +1`, `set_flag.str_awakened`, `hp -3`
  - 分支B「告诉大人」: 你转身跑去找老师。霸凌被制止了，但那些孩子背地里叫你告密者。 → `int +2`, `spr +1`, `set_flag.guardian_tendency`
  - 分支C「忍住不管」: 你低着头走开了。那个眼神你记了很久。 → `spr -2`, `mny +1`（大孩子给你塞了零花钱封口）

### str_1_climbing_tree
- **标题**: 爬树冠军
- **描述**: 村里最高的那棵橡树上有个鸟窝，没人能爬到顶。小伙伴们打赌你也不行——这激起了你的好胜心。
- **年龄**: 7 - 10
- **权重**: 6
- **触发条件**: include: `attribute.str >= 7`
- **unique**: true
- **tag**: life
- **priority**: normal
- **基础效果**: `str +1`
- **分支**:
  - 分支A「徒手攀登」: 你手脚并用，踩着粗糙的树皮一路攀到了树冠。风从耳边吹过，你第一次觉得——高处也不可怕。 → `str +2`, `chr +1`, `set_flag.str_daring`
  - 分支B「爬到一半就下来」: 你爬了三分之二，低头看了一眼地面，手脚发软。小心驶得万年船。 → `spr +2`, `luk +1`

### str_1_falling_ill
- **标题**: 大病一场
- **描述**: 冬天的一场高烧把你击倒了。整整两周卧床不起，肌肉在消瘦，力气在流失。康复后你对着镜子里的瘦削身影发呆。
- **年龄**: 6 - 10
- **权重**: 5
- **触发条件**: exclude: `has.flag.str_iron_body`
- **unique**: true
- **tag**: life
- **priority**: normal
- **基础效果**: `str -2`, `hp -5`
- **分支**:
  - 分支A「疯狂补回来」: 病好后你开始每天跑步、举石头，用近乎自虐的方式恢复体能。 → `str +4`（净+2）, `set_flag.str_rebound`, `hp +3`
  - 分支B「慢慢调养」: 你学会了耐心。身体会恢复的，不用急。 → `spr +2`, `hp +5`

### str_1_farm_work
- **标题**: 农场苦力
- **描述**: 家里开垦了新田，你需要每天天不亮就去翻地、挑水、搬石头。繁重的体力活让你腰酸背痛，但身体也在悄悄变结实。
- **年龄**: 8 - 12
- **权重**: 7
- **触发条件**: none
- **unique**: false
- **tag**: life
- **priority**: normal
- **基础效果**: `str +2`, `hp +3`, `mny +2`
- **分支**:
  - 分支A「拼命干活」: 你咬牙把双倍的活干完了。手上全是血泡，但工钱也翻倍。 → `str +2`, `mny +3`, `set_flag.str_hard_worker`
  - 分支B「偷懒耍滑」: 你学会了在监工不注意的时候休息。聪明人的活法。 → `luk +2`, `int +1`

### str_1_wrestling_old_man
- **标题**: 退役老兵的摔跤课
- **描述**: 村口的独臂老头曾是王国骑士团的战士。他看你在搬石头，冷哼一声说"姿势不对"，然后把你摔进了泥地里。
- **年龄**: 8 - 11
- **权重**: 5
- **触发条件**: include: `attribute.str >= 8`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: `str +1`
- **分支**:
  - 分支A「拜师学艺」: 你在泥地里爬起来，认真地鞠了一躬。老头沉默了片刻，然后说："明天天亮来找我。" → `str +3`, `int +1`, `set_flag.str_mentor_soldier`, `grant_item.old_combat_manual`
  - 分支B「不服再战」: 你不服气，冲上去又被打翻。如此反复十几次，直到你累得站不起来。老头笑了："好，有骨气。" → `str +4`, `hp -5`, `set_flag.str_mentor_brawler`

---

## 阶段二：试炼（11-15 岁）— 走上不同的路

### str_2_street_fight
- **标题**: 街头斗殴
- **描述**: 集市的混混堵住了你的朋友，要收保护费。周围没有卫兵，只有你和你的拳头。
- **年龄**: 11 - 14
- **权重**: 7
- **触发条件**: include: `attribute.str >= 10`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: `str +1`
- **分支**:
  - 分支A「一拳定胜负」: 你直接朝领头的下巴招呼。一击倒地，其余人四散而逃。 → `str +3`, `chr +2`, `set_flag.str_brawler_path`, `set_flag.street_fighter`
  - 分支B「智取」: 你先假装掏钱，趁对方放松警惕时掀翻摊子制造混乱，拉着朋友就跑。 → `int +2`, `luk +2`, `set_flag.str_tactical`
  - 分支C「挡在前面不还手」: 你张开双臂挡在朋友面前，任凭拳头落在身上。"打够了就走吧。"混混们打了几拳觉得没意思，骂骂咧咧走了。 → `str +1`, `spr +3`, `set_flag.guardian_path`, `hp -8`

### str_2_mercenary_recruit
- **标题**: 佣兵团招人
- **描述**: "铁锤佣兵团"路过村庄，贴出了招募告示。不需要经验，只需要能扛得动剑。报酬：日结三银币。
- **年龄**: 13 - 15
- **权重**: 6
- **触发条件**: include: `attribute.str >= 12`
- **unique**: true
- **tag**: career
- **priority**: major
- **基础效果**: `mny +3`
- **分支**:
  - 分支A「报名入伍」: 你在报名单上按了手印。团长看了看你结实的胳膊，满意地点头。 → `str +2`, `set_flag.mercenary_path`, `set_flag.iron_hammer_member`, `chr -1`
  - 分支B「继续观望」: "再等等吧。"你撕掉了传单。 → `int +1`, `spr +1`

### str_2_guard_duty
- **标题**: 守夜人招募
- **描述**: 镇上的守卫队长在招募年轻民兵。与其说是士兵，不如说是保安——巡逻、站岗、检查路条。但至少有工资拿。
- **年龄**: 12 - 15
- **权重**: 6
- **触发条件**: none
- **unique**: true
- **tag**: career
- **priority**: normal
- **基础效果**: `str +1`, `mny +2`
- **分支**:
  - 分支A「加入守卫队」: 你领到了一套皮甲和一杆长矛。不太合身，但感觉很踏实。 → `str +2`, `spr +2`, `set_flag.guardian_path`, `set_flag.town_guard`
  - 分支B「拒绝了」: 守卫？太无聊了。你想要更刺激的生活。 → `luk +1`

### str_2_first_weapon
- **标题**: 第一把武器
- **描述**: 你攒够了钱，走进铁匠铺。墙上挂满了各种兵器——沉重的战斧、灵活的短剑、还有朴实的训练木剑。
- **年龄**: 11 - 14
- **权重**: 7
- **触发条件**: include: `attribute.str >= 9`
- **unique**: true
- **tag**: combat
- **priority**: normal
- **基础效果**: `str +1`
- **分支**:
  - 分支A「选择重剑」: 你费了好大力气才把那柄双手剑提起来。"力量就是一切。" → `str +3`, `set_flag.str_heavy_weapon`, `grant_item.two_handed_sword`
  - 分支B「选择拳套」: 你看了看铁拳套，又看了看自己的拳头。"最好的武器就是自己的身体。" → `str +2`, `chr +1`, `set_flag.str_unarmed`, `grant_item.iron_knuckles`
  - 分支C「选择长矛与盾」: 攻防兼备。你举起盾牌，透过缝隙看世界。 → `str +2`, `spr +1`, `set_flag.str_spear_shield`, `grant_item.spear_and_shield`

### str_2_training_injury
- **标题**: 训练受伤
- **描述**: 你在练习劈砍时，木头靶突然碎裂，碎片划过你的手臂。伤口不深，但如果处理不好会留下隐患。
- **年龄**: 12 - 15
- **权重**: 5
- **触发条件**: include: `has.flag.str_mentor_soldier OR has.flag.str_mentor_brawler`
- **unique**: true
- **tag**: combat
- **priority**: normal
- **基础效果**: `hp -5`, `str -1`
- **分支**:
  - 分支A「咬牙继续练」: 你用布条缠住伤口继续挥剑。血渗出来也不停。伤疤会成为勋章。 → `str +3`, `hp -3`（净-8）, `spr +2`, `set_flag.str_iron_will`
  - 分支B「停下来养伤」: 磨刀不误砍柴工。你休息了两周，认真研究了战斗理论。 → `int +3`, `hp +5`

### str_2_protect_refugees
- **标题**: 流民车队
- **描述**: 一群逃避战乱的流民经过镇子，几个地痞趁机勒索他们。流民中有老人和孩子，他们无助地看着周围的路人。
- **年龄**: 12 - 15
- **权重**: 6
- **触发条件**: none
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: none
- **分支**:
  - 分支A「驱赶地痞」: 你挡在流民前面，用地痞的话说"有种就从我的尸体上踩过去"。他们见你不好惹，骂了几句走了。 → `str +1`, `chr +2`, `spr +2`, `set_flag.guardian_path`, `set_flag.refugee_hero`
  - 分支B「帮地痞收钱分一杯羹」: 弱肉强食。你帮地痞收了钱，分到了两枚银币。那天晚上你失眠了。 → `mny +5`, `spr -3`, `chr -2`
  - 分支C「视而不见」: 你低着头走过去了。不是不想帮——是怕打不过。 → `spr -1`

---

## 阶段三：淬炼（16-20 岁）— 身体与意志的考验

### str_3_arena_first_fight
- **标题**: 竞技场初战
- **描述**: 你被朋友拉去地下竞技场下注。斗到一半，一方弃权，主持人扫视全场问"有没有人愿意上来？"——目光落在你身上。
- **年龄**: 16 - 19
- **权重**: 6
- **触发条件**: include: `has.flag.street_fighter OR has.flag.str_brawler_path`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: none
- **分支**:
  - 分支A「上台一战」: 你跳上擂台。对手比你高一个头，但你的拳头比他快。三回合后，你站着，他躺下了。 → `str +3`, `chr +2`, `mny +4`, `set_flag.arena_fighter`, `set_flag.str_brawler_path`
  - 分支B「婉拒」: "我不打表演赛。"你转身离开，但心跳了好久才平复。 → `spr +2`, `int +1`

### str_3_mercenary_first_contract
- **标题**: 第一次委托
- **描述**: 作为佣兵团新兵，你接到了第一个任务：护送商队穿越狼群出没的森林。听起来简单，但老兵们的表情不太轻松。
- **年龄**: 16 - 19
- **权重**: 6
- **触发条件**: include: `has.flag.iron_hammer_member`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: `str +1`, `mny +3`
- **分支**:
  - 分支A「主动请缨前锋」: 你走在队伍最前面。狼群来袭时，你第一个迎上去。三头狼倒下了，你的小腿也被咬了一口。 → `str +3`, `hp -8`, `chr +2`, `set_flag.mercenary_brave`
  - 分支B「守卫后方」: "我守着货物就行。"你的冷静让商队老板很满意，额外给了小费。 → `mny +3`, `spr +2`, `int +1`

### str_3_guard_siege
- **标题**: 盗匪围攻
- **描述**: 一群有组织的盗匪趁夜色攻击镇子。火光冲天，尖叫声此起彼伏。你穿着皮甲站在城墙上，手里是一杆长矛。
- **年龄**: 16 - 20
- **权重**: 7
- **触发条件**: include: `has.flag.town_guard`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: `str +2`, `hp -3`
- **分支**:
  - 分支A「坚守城墙」: 你一次又一次把爬上来的盗匪捅下去。天亮时，你面前的城墙上全是血。 → `str +3`, `spr +3`, `chr +3`, `set_flag.guardian_path`, `set_flag.wall_defender`, `hp -10`
  - 分支B「带人突围求援」: 你带三个守卫从侧门杀出去，跑去最近的驻军求援。援军及时赶到。 → `int +3`, `str +2`, `set_flag.str_tactical`

### str_3_tournament
- **标题**: 武斗大会
- **描述**: 王都举办的青年武斗大会，各地高手云集。奖金丰厚，但对手也是最强的。
- **年龄**: 17 - 20
- **权重**: 5
- **触发条件**: include: `attribute.str >= 15`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: none
- **分支**:
  - 分支A「全力争冠」: 你一路过关斩将杀入决赛。最后的对手是个沉默寡言的女战士——你们打了整整十回合。 → diceCheck `str DC18` → 成功: `str +4`, `chr +5`, `mny +8`, `set_flag.tournament_champion` / 失败: `str +2`, `hp -10`
  - 分支B「点到为止」: 你在半决赛时主动认输。"我看到了差距。" → `int +2`, `spr +2`, `set_flag.str_humble`

### str_3_scars
- **标题**: 伤疤
- **描述**: 你低头看着自己身上的伤——手臂上的刀疤、膝盖的旧伤、还有后背的淤青。这些都是战斗的代价。医生说你的右肩有隐患，再受重击可能会永久损伤。
- **年龄**: 17 - 20
- **权重**: 4
- **触发条件**: include: `has.flag.str_iron_will OR hp < max_hp * 0.5`
- **unique**: true
- **tag**: life
- **priority**: normal
- **基础效果**: `hp -5`
- **分支**:
  - 分支A「调整战斗风格」: 你开始练习用左臂发力，改变站姿减少右肩受力。适应花了很久，但你变得更全面了。 → `int +2`, `str +1`, `set_flag.str_adapted_style`
  - 分支B「无视警告继续」: "伤疤是战士的勋章。"你继续高强度训练。 → `str +3`, `hp -8`, `set_flag.str_shoulder_risk`

### str_3_fortress_duty
- **标题**: 边境要塞
- **描述**: 你被派往边境要塞驻守三个月。无聊的巡逻、粗粝的食物、单调的号角声——但真正的考验是某天夜里响起的战备警报。
- **年龄**: 17 - 20
- **权重**: 5
- **触发条件**: none
- **unique**: false
- **tag**: career
- **priority**: normal
- **基础效果**: `str +1`, `spr +1`
- **分支**:
  - 分支A「积极融入军营」: 你和老兵们打成一片，学会了军队中的实战技巧。 → `str +3`, `chr +2`, `set_flag.military_training`
  - 分支B「独来独往」: 你一个人加练，不和任何人交心。强，但孤独。 → `str +4`, `chr -3`, `spr -1`

---

## 阶段四：熔炉（21-28 岁）— 战争与抉择

### str_4_war_breaks_out
- **标题**: 战争爆发
- **描述**: 边境冲突升级为全面战争。征兵令贴满了每个城镇。不管你之前在做什么——格斗家、佣兵、守卫——现在你都是士兵。
- **年龄**: 21 - 25
- **权重**: 8
- **触发条件**: include: `attribute.str >= 18`
- **unique**: true
- **tag**: combat
- **priority**: critical
- **基础效果**: `str +1`
- **分支**:
  - 分支A「主动请战」: 你第一时间报名上了前线。不是因为爱国——是因为你的拳头只有打在敌人身上才有意义。 → `str +3`, `chr +2`, `set_flag.war_volunteer`
  - 分支B「被迫入伍」: 没得选。征兵官把你从家里拖了出来。 → `spr -2`, `set_flag.war_conscripted`
  - 分支C「带人撤离到后方」: 你组织平民向后方转移，放弃了战斗的机会。 → `spr +3`, `chr +2`, `set_flag.guardian_path`, `set_flag.evacuation_leader`

### str_4_first_battle
- **标题**: 初阵
- **描述**: 第一次真正的战场。不是竞技场的角斗，不是小规模的冲突——是几千人绞杀在一起的血肉磨坊。你身边的战友在惨叫，敌人的脸在你面前扭曲。
- **年龄**: 21 - 26
- **权重**: 7
- **触发条件**: include: `has.flag.war_volunteer OR has.flag.war_conscripted OR has.flag.iron_hammer_member`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: `hp -10`, `spr -2`
- **分支**:
  - 分支A「杀出血路」: 你像野兽一样在战场上横冲直撞，敌人的血溅满了你的铠甲。活着回来的感觉很不真实。 → `str +5`, `chr +1`, `spr -3`, `set_flag.str_berserker`, `hp -8`
  - 分支B「保护战友」: 你把受伤的战友背在背上，一边挡刀一边撤退。你救了三个人。 → `str +2`, `spr +3`, `chr +3`, `set_flag.guardian_path`, `set_flag.battlefield_savior`, `hp -12`
  - 分支C「独自脱出」: 混乱中你和部队走散了。你独自在死人堆里趴了一夜才摸回营地。 → `luk +3`, `int +2`, `spr -1`

### str_4_arena_champion
- **标题**: 竞技场冠军赛
- **描述**: 你从地下竞技场一路打到了年度总决赛。对手是蝉联三年的卫冕冠军——"铁壁"格雷戈。看台上坐满了人，赌注已经堆到了天价。
- **年龄**: 22 - 27
- **权重**: 5
- **触发条件**: include: `has.flag.arena_fighter`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: none
- **分支**:
  - 分支A「正面对决」: 你和格雷戈硬碰硬打了十五分钟。最后你一记上勾拳把他打上了天。全场沸腾。 → `str +4`, `chr +5`, `mny +10`, `set_flag.arena_champion`, `set_flag.str_brawler_path`
  - 分支B「输掉比赛」: 格雷戈的经验比你丰富太多。你被击倒三次，最后一次没能站起来。但观众的掌声说明你赢得了尊重。 → `str +2`, `spr +2`, `int +2`, `hp -15`

### str_4_mercenary_betrayal
- **标题**: 佣兵的抉择
- **描述**: 团长接了一份特殊委托：烧毁一个"敌对村庄"。但你到了现场发现——那只是个普通村庄，有老人和孩子。团长说"雇主的钱已经收了"。
- **年龄**: 22 - 27
- **权重**: 6
- **触发条件**: include: `has.flag.iron_hammer_member`
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: none
- **分支**:
  - 分支A「执行命令」: 你闭上眼睛，举起了火把。那天晚上你听到了哭声。很久很久。 → `mny +8`, `spr -5`, `chr -3`, `set_flag.mercenary_ruthless`
  - 分支B「抗命保护村民」: 你把剑横在团长面前。"要走先过我这关。"你被打得半死，但村民们逃了。你被赶出了佣兵团。 → `str +2`, `spr +5`, `chr +3`, `set_flag.guardian_path`, `set_flag.expelled_mercenary`, `hp -15`, `remove_flag.iron_hammer_member`
  - 分支C「悄悄放走村民再烧空村」: 你偷偷让村民在天亮前离开，然后烧了空房子交差。团长没发现。 → `int +3`, `spr +1`, `luk +2`

### str_4_siege_defense
- **标题**: 城市围困
- **描述**: 敌军围城已持续三周。粮草即将耗尽，城内开始有人饿死。守城将军问谁愿意带敢死队突围求援——生还概率不到三成。
- **年龄**: 22 - 28
- **权重**: 6
- **触发条件**: include: `has.flag.war_volunteer OR has.flag.town_guard OR has.flag.wall_defender`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: `hp -5`
- **分支**:
  - 分支A「加入敢死队」: 你带着十二个人冲出城门。枪林弹雨中你只想着一件事——跑。最后只有你和一个战友活着抵达了友军营地。 → `str +4`, `luk +3`, `chr +3`, `set_flag.siege_breaker`, `hp -20`, `set_flag.str_legendary_soldier`
  - 分支B「留在城内维持秩序」: 城内开始暴乱，饥民冲击粮仓。你站在粮仓门口，一边分发最后的口粮一边维持秩序。 → `spr +4`, `chr +2`, `set_flag.guardian_path`

### str_4_war_wound
- **标题**: 重伤
- **描述**: 一支流箭贯穿了你的肩膀。军医说取出箭头后要休养至少两个月，但明天还有一场战斗。
- **年龄**: 23 - 28
- **权重**: 5
- **触发条件**: include: `has.flag.war_volunteer OR has.flag.war_conscripted`
- **unique**: true
- **tag**: combat
- **priority**: normal
- **基础效果**: `str -3`, `hp -15`
- **分支**:
  - 分支A「带伤上阵」: 你拔掉箭头，用烈酒消毒，缠上绷带就上了战场。箭伤撕裂了，但你砍翻了四个敌人。 → `str +2`（净-1）, `spr +3`, `set_flag.str_shoulder_risk`, `hp -10`, `chr +2`
  - 分支B「老老实实养伤」: 两个月后你完全恢复了。但你错过了那场关键战役，听说很多战友没能回来。 → `hp +10`, `spr -2`, `int +2`

---

## 阶段五：蜕变（29-38 岁）— 成为传说

### str_5_war_hero_return
- **标题**: 战争英雄归来
- **描述**: 战争结束了。你带着勋章和伤疤回到了家乡。有人在酒馆里认出了你，端着酒杯过来敬酒。但也有人在背后议论："杀了那么多人的手，也好意思握酒杯？"
- **年龄**: 29 - 33
- **权重**: 6
- **触发条件**: include: `has.flag.siege_breaker OR has.flag.battlefield_savior OR has.flag.str_berserker`
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: `chr +3`, `mny +5`
- **分支**:
  - 分支A「享受荣光」: 你接受了敬酒和赞美。你配得上这些。 → `chr +3`, `mny +3`, `set_flag.war_hero`
  - 分支B「沉默离开」: 你放下酒杯走了。你不觉得自己是英雄——你只是活下来的那个。 → `spr +3`, `int +2`

### str_5_arena_legend
- **标题**: 不败传说
- **描述**: 你已经连续赢了二十七场竞技场比赛。人们开始叫你"铁拳"。赌场的赔率已经没人敢押你输了。但挑战者也越来越强——尤其是从战场回来的老兵们。
- **年龄**: 29 - 35
- **权重**: 5
- **触发条件**: include: `has.flag.arena_champion`
- **unique**: true
- **tag**: combat
- **priority**: major
- **基础效果**: `chr +2`
- **分支**:
  - 分支A「接受所有挑战」: 你来者不拒。有人用暗器，有人用阴招，你都一一化解。第三十场，你终于遇到了旗鼓相当的对手——打满三十回合，平局收场。 → `str +3`, `chr +4`, `spr +2`, `set_flag.arena_legend`, `set_flag.str_brawler_path`
  - 分支B「急流勇退」: "二十七连胜，是个好数字。"你宣布退役，开了家武馆。 → `mny +8`, `chr +3`, `int +2`, `set_flag.martial_teacher`

### str_5_mercenary_captain
- **标题**: 独立佣兵团
- **描述**: 你拉了一支队伍出来单干。你的佣兵团以纪律严明著称——不烧杀、不抢掠、只接正当委托。有人嘲笑你"做佣兵还讲道德"，但委托人排着队找你。
- **年龄**: 30 - 36
- **权重**: 5
- **触发条件**: include: `has.flag.expelled_mercenary OR has.flag.iron_hammer_member`
- **unique**: true
- **tag**: career
- **priority**: major
- **基础效果**: `mny +5`, `chr +2`
- **分支**:
  - 分支A「做大做强」: 你接下了越来越大的委托，队伍扩编到两百人。你的佣兵团成了王国最可靠的第三方力量。 → `mny +8`, `chr +4`, `str +2`, `set_flag.mercenary_captain`, `set_flag.str_legendary_soldier`
  - 分支B「坚持小队模式」: "人多了就不是兄弟了。"你只保留最信任的十二个人，专接高难度委托。 → `str +3`, `spr +3`, `chr +2`, `set_flag.str_elite_squad`

### str_5_guardian_oath
- **标题**: 守护者的誓言
- **描述**: 你站在被战火摧毁的村庄废墟前，对着仅存的村民单膝跪下。"我会保护你们。这是我的誓言。"——不是对国王，不是对国家，是对眼前这些人。
- **年龄**: 29 - 36
- **权重**: 5
- **触发条件**: include: `has.flag.guardian_path`
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: `spr +3`, `chr +3`
- **分支**:
  - 分支A「重建村庄」: 你用积蓄和劳动力帮村民重建家园。一砖一瓦，亲力亲为。 → `mny -5`, `spr +5`, `chr +4`, `set_flag.village_rebuilder`, `set_flag.guardian_path`
  - 分支B「建立民兵队」: 你训练村民自卫，教他们使用长矛和盾牌。"下次再有人来犯，你们自己就能保护自己。" → `str +2`, `int +2`, `chr +3`, `set_flag.militia_commander`

### str_5_old_rival
- **标题**: 宿敌再遇
- **描述**: 在一场宴会上，你遇到了曾经的对手——武斗大会上那个沉默的女战士，或者战场上的敌方军官。她端着酒杯走过来："好久不见。这次我不会再输。"
- **年龄**: 30 - 38
- **权重**: 4
- **触发条件**: include: `has.flag.tournament_champion OR has.flag.arena_legend`
- **unique**: true
- **tag**: combat
- **priority**: normal
- **基础效果**: none
- **分支**:
  - 分支A「切磋」: 你们在院子里打了半个小时。没有输赢——只是在确认彼此都还活着。她笑着说："下次正式比。" → `str +2`, `chr +2`, `spr +1`
  - 分支B「一笑泯恩仇」: "过去的就过去吧。"你们干了一杯。有些人不需要胜负来定义关系。 → `chr +3`, `spr +2`

---

## 阶段六：传奇（39-55 岁）— 传说铸就

### str_6_legendary_battle
- **标题**: 最后一战
- **描述**: 敌军大将亲自出马，单挑你的防线。他比你年轻二十岁，比你高两个头，用的武器是一柄比你人还长的巨戟。所有人都劝你避战。
- **年龄**: 39 - 50
- **权重**: 5
- **触发条件**: include: `attribute.str >= 25`
- **unique**: true
- **tag**: combat
- **priority**: critical
- **基础效果**: none
- **分支**:
  - 分支A「正面迎战」: 你脱掉铠甲——这会限制你的灵活性。三十年的战斗经验让你看穿了对手每一次攻击的破绽。你用一记简洁的直拳击中了他的咽喉。 → diceCheck `str DC25` → 成功: `str +5`, `chr +8`, `set_flag.legendary_warrior` / 失败: `hp -30`, `str +2`, `set_flag.str_retired_injured`
  - 分支B「战术围杀」: 你不和他单挑。你布下陷阱，指挥队伍把他围死。赢得不光彩，但你活着。 → `int +4`, `str +2`, `chr -1`

### str_6_passing_torch
- **标题**: 传承
- **描述**: 一个年轻人在你面前跪下："请收我为徒！"他眼里有你年轻时的影子——鲁莽、倔强、不怕疼。你想起了当年的自己。
- **年龄**: 40 - 52
- **权重**: 6
- **触发条件**: include: `has.flag.arena_legend OR has.flag.martial_teacher OR has.flag.legendary_warrior`
- **unique**: true
- **tag**: career
- **priority**: major
- **基础效果**: `chr +2`
- **分支**:
  - 分支A「收徒」: "从明天开始，每天天亮来找我。"你把毕生所学一点一点教给他。 → `spr +4`, `chr +3`, `int +2`, `set_flag.has_disciple`
  - 分支B「拒绝」: "我没有资格教人。我只是活了下来而已。" → `spr -1`, `int +1`

### str_6_fortress_builder
- **标题**: 钢铁堡垒
- **描述**: 你用半生的积蓄和威望，在边境建立了一座堡垒——不是为了进攻，是为了保护身后的人。流民、伤兵、孤儿，都在这里找到了家。
- **年龄**: 42 - 55
- **权重**: 4
- **触发条件**: include: `has.flag.guardian_path AND has.flag.village_rebuilder`
- **unique**: true
- **tag**: career
- **priority**: major
- **基础效果**: `chr +4`, `spr +3`, `mny -8`
- **分支**:
  - 分支A「守护到最后」: 你把余生都献给了这座堡垒。当最后一场战争来临时，你站在城墙上，身后是一千个你保护的人。 → `spr +5`, `chr +5`, `set_flag.iron_guardian`, `set_flag.guardian_path`
  - 分支B「交给年轻人管理」: 你选了一个可靠的继任者，自己退居幕后指导。 → `int +3`, `chr +3`, `mny +4`

### str_6_glory_and_ashes
- **标题**: 荣光与余烬
- **描述**: 你已经很久没上过战场了。但每当夜深人静，你还是会梦到那些面容——战死的战友、被救的村民、倒在拳台下的对手。荣耀是真实的，代价也是。
- **年龄**: 45 - 55
- **权重**: 4
- **触发条件**: include: `attribute.str >= 22`
- **unique**: true
- **tag**: life
- **priority**: normal
- **基础效果**: `spr -1`
- **分支**:
  - 分支A「写下回忆录」: 你把一生的故事写了下来。不是为了炫耀，是为了让后人知道——和平的代价是什么。 → `int +3`, `chr +3`, `spr +2`, `set_flag.memoir_written`
  - 分支B「沉默以对」: 有些事说不出口。你只是默默地给阵亡战友的墓前放了一束花。 → `spr +3`

### str_6_champion_return
- **标题**: 竞技场传奇归来
- **描述**: 竞技场举办二十周年纪念赛，邀请你作为特邀嘉宾出席。主持人宣布要为你颁发"终身成就奖"。全场起立鼓掌。
- **年龄**: 42 - 52
- **权重**: 4
- **触发条件**: include: `has.flag.arena_legend`
- **unique**: true
- **tag**: life
- **priority**: normal
- **基础效果**: `chr +3`, `mny +5`
- **分支**:
  - 分支A「登台致辞」: "我只是一个喜欢打架的普通人。"你的话让全场又笑又哭。 → `chr +5`, `spr +2`, `set_flag.str_brawler_path`
  - 分支B「婉拒出席」: 你让徒弟替你去领奖。你坐在家里喝着啤酒看电视转播。 → `spr +2`, `luk +2`

---

## 阶段七：暮年（56+ 岁）— 不灭的火

### str_7_last_stand
- **标题**: 最后一道防线
- **描述**: 敌军突破了前线，正在向你的堡垒推进。守军不足百人，而你今年已经五十八岁了。膝盖在下雨天会疼，右肩的旧伤让你举不起重剑。但你站在了最前面。
- **年龄**: 56 - 70
- **权重**: 4
- **触发条件**: include: `has.flag.iron_guardian OR has.flag.legendary_warrior`
- **unique**: true
- **tag**: combat
- **priority**: critical
- **基础效果**: `str -2`（岁月不饶人）
- **分支**:
  - 分支A「死守不退」: 你用长矛代替了重剑。一刺、一收、再刺。从日出到日落，你不知道自己杀了多少。援军在黄昏时分赶到——你跪倒在地，但防线没破。 → `chr +8`, `spr +5`, `hp -25`, `set_flag.last_stand_hero`
  - 分支B「带着所有人撤离」: "活着比死守更重要。"你指挥所有人从密道撤离，亲手断后。堡垒被烧毁了，但人都活着。 → `spr +5`, `chr +5`, `int +3`

### str_7_old_warrior_peace
- **标题**: 老兵的和平
- **描述**: 战争彻底结束了。你坐在村口的大树下，看着孩子们在田野里奔跑。一个小孩跑过来问："爷爷，你以前是做什么的？"
- **年龄**: 56 - 80
- **权重**: 5
- **触发条件**: include: `attribute.str >= 20`
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: `spr +3`
- **分支**:
  - 分支A「讲故事」: 你把一生的故事讲给了那个孩子。战争、荣耀、失去、重生。孩子听得眼睛发亮。"我以后也要变强！"你摸了摸他的头："变强是为了保护，记住。" → `chr +4`, `spr +4`, `set_flag.str_legacy`
  - 分支B「一笑而过」: "种地的。"你笑了笑，没再多说。有些故事，只属于自己。 → `spr +5`, `luk +2`

### str_7_disciple_surpass
- **标题**: 青出于蓝
- **描述**: 你的徒弟在武斗大会上夺得了冠军。他第一时间跑来找你，把奖杯举到你面前："师父！我做到了！"
- **年龄**: 58 - 75
- **权重**: 4
- **触发条件**: include: `has.flag.has_disciple`
- **unique**: true
- **tag**: life
- **priority**: major
- **基础效果**: `chr +3`, `spr +3`
- **分支**:
  - 分支A「骄傲」: 你看着奖杯，眼眶湿润了。"你比我强。这就对了。" → `spr +5`, `chr +2`, `set_flag.str_legacy`
  - 分支B「叮嘱」: "记住，拳头是用来保护人的。"你把师父曾经对你说过的话，又说了一遍。 → `spr +3`, `int +2`

### str_7_epitaph
- **标题**: 墓志铭
- **描述**: 你躺在病床上，知道自己时日无多。窗外是夕阳。你的一生从那个操场上攥紧拳头的孩子开始，走过了竞技场、战场、堡垒——最终回到了这张安静的床上。你让身边的人拿来纸笔，写下了最后一行字。
- **年龄**: 60 - 90
- **权重**: 3
- **触发条件**: include: `attribute.str >= 15`
- **unique**: true
- **tag**: life
- **priority**: critical
- **基础效果**: none
- **分支**:
  - 分支A「"此处安眠一个保护过别人的普通人。"」→ 结局判定：守护者线 → `set_flag.ending_guardian`
  - 分支B「"来世还要打。"」→ 结局判定：格斗家线 → `set_flag.ending_brawler`
  - 分支C「"佣兵的最后一单——守住了这条命。"」→ 结局判定：佣兵线 → `set_flag.ending_mercenary`

---

## 事件统计

| 阶段 | 年龄段 | 事件数 | 关键词 |
|------|--------|--------|--------|
| 一·觉醒 | 6-10 | 5 | 力量萌芽、选择倾向 |
| 二·试炼 | 11-15 | 6 | 子线分流、第一把武器 |
| 三·淬炼 | 16-20 | 6 | 竞技场/佣兵/守卫各自展开 |
| 四·熔炉 | 21-28 | 6 | 战争、重伤、道德抉择 |
| 五·蜕变 | 29-38 | 5 | 传奇起步、传承开始 |
| 六·传奇 | 39-55 | 5 | 传说铸就、堡垒/传承 |
| 七·暮年 | 56+ | 4 | 最后一战、结局 |
| **总计** | | **37** | |

## Flag 路线图

### 格斗家线 flags
`street_fighter` → `str_brawler_path` → `arena_fighter` → `arena_champion` → `arena_legend` → `ending_brawler`

### 佣兵线 flags
`iron_hammer_member` → `mercenary_path` → `mercenary_brave` / `mercenary_ruthless` → `mercenary_captain` / `str_elite_squad` → `str_legendary_soldier` → `ending_mercenary`

### 守护者线 flags
`guardian_tendency` → `guardian_path` → `town_guard` / `refugee_hero` → `wall_defender` / `battlefield_savior` → `village_rebuilder` / `militia_commander` → `iron_guardian` → `last_stand_hero` → `ending_guardian`
