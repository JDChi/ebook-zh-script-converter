import { cp, mkdir, readFile, rm, copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules/opencc-wasm/dist');
const target = join(root, 'public/vendor/opencc-wasm');
const configs = [
  's2t', 't2s', 's2twp', 's2hk', 'tw2sp', 'hk2s',
];

await rm(target, { recursive: true, force: true });
await mkdir(join(target, 'esm'), { recursive: true });
await mkdir(join(target, 'data/config'), { recursive: true });

for (const name of ['index.js', 'opencc-wasm.js', 'opencc-wasm.wasm']) {
  await copyFile(join(source, 'esm', name), join(target, 'esm', name));
}

const dictionaries = new Set();
function collectFiles(value) {
  if (Array.isArray(value)) {
    value.forEach(collectFiles);
  } else if (value && typeof value === 'object') {
    if (typeof value.file === 'string' && value.file.endsWith('.ocd2')) {
      dictionaries.add(value.file);
    }
    Object.values(value).forEach(collectFiles);
  }
}

for (const name of configs) {
  const filename = `${name}.json`;
  const content = await readFile(join(source, 'data/config', filename), 'utf8');
  collectFiles(JSON.parse(content));
  await copyFile(join(source, 'data/config', filename), join(target, 'data/config', filename));
}

for (const filename of dictionaries) {
  const destination = join(target, 'data/dict', filename);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(source, 'data/dict', filename), destination);
}

await cp(join(root, 'node_modules/opencc-wasm/LICENSE'), join(target, 'LICENSE'));
await cp(join(root, 'node_modules/opencc-wasm/NOTICE'), join(target, 'NOTICE'));
console.log(`Prepared OpenCC WASM: ${configs.length} configurations, ${dictionaries.size} dictionaries.`);
