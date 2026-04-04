/**
 * 批量为必选事件添加有意义的分支
 * 每个事件至少 2 个分支，提供真实选择
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(import.meta.dirname, '..', 'data', 'sword-and-magic', 'events')

// 分支补丁定义：eventId → branches
const patches = {
  // === childhood.json ===
  church_orphan: {
    branches: [
      {
        id: "stay_church",
        title: "留在教会",
        description: "教会的温暖让你安心，你决定留下来帮忙。",
        effects: [
          { type: "modify_attribute", attribute: "spr", value: 2 },
          { type: "modify_attribute", attribute: "chr", value: 1 },
          { type: "grant_item", item: "holy_pendant", value: 1 }
        ]
      },
      {
        id: "leave_church",
        title: "溜出去玩",
        description: "外面的世界更吸引你，你偷偷溜出了教会的大门。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 1 },
          { type: "modify_attribute", attribute: "luk", value: 1 },
          { type: "modify_attribute", attribute: "spr", value: -1 }
        ]
      }
    ]
  },
  fairy_encounter: {
    branches: [
      {
        id: "talk_fairy",
        title: "和精灵说话",
        description: "你鼓起勇气和那个发光的小东西搭话。",
        effects: [
          { type: "modify_attribute", attribute: "mag", value: 2 },
          { type: "modify_attribute", attribute: "spr", value: 1 },
          { type: "set_flag", flag: "fairy_friend", value: 1 }
        ]
      },
      {
        id: "catch_fairy",
        title: "试着抓住它",
        description: "瓶子！你需要一个瓶子！",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 1 },
          { type: "modify_attribute", attribute: "luk", value: 1 },
          { type: "modify_attribute", attribute: "mag", value: -1 }
        ]
      }
    ]
  },
  childhood_play: {
    branches: [
      {
        id: "play_lead",
        title: "当孩子王",
        description: "你站在泥堆最高处，指挥大家冲锋。",
        effects: [
          { type: "modify_attribute", attribute: "chr", value: 2 },
          { type: "modify_attribute", attribute: "str", value: 1 }
        ]
      },
      {
        id: "play_smart",
        title: "挖陷阱偷袭",
        description: "直接冲太蠢了，你在后面挖了个大坑。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 2 },
          { type: "modify_attribute", attribute: "luk", value: 1 }
        ]
      }
    ]
  },
  first_snow: {
    branches: [
      {
        id: "snow_play",
        title: "堆雪人",
        description: "你堆了一个歪歪扭扭但很有个性的雪人。",
        effects: [
          { type: "modify_attribute", attribute: "spr", value: 2 },
          { type: "modify_attribute", attribute: "chr", value: 1 }
        ]
      },
      {
        id: "snow_fight",
        title: "打雪仗",
        description: "雪球战争爆发了，你挨了三发但也命中了五发。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 2 },
          { type: "modify_attribute", attribute: "int", value: 1 }
        ]
      }
    ]
  },
  tree_climbing: {
    branches: [
      {
        id: "climb_top",
        title: "爬到最高处",
        description: "其他孩子都不敢了，但你决定继续往上爬。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 2 },
          { type: "modify_attribute", attribute: "spr", value: 1 }
        ],
        diceCheck: { attribute: "str", dc: 13, description: "体魄判定 DC13 — 你的手臂够不够有力？" },
        failureEffects: [
          { type: "modify_hp", value: -15 },
          { type: "modify_attribute", attribute: "str", value: 1 }
        ],
        successText: "你成功爬到了树顶！远方的山脉和河流尽收眼底。",
        failureText: "一根树枝断了，你摔了下来。疼得哇哇大哭，但还想再试一次。"
      },
      {
        id: "climb_safe",
        title: "稳妥地看风景",
        description: "爬到一半就停下来，在树杈上坐着看远方。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 1 },
          { type: "modify_attribute", attribute: "spr", value: 1 },
          { type: "modify_attribute", attribute: "str", value: 1 }
        ]
      }
    ]
  },
  child_plague: {
    branches: [
      {
        id: "plague_rest",
        title: "乖乖休息",
        description: "你躺在床上，任由苦涩的药汁灌进喉咙。",
        effects: [
          { type: "modify_hp", value: -30 },
          { type: "modify_attribute", attribute: "spr", value: 1 }
        ]
      },
      {
        id: "plague_resist",
        title: "偷偷去外面晒太阳",
        description: "你受不了房间里的药味，趁大人不注意溜了出去。",
        effects: [
          { type: "modify_hp", value: -45 },
          { type: "modify_attribute", attribute: "str", value: 1 },
          { type: "modify_attribute", attribute: "luk", value: 1 }
        ],
        diceCheck: { attribute: "str", dc: 13, description: "体魄判定 DC13 — 你的身体扛得住吗？" },
        failureEffects: [
          { type: "modify_hp", value: -55 },
          { type: "modify_attribute", attribute: "str", value: -2 }
        ],
        successText: "阳光好像真的有用，你第二天就退烧了。",
        failureText: "你的病情加重了，差点没挺过来。"
      }
    ]
  },
  child_drowning: {
    branches: [
      {
        id: "drowning_struggle",
        title: "拼命挣扎",
        description: "你疯狂扑腾，什么姿势都试了一遍。",
        effects: [
          { type: "modify_hp", value: -30 },
          { type: "modify_attribute", attribute: "str", value: 2 }
        ],
        diceCheck: { attribute: "str", dc: 13, description: "体魄判定 DC13 — 你能自己游上岸吗？" },
        failureEffects: [
          { type: "modify_hp", value: -45 },
          { type: "modify_attribute", attribute: "str", value: -1 }
        ],
        successText: "你居然真的自己爬上了岸，还顺便学会了狗刨。",
        failureText: "你呛了好多水，幸好有人路过把你拉了上来。"
      },
      {
        id: "drowning_calm",
        title: "冷静地仰面漂浮",
        description: "你记起有人说过，不要挣扎，先让自己浮起来。",
        effects: [
          { type: "modify_hp", value: -20 },
          { type: "modify_attribute", attribute: "int", value: 2 },
          { type: "modify_attribute", attribute: "spr", value: 1 }
        ]
      }
    ]
  },

  // === teenager.json ===
  hero_journey_start: {
    branches: [
      {
        id: "accept_journey",
        title: "踏上旅途",
        description: "背起行囊，头也不回地走出了村庄。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 1 },
          { type: "modify_attribute", attribute: "spr", value: 1 },
          { type: "modify_attribute", attribute: "int", value: 1 },
          { type: "set_flag", flag: "on_journey", value: 1 }
        ]
      },
      {
        id: "refuse_journey",
        title: "再想想",
        description: "世界很大，但你还没准备好。也许先攒点东西再说。",
        effects: [
          { type: "modify_attribute", attribute: "mny", value: 2 },
          { type: "modify_attribute", attribute: "int", value: 1 }
        ]
      }
    ]
  },
  tavern_brawl: {
    branches: [
      {
        id: "brawl_fight",
        title: "加入混战",
        description: "你一拳揍翻了旁边那个嘲笑你的醉汉。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 2 },
          { type: "modify_hp", value: -15 },
          { type: "set_flag", flag: "tavern_fighter", value: 1 }
        ]
      },
      {
        id: "brawl_dodge",
        title: "躲到吧台后面",
        description: "你灵活地钻到吧台后面，顺手拿了瓶酒。",
        effects: [
          { type: "modify_attribute", attribute: "luk", value: 1 },
          { type: "modify_attribute", attribute: "int", value: 1 },
          { type: "modify_attribute", attribute: "mny", value: 1 }
        ]
      }
    ]
  },
  fairy_friend_return: {
    branches: [
      {
        id: "fairy_gift_magic",
        title: "请求魔法祝福",
        description: "你请求精灵教你一些魔法。",
        effects: [
          { type: "modify_attribute", attribute: "mag", value: 3 },
          { type: "modify_attribute", attribute: "spr", value: 1 },
          { type: "modify_hp", value: 5 }
        ]
      },
      {
        id: "fairy_gift_luck",
        title: "请求好运祝福",
        description: "比起魔法，运气更重要不是吗？",
        effects: [
          { type: "modify_attribute", attribute: "luk", value: 3 },
          { type: "modify_attribute", attribute: "chr", value: 1 },
          { type: "modify_hp", value: 5 }
        ]
      }
    ]
  },
  meteor_shower: {
    branches: [
      {
        id: "meteor_wish",
        title: "许个愿",
        description: "你闭上眼睛，在心里默默许了个愿望。",
        effects: [
          { type: "modify_attribute", attribute: "luk", value: 2 },
          { type: "modify_attribute", attribute: "spr", value: 1 }
        ]
      },
      {
        id: "meteor_study",
        title: "记录星轨",
        description: "你掏出纸笔，尝试记录流星的轨迹和频率。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 2 },
          { type: "modify_attribute", attribute: "mag", value: 1 }
        ]
      }
    ]
  },

  // === youth.json ===
  bullied_fight_back: {
    branches: [
      {
        id: "fight_punch",
        title: "直接动手",
        description: "你一拳砸在带头的那个人鼻子上。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 2 },
          { type: "modify_attribute", attribute: "chr", value: 1 },
          { type: "set_flag", flag: "fighter_spirit", value: 1 }
        ],
        diceCheck: { attribute: "str", dc: 14, description: "体魄判定 DC14 — 你打得过他吗？" },
        failureEffects: [
          { type: "modify_hp", value: -15 },
          { type: "modify_attribute", attribute: "spr", value: 1 }
        ],
        successText: "一拳下去，对方鼻血直流。从此没人敢再欺负你。",
        failureText: "你被反揍了一顿，但没有人嘲笑你——因为你敢站出来。"
      },
      {
        id: "fight_smart",
        title: "找老师告状",
        description: "暴力不能解决问题，但权威可以。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 2 },
          { type: "modify_attribute", attribute: "chr", value: 1 }
        ]
      }
    ]
  },
  dragon_awakening: {
    branches: [
      {
        id: "dragon_embrace",
        title: "拥抱这股力量",
        description: "滚烫的力量在血管里奔涌，你张开双臂迎接它。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 3 },
          { type: "modify_attribute", attribute: "mag", value: 2 },
          { type: "modify_max_hp_bonus", value: 50 }
        ]
      },
      {
        id: "dragon_suppress",
        title: "压抑龙血",
        description: "这力量太危险了，你咬紧牙关将它封印回去。",
        effects: [
          { type: "modify_attribute", attribute: "spr", value: 3 },
          { type: "modify_attribute", attribute: "int", value: 2 },
          { type: "modify_max_hp_bonus", value: 20 }
        ]
      }
    ]
  },
  reincarnated_memory: {
    branches: [
      {
        id: "memory_accept",
        title: "接受前世记忆",
        description: "另一个世界的知识如潮水般涌入脑海。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 3 },
          { type: "set_flag", flag: "reincarnated", value: 1 },
          { type: "grant_item", item: "otherworld_knowledge", value: 1 }
        ]
      },
      {
        id: "memory_reject",
        title: "拒绝前世记忆",
        description: "你不是那个人，你是你自己。你用力把那些画面推出脑海。",
        effects: [
          { type: "modify_attribute", attribute: "spr", value: 3 },
          { type: "modify_attribute", attribute: "str", value: 1 }
        ]
      }
    ]
  },
  help_farmer: {
    branches: [
      {
        id: "help_work",
        title: "帮忙割麦",
        description: "你撸起袖子下了田。太阳很毒，但汗水的滋味还不错。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 2 },
          { type: "modify_attribute", attribute: "mny", value: 1 }
        ]
      },
      {
        id: "help_organize",
        title: "帮忙协调人手",
        description: "你发现组织效率比蛮干更重要。",
        effects: [
          { type: "modify_attribute", attribute: "chr", value: 1 },
          { type: "modify_attribute", attribute: "int", value: 1 },
          { type: "modify_attribute", attribute: "mny", value: 1 }
        ]
      }
    ]
  },
  star_gazing: {
    branches: [
      {
        id: "gaze_meditate",
        title: "冥想",
        description: "在繁星下闭上眼睛，感受宇宙的脉动。",
        effects: [
          { type: "modify_attribute", attribute: "spr", value: 2 },
          { type: "modify_attribute", attribute: "mag", value: 1 }
        ]
      },
      {
        id: "gaze_navigate",
        title: "研究星座导航",
        description: "你尝试用星星来判断方向和季节。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 2 },
          { type: "modify_attribute", attribute: "luk", value: 1 }
        ]
      }
    ]
  },
  part_time_work: {
    branches: [
      {
        id: "work_labor",
        title: "去码头扛货",
        description: "活很累，但报酬不错。",
        effects: [
          { type: "modify_attribute", attribute: "str", value: 2 },
          { type: "modify_attribute", attribute: "mny", value: 2 }
        ]
      },
      {
        id: "work_clerk",
        title: "在商店当学徒",
        description: "虽然挣得少，但学到的东西更多。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 1 },
          { type: "modify_attribute", attribute: "chr", value: 1 },
          { type: "modify_attribute", attribute: "mny", value: 1 }
        ]
      }
    ]
  },

  // === adult.json ===
  student_successor: {
    branches: [
      {
        id: "teach_strict",
        title: "严格教导",
        description: "你采用铁血教学，绝不放过任何细节。",
        effects: [
          { type: "modify_attribute", attribute: "int", value: 2 },
          { type: "set_flag", flag: "has_successor", value: 1 }
        ]
      },
      {
        id: "teach_free",
        title: "放任自由",
        description: "你让学生自己摸索，必要时才指点一二。",
        effects: [
          { type: "modify_attribute", attribute: "chr", value: 2 },
          { type: "modify_attribute", attribute: "spr", value: 1 },
          { type: "set_flag", flag: "has_successor", value: 1 }
        ]
      }
    ]
  },
  lost_in_dungeon: {
    branches: [
      {
        id: "dungeon_forward",
        title: "继续深入",
        description: "已经迷路了，不如继续探索，也许能找到另一个出口。",
        effects: [
          { type: "modify_hp", value: -25 },
          { type: "modify_attribute", attribute: "str", value: 1 },
          { type: "modify_attribute", attribute: "luk", value: 1 }
        ],
        diceCheck: { attribute: "luk", dc: 15, description: "运势判定 DC15 — 你能找到出路吗？" },
        failureEffects: [
          { type: "modify_hp", value: -40 },
          { type: "modify_attribute", attribute: "str", value: -1 }
        ],
        successText: "你在迷宫深处发现了一个隐藏的宝箱和通往地面的阶梯。",
        failureText: "你在黑暗中转了很久，伤痕累累地从入口爬了出来。"
      },
      {
        id: "dungeon_retreat",
        title: "原路返回",
        description: "标记墙壁，慢慢摸回去。生命比宝物重要。",
        effects: [
          { type: "modify_hp", value: -10 },
          { type: "modify_attribute", attribute: "int", value: 1 }
        ]
      }
    ]
  },
  family_dinner: {
    branches: [
      {
        id: "dinner_cook",
        title: "亲自下厨",
        description: "你决定给家人做一桌好菜。虽然……手艺有待提高。",
        effects: [
          { type: "modify_attribute", attribute: "chr", value: 2 },
          { type: "modify_attribute", attribute: "spr", value: 1 }
        ]
      },
      {
        id: "dinner_story",
        title: "讲述冒险故事",
        description: "孩子们围在你身边，眼睛里全是星星。",
        effects: [
          { type: "modify_attribute", attribute: "spr", value: 2 },
          { type: "modify_attribute", attribute: "int", value: 1 }
        ]
      }
    ]
  }
}

// 执行补丁
const files = ['birth.json', 'childhood.json', 'teenager.json', 'youth.json', 'adult.json', 'middle-age.json', 'elder.json']

let totalPatched = 0

for (const file of files) {
  const filePath = join(DATA_DIR, file)
  const content = readFileSync(filePath, 'utf-8')
  const events = JSON.parse(content)
  let filePatched = 0

  for (const event of events) {
    const patch = patches[event.id]
    if (patch) {
      event.branches = patch.branches
      // 清理旧的顶级 effects（分支已包含效果）
      if (event.effects) {
        event.effects = []
      }
      filePatched++
      totalPatched++
    }
  }

  if (filePatched > 0) {
    writeFileSync(filePath, JSON.stringify(events, null, 2) + '\n', 'utf-8')
    console.log(`${file}: 补丁了 ${filePatched} 个必选事件`)
  }
}

console.log(`\n总计补丁: ${totalPatched} 个事件`)
console.log(`\n保留为叙事事件(不加分支):`)
const narrativeEvents = ['birth_noble', 'birth_common', 'birth_slums', 'peaceful_end', 'elder_natural_death', 'world_breaking_start', 'magic_graduate', 'royal_summon']
for (const eid of narrativeEvents) {
  console.log(`  - ${eid}`)
}
