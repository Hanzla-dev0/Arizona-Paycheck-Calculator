// Social Security and Medicare.
// Two modes:
//  - Average mode (no year-to-date wages given): annualized, so a high earner's yearly cap is spread evenly.
//  - Paycheck mode (year-to-date wages given): works out ONE paycheck the way payroll does,
//    stopping Social Security once the yearly limit is reached and adding 0.9% Medicare after $200,000.
const isNum = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

export function ficaPerPeriod({ ficaWagesPerPeriod, periods, ytdSocialSecurity, ytdMedicare }, fica) {
  const wages = ficaWagesPerPeriod;

  // Social Security
  let ssWages;
  if (isNum(ytdSocialSecurity)) {
    ssWages = Math.min(wages, Math.max(0, fica.socialSecurityWageBase - Number(ytdSocialSecurity)));
  } else {
    ssWages = Math.min(wages * periods, fica.socialSecurityWageBase) / periods;
  }

  // Additional Medicare (0.9% over the threshold)
  let extraWages;
  if (isNum(ytdMedicare)) {
    const y = Number(ytdMedicare);
    extraWages = Math.max(0, y + wages - fica.additionalMedicareThreshold) - Math.max(0, y - fica.additionalMedicareThreshold);
  } else {
    extraWages = Math.max(0, wages * periods - fica.additionalMedicareThreshold) / periods;
  }

  return {
    socialSecurity: ssWages * fica.socialSecurityRate,
    medicare: wages * fica.medicareRate,
    additionalMedicare: extraWages * fica.additionalMedicareRate,
  };
}
