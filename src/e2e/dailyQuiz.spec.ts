import { expect, test } from '@playwright/test';

const passcode = process.env.PLAYWRIGHT_PASSCODE ?? 'test-passcode-for-ci-only';

async function unlock(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/spanish-mtel-coach/');
  await page.getByLabel('Passcode').fill(passcode);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.getByText('Current streak')).toBeVisible();
}

async function answerCurrent(page: import('@playwright/test').Page): Promise<void> {
  const radios = page.getByRole('radio');
  if ((await radios.count()) > 0) {
    await radios.first().check();
  } else {
    const textArea = page.locator('textarea').first();
    await textArea.fill('Es una respuesta de practica con detalles claros, verbos variados y una conclusion breve.');
  }
  await page.getByRole('button', { name: 'Submit answer' }).click();
}

test('complete daily set, persist streak, use extra practice, export, clear, and import', async ({ page }) => {
  await unlock(page);
  await page.getByRole('link', { name: /start today's 10/i }).click();

  for (let index = 0; index < 10; index += 1) {
    await expect(page.getByText(new RegExp(`Question ${index + 1} of 10`))).toBeVisible();
    await answerCurrent(page);
    if (index < 9) await page.getByRole('button', { name: 'Next' }).click();
  }

  await expect(page.getByText(/All 10 questions are submitted/i)).toBeVisible();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.locator('.stat-card').filter({ hasText: 'Current streak' })).toContainText('1');
  await page.reload();
  await expect(page.locator('.stat-card').filter({ hasText: 'Current streak' })).toContainText('1');

  await page.getByRole('link', { name: 'Practice' }).click();
  await page.getByLabel('Question count').selectOption('5');
  await page.getByRole('button', { name: 'Start practice' }).click();
  await answerCurrent(page);
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.locator('.stat-card').filter({ hasText: 'Today' })).toContainText('Complete');

  await page.getByRole('link', { name: 'Settings' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export progress' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();

  await page.getByRole('button', { name: 'Clear all local data' }).click();
  await page.getByRole('button', { name: 'Clear local data' }).click();
  await page.setInputFiles('input[type="file"]', path!);
  await page.getByRole('button', { name: 'Import progress' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.locator('.stat-card').filter({ hasText: 'Current streak' })).toContainText('1');
});
