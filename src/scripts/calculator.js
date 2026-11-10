import { calculatePaycheck } from '../lib/paycheck.js';
import { money, percent } from '../lib/format.js';
import { validateInput } from '../lib/validate.js';
import { TAX } from '../config/tax.js';

export function initCalculator() {
  const root = document.getElementById('calc');
  const form = document.getElementById('calc-form');
  if (!root || !form) return;

  const read = () => {
    const fd = new FormData(form);
    const o = Object.fromEntries(fd.entries());
    o.step2 = form.elements.step2.checked;
    o.w4Exempt = form.elements.w4Exempt.checked;
    o.azExempt = form.elements.azExempt.checked;
    o.a4Rate = parseFloat(o.a4Rate);
    return o;
  };

  const setText = (key, value) => {
    root.querySelectorAll(`[data-out="${key}"]`).forEach((el) => { el.textContent = value; });
  };

  const toggleFields = () => {
    const type = form.elements.payType.value;
    root.querySelectorAll('[data-show]').forEach((el) => {
      el.classList.toggle('hidden', el.dataset.show !== type);
    });
  };

  const render = () => {
    toggleFields();
    const input = read();
    const errBox = document.getElementById('calc-error');
    const problems = validateInput(input);
    if (errBox) {
      errBox.textContent = problems.join(' ');
      errBox.classList.toggle('hidden', problems.length === 0);
    }
    if (problems.length) return; // keep the last good result on screen
    const r = calculatePaycheck(input, TAX);
    const p = r.perPeriod;
    setText('freqLabel', r.frequencyLabel.toLowerCase());
    setText('effRate', percent(r.effectiveTaxRate));
    ['gross', 'federal', 'arizona', 'socialSecurity', 'medicare', 'additionalMedicare', 'k401', 'section125', 'postTax', 'totalDeductions', 'net']
      .forEach((k) => setText(k, money(p[k])));
    setText('net2', money(p.net));
    Object.entries(r.takeHome).forEach(([k, v]) => setText(`th-${k}`, money(v)));

    const g = p.gross || 1;
    const widths = {
      net: p.net, federal: p.federal, arizona: p.arizona,
      fica: p.socialSecurity + p.medicare + p.additionalMedicare, other: p.k401 + p.section125 + p.postTax,
    };
    root.querySelectorAll('[data-bar]').forEach((el) => {
      el.style.width = `${Math.max(0, (widths[el.dataset.bar] / g) * 100).toFixed(2)}%`;
    });

    const amRow = root.querySelector('[data-row="additionalMedicare"]');
    if (amRow) amRow.classList.toggle('hidden', p.additionalMedicare <= 0);

    const note = document.getElementById('a4-note');
    const c = r.a4Check;
    if (p.gross > 0 && c.status !== 'exempt') {
      note.classList.remove('hidden', 'ok');
      if (c.status === 'under') {
        const tip = c.suggestedRate
          ? ` A Form A-4 rate of ${(c.suggestedRate * 100).toFixed(1)}% would cover it.`
          : ' Consider extra withholding on Form A-4.';
        note.textContent = `Heads up: at ${(r.a4Rate * 100).toFixed(1)}% your Arizona withholding (${money(c.withheld)} a year) may be about ${money(-c.difference)} below the estimated Arizona tax you will owe.${tip}`;
      } else {
        note.classList.add('ok');
        note.textContent = `Your Arizona withholding (${money(c.withheld)} a year) looks enough to cover the estimated Arizona tax (${money(c.liability)}).`;
      }
    } else {
      note.classList.add('hidden');
    }
  };

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  document.getElementById('print-results')?.addEventListener('click', () => window.print());
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => setTimeout(render, 0));
  render();
}
