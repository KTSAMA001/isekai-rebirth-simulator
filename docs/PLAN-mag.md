# 魔力/魔导路线计划书 (PLAN-mag)

> mag 主导路线，~30 个事件，覆盖 7 个阶段（童年→少年→青年→壮年→中年→老年→终幕）
>
> 三条子线：学院正统 / 野路子 / 暗黑魔导
>
> 核心主题：魔力的代价、失控的后果、力量与理智的博弈

---

## 阶段 1：童年（0-6 岁）— 魔力觉醒

### MAG_p1_mana_awakening
- **标题**: 魔力涌动
- **描述**: 你的身体突然散发出淡蓝色光芒，周围的物体开始悬浮。父母惊恐地看着你——这不是普通孩子会有的表现。
- **年龄**: 3 - 6
- **权重**: 10
- **触发条件**: include: attribute.mag >= 6
- **unique**: true
- **tag**: magic, awakening
- **priority**: major
- **基础效果**: mag+1, spr-1（魔力扰动灵魂）
- **分支**:
  1. **压抑魔力** (prob: 0.4) — 你拼命压制体内的力量，光芒熄灭，但头疼欲裂。→ mag+1, spr+2, flag: mana_suppressed
  2. **释放魔力** (prob: 0.35) — 你放任魔力流淌，房间里的花瓶碎了一地。→ mag+3, str-1, flag: mana_wild
  3. **引导魔力** (prob: 0.25, require: attribute.int >= 6) — 你本能地将魔力聚集成一个小球，虽然只持续了三秒。→ mag+2, int+2, flag: mana_control_talent

### MAG_p1_strange_dreams
- **标题**: 魔力之梦
- **描述**: 每到深夜，你都会梦到一片无垠的紫色海洋。梦中有一个声音在呼唤你的名字。你醒来时，枕头总是湿的——不是汗水，是散发着微光的液体。
- **年龄**: 2 - 5
- **权重**: 7
- **触发条件**: include: attribute.mag >= 8
- **unique**: true
- **tag**: magic, omen
- **priority**: normal
- **基础效果**: spr+1
- **分支**:
  1. **跟随声音** (prob: 0.5) — 你在梦中向声音走去，看到了一个模糊的身影在对你微笑。→ mag+2, flag: dream_caller
  2. **强迫自己醒来** (prob: 0.3) — 你咬破舌尖，从梦中挣脱。此后你再也没做过那个梦。→ spr+2, luk+1
  3. **在梦中施法** (prob: 0.2, require: attribute.mag >= 10) — 你尝试在梦中使用魔力，紫色的海洋掀起了巨浪。→ mag+3, flag: dream_magic, flag: mana_instability

### MAG_p1_accident
- **标题**: 魔力事故
- **描述**: 你情绪失控时，魔力猛烈爆发。家里的墙壁出现了裂痕，附近的树木枯萎了。
- **年龄**: 4 - 7
- **权重**: 6
- **触发条件**: include: flag.mana_wild
- **unique**: true
- **tag**: magic, danger
- **priority**: major
- **基础效果**: mag+1, chr-2（邻居开始害怕你）
- **分支**:
  1. **被送往远方** (prob: 0.4) — 父母决定把你送到镇上的老魔法师那里寻求帮助。→ flag: sent_to_hermit, mag+1
  2. **被锁在屋里** (prob: 0.3) — 父母害怕你的力量，把你关了起来。→ str+1, chr-2, flag: isolated_child, spr-1
  3. **自行平息** (prob: 0.3, require: attribute.mag >= 10) — 你深呼吸，奇迹般地控制住了魔力。→ mag+2, flag: self_control

---

## 阶段 2：少年（7-14 岁）— 路线分歧

### MAG_p2_academy_letter
- **标题**: 魔法学院来信
- **描述**: 一只水晶蝴蝶送来了魔力学院的入学通知。这是所有魔力天赋者梦寐以求的机会。
- **年龄**: 7 - 10
- **权重**: 9
- **触发条件**: include: attribute.mag >= 8; exclude: has.flag.magic_student
- **unique**: true
- **tag**: magic, academy, crossroad
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **入学就读** (prob: 0.5) — 你踏入学院大门，开始了正统魔导学习之路。→ mag+3, int+2, str-2, mny-3, flag: magic_student, flag: academy_path, item: crystal_shard
  2. **拒绝入学** (prob: 0.3) — "我不想被关在塔里。"你把信收进了抽屉。→ str+2, spr+2, int-2, flag: academy_refused
  3. **暗中入学** (prob: 0.2, require: attribute.int >= 10) — 你入学了，但同时在偷偷研究禁忌文献。→ mag+2, int+3, flag: magic_student, flag: secret_research, flag: dark_tendency

### MAG_p2_hermit_apprentice
- **标题**: 隐居老者的弟子
- **描述**: 镇外的老魔法师收你为徒。他不属于任何学院，教的都是"野路子"——但出奇地实用。
- **年龄**: 7 - 12
- **权重**: 6
- **触发条件**: include: flag.sent_to_hermit OR flag.academy_refused
- **unique**: true
- **tag**: magic, wild_path
- **priority**: major
- **基础效果**: mag+2, spr+1
- **分支**:
  1. **认真学艺** (prob: 0.5) — 你跟随老者学习，虽然不正规，但你学会了学院不教的实用魔法。→ mag+3, int+2, flag: hermit_apprentice, flag: wild_magic
  2. **偷学禁术** (prob: 0.25) — 你趁老者不在时翻看了他锁起来的书。那些文字让你头晕目眩。→ mag+4, spr-2, flag: forbidden_glimpse, flag: dark_tendency
  3. **不辞而别** (prob: 0.25) — 你受不了寂寞的山林生活，偷偷离开了。→ luk+1, flag: runaway, chr-1

### MAG_p2_first_spell
- **标题**: 初次施法
- **描述**: 你终于成功释放了人生中第一个完整的法术。但施法后的疲惫感让你意识到——魔力不是凭空而来的。
- **年龄**: 8 - 12
- **权重**: 8
- **触发条件**: include: has.flag.magic_student OR has.flag.hermit_apprentice
- **unique**: true
- **tag**: magic, milestone
- **priority**: major
- **基础效果**: mag+2, hp-3
- **分支**:
  1. **火球术** (prob: 0.4) — 一颗完美的火球在你掌心成型。教室里的同学们发出了惊叹。→ mag+2, flag: fire_affinity
  2. **护盾术** (prob: 0.35) — 你本能地选择了防御法术。一个淡蓝色的光盾将你包裹。→ mag+1, spr+2, flag: shield_affinity
  3. **失控暴走** (prob: 0.25, require: flag.mana_instability) — 法术失控了。魔力在你体内横冲直撞，你昏迷了三天。→ mag+4, hp-10, flag: mana_burst, flag: magic_trauma

### MAG_p2_forbidden_library
- **标题**: 禁忌书架
- **描述**: 学院图书馆最深处有一扇上了三道锁的门。你不知道是什么驱使你在深夜来到了这里。
- **年龄**: 10 - 14
- **权重**: 5
- **触发条件**: include: has.flag.magic_student; (flag.secret_research OR attribute.int >= 12)
- **unique**: true
- **tag**: magic, dark, crossroad
- **priority**: major
- **基础效果**: 无
- **分支**:
  1. **打开门** (prob: 0.3) — 你撬开了锁。里面的书籍散发着令人不安的紫黑色光芒。→ mag+3, spr-3, flag: forbidden_knowledge, flag: dark_tendency
  2. **转身离开** (prob: 0.4) — 理智占了上风，你转身离开了。但那扇门的声音在你梦中反复出现。→ spr+2, flag: temptation_resisted
  3. **报告导师** (prob: 0.3) — 你把发现告诉了导师。导师面色凝重地说："忘掉你看到的。" → chr+2, int+1, flag: trusted_by_mentor

### MAG_p2_bully_fight
- **标题**: 魔力冲突
- **描述**: 一个高年级学生在走廊里嘲笑你的魔力波动"像个怪物"。你的拳头攥紧了，魔力开始不受控制地涌出。
- **年龄**: 9 - 13
- **权重**: 7
- **触发条件**: include: has.flag.magic_student
- **unique**: true
- **tag**: magic, conflict
- **priority**: normal
- **基础效果**: mag+1
- **分支**:
  1. **用魔法反击** (prob: 0.35) — 你一掌推出去，魔力波把对方震飞了三米。→ mag+2, chr-2, flag: violent_magic
  2. **忍耐** (prob: 0.4) — 你咬着牙忍了下来。那个晚上，你在宿舍里默默修炼到天亮。→ spr+2, int+1, flag: disciplined
  3. **魔力暴走** (prob: 0.25, require: flag.mana_burst) — 你没有控制住。半个走廊被炸毁，你被停学了两周。→ mag+3, chr-3, hp-8, flag: dangerous_student

---

## 阶段 3：青年（15-22 岁）— 深化/堕落

### MAG_p3_academy_graduation
- **标题**: 学院毕业考核
- **描述**: 毕业考核：在魔物密林中生存三天并带回魔物核心。这是你成为正式魔导士的最后一步。
- **年龄**: 15 - 18
- **权重**: 8
- **触发条件**: include: has.flag.magic_student, attribute.mag >= 12
- **unique**: true
- **tag**: magic, academy, milestone
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **优异成绩毕业** (prob: 0.3, require: attribute.mag >= 16) — 你带回了一颗罕见的龙蜥核心，被授予"杰出毕业生"称号。→ mag+3, chr+2, flag: top_graduate, item: dragon_lizard_core
  2. **勉强通过** (prob: 0.4) — 你险险地拿到了一颗低级核心，勉强毕业。→ mag+1, flag: average_graduate
  3. **考核中暴走** (prob: 0.3, require: flag.mana_burst) — 你在密林中魔力失控，虽然最终通过，但给导师留下了隐患。→ mag+2, flag: unstable_graduate, flag: watched_by_council

### MAG_p3_wild_awakening
- **标题**: 荒野中的觉醒
- **描述**: 你独自在荒野中流浪时遇到了魔力潮汐——一种自然发生的魔力风暴。别人会死，但你的身体在疯狂地吸收这些魔力。
- **年龄**: 15 - 20
- **权重**: 6
- **触发条件**: include: flag.wild_magic OR flag.runaway
- **unique**: true
- **tag**: magic, wild_path, milestone
- **priority**: major
- **基础效果**: mag+3, hp-8
- **分支**:
  1. **顺势吸收** (prob: 0.4) — 你放任身体吸收魔力潮汐。你变得更强了，但眼睛的颜色开始改变。→ mag+5, spr-2, flag: mana_overflow, flag: changed_eyes
  2. **部分吸收后逃离** (prob: 0.35) — 你及时收手，带着比原来强得多的力量离开了。→ mag+3, flag: wild_power
  3. **被魔力击倒** (prob: 0.25) — 你低估了潮汐的威力，被打成重伤。但伤愈后你的魔力更加凝聚。→ mag+2, hp-15, flag: tempered_by_nature

### MAG_p3_dark_ritual
- **标题**: 暗黑仪式
- **描述**: 你找到了一本描述暗黑魔导仪式的古籍。仪式承诺巨大力量，但需要以某种代价交换。
- **年龄**: 16 - 22
- **权重**: 5
- **触发条件**: include: flag.forbidden_knowledge OR flag.dark_tendency
- **unique**: true
- **tag**: magic, dark, crossroad
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **执行仪式** (prob: 0.3) — 你完成了仪式。力量如潮水般涌来，但你感到有什么东西在你体内苏醒了。→ mag+6, spr-4, hp-10, flag: dark_pact, flag: inner_demon
  2. **半途而废** (prob: 0.3) — 仪式进行到一半你停了下来。代价已经付出了一部分。→ mag+2, spr-1, flag: partial_dark_pact
  3. **销毁古籍** (prob: 0.4) — 你烧掉了那本书。烟雾中似乎有一张脸在对你微笑。→ spr+3, flag: dark_resisted

### MAG_p3_mentor_trial
- **标题**: 导师的试炼
- **描述**: 你的导师要你去调查一个废弃的魔法塔。传说那里曾有一位魔导大师在研究"魔力的本质"时发疯了。
- **年龄**: 16 - 20
- **权重**: 6
- **触发条件**: include: has.flag.magic_student OR has.flag.hermit_apprentice
- **unique**: true
- **tag**: magic, story
- **priority**: major
- **基础效果**: int+1
- **分支**:
  1. **完成调查** (prob: 0.5) — 你在塔中发现了那位大师的研究笔记。虽然残缺不全，但其中的理论令你大开眼界。→ mag+2, int+3, item: mad_mage_notes, flag: research_insight
  2. **被塔中残留魔力影响** (prob: 0.3) — 你在塔中产生了幻觉，看到了那位大师最后的疯狂时刻。→ mag+1, spr-2, flag: madness_glimpse
  3. **发现暗黑实验** (prob: 0.2, require: flag.dark_tendency) — 你在地下室发现了被掩盖的暗黑实验记录。这些知识太危险，也太诱人。→ mag+3, spr-2, flag: dark_experiment_found

### MAG_p3_mana_cost
- **标题**: 魔力的代价
- **描述**: 你发现每次施展强力法术后，身体某处会出现黑色纹路。这些纹路在缓慢扩散。
- **年龄**: 17 - 22
- **权重**: 7
- **触发条件**: include: attribute.mag >= 14
- **unique**: true
- **tag**: magic, cost
- **priority**: major
- **基础效果**: mag+1, spr-1
- **分支**:
  1. **寻求治疗** (prob: 0.4) — 你去找了高级治疗师。纹路暂时停止扩散，但你被警告：过度使用魔力会加速这个过程。→ flag: mana_blight_aware, flag: seeking_cure
  2. **不管不顾** (prob: 0.3) — 你选择无视，继续使用魔力。纹路扩散到了手臂。→ mag+2, spr-2, flag: mana_corruption_spreading
  3. **研究纹路** (prob: 0.3, require: attribute.int >= 14) — 你开始研究这些纹路，发现它们可能是通往更高层次魔力的钥匙——也可能是毁灭。→ mag+3, int+2, flag: blight_research

---

## 阶段 4：壮年（23-35 岁）— 大师/失控

### MAG_p4_master_trial
- **标题**: 魔导大师认证
- **描述**: 魔导协会开放了大师级认证考核。你需要创造一个全新的原创法术。
- **年龄**: 23 - 30
- **权重**: 7
- **触发条件**: include: flag.top_graduate OR attribute.mag >= 18
- **unique**: true
- **tag**: magic, academy, milestone
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **成功认证** (prob: 0.3, require: attribute.mag >= 20 AND attribute.int >= 16) — 你创造了一种全新的元素融合法术，获得了大师称号。→ mag+4, chr+3, flag: magus_master, flag: academy_elite
  2. **失败但有所悟** (prob: 0.4) — 你的法术理论正确但实践失败。评审认为你有潜力，给你延期机会。→ mag+2, int+2, flag: master_candidate
  3. **用禁忌法术通过** (prob: 0.3, require: flag.dark_pact) — 你用暗黑魔导的技巧完成了考核，评审们面面相觑。→ mag+5, chr-3, spr-2, flag: dark_master, flag: council_suspicion

### MAG_p4_wild_legend
- **标题**: 野生魔导的传说
- **描述**: 你没有大师认证，但你的名字已经在冒险者之间传开。人们叫你"荒野的魔导师"。
- **年龄**: 23 - 30
- **权重**: 6
- **触发条件**: include: flag.wild_power OR flag.tempered_by_nature
- **unique**: true
- **tag**: magic, wild_path
- **priority**: major
- **基础效果**: mag+2, chr+2
- **分支**:
  1. **接受名声** (prob: 0.5) — 你坦然接受了这个称号，开始帮助有魔力烦恼的人。→ chr+3, flag: wild_mentor
  2. **寻求正式认可** (prob: 0.3) — 你去找魔导协会要求考核，但他们拒绝了一个"野路子"。→ chr-2, flag: rejected_by_establishment, flag: grudge
  3. **隐退山林** (prob: 0.2) — 你不喜欢名声带来的麻烦，选择隐居。→ spr+3, flag: hermit_life

### MAG_p4_inner_demon
- **标题**: 内心恶魔
- **描述**: 暗黑仪式的代价来了。你体内的黑暗力量开始有自我意识，试图夺取你的身体控制权。
- **年龄**: 24 - 32
- **权重**: 5
- **触发条件**: include: flag.dark_pact OR flag.inner_demon
- **unique**: true
- **tag**: magic, dark, crisis
- **priority**: critical
- **基础效果**: spr-3, hp-5
- **分支**:
  1. **压制黑暗** (prob: 0.3, require: attribute.spr >= 14) — 你凭借坚强的意志压制了黑暗。它还在，但暂时沉睡了。→ mag+2, spr+2, flag: demon_suppressed
  2. **与黑暗共存** (prob: 0.3) — 你学会了与体内的黑暗力量谈判。你获得了更强的力量，但代价是经常失去记忆。→ mag+4, int-2, flag: demon_pact, flag: memory_loss
  3. **被黑暗吞噬** (prob: 0.4) — 你没能抵抗。当你重新"醒来"时，周围是一片废墟。→ mag+6, spr-5, chr-5, flag: dark_overwhelmed, flag: massacre

### MAG_p4_blight_spread
- **标题**: 魔力侵蚀
- **描述**: 黑色纹路已经覆盖了你半边身体。你开始能"看到"魔力的流动——但你也开始能感受到别人的生命力。
- **年龄**: 25 - 35
- **权重**: 6
- **触发条件**: include: flag.mana_corruption_spreading OR flag.blight_research
- **unique**: true
- **tag**: magic, cost, crisis
- **priority**: major
- **基础效果**: mag+2, spr-2
- **分支**:
  1. **找到抑制方法** (prob: 0.3, require: attribute.int >= 16) — 你研究出了一种抑制纹路扩散的方法，虽然不能根治。→ flag: blight_controlled, int+2
  2. **将侵蚀转化为力量** (prob: 0.35) — 你把侵蚀当作力量之源。纹路变成了银色，你变得更强了——但寿命在缩短。→ mag+4, flag: blight_converted, flag: shortened_lifespan
  3. **寻求他人生命力** (prob: 0.35, require: flag.dark_tendency) — 你发现可以抽取他人的生命力来减缓侵蚀……这个念头太危险了。→ mag+3, spr-4, flag: life_drain_temptation

### MAG_p4_student_of_your_own
- **标题**: 你的弟子
- **描述**: 一个魔力天赋异禀的孩子被送到了你面前。看着那双充满好奇的眼睛，你想起了自己小时候。
- **年龄**: 28 - 35
- **权重**: 5
- **触发条件**: include: has.flag.magus_master OR has.flag.wild_mentor OR has.flag.hermit_life
- **unique**: true
- **tag**: magic, legacy
- **priority**: major
- **基础效果**: chr+1
- **分支**:
  1. **悉心教导** (prob: 0.5) — 你把毕生所学传授给这个孩子，包括你的教训。→ chr+3, flag: has_disciple, flag: legacy_teacher
  2. **警告后送走** (prob: 0.3, require: flag.dark_pact) — 你看到了孩子眼中的光芒，也知道魔力的诱惑有多大。你选择不教他。→ spr+2, flag: protective_choice
  3. **教导暗黑魔导** (prob: 0.2, require: flag.dark_master) — 你教会了弟子暗黑魔导的力量。你告诉自己这是让他们"有选择"。→ mag+2, spr-3, flag: dark_lineage

---

## 阶段 5：中年（36-50 岁）— 传承/代价

### MAG_p5_council_politics
- **标题**: 魔导评议会
- **描述**: 你被邀请（或传唤）到魔导评议会。有人提议对高魔力个体实施强制管控。
- **年龄**: 36 - 45
- **权重**: 6
- **触发条件**: include: has.flag.magus_master OR flag.council_suspicion
- **unique**: true
- **tag**: magic, politics
- **priority**: major
- **基础效果**: 无
- **分支**:
  1. **支持管控** (prob: 0.3) — 你知道魔力的危险。支持管控是正确的选择。→ chr+2, int+1, flag: regulation_supporter
  2. **反对管控** (prob: 0.4) — 魔力不该被恐惧。你站出来反对。→ mag+1, chr+1, flag: freedom_advocate, flag: council_enemy
  3. **揭露评议会秘密** (prob: 0.3, require: flag.dark_experiment_found) — 你公开了评议会掩盖的暗黑实验。议会大乱。→ chr+3, flag: whistleblower, flag: hunted_by_council

### MAG_p5_forbidden_research
- **标题**: 终极研究
- **描述**: 你终于触碰到了魔力的本质——或者说，你以为自己触碰到了。你的研究发现魔力可能来自某种更深层的东西。
- **年龄**: 38 - 48
- **权重**: 5
- **触发条件**: include: flag.research_insight AND attribute.mag >= 20
- **unique**: true
- **tag**: magic, revelation
- **priority**: critical
- **基础效果**: mag+2, int+2
- **分支**:
  1. **公布发现** (prob: 0.3) — 你将研究公之于众。学界震动，但也有人想利用这个发现。→ chr+2, flag: revolutionary_theory
  2. **继续秘密研究** (prob: 0.4) — 你选择保密，独自深入。你越走越深，开始听到"那边"的声音。→ mag+4, spr-3, flag: deep_research, flag: hearing_voices
  3. **停止研究** (prob: 0.3) — 你烧掉了所有笔记。有些知识，人类不该拥有。→ spr+4, flag: wisdom_of_restraint

### MAG_p5_demon_resurgence
- **标题**: 暗黑反噬
- **描述**: 压制的恶魔苏醒了。这一次它不只是要控制你的身体——它要你"心甘情愿"地交出灵魂。
- **年龄**: 36 - 45
- **权重**: 5
- **触发条件**: include: flag.demon_suppressed OR flag.demon_pact
- **unique**: true
- **tag**: magic, dark, crisis
- **priority**: critical
- **基础效果**: spr-2
- **分支**:
  1. **最终封印** (prob: 0.25, require: attribute.spr >= 16 AND attribute.mag >= 18) — 你用毕生修为将恶魔永久封印。代价是失去一半魔力。→ mag-8, spr+5, flag: demon_sealed_forever, flag: weakened
  2. **与恶魔融合** (prob: 0.35) — 你接受了恶魔的提议。你变成了某种……不再是人类的东西。→ mag+8, spr-6, chr-4, flag: demon_fused, flag: inhuman
  3. **自我牺牲** (prob: 0.4) — 你引爆了自己的魔力核心，与恶魔同归于尽。如果你还活着，那也只是侥幸。→ hp-30, flag: self_destruction, flag: near_death

### MAG_p5_wild_masterwork
- **标题**: 野生杰作
- **描述**: 你创造了一种前所未有的魔法——不属于任何体系，完全来自你的独特经历。
- **年龄**: 36 - 50
- **权重**: 5
- **触发条件**: include: flag.wild_magic AND attribute.mag >= 18
- **unique**: true
- **tag**: magic, wild_path, milestone
- **priority**: major
- **基础效果**: mag+3
- **分支**:
  1. **传授给弟子** (prob: 0.4) — 你将这个法术传给了你的弟子们。→ flag: legacy_created, chr+3
  2. **留给世界** (prob: 0.35) — 你把法术刻在了一块石碑上，立在荒野中央。有缘者得之。→ spr+3, flag: gift_to_world
  3. **独自珍藏** (prob: 0.25) — 这个法术太危险，你选择独自保守秘密。→ mag+2, flag: secret_masterpiece

---

## 阶段 6：老年（51-70 岁）— 归途

### MAG_p6_blight_endgame
- **标题**: 侵蚀终局
- **描述**: 黑色纹路覆盖了你的全身。你的身体正在慢慢变成纯粹的魔力结晶。
- **年龄**: 51 - 65
- **权重**: 6
- **触发条件**: include: flag.blight_converted OR flag.mana_corruption_spreading
- **unique**: true
- **tag**: magic, cost, endgame
- **priority**: major
- **基础效果**: hp-10, mag+3
- **分支**:
  1. **接受结晶化** (prob: 0.4) — 你坦然接受自己的命运。你的身体将变成一座永恒的魔力结晶塔。→ flag: crystallization, flag: monument
  2. **最后的尝试逆转** (prob: 0.3, require: attribute.int >= 18) — 你用毕生所学尝试逆转侵蚀。成功与否取决于命运。→ flag: reversal_attempt
  3. **将残余魔力传给弟子** (prob: 0.3, require: flag.has_disciple) — 你把体内剩余的魔力全部传给了弟子。你的纹路消失了——但你变成了普通人。→ mag→5, flag: power_transferred, flag: became_normal

### MAG_p6_old_mentor
- **标题**: 暮年导师
- **描述**: 你坐在学院的花园里（或你的山间小屋前），年轻人不断来向你求教。
- **年龄**: 55 - 70
- **权重**: 5
- **触发条件**: include: has.flag.magus_master OR flag.wild_mentor OR flag.legacy_teacher
- **unique**: true
- **tag**: magic, legacy
- **priority**: normal
- **基础效果**: chr+2, int+1
- **分支**:
  1. **倾囊相授** (prob: 0.5) — 你把一生的经验和教训都写成了书。→ flag: magnum_opus, chr+3
  2. **只教教训不教力量** (prob: 0.3) — "力量每个人都有，但知道何时不用才是智慧。" → spr+4, flag: wisdom_teacher
  3. **沉默不语** (prob: 0.2, require: flag.dark_pact) — 你知道太多危险的东西。有些知识，还是带进坟墓比较好。→ spr+2, flag: silent_guardian

### MAG_p6_demon_farewell
- **标题**: 与恶魔的告别
- **描述**: 融合后，你体内的恶魔在你老去时也变弱了。它第一次用正常的语气跟你说话。
- **年龄**: 55 - 70
- **权重**: 4
- **触发条件**: include: flag.demon_fused
- **unique**: true
- **tag**: magic, dark, resolution
- **priority**: major
- **基础效果**: 无
- **分支**:
  1. **和平分离** (prob: 0.3, require: attribute.spr >= 14) — 你与恶魔达成了和解，它离开了你的身体。你终于变回了"人类"。→ mag-5, spr+5, flag: became_human_again
  2. **一起消亡** (prob: 0.4) — 你选择和恶魔一起走到终点。它笑了："这是我第一次不后悔。" → flag: shared_end
  3. **将恶魔封入传家宝** (prob: 0.3) — 你把恶魔封入一件魔法物品中留给后人，既是遗产也是警告。→ flag: demon_artifact, flag: dark_legacy

---

## 阶段 7：终幕（71+ 岁）— 遗产

### MAG_p7_final_spell
- **标题**: 最后的魔法
- **描述**: 你感受到了生命力的流逝。你知道自己还有力量释放最后一个法术——一个真正属于你的法术。
- **年龄**: 71 - 99
- **权重**: 8
- **触发条件**: include: attribute.mag >= 10
- **unique**: true
- **tag**: magic, finale
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **守护之盾** (prob: 0.35) — 你将最后的力量化为一个覆盖整个城镇的永久护盾。→ flag: eternal_shield, flag: heroic_end
  2. **知识传承** (prob: 0.35) — 你将毕生所学凝聚成一本书，蕴含着你的灵魂碎片。→ flag: soul_book, item: magus_grimoire
  3. **魔力释放** (prob: 0.3, require: flag.mana_overflow) — 你将所有魔力释放到天地之间。你的身体化为光，融入了世界的魔力循环。→ flag: became_mana, flag: transcendence

### MAG_p7_crumbling_tower
- **标题**: 倒塌的塔
- **描述**: 你曾经的研究之塔在你离开后开始崩塌。里面有你不为人知的研究成果——也许是好事。
- **年龄**: 75+
- **权重**: 4
- **触发条件**: include: flag.deep_research OR flag.secret_masterpiece
- **unique**: true
- **tag**: magic, epilogue
- **priority**: normal
- **基础效果**: 无
- **分支**:
  1. **任其崩塌** (prob: 0.5) — 有些秘密随时间消逝是最好的归宿。→ flag: secrets_lost
  2. **派人抢救** (prob: 0.3, require: flag.has_disciple) — 你让弟子去抢救最重要的笔记。→ flag: research_preserved
  3. **亲手毁掉** (prob: 0.2, require: flag.dark_tendency) — 你拖着衰老的身体亲自去毁掉了一切。→ flag: final_redemption

### MAG_p7_legacy_event
- **标题**: 魔导遗产
- **描述**: 多年后，人们提起你的名字。你是传说中的魔导师，还是危险的异端？
- **年龄**: 终幕
- **权重**: 3
- **触发条件**: 无特殊条件
- **unique**: true
- **tag**: magic, ending
- **priority**: major
- **基础效果**: 无
- **分支**:
  1. **被尊为大师** (prob: 0.3, require: flag.magus_master AND !flag.dark_pact) — 学院立了你的雕像。你的理论被编入了教科书。→ flag: legend_good
  2. **被铭记为警示** (prob: 0.3, require: flag.dark_pact OR flag.massacre) — "记住那个被魔力吞噬的人。"你的故事成了反面教材。→ flag: legend_warning
  3. **被遗忘的传说** (prob: 0.4) — 时间抹去了一切。只有少数古籍中还记载着一个模糊的名字。→ flag: legend_forgotten

---

## 事件统计

| 阶段 | 事件数 | 子线覆盖 |
|------|--------|----------|
| P1 童年 | 3 | 公共觉醒 |
| P2 少年 | 5 | 学院/野路子/暗黑分歧 |
| P3 青年 | 5 | 深化各子线 |
| P4 壮年 | 5 | 大师/失控/传承 |
| P5 中年 | 4 | 政治/研究/反噬 |
| P6 老年 | 3 | 代价结算 |
| P7 终幕 | 3 | 遗产/评价 |
| **合计** | **28** | — |
