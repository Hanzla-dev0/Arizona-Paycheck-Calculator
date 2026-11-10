// Tax rules for the 2026 tax year. For a new year, copy this file to 2027.js,
// update the numbers from the official sources, then change the import in src/config/tax.js.
//
// Sources:
//  - IRS Publication 15-T (2026), Worksheet 1A, percentage method tables for automated payroll systems
//  - IRS 2026 inflation adjustments (brackets, standard deduction)
//  - SSA 2026 contribution and benefit base
//  - Arizona Department of Revenue: withholding percentage election (Form A-4), 2.5% flat rate

export default {
  year: 2026,

  federal: {
    // Standard deduction used to build the withholding tables
    standardDeduction: { single: 16100, married: 32200, hoh: 24150 },
    // Worksheet 1A line 1g (zero when the Step 2 box is checked)
    line1g: { single: 8600, married: 12900, hoh: 8600 },
    // Upper limit of each bracket, applied to income above the standard deduction.
    brackets: {
      single: [
        [12400, 0.1], [50400, 0.12], [105700, 0.22], [201775, 0.24],
        [256225, 0.32], [640600, 0.35], [Infinity, 0.37],
      ],
      married: [
        [24800, 0.1], [100800, 0.12], [211400, 0.22], [403550, 0.24],
        [512450, 0.32], [768700, 0.35], [Infinity, 0.37],
      ],
      hoh: [
        [17700, 0.1], [67450, 0.12], [105700, 0.22], [201750, 0.24],
        [256200, 0.32], [640600, 0.35], [Infinity, 0.37],
      ],
    },
  },

  fica: {
    socialSecurityRate: 0.062,
    socialSecurityWageBase: 184500,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: 200000,
  },

  arizona: {
    flatRate: 0.025,
    // Form A-4 withholding percentage choices. Default when no A-4 is on file: 2.0%.
    a4Options: [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035],
    defaultA4: 0.02,
    // ASSUMPTION: Arizona standard deduction is taken to match the federal amounts.
    // Only used for the optional "will I owe at tax time?" check, not for withholding itself.
    standardDeduction: { single: 16100, married: 32200, hoh: 24150 },
  },

  payFrequencies: {
    weekly: { label: 'Weekly', periods: 52 },
    biweekly: { label: 'Every two weeks', periods: 26 },
    semimonthly: { label: 'Twice a month', periods: 24 },
    monthly: { label: 'Monthly', periods: 12 },
  },
};
