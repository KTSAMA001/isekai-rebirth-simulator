# 成就系统更新计划

_2026-04-12 · 基于当前 127 成就 + ACHIEVEMENT-PLAN-v3 事件链设计_

---

## 1. 阈值调整（7 个现有成就）

| ID | 成就名 | 旧条件 | 新条件 | 理由 |
|----|--------|--------|--------|------|
| `lucky_star` | 天选之人 | `attribute.peak.luk >= 30` | `attribute.peak.luk >= 20` | luk 事件仅 19 个，峰值 30 几乎不可达；新增 luk 事件链后仍需降低门槛保证可获取 |
| `wealth_peak` | 富可敌国 | `attribute.peak.mny >= 30` | `attribute.peak.mny >= 25` | mny 事件 86 个中等，但峰值 30 对非哥布林种族偏难；调至 25 更合理 |
| `goblin_tycoon` | 利润至上 | `attribute.peak.mny >= 35` | `attribute.peak.mny >= 30` | 哥布林种族专属但 mny 路线事件有限，35 太高；30 与通用 mny 成就拉开差距即可 |
| `elf_magic_pinnacle` | 魔法的极致 | `attribute.peak.mag >= 45 & attribute.peak.spr >= 35` | `attribute.peak.mag >= 40 & attribute.peak.spr >= 30` | 双属性门槛过高，精灵虽天生 mag 优势但 spr 35 极难；各降 5 点 |
| `centenarian` | 传奇人生 | 7 属性均 >= 20 | 7 属性均 >= 15 | 全属性 20 在当前事件密度下几乎不可能同时达成；15 仍是高难度综合成就 |
| `master_of_all` | 六边形战士 | 7 属性均 >= 20 | `attribute.peak.str >= 25 & attribute.peak.int >= 25 & attribute.peak.chr >= 25 & attribute.peak.mag >= 25 & attribute.peak.spr >= 25 & attribute.peak.luk >= 15 & attribute.peak.mny >= 15` | 原条件与 centenarian 完全重复；改为侧重 str/int/chr/mag/spr 的高门槛 + luk/mny 宽松，体现"六边形"而非"全满" |
| `completionist` | 全成就 | `achievement.count >= 115` | `achievement.count >= 159` | 当前 127 + 新增 33 = 160，completionist 需解锁除自身外全部 159 个 |

---

## 2. 新增属性路线成就（19 个）

### 🍀 运势路线（3 个）

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `luk_charmed_life` | 福星高照 | 运势峰值达到 20 | 🍀 | false | `attribute.peak.luk >= 20` | 属性 |
| `luk_destiny_child` | 天命之子 | 运势峰值达到 30，且经历过命运的干预 | 🌟 | true | `attribute.peak.luk >= 30 & has.flag.fate_touched` | 属性 |
| `luk_luckiest_alive` | 世间最幸运之人 | 运势峰值达到 40 | ☘️ | true | `attribute.peak.luk >= 40` | 属性 |

### 🔨 体魄路线（3 个）

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `str_iron_body` | 钢筋铁骨 | 体魄峰值达到 25 | 💪 | false | `attribute.peak.str >= 25` | 属性 |
| `str_warrior_peak` | 战神之躯 | 体魄峰值达到 35，且拥有竞技场冠军头衔 | ⚔️ | true | `attribute.peak.str >= 35 & has.flag.arena_champion` | 属性 |
| `str_body_of_legend` | 传说中的体魄 | 体魄峰值达到 50 | 🏔️ | true | `attribute.peak.str >= 50` | 属性 |

### 📖 智慧路线（3 个）

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `int_learned_scholar` | 博学多识 | 智慧峰值达到 25 | 📚 | false | `attribute.peak.int >= 25` | 属性 |
| `int_sage_wisdom` | 贤者之智 | 智慧峰值达到 35，且完成重大发现或著作 | 🧠 | true | `attribute.peak.int >= 35 & (has.flag.great_discovery \| has.flag.masterpiece_author)` | 属性 |
| `int_omniscient` | 全知全能 | 智慧峰值达到 50 | 👁️‍🗨️ | true | `attribute.peak.int >= 50` | 属性 |

### 💋 魅力路线（3 个）

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `chr_social_star` | 万人迷 | 魅力峰值达到 25 | 💕 | false | `attribute.peak.chr >= 25` | 属性 |
| `chr_charm_legend` | 倾国倾城 | 魅力峰值达到 35，且经历过三角关系 | 💋 | true | `attribute.peak.chr >= 35 & has.flag.love_triangle` | 属性 |
| `chr_irresistible` | 不可抗拒 | 魅力峰值达到 50 | 💎 | true | `attribute.peak.chr >= 50` | 属性 |

### ✨ 魔力路线（3 个）

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `mag_arcane_adept` | 魔导精通 | 魔力峰值达到 25 | ✨ | false | `attribute.peak.mag >= 25` | 属性 |
| `mag_arcane_master` | 魔导大师 | 魔力峰值达到 35，且完成仪式精通或血魔法 | 🔮 | true | `attribute.peak.mag >= 35 & (has.flag.ritual_master \| has.flag.blood_mage)` | 属性 |
| `mag_reality_warper` | 扭曲现实者 | 魔力峰值达到 50 | 🌀 | true | `attribute.peak.mag >= 50` | 属性 |

### 🌙 灵魂路线（2 个）

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `spr_enlightened_soul` | 觉悟之魂 | 灵魂峰值达到 25，且冥想修行 | 🧘 | false | `attribute.peak.spr >= 25 & has.flag.meditator` | 属性 |
| `spr_one_with_all` | 万物归一 | 灵魂峰值达到 45，且达到开悟境界 | 🕊️ | true | `attribute.peak.spr >= 45 & has.flag.enlightened_being` | 属性 |

### 💰 家境路线（2 个）

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `mny_comfortable_life` | 富足人生 | 家境峰值达到 20 | 🏦 | false | `attribute.peak.mny >= 20` | 属性 |
| `mny_empire_builder` | 帝国缔造者 | 家境峰值达到 40，且建立商业帝国 | 🏰💰 | true | `attribute.peak.mny >= 40 & has.flag.empire_built` | 属性 |

---

## 3. 孤儿 flag 补全成就（12 个）

从 v3 新增事件链的 flag 中挑选有叙事意义的 flag，创建"孤儿成就"（非种族/性别限定、非属性阈值的叙事成就）：

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `ach_tough_kid` | 打不死的小强 | 童年就展现惊人的体魄 | 👶💪 | true | `has.flag.tough_kid` | 事件 |
| `ach_bookworm` | 书虫人生 | 从小沉迷阅读，走上学者的道路 | 📖🐛 | true | `has.flag.bookworm & has.flag.self_taught` | 事件 |
| `ach_street_fighter` | 街头霸王 | 在街头打架中磨练出钢铁意志 | 🥊 | true | `has.flag.street_fighter & has.flag.arena_fighter` | 事件 |
| `ach_lucky_charm` | 天生幸运 | 童年就找到四叶草，一生被幸运眷顾 | 🍀 | true | `has.flag.lucky_charm & has.flag.fate_touched` | 事件 |
| `ach_young_merchant` | 商业奇才 | 从卖柠檬水开始，一步步建立商业帝国 | 🍋 | true | `has.flag.young_merchant & has.flag.empire_built` | 事件 |
| `ach_wild_magic` | 野路子法师 | 从未进过学院，却掌握了强大的魔法 | 🔥 | true | `has.flag.wild_magic & has.flag.street_mage & !has.flag.magic_academy` | 事件 |
| `ach_spirit_sight` | 通灵者 | 童年就能看见常人看不见的东西 | 👁️ | true | `has.flag.spirit_sight & has.flag.shaman_trained` | 事件 |
| `ach_serial_romance` | 风流浪子 | 经历过多段感情，最终付出代价 | 🌹 | true | `has.flag.serial_romance` | 事件 |
| `ach_forbidden_knowledge_seeker` | 禁书猎人 | 少年时期就闯入禁书区 | 📕 | true | `has.flag.forbidden_section` | 事件 |
| `ach_gambling_legend` | 赌场神话 | 在赌场中建立起传奇名声 | 🎰 | true | `has.flag.gambling_legend` | 事件 |
| `ach_body_tempered` | 炼体大成 | 通过炼体突破肉体极限 | 🔥💪 | true | `has.flag.body_tempered` | 事件 |
| `ach_mana_overflow` | 魔力暴走 | 经历过魔力失控的恐怖 | ⚡💥 | true | `has.flag.mana_overflow & has.flag.ritual_master` | 事件 |

---

## 4. 路线补充（2 个）

### 治愈者之路

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `healer_path` | 治愈者之路 | 拥有治愈之力，拯救了被腐化的森林或他人 | 🌿 | false | `has.flag.forest_healer \| (has.flag.healer & has.flag.miracle_survival)` | 路线 |

### 探索者之路

| ID | name | description | icon | hidden | condition | category |
|----|------|-------------|------|--------|-----------|----------|
| `explorer_path` | 探索者之路 | 深入地下城、开辟商路、开拓新领地 | 🧭 | false | `has.flag.dungeon_veteran & (has.flag.trade_route \| has.flag.pioneer)` | 路线 |

---

## 5. Completionist 计数

| 项目 | 数量 |
|------|------|
| 当前成就总数 | 127 |
| 阈值调整（已有） | 7（不增加数量） |
| 新增属性路线成就 | 19 |
| 新增孤儿 flag 成就 | 12 |
| 新增路线成就 | 2 |
| **新增合计** | **33** |
| **调整后总数** | **160** |
| completionist 条件 | `achievement.count >= 159` |

> 即：解锁全部 159 个非 completionist 成就后，自动解锁 completionist。

---

_计划完成，待确认后实施_
