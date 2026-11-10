// Checks the form values before calculating. Returns a list of plain-English problems (empty = OK).
import { num } from './format.js';

const NUMBER_FIELDS = {
  salary: 'Annual salary', hourlyRate: 'Hourly rate', hoursPerWeek: 'Hours per week',
  overtimeHours: 'Overtime hours', annualTips: 'Tips', k401Percent: '401(k) percent',
  section125PerPeriod: 'Pre-tax health amount', postTaxPerPeriod: 'After-tax deductions',
  credits: 'W-4 Step 3 credits', step4a: 'W-4 Step 4(a)', step4b: 'W-4 Step 4(b)',
  extraFedPerPeriod: 'Extra federal withholding', extraAzPerPeriod: 'Extra Arizona withholding',
  ytdSocialSecurityWages: 'Social Security wages so far', ytdMedicareWages: 'Medicare wages so far',
};

export function validateInput(raw) {
  const problems = [];
  for (const [key, label] of Object.entries(NUMBER_FIELDS)) {
    const v = raw[key];
    if (v === undefined || v === null || v === '') continue;
    const n = Number(String(v).replace(/,/g, ''));
    if (!Number.isFinite(n) || n < 0) problems.push(`${label} must be a number that is zero or more.`);
  }
  if (num(raw.k401Percent) > 100) problems.push('401(k) percent cannot be more than 100.');
  if (raw.payType === 'hourly' && num(raw.hoursPerWeek) + num(raw.overtimeHours) > 168) {
    problems.push('Regular plus overtime hours cannot be more than 168 per week.');
  }
  return problems;
}
