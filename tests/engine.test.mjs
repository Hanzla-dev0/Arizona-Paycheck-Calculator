import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePaycheck } from '../src/lib/paycheck.js';
import { federalWithholdingAnnual } from '../src/lib/federal.js';
import { TAX } from '../src/config/tax.js';

const base = {
  payType: 'salary', salary: 52000, frequency: 'biweekly', filingStatus: 'single',
  a4Rate: 0.02,
};

test('single, $52,000 biweekly: hand-checked numbers', () => {
  // Federal: (52,000 - 16,100) = 35,900 -> 10% x 12,400 + 12% x 23,500 = 4,060 / 26 = 156.15
  const r = calculatePaycheck(base, TAX);
  assert.equal(r.perPeriod.gross, 2000);
  assert.equal(r.perPeriod.federal, 156.15);
  assert.equal(r.perPeriod.socialSecurity, 124);
  assert.equal(r.perPeriod.medicare, 29);
  assert.equal(r.perPeriod.arizona, 40);
  assert.equal(r.perPeriod.net, 1650.85);
});

test('IRS table anchors: married standard, income 100,000', () => {
  // Pub 15-T MFJ table: (100,000 - 12,900 = 87,100) -> 2,480 + 12% x (87,100 - 44,100) = 7,640
  assert.equal(Math.round(federalWithholdingAnnual({ annualWages: 100000, status: 'married' }, TAX.federal)), 7640);
});

test('IRS table anchors: married Step 2 checked, income 100,000', () => {
  // Step 2 table: 5,800 + 22% x (100,000 - 66,500) = 13,170
  const v = federalWithholdingAnnual({ annualWages: 100000, status: 'married', step2: true }, TAX.federal);
  assert.equal(Math.round(v), 13170);
});

test('zero and negative inputs are safe', () => {
  const r = calculatePaycheck({ ...base, salary: 0 }, TAX);
  assert.equal(r.perPeriod.net, 0);
  const r2 = calculatePaycheck({ ...base, salary: -5, a4Rate: 'x' }, TAX);
  assert.equal(r2.perPeriod.gross, 0);
});

test('Social Security stops at the wage base', () => {
  const r = calculatePaycheck({ ...base, salary: 300000 }, TAX);
  assert.equal(Math.round(r.perPeriod.socialSecurity * 26), 11439);
});

test('hourly with overtime', () => {
  const r = calculatePaycheck({ payType: 'hourly', hourlyRate: 20, hoursPerWeek: 40, overtimeHours: 5, frequency: 'weekly', filingStatus: 'single' }, TAX);
  assert.equal(r.perPeriod.gross, 950); // 800 + 150
});

test('401(k) lowers income tax but not Social Security', () => {
  const a = calculatePaycheck(base, TAX);
  const b = calculatePaycheck({ ...base, k401Percent: 10 }, TAX);
  assert.ok(b.perPeriod.federal < a.perPeriod.federal);
  assert.equal(b.perPeriod.socialSecurity, a.perPeriod.socialSecurity);
});

test('A-4 check: default 2% under-withholds a high earner and suggests a higher option', () => {
  const r = calculatePaycheck({ ...base, salary: 150000 }, TAX);
  assert.equal(r.a4Check.status, 'under');
  assert.ok(r.a4Check.suggestedRate > 0.02);
  const low = calculatePaycheck({ ...base, salary: 40000 }, TAX);
  assert.equal(low.a4Check.status, 'ok');
});

test('YTD mode: Social Security stops once the yearly limit is reached', () => {
  const r = calculatePaycheck({ ...base, salary: 300000, ytdSocialSecurityWages: 180000 }, TAX);
  // only 4,500 left under the 184,500 limit -> 4,500 x 6.2% = 279.00
  assert.equal(r.perPeriod.socialSecurity, 279);
});

test('YTD mode: extra 0.9% Medicare starts after $200,000', () => {
  const r = calculatePaycheck({ ...base, salary: 300000, ytdMedicareWages: 250000 }, TAX);
  const gross = r.perPeriod.gross;
  assert.equal(r.perPeriod.additionalMedicare, Math.round(gross * 0.009 * 100) / 100);
});

test('exempt switches and tips', () => {
  const a = calculatePaycheck({ ...base, w4Exempt: true, azExempt: true }, TAX);
  assert.equal(a.perPeriod.federal, 0);
  assert.equal(a.perPeriod.arizona, 0);
  const t = calculatePaycheck({ ...base, annualTips: 5200 }, TAX);
  assert.equal(t.perPeriod.gross, 2200);
});


import { validateInput } from '../src/lib/validate.js';

test('validation: rejects negatives, over-168 hours and 401(k) over 100%', () => {
  assert.equal(validateInput({ ...base }).length, 0);
  assert.equal(validateInput({ ...base, salary: -1 }).length, 1);
  assert.equal(validateInput({ ...base, payType: 'hourly', hoursPerWeek: 150, overtimeHours: 30 }).length, 1);
  assert.equal(validateInput({ ...base, k401Percent: 120 }).length, 1);
});

test('head of household and married give less federal tax than single at the same pay', () => {
  const s = calculatePaycheck({ ...base, salary: 80000 }, TAX).perPeriod.federal;
  const h = calculatePaycheck({ ...base, salary: 80000, filingStatus: 'hoh' }, TAX).perPeriod.federal;
  const m = calculatePaycheck({ ...base, salary: 80000, filingStatus: 'married' }, TAX).perPeriod.federal;
  assert.ok(m < h && h < s);
});

test('pay frequency does not change annual take-home (within rounding)', () => {
  const a = calculatePaycheck({ ...base, salary: 70000, frequency: 'weekly' }, TAX).takeHome.annual;
  const b = calculatePaycheck({ ...base, salary: 70000, frequency: 'monthly' }, TAX).takeHome.annual;
  assert.ok(Math.abs(a - b) < 15);
});

test('pre-tax health premium lowers income tax and FICA wages', () => {
  const a = calculatePaycheck(base, TAX).perPeriod;
  const b = calculatePaycheck({ ...base, section125PerPeriod: 100 }, TAX).perPeriod;
  assert.ok(b.federal < a.federal && b.socialSecurity < a.socialSecurity && b.arizona < a.arizona);
});

test('Arizona extra withholding and A-4 rate are applied to taxable wages', () => {
  const r = calculatePaycheck({ ...base, a4Rate: 0.035, extraAzPerPeriod: 10 }, TAX);
  assert.equal(r.perPeriod.arizona, 80); // 2000 x 3.5% + 10
});

test('federal credits reduce withholding and never go below zero', () => {
  const r = calculatePaycheck({ ...base, credits: 100000 }, TAX);
  assert.equal(r.perPeriod.federal, 0);
});
