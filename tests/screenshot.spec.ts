import { test, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const OUT = path.resolve(__dirname, '../docs-internal/ui-screenshots');
const DATE = new Date().toISOString().slice(0, 10).replace(/-/g, '');

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

// Adapted from scripts/screenshot-lib.ts: gotoAndWait
// Waits for networkidle → Docusaurus navbar hydration → 2nd networkidle → settle
async function gotoAndWait(page: Page, url: string, settleMs = 500) {
  await page.goto(url, { timeout: 90_000 });
  await page.waitForLoadState('networkidle', { timeout: 90_000 });
  await page.waitForSelector('nav.navbar', { state: 'visible', timeout: 15_000 });
  try {
    await page.waitForLoadState('networkidle', { timeout: 10_000 });
  } catch { /* already idle */ }
  await page.waitForTimeout(settleMs);
}

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
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoAndWait(page, `${BASE}${url}`);
    // await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    // await page.waitForSelector('nav.navbar', { state: 'visible', timeout: 15000 });
    await page.screenshot({
      path: path.join(OUT, `${name}_${DATE}.png`),
      fullPage: true,
    });
  });
}
