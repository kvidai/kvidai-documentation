import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { createHash } from 'node:crypto';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const monorepoRoot = path.resolve(__dirname, '../../..');
const OUT = fs.existsSync(path.join(monorepoRoot, '.gitmodules'))
  ? path.join(monorepoRoot, 'docs/ui-screenshots/documentation')
  : path.resolve(__dirname, '../docs/ui-screenshots/documentation');
const DATE = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const RUN_TIME = new Date().toISOString().slice(11, 23).replace(/[:.]/g, '');

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

// Adapted from scripts/screenshot-lib.ts: gotoAndWait
// Waits for networkidle → Docusaurus navbar hydration → 2nd networkidle → settle
async function gotoAndWait(page: Page, url: string, settleMs = 500) {
  const response = await page.goto(url, { timeout: 90_000 });
  expect(response?.status(), url).toBe(200);
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
    const capturePath = path.join(OUT, `${name}_built-site-${RUN_TIME}_${DATE}.png`);
    const bytes = await page.screenshot({ path: capturePath, fullPage: true });
    fs.writeFileSync(capturePath + '.meta.json', JSON.stringify({ role: 'anonymous', route: url, baseURL: BASE, viewport: page.viewportSize(), state: 'actual built documentation page', mockedBoundaries: [], sha256: createHash('sha256').update(bytes).digest('hex') }, null, 2));
  });
}
