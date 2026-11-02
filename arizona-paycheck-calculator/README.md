# Arizona Paycheck Calculator

Website for https://arizonapaycheckcalculator.com — built with Astro (static site), plain CSS and plain JavaScript.

## 1. Run it on your computer (first time)

1. Install **Node.js LTS** from https://nodejs.org (this also installs npm).
2. Extract the ZIP and open the folder in VS Code.
3. Open the VS Code terminal (Terminal > New Terminal) and run:

```
npm install
npm test
npm run build
npm run dev
```

- `npm install` downloads the tools the site needs (creates a `node_modules` folder).
- `npm test` checks the tax math (17 tests should pass).
- `npm run build` makes the final website in the `dist` folder. **If this shows an error, send me the full message.**
- `npm run dev` opens a live preview at http://localhost:4321

## 2. Put it on GitHub and Cloudflare Pages

```
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/arizona-paycheck-calculator.git
git push -u origin main
```

In Cloudflare: **Workers & Pages > Create > Pages > Connect to Git**, choose the repository, then set:

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |

Every push to another branch makes a **preview link** you can check before going live. Pushing to `main` updates the real site. Add the custom domain in Cloudflare Pages > Custom domains (DNS changes are yours to approve).

## 3. Updating later

1. Download the new ZIP and replace the old folder contents (keep your `.git` folder).
2. `npm install` (only if package.json changed), `npm test`, `npm run build`.
3. `git add .`, `git commit -m "Describe change"`, `git push`.
4. Check the Cloudflare deployment, then the live site.

## 4. Where things are

- `src/config/site.js` — site name, URL, contact email, menu, ads/analytics switches (both OFF).
- `src/config/taxYears/2026.js` — all tax numbers for 2026.
- `src/lib/` — the tax math (no screen code). `tests/` checks it.
- `src/components/`, `src/layouts/`, `src/pages/` — the screens and pages.

## 5. Adding a new guide or blog post

1. Copy `src/pages/guides/arizona-paycheck-deductions.astro` to `src/pages/guides/your-new-topic.astro`.
2. Change the title, description, `path`, headline and text.
3. Add one line for it in `src/config/guides.js`.
4. Run `npm run build`. The sitemap and the Guides page update by themselves.

## 6. New tax year (for example 2027)

1. Copy `src/config/taxYears/2026.js` to `2027.js`.
2. Update the numbers from IRS Pub 15-T, SSA wage base, and Arizona Department of Revenue.
3. In `src/config/tax.js` change the import to `2027.js`.
4. Update `taxDataReviewed` in `src/config/site.js`, then run `npm test` and `npm run build`.

## 7. Before launch checklist

- Add a real contact email and owner name in `src/config/site.js` (the Contact page says "not added yet" until then).
- Verify the Arizona standard deduction for the year (see Methodology page; it only affects the "will I owe" note).
- `public/ads.txt` is a comment-only placeholder. Add your real AdSense line after approval.
- Ads (`ads.enabled`) and analytics stay off until you supply real codes and approve.
- After launch, add the site to Google Search Console and submit `https://arizonapaycheckcalculator.com/sitemap-index.xml`.
