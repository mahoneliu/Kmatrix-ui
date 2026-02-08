/* eslint-disable */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../');
const sourceDirs = [path.join(rootDir, 'apps'), path.join(rootDir, 'packages')];

// Regex to find 'prefix:name' or "prefix:name"
const iconRegex = /['"]([a-z0-9-]+:[a-z0-9-]+)['"]/g;

const foundIcons = new Set();
const usages = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
      scanDir(fullPath);
    } else if (file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let match;
  while ((match = iconRegex.exec(content)) !== null) {
    const icon = match[1];
    if (icon.startsWith('http') || icon.includes('localhost')) continue;

    // Check for valid prefix (usually 2-15 chars, lowercase)
    const parts = icon.split(':');
    if (parts.length !== 2) continue;
    const [prefix, name] = parts;

    if (prefix.length < 2 || prefix.length > 20) continue;

    foundIcons.add(icon);
    usages.push({
      file: filePath,
      icon,
      index: match.index
    });
  }
}

sourceDirs.forEach(dir => scanDir(dir));

const reportPath = path.join(rootDir, 'icons_report.json');
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      icons: [...foundIcons].sort(),
      usages
    },
    null,
    2
  ),
  'utf-8'
);

console.log(`Report written to ${reportPath}`);
