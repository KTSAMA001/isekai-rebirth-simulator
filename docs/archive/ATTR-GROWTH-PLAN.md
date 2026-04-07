# 属性增长体系重设计 - 执行计划

## 目标
- 100年人生中，主属性(2-3个)达到15-25，副属性(2-3个)达到8-15
- 少年期快速成长，成年后靠道具突破
- 消除child阶段0增长的空白

## 现状数据
| 阶段 | 总事件 | 分支 | 属性效果 | +1 | +2 | +3+ | 无属性事件 |
|------|--------|------|----------|----|----|-----|-----------|
| childhood | 23 | 45 | 92 | 82 | 10 | 0 | 7 |
| teenager | 25 | 53 | 123 | 87 | 25 | 11 | 6 |
| youth | 35 | 79 | 176 | 135 | 29 | 12 | 6 |
| adult | 55 | 122 | 245 | 137 | 65 | 43 | 11 |
| middle-age | 24 | 59 | 124 | 74 | 31 | 19 | 2 |
| elder | 23 | 44 | 71 | 42 | 18 | 11 | 7 |

## CC 任务计划（串行执行，每任务后 commit）

### Phase 1: Childhood 事件属性补全
**文件**: childhood.json (1 file, 1 core issue)
**范围**: 7个无属性事件加属性效果 + 全部 +1 效果提升到 +2
**预期**: child阶段每属性净增长从 0 → +8~15

### Phase 2: Teenager 事件增幅提升
**文件**: teenager.json (1 file, 1 core issue)  
**范围**: 6个无属性事件加属性效果 + 全部 +1→+2, +2→+3
**预期**: teenager阶段增幅翻倍

### Phase 3: Youth 事件增幅提升
**文件**: youth.json (1 file, 1 core issue)
**范围**: 6个无属性事件加属性 + +1→+2, +2→+3
**预期**: youth阶段增幅翻倍

### Phase 4: Adult 事件增幅 + SPR 压制
**文件**: adult.json (1 file, 1 core issue)
**范围**: 11个无属性事件加属性 + STR/MAG/LUK +1→+2 + SPR 事件(spr_near_death, spr_meditation_retreat) 增幅降低
**预期**: adult阶段 STR/MAG 增长翻倍，SPR 增长减半

### Phase 5: Middle-age 事件增幅
**文件**: middle-age.json (1 file, 1 core issue)
**范围**: 2个无属性事件加属性 + +1→+2
**预期**: 中年期稳定增长

### Phase 6: Elder 事件微调
**文件**: elder.json (1 file, 1 core issue)
**范围**: 7个无属性事件加属性 + SPR 大事件增幅降低
**预期**: 老年期SPR不再爆炸

### Phase 7: 验证测试
**操作**: 运行10轮测试，对比前后数据
**Commit**: 测试报告

## CC 通用指令模板
```
对 <FILE> 执行以下修改：
1. 所有无属性的分支，根据事件主题添加属性效果（+1~2）
2. 所有 modify_attribute 效果 value=1 的改为 value=2
3. 所有 modify_attribute 效果 value=2 的改为 value=3
4. 保持现有 flag 和 item 效果不变
5. 保持事件平衡（正负效果平衡）
```

## 属性效果添加原则
- 纯叙事事件（如 first_snow, childhood_play）: 每个分支 +1~2 相关属性
- 危险事件（child_plague, child_drowning）: 生存分支给 SPR+2, 其他给小增幅
- 无分支事件（church_orphan, fairy_encounter）: effects 数组中加属性修改
- theme 匹配: 运动→STR, 社交→CHR, 探索→INT/SPR, 魔法→MAG
