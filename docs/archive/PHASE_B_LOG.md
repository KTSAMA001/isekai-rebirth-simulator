# Phase B 平衡修改日志

## B1: 超标分支(net≥+6)加代价 ✅
- **日期**: 2026-04-02
- **目标**: 将所有 net≥+6 的分支降到 +5 以下
- **基线**: 66 个超标分支
- **操作**:
  - `patch-b1-overpowered.py`: 34 个无 diceCheck 高净值分支，添加显著惩罚
  - `patch-b1-remaining.py`: 32 个有 diceCheck 但仍超标的分支，添加小惩罚
  - `patch-b1-final.py`: 12 个最终残余分支，添加属性代价
- **结果**: 超标分支 66 → 0 ✅
- **验证**: analyze-balance.py 确认 0 个超标分支

## B2: 废选项(net≤0)加正面收益 ✅
- **日期**: 2026-04-02
- **目标**: 将废选项(net≤0)降到 ≤15 个
- **基线**: 128 个废选项
- **操作**:
  - `patch-b2-waste.py`: 127 个废选项添加正面收益（属性+1~+3，flag，等）
  - `patch-b2-remaining.py`: 17 个补充修改，把 net=0 推到 +1，把轻微负面推向正面
- **结果**: 废选项 128 → 8 ✅ (远低于目标15)
- **残余8个废选项**:
  - `elder_final_illness/final_treatment` (net=-21): 临终治疗，主题性合理
  - `elder_frail/frail_extend` (net=-17.5): 对抗衰弱，主题性合理
  - `mid_chronic_pain/seek_treatment` (net=-10): 慢性病治疗，主题性合理
  - `mid_vision_decline/get_glasses` (net=-5): 老花眼配镜
  - `elder_illness/illness_fight` (net=-3): 抗病
  - `gambling_night/gamble_lose` (net=-2): 赌博输钱
  - `final_cataclysm/become_god` (net=0): 成神代价（特殊事件）
  - `mid_existential_crisis/crisis_drown` (net=0): 存在危机
- **验证**:
  - AJV schema: 247 个事件全部通过 ✅
  - vue-tsc --noEmit: 零错误 ✅
  - 页面加载: 正常 ✅

## B3: 无分支纯正面事件拆分支 ✅
- **日期**: 2026-04-02
- **目标**: 将高净值无分支事件拆为有取舍的多分支
- **基线**: 5 个无分支纯正面事件
- **操作**:
  - `patch-b3-split.py`:
    - `magic_graduate` (net+8) → 3个分支: 深造研究/全面发展/立刻工作
    - `royal_summon` (net+8) → 3个分支: 接受任命/礼貌周旋/婉拒回归
    - `world_breaking_start` (net+6) → 2个分支: 挺身对抗(含diceCheck)/保全周围人
  - 保留 `peaceful_end` (net+4) 和 `elder_natural_death` (net+1)：安详晚年事件，数值低且叙事合理
- **结果**: 无分支纯正面事件 5 → 2 ✅
- **验证**:
  - AJV schema: 247 个事件全部通过 ✅
  - 超标分支仍为 0，废选项仍为 8 ✅

## B4: 必选项(28个)增加权衡 ✅
- **日期**: 2026-04-02
- **目标**: 消除所有"无脑选择"分支，使同一事件的分支net差距≤2
- **基线**: QA文档标注28个必选项（经B1/B2处理后大部分已改善）
- **操作**:
  - `patch-b4-mandatory.py` (12个分支):
    - A类-给优势分支加代价(8个): hunt_big_game加hp-5, haggle_win加spr-1, god_accept加luk-1, pastlife_embrace加chr-1, listen_carefully加mny-1, adopt_take加str-1, study_scholar加mny-1, refuse_guild加chr-1
    - B类-给弱选项加收益(4个): peace_garden加chr+1/int+1, hesitate_guild加spr+1/mag+1, self_study加spr+1/str+1, adopt_donate加luk+1
- **结果**:
  - guild_recruitment 三分支全部 +3.0（完美平衡）
  - scholar_guidance 三分支全部 +3.0（完美平衡）
  - young_rival 三分支全部 +3.0（完美平衡）
  - 所有高净值(+4~+5)分支都有对应代价
  - 同事件分支 net 差距基本 ≤2
- **验证**:
  - AJV schema: 247 个事件全部通过 ✅
  - 超标=0, 废选项=8, 无分支正面=2 ✅

## B5: 最终验收测试 ✅
- **日期**: 2026-04-02
- **验证清单**:
  1. AJV Schema 验证: 247 个事件全部通过 ✅
  2. TypeScript 编译 (vue-tsc --noEmit): 零错误 ✅
  3. Vite 生产构建 (vite build): 构建成功 ✅
  4. 页面加载 (curl localhost:5174): HTTP 200 ✅
  5. 事件ID重复检测: 247 个ID无重复 ✅
  6. Effect字段完整性: 所有effect都有type和target ✅
  7. Vite 开发服务器: 热重载正常，无错误输出 ✅
  8. 浏览器页面: 正常打开 ✅

---

## Phase B 最终平衡报告

| 指标 | 基线(改前) | 目标 | 结果 | 状态 |
|------|-----------|------|------|------|
| 总事件数 | 247 | - | 247 | - |
| 总分支数 | ~600 | - | 608 | - |
| 分支平均net | ~+3.5 | - | +2.78 | 更均衡 |
| 超标分支(net≥+6) | 66 | 0 | 0 | ✅ |
| 废选项(net≤0) | 128 | ≤15 | 8 | ✅ |
| 无分支纯正面 | 5 | ≤3 | 2 | ✅ |

### 净值分布
```
   <-5:   3 (重病/死亡事件)
  -5~-1:  3 (治疗/赌博事件)
  -1~0:   0 
  0~+1:  10
  +1~+3: 242 (最健康区间)
  +3~+5: 262 (有代价的高收益)
   >+5:  88 (含diceCheck风险)
```

### 改造总量
- B1: 78 个超标分支添加惩罚 (3轮脚本)
- B2: 144 个废选项添加收益 (2轮脚本)
- B3: 3 个无分支事件拆为多分支 (新增8个分支)
- B4: 12 个必选项/弱选项微调
- 总计: ~236 个分支被修改
