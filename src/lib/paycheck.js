import { num, round2 } from './format.js';
import { federalWithholdingAnnual } from './federal.js';
import { ficaPerPeriod } from './fica.js';
import { arizonaA4Check } from './arizona.js';

/**
 * input fields:
 *  payType 'salary'|'hourly', salary, hourlyRate, hoursPerWeek, overtimeHours, annualTips,
 *  frequency, filingStatus ('single'|'married'|'hoh'),
 *  w4Exempt, step2, credits, step4a, step4b, extraFedPerPeriod,
 *  azExempt, a4Rate, extraAzPerPeriod,
 *  k401Percent (0-100), section125PerPeriod, postTaxPerPeriod,
 *  ytdSocialSecurityWages, ytdMedicareWages (optional, leave blank for the average method)
 */
export function calculatePaycheck(raw, tax) {
  const freq = tax.payFrequencies[raw.frequency] ?? tax.payFrequencies.biweekly;
  const periods = freq.periods;
  const status = ['single', 'married', 'hoh'].includes(raw.filingStatus) ? raw.filingStatus : 'single';

  // Annual gross pay (tips are treated as ordinary wages spread evenly)
  let annualBase;
  let annualOvertime = 0;
  if (raw.payType === 'hourly') {
    const rate = num(raw.hourlyRate);
    annualBase = rate * num(raw.hoursPerWeek) * 52;
    annualOvertime = rate * 1.5 * num(raw.overtimeHours) * 52;
  } else {
    annualBase = num(raw.salary);
  }
  const annualTips = num(raw.annualTips);
  const annualGross = annualBase + annualOvertime + annualTips;
  const grossPer = annualGross / periods;

  // Deductions for one paycheck
  const k401Per = Math.min(grossPer, (grossPer * Math.min(num(raw.k401Percent), 100)) / 100);
  const s125Per = Math.min(grossPer - k401Per, num(raw.section125PerPeriod));
  const postTaxPer = num(raw.postTaxPerPeriod);

  const taxableWagesPer = Math.max(0, grossPer - k401Per - s125Per); // federal and Arizona wages
  const ficaWagesPer = Math.max(0, grossPer - s125Per); // 401(k) is still subject to FICA

  // Federal
  const fedAnnual = raw.w4Exempt
    ? 0
    : federalWithholdingAnnual(
        {
          annualWages: taxableWagesPer * periods,
          status,
          step2: Boolean(raw.step2),
          credits: num(raw.credits),
          step4a: num(raw.step4a),
          step4b: num(raw.step4b),
        },
        tax.federal,
      );
  const federalPer = raw.w4Exempt ? 0 : fedAnnual / periods + num(raw.extraFedPerPeriod);

  // Arizona
  const a4Rate = tax.arizona.a4Options.includes(Number(raw.a4Rate)) ? Number(raw.a4Rate) : tax.arizona.defaultA4;
  const azPer = raw.azExempt ? 0 : taxableWagesPer * a4Rate + num(raw.extraAzPerPeriod);

  // FICA
  const f = ficaPerPeriod(
    {
      ficaWagesPerPeriod: ficaWagesPer,
      periods,
      ytdSocialSecurity: raw.ytdSocialSecurityWages,
      ytdMedicare: raw.ytdMedicareWages,
    },
    tax.fica,
  );

  const perPeriod = {
    gross: round2(grossPer),
    k401: round2(k401Per),
    section125: round2(s125Per),
    federal: round2(federalPer),
    socialSecurity: round2(f.socialSecurity),
    medicare: round2(f.medicare),
    additionalMedicare: round2(f.additionalMedicare),
    arizona: round2(azPer),
    postTax: round2(postTaxPer),
  };
  perPeriod.taxes = round2(
    perPeriod.federal + perPeriod.arizona + perPeriod.socialSecurity + perPeriod.medicare + perPeriod.additionalMedicare,
  );
  perPeriod.totalDeductions = round2(perPeriod.taxes + perPeriod.k401 + perPeriod.section125 + perPeriod.postTax);
  perPeriod.net = round2(Math.max(0, perPeriod.gross - perPeriod.totalDeductions));

  const annualNet = round2(perPeriod.net * periods);
  const takeHome = {
    weekly: round2(annualNet / 52),
    biweekly: round2(annualNet / 26),
    semimonthly: round2(annualNet / 24),
    monthly: round2(annualNet / 12),
    annual: annualNet,
  };

  const withheldAnnual = azPer * periods;
  return {
    periods,
    frequencyLabel: freq.label,
    taxYear: tax.year,
    annualGross: round2(annualGross),
    annualOvertime: round2(annualOvertime),
    annualTips: round2(annualTips),
    perPeriod,
    takeHome,
    effectiveTaxRate: perPeriod.gross > 0 ? perPeriod.taxes / perPeriod.gross : 0,
    a4Rate,
    a4Check: raw.azExempt
      ? { status: 'exempt', liability: 0, withheld: 0, difference: 0, suggestedRate: null }
      : arizonaA4Check({ taxableWages: taxableWagesPer * periods, withheld: withheldAnnual, status, az: tax.arizona }),
  };
}
