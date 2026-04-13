#!/usr/bin/env node
/**
 * 生命阶段迁移脚本
 *
 * 输入：data/sword-and-magic/events/*.json
 * 处理：将 minAge/maxAge 转换为基于生命阶段的 stageProgress
 * 输出：修改后的 JSON + 变更摘要
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 人类生命阶段边界（基准）
const HUMAN_LIFE_STAGES = {
  childhood: [2, 10],
  teenager: [11, 17],
  youth: [14, 22],
  adult: [20, 45],
  'middle-age': [35, 60],
  elder: [55, 100]
}

// 文件名到 lifeStage 的映射
const FILE_TO_LIFE_STAGE = {
  'birth.json': null,
  'childhood.json': 'childhood',
  'teenager.json': 'teen',
  'youth.json': 'youth',
  'adult.json': 'adult',
  'middle-age.json': 'midlife',
  'elder.json': 'elder'
}

// 事件类型
interface EventDef {
  id: string
  title: string
  description: string
  minAge: number
  maxAge: number
  weight: number
  include?: string
  exclude?: string
  effects: any[]
  branches?: any[]
  isBad?: boolean
  tag?: string
  unique?: boolean
  priority?: string
  prerequisites?: string[]
  mutuallyExclusive?: string[]
  weightModifiers?: any[]
  routes?: string[]
  routeMode?: string
  races?: string[]
  genders?: string[]
  raceVariants?: Record<string, any>
  genderVariants?: Record<string, any>
  lifeStage?: string
  lifeStages?: string[]
  minStageProgress?: number
  maxStageProgress?: number
}

// 迁移结果统计
interface MigrationStats {
  totalEvents: number
  birthEvents: number
  raceEvents: number
  migratedEvents: number
  crossStageEvents: number
  skippedEvents: number
}

function getHumanStageBoundary(lifeStage: string): [number, number] {
  const stage = FILE_TO_LIFE_STAGE[`${lifeStage}.json` as keyof typeof FILE_TO_LIFE_STAGE]
  if (!stage || !HUMAN_LIFE_STAGES[stage]) {
    throw new Error(`Unknown life stage: ${lifeStage}`)
  }
  return HUMAN_LIFE_STAGES[stage]
}

function calculateStageProgress(minAge: number, maxAge: number, stageBoundary: [number, number]): [number, number] {
  const [sMin, sMax] = stageBoundary
  const stageSpan = sMax - sMin

  const minProgress = (minAge - sMin) / stageSpan
  const maxProgress = (maxAge - sMin) / stageSpan

  // Clamp to 0-1 range
  return [
    Math.max(0, Math.min(1, minProgress)),
    Math.max(0, Math.min(1, maxProgress))
  ]
}

function checkCrossStage(event: EventDef, stageBoundary: [number, number]): boolean {
  const minProgress = (event.minAge - stageBoundary[0]) / (stageBoundary[1] - stageBoundary[0])
  const maxProgress = (event.maxAge - stageBoundary[0]) / (stageBoundary[1] - stageBoundary[0])

  return minProgress < 0 || maxProgress > 1
}

function migrateEvent(event: EventDef, fileName: string, stats: MigrationStats): EventDef {
  // 跳过 birth 事件
  if (fileName === 'birth.json') {
    stats.birthEvents++
    return event
  }

  // 跳过种族专属事件
  if (event.races && event.races.length > 0) {
    stats.raceEvents++
    return event
  }

  // 获取对应的 lifeStage
  const lifeStage = FILE_TO_LIFE_STAGE[fileName as keyof typeof FILE_TO_LIFE_STAGE]
  if (!lifeStage) {
    console.warn(`Unknown file mapping: ${fileName}`)
    stats.skippedEvents++
    return event
  }

  // 获取人类阶段边界
  const stageBoundary = getHumanStageBoundary(lifeStage)

  // 检查是否为跨阶段事件
  const isCrossStage = checkCrossStage(event, stageBoundary)

  if (isCrossStage) {
    // 跨阶段事件：保留 minAge/maxAge，添加 lifeStages
    // 找出所有覆盖的阶段
    const coveredStages: string[] = []

    for (const [stage, boundary] of Object.entries(HUMAN_LIFE_STAGES)) {
      const [sMin, sMax] = boundary
      if (event.maxAge >= sMin && event.minAge <= sMax) {
        coveredStages.push(stage)
      }
    }

    if (coveredStages.length === 0) {
      console.error(`Event ${event.id} has no valid stages: min=${event.minAge}, max=${event.maxAge}`)
      return event
    }

    const migrated = {
      ...event,
      lifeStages: coveredStages,
      minAge: event.minAge,
      maxAge: event.maxAge
    }

    stats.crossStageEvents++
    stats.migratedEvents++
    return migrated
  } else {
    // 单阶段事件：计算 stageProgress，删除 minAge/maxAge
    const [minProgress, maxProgress] = calculateStageProgress(event.minAge, event.maxAge, stageBoundary)

    const migrated = {
      ...event,
      lifeStage,
      minStageProgress: minProgress,
      maxStageProgress: maxProgress
    }

    // 删除旧的 minAge/maxAge
    delete migrated.minAge
    delete migrated.maxAge

    stats.migratedEvents++
    return migrated
  }
}

function main() {
  const eventsDir = path.join(__dirname, '../data/sword-and-magic/events')
  const stats: MigrationStats = {
    totalEvents: 0,
    birthEvents: 0,
    raceEvents: 0,
    migratedEvents: 0,
    crossStageEvents: 0,
    skippedEvents: 0
  }

  const migrationReport: Array<{
    fileName: string
    eventId: string
    changes: string[]
  }> = []

  // 读取所有事件文件
  const eventFiles = fs.readdirSync(eventsDir)

  for (const fileName of eventFiles) {
    if (!fileName.endsWith('.json')) continue

    const filePath = path.join(eventsDir, fileName)
    const events = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as EventDef[]

    const fileMigrationReport = []

    for (const event of events) {
      stats.totalEvents++

      const original = JSON.stringify(event, null, 2)
      const migrated = migrateEvent(event, fileName, stats)

      if (original !== JSON.stringify(migrated, null, 2)) {
        fileMigrationReport.push({
          eventId: event.id,
          changes: [
            `minAge: ${event.minAge} → lifeStage: ${migrated.lifeStage || migrated.lifeStages}`,
            `maxAge: ${event.maxAge} → minStageProgress: ${migrated.minStageProgress}`,
            `maxStageProgress: ${migrated.maxStageProgress}`,
            ...(migrated.lifeStages ? [`lifeStages: ${migrated.lifeStages.join(', ')}`] : [])
          ]
        })
      }
    }

    migrationReport.push({
      fileName,
      eventId: 'file',
      changes: fileMigrationReport.length > 0 ?
        [`Migrated ${fileMigrationReport.length} events`] :
        ['No changes needed']
    })

    // 写回修改后的文件
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2))
  }

  // 输出统计信息
  console.log('\n=== 迁移统计 ===')
  console.log(`总事件数: ${stats.totalEvents}`)
  console.log(`birth 事件: ${stats.birthEvents}`)
  console.log(`种族专属事件: ${stats.raceEvents}`)
  console.log(`已迁移事件: ${stats.migratedEvents}`)
  console.log(`跨阶段事件: ${stats.crossStageEvents}`)
  console.log(`跳过事件: ${stats.skippedEvents}`)

  // 输出详细迁移报告
  console.log('\n=== 详细迁移报告 ===')
  migrationReport.forEach(report => {
    console.log(`\n文件: ${report.fileName}`)
    report.changes.forEach(change => {
      console.log(`- ${change}`)
    })
  })

  // 生成变更摘要
  const summary = `
## 生命阶段迁移完成

### 统计信息
- 总事件数: ${stats.totalEvents}
- birth 事件: ${stats.birthEvents}（保留 minAge/maxAge）
- 种族专属事件: ${stats.raceEvents}（保留 minAge/maxAge）
- 已迁移事件: ${stats.migratedEvents}
  - 单阶段事件: ${stats.migratedEvents - stats.crossStageEvents}
  - 跨阶段事件: ${stats.crossStageEvents}
- 跳过事件: ${stats.skippedEvents}

### 查看变化
所有事件文件已更新。使用以下命令查看差异：
\`\`\`
git diff data/sword-and-magic/events/
\`\`\`

### 验证
运行测试确保迁移正确：
\`\`\`
npm test
\`\`\`
`

  fs.writeFileSync(
    path.join(__dirname, '../tests/output/migration-report.md'),
    summary
  )

  console.log('\n=== 迁移完成 ===')
  console.log('详细报告已保存到: tests/output/migration-report.md')
}

main()