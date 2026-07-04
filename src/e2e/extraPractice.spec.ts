import { expect, test } from '@playwright/test';

test('extra practice starts without completing the daily set', async ({ page }) => {
  await page.goto('/spanish-mtel-coach/');
  await page.locator('input#passcode').fill(process.env.PLAYWRIGHT_PASSCODE ?? 'test-passcode-for-ci-only');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await page.getByRole('link', { name: 'Practice' }).click();
  await page.getByLabel('Question count').selectOption('5');
  await page.getByRole('button', { name: 'Start practice' }).click();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.locator('.stat-card').filter({ hasText: 'Today' })).not.toContainText('Complete');
});
