import type { GameState, WorldInstance } from '@/engine/core/types'
import { generateChronicle } from '@/utils/export'

export const DEFAULT_OPENCLAW_ENDPOINT = 'http://localhost:18789/v1/responses'
export const OPENCLAW_MODEL = 'openclaw'

const OPENCLAW_SETTINGS_STORAGE_KEY = 'isekai_openclaw_settings'

export interface OpenClawSettings {
  endpoint: string
  token: string
}

interface OpenClawResponsePayload {
  error?: {
    message?: string
  }
  output?: Array<{
    type?: string
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
}

export function normalizeOpenClawEndpoint(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return DEFAULT_OPENCLAW_ENDPOINT
  if (trimmed.endsWith('/v1/responses')) return trimmed
  return `${trimmed.replace(/\/+$/, '')}/v1/responses`
}

export function loadOpenClawSettings(): OpenClawSettings {
  if (typeof localStorage === 'undefined') {
    return { endpoint: DEFAULT_OPENCLAW_ENDPOINT, token: '' }
  }

  const raw = localStorage.getItem(OPENCLAW_SETTINGS_STORAGE_KEY)
  if (!raw) {
    return { endpoint: DEFAULT_OPENCLAW_ENDPOINT, token: '' }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OpenClawSettings>
    return {
      endpoint: parsed.endpoint?.trim() || DEFAULT_OPENCLAW_ENDPOINT,
      token: parsed.token?.trim() || '',
    }
  } catch {
    return { endpoint: DEFAULT_OPENCLAW_ENDPOINT, token: '' }
  }
}

export function saveOpenClawSettings(settings: OpenClawSettings): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(OPENCLAW_SETTINGS_STORAGE_KEY, JSON.stringify({
    endpoint: normalizeOpenClawEndpoint(settings.endpoint),
    token: settings.token.trim(),
  }))
}

export function generateWorldbook(world: WorldInstance): string {
  const lines: string[] = []

  lines.push('【世界书】')
  lines.push(`世界：${world.manifest.name}`)
  if (world.manifest.subtitle) {
    lines.push(`副标题：${world.manifest.subtitle}`)
  }
  lines.push(`简介：${world.manifest.description}`)
  if (world.manifest.tags.length > 0) {
    lines.push(`标签：${world.manifest.tags.join(' / ')}`)
  }
  lines.push(`世界寿命上限参考：${world.manifest.maxAge} 岁`)
  lines.push('')

  lines.push('【主要种族】')
  for (const race of world.races ?? []) {
    lines.push(`- ${race.name}：${race.description}`)
    if (race.lore) {
      lines.push(`  设定：${race.lore}`)
    }
  }
  lines.push('')

  lines.push('【核心属性】')
  for (const attr of world.attributes.filter(attr => !attr.hidden)) {
    lines.push(`- ${attr.name}：${attr.description}`)
  }
  lines.push('')

  if (world.manifest.routes && world.manifest.routes.length > 0) {
    lines.push('【人生路线】')
    for (const route of world.manifest.routes) {
      lines.push(`- ${route.name}：${route.description}`)
    }
    lines.push('')
  }

  lines.push('【写作约束】')
  lines.push('- 严格遵守上述世界设定与种族气质。')
  lines.push('- 不要凭空改写角色的人生关键节点、成败与结局。')
  lines.push('- 允许补足对话、环境、心理活动，但不能违背编年史事实。')

  return lines.join('\n')
}

export function generateStorySource(state: GameState, world: WorldInstance): string {
  const chronicle = generateChronicle(state, world)
  const worldbook = generateWorldbook(world)

  return [
    '【任务说明】',
    '请根据下面的世界书与人生编年史，将其改写成一篇完整、连贯、可阅读的异世界人生故事。',
    '要求：',
    '1. 保持世界观、种族设定、事件顺序与结局一致。',
    '2. 可以补足细节、对白、场景与情绪，但不要虚构会改变主线命运的重要设定。',
    '3. 输出应是完整短篇故事，而不是事件列表。',
    '4. 若编年史中存在风险判定成功/失败，请将其自然融入剧情表现。',
    '',
    worldbook,
    '',
    chronicle,
  ].join('\n')
}

export function extractOpenClawText(payload: OpenClawResponsePayload): string {
  const chunks = payload.output
    ?.flatMap(message => message.content ?? [])
    .filter(content => content.type === 'output_text' && typeof content.text === 'string')
    .map(content => content.text?.trim() ?? '')
    .filter(Boolean) ?? []

  if (chunks.length === 0) {
    throw new Error('OpenClaw 没有返回可读取的文本内容')
  }

  return chunks.join('\n\n')
}

export function explainOpenClawError(error: unknown): string {
  if (error instanceof TypeError) {
    return '浏览器无法直接访问当前 OpenClaw 地址。已确认本地 API 可用，但当前网关不支持跨域预检；请改用支持 CORS 的内网地址，或配置同源反向代理。'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'OpenClaw 请求失败，请检查地址、Token 和网络连通性。'
}

export async function requestOpenClawStory(options: OpenClawSettings & { sourceText: string }): Promise<string> {
  const endpoint = normalizeOpenClawEndpoint(options.endpoint)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token.trim()}`,
    },
    body: JSON.stringify({
      model: OPENCLAW_MODEL,
      input: options.sourceText,
    }),
  })

  const payload = await response.json().catch(() => ({}) as OpenClawResponsePayload)
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenClaw 请求失败（HTTP ${response.status}）`)
  }

  return extractOpenClawText(payload)
}