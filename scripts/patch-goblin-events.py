#!/usr/bin/env python3
"""
哥布林事件适配补丁
根据世界书设定和DND哥布林生态，修复通用事件对哥布林的适配问题:
1. 排除哥布林不可能参与的事件（骑士、皇家、教会等）
2. 为高频通用事件添加哥布林种族变体（raceVariants.goblin）
"""
import json
import os
import sys

EVENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'sword-and-magic', 'events')

# ===============================================================
# 第一部分：需要排除哥布林的事件
# 这些事件深度绑定人类/精灵社会体系，哥布林完全无法参与
# 策略：在 races 字段中添加 ["human", "elf"]（当前可玩种族白名单）
# ===============================================================
EXCLUDE_GOBLIN = {
    # --- 骑士体系 ---
    'knight_examination': '骑士考核 - 哥布林不会成为骑士',
    'knight_glory': '骑士荣光 - 哥布林不属于骑士团',
    'knight_siege': '城堡围攻 - 以骑士身份',
    'knight_dragon_quest': '屠龙 - 以骑士身份',
    'knight_tournament': '骑士锦标赛 - 人类/精灵骑士活动',
    'sword_training_camp': '骑士团训练营 - 骑士专属',
    'squire_opportunity': '骑士侍从选拔 - 不会选哥布林做侍从',
    'dual_war_mage': '战争法师 - 人类军队不会招募哥布林法师',
    # --- 皇家/贵族体系 ---
    'royal_summon': '皇城召见 - 皇室不会召见哥布林',
    'hero_journey_start': '勇者旅途 - 圣剑不会选中哥布林',
    'become_lord': '受封领主 - 国王不会封哥布林为领主',
    'mid_lord_govern': '封地治理 - 哥布林不会拥有封地',
    'mid_political_intrigue': '宫廷阴谋 - 哥布林不参与宫廷政治',
    'noble_admirer': '贵族追慕 - 贵族不会公开赞赏哥布林',
    'birth_noble_estate': '贵族庄园出生 - 哥布林不会出生在贵族庄园',
    # --- 教会体系 ---
    'church_orphan': '教会收养 - 教会不会收养哥布林孤儿',
    'demon_hunt': '猎魔骑士追杀 - 前提是魔族血脉，不适用哥布林',
    # --- 生理不兼容 ---
    'centenarian_celebration': '百岁庆典 - 哥布林寿命仅20-40岁',
}

# ===============================================================
# 第二部分：需要添加哥布林种族变体的通用事件
# 这些事件概念上适用于哥布林，但描述是人类视角的
# 策略：添加 raceVariants.goblin 覆盖 title/description
# ===============================================================
GOBLIN_VARIANTS = {
    # ====== birth 出生阶段 ======
    'birth_storm': {
        'title': '暴风夜降生',
        'description': '你出生在一场罕见的暴风雨之夜。地面的雨水灌进了下水道，部落的老哥布林说这是不祥之兆。但你的母亲紧紧抱着你，在雷声中低声哼唱着古老的哥布林摇篮曲。',
    },
    'birth_eclipse': {
        'title': '日蚀之子',
        'description': '日蚀之日出生的哥布林，传说中会拥有异于常人的好运气。部落的萨满对着你念了一通谁也听不懂的咒语，然后郑重宣布："这个崽子，不一般。"',
    },

    # ====== childhood 童年阶段 ======
    'village_festival': {
        'title': '废品集市',
        'description': '一年一度的废品交换大会开始了！哥布林们把攒了一年的"宝贝"摆出来——生锈的盔甲碎片、奇怪的矿石、来路不明的魔法道具。整个地下城热闹非凡，空气中弥漫着烤虫子的香味。',
    },
    'tree_climbing': {
        'title': '向上攀爬',
        'description': '你挑战攀爬地下城里最高的排水管道。管壁又湿又滑，但你那灵活的小爪子找到了每一个凹点。爬到顶端时，你第一次从排水口看到了外面的天空。',
    },
    'river_fishing': {
        'title': '下水道捞宝',
        'description': '你和几个小伙伴拿着自制的网兜，蹲在下水道的汇流处。人类扔掉的东西会从这里冲下来——有时候能捞到铜币甚至银首饰。今天运气怎么样？',
    },
    'first_snow': {
        'title': '第一场雪',
        'description': '你从地道口探出头，发现外面的世界变白了。你从没见过这种东西——冷冰冰的白色粉末从天上掉下来。你抓了一把塞进嘴里，又惊又喜。',
    },
    'childhood_hide_seek': {
        'title': '地洞捉迷藏',
        'description': '你和小伙伴在四通八达的地下管道里玩捉迷藏。哥布林天生的夜视能力让这个游戏更加刺激——你找到了一条谁都不知道的秘密通道，藏了整整一下午。',
    },
    'childhood_pet': {
        'title': '收养了一只大老鼠',
        'description': '你在废墟里发现了一只受伤的巨鼠，它的后腿被夹子夹住了。你小心地帮它解开，用嚼烂的草叶包扎伤口。它舔了舔你的手指，从此成了你最忠实的伙伴。',
    },
    'stray_dog': {
        'title': '地洞里的生物',
        'description': '你在回巢的路上遇到了一只脏兮兮的洞鼠崽。它瑟瑟发抖地缩在角落里，显然是被鼠群抛弃了。你决定……',
    },
    'first_competition': {
        'title': '第一次赌博',
        'description': '部落里的大人们在玩骰子赌博。你偷偷加入了一局——赌注是三颗闪亮的玻璃珠。结果……',
    },
    'grandma_recipes': {
        'title': '长老的秘方',
        'description': '部落里最老的哥布林教你调配一种特殊的药膏——用蘑菇、泥巴和一种你叫不出名字的虫子做的。"抹上这个，什么伤都能好。"她咧嘴笑着说。',
    },
    'noble_kid_revenge': {
        'title': '人类孩子的石头',
        'description': '一群人类孩子发现了你。他们捡起石头朝你扔过来——"脏哥布林！滚回下水道去！"你夹着脑袋狂奔，心里发誓总有一天要让他们后悔。',
    },
    'bullied_repeat': {
        'title': '又被欺负了',
        'description': '那群人类孩子又出现了，这次他们堵住了你回地洞的路。你的背抵着墙壁，看着他们一步步逼近。身为哥布林，你从小就知道——跑不掉的时候，就得用脑子。',
    },
    'stand_up_moment': {
        'title': '不再逃跑',
        'description': '又一群人类小鬼来找茬。但这次不一样——你掏出藏在裤兜里的辣椒粉猛地撒了出去！趁他们揉眼睛的时候，你一溜烟钻进了下水道。得意的笑声在管道里回荡。',
    },
    'magic_academy_letter': {
        'title': '奇怪的录取通知',
        'description': '一天，一只脏兮兮的乌鸦叼着一封信落在你面前。信上写着你的名字——某个不知名的地下魔法组织邀请你加入。他们说你有"混乱天赋"，这在哥布林中极为罕见。',
    },
    'child_plague': {
        'title': '瘟疫蔓延',
        'description': '地下城里爆发了一场可怕的瘟疫。对哥布林来说，拥挤潮湿的环境让疾病传播得更快。部落里已经有好几个人倒下了……',
    },
    'child_lost_in_woods': {
        'title': '迷失地面',
        'description': '你好奇地爬出了地面，想看看外面的世界。等你反应过来，已经分不清哪个洞口是回去的路了。太阳刺痛了你的眼睛——地面世界对哥布林来说又大又亮又危险。',
    },
    'kindness_of_stranger': {
        'title': '陌生人的善意',
        'description': '你饿得快晕过去的时候，一个路过的矮人商人把半块面包递给了你。"拿去吧，小家伙。"他没有像其他人那样露出厌恶的表情。这份温暖你记了很久。',
    },
    'child_night_sky': {
        'title': '第一次看星空',
        'description': '某个夜晚你偷偷爬出地洞，抬头看到了此生最美的景象——满天的星星。在地下生活的哥布林很少有机会看到这些。一颗流星划过，你赶紧许了个愿。',
    },
    'child_cooking_adventure': {
        'title': '第一次做饭',
        'description': '你决定给家人做顿饭。收集了下水道里的蘑菇、一只刚抓来的洞鼠、还有从人类那里偷来的香料。过程手忙脚乱——但成品意外地还不错？',
    },
    'child_river_adventure': {
        'title': '地下暗河探险',
        'description': '你和小伙伴偷偷顺着一条地下暗河往深处游去，发现了一处从没人去过的洞穴，里面长满了发光的蘑菇，像一座地下花园。',
    },
    'rainbow_mushroom': {
        'title': '七彩蘑菇',
        'description': '你在地下深处捡到一颗发出七色光芒的蘑菇。老哥布林们说这种东西百年才出现一次——吃了会变强，也可能会爆炸。你小心翼翼地藏进了口袋。',
    },

    # ====== teenager 少年阶段 ======
    'tavern_brawl': {
        'title': '地下酒馆斗殴',
        'description': '你溜进了一个半地下的酒馆——这是少数不会赶走哥布林的地方。几杯劣质麦酒下肚，一个喝醉的人类冲你竖中指。你摸了摸腰间的匕首。',
    },
    'bounty_notice': {
        'title': '黑市悬赏',
        'description': '地下黑市的告示墙上贴满了委托——从偷窃到刺探情报应有尽有。你最感兴趣的是一个奇怪的委托：偷走一个人类商人的账本，报酬是一整袋金币。',
    },
    'meteor_shower': {
        'title': '流星雨',
        'description': '部落里的老哥布林说今晚值得爬到地面看看。你半信半疑地钻出洞口——漫天的流星划过夜空，比任何闪亮的宝石都美。你第一次觉得，地面世界也不全是坏的。',
    },
    'library_discovery': {
        'title': '废墟中的古书',
        'description': '你在一处坍塌的地下遗迹中发现了一本积满灰尘的古书。大部分文字你看不懂，但里面画满了奇怪的机械图纸——这对哥布林来说可是无价之宝。',
    },
    'teen_race_competition': {
        'title': '矿车竞速赛',
        'description': '一年一度的矿车竞速赛开始了！你和其他年轻哥布林骑着各自改装的矿车，在废弃的矿道里疯狂飞驰。速度是其次——关键是谁的矿车更炸裂。',
    },
    'teen_traveling_circus': {
        'title': '流浪马戏团',
        'description': '一个流浪马戏团路过了你居住区附近。你戴上兜帽偷偷混进去——杂技、魔术和喷火表演让你大开眼界。你暗暗想着：也许有一天我也能加入他们。',
    },
    'traveling_merchant': {
        'title': '走私商人来访',
        'description': '一个戴着面纱的商人来到了哥布林聚落。他带来了各种"特殊商品"——被禁的魔法道具、来路不明的药水，还有一些人类王国的情报。',
    },
    'chr_public_speech': {
        'title': '部落演说',
        'description': '部落举行了大会，讨论一个关系到所有人的问题。你被推到了中间发言。这是你证明自己的机会——但哥布林大会的规矩是：说得不好可能会被扔烂菜叶子。',
    },
    'spr_dream_vision': {
        'title': '预知梦',
        'description': '你做了一个异常清晰的梦——梦中你站在地面上，身后是燃烧的城市。但奇怪的是，所有人类都在跑，而你的族人正在废墟中寻宝。这是预兆吗？',
    },

    # ====== youth 青年阶段 ======
    'merchant_apprentice': {
        'title': '黑市学徒',
        'description': '一位哥布林老商人注意到了你的精明。"小子，想不想学点真本事？"他经营着地下城最大的黑市摊位，据说连人类商会都要给他面子。',
    },
    'village_race': {
        'title': '矿车大赛',
        'description': '哥布林聚落一年一度的矿车大赛！参赛者要骑着自己改装的矿车穿过一条充满陷阱和弯道的废弃矿道。第一名不仅有奖品，还能在部落里横着走一整年。',
    },
    'village_feud': {
        'title': '部落纷争',
        'description': '两个哥布林家族因为一块矿脉的归属争吵不休。按照传统，这种纠纷应该用赌博来解决——但这次双方都输不起。',
    },
    'explore_ruins': {
        'title': '废弃矿道探险',
        'description': '深层地下有一条被封死的古矿道，传说里面有整面墙的矿石结晶。有个胆大的哥布林砸开了封条——现在谁敢先进去？',
    },
    'help_farmer': {
        'title': '帮老哥布林搬家',
        'description': '部落里年纪最大的老哥布林被迫搬离了原来的巢穴。你帮他把那堆"宝贝"——其实全是破铜烂铁和旧零件——搬到了新地方。老头给了你一颗闪闪发光的石头作为谢礼。',
    },
    'part_time_work': {
        'title': '黑市打工',
        'description': '你在地下黑市找了份活：帮走私商人分拣货物。工钱不多，但你学到了辨别魔药和假币的本事。偶尔还能顺走一两件"没人认领的东西"。',
    },
    'young_rival': {
        'title': '部落里的对手',
        'description': '部落里出现了一个和你同龄的哥布林，什么都要跟你比——比谁攒的闪亮零件多、比谁跑得快、比谁敢偷更危险的东西。大家总是拿你们做比较。',
    },
    'guild_recruitment': {
        'title': '冒险者公会？',
        'description': '你在人类城镇的告示栏上看到了冒险者公会的招募告示："无论出身，只要有勇气。"你犹豫了——他们说的"无论出身"，真的包括哥布林吗？',
    },
    'underground_arena': {
        'title': '地下竞技场',
        'description': '哥布林聚落深处的秘密竞技场。规矩很简单：只要不出人命，什么手段都行。狡猾的哥布林选手经常用陷阱、烟雾弹和暗器赢得比赛。',
    },
    'street_performer': {
        'title': '地面世界的表演',
        'description': '你戴着兜帽混在人群中，看一个人类在广场上表演魔术。当他让一枚金币消失时，你差点叫出声——那手法也太粗糙了，任何一个哥布林小偷都做得比他好。',
    },
    'scholar_guidance': {
        'title': '地下学者',
        'description': '一个被人类社会驱逐的老学者躲进了哥布林聚落。他说愿意教会一个聪明的哥布林读书写字和炼金术，条件是帮他弄到研究材料。',
    },
    'part_time_job': {
        'title': '临时活计',
        'description': '有人需要一个"不引人注目的小家伙"去完成一项工作。报酬不错，但内容嘛……不能多问。这种活在哥布林圈子里不稀奇。',
    },
    'arena_champion_invite': {
        'title': '地下竞技场的邀请',
        'description': '你的实力被地下竞技场的主办人注意到了。他邀请你参加本年度的锦标赛——奖金丰厚，而且据说有人类赌场在幕后下注。',
    },

    # ====== adult 成人阶段 ======
    'old_friend_reunion': {
        'title': '老友重逢',
        'description': '在黑市的角落里，你遇到了小时候一起翻垃圾堆的老朋友。他已经是地下贸易圈里有头有脸的人物了。你们蹲在地上分了一壶劣质蘑菇酒，聊起当年的事。',
    },
    'buy_house': {
        'title': '占据好地盘',
        'description': '你攒够了资本，盯上了一处位置绝佳的地下洞穴——通风好、有干净水源、靠近黑市。但现在的住户不太想搬走。你打算怎么"请"他走？',
    },
    'neighbor_dispute': {
        'title': '领地纠纷',
        'description': '隔壁洞穴的哥布林占了你巢穴外面的通道做晾晒架。你的东西没地方放了。按规矩，这种事可以赌一把来解决。',
    },
    'community_leader': {
        'title': '部落推选',
        'description': '年长的哥布林们推选你来处理部落的公共事务——分配洞穴、调解纠纷、跟人类的代表谈判。责任不小，但油水也不少。',
    },
    'festival_dance': {
        'title': '废品狂欢夜',
        'description': '哥布林的庆典不叫丰收祭——叫"翻箱倒柜节"。大家把一年攒的最得意的宝贝拿出来炫耀，喝到烂醉，围着篝火跳那种看起来像抽搐的舞蹈。有个哥布林朝你伸出手，"来一起！"',
    },
    'family_blessing': {
        'title': '新的小哥布林',
        'description': '洞穴深处传来一声有力的啼哭——你的孩子出生了。哥布林的婴儿小到可以放在手掌里，但那双明亮的眼睛已经在四处张望了。你小心翼翼地把小家伙抱起来，心想：一定要让你过得比我好。',
    },
    'mny_trade_route': {
        'title': '地下贸易线',
        'description': '一支来自另一个哥布林聚落的走私队经过你的地盘。他们愿意跟你合作——你提供情报和仓储，他们负责运输。利润五五分。',
    },
    'mny_tax_crisis': {
        'title': '保护费涨价',
        'description': '人类城镇的卫兵队长突然提高了"容许金"——也就是允许哥布林在下水道居住的保护费。再交下去你的积蓄就要见底了。',
    },
    'investment_opportunity': {
        'title': '投资机会',
        'description': '一个哥布林向你推荐了一个"稳赚不赔"的买卖——在三个城市之间走私稀有矿石。他承诺三趟就能回本。但你知道，哥布林嘴里的"稳赚不赔"……',
    },
    'siege_defense': {
        'title': '保卫巢穴',
        'description': '人类冒险者发现了你们的地下据点！他们带着武器来"清剿"。所有哥布林都被召集起来——设陷阱、堵通道、准备战斗。这是保卫家园的时刻。',
    },
    'war_campaign': {
        'title': '战争来了',
        'description': '地面世界的战争波及到了地下。交战双方都想利用哥布林的地道网络。你的部落面临选择：站队、还是两边都不帮？',
    },
    'reincarnated_invention': {
        'title': '前世知识变现',
        'description': '你想起了前世的一个配方，用地下蘑菇和某种矿物粉末调制出了一种提神饮料。一夜之间，整个地下城的哥布林都在排队买——你给它取名叫"闪电汁"。',
    },
    'luk_lottery': {
        'title': '赌场豪赌',
        'description': '地下城最大的赌场年终大赌开始了。你揣着攒了半年的积蓄走了进去。哥布林天生好运——但赌场老板也是哥布林。',
    },
    'spr_curse_breaker': {
        'title': '诅咒解除',
        'description': '一个同族人爬到你面前，恳求你帮他解除身上的诅咒——他偷了人类法师的东西后就一直倒霉。你有办法吗？',
    },
    'chain_rise_to_power': {
        'title': '权力之路',
        'description': '你的名声在地下世界越来越响。有人开始议论——也许你该去争那个位子：哥布林聚落的大首领。但现任首领可不是好惹的。',
    },
    'adult_plague_crisis': {
        'title': '瘟疫来袭',
        'description': '一场可怕的瘟疫从地面传到了地下。哥布林拥挤的生活环境让疾病传播极快。部落里已经有人开始出现症状了……',
    },
    'quest_parting': {
        'title': '分别',
        'description': '那个人要去一个很远的地方。你站在地洞出口，手里攥着自己最珍贵的一颗闪亮宝石，想要递过去，却怎么也张不开嘴。',
    },
    'starlight_promise': {
        'title': '月光下的约定',
        'description': '你们坐在地洞出口的边缘，外面的月光照在你们身上。那个人把一块发光的矿石塞到你手里，轻声说："等我回来，我们就一起去建那个最大的贸易站。"',
    },
    'merchant_economic_crisis': {
        'title': '经济寒冬',
        'description': '地面的经济危机波及到了地下。人类扔掉的废品变少了——这就是哥布林的经济晴雨表。黑市交易量骤降，存货卖不出去。',
    },
    'hunting_trip': {
        'title': '狩猎远征',
        'description': '秋天到了，几个哥布林朋友邀你一起去地下深处的暗河猎洞鳄。哥布林式狩猎：三分靠勇气，七分靠诡计。',
    },
    'business_venture': {
        'title': '创业冒险',
        'description': '你发现了一个商机——人类丢弃的魔法道具碎片可以拆出还能用的魔力核心。如果收集够多，转卖给矮人炼金师能赚大钱。',
    },

    # ====== middle-age 中年阶段 ======
    'retirement': {
        'title': '放下匕首',
        'description': '你把那把跟了你半辈子的匕首插在火堆旁的石头上，决定不再冒险了。对哥布林来说，能活到这个年纪就已经是传奇。',
    },
    'mid_slowing_down': {
        'title': '迟缓的脚步',
        'description': '你发现自己不如从前灵活了。闪避变得吃力，偷东西也没以前利索了。上次差点被人类抓住——这在几年前是不可能的。',
    },
    'mid_legacy_review': {
        'title': '回首半生',
        'description': '对哥布林来说，你已经算是老家伙了。你坐在洞穴深处，回忆这些年偷过的东西、骗过的人、赚到的金币。值得。',
    },
    'protect_family': {
        'title': '巢穴入侵者',
        'description': '深夜，孩子们的哭声把你惊醒。你抓起匕首推开门——一只暗蛛正在你的巢穴门口吐丝。它的八只眼睛死死盯着里面的方向。',
    },
    'mid_property_acquisition': {
        'title': '扩大地盘',
        'description': '你积攒了足够的资源，是时候扩大自己的领地了——把隔壁那个废弃的洞穴打通，做成仓库。当然，得先"说服"那里的蜘蛛搬家。',
    },
    'mid_existential_crisis': {
        'title': '深夜的独白',
        'description': '哥布林的寿命太短了。你坐在黑暗中，数着自己掉落的又一颗牙齿。手指关节开始发疼，眼睛也不如从前锐利。再过几年你就会像那些老哥布林一样蜷缩在角落。这一切……值得吗？',
    },
    'mid_old_friend_reunion': {
        'title': '故友重逢',
        'description': '你在黑市偶遇了以前一起长大的哥布林。他瘦了很多，但笑容没变。你们蹲在角落里分了一瓶蘑菇酒，像小时候一样。',
    },
    'mid_found_school': {
        'title': '哥布林学堂',
        'description': '你决定教部落里的小哥布林读写和算数。你知道，懂人类的文字在交易中有多大的优势——你不希望下一代再吃你吃过的亏。',
    },
    'mid_natural_disaster': {
        'title': '地下洪水',
        'description': '地面上的连日暴雨让地下水位猛涨，你的巢穴和储物间全被淹了。哥布林们在齐腰深的水里拼命转移物资。',
    },
    'mid_health_scare': {
        'title': '身体警报',
        'description': '你突然剧烈咳血。对短命的哥布林来说，这意味着你的身体已经在衰退了。年轻的部落成员用异样的眼光看着你——在哥布林社会，病弱就意味着被淘汰。',
    },
    'mid_chronic_pain': {
        'title': '旧伤复发',
        'description': '年轻时偷东西被打断过的手指又开始疼了。那次被人类踢到的肋骨也在阴天隐隐作痛。哥布林的身体本来就不耐磨损——你还能撑几年？',
    },
    'widowed_wanderer': {
        'title': '失去之后的游荡',
        'description': '你已经不记得自己走了多久。从地洞到地洞，从黑市到黑市。喝掉了多少瓶蘑菇酒。世界对你来说只剩下灰色。',
    },
    'lover_death_battlefield': {
        'title': '噩耗',
        'description': '那群出去打探消息的哥布林回来了，但少了一个。一个浑身是血的同伴把一枚你再熟悉不过的小铜铃递到你手里。"对不起……" 你什么都听不见了。',
    },

    # ====== elder 老年阶段 ======
    'peaceful_end': {
        'title': '洞穴深处的夕阳',
        'description': '你裹着破布毯子缩在洞穴最深处。小哥布林们在你面前跑来跑去，叽叽喳喳地吵闹。一束光从远处的洞口渗进来。你还能看到这一切，就很好。',
    },
    'elder_natural_death': {
        'title': '安详的离去',
        'description': '你缩在自己的小窝里，身边堆满了一辈子攒下的"宝贝"。一块闪亮的矿石、一枚磨损的铜币、那只大老鼠的牙齿……你摸着这些东西，嘴角微微上翘，轻轻闭上了眼睛。',
    },
    'centenarian_celebration': {
        'title': '不老传说',
        'description': '你已经活得比大多数哥布林都长。整个部落都来庆祝——在短命的哥布林社会，你的年纪本身就是一个传奇。年轻的哥布林们争相听你讲故事，你觉得自己可以再活一百年。',
    },
    'elder_kingdom_crisis': {
        'title': '地面战争来了',
        'description': '地面的战争终于波及到了地下。无论年轻还是年老，每个哥布林都被召集起来——要么帮忙设陷阱，要么帮忙转移物资。你拖着老迈的身体站了起来。',
    },
    'elder_last_adventure': {
        'title': '老骨头的最后冒险',
        'description': '听说深处的废弃矿道又被发现了新洞穴。你的心跳加速了——哥布林的探索欲可不会因为掉了几颗牙就消失。你抓起锈迹斑斑的匕首，踉跄着走了出去。',
    },
    'elder_family_reunion': {
        'title': '满巢的热闹',
        'description': '你的后代们都回来了。洞穴里挤满了大大小小的哥布林，吵吵闹闹、推推搡搡。烤虫子的香味弥漫在空气中。这是你最满足的时刻。',
    },
    'elder_peaceful_days': {
        'title': '安静的日子',
        'description': '你搬到了一个很深很安静的小洞穴。每天数数自己的收藏品，给发光蘑菇浇水，听地下暗河的水声。对一个老哥布林来说，这就是幸福。',
    },
    'legend_spread': {
        'title': '传说的传播',
        'description': '年轻的哥布林开始传颂你的故事——那个从垃圾堆里爬出来，最终成为大首领/大商人/传奇盗贼的哥布林。你的名字成了部落的骄傲。',
    },
    'elder_star_gazing_final': {
        'title': '最后的星空',
        'description': '你踉跄着爬出了地洞——也许是最后一次了。夜空很美，跟你第一次看到它的时候一样。你还记得那个夜晚——一个从没见过星星的哥布林小孩，惊得长大了嘴巴。',
    },
    'elder_garden_peace': {
        'title': '蘑菇花园',
        'description': '你在洞穴的一角培育了一片发光蘑菇。每天浇水、通风、看它们忽明忽暗。对一个走过了这么多路的老哥布林来说，这种安宁比金子还珍贵。',
    },
    'elder_last_feast': {
        'title': '最后的盛宴',
        'description': '老朋友们从各个聚落赶来——那些还活着的老哥布林。你们围坐在篝火旁，喝着按年份酿制的蘑菇酒，聊着那些年轻时的疯狂事迹。',
    },
    'elder_last_journey': {
        'title': '最后的旅途',
        'description': '你决定在腿脚还能走的时候，去看看那个传说中最深最远的地下洞穴——据说那里有一面完全由水晶组成的墙壁，在黑暗中散发着幽蓝的光。',
    },
}

# ===============================================================
# 第三部分：执行补丁
# ===============================================================
def load_events(filename):
    filepath = os.path.join(EVENT_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_events(filename, events):
    filepath = os.path.join(EVENT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
        f.write('\n')

def main():
    PLAYABLE_NON_GOBLIN = ['human', 'elf']  # 当前可玩的非哥布林种族
    
    stats = {
        'excluded': 0,
        'variant_added': 0,
        'already_has_variant': 0,
        'event_not_found': [],
    }
    
    # 遍历所有事件文件
    for filename in sorted(os.listdir(EVENT_DIR)):
        if not filename.endswith('.json'):
            continue
        
        events = load_events(filename)
        modified = False
        
        for event in events:
            eid = event['id']
            
            # 处理排除
            if eid in EXCLUDE_GOBLIN:
                current_races = event.get('races', [])
                if not current_races:
                    # 通用事件 → 添加races白名单排除哥布林
                    event['races'] = PLAYABLE_NON_GOBLIN[:]
                    stats['excluded'] += 1
                    modified = True
                    print(f"  [排除] {filename:<18} {eid:<40} {EXCLUDE_GOBLIN[eid]}")
                elif 'goblin' in current_races:
                    # 已有races且含goblin → 移除goblin
                    event['races'] = [r for r in current_races if r != 'goblin']
                    stats['excluded'] += 1
                    modified = True
                    print(f"  [排除] {filename:<18} {eid:<40} (从races中移除goblin)")
                else:
                    pass  # 已经不含goblin，无需操作
            
            # 处理变体添加
            if eid in GOBLIN_VARIANTS:
                if 'raceVariants' not in event:
                    event['raceVariants'] = {}
                if 'goblin' not in event.get('raceVariants', {}):
                    event['raceVariants']['goblin'] = GOBLIN_VARIANTS[eid]
                    stats['variant_added'] += 1
                    modified = True
                    print(f"  [变体] {filename:<18} {eid:<40} +goblin: {GOBLIN_VARIANTS[eid]['title']}")
                else:
                    stats['already_has_variant'] += 1
        
        if modified:
            save_events(filename, events)
    
    # 检查是否有未找到的事件
    all_event_ids = set()
    for filename in sorted(os.listdir(EVENT_DIR)):
        if not filename.endswith('.json'):
            continue
        events = load_events(filename)
        for e in events:
            all_event_ids.add(e['id'])
    
    for eid in EXCLUDE_GOBLIN:
        if eid not in all_event_ids:
            stats['event_not_found'].append(('exclude', eid))
    for eid in GOBLIN_VARIANTS:
        if eid not in all_event_ids:
            stats['event_not_found'].append(('variant', eid))
    
    print(f"\n=== 补丁完成 ===")
    print(f"  排除哥布林: {stats['excluded']} 个事件")
    print(f"  添加哥布林变体: {stats['variant_added']} 个事件")
    print(f"  已有变体(跳过): {stats['already_has_variant']} 个")
    if stats['event_not_found']:
        print(f"\n  ⚠ 未找到的事件:")
        for typ, eid in stats['event_not_found']:
            print(f"    [{typ}] {eid}")

if __name__ == '__main__':
    main()
