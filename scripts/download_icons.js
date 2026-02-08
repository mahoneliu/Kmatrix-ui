/* eslint-disable */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');
const reportPath = path.join(rootDir, 'icons_report.json');
const saveDir = path.join(rootDir, 'packages/materials/src/assets/svg-icon');

if (!fs.existsSync(reportPath)) {
  console.error('icons_report.json not found. Run extract_icons.js first.');
  process.exit(1);
}

if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
const icons = report.icons;

console.log(`Found ${icons.length} unique icons.`);

function downloadIcon(iconName) {
  return new Promise((resolve, reject) => {
    // iconName is prefix:name
    const [prefix, name] = iconName.split(':');
    const fileName = `${prefix}-${name}.svg`;
    const dest = path.join(saveDir, fileName);

    if (fs.existsSync(dest)) {
      // console.log(`Skipping ${iconName} (already exists)`);
      resolve(false);
      return;
    }

    const url = `https://api.iconify.design/${prefix}/${name}.svg`;

    https
      .get(url, res => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${iconName} -> ${fileName}`);
          resolve(true);
        });

        file.on('error', err => {
          fs.unlink(dest, () => { });
          reject(err);
        });
      })
      .on('error', err => {
        reject(err);
      });
  });
}

async function processIcons() {
  let downloadedCount = 0;
  // create batches
  const batchSize = 10;
  for (let i = 0; i < icons.length; i += batchSize) {
    const batch = icons.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(icon => downloadIcon(icon)));

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value) downloadedCount++;
      } else {
        console.error(`Error downloading ${batch[index]}:`, result.reason.message);
      }
    });
  }
  console.log(`Download complete. New icons: ${downloadedCount}`);
}

processIcons();
