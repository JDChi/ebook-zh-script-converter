import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
globalThis.document = { baseURI: pathToFileURL(join(root, 'public/')).href };
const { createTextConverter } = await import('../src/converter.ts');

const routes = [
  ['hans', 't', '头发里面的软件', '頭髮裏面的軟件'],
  ['t', 'hans', '頭髮裏面的軟件', '头发里面的软件'],
  ['hans', 'tw', '头发里面的软件', '頭髮裡面的軟體'],
  ['hans', 'hk', '头发里面的软件', '頭髮裏面的軟件'],
  ['tw', 'hans', '頭髮裡面的軟體', '头发里面的软件'],
  ['hk', 'hans', '頭髮裏面的軟件', '头发里面的软件'],
];

for (const [source, target, input, expected] of routes) {
  test(`${source} → ${target}`, async () => {
    const convert = await createTextConverter(source, target);
    assert.equal(await convert(input), expected);
  });
}

test('no region uses generic conversion while Taiwan includes regional phrases', async () => {
  assert.equal(await (await createTextConverter('hans', 't'))('软件'), '軟件');
  assert.equal(await (await createTextConverter('hans', 'tw'))('软件'), '軟體');
});
