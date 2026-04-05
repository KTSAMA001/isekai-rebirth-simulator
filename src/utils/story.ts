import type { GameState, WorldInstance } from '@/engine/core/types'
import { generateChronicle } from '@/utils/export'

export const DEFAULT_OPENCLAW_ENDPOINT = 'http://localhost:18789/v1/responses'
export const OPENCLAW_MODEL = 'openclaw'

const OPENCLAW_SETTINGS_STORAGE_KEY = 'isekai_openclaw_settings'
const OPENCLAW_CRYPTO_SALT = 'isekai-rebirth-openclaw-v1'

export interface OpenClawSettings {
  endpoint: string
  token: string
}

/** localStorage 中实际存储的格式（token 可能是加密后的） */
interface StoredOpenClawSettings {
  endpoint: string
  /** 加密后的 token，格式 "enc:iv_hex:ciphertext_hex" */
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

/** Token 探测结果 */
export interface TokenProbeResult {
  /** 探测是否成功完成（不管是否需要 token） */
  ok: boolean
  /** 是否需要 token */
  required: boolean
  /** 给用户的说明 */
  message: string
}

// ─── 加密工具 ───

/** 从 origin + 固定盐派生 AES-GCM 密钥 */
async function deriveTokenKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const origin = typeof location !== 'undefined' ? location.origin : 'isekai-local'
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(origin),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode(OPENCLAW_CRYPTO_SALT), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes.buffer as ArrayBuffer
}

/** 加密 token，返回 "enc:iv_hex:ciphertext_hex" */
export async function encryptToken(token: string): Promise<string> {
  if (!token.trim()) return ''
  const key = await deriveTokenKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(token.trim()),
  )
  return `enc:${bufToHex(iv.buffer as ArrayBuffer)}:${bufToHex(ciphertext)}`
}

/** 解密 token，支持向后兼容未加密的旧值 */
export async function decryptToken(stored: string): Promise<string> {
  if (!stored) return ''
  if (!stored.startsWith('enc:')) return stored // 向后兼容：旧的明文 token
  const parts = stored.split(':')
  if (parts.length !== 3) return ''
  const iv = new Uint8Array(hexToBuf(parts[1]))
  const ciphertext = hexToBuf(parts[2])
  try {
    const key = await deriveTokenKey()
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return new TextDecoder().decode(plainBuf)
  } catch {
    return '' // 密钥不匹配（换了 origin）则视为无 token
  }
}

// ─── 设置读写 ───

export function normalizeOpenClawEndpoint(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return DEFAULT_OPENCLAW_ENDPOINT
  if (trimmed.endsWith('/v1/responses')) return trimmed
  return `${trimmed.replace(/\/+$/, '')}/v1/responses`
}

export async function loadOpenClawSettings(): Promise<OpenClawSettings> {
  if (typeof localStorage === 'undefined') {
    return { endpoint: DEFAULT_OPENCLAW_ENDPOINT, token: '' }
  }

  const raw = localStorage.getItem(OPENCLAW_SETTINGS_STORAGE_KEY)
  if (!raw) {
    return { endpoint: DEFAULT_OPENCLAW_ENDPOINT, token: '' }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredOpenClawSettings>
    const token = await decryptToken(parsed.token?.trim() || '')
    return {
      endpoint: parsed.endpoint?.trim() || DEFAULT_OPENCLAW_ENDPOINT,
      token,
    }
  } catch {
    return { endpoint: DEFAULT_OPENCLAW_ENDPOINT, token: '' }
  }
}

export async function saveOpenClawSettings(settings: OpenClawSettings): Promise<void> {
  if (typeof localStorage === 'undefined') return
  const encryptedToken = await encryptToken(settings.token)
  localStorage.setItem(OPENCLAW_SETTINGS_STORAGE_KEY, JSON.stringify({
    endpoint: normalizeOpenClawEndpoint(settings.endpoint),
    token: encryptedToken,
  }))
}

// ─── Token 探测 ───

/**
 * 探测指定 OpenClaw endpoint 是否需要 token。
 * 会向目标地址发送一个极小的请求来判断认证需求。
 */
export async function probeOpenClawToken(endpoint: string): Promise<TokenProbeResult> {
  const url = normalizeOpenClawEndpoint(endpoint)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OPENCLAW_MODEL, input: '' }),
    })
    if (res.status === 401) {
      return { ok: true, required: true, message: '目标 OpenClaw 网关需要 Token 认证。请在下方手动填入 Token。' }
    }
    // 2xx 或其他非 401 都说明不需要 token（可能有其他错误，但至少不是认证问题）
    return { ok: true, required: false, message: '目标 OpenClaw 网关无需 Token，可以直接发送。' }
  } catch {
    return { ok: false, required: false, message: '无法连接到目标地址。请确认 OpenClaw 正在运行且地址正确。' }
  }
}

export function createOpenClawHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const trimmedToken = token.trim()
  if (trimmedToken) {
    headers.Authorization = `Bearer ${trimmedToken}`
  }
  return headers
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
    if (/Unauthorized|401/i.test(error.message)) {
      return '当前 OpenClaw 网关要求 Bearer token。已实测默认 localhost:18789 在无 token 时会返回 401 Unauthorized；如果你使用的是无需鉴权的内网地址，可以留空 token 直接发送。'
    }
    return error.message
  }
  return 'OpenClaw 请求失败，请检查地址、Token 和网络连通性。'
}

export async function requestOpenClawStory(options: OpenClawSettings & { sourceText: string }): Promise<string> {
  const endpoint = normalizeOpenClawEndpoint(options.endpoint)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: createOpenClawHeaders(options.token),
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