// One place for site-wide settings. Edit here, not inside pages.
export const SITE = {
  name: 'Arizona Paycheck Calculator',
  url: 'https://arizonapaycheckcalculator.com',
  language: 'en-US',
  description:
    'Estimate your Arizona take-home pay after federal tax, Arizona withholding, Social Security and Medicare.',
  // Leave empty until you have a real contact address. The Contact page shows a note while it is empty.
  contactEmail: '',
  // Leave empty until you have a real owner/publisher name.
  ownerName: '',
  // Last time tax rules were checked against official sources (YYYY-MM-DD).
  taxDataReviewed: '2026-11-01',
  // Ads and analytics stay OFF until you add real codes and approve them.
  ads: { enabled: false, network: '', clientId: '' },
  analytics: { enabled: false },
};

export const NAV = [
  { href: '/', label: 'Arizona Calculator' },
  { href: '/paycheck-calculators-by-state/', label: 'All States' },
  { href: '/tax-tools/', label: 'Tax Tools' },
  { href: '/guides/', label: 'Guides' },
  { href: '/blog/', label: 'Blog' },
];
