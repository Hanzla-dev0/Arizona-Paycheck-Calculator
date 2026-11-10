# QA Report — v2.2

## Fixes
- Fixed the Astro blog dynamic route: `getStaticPaths()` now loads Markdown modules within its own scope and passes article content/title/description through route props. This addresses the reported `ReferenceError: modules is not defined`.
- Fixed homepage primary CTA contrast so text remains white and visible on green, including hover and keyboard-focus states. Secondary CTA also has explicit hover/focus colors.
- Replaced the previous brand mark and favicon with a custom Arizona/paycheck-inspired SVG mark.

## Verification
- `npm test`: 32/32 passed.
- `npm install --no-audit --no-fund`: timed out in this environment; dependencies unavailable here.
- `npm run build`: not run because dependencies could not be installed.
- Visual browser testing: not available in this environment.

## Remaining user-side check
After extracting the ZIP, run `npm install`, `npm test`, `npm run build`, then `npm run dev`. Confirm `/blog/` and each article URL open. No production deployment was performed.
