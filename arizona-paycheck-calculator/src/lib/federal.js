// Federal income tax withholding, IRS Pub. 15-T Worksheet 1A (percentage method, 2020+ Form W-4).
// Returns the ANNUAL withholding. Divide by pay periods for one paycheck.

export function federalWithholdingAnnual(input, fed) {
  const { annualWages, status, step2 = false, credits = 0, step4a = 0, step4b = 0 } = input;
  const std = fed.standardDeduction[status];
  const line1g = step2 ? 0 : fed.line1g[status];
  const divisor = step2 ? 2 : 1; // Step 2 box checked: tables use half the amounts
  const zeroLimit = std / divisor - line1g;

  const adjusted = Math.max(0, annualWages + step4a - step4b - line1g);
  const taxable = adjusted - zeroLimit;
  if (taxable <= 0) return 0;

  let tax = 0;
  let lower = 0;
  for (const [top, rate] of fed.brackets[status]) {
    const upper = top / divisor;
    if (taxable > lower) tax += (Math.min(taxable, upper) - lower) * rate;
    if (taxable <= upper) break;
    lower = upper;
  }
  return Math.max(0, tax - credits);
}
