# 物品系统设计（参考杀戮尖塔遗物设计）

## 设计哲学

参考杀戮尖塔遗物系统的核心原则：

1. **被动效果，无需操作** — 物品提供永久被动修改，不增加操作负担
2. **改变规则而非纯数值** — 最好的物品改变游戏规则（如 STS 的"异化"、"诅咒钥匙"）
3. **高风险高回报** — 获取物品往往伴随代价（放弃安全选项）
4. **联动与协同** — 物品之间有化学反应，创造独特的"构建"
5. **稀有度分层** — 普通/稀有/传说，稀有度越高效果越独特

## 杀戮尖塔经典遗物参考

| 遗物 | 效果 | 设计类型 |
|------|------|----------|
| 燃烧之血 | 战斗结束时恢复6HP | 数值补益 |
| 蛇眼戒指 | 每场战斗开始获得1力量 | 局内成长 |
| 破碎的王冠 | 每场战斗获得额外能量 | 改变资源 |
| 知识之杯 | 每次升级多获得一张牌 | 改变成长 |
| 冰霜之握 | 冰冻敌人在2回合以上 | 改变机制 |
| 橡木桶 | 受到未格挡伤害时获得1格挡 | 触发型 |
| 银色怀表 | 跳过的每张牌给予1格挡 | 改变规则 |
| 转生之瓶 | 每回合第一张牌消耗为0 | 改变经济 |
| 古老饰品 | 每场战斗获得额外金币 | 数值补益 |
| 异化 | 中毒敌人无法治疗 | 改变规则 |

**关键洞察**：最好的遗物不是"给你+1力量"，而是"让你可以用完全不同的方式玩游戏"。

## 系统架构

### 1. 物品定义

```typescript
interface WorldItemDef {
  id: string
  name: string
  description: string
  icon: string          // emoji
  rarity: 'common' | 'rare' | 'legendary'
  category: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'special'

  // 效果定义（被动触发）
  effects: ItemEffect[]

  // 获取条件（事件分支通过 itemId 引用）
}

interface ItemEffect {
  // 触发时机
  trigger: 
    | 'on_year_start'      // 每年开始
    | 'on_year_end'        // 每年结束
    | 'on_combat'          // 战斗事件中
    | 'on_skill_check'     // 判定时
    | 'on_hp_change'       // HP变化时
    | 'on_attribute_gain'  // 属性增长时
  
  // 效果类型
  type:
    | 'modify_hp_regen'    // 修改每年HP恢复（如 +1/年）
    | 'modify_attribute_gain' // 修改属性增长倍率（如 体魄增长×1.5）
    | 'modify_skill_check'    // 修改判定难度（如 所有判定-2）
    | 'flat_bonus'        // 固定加成（如 每年+1金币/值+2HP）
    | 'conditional_hp'    // 条件HP（如 HP<30时恢复5）
    | 'attribute_floor'   // 属性保底（如 体魄不低于5）
    | 'event_modifier'    // 修改事件权重（如 战斗事件权重×2）
    | 'unlock_event'      // 解锁隐藏事件
    | 'death_save'        // 免死一次（HP归零时恢复到1）
    | 'scaler'            // 随数值缩放（如 战斗伤害×(1+str/50)）
  
  // 参数
  target?: string       // 作用的属性/事件ID
  value?: number        // 数值
  condition?: string    // 触发条件（DSL）
  maxStacks?: number    // 最大叠加次数（默认1）
}
```

### 2. 物品库存

```typescript
// GameState 新增
interface GameState {
  // ...
  inventory: InventoryState
}

interface InventoryState {
  items: { itemId: string; stacks: number }[]  // 持有物品
  maxSlots: number                              // 最大格子数（默认3）
}
```

### 3. 物品获取方式

- **事件奖励**：分支选择中通过 `grant_item` 效果获得
- **事件代价**：放弃安全选项（HP/属性）换取物品
- **升级进化**：已有物品 + 特定条件 → 进化为更强版本

### 4. 物品在 UI 中的展示

物品栏固定在属性面板下方，每个物品显示图标+名称+效果摘要。
稀有度颜色：🟢普通 / 🔵稀有 / 🟡传说

---

## 物品设计清单

### 🟢 普通物品（常见，效果直接）

| ID | 名称 | 图标 | 触发 | 效果 | 来源事件 |
|----|------|------|------|------|----------|
| herbal_pouch | 草药袋 | 🌿 | on_year_end | HP恢复+1/年 | 帮农夫收麦/草药知识 |
| lucky_charm | 幸运符 | 🍀 | on_skill_check | 判定成功率+5% | 老兵的故事/流浪狗 |
| old_map | 古旧地图 | 🗺️ | on_year_start | 探索事件权重×1.3 | 废墟探险/藏宝图碎片 |
| traveler_cloak | 旅人斗篷 | 🧥 | on_year_end | HP恢复+0.5/年（小数累积） | 旅行商人/远行 |
| training_dummy | 练功桩 | 🥊 | on_attribute_gain | 体魄成长+1（仅限体魄） | 侍从修炼/秘密特训 |
| crystal_shard | 魔力碎片 | 💎 | on_year_start | 魔力+0.5/年（被动成长） | 魔法学院/魔法暴走 |

### 🔵 稀有物品（需要付出代价或运气）

| ID | 名称 | 图标 | 触发 | 效果 | 来源事件 |
|----|------|------|------|------|----------|
| dragon_scale | 龙鳞护符 | 🐲 | on_hp_change | 受到HP损失-20% | 讨伐巨龙(惨胜) |
| fairy_dust | 精灵之尘 | ✨ | on_year_start | 魅力判定难度-3 | 精灵归访 |
| cursed_blade | 诅咒之刃 | 🗡️ | on_combat | 战斗事件伤害+50%，但每年HP恢复-1 | 深渊地下城(深入) |
| soul_gem | 灵魂宝石 | 🔮 | on_skill_check | 灵魂>30时所有判定+10% | 禁忌知识(抵抗) |
| merchant_ledger | 商会账本 | 📒 | on_year_start | 家境+0.5/年（被动收入） | 商路崛起 |
| war_medal | 军功章 | 🎖️ | on_attribute_gain | 体魄/魅力成长+1（双属性） | 战争(前线) |
| orphan_bracelet | 孤儿手环 | 📿 | on_year_start | HP<30时恢复8 | 教会的温暖 |
| squire_shield | 侍从之盾 | 🛡️ | on_hp_change | 第一次HP降到0时恢复到15(免死) | 骑士考核(通过) |

### 🟡 传说物品（改变规则，极难获取）

| ID | 名称 | 图标 | 触发 | 效果 | 来源事件 |
|----|------|------|------|------|----------|
| hero_blade | 圣剑 | ⚔️ | on_combat+on_year_start | 战斗伤害×2，每年HP恢复+2 | 勇者之旅(完成) |
| world_seed | 世界种子 | 🌍 | on_year_start | 家境+1/年，解锁世界崩坏事件线 | 精灵归访+魔法师双条件 |
| chronicle_book | 编年史 | 📖 | on_year_end | 每年随机一个属性+1(小成长) | 传承之问(倾囊相授) |
| dark_mirror | 暗黑之镜 | 🪞 | on_skill_check | 暗黑度>0时判定成功率+15%，但HP软上限-20% | 暗黑之路(接受力量) |
| reincarnation_memory | 转生记忆 | 🧠 | on_year_start | 所有属性成长+0.3/年，解锁隐藏事件 | 转生记忆事件 |

---

## 获取方式设计

### 事件分支中的物品获取

```typescript
// EventBranch 新增字段
interface EventBranch {
  // ...现有字段
  grantItem?: string   // 获得物品ID
  itemCost?: {
    hp?: number        // 消耗HP换取
    attribute?: { target: string; value: number }  // 消耗属性换取
  }
}
```

### 示例事件改造

**草药袋（🟢）**：
```
帮农夫收麦 → 选"认真学习草药" → 获得草药袋（放弃+2智慧）
```

**龙鳞护符（🔵）**：
```
讨伐巨龙 → 选"以身犯险" → 惨胜分支 → 获得龙鳞护符（HP-30代价）
```

**圣剑（🟡）**：
```
勇者之旅完成 → 自动获得圣剑（需要走完完整勇者路线）
```

---

## 实施计划

### Phase 1：基础设施（核心代码）
- [ ] types.ts：添加 InventoryState、WorldItemDef、ItemEffect 接口
- [ ] ItemModule.ts：物品管理模块（获取/叠加/触发效果）
- [ ] SimulationEngine.ts：集成物品触发（在startYear/postYearProcess中调用）
- [ ] GameState.inventory 初始化

### Phase 2：物品数据（15个物品）
- [ ] items.ts：定义 6个普通 + 5个稀有 + 4个传说物品
- [ ] manifest.ts：注册物品到世界包

### Phase 3：事件整合（改造获取方式）
- [ ] 10-15个事件分支添加 grantItem
- [ ] 3-5个事件分支添加 itemCost（付出代价换取）
- [ ] 事件分支UI显示物品奖励

### Phase 4：UI展示
- [ ] 物品栏组件（InventoryPanel.vue）
- [ ] 物品详情弹窗（悬停/点击查看效果）
- [ ] 获取物品时的动画/提示

---

## 设计注意事项

1. **物品不应该是纯数值** — 避免"体魄+5"这种无聊设计，应该是"每年体魄成长额外+0.3"
2. **物品应该创造选择困境** — "你要+2智慧还是要一个可能救命的护符？"
3. **传说物品改变游戏** — 不是"更强"，而是"不同"
4. **物品格子上限** — 默认3格，迫使玩家做取舍
5. **物品不替代事件** — 物品是被动加成，核心叙事仍然由事件驱动
