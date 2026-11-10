import test from 'node:test';
import assert from 'node:assert/strict';
import { STATES } from '../src/data/states.js';
import { readFileSync, existsSync } from 'node:fs';

test('state directory contains all 50 states and the District of Columbia', () => {
  assert.equal(STATES.length, 51);
  assert.equal(new Set(STATES.map((s) => s.slug)).size, 51);
  assert.ok(STATES.some((s) => s.name === 'District of Columbia'));
});

test('every state has a matching calculator page', () => {
  for (const state of STATES) {
    assert.ok(existsSync(`src/pages/${state.slug}-paycheck-calculator.astro`), `${state.name} page missing`);
  }
});

test('tax tools and editorial resources exist', () => {
  for (const slug of ['effective-tax-rate-calculator','overtime-tax-calculator','bonus-tax-calculator','1099-tax-calculator','quarterly-estimated-tax-calculator','tax-withholding-calculator']) {
    assert.ok(existsSync(`src/pages/tax-tools/${slug}.astro`), `${slug} missing`);
  }
  assert.ok(existsSync('src/pages/tax-tools/index.astro'));
  assert.ok(existsSync('src/pages/paycheck-calculators-by-state/index.astro'));
  assert.ok(existsSync('src/content/blog'));
});

test('project source does not contain competitor brand targeting terms', () => {
  const source = readFileSync('src/pages/index.astro', 'utf8') + readFileSync('src/components/Header.astro', 'utf8') + readFileSync('src/components/Footer.astro', 'utf8');
  assert.doesNotMatch(source, /adp|smartasset|netpayplanner/i);
});
