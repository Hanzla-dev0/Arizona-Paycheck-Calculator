import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTaxTool } from '../src/scripts/tax-tools.js';

test('effective tax rate calculates percentage and handles zero gross income', () => {
  assert.equal(calculateTaxTool('effective', 60000, 9000, 22).display, '15.00%');
  assert.equal(calculateTaxTool('effective', 0, 9000, 22).display, '0.00%');
});

test('overtime calculator estimates gross overtime pay', () => {
  assert.equal(calculateTaxTool('overtime', 25, 10, 1.5).value, 375);
});

test('bonus withholding uses entered percentage', () => {
  assert.equal(calculateTaxTool('bonus', 5000, 0, 22).value, 1100);
});

test('1099 calculator includes simplified SE tax and income reserve', () => {
  assert.ok(calculateTaxTool('1099', 60000, 0, 22).value > 21000);
});

test('quarterly estimate is one quarter of annual reserve', () => {
  assert.equal(calculateTaxTool('quarterly', 80000, 0, 20).value, 4000);
});

test('withholding calculator respects selected pay periods', () => {
  assert.equal(calculateTaxTool('withholding', 52000, 0, 20, 26).value, 400);
});

test('every blog article has frontmatter and is covered by the dynamic blog route', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const dir = new URL('../src/content/blog/', import.meta.url);
  const files = (await readdir(dir)).filter((name) => name.endsWith('.md'));
  assert.ok(files.length >= 5);
  const route = await readFile(new URL('../src/pages/blog/[slug].astro', import.meta.url), 'utf8');
  assert.match(route, /getStaticPaths/);
  assert.match(route, /import\.meta\.glob/);
  for (const file of files) {
    const content = await readFile(new URL(`../src/content/blog/${file}`, import.meta.url), 'utf8');
    assert.match(content, /^---\s*\ntitle:/);
    assert.ok(route.includes("content/blog/*.md"));
  }
});

test('tax tool component selectors match calculator script hooks', async () => {
  const { readFile } = await import('node:fs/promises');
  const component = await readFile(new URL('../src/components/TaxTool.astro', import.meta.url), 'utf8');
  const script = await readFile(new URL('../src/scripts/tax-tools.js', import.meta.url), 'utf8');
  for (const hook of ['data-tool-income', 'data-tool-other', 'data-tool-rate', 'data-tool-periods', 'data-tool-result', 'data-tool-note', 'data-tool-calc']) {
    assert.ok(component.includes(hook), `component missing ${hook}`);
    assert.ok(script.includes(hook), `script missing ${hook}`);
  }
});

test('salary-to-hourly calculator converts annual salary to hourly equivalent', () => {
  assert.equal(calculateTaxTool('salary-hourly', 52000, 40, 52).value, 25);
});

test('pay raise calculator returns annual raise amount', () => {
  assert.equal(calculateTaxTool('raise', 60000, 5, 0).value, 3000);
});

test('paycheck frequency calculator estimates net per selected period', () => {
  assert.equal(calculateTaxTool('frequency', 52000, 0, 20, 26).value, 1600);
});
