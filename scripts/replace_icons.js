/* eslint-disable */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

const sourceDirs = [path.join(rootDir, 'apps'), path.join(rootDir, 'packages')];

let changedFiles = 0;
let totalReplacements = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'scripts') continue;
      scanDir(fullPath);
    } else if (file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // 1. Replace usages in templates: icon="prefix:name" -> local-icon="prefix-name"
  // Covers: icon="mdi:home", icon='mdi:home'
  content = content.replace(/(?:\b|:)icon=(["'])([a-z0-9-]+):([a-z0-9-]+)\1/g, (match, quote, prefix, name) => {
    // If it was bound (:icon), stay bound (:local-icon). If static (icon), stay static (local-icon).
    // match starts with 'icon=' or ':icon='.
    const isBound = match.startsWith(':');
    const attr = isBound ? ':local-icon' : 'local-icon';
    return `${attr}=${quote}${prefix}-${name}${quote}`;
  });

  // 2. Replace usages in JS/TS objects: icon: 'prefix:name' -> localIcon: 'prefix-name'
  // Covers: icon: 'mdi:home', icon: "mdi:home"
  // Be careful not to replace things that are not keys (e.g. inside a string).
  // This regex looks for key 'icon' followed by colon and string.
  content = content.replace(/\bicon:\s*(["'])([a-z0-9-]+):([a-z0-9-]+)\1/g, (match, quote, prefix, name) => {
    if (prefix === 'node') return match; // skip node:path etc.
    return `localIcon: ${quote}${prefix}-${name}${quote}`;
  });

  // 3. Special case: Bound icon with single quotes inside double quotes?
  // :icon="'mdi:home'"
  content = content.replace(/:icon=(["'])'([a-z0-9-]+):([a-z0-9-]+)'\1/g, (match, quote, prefix, name) => {
    // :icon="'mdi:home'" -> :local-icon="'mdi-home'"
    return `:local-icon=${quote}'${prefix}-${name}'${quote}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    changedFiles++;
    // rough count
    const replacements =
      originalContent.length -
      content.length +
      (content.split('local-icon').length - originalContent.split('local-icon').length); // inaccurate but non-zero
    totalReplacements++;
    console.log(`Modified: ${filePath}`);
  }
}

sourceDirs.forEach(dir => scanDir(dir));
console.log(`Replacement complete. Modified ${changedFiles} files.`);
