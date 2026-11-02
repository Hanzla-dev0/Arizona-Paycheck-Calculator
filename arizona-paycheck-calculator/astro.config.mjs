import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site.js';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // The 404 page is not generated into the sitemap automatically, nothing to filter.
    }),
  ],
});
