import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE = 'http://localhost:3100';
const OUT = path.resolve(__dirname, '../docs-internal/qa/ui-screenshots');

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

const pages = [
  { name: 'home', url: '/' },
  { name: 'docs-en-intro', url: '/docs/intro' },
  { name: 'docs-en-pricing', url: '/docs/pricing' },
  { name: 'docs-en-getting-started', url: '/docs/getting-started/quick-start' },
  { name: 'docs-en-api-overview', url: '/docs/api-services/overview' },
  { name: 'docs-ko-intro', url: '/ko/docs/intro' },
  { name: 'docs-ko-pricing', url: '/ko/docs/pricing' },
  { name: 'blog', url: '/blog' },
  { name: 'blog-welcome', url: '/blog/welcome-to-kvidai-docs' },
];

for (const { name, url } of pages) {
  test(`screenshot: ${name}`, async ({ page }) => {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(OUT, `${name}.png`),
      fullPage: true,
    });
  });
}
