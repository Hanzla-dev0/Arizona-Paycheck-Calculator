const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);

export function calculateTaxTool(kind, income, other, rawRate, periods = 26) {
  income = Math.max(0, Number(income) || 0);
  other = Math.max(0, Number(other) || 0);
  rawRate = Number(rawRate) || 0;
  periods = Math.max(1, Number(periods) || 1);
  let value = 0;
  let explanation = '';
  if (kind === 'effective') {
    value = income > 0 ? other / income * 100 : 0;
    explanation = income > 0 ? `Your estimated taxes are ${value.toFixed(2)}% of gross income.` : 'Enter gross income greater than zero to calculate an effective tax rate.';
    return { value, display: `${value.toFixed(2)}%`, explanation };
  }
  if (kind === 'salary-hourly') {
    const hours = Math.min(168, Math.max(1, other || 40));
    const weeks = Math.min(52, Math.max(1, rawRate || 52));
    value = income / (hours * weeks);
    explanation = `Based on ${hours} work hours per week and ${weeks} paid weeks per year. Actual hourly equivalent changes with unpaid leave, bonuses and variable schedules.`;
    return { value, display: `${money(value)} / hour`, explanation };
  } else if (kind === 'raise') {
    const increase = income * Math.min(100, Math.max(0, other)) / 100;
    value = increase;
    explanation = `Your estimated new annual salary is ${money(income + increase)}. Monthly increase: ${money(increase / 12)}; biweekly increase: ${money(increase / 26)} before taxes and deductions.`;
  } else if (kind === 'frequency') {
    const rate = Math.min(100, Math.max(0, rawRate)) / 100;
    const gross = income / periods;
    value = gross * (1 - rate);
    explanation = `Estimated gross per paycheck: ${money(gross)}. Estimated withholding at ${ (rate * 100).toFixed(1) }%: ${money(gross * rate)}. This is a flat-rate planning estimate, not payroll withholding.`;
  } else if (kind === 'overtime') {
    const multiplier = Math.min(3, Math.max(1, rawRate || 1.5));
    value = income * other * multiplier;
    explanation = `Estimated gross overtime pay: ${money(income)} × ${other.toLocaleString('en-US')} hours × ${multiplier.toFixed(2)}. This does not determine overtime eligibility or tax withholding.`;
  } else if (kind === 'bonus') {
    const rate = Math.min(100, Math.max(0, rawRate)) / 100;
    value = income * rate;
    explanation = `Estimated withholding is ${money(value)}. Estimated bonus after this withholding only: ${money(income - value)}. Actual withholding method may differ.`;
  } else if (kind === '1099') {
    const net = income + other;
    const seTax = net * 0.9235 * 0.153;
    const incomeReserve = net * Math.min(100, Math.max(0, rawRate)) / 100;
    value = seTax + incomeReserve;
    explanation = `Illustrative reserve: ${money(seTax)} self-employment tax plus ${money(incomeReserve)} income-tax reserve. Wage-base coordination, deductions, credits and Additional Medicare Tax are not fully modeled.`;
  } else if (kind === 'quarterly') {
    const annualTax = (income + other) * Math.min(100, Math.max(0, rawRate)) / 100;
    value = annualTax / 4;
    explanation = `Annualized reserve: ${money(annualTax)}; one-fourth is ${money(value)}. IRS safe-harbor rules, payment dates and credits are not modeled.`;
  } else {
    const annualTax = income * Math.min(100, Math.max(0, rawRate)) / 100;
    value = annualTax / periods;
    explanation = `Estimated annual withholding: ${money(annualTax)} across ${periods} pay periods, or ${money(value)} per paycheck.`;
  }
  return { value, display: money(value), explanation };
}

export function initTaxTools() {
  document.querySelectorAll('[data-tax-tool]').forEach((root) => {
    if (root.dataset.initialized === 'true') return;
    root.dataset.initialized = 'true';
    const result = root.querySelector('[data-tool-result]');
    const note = root.querySelector('[data-tool-note]');
    const calculate = () => {
      const read = (selector, fallback = 0) => {
        const value = Number(root.querySelector(selector)?.value);
        return Number.isFinite(value) ? value : fallback;
      };
      const output = calculateTaxTool(root.dataset.taxTool, read('[data-tool-income]'), read('[data-tool-other]'), read('[data-tool-rate]', 22), read('[data-tool-periods]', 26));
      result.textContent = output.display;
      note.textContent = output.explanation;
    };
    root.querySelector('[data-tool-calc]')?.addEventListener('click', calculate);
    root.addEventListener('input', calculate);
    root.addEventListener('change', calculate);
    calculate();
  });
}
