import { expect, test } from '@playwright/test';

test('extra practice starts without completing the daily set', async ({ page }) => {
  await page.goto('/spanish-mtel-coach/');
  await page.locator('input#passcode').fill(process.env.PLAYWRIGHT_PASSCODE ?? 'test-passcode-for-ci-only');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await page.locator('.nav-shell').getByRole('link', { name: 'Practice', exact: true }).click();
  await page.getByLabel('Question count').selectOption('5');
  await page.getByRole('button', { name: 'Start practice' }).click();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  await page.locator('.nav-shell').getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.locator('.stat-card').filter({ hasText: 'Today' })).not.toContainText('Complete');
});
