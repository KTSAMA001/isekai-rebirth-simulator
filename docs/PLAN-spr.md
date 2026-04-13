# 灵魂/灵修路线计划书 (PLAN-spr)

> spr 主导路线，~30 个事件，覆盖 7 个阶段（童年→少年→青年→壮年→中年→老年→终幕）
>
> 三条子线：灵修者 / 先知 / 萨满
>
> 核心主题：灵修不是"变强"，而是领悟与代价。看见不该看的、知道不该知道的。真相往往比无知更沉重。

---

## 阶段 1：童年（0-6 岁）— 灵魂初醒

### SPR_p1_ghost_friend
- **标题**: 看不见的朋友
- **描述**: 你总是对着空无一人的角落说话。大人们以为你有幻想中的朋友，但你知道——那里确实有个人。一个透明的、微笑着的老人。
- **年龄**: 2 - 5
- **权重**: 9
- **触发条件**: include: attribute.spr >= 7
- **unique**: true
- **tag**: spirit, awakening
- **priority**: major
- **基础效果**: spr+2
- **分支**:
  1. **与灵体交谈** (prob: 0.4) — 老人告诉你一些事情——关于这栋房子过去的秘密。你说出来后，大人们脸色大变。→ spr+3, flag: sees_ghosts, flag: family_secret
  2. **告诉父母** (prob: 0.35) — 父母带你去看了祭司。祭司看了你一眼，表情复杂地摇了摇头。→ spr+1, flag: spirit_checked, flag: priest_attention
  3. **选择无视** (prob: 0.25) — 你学会了不再提起"那个人"。但你知道他还在那里。→ spr+2, luk-1, flag: hidden_sight

### SPR_p1_night_vision
- **标题**: 暗夜之眼
- **描述**: 你在完全黑暗的房间里能看到微弱的光——不是普通的光，而是从墙壁、家具、甚至睡着的家人身上散发出来的彩色光芒。
- **年龄**: 3 - 6
- **权重**: 7
- **触发条件**: include: attribute.spr >= 8
- **unique**: true
- **tag**: spirit, sight
- **priority**: normal
- **基础效果**: spr+2
- **分支**:
  1. **观察光芒** (prob: 0.4) — 你学会了分辨不同颜色的光芒代表什么。蓝色是平静，红色是愤怒，黑色……是病痛。→ spr+3, flag: aura_reading, int+1
  2. **被黑色光芒吓到** (prob: 0.3) — 你看到妈妈身上有一团黑色的光。你哭了整整一夜。→ spr+1, flag: fear_of_darkness, chr-1
  3. **试图触碰光芒** (prob: 0.3) — 你伸手去碰那些光，手指传来冰凉的感觉。你发现自己能让光芒稍微改变颜色。→ spr+2, flag: aura_touch, mag+1

### SPR_p1_animal_whisper
- **标题**: 动物的话
- **描述**: 你能听懂动物在说什么。不是语言，而是一种直觉——你知道猫咪饿了、鸟儿在警告危险、那条蛇……在悲伤。
- **年龄**: 3 - 6
- **权重**: 7
- **触发条件**: include: attribute.spr >= 6
- **unique**: true
- **tag**: spirit, shaman
- **priority**: normal
- **基础效果**: spr+1, chr+1
- **分支**:
  1. **与动物亲近** (prob: 0.5) — 你成了村里所有动物的挚友。它们会保护你、给你带礼物。→ chr+2, flag: animal_friend, luk+1
  2. **听到不该听的** (prob: 0.3) — 一只乌鸦落在你窗前，用嘶哑的声音说："三日后，有人会死。" → spr+3, flag: death_omen, spr-1（恐惧）
  3. **拒绝这份能力** (prob: 0.2) — 你害怕这种能力，拼命让自己"听不见"。→ spr-1, str+2, flag: denied_gift

### SPR_p1_dream_walk
- **标题**: 梦中行走
- **描述**: 你的梦境异于常人——你能清楚地知道自己在做梦，甚至能在梦中"走"到其他人的梦里。有一次你走进了一个陌生人的梦，醒来后你说出了他的名字和住址，全部正确。
- **年龄**: 4 - 7
- **权重**: 6
- **触发条件**: include: attribute.spr >= 9
- **unique**: true
- **tag**: spirit, dream, prophet
- **priority**: major
- **基础效果**: spr+2
- **分支**:
  1. **探索梦境** (prob: 0.4) — 你开始在梦中自由行走，看到了许多奇异的景象和未来的片段。→ spr+3, flag: dream_walker, flag: future_glimpses
  2. **遇到梦中存在** (prob: 0.3) — 在一个噩梦中，你遇到了一个非人的存在。它说："你终于看到了我。" → spr+2, flag: dream_entity, flag: entity_contact
  3. **被梦困住** (prob: 0.3) — 有一天你差点醒不过来。从此你对睡眠产生了恐惧。→ spr+1, flag: dream_fear, hp-3

---

## 阶段 2：少年（7-14 岁）— 路线分歧

### SPR_p2_shrine_calling
- **标题**: 神殿的召唤
- **描述**: 村里的老祭司找到你的父母："这个孩子有灵根。灵修神殿愿意接收。"这是成为正式灵修者的第一步。
- **年龄**: 7 - 10
- **权重**: 9
- **触发条件**: include: attribute.spr >= 8; exclude: has.flag.spirit_student
- **unique**: true
- **tag**: spirit, crossroad
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **入神殿修行** (prob: 0.4) — 你踏入了灵修神殿，开始正统灵修之路。→ spr+3, int+2, str-2, flag: spirit_student, flag: shrine_path
  2. **留在村里** (prob: 0.3) — "我不要离开家。"你拒绝了。但老祭司留下了一本冥想手册。→ spr+1, chr+1, flag: self_taught_spirit
  3. **选择跟随流浪萨满** (prob: 0.3, require: flag.animal_friend) — 一个路过的萨满看了你一眼，说："你的灵魂很吵。跟我走。" → spr+3, str+1, flag: shaman_apprentice, flag: shaman_path

### SPR_p2_first_prophecy
- **标题**: 第一次预言
- **描述**: 你做了一个异常清晰的梦。梦里的场景在三天后精确地发生了。你站在原地，浑身发抖——这不是巧合。
- **年龄**: 8 - 12
- **权重**: 7
- **触发条件**: include: flag.future_glimpses OR flag.dream_walker
- **unique**: true
- **tag**: spirit, prophet
- **priority**: major
- **基础效果**: spr+2
- **分支**:
  1. **告诉别人** (prob: 0.35) — 你试着警告人们，但没人相信一个小孩。直到事情真的发生了。→ chr+1, flag: young_prophet, flag: doubted
  2. **记录下来** (prob: 0.4) — 你开始把梦到的内容写下来，等待验证。你发现准确率越来越高。→ spr+2, int+2, flag: prophecy_journal
  3. **害怕并压制** (prob: 0.25) — 你不想看到这些。你开始不睡觉，用一切方法压制这个能力。→ spr-1, hp-5, flag: prophecy_suppressed

### SPR_p2_spirit_animal
- **标题**: 灵兽契约
- **描述**: 在森林深处，一只受伤的白色狐狸用人类的眼睛看着你。你能感受到它的灵魂——古老、疲惫、在寻找继承者。
- **年龄**: 9 - 13
- **权重**: 6
- **触发条件**: include: flag.animal_friend OR flag.shaman_apprentice
- **unique**: true
- **tag**: spirit, shaman, milestone
- **priority**: major
- **基础效果**: spr+2, luk+2
- **分支**:
  1. **缔结契约** (prob: 0.4) — 白狐的灵魂与你的灵魂轻轻触碰。它说："我会守护你，直到你不再需要我。" → spr+4, flag: spirit_fox, item: fox_spirit_bond
  2. **治疗后放走** (prob: 0.35) — 你治好了它的伤，但没有接受契约。白狐深深看了你一眼后消失在林中。→ spr+2, chr+2, flag: compassionate_soul
  3. **被灵兽拒绝** (prob: 0.25) — 白狐看了你很久，然后转身离去。你感到心中一阵刺痛。→ spr-1, luk-1, flag: rejected_by_spirit

### SPR_p2_meditation_depth
- **标题**: 深层冥想
- **描述**: 你的冥想越来越深。有一次，你的意识脱离了身体——你从上方看到了自己打坐的身影。
- **年龄**: 10 - 14
- **权重**: 7
- **触发条件**: include: has.flag.spirit_student OR flag.self_taught_spirit
- **unique**: true
- **tag**: spirit, meditation
- **priority**: major
- **基础效果**: spr+3
- **分支**:
  1. **安全返回** (prob: 0.4) — 你成功地将意识收回到身体里。导师说你是百年难遇的天才。→ spr+2, flag: astral_talent, flag: meditation_prodigy
  2. **看到不该看的** (prob: 0.35) — 在脱离状态中，你看到了一个巨大的黑暗存在正在注视着这个世界。它注意到你了。→ spr+3, flag: entity_noticed, flag: cosmic_horror
  3. **差点回不去** (prob: 0.25) — 你的意识飘了太远，差点找不到自己的身体。醒来时已经过去了一整天。→ spr+1, hp-8, flag: astral_danger

### SPR_p2_spirit_burden
- **标题**: 灵魂的重负
- **描述**: 你越来越频繁地看到灵体。不是只有善良的——有些充满怨恨，有些想通过你传达痛苦的信息。你开始失眠。
- **年龄**: 10 - 14
- **权重**: 6
- **触发条件**: include: flag.sees_ghosts AND attribute.spr >= 10
- **unique**: true
- **tag**: spirit, cost
- **priority**: major
- **基础效果**: spr+1, hp-3
- **分支**:
  1. **学会屏蔽** (prob: 0.4, require: has.flag.spirit_student) — 导师教了你一种屏蔽灵体的冥想法。虽然不是完全有效，但至少你能睡觉了。→ spr+2, flag: spirit_shield
  2. **倾听并帮助** (prob: 0.35) — 你选择倾听每个灵体的故事并帮助它们。这让你精疲力竭，但灵魂变得更纯净。→ spr+3, hp-5, flag: spirit_helper, chr+1
  3. **被灵体缠绕** (prob: 0.25) — 一个恶灵缠上了你。它在你耳边不停地低语，告诉你可怕的事情。→ spr-2, chr-2, flag: haunted, flag: spirit_torment

---

## 阶段 3：青年（15-22 岁）— 领悟/代价

### SPR_p3_enlightenment_trial
- **标题**: 开悟试炼
- **描述**: 灵修的第一大关：在七天的绝对孤独中冥想，直面自己灵魂中最深的恐惧。许多人在这步发疯。
- **年龄**: 15 - 19
- **权重**: 8
- **触发条件**: include: has.flag.spirit_student AND attribute.spr >= 12
- **unique**: true
- **tag**: spirit, meditation, milestone
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **开悟** (prob: 0.25, require: attribute.spr >= 16) — 你看到了自己灵魂的本质，理解了生死的循环。泪水无声地流下。→ spr+5, flag: enlightened, flag: death_acceptance
  2. **部分领悟** (prob: 0.45) — 你触及了开悟的边缘但没能突破。不过你的灵修仍然取得了显著进步。→ spr+3, flag: near_enlightenment
  3. **精神崩溃** (prob: 0.3, require: flag.haunted OR flag.cosmic_horror) — 你的恐惧具象化了。试炼中你尖叫了三天三夜。→ spr-2, hp-15, flag: broken_mind, flag: meditation_trauma

### SPR_p3_oracle_awakening
- **标题**: 神谕觉醒
- **描述**: 你的预言能力突然失控——你开始无法控制地看到未来的片段，在上课时、吃饭时、甚至睡梦中。这些画面越来越清晰，也越来越恐怖。
- **年龄**: 15 - 20
- **权重**: 7
- **触发条件**: include: flag.future_glimpses OR flag.young_prophet
- **unique**: true
- **tag**: spirit, prophet, crisis
- **priority**: critical
- **基础效果**: spr+3, hp-5
- **分支**:
  1. **寻求先知导师** (prob: 0.4) — 你找到了一位隐居的老先知。他说："你能看到未来，但未来不是唯一的。" → spr+2, flag: oracle_mentor, flag: prophecy_control
  2. **独自承受** (prob: 0.35) — 你没有告诉任何人，独自承受着预言的冲击。每次预言后你都会流鼻血。→ spr+3, hp-8, flag: prophecy_pain, flag: solo_bearer
  3. **公开预言** (prob: 0.25) — 你把看到的大灾难告诉了所有人。有人信了，更多的人说你是疯子。→ chr-2, flag: public_prophet, flag: ostracized

### SPR_p3_spirit_journey
- **标题**: 灵魂出窍之旅
- **描述**: 你第一次有意识地脱离身体，进入了灵魂的世界。那里不是空无一物的——有无尽的草原、发光的河流，以及各种形态的灵魂。
- **年龄**: 16 - 21
- **权重**: 6
- **触发条件**: include: flag.astral_talent AND attribute.spr >= 14
- **unique**: true
- **tag**: spirit, shaman, milestone
- **priority**: major
- **基础效果**: spr+3
- **分支**:
  1. **探索灵魂世界** (prob: 0.4) — 你在灵魂世界中遇到了一个古老的灵魂，它教会了你灵魂的本质。→ spr+4, flag: spirit_world_knowledge, int+2
  2. **找到亡者** (prob: 0.3) — 你在灵魂世界中找到了已故的亲人。对话短暂但珍贵。你哭了。→ spr+2, chr+1, flag: spoke_with_dead, flag: closure
  3. **遇到灵魂猎食者** (prob: 0.3) — 有东西在灵魂世界中追踪你。你拼命逃回身体，但感到灵魂被撕下了一小片。→ spr+2, hp-10, flag: soul_damage, flag: spirit_predator

### SPR_p3_truth_too_much
- **标题**: 真相的重量
- **描述**: 你看到了一个人的灵魂，看到了他过去做过的所有事——包括那些他绝不会告诉任何人的秘密。你无法假装不知道。
- **年龄**: 16 - 22
- **权重**: 6
- **触发条件**: include: attribute.spr >= 14 AND flag.aura_reading
- **unique**: true
- **tag**: spirit, cost
- **priority**: major
- **基础效果**: spr+1, chr-1
- **分支**:
  1. **选择沉默** (prob: 0.4) — 你把看到的埋在心里。知道真相但不说的痛苦让你一夜成熟了许多。→ spr+2, flag: truth_keeper, int+1
  2. **说出真相** (prob: 0.3) — 你告诉了那个人你看到了什么。他崩溃了。你们的关系也随之崩塌。→ chr-3, flag: truth_teller, flag: broken_trust
  3. **学会不看** (prob: 0.3) — 你开始有意识地关闭自己的灵视。虽然失去了能力的一部分，但获得了内心的平静。→ spr-2, chr+2, flag: willful_blindness

### SPR_p3_shaman_initiation
- **标题**: 萨满受名
- **描述**: 你的导师带你完成了最后的萨满仪式：在灵魂世界中找到你的灵兽之形，与之融合。
- **年龄**: 17 - 22
- **权重**: 6
- **触发条件**: include: flag.shaman_apprentice AND flag.spirit_fox
- **unique**: true
- **tag**: spirit, shaman, milestone
- **priority**: critical
- **基础效果**: spr+3
- **分支**:
  1. **成功融合** (prob: 0.4) — 你与灵兽完美融合。你的感官扩展到了超越人类的范围。→ spr+4, luk+3, flag: shaman_born, flag: enhanced_senses
  2. **部分融合** (prob: 0.4) — 融合不完整。你能感受到灵兽的存在，但无法完全沟通。→ spr+2, flag: incomplete_shaman
  3. **被灵兽吞噬** (prob: 0.2, require: flag.soul_damage) — 灵兽利用你灵魂的裂缝试图夺取你的身体。你勉强保住了自我，但你的灵魂被永久改变了。→ spr+3, flag: changed_soul, flag: beast_within

---

## 阶段 4：壮年（23-35 岁）— 超凡/预言/归一

### SPR_p4_transcendence
- **标题**: 超凡之境
- **描述**: 在一次深度冥想中，你的灵魂突破了凡人的界限。你短暂地感受到了"万物一体"的境界。
- **年龄**: 23 - 30
- **权重**: 7
- **触发条件**: include: flag.enlightened AND attribute.spr >= 18
- **unique**: true
- **tag**: spirit, meditation, milestone
- **priority**: critical
- **基础效果**: spr+4
- **分支**:
  1. **稳固境界** (prob: 0.3, require: attribute.spr >= 20) — 你将超凡境界稳定下来。你不再受衰老影响，感知力达到了凡人的极限。→ spr+5, flag: transcendent, flag: ageless
  2. **无法持久** (prob: 0.4) — 境界如流水般消逝。你记住了一瞬间的感悟，但无法留住那个状态。→ spr+3, flag: fleeting_transcendence
  3. **看到了太多** (prob: 0.3) — "万物一体"意味着你也感受到了万物的痛苦。你被海量的痛苦冲击得几乎崩溃。→ spr+2, hp-15, flag: empath_overload, flag: burden_of_all

### SPR_p4_catastrophe_prophecy
- **标题**: 末日预言
- **描述**: 你看到了一场灾难——具体的、不可更改的、即将到来的灾难。你可以警告人们，但你也会因此成为众人瞩目的焦点。
- **年龄**: 23 - 32
- **权重**: 6
- **触发条件**: include: flag.oracle_mentor OR flag.prophecy_journal
- **unique**: true
- **tag**: spirit, prophet, crisis
- **priority**: critical
- **基础效果**: spr+2
- **分支**:
  1. **公开警告** (prob: 0.35) — 你发出了警告。有人因此得救了，但更多人不信。灾难发生后，人们把责任推给了你。→ chr-2, spr+2, flag: prophet_rejected, flag: save_some
  2. **暗中引导** (prob: 0.4) — 你不直接说出预言，而是暗中引导人们避开灾难。这更难，但不会引发恐慌。→ spr+3, flag: subtle_prophet, flag: hidden_savior
  3. **尝试改变未来** (prob: 0.25) — 你试图直接阻止灾难。但每次你改变什么，就会引发新的灾难。→ spr+2, hp-10, flag: timeline_meddler, flag: butterfly_effect

### SPR_p4_spirit_realm_master
- **标题**: 灵魂世界的主人
- **描述**: 你已经能在灵魂世界中自如行动。你甚至帮助迷途的灵魂找到了归宿。但灵魂世界的深处有什么在等你。
- **年龄**: 25 - 33
- **权重**: 5
- **触发条件**: include: flag.spirit_world_knowledge AND attribute.spr >= 16
- **unique**: true
- **tag**: spirit, shaman
- **priority**: major
- **基础效果**: spr+3
- **分支**:
  1. **建立灵魂庇护所** (prob: 0.4) — 你在灵魂世界中建立了一个安全的庇护所，收容迷失的灵魂。→ spr+3, chr+2, flag: spirit_sanctuary
  2. **深入灵魂世界底层** (prob: 0.3) — 你向灵魂世界最深处的黑暗探索。那里有你不想知道答案的问题。→ spr+4, flag: deep_spirit_knowledge, flag: unanswerable_truth
  3. **与灵魂猎食者再遇** (prob: 0.3, require: flag.spirit_predator) — 那个追逐你的存在又出现了。这一次它说："你变强了……更好。" → spr+2, flag: hunted_by_predator

### SPR_p4_connection_burden
- **标题**: 万物相连的痛苦
- **描述**: 你的灵修让你能感受到周围所有人的情感。这不是选择——是被动地、无时无刻地接收所有人的喜怒哀乐。
- **年龄**: 24 - 33
- **权重**: 6
- **触发条件**: include: flag.enlightened OR flag.burden_of_all
- **unique**: true
- **tag**: spirit, cost
- **priority**: major
- **基础效果**: spr+2, hp-5
- **分支**:
  1. **建立心理屏障** (prob: 0.4, require: attribute.int >= 12) — 你花了一年时间学会了建立屏障。不是完全屏蔽，而是将洪流变成可控的溪流。→ spr+2, flag: emotional_control
  2. **拥抱连接** (prob: 0.3) — 你选择接受这份痛苦。每个喜悦你都能放大感受，每个悲伤你都能分担。→ spr+4, hp-8, flag: empath_master, chr+2
  3. **逃离人群** (prob: 0.3) — 你受够了别人的情绪。你独自搬到了深山中。→ spr+2, chr-3, flag: hermit_spirit

### SPR_p4_prophecy_price
- **标题**: 预言的代价
- **描述**: 每次你预言未来，你的寿命就会缩短。你从白发中发现了这个规律——每预言一次，就多一根白发。
- **年龄**: 25 - 35
- **权重**: 6
- **触发条件**: include: flag.prophecy_journal OR flag.oracle_mentor
- **unique**: true
- **tag**: spirit, prophet, cost
- **priority**: major
- **基础效果**: spr+2, flag: shortened_lifespan
- **分支**:
  1. **减少预言** (prob: 0.4) — 你决定只在最危急的时刻使用预言能力。→ spr+1, flag: restrained_prophet
  2. **继续预言** (prob: 0.3) — 人们的安危比你的寿命更重要。→ spr+3, flag: selfless_prophet, flag: rapid_aging
  3. **寻找替代方法** (prob: 0.3, require: attribute.int >= 14) — 你研究是否有办法预言而不付出代价。你发现……也许有，但代价会转嫁给你最亲近的人。→ spr+2, flag: transfer_cost_discovered

---

## 阶段 5：中年（36-50 岁）— 教导/面对

### SPR_p5_teaching_burden
- **标题**: 传授的困境
- **描述**: 你成为了受人尊敬的灵修导师。但你知道自己传授的不仅是能力——还有那些伴随而来的痛苦。每一个学生你都可能在培养一个未来的受难者。
- **年龄**: 36 - 45
- **权重**: 6
- **触发条件**: include: attribute.spr >= 16 AND (flag.enlightened OR flag.shaman_born)
- **unique**: true
- **tag**: spirit, legacy
- **priority**: major
- **基础效果**: chr+2
- **分支**:
  1. **全部传授** (prob: 0.35) — 你把所有知识都教给了学生，包括代价。"选择权在他们手中。" → flag: full_teacher, spr+2
  2. **只教一半** (prob: 0.4) — 你只教授安全的部分，将危险的知识封存。→ spr+1, flag: cautious_teacher, flag: hidden_knowledge
  3. **关闭传承** (prob: 0.25, require: flag.burden_of_all) — "这份力量不应该再传承下去了。"你遣散了所有学生。→ spr+3, chr-2, flag: ended_lineage

### SPR_p5_entity_confrontation
- **标题**: 正面遭遇
- **描述**: 那个在梦中/灵魂世界中注视你的存在终于现身了。它不是灵体、不是恶魔——它是某种更古老的东西。
- **年龄**: 38 - 48
- **权重**: 5
- **触发条件**: include: flag.entity_noticed OR flag.hunted_by_predator OR flag.deep_spirit_knowledge
- **unique**: true
- **tag**: spirit, crisis
- **priority**: critical
- **基础效果**: spr+2
- **分支**:
  1. **沟通** (prob: 0.3, require: attribute.spr >= 20) — 你与它进行了意识层面的交流。它不是善也不是恶——它是"规则"的一部分。→ spr+5, flag: cosmic_understanding, flag: pact_with_entity
  2. **对抗** (prob: 0.35) — 你用毕生灵修与它对抗。它退去了，但你知道它只是暂时离开。→ spr+3, hp-15, flag: entity_repelled
  3. **臣服** (prob: 0.35) — 你接受了它的存在。它给了你力量，但你的一部分灵魂不再属于你自己。→ spr+4, flag: entity_vessel, flag: soul_fragment_lost

### SPR_p5_nature_communion
- **标题**: 万物归一
- **描述**: 你的萨满之力达到了巅峰。你站在山顶，感受到了脚下每一棵树的根、每一只蚂蚁的呼吸、每一滴水的流动。
- **年龄**: 36 - 48
- **权重**: 5
- **触发条件**: include: flag.shaman_born AND attribute.spr >= 18
- **unique**: true
- **tag**: spirit, shaman, milestone
- **priority**: major
- **基础效果**: spr+3
- **分支**:
  1. **与自然融合** (prob: 0.35) — 你的意识融入了自然的循环。你能感受到方圆百里的一切生命。→ spr+5, flag: one_with_nature, flag: expanded_awareness
  2. **承受自然的痛苦** (prob: 0.35) — 你也感受到了被砍伐的森林的哀嚎、被污染的河流的窒息。→ spr+3, hp-10, flag: nature_pain
  3. **选择局限** (prob: 0.3) — 你选择只与一部分自然连接。完全的融合会让你失去"自我"。→ spr+2, flag: limited_connection, flag: preserved_self

### SPR_p5_false_prophecy
- **标题**: 假预言
- **描述**: 你公开发布了一个预言，但这一次你错了。完全错了。你的信誉崩塌，追随者散去。你开始怀疑自己的能力。
- **年龄**: 40 - 50
- **权重**: 5
- **触发条件**: include: flag.public_prophet OR flag.subtle_prophet
- **unique**: true
- **tag**: spirit, prophet, crisis
- **priority**: major
- **基础效果**: chr-3, spr-1
- **分支**:
  1. **重新审视能力** (prob: 0.4) — 你退隐反思，发现预言的本质不是"看到确定的未来"，而是"看到最可能的未来"。→ spr+3, int+2, flag: prophecy_reformed
  2. **放弃预言** (prob: 0.3) — "也许我不应该再预言了。"你封印了自己的预言能力。→ spr-2, flag: prophecy_abandoned
  3. **被操控的预言** (prob: 0.3, require: flag.entity_vessel) — 你发现那个假预言不是你看到的——是那个存在植入你脑海的。→ spr+2, flag: manipulated_prophecy, flag: entity_deception

---

## 阶段 6：老年（51-70 岁）— 归宿

### SPR_p6_soul_completion
- **标题**: 灵魂圆满
- **描述**: 你感到灵魂中那些破碎的部分正在愈合。一生灵修的最终目标——灵魂的完整——正在实现。
- **年龄**: 55 - 68
- **权重**: 6
- **触发条件**: include: flag.enlightened AND attribute.spr >= 20
- **unique**: true
- **tag**: spirit, meditation, resolution
- **priority**: major
- **基础效果**: spr+3
- **分支**:
  1. **灵魂圆满** (prob: 0.3, require: attribute.spr >= 24) — 你的灵魂达到了凡人的极致。你理解了一切痛苦的来源，也理解了一切喜悦的本质。→ spr+5, flag: soul_perfect, flag: true_peace
  2. **接受不完美** (prob: 0.4) — 你没有达到理想的圆满，但你接受了自己灵魂的每一道裂痕。这些裂痕也是你的一部分。→ spr+3, flag: self_acceptance
  3. **灵魂碎裂** (prob: 0.3, require: flag.soul_damage AND flag.entity_vessel) — 灵魂的伤疤太多，愈合的过程反而造成了更多裂痕。→ spr-3, hp-10, flag: soul_fraying

### SPR_p6_final_prophecy
- **标题**: 最后的预言
- **描述**: 你做了一个关于自己死亡的预言。不是恐惧——而是清晰的、平静的、就像在看一本书的最后一章。
- **年龄**: 55 - 70
- **权重**: 5
- **触发条件**: include: flag.prophecy_reformed OR flag.selfless_prophet
- **unique**: true
- **tag**: spirit, prophet, resolution
- **priority**: major
- **基础效果**: spr+2
- **分支**:
  1. **接受命运** (prob: 0.5) — 你平静地接受了预言中的死亡方式。你开始安排一切后事。→ spr+3, flag: peaceful_acceptance
  2. **改变预言** (prob: 0.25, require: flag.timeline_meddler) — 你再一次尝试改变命运。这一次——你成功了，但代价是别人的命。→ spr+2, flag: traded_fate, flag: guilt
  3. **将预言传给下一代** (prob: 0.25, require: flag.full_teacher) — 你把这个预言连同你的所有能力一起传给了你最信任的学生。→ spr+2, flag: prophecy_inheritance

### SPR_p6_spirit_return
- **标题**: 灵兽的归途
- **描述**: 你的灵兽老了——虽然灵兽本不该老去。它说是因为承担了太多你的灵魂之伤。它用最后的力量为你做了一件事。
- **年龄**: 58 - 70
- **权重**: 5
- **触发条件**: include: flag.spirit_fox OR flag.shaman_born
- **unique**: true
- **tag**: spirit, shaman, resolution
- **priority**: major
- **基础效果**: spr+2, luk+2
- **分支**:
  1. **治愈你的灵魂** (prob: 0.4) — 灵兽将自己最后的生命力注入你破碎的灵魂。你痊愈了，它消散了。→ spr+4, flag: soul_healed, flag: fox_departed
  2. **合为一体** (prob: 0.35) — 灵兽与你的灵魂永久融合。你获得了它的全部力量和记忆。→ spr+3, flag: fused_with_spirit, flag: dual_soul
  3. **让它自由** (prob: 0.25) — 你解除了契约，让灵兽回归自然。它回头看了你三次后消失在星光中。→ spr+2, flag: spirit_freed, flag: selfless_release

### SPR_p6_final_truth
- **标题**: 最后的真相
- **描述**: 你终于理解了那个从童年就纠缠你的问题的答案——灵修的尽头是什么？答案是：没有尽头。只有不断的选择。
- **年龄**: 60 - 70
- **权重**: 4
- **触发条件**: include: attribute.spr >= 18
- **unique**: true
- **tag**: spirit, revelation
- **priority**: major
- **基础效果**: spr+2, int+2
- **分支**:
  1. **写下一切** (prob: 0.5) — 你将一生的领悟写成了一本书。不是教导如何变强，而是关于如何承受看到真相的重量。→ flag: truth_tome, chr+2
  2. **什么都不留** (prob: 0.3) — "真相不是靠文字传递的。"你选择什么都不写。→ spr+3, flag: silent_truth
  3. **只留一个问题** (prob: 0.2) — 你只留下了一个问题："如果你能看到所有人的灵魂，你还愿意看吗？" → flag: final_question

---

## 阶段 7：终幕（71+ 岁）— 解脱/永恒

### SPR_p7_departure
- **标题**: 灵魂离体
- **描述**: 你的灵魂已经准备好离开这具衰老的身体了。你可以选择离开的方式。
- **年龄**: 71 - 99
- **权重**: 8
- **触发条件**: include: attribute.spr >= 14
- **unique**: true
- **tag**: spirit, finale
- **priority**: critical
- **基础效果**: 无
- **分支**:
  1. **平静离世** (prob: 0.35) — 你的灵魂轻轻脱离身体，像一片羽毛飘向天空。→ flag: peaceful_death
  2. **化作灵体守护** (prob: 0.35, require: flag.spirit_helper) — 你的灵魂留在了这个世界，成为一个守护灵。→ flag: became_guardian_spirit
  3. **融入万物** (prob: 0.3, require: flag.one_with_nature OR flag.transcendent) — 你的灵魂融入了天地之间，不再有"你"和"世界"的区别。→ flag: dissolved_into_all, flag: transcendence

### SPR_p7_prophecy_fulfilled
- **标题**: 预言应验
- **描述**: 你一生中最重要的预言——关于你自己——终于应验了。你预言的一切，好的和坏的，都在这一刻画上了句号。
- **年龄**: 终幕
- **权重**: 5
- **触发条件**: include: flag.peaceful_acceptance OR flag.traded_fate
- **unique**: true
- **tag**: spirit, prophet, ending
- **priority**: major
- **基础效果**: 无
- **分支**:
  1. **预言圆满** (prob: 0.5) — 一切如你所见。你微笑着闭上了眼睛。→ flag: prophecy_complete
  2. **预言偏移** (prob: 0.3) — 最终的结果与你预见的略有不同。也许未来确实可以改变——只是代价很高。→ flag: future_is_fluid
  3. **预言之外** (prob: 0.2) — 发生了你从未预见的事情。你笑了："原来还有连我也看不到的未来。" → flag: unexpected_end

### SPR_p7_spirit_legacy
- **标题**: 灵魂的遗产
- **描述**: 你离开后，你留下的东西继续影响着世界。不是法术，不是力量——而是那些被你帮助过的灵魂、被你改变的命运。
- **年龄**: 终幕
- **权重**: 4
- **触发条件**: 无特殊条件
- **unique**: true
- **tag**: spirit, ending
- **priority**: major
- **基础效果**: 无
- **分支**:
  1. **被铭记为圣者** (prob: 0.3, require: flag.soul_perfect AND !flag.entity_vessel) — 人们传颂你的故事。不是关于力量，而是关于一个看到了太多真相的人如何选择善良。→ flag: legend_saint
  2. **被铭记为先知** (prob: 0.3, require: flag.prophecy_reformed OR flag.subtle_prophet) — 你的预言在后世不断被验证。你成了"眼睛"的象征。→ flag: legend_prophet
  3. **被铭记为萨满** (prob: 0.2, require: flag.shaman_born OR flag.fused_with_spirit) — 你与自然的故事成了传说。孩子们在森林中呼唤灵兽时，会念你的名字。→ flag: legend_shaman
  4. **化作传说中的低语** (prob: 0.2) — 没有人记得你的名字，但在某些静谧的夜晚，人们会听到风中有一个温柔的声音在说："一切都会好的。" → flag: legend_whisper

---

## 事件统计

| 阶段 | 事件数 | 子线覆盖 |
|------|--------|----------|
| P1 童年 | 4 | 公共觉醒（灵视/灵听/灵梦） |
| P2 少年 | 5 | 灵修/先知/萨满分歧 |
| P3 青年 | 5 | 各子线深化与代价 |
| P4 壮年 | 5 | 超凡/灾难预言/万物归一 |
| P5 中年 | 4 | 教导/遭遇/反思 |
| P6 老年 | 4 | 归宿与和解 |
| P7 终幕 | 3 | 解脱/遗产 |
| **合计** | **30** | — |
