# Arizona Paycheck Calculator — QA & Change Report v2.1

## Fixes in this revision
- Fixed the tax-tool output selector mismatch: the JavaScript previously searched for `#tool-result` and `#tool-note`, while the component rendered data attributes. Results and explanations now render into the correct elements.
- Refactored tax-tool calculations into a pure, independently testable function. All nine tools now calculate and update on input/change, with a working Calculate button and accessible live result region.
- Added sensible starting values for overtime, bonus and effective-tax-rate examples.
- Expanded the directory from six to nine working tools by adding Salary-to-Hourly, Pay Raise and Paycheck Frequency calculators.
- Reworked blog listing to use article frontmatter titles/descriptions and stable slug links.
- Hardened the dynamic blog route with an explicit missing-article check and a back-to-blog link.
- Added a custom SVG brand mark and favicon; replaced the old text-only AP badge.
- Improved homepage hero actions, calculator highlights, discovery cards and responsive layout.
- Added automated tests for the nine tax-tool calculations, tax-tool component/script selector agreement, and blog article route coverage.

## Automated checks
- `npm test`: 32 tests pass.
- `node --check src/scripts/tax-tools.js`: pass.
- Competitor-brand scan (`adp`, `smartasset`, `netpayplanner`) across source/public/docs: no matches.
- ZIP archive integrity: checked after packaging.

## Build limitation
`npm run build` could not execute because Astro is not installed in this environment (`astro: not found`). An `npm install --no-audit --no-fund` attempt timed out. Therefore Astro compilation and browser-based interaction/visual checks remain unverified here. Run `npm install`, `npm test`, `npm run build`, then `npm run dev` on your computer before publishing.

## Calculator accuracy notes
- The 1099, quarterly, bonus, effective-rate, overtime and withholding tools are intentionally simplified planning estimates. In particular, the 1099 tool does not model the Social Security wage-base coordination, all deductions/credits, or all Additional Medicare Tax cases.
- The 50-state + DC calculators still use federal/FICA estimates with a user-entered state/local effective rate; they are not complete automatic state-specific tax engines. Do not market them as exact state tax results until official state withholding methods, local taxes, credits and independent test vectors are implemented.
- No deployment, DNS, analytics or ad activation was performed.
