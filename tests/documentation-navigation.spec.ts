import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3100';

test('documentation homepage has its platform title', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/kvidAI/i);
});

test('get started opens the local documentation', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  await expect(page).toHaveURL(/\/docs\/intro\/?$/);

  // The former scaffold's Installation assertion targeted playwright.dev, not this documentation site.
  await expect(page.getByRole('heading', { name: 'Welcome to kvidAI', exact: true })).toBeVisible();
});
