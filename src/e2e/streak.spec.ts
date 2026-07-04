import { expect, test } from '@playwright/test';

test('dashboard initially does not count opening the site as completion', async ({ page }) => {
  await page.goto('/spanish-mtel-coach/');
  await page.getByLabel('Passcode').fill(process.env.PLAYWRIGHT_PASSCODE ?? 'test-passcode-for-ci-only');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.locator('.stat-card').filter({ hasText: 'Today' })).not.toContainText('Complete');
});
