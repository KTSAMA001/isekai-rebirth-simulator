/**
 * B阶段验证脚本：用 AJV 校验所有事件数据 JSON 文件
 * 与 data-loader.ts 使用相同的方式：内联 schema + shared.json definitions
 */
import Ajv from 'ajv';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// 读取 shared definitions（和 data-loader.ts 一样）
const sharedPath = join(ROOT, 'src/worlds/sword-and-magic/schemas/shared.json');
const sharedDefs = JSON.parse(readFileSync(sharedPath, 'utf-8'));

// 内联 event schema（与 data-loader.ts 完全一致）
const eventSchema = {
  type: 'object',
  required: ['id', 'title', 'description', 'minAge', 'maxAge', 'weight', 'effects'],
  additionalProperties: true,
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    minAge: { type: 'integer', minimum: 0, maximum: 100 },
    maxAge: { type: 'integer', minimum: 0, maximum: 100 },
    weight: { type: 'number', minimum: 0 },
    include: { type: 'string' },
    exclude: { type: 'string' },
    effects: { type: 'array', items: { $ref: '#/definitions/EventEffect' } },
    branches: { type: 'array', items: { $ref: '#/definitions/EventBranch' } },
    isBad: { type: 'boolean' },
    tag: { type: 'string' },
    unique: { type: 'boolean' },
    priority: { enum: ['critical', 'major', 'minor'] },
    prerequisites: { type: 'array', items: { type: 'string' } },
    mutuallyExclusive: { type: 'array', items: { type: 'string' } },
    weightModifiers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['condition', 'weightMultiplier'],
        additionalProperties: true,
        properties: {
          condition: { type: 'string' },
          weightMultiplier: { type: 'number', minimum: 0, maximum: 10 },
        },
      },
    },
    routes: { type: 'array', items: { type: 'string' } },
    routeMode: { type: 'string', enum: ['any', 'all'] },
  },
  definitions: sharedDefs,
};

// 构建 AJV（和 data-loader.ts 一致）
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(eventSchema);

// 遍历事件文件
const eventsDir = join(ROOT, 'data/sword-and-magic/events');
const files = readdirSync(eventsDir).filter(f => f.endsWith('.json')).sort();

let totalErrors = 0;
let totalEvents = 0;

for (const file of files) {
  const fpath = join(eventsDir, file);
  const data = JSON.parse(readFileSync(fpath, 'utf-8'));
  totalEvents += data.length;
  
  // 逐条验证（和 data-loader.ts 一样）
  let fileErrors = 0;
  for (let i = 0; i < data.length; i++) {
    const valid = validate(data[i]);
    if (!valid) {
      if (fileErrors === 0) console.error(`\n❌ ${file}:`);
      for (const err of validate.errors) {
        console.error(`   [${i}] ${data[i].id}${err.instancePath}: ${err.message}`);
        if (err.params?.additionalProperty) {
          console.error(`         额外属性: ${err.params.additionalProperty}`);
        }
        fileErrors++;
      }
    }
  }
  
  if (fileErrors === 0) {
    console.log(`✅ ${file}: ${data.length} 个事件通过验证`);
  } else {
    console.error(`   ${file}: ${fileErrors} 个 schema 错误`);
  }
  totalErrors += fileErrors;
}

console.log(`\n总计: ${totalEvents} 个事件，${totalErrors} 个 schema 错误`);
process.exit(totalErrors > 0 ? 1 : 0);
