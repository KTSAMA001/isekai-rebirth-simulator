# 智慧/学者路线 事件链计划书

> 路线属性：INT 主导
> 事件数量：~30 个
> 覆盖阶段：7 个（童年 → 少年 → 青年 → 学徒期 → 学者期 → 大师期 → 传说期）

---

## 阶段一：童年觉醒（age 5-9）

### int_child_early_curiosity
- **标题**: 无尽的好奇心
- **描述**: 你对一切事物都充满好奇，总是追着大人问"为什么"。村庄的长者说你像极了年轻时的贤者。
- **年龄**: 5 - 7
- **权重**: 10
- **触发条件**: include: `attribute.int >= 6`; exclude: `has.flag.academy_path`
- **unique**: true
- **tag**: life, knowledge
- **priority**: major
- **基础效果**: int +1
- **分支**:
  - **追问到底** → int +2, chr -1, `flag.curious_mind` → 你把所有人都问烦了，但你确实学到了很多
  - **自己翻书找答案** → int +2, spr +1, `flag.self_learner` → 你发现书本比人更有耐心，开始习惯独自阅读

### int_child_hidden_library
- **标题**: 阁楼上的秘密书架
- **描述**: 你在家里的阁楼发现了一个布满灰尘的书架，上面摆满了你看不懂的书——但那些符文让你着迷。
- **年龄**: 6 - 9
- **权重**: 7
- **触发条件**: include: `attribute.int >= 7`; exclude: `has.flag.bookworm`
- **unique**: true
- **tag**: knowledge, mystery
- **priority**: normal
- **基础效果**: int +1
- **分支**:
  - **偷偷阅读** → int +3, str -1, `flag.bookworm`, `flag.forbidden_curiosity` → 你在昏暗的光线下一字一句地啃着那些古书，眼睛开始近视，但你的世界变大了
  - **拿去问大人** → int +1, chr +1, `flag.trusting_nature` → 大人看到那些书后脸色大变，把书架锁了起来。但他们也注意到了你的聪慧

### int_child_village_sage
- **标题**: 村里的老学究
- **描述**: 村里住着一位退休的学者，据说他年轻时是王都图书馆的管理员。他正在寻找一个聪慧的孩子传授毕生所学。
- **年龄**: 7 - 9
- **权重**: 8
- **触发条件**: include: `attribute.int >= 8`
- **unique**: true
- **tag**: knowledge, life
- **priority**: major
- **基础效果**: int +1
- **分支**:
  - **拜师学艺** → int +3, mag +1, `flag.sage_disciple`, `flag.academy_path` → 老学者教你识字、算术和基础魔法理论。"知识是唯一不会被偷走的财富，"他说
  - **礼貌拒绝，自己探索** → int +1, spr +1, luk +1, `flag.independent_learner` → "谢谢您，但我更想自己去发现。"老人的眼中闪过一丝赞许

### int_child_first_puzzle
- **标题**: 石碑上的谜题
- **描述**: 村外的古遗迹旁有一块石碑，上面刻着一道谜题。据说解开它的人会得到宝藏的线索。
- **年龄**: 7 - 10
- **权重**: 6
- **触发条件**: include: `attribute.int >= 8`
- **unique**: true
- **tag**: knowledge, mystery
- **priority**: normal
- **基础效果**: int +1
- **分支**:
  - **独自破解** → int +3, luk +1, `flag.puzzle_solver`, `item.ancient_map_fragment` → 你是几十年来第一个解开谜题的人。石碑裂开，露出一张残破的地图碎片
  - **叫朋友一起来解** → int +1, chr +2, `flag.team_player` → 你们一起破解了谜题。虽然没有宝藏，但你收获了友谊和合作的经验

---

## 阶段二：少年求学（age 10-14）

### int_youth_academy_letter
- **标题**: 王立学院的录取通知
- **描述**: 一封盖着金色封蜡的信送到了你家——王立学院正在招收新生。这是整个王国最负盛名的学府。
- **年龄**: 10 - 12
- **权重**: 9
- **触发条件**: include: `attribute.int >= 10`; exclude: `has.flag.academy_enrolled`
- **unique**: true
- **tag**: knowledge, magic, life
- **priority**: critical
- **基础效果**: int +1
- **分支**:
  - **接受入学** → int +4, mag +2, mny -5, str -2, `flag.academy_enrolled`, `flag.academy_path` → 学院的一切都让你兴奋。图书馆的藏书量让你目瞪口呆，而你即将成为其中一员
  - **婉拒，走自己的路** → int +1, spr +2, `flag.self_taught_path`, `flag.independent_learner` → "学院能教给我的，我自己也能学到。"你婉拒了邀请，但内心深处也在犹豫

### int_youth_street_bookseller
- **标题**: 流动书商的奇书
- **描述**: 一个神秘的流动书商来到了村庄。他的摊位上有各种罕见的书籍，其中一本散发着奇异的魔力光芒——但价格不菲。
- **年龄**: 10 - 13
- **权重**: 6
- **触发条件**: include: `attribute.int >= 9`
- **unique**: true
- **tag**: knowledge, mystery
- **priority**: normal
- **基础效果**: int +1
- **分支**:
  - **买下那本发光的书** → int +3, mny -4, `flag.mysterious_grimoire`, `flag.forbidden_curiosity` → 书的文字在你手中缓缓浮现——这是一本失传已久的元素论。但夜深时你总觉得有什么东西在注视着你
  - **买普通教科书** → int +2, mny -1, `flag.practical_learner` → 扎实的基础比花哨的魔法更重要。你选择了实用的道路

### int_youth_rivalry
- **标题**: 天才的竞争
- **描述**: 无论你走到哪里，总有一个人比你更聪明。你们的每一次考试都在争夺第一名，而你们的竞争已经开始引人注目。
- **年龄**: 11 - 14
- **权重**: 7
- **触发条件**: include: `attribute.int >= 11`
- **unique**: true
- **tag**: knowledge, life
- **priority**: major
- **基础效果**: int +1
- **分支**:
  - **以竞争为动力** → int +3, chr -1, `flag.driven_competitor` → 你把对手视为磨刀石。在这种压力下，你的成长速度令人惊叹——但你也越来越孤独
  - **化敌为友** → int +1, chr +2, `flag.scholar_friendship` → "其实我们可以一起学。"出乎意料的是，对方也有同样的想法。你们开始互相切磋，共同进步

### int_youth_ruins_exploration
- **标题**: 古代遗迹的诱惑
- **描述**: 你听说镇外的山脉中有一处古代遗迹，传说里面保存着远古时代的知识结晶。但那里也充满了未知的危险。
- **年龄**: 12 - 14
- **权重**: 6
- **触发条件**: include: `attribute.int >= 10`; exclude: `has.flag.ruins_explored`
- **unique**: true
- **tag**: knowledge, adventure, mystery
- **priority**: major
- **基础效果**: int +1
- **分支**:
  - **组队探索** → int +2, chr +1, str +1, `flag.ruins_explored`, `item.ancient_tablet_shard` → 你和伙伴们小心翼翼地进入遗迹。在塌方的图书馆里，你找到了一块刻满符文的石板碎片
  - **独自深入** → int +4, spr -2, hp -5, `flag.ruins_explored`, `flag.solitary_explorer`, `item.forbidden_scroll` → 你独自摸索到了遗迹最深处。那里有一卷被封印的卷轴——你的直觉告诉你不该打开它，但好奇心占了上风

### int_youth_self_teaching
- **标题**: 知识不分贵贱
- **描述**: 学院的学生们看不起自学出身的人。你决定用实际行动证明：知识不属于任何人，它属于所有渴望它的人。
- **年龄**: 12 - 14
- **权重**: 5
- **触发条件**: include: `has.flag.self_taught_path`; exclude: `has.flag.proven_self_taught`
- **unique**: true
- **tag**: knowledge, life
- **priority**: major
- **基础效果**: int +2
- **分支**:
  - **参加公开学术辩论** → int +3, chr +2, `flag.proven_self_taught`, `flag.respected_scholar` → 你在王都的公开辩论中击败了学院的学生。消息传开后，甚至有教授对你产生了兴趣
  - **用知识解决实际问题** → int +2, spr +1, luk +1, `flag.proven_self_taught`, `flag.practical_genius` → 你用学到的知识帮村庄解决了灌溉问题。学院的教授路过时看到你的方案，沉默良久

---

## 阶段三：青年抉择（age 15-18）

### int_young_specialization
- **标题**: 选择你的道路
- **描述**: 知识的海洋无边无际，你必须选择一个方向深耕。这个选择将决定你未来的道路。
- **年龄**: 15 - 16
- **权重**: 8
- **触发条件**: include: `attribute.int >= 12`; exclude: `has.flag.chosen_field`
- **unique**: true
- **tag**: knowledge, magic
- **priority**: critical
- **基础效果**: int +1
- **分支**:
  - **元素魔法理论** → int +3, mag +3, `flag.chosen_field_elemental`, `flag.theory_mage` → 你选择了研究元素的本质。火为什么燃烧？水为什么流动？你相信理解原理比记住咒语更重要
  - **古代历史与考古** → int +3, luk +2, `flag.chosen_field_history`, `flag.antiquarian` → 失落的文明、被遗忘的真相——你选择深入过去的尘埃中寻找未来的钥匙
  - **炼金术与物质转化** → int +3, str +1, mny +2, `flag.chosen_field_alchemy`, `flag.alchemist` → 你对物质本质的转化着迷。点石成金不只是传说，它是对世界规则的深刻理解

### int_young_forbidden_section
- **标题**: 禁忌图书区
- **描述**: 你发现学院图书馆有一扇永远锁着的门。据说里面保存着被封禁的禁忌知识。午夜时分，你发现锁有松动的迹象。
- **年龄**: 15 - 17
- **权重**: 5
- **触发条件**: include: `attribute.int >= 13, has.flag.academy_enrolled`; exclude: `has.flag.read_forbidden`
- **unique**: true
- **tag**: knowledge, mystery, danger
- **priority**: critical
- **基础效果**: int +1
- **分支**:
  - **潜入禁忌区** → int +5, mag +3, spr -5, `flag.read_forbidden`, `flag.marked_by_truth`, `flag.pursued` → 你读到了不该读的东西——关于这个世界"真实面目"的记录。知识如洪水般灌入你的脑海，但你感觉灵魂的一部分在碎裂。从今往后，你的梦境中多了不该存在的东西
  - **向教授报告** → int +1, chr +2, `flag.trusted_by_faculty`, `flag.guardian_of_secrets` → 你把这个发现告诉了信任的教授。他面色凝重地感谢你，并说："有些门，关着是有原因的。"你获得了教授的信任，但也失去了窥探真相的机会
  - **离开，不再追问** → spr +2, int -1, `flag.wise_abandon` → 你转身离开了。有些事不知道比知道好。但深夜独处时，你偶尔会想——那扇门后面到底是什么

### int_young_mentor_test
- **标题**: 导师的考验
- **描述**: 你的导师（无论是学院的教授还是自学路上遇到的引路人）给了你一道难题。他说："解开它，我就教你真正的知识。"
- **年龄**: 15 - 17
- **权重**: 7
- **触发条件**: include: `attribute.int >= 12`
- **unique**: true
- **tag**: knowledge, magic
- **priority**: major
- **基础效果**: int +2
- **分支**:
  - **用常规方法解答** → int +2, mag +2, `flag.steady_scholar` → 导师点了点头："正确，但缺乏想象力。"他教你更高阶的理论，但提醒你：规则之外还有规则
  - **找出题目本身的问题** → int +4, spr +1, `flag.lateral_thinker`, `flag.mentor_recognized` → "这道题有漏洞，"你说。导师沉默了三秒，然后大笑起来。"你是我教过最危险的学生。"从今天起，他开始教你真正深奥的东西

### int_young_first_discovery
- **标题**: 你的第一个发现
- **描述**: 经过长期的研究，你发现了一个前人从未注意到的现象。这可能是一个重大突破——也可能是一个错误。
- **年龄**: 16 - 18
- **权重**: 6
- **触发条件**: include: `attribute.int >= 14`; exclude: `has.flag.first_discovery`
- **unique**: true
- **tag**: knowledge, magic
- **priority**: major
- **基础效果**: int +2
- **分支**:
  - **发表论文，公开发现** → int +3, chr +2, mny +2, `flag.first_discovery`, `flag.published_scholar` → 你的论文在学术界引起轰动。你一夜之间从无名学生变成了冉冉升起的新星。但也有人开始嫉妒你
  - **继续秘密研究** → int +4, `flag.first_discovery`, `flag.secret_researcher` → 你决定继续深入研究，直到完全理解这个发现。谨慎是学者的美德——但秘密也有被泄露的风险

### int_young_lore_trade
- **标题**: 地下知识交易
- **描述**: 你被邀请参加一个秘密的知识交换会。学者们在这里交换被官方禁止的研究成果、异端理论和被抹去的历史记录。
- **年龄**: 16 - 18
- **权重**: 5
- **触发条件**: include: `attribute.int >= 13`
- **unique**: true
- **tag**: knowledge, danger, mystery
- **priority**: major
- **基础效果**: int +1
- **分支**:
  - **参与交换** → int +3, mag +2, spr -2, `flag.underground_scholar`, `flag.knows_secrets` → 你用一个自己研究的理论换来了一份珍贵的手稿。地下学者们接纳了你，但你知道，一旦暴露，你将失去一切
  - **拒绝，举报** → chr +2, int +1, `flag.lawful_scholar` → 你向学院举报了这个组织。虽然你得到了表彰，但有些学者开始疏远你
  - **旁观学习，不参与** → int +2, luk +1, `flag.cautious_observer` → 你只是旁观，记住了你能记住的一切。聪明的做法——但也意味着你什么都没得到

---

## 阶段四：学徒深耕（age 19-24）

### int_apprentice_thesis
- **标题**: 毕业论文
- **描述**: 你站在学术生涯的重要门槛上。你的论文选题将决定你在学术界的地位。
- **年龄**: 19 - 21
- **权重**: 8
- **触发条件**: include: `attribute.int >= 15, has.flag.academy_enrolled`; exclude: `has.flag.thesis_completed`
- **unique**: true
- **tag**: knowledge, magic
- **priority**: critical
- **基础效果**: int +2
- **分支**:
  - **写一篇安全但有深度的论文** → int +3, chr +2, mny +3, `flag.thesis_completed`, `flag.respected_academic` → 你的论文获得了最高评价。教授们一致认为你是学院百年来最优秀的学生之一
  - **写一篇颠覆性的论文** → int +5, chr -3, spr -1, `flag.thesis_completed`, `flag.controversial_scholar`, `flag.academic_enemy` → 你的论文挑战了学界主流观点。有人视你为天才，有人视你为异端。学术界的政治游戏开始了

### int_apprentice_expedition
- **标题**: 首次田野调查
- **描述**: 你终于有机会离开书房，亲自前往古代遗迹进行田野调查。理论与实践将在这一刻碰撞。
- **年龄**: 19 - 22
- **权重**: 7
- **触发条件**: include: `attribute.int >= 14`; exclude: `has.flag.field_researcher`
- **unique**: true
- **tag**: knowledge, adventure
- **priority**: major
- **基础效果**: int +2, str +1
- **分支**:
  - **细致入微地调查** → int +3, luk +1, `flag.field_researcher`, `item.complete_tablet` → 你花了三天时间仔细记录遗迹中的每一个细节。在碎石堆下，你找到了完整的石碑——上面记载着一个失落的魔法体系
  - **大胆深入未知区域** → int +2, str +2, spr -2, `flag.field_researcher`, `flag.ancient_pact` → 你进入了遗迹中从未被探索过的区域。在那里，你发现了一个仍在运转的古代魔法阵——以及一个等待了千年的声音

### int_apprentice_rival_revenge
- **标题**: 对手的反击
- **描述**: 你的学术对手（如果你在少年时期有过竞争）发布了一篇针对你理论的反驳论文。这是一次精心策划的学术攻击。
- **年龄**: 20 - 23
- **权重**: 5
- **触发条件**: include: `has.flag.driven_competitor OR has.flag.controversial_scholar`
- **unique**: true
- **tag**: knowledge, life
- **priority**: normal
- **基础效果**: int +1
- **分支**:
  - **用实力回击** → int +3, chr +1, `flag.triumphant_scholar` → 你花了三个月写出了完美的反驳。对手的论点在你面前土崩瓦解，而你因此更加名声大噪
  - **超越争端，开辟新方向** → int +2, spr +2, `flag.transcendent_mind` → "你的反驳有道理。"你公开承认了对手的部分观点，然后提出了一个全新的理论框架，将双方的发现都容纳其中。这一举动让你赢得了所有人的尊重

### int_apprentice_secret_teaching
- **标题**: 隐秘的传承
- **描述**: 一位年迈的大师找到了你。他说他的知识已经没有人愿意学——因为那些知识被认为是"过时"的。但他相信你不同。
- **年龄**: 20 - 24
- **权重**: 5
- **触发条件**: include: `attribute.int >= 15`; exclude: `has.flag.secret_teaching`
- **unique**: true
- **tag**: knowledge, magic, mystery
- **priority**: major
- **基础效果**: int +2
- **分支**:
  - **虚心学习** → int +4, mag +3, spr +1, `flag.secret_teaching`, `flag.ancient_wisdom` → 大师教给你的不仅是知识，更是一种理解世界的方式。"真正的智慧不在于知道得多，而在于知道什么值得知道。"
  - **请教他禁忌知识** → int +3, mag +2, spr -3, `flag.secret_teaching`, `flag.knows_taboo`, `flag.haunted_knowledge` → 你追问了不该问的问题。大师沉默了很久，最终还是告诉了你。他眼中满是悲伤："你现在知道了。但知道之后，你还能像从前一样生活吗？"

### int_apprentice_self_taught_masterwork
- **标题**: 野生天才的杰作
- **描述**: 没有学院的资源，你凭借自己的力量完成了一项了不起的研究。这将被世人所知——但以何种方式？
- **年龄**: 21 - 24
- **权重**: 5
- **触发条件**: include: `has.flag.self_taught_path, attribute.int >= 15`; exclude: `has.flag.masterwork_published`
- **unique**: true
- **tag**: knowledge, life
- **priority**: major
- **基础效果**: int +3
- **分支**:
  - **以匿名方式发表** → int +2, mny +2, `flag.masterwork_published`, `flag.mysterious_author` → 你的作品在学术界引起轰动，但没人知道作者是谁。这反而让传说更加迷人
  - **公开亮相** → int +2, chr +3, `flag.masterwork_published`, `flag.self_made_scholar` → 你公开了自己的身份。自学的天才——这个标签既是一种荣耀，也是一种枷锁

---

## 阶段五：学者时期（age 25-34）

### int_scholar_great_library
- **标题**: 大图书馆的钥匙
- **描述**: 你获得了进入王国大图书馆深层的权限。这里保存着数千年来所有的知识——包括那些"不存在"的记录。
- **年龄**: 25 - 28
- **权重**: 7
- **触发条件**: include: `attribute.int >= 18`; exclude: `has.flag.library_access`
- **unique**: true
- **tag**: knowledge, magic, mystery
- **priority**: critical
- **基础效果**: int +3
- **分支**:
  - **系统性地研究** → int +4, mag +3, `flag.library_access`, `flag.erudite_scholar` → 你花了数年时间在大图书馆中系统学习。你成为了在世最博学的人之一——但你知道，知识越多，无知感越强
  - **寻找被隐藏的真相** → int +3, mag +2, spr -4, `flag.library_access`, `flag.truth_seeker`, `flag.knows_the_lie` → 你找到了被刻意抹去的记录。这个世界的官方历史是一部精心编造的谎言。知道真相的你，再也无法假装无知

### int_scholar_apprentice_of_your_own
- **标题**: 收徒
- **描述**: 越来越多的年轻人慕名而来，想要成为你的学生。你不能全部收下——但你可以选择最有潜力的那个。
- **年龄**: 26 - 30
- **权重**: 6
- **触发条件**: include: `attribute.int >= 17`; exclude: `has.flag.has_apprentice`
- **unique**: true
- **tag**: knowledge, life
- **priority**: normal
- **基础效果**: int +1, chr +1
- **分支**:
  - **选择聪慧但傲慢的天才** → int +2, chr -1, `flag.has_apprentice`, `flag.challenging_apprentice` → 这孩子像极了年轻时的你——也许太像了。教他是一场与自己的对话
  - **选择平凡但坚韧的学生** → int +1, spr +2, chr +2, `flag.has_apprentice`, `flag.humble_mentor` → "天赋不是一切。"你选择了一个平凡但永不放弃的学生。教导他的过程中，你自己也重新理解了知识的本质

### int_scholar_political_trap
- **标题**: 学者的陷阱
- **描述**: 你的研究成果引起了权贵们的注意。他们邀请你担任"顾问"——但你很快发现，他们想要的不是你的智慧，而是利用你的名声。
- **年龄**: 27 - 32
- **权重**: 6
- **触发条件**: include: `attribute.int >= 16`; exclude: `has.flag.political_entanglement`
- **unique**: true
- **tag**: knowledge, life, danger
- **priority**: major
- **基础效果**: mny +2
- **分支**:
  - **周旋其中，借势而行** → int +2, mny +4, chr -1, `flag.political_entanglement`, `flag.political_scholar` → 你学会了在权力的游戏中生存。利用他们的资源推进你的研究——代价是你的部分自由
  - **果断拒绝，保持独立** → int +1, spr +3, mny -2, `flag.independent_scholar` → "知识不属于权力。"你的拒绝赢得了同行的尊敬，但也让你失去了重要的研究资源

### int_scholar_forbidden_ritual
- **标题**: 禁忌的召唤
- **描述**: 你在研究中发现了一种被禁用的仪式。它可以直接从位面之壁获取知识——但代价是献祭自身的灵性。更重要的是，使用这个仪式本身就被视为异端行为。
- **年龄**: 28 - 34
- **权重**: 5
- **触发条件**: include: `attribute.int >= 18, has.flag.forbidden_curiosity OR has.flag.truth_seeker`; exclude: `has.flag.performed_ritual`
- **unique**: true
- **tag**: knowledge, magic, danger, mystery
- **priority**: critical
- **基础效果**: int +1
- **分支**:
  - **执行仪式** → int +8, mag +5, spr -8, hp -10, `flag.performed_ritual`, `flag.touched_the_veil`, `flag.wanted_heretic` → 你触碰到了位面之壁。无穷无尽的知识涌入你的脑海——创世的秘密、世界的真相、存在的意义。但你的灵魂被撕开了一道口子，教会的审判庭已经出动了
  - **毁掉研究记录** → spr +3, int -2, `flag.destroyed_knowledge` → "有些知识不该存在于世上。"你颤抖着烧毁了所有记录。但你能感觉到那道裂缝在你身后若隐若现，诱惑着你回去

### int_scholar_truth_burden
- **标题**: 真相的重量
- **描述**: 如果你知道了真相——无论通过何种方式——它正在改变你。你的梦境中出现了不该出现的景象，你开始理解为什么有人选择不知道。
- **年龄**: 28 - 34
- **权重**: 5
- **触发条件**: include: `has.flag.knows_the_lie OR has.flag.touched_the_veil OR has.flag.haunted_knowledge`
- **unique**: true
- **tag**: knowledge, mystery, danger
- **priority**: major
- **基础效果**: spr -2
- **分支**:
  - **接受真相，承受代价** → int +3, spr -3, `flag.truth_bearer`, `flag.unbreakable_mind` → 知道真相是一种诅咒，但你选择承受。"如果连知道真相的勇气都没有，我有什么资格称自己为学者？"
  - **寻找消除记忆的方法** → int +2, spr +1, `flag.seeking_oblivion` → 你开始研究消除特定记忆的魔法。这本身也是禁忌知识——你正在用禁忌对抗禁忌

---

## 阶段六：大师境界（age 35-49）

### int_master_magnum_opus
- **标题**: 毕生之作
- **描述**: 你开始撰写你一生中最重要的著作。这将是你所有知识和智慧的结晶，一本足以改变世界的书。
- **年龄**: 35 - 40
- **权重**: 7
- **触发条件**: include: `attribute.int >= 22`; exclude: `has.flag.magnum_opus`
- **unique**: true
- **tag**: knowledge, magic
- **priority**: critical
- **基础效果**: int +3
- **分支**:
  - **公开出版，普惠世人** → int +3, chr +4, mny +5, `flag.magnum_opus`, `flag.legendary_author` → 你的书被翻译成数十种语言，成为所有学者的必读之物。你改变了整个世界的知识格局
  - **只传授给值得信任的人** → int +4, mag +3, `flag.magnum_opus`, `flag.hidden_teacher` → "这些知识太危险了。"你选择只将毕生所学传授给经过严格筛选的学生。一条隐秘的传承链就此开始

### int_master_hunted
- **标题**: 猎巫行动
- **描述**: 教会的审判庭终于找到了你。你的研究——无论是否触及禁忌——已经被视为对正统的威胁。逃亡还是正面对抗？
- **年龄**: 35 - 42
- **权重**: 6
- **触发条件**: include: `has.flag.wanted_heretic OR has.flag.controversial_scholar`; exclude: `has.flag.hunted_resolved`
- **unique**: true
- **tag**: knowledge, danger, life
- **priority**: critical
- **基础效果**: spr -1
- **分支**:
  - **隐姓埋名，暗中研究** → int +2, luk +2, chr -2, `flag.hunted_resolved`, `flag.underground_existence` → 你放弃了一切身份，成为了一个不存在的人。但你的研究仍在暗处继续——也许正是黑暗中，才看得最清楚
  - **正面对抗，用知识为武器** → int +3, chr +3, spr -2, `flag.hunted_resolved`, `flag.knowledge_rebel` → "你们害怕的不是我的研究，而是真相本身。"你公开反驳教会，在民众中引发了巨大的争议。你成为了异见者的象征

### int_master_lost_student
- **标题**: 迷失的学生
- **描述**: 你的得意门生走上了一条危险的道路——他被禁忌知识的诱惑所吞噬，正在重复你曾经的错误。或者说，他在走一条你不敢走的路。
- **年龄**: 38 - 45
- **权重**: 5
- **触发条件**: include: `has.flag.has_apprentice`; exclude: `has.flag.student_crisis`
- **unique**: true
- **tag**: knowledge, life, danger
- **priority**: major
- **基础效果**: int +1
- **分支**:
  - **阻止他，哪怕用强制手段** → int +1, spr +2, chr -1, `flag.student_crisis`, `flag.protective_mentor` → 你锁住了他的研究资料，禁止他继续。他恨你——但至少他还活着。也许有一天他会理解
  - **引导他走更安全的路** → int +2, chr +2, `flag.student_crisis`, `flag.wise_guide` → 你没有禁止他，而是引导他。"你想知道真相？让我教你如何不被真相吞噬。"

### int_master_dimensional_insight
- **标题**: 维度之悟
- **描述**: 你多年的研究终于指向了一个惊人的结论：这个世界的物理法则不是自然的，而是被设计过的。是谁设计了这些规则？为什么？
- **年龄**: 40 - 48
- **权重**: 5
- **触发条件**: include: `attribute.int >= 24, has.flag.touched_the_veil OR has.flag.truth_seeker`; exclude: `has.flag.dimensional_insight`
- **unique**: true
- **tag**: knowledge, magic, mystery
- **priority**: critical
- **基础效果**: int +3, spr -2
- **分支**:
  - **深入探索，寻找设计者** → int +5, mag +4, spr -5, `flag.dimensional_insight`, `flag.seeks_architect`, `flag.reality_haunted` → 你开始寻找这个世界的"设计师"。每一次深入，现实都变得更加模糊。你不确定你还活着，还是已经成为了理论本身
  - **停止探索，保存自我** → int +1, spr +3, `flag.dimensional_insight`, `flag.knows_the_boundary` → "我已经看到了足够多。"你选择了停止。但每个深夜，那个问题仍在你脑海中回响

### int_master_legacy
- **标题**: 学术遗产
- **描述**: 你的学生已经遍布各地。你建立了一个非正式的学术网络，传递着正统学术界不敢触碰的知识。
- **年龄**: 42 - 49
- **权重**: 5
- **触发条件**: include: `attribute.int >= 20, has.flag.has_apprentice`
- **unique**: true
- **tag**: knowledge, life
- **priority**: normal
- **基础效果**: chr +2, int +1
- **分支**:
  - **正式建立学派** → int +2, chr +3, mny +3, `flag.founded_school`, `flag.school_founder` → 你创建了一个正式的学术流派。你的思想将通过你的学生和他们学生的学生永远流传下去
  - **保持松散网络，分散传承** → int +2, luk +2, spr +1, `flag.shadow_network`, `flag.hidden_legacy` → "一棵树容易被砍倒，但一片森林不会。"你选择让知识分散在无数人中。没有人知道全貌，但真相永远不会消失

---

## 阶段七：传说终章（age 50+）

### int_legend_final_truth
- **标题**: 世界之书
- **描述**: 你在生命的暮年收到了一封来自未知来源的信。信中只有一个坐标——指向世界的尽头。那里据说保存着一本记录了一切的书。
- **年龄**: 50 - 70
- **权重**: 6
- **触发条件**: include: `attribute.int >= 25`; exclude: `has.flag.found_world_book`
- **unique**: true
- **tag**: knowledge, magic, mystery
- **priority**: critical
- **基础效果**: int +2
- **分支**:
  - **前往世界的尽头** → int +5, mag +5, spr -5, `flag.found_world_book`, `flag.transcendent_being` → 你找到了那本书。翻开它的一瞬间，你理解了一切——所有的知识、所有的真相、所有的谎言。但你也失去了"自己"。你成为了一个超越凡人的存在，但代价是再也无法回到曾经的生活
  - **撕毁信件，安然终老** → spr +5, int +2, `flag.peaceful_end`, `flag.wise_sage` → "我这一辈子追寻的已经够多了。"你微笑着把信撕成碎片。在余下的岁月里，你享受着平静的生活，偶尔教导后辈。你是一个真正智慧的 sage

### int_legend_epilogue_teacher
- **标题**: 最后的课
- **描述**: 你的学生们从各地赶来，听你上最后一堂课。你不知道这是不是真的最后一课，但你想把最重要的东西告诉他们。
- **年龄**: 55 - 75
- **权重**: 5
- **触发条件**: include: `attribute.int >= 22, has.flag.has_apprentice OR has.flag.school_founder`
- **unique**: true
- **tag**: knowledge, life
- **priority**: major
- **基础效果**: int +1, chr +2
- **分支**:
  - **传授所有知识，包括禁忌** → int +3, spr -2, `flag.final_lesson_full`, `flag.dangerous_legacy` → 你把毕生所学——包括那些危险的知识——全部传授了。"我用一生才学会分辨哪些知识该用、哪些不该用。现在轮到你们了。"
  - **只传授智慧，不传授知识** → spr +3, int +1, chr +3, `flag.final_lesson_wisdom`, `flag.true_sage` → "知识可以写在书里。我今天要教你们的是如何面对自己的无知。"你讲了一个关于谦逊与好奇的故事。没有人记录下来，但每个人都记住了

### int_legend_mad_or_enlightened
- **标题**: 天才与疯子之间
- **描述**: 你知道得太多了。有些日子你觉得你已经超越了凡人的理解，有些日子你觉得你已经疯了。也许两者之间没有区别。
- **年龄**: 55 - 70
- **权重**: 4
- **触发条件**: include: `has.flag.touched_the_veil OR has.flag.reality_haunted, attribute.spr <= 10`
- **unique**: true
- **tag**: knowledge, mystery, danger
- **priority**: critical
- **基础效果**: spr -3, int +2
- **分支**:
  - **拥抱疯狂，获取超越** → int +8, mag +6, spr -10, `flag.transcendent_madness`, `flag.beyond_mortal` → 你不再抵抗。疯狂与洞察融为一体，你达到了凡人不该达到的认知层次。你看到了常人看不到的东西——但你也再也回不来了
  - **退回安全地带** → spr +4, int -3, `flag.returned_sanity`, `flag.humbled_genius` → "够了。"你用仅存的理智封印了自己的部分记忆。你失去了那些超越性的知识，但保住了自己。有时候，放弃也是一种智慧

### int_legend_quiet_end
- **标题**: 学者的归宿
- **描述**: 无论你的一生经历了什么——辉煌的成就、禁忌的发现、被迫的逃亡——最终，你回到了书桌前。你一生中最安心的地方。
- **年龄**: 60 - 80
- **权重**: 8
- **触发条件**: include: `attribute.int >= 20`
- **unique**: true
- **tag**: knowledge, life
- **priority**: major
- **基础效果**: int +1, spr +2
- **分支**:
  - **留下最后的著作** → int +3, `flag.final_work`, `flag.legendary_scholar_ending` → 你用尽最后的力气写下了你最后一本书。没有华丽的辞藻，只有朴实的真相。这本书后来被称为「最诚实的书」
  - **安静地合上书本** → spr +3, `flag.peaceful_scholar_ending` → 你轻轻合上了正在读的书。窗外的夕阳很好。这一生，你没有什么遗憾的。你闭上眼睛，嘴角带着微笑

---

## 设计笔记

### 子线分支点

| 阶段 | 学院派 | 自学派 | 真理追寻 |
|------|--------|--------|----------|
| 童年 | 老学究拜师 → `academy_path` | 偷偷阅读 → `self_learner` | 石碑谜题 → `puzzle_solver` |
| 少年 | 学院入学 → `academy_enrolled` | 拒绝入学 → `self_taught_path` | 古遗迹探索 → `forbidden_scroll` |
| 青年 | 毕业论文 → `respected_academic` | 野生杰作 → `self_made_scholar` | 禁忌图书区 → `read_forbidden` |
| 学徒 | 学术传承 → `ancient_wisdom` | 独立学者 → `independent_scholar` | 禁忌仪式 → `touched_the_veil` |
| 学者 | 大图书馆 → `erudite_scholar` | 地下网络 → `hidden_legacy` | 维度之悟 → `dimensional_insight` |
| 大师 | 创办学派 → `school_founder` | 松散传承 → `shadow_network` | 猎巫逃亡 → `knowledge_rebel` |
| 传说 | 最后的课 → `true_sage` | 安静终老 → `peaceful_scholar_ending` | 世界之书 → `transcendent_being` |

### 核心设计原则

1. **知识是有代价的**：每次获取高阶知识都伴随 spr 下降或社交代价
2. **三条路线不是互斥的**：可以通过特定 flag 组合解锁混合路线
3. **真相是双刃剑**：`truth_seeker` 相关事件提供高 int 但严重损害 spr
4. **自学 vs 学院不是好坏之分**：各有独特优势和劣势
5. **最终阶段提供"放弃"选项**：不是所有学者都需要触及真相，平凡也是一种智慧