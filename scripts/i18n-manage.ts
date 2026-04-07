/* eslint-disable */
/**
 * i18n-manage — KMatrix 多语言管理工具
 *
 * 用法（在 kmatrix-ui 目录下执行）：
 *   pnpm i18n:manage search <query> [--app=admin|chat] [--lang=zh-cn|en-us]
 *   pnpm i18n:manage get <key>       [--app=admin|chat] [--lang=zh-cn|en-us]
 *   pnpm i18n:manage add <key> <zh值> [--app=admin|chat]
 *   pnpm i18n:manage sync            [--app=admin|chat]
 *   pnpm i18n:manage check           [--app=admin|chat]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

// ─── 路径解析 ────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 脚本在 kmatrix-ui/scripts/，ROOT_DIR 指向 kmatrix-ui/
const ROOT_DIR = path.resolve(__dirname, '..');

// ─── 工具函数 ────────────────────────────────────────────────────────────────

/** 将嵌套对象展平为 "a.b.c" -> "value" 的映射 */
function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullPath));
    } else {
      result[fullPath] = String(value ?? '');
    }
  }
  return result;
}

/** 按点路径深度设置值，不存在的中间节点自动创建 */
function setDeep(obj: Record<string, any>, keyPath: string, value: any): void {
  const keys = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

/** 按点路径深度获取值 */
function getDeep(obj: Record<string, any>, keyPath: string): any {
  return keyPath.split('.').reduce((cur, k) => (cur && typeof cur === 'object' ? cur[k] : undefined), obj);
}

/**
 * 解析 TS 语言包文件。
 * 使用动态 import 直接加载 TS 文件（tsx 运行时支持），最可靠。
 * 加时间戳 query 参数避免模块缓存。
 */
async function parseLocaleFile(filePath: string): Promise<Record<string, any>> {
  try {
    const url = `file:///${filePath.replace(/\\/g, '/')}?t=${Date.now()}`;
    const mod = await import(url);
    return mod.default as Record<string, any>;
  } catch (e) {
    console.error(`❌ 解析文件失败: ${filePath}`);
    console.error(e);
    process.exit(1);
  }
}

/**
 * 将对象序列化为不带引号 key 的 TS 对象字面量字符串。
 * 输出格式与原始语言包文件一致：key 不加引号，字符串值用单引号。
 */
function serializeObject(obj: Record<string, any>, indent = 2): string {
  const pad = (n: number) => ' '.repeat(n);

  function stringify(val: any, depth: number): string {
    if (val === null) return 'null';
    if (typeof val === 'boolean' || typeof val === 'number') return String(val);
    if (typeof val === 'string') {
      // 用单引号，转义反斜杠、单引号和换行符
      const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      return `'${escaped}'`;
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      const items = val.map(v => `${pad(depth + indent)}${stringify(v, depth + indent)}`);
      return `[\n${items.join(',\n')}\n${pad(depth)}]`;
    }
    if (typeof val === 'object') {
      const entries = Object.entries(val);
      if (entries.length === 0) return '{}';
      const lines = entries.map(([k, v]) => {
        // key 只有在包含特殊字符时才加引号
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`;
        return `${pad(depth + indent)}${safeKey}: ${stringify(v, depth + indent)}`;
      });
      return `{\n${lines.join(',\n')}\n${pad(depth)}}`;
    }
    return String(val);
  }

  return stringify(obj, 0);
}

/**
 * 将对象序列化回 TS 语言包文件格式。
 * 保持与原文件一致的格式：key 不带引号，字符串值用单引号。
 */
function serializeLocaleFile(obj: Record<string, any>): string {
  return `const local: App.I18n.Schema = ${serializeObject(obj)};\n\nexport default local;\n`;
}

// ─── 路径解析辅助 ────────────────────────────────────────────────────────────

function getLocalePaths(app: string) {
  const dir = path.resolve(ROOT_DIR, 'apps', app, 'src/locales/langs');
  if (!fs.existsSync(dir)) {
    console.error(`❌ 找不到语言包目录: ${dir}`);
    process.exit(1);
  }
  return {
    dir,
    zh: path.join(dir, 'zh-cn.ts'),
    en: path.join(dir, 'en-us.ts')
  };
}

// ─── 命令实现 ────────────────────────────────────────────────────────────────

async function cmdSearch(query: string, app: string, lang: string) {
  const { dir } = getLocalePaths(app);
  const filePath = path.join(dir, `${lang}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }

  const obj = await parseLocaleFile(filePath);
  const flat = flatten(obj);
  const lowerQuery = query.toLowerCase();

  const results = Object.entries(flat).filter(
    ([k, v]) => k.toLowerCase().includes(lowerQuery) || v.toLowerCase().includes(lowerQuery)
  );

  if (results.length === 0) {
    console.log(`🔍 未找到包含 "${query}" 的结果`);
  } else {
    console.log(`🔍 找到 ${results.length} 条结果（app=${app}, lang=${lang}）：\n`);
    results.forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  }
}

async function cmdGet(key: string, app: string, lang: string) {
  const { dir } = getLocalePaths(app);
  const filePath = path.join(dir, `${lang}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }

  const obj = await parseLocaleFile(filePath);
  const value = getDeep(obj, key);

  if (value === undefined) {
    console.log(`❌ Key 不存在: ${key}`);
  } else if (typeof value === 'object') {
    console.log(`📦 ${key} (对象节点):`);
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

async function cmdAdd(key: string, zhValue: string, app: string) {
  const { zh, en } = getLocalePaths(app);

  for (const [lang, filePath] of [
    ['zh-cn', zh],
    ['en-us', en]
  ] as const) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  跳过不存在的文件: ${filePath}`);
      continue;
    }
    const obj = await parseLocaleFile(filePath);
    const existing = getDeep(obj, key);

    if (existing !== undefined) {
      console.log(`⏭️  ${lang}: Key 已存在，跳过 → ${key}: ${existing}`);
      continue;
    }

    const value = lang === 'zh-cn' ? zhValue : `[TODO] ${zhValue}`;
    setDeep(obj, key, value);
    fs.writeFileSync(filePath, serializeLocaleFile(obj), 'utf8');
    console.log(`✅ ${lang}: 已添加 ${key} = "${value}"`);
  }
}

async function cmdRemove(key: string, app: string) {
  const { zh, en } = getLocalePaths(app);

  for (const [lang, filePath] of [
    ['zh-cn', zh],
    ['en-us', en]
  ] as const) {
    if (!fs.existsSync(filePath)) continue;
    const obj = await parseLocaleFile(filePath);
    const existing = getDeep(obj, key);

    if (existing === undefined) {
      console.log(`⏭️  ${lang}: Key 不存在，跳过 → ${key}`);
      continue;
    }

    const keys = key.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      cur = cur[keys[i]];
      if (!cur) break;
    }
    if (cur) delete cur[keys[keys.length - 1]];

    fs.writeFileSync(filePath, serializeLocaleFile(obj), 'utf8');
    console.log(`✅ ${lang}: 已删除 ${key}`);
  }
}

async function cmdSync(app: string) {
  const { zh, en } = getLocalePaths(app);

  if (!fs.existsSync(zh) || !fs.existsSync(en)) {
    console.error('❌ zh-cn.ts 或 en-us.ts 不存在');
    process.exit(1);
  }

  const zhObj = await parseLocaleFile(zh);
  const enObj = await parseLocaleFile(en);
  const zhFlat = flatten(zhObj);
  const enFlat = flatten(enObj);

  const missing: string[] = [];
  for (const [k, v] of Object.entries(zhFlat)) {
    if (!(k in enFlat)) {
      setDeep(enObj, k, `[TODO] ${v}`);
      missing.push(k);
    }
  }

  if (missing.length === 0) {
    console.log('✅ 所有 Key 已同步，无需更新');
  } else {
    fs.writeFileSync(en, serializeLocaleFile(enObj), 'utf8');
    console.log(`✅ 已同步 ${missing.length} 个缺失 Key 到 en-us.ts：`);
    missing.forEach(k => console.log(`  + ${k}`));
  }
}

async function cmdCheck(app: string) {
  const { zh, en } = getLocalePaths(app);

  if (!fs.existsSync(zh) || !fs.existsSync(en)) {
    console.error('❌ zh-cn.ts 或 en-us.ts 不存在');
    process.exit(1);
  }

  const zhFlat = flatten(await parseLocaleFile(zh));
  const enFlat = flatten(await parseLocaleFile(en));

  const missingInEn = Object.keys(zhFlat).filter(k => !(k in enFlat));
  const missingInZh = Object.keys(enFlat).filter(k => !(k in zhFlat));
  const todoInEn = Object.entries(enFlat).filter(([, v]) => v.startsWith('[TODO]'));

  console.log(`\n📊 i18n 检查报告 (app=${app})\n`);
  console.log(`  zh-cn Key 总数: ${Object.keys(zhFlat).length}`);
  console.log(`  en-us Key 总数: ${Object.keys(enFlat).length}`);

  if (missingInEn.length > 0) {
    console.log(`\n⚠️  en-us 缺少 ${missingInEn.length} 个 Key：`);
    missingInEn.forEach(k => console.log(`  - ${k}`));
  }

  if (missingInZh.length > 0) {
    console.log(`\n⚠️  zh-cn 缺少 ${missingInZh.length} 个 Key（en-us 多余）：`);
    missingInZh.forEach(k => console.log(`  - ${k}`));
  }

  if (todoInEn.length > 0) {
    console.log(`\n📝 en-us 中有 ${todoInEn.length} 个待翻译 [TODO] Key：`);
    todoInEn.forEach(([k, v]) => console.log(`  - ${k}: ${v}`));
  }

  if (missingInEn.length === 0 && missingInZh.length === 0 && todoInEn.length === 0) {
    console.log('\n✅ 所有语言包完全同步，无待翻译项');
  }
}

// ─── 入口 ────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
KMatrix i18n 管理工具

用法:
  pnpm i18n:manage <命令> [参数] [选项]

命令:
  search <query>        搜索包含关键词的 Key 或值（支持中英文）
  get    <key>          获取指定 Key 的翻译内容
  add    <key> <zh值>   新增一个 Key（自动在 en-us 添加 [TODO] 占位）
  remove <key>          删除一个 Key（同时从 zh-cn 和 en-us 删除）
  sync                  将 zh-cn 中缺失的 Key 同步到 en-us（标记 [TODO]）
  check                 检查两个语言包的差异和待翻译项

选项:
  --app=admin|chat      指定应用（默认: admin）
  --lang=zh-cn|en-us    指定语言（仅 search/get 命令有效，默认: zh-cn）

示例:
  pnpm i18n:manage search "模型"
  pnpm i18n:manage search "History" --app=chat --lang=en-us
  pnpm i18n:manage get common.add
  pnpm i18n:manage add ai.workflow.new_node "新节点" --app=admin
  pnpm i18n:manage sync --app=chat
  pnpm i18n:manage check
`);
}

async function main() {
  const args = process.argv.slice(2);
  const [command, ...rest] = args;

  const app = args.find(a => a.startsWith('--app='))?.split('=')[1] ?? 'admin';
  const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1] ?? 'zh-cn';
  // 过滤掉 --xxx 选项，只保留位置参数
  const positional = rest.filter(a => !a.startsWith('--'));

  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  switch (command) {
    case 'search': {
      const query = positional[0];
      if (!query) {
        console.error('❌ 请提供搜索关键词');
        process.exit(1);
      }
      await cmdSearch(query, app, lang);
      break;
    }
    case 'get': {
      const key = positional[0];
      if (!key) {
        console.error('❌ 请提供 Key 路径');
        process.exit(1);
      }
      await cmdGet(key, app, lang);
      break;
    }
    case 'add': {
      const [key, value] = positional;
      if (!key || !value) {
        console.error('❌ 用法: add <key> <zh值>');
        process.exit(1);
      }
      await cmdAdd(key, value, app);
      break;
    }
    case 'remove': {
      const key = positional[0];
      if (!key) {
        console.error('❌ 请提供 Key 路径');
        process.exit(1);
      }
      await cmdRemove(key, app);
      break;
    }
    case 'sync':
      await cmdSync(app);
      break;
    case 'check':
      await cmdCheck(app);
      break;
    default:
      console.error(`❌ 未知命令: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
