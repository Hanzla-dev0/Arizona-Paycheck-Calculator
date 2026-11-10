# Arizona Paycheck Calculator — v2.0.0

Astro static website for Arizona paycheck estimates, state calculator discovery, tax tools and educational content.

## Requirements
- Node.js 22 or newer
- npm

## Local development
```bash
npm install
npm test
npm run dev
```
Open the local URL printed by Astro (normally http://localhost:4321/).

## Production build
```bash
npm run build
npm run preview
```

## Main sections
- `/` — Arizona Paycheck Calculator (Arizona-specific calculator remains the primary calculator)
- `/paycheck-calculators-by-state/` — directory for all 50 states and the District of Columbia
- `/{state}-paycheck-calculator/` — state estimator pages
- `/tax-tools/` — tax tools directory and six estimator pages
- `/guides/` — Arizona guides
- `/blog/` — editorial articles
- `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/disclaimer/`, `/methodology/`

## Important tax calculation scope
The Arizona calculator retains the Arizona-specific calculation engine and 2026 Arizona withholding configuration. The 50-state/DC estimator pages use the shared 2026 federal withholding framework and FICA assumptions, but state and local withholding are user-entered effective percentages. They do **not** yet implement each jurisdiction's complete official withholding tables, credits, reciprocity rules, local taxes or special payroll programs. Do not describe these pages as exact state tax calculators until each jurisdiction's official 2026 rules have been researched, coded and independently tested.

The tax-tools pages are simplified planning estimators. In particular, the 1099 and quarterly payment tools do not model all federal deductions, safe-harbor tests, state requirements or wage-base interactions.

## Site configuration
Edit `src/config/site.js` for site-wide metadata, contact email and publisher details. Ads and analytics remain disabled by default. Do not add placeholder publisher IDs or unapproved tracking code.

## Content
Blog posts are Markdown files in `src/content/blog/`. The blog routes use a shared article template. State page metadata is in `src/data/states.js`.

## Before production launch
1. Add a real monitored contact email and review legal pages for the actual operator and hosting setup.
2. Complete official tax research and independent payroll review for each state and DC before claiming full state-specific tax accuracy.
3. Run `npm install`, `npm test`, `npm run build`, and browser/mobile/accessibility checks on the deployment environment.
4. Verify sitemap, canonical URLs, redirects, analytics/consent (if added), and domain settings.
5. Do not deploy without approval from the site owner.
