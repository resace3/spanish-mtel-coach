import { expect, test } from '@playwright/test';

test('settings exposes export and import controls', async ({ page }) => {
  await page.goto('/spanish-mtel-coach/');
  await page.locator('input#passcode').fill(process.env.PLAYWRIGHT_PASSCODE ?? 'test-passcode-for-ci-only');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await page.locator('.nav-shell').getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Export progress' })).toBeVisible();
  await expect(page.locator('input[type="file"]')).toBeVisible();
});
