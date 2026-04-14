/**
 * export.ts — 游戏回放导出工具
 * 支持 JSON 完整存档导出 和 文本编年史生成
 */

import type { GameState, WorldInstance } from '@/engine/core/types'

// ==================== JSON 导出 ====================

/** 导出完整 GameState 为 JSON 文件 */
export function exportAsJSON(state: GameState): void {
  const serialized = {
    ...state,
    flags: [...state.flags],
    counters: Object.fromEntries(state.counters),
    triggeredEvents: [...state.triggeredEvents],
    exportedAt: Date.now(),
    version: '1.0',
  }
  const json = JSON.stringify(serialized, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, `${state.character.name ?? '无名'}_${state.meta.playId}.json`)
}

// ==================== 文本编年史 ====================

/** 生成可读的人生编年史文本 */
export function generateChronicle(state: GameState, world?: WorldInstance): string {
  const lines: string[] = []
  const name = state.character.name || '无名之人'
  const race = state.character.race
  const gender = state.character.gender

  // 标题
  lines.push(`═══════════════════════════════════════`)
  lines.push(`  ${name} 的人生编年史`)
  lines.push(`═══════════════════════════════════════`)
  lines.push('')

  // 基本信息
  lines.push(`【角色信息】`)
  if (race) lines.push(`  种族：${getDisplayName(race, world)}`)
  if (gender) lines.push(`  性别：${gender === 'male' ? '男' : '女'}`)
  lines.push(`  享年：${state.result?.lifespan ?? state.age} 岁`)
  lines.push('')

  // 属性峰值
  lines.push(`【属性峰值】`)
  const attrNames = getAttrDisplayMap(world)
  for (const [id, peak] of Object.entries(state.attributePeaks)) {
    const displayName = attrNames[id] ?? id
    const current = state.attributes[id] ?? 0
    lines.push(`  ${displayName}：${peak}（终值 ${current}）`)
  }
  lines.push('')

  // 天赋
  if (state.talents.selected.length > 0) {
    lines.push(`【天赋】`)
    for (const tid of state.talents.selected) {
      const talent = world?.talents.find((t: { id: string }) => t.id === tid)
      lines.push(`  · ${talent?.name ?? tid}`)
    }
    lines.push('')
  }

  // 人生纪事
  lines.push(`【人生纪事】`)
  lines.push(`───────────────────────────────────────`)
  for (const evt of state.eventLog) {
    const ageStr = String(evt.age).padStart(3, ' ')
    lines.push(`  ${ageStr} 岁 | ${evt.title}`)
    if (evt.description) {
      lines.push(`         ${evt.description}`)
    }

    // 分支选择详情
    if (evt.branchTitle) {
      lines.push(`         ▸ 选择：${evt.branchTitle}`)
      if (evt.branchDescription) {
        lines.push(`           ${evt.branchDescription}`)
      }
    }

    // 判定结果
    if (evt.riskRolled && evt.isSuccess !== undefined) {
      const resultTag = evt.isSuccess ? '【成功】' : '【失败】'
      lines.push(`         ${resultTag}`)
      if (evt.resultText) {
        lines.push(`           ${evt.resultText}`)
      }
    }
    lines.push('')
  }
  lines.push(`───────────────────────────────────────`)
  lines.push('')

  // 评价
  if (state.result) {
    lines.push(`【最终评价】`)
    lines.push(`  评级：${state.result.grade} — ${state.result.gradeTitle}`)
    lines.push(`  得分：${state.result.score}`)
    lines.push(`  ${state.result.gradeDescription}`)
    lines.push('')

    if (state.result.evaluations && state.result.evaluations.length > 0) {
      lines.push(`【人生评语】`)
      for (const eva of state.result.evaluations) {
        lines.push(`  ★ ${eva.title}`)
        lines.push(`    ${eva.description}`)
      }
      lines.push('')
    }
  }

  // 成就
  if (state.achievements.unlocked.length > 0) {
    lines.push(`【解锁成就】`)
    for (const achId of state.achievements.unlocked) {
      const ach = world?.achievements.find((a: { id: string }) => a.id === achId)
      lines.push(`  🏆 ${ach?.name ?? achId}`)
    }
    lines.push('')
  }

  lines.push(`═══════════════════════════════════════`)
  lines.push(`  异世界重生模拟器 · ${new Date().toLocaleDateString('zh-CN')} 导出`)
  lines.push(`═══════════════════════════════════════`)

  return lines.join('\n')
}

/** 导出编年史为文本文件 */
export function exportAsText(state: GameState, world?: WorldInstance): void {
  const text = generateChronicle(state, world)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, `${state.character.name ?? '无名'}_编年史.txt`)
}

/** 复制编年史到剪贴板 */
export async function copyChronicleToClipboard(state: GameState, world?: WorldInstance): Promise<boolean> {
  const text = generateChronicle(state, world)
  return copyTextToClipboard(text)
}

/** 复制任意文本到剪贴板 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. 优先使用 Clipboard API
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 2. fallback: execCommand("copy")
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (success) return true
    } catch {
      // execCommand 也失败
    }
    // 3. 最终 fallback: 弹出 textarea 让用户手动复制
    showManualCopyArea(text)
    return false
  }
}

/** 显示手动复制区域 */
function showManualCopyArea(text: string): void {
  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;'

  const box = document.createElement('div')
  box.style.cssText = 'background:#fff;padding:16px;border-radius:8px;max-width:80vw;max-height:80vh;display:flex;flex-direction:column;gap:8px;'

  const msg = document.createElement('p')
  msg.textContent = '自动复制失败，请手动选择下方文本并复制：'
  msg.style.cssText = 'margin:0;color:#333;font-size:14px;'

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.style.cssText = 'width:60vw;height:40vh;font-size:12px;resize:none;'

  const btn = document.createElement('button')
  btn.textContent = '关闭'
  btn.style.cssText = 'align-self:flex-end;padding:6px 16px;cursor:pointer;'
  btn.onclick = () => document.body.removeChild(overlay)

  box.appendChild(msg)
  box.appendChild(textarea)
  box.appendChild(btn)
  overlay.appendChild(box)
  document.body.appendChild(overlay)
  textarea.select()
}

// ==================== 工具函数 ====================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getDisplayName(raceId: string, world?: WorldInstance): string {
  const race = world?.races?.find((r: { id: string }) => r.id === raceId)
  return race?.name ?? raceId
}

function getAttrDisplayMap(world?: WorldInstance): Record<string, string> {
  if (!world) return {}
  const map: Record<string, string> = {}
  for (const attr of world.attributes) {
    map[attr.id] = attr.name
  }
  return map
}
