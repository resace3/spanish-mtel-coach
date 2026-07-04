import { expect, test } from '@playwright/test';

const passcode = process.env.PLAYWRIGHT_PASSCODE ?? 'test-passcode-for-ci-only';

test('passcode gate unlocks and rejects incorrect passcodes', async ({ page }) => {
  await page.goto('/spanish-mtel-coach/');
  await expect(page.locator('input#passcode')).toBeVisible();
  await page.locator('input#passcode').fill('wrong-passcode');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.getByText(/did not unlock/i)).toBeVisible();
  await page.locator('input#passcode').fill(passcode);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.getByText('Current streak')).toBeVisible();
});
