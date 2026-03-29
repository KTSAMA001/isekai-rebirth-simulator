/**
 * 天赋互斥冲突定向测试
 * 强制 demon_heritage + dragon_blood 同时选择，验证不再崩溃
 * 运行: npx tsx scripts/test-talent-conflict.ts
 */

import { SimulationEngine } from '../src/engine/core/SimulationEngine'
import { createSwordAndMagicWorld } from '../src/worlds/sword-and-magic'
import { TalentModule } from '../src/engine/modules/TalentModule'
import { RandomProvider } from '../src/engine/core/RandomProvider'

let passed = 0
let failed = 0

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ ${msg}`)
    passed++
  } else {
    console.log(`  ❌ ${msg}`)
    failed++
  }
}

function main() {
  console.log('🧪 天赋互斥冲突定向测试\n')

  const world = createSwordAndMagicWorld()

  // === 测试1: selectTalents 传入互斥天赋对，不崩溃 ===
  console.log('--- 测试1: 传入 [dragon_blood, demon_heritage] 不崩溃 ---')
  {
    const engine = new SimulationEngine(world, 42)
    engine.initGame('互斥测试角色')

    // 正常流程：先 draft
    const drafted = engine.draftTalents()
    console.log(`  抽取到的天赋池: ${drafted.join(', ')}`)

    // 强制选择两个互斥天赋
    // 如果它们不在池中，手动构造 selectTalents 调用
    const forcedSelection = ['dragon_blood', 'demon_heritage', drafted[0]]
    console.log(`  强制选择: ${forcedSelection.join(', ')}`)

    try {
      const state = engine.selectTalents(forcedSelection)
      assert(true, 'selectTalents 不再崩溃')
      assert(
        state.talents.selected.length <= 3,
        `选中天赋数 ≤ 3 (实际: ${state.talents.selected.length})`
      )
      // dragon_blood 和 demon_heritage 不应同时存在
      const hasBoth =
        state.talents.selected.includes('dragon_blood') &&
        state.talents.selected.includes('demon_heritage')
      assert(!hasBoth, '不存在互斥天赋同时选中的情况')
      console.log(`  最终选中: ${state.talents.selected.join(', ')}`)
    } catch (e) {
      assert(false, `selectTalents 崩溃: ${(e as Error).message}`)
    }
  }

  // === 测试2: 反序传入互斥天赋对 ===
  console.log('\n--- 测试2: 反序 [demon_heritage, dragon_blood] 不崩溃 ---')
  {
    const engine = new SimulationEngine(world, 123)
    engine.initGame('反序互斥测试')

    const drafted = engine.draftTalents()
    const forcedSelection = ['demon_heritage', 'dragon_blood', drafted[0]]

    try {
      const state = engine.selectTalents(forcedSelection)
      assert(true, '反序选择不再崩溃')
      const hasBoth =
        state.talents.selected.includes('dragon_blood') &&
        state.talents.selected.includes('demon_heritage')
      assert(!hasBoth, '反序也不存在同时选中的情况')
      // 先选的 demon_heritage 应该保留
      assert(
        state.talents.selected.includes('demon_heritage'),
        '先选的 demon_heritage 保留'
      )
      console.log(`  最终选中: ${state.talents.selected.join(', ')}`)
    } catch (e) {
      assert(false, `反序选择崩溃: ${(e as Error).message}`)
    }
  }

  // === 测试3: 正常天赋选择不受影响 ===
  console.log('\n--- 测试3: 无互斥的天赋正常选择 ---')
  {
    const engine = new SimulationEngine(world, 999)
    engine.initGame('正常测试')

    const drafted = engine.draftTalents()
    // 选择前3个（通常是不同的天赋）
    const normalSelection = drafted.slice(0, 3)

    try {
      const state = engine.selectTalents(normalSelection)
      assert(true, '正常天赋选择不崩溃')
      assert(
        state.talents.selected.length === normalSelection.length,
        `选中数量一致 (${state.talents.selected.length}/${normalSelection.length})`
      )
    } catch (e) {
      assert(false, `正常选择崩溃: ${(e as Error).message}`)
    }
  }

  // === 测试4: 完整游戏流程（含互斥天赋） ===
  console.log('\n--- 测试4: 互斥天赋完整游戏流程 ---')
  {
    const engine = new SimulationEngine(world, 777)
    engine.initGame('完整流程测试')

    const drafted = engine.draftTalents()
    // 尝试强制选择互斥天赋
    const forcedSelection = ['dragon_blood', 'demon_heritage', 'blessed_by_goddess', 'twin_souls']

    try {
      engine.selectTalents(forcedSelection)

      // 分配属性
      engine.allocateAttributes({ str: 3, mag: 3, int: 3, spr: 3, chr: 3, mny: 3, luk: 2 })

      // 推演最多 10 年
      for (let i = 0; i < 10; i++) {
        const state = engine.getState()
        if (state.hp <= 0 || state.phase === 'finished') break
        const result = engine.startYear()
        if (result.phase === 'awaiting_choice' && result.branches && result.branches.length > 0) {
          engine.resolveBranch(result.branches[0].id)
        }
      }

      assert(true, '完整游戏流程不崩溃')
    } catch (e) {
      assert(false, `完整流程崩溃: ${(e as Error).message}`)
    }
  }

  // === 测试5: TalentModule 直接测试 ===
  console.log('\n--- 测试5: TalentModule.selectTalents 直接测试 ---')
  {
    const random = new RandomProvider(42)
    const talentModule = new TalentModule(world, random)

    // 直接调用 selectTalents
    const result = talentModule.selectTalents(
      ['dragon_blood', 'demon_heritage', 'blessed_by_goddess'],
      ['dragon_blood', 'demon_heritage', 'blessed_by_goddess'],
      3
    )

    assert(result.selected.length === 2, `互斥过滤后选中 2 个天赋 (实际: ${result.selected.length})`)
    assert(result.conflicts.length === 1, `产生 1 条冲突记录 (实际: ${result.conflicts.length})`)
    assert(
      result.selected.includes('dragon_blood'),
      '先选的 dragon_blood 被保留'
    )
    assert(
      !result.selected.includes('demon_heritage'),
      '后选的 demon_heritage 被跳过'
    )
    assert(
      result.selected.includes('blessed_by_goddess'),
      '无关天赋 blessed_by_goddess 正常入选'
    )
    console.log(`  conflicts: ${result.conflicts.join('; ')}`)
    console.log(`  selected: ${result.selected.join(', ')}`)
  }

  // === 汇总 ===
  console.log('\n' + '='.repeat(50))
  if (failed === 0) {
    console.log(`✅ 全部 ${passed} 个测试通过！`)
  } else {
    console.log(`❌ ${failed} 个测试失败，${passed} 个通过`)
  }
  console.log('='.repeat(50))

  process.exit(failed > 0 ? 1 : 0)
}

main()
