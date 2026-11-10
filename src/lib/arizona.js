// Arizona income tax WITHHOLDING (what the employer takes from each check).
// It is the Form A-4 percentage times gross taxable wages. It is NOT the same as the
// state tax you owe at filing time (2.5% flat after the standard deduction).

export function arizonaWithholdingAnnual({ taxableWages, a4Rate, extraPerPeriod = 0, periods }) {
  return taxableWages * a4Rate + extraPerPeriod * periods;
}

// "Will I owe at tax time?" check. Compares annual withholding to an estimate of annual liability.
export function arizonaA4Check({ taxableWages, withheld, status, az }) {
  const std = az.standardDeduction[status];
  const liability = Math.max(0, taxableWages - std) * az.flatRate;
  const difference = withheld - liability; // negative = under-withheld

  let suggestedRate = null;
  if (difference < -0.5) {
    suggestedRate = az.a4Options.find((r) => taxableWages * r >= liability) ?? null;
  }
  return {
    liability,
    withheld,
    difference,
    status: difference < -0.5 ? 'under' : 'ok',
    suggestedRate,
  };
}
