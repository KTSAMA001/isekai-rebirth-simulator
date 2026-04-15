# QA 检查清单 — 核心规则摘要

> 来源：docs/QA-TEST-BASELINE.md（~540 行），此文件为快速参考版。

---

## 1. 种族数据

| 种族 | maxLifespan | lifespanRange | 初始属性修正 |
|------|-------------|---------------|-------------|
| 人类 | 100 | [65, 85] | 均衡 |
| 精灵 | 500 | [250, 400] | mag+8, int+5, str-5 |
| 哥布林 | 60 | [20, 35] | luk+10, str-8, chr-6 |
| 矮人 | 400 | [150, 250] | str+8, mag-5 |

## 2. HP 系统

- **K = 12**（sigmoid 陡度）
- **Beta(3,3)** 动态映射，范围 `[range[0]/Max - 0.10, range[1]/Max + 0.08]`
- **童年保护**：10 岁以下 `ageDecay = 0`
- **HP 平台期**：`raceMaxLifespan >= 200 && lifeProgress < 0.5` 时 HP ≥ `initHp × 30%`（精灵、矮人）
- **单年净损失上限**：`max(floor(initHp × 0.20), 12)`
- **超寿命惩罚**：`lifeProgress > 1.0` 时额外衰减

## 3. 评分等级

D(0-120) → C(120-200) → B(200-280) → A(280-380) → S(380-500) → SS(500+)

## 4. 生命阶段（绝对年龄）

| 阶段 | 人类 | 精灵 | 哥布林 | 矮人 |
|------|------|------|--------|------|
| childhood | [2,10] | [2,50] | [1,6] | [2,30] |
| teen | [11,17] | [30,80] | [5,12] | [20,50] |
| youth | [14,22] | [50,120] | [8,18] | [30,80] |
| adult | [20,45] | [80,250] | [15,35] | [60,200] |
| midlife | [35,60] | [200,380] | [25,50] | [180,320] |
| elder | [55,100] | [350,500] | [35,60] | [280,400] |

## 5. 关键 Flag 链

```
squire → knight_examination → knight
guild_member → 冒险任务 → 工会晋升
magic_student → magic_exam → mage_graduate
dating_deepen → marriage_proposal → engaged → wedding → married → parent
```

## 6. 数据总量

- 事件：675 | 成就：127 | 天赋：68

## 7. lifeProgress 成就（12 个）

longevity, slum_survivor, love_and_war, eternal_wanderer, widowed_hero, peaceful_ending, dragon_near_death, war_hero_ach, dark_savior, fairy_companion, eternal_peace, iron_will_to_end

## 8. 9.1 阶段隔离禁忌

- birth：不含考核/入学/结婚/战斗
- childhood：不含婚姻纪念/退休/传承
- teenager：不含含饴弄孙/培养继承人/孩子离家
- youth：不含退休/孙辈
- adult：不含入学/青春期叛逆
- middle-age：不含入学/初恋/青春期/骑士考核/加入公会
- elder：不含入学/初恋/出发冒险/加入公会/侍从修炼

## 9. 9.8 事件效果落地

- ❌ 事件 `effects` 数组为空但描述明确有状态变化 → bug
- ❌ 描述"失去了 X"但无 `modify_attribute`/`modify_hp` → 可能 bug
- ⚠️ 纯叙事事件无 effects 是正常的
- ✅ 多分支事件中只有部分分支有状态变化是正常的

## 10. 蒙特卡洛判定规则

1. 平均存活年龄在 lifespanRange 的 50%-130% 之间
2. 中位数不偏离平均超过 20%
3. 不超过 10% 的角色超过 maxLifespan
