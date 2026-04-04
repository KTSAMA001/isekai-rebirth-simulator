/**
 * 批量迁移脚本：riskCheck → diceCheck
 * 转换公式：DC = 11 + floor(difficulty / 3)
 * 保证属性值=difficulty时约50%成功率（D20+modifier >= DC）
 * 
 * difficulty 7  → DC 13  (童年轻松判定)
 * difficulty 14 → DC 15  (青年普通判定)
 * difficulty 20 → DC 17  (成年困难判定)
 * difficulty 26 → DC 19  (高难度挑战)
 * difficulty 30 → DC 21  (终极挑战)
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { globSync } from 'fs'

const DATA_DIR = join(import.meta.dirname, '..', 'data', 'sword-and-magic', 'events')

// 属性中文名映射，用于生成 description
const ATTR_NAMES = {
  str: '体魄',
  int: '智慧',
  chr: '魅力',
  mag: '魔力',
  spr: '灵魂',
  luk: '运势',
  mny: '家境',
}

function convertDifficulty(difficulty) {
  return 11 + Math.floor(difficulty / 3)
}

// 读取所有事件文件
const files = [
  'birth.json', 'childhood.json', 'teenager.json', 'youth.json',
  'adult.json', 'middle-age.json', 'elder.json'
]

let totalConverted = 0

for (const file of files) {
  const filePath = join(DATA_DIR, file)
  const content = readFileSync(filePath, 'utf-8')
  const events = JSON.parse(content)
  let fileConverted = 0

  for (const event of events) {
    if (!event.branches) continue
    for (const branch of event.branches) {
      if (!branch.riskCheck) continue

      const { attribute, difficulty, scale } = branch.riskCheck
      const dc = convertDifficulty(difficulty)
      const attrName = ATTR_NAMES[attribute] || attribute

      // 添加 diceCheck
      branch.diceCheck = {
        attribute,
        dc,
        description: `${attrName}判定 DC${dc}`
      }

      // 高难度(difficulty >= 26)给予劣势提示感
      // 低难度(difficulty <= 9)不加额外修饰

      // 删除旧的 riskCheck
      delete branch.riskCheck

      fileConverted++
      totalConverted++
    }
  }

  if (fileConverted > 0) {
    writeFileSync(filePath, JSON.stringify(events, null, 2) + '\n', 'utf-8')
    console.log(`${file}: 转换了 ${fileConverted} 个 riskCheck → diceCheck`)
  } else {
    console.log(`${file}: 无需转换`)
  }
}

console.log(`\n总计转换: ${totalConverted} 个分支`)
