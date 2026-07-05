import { expect, test } from '@playwright/test';

const passcode = process.env.PLAYWRIGHT_PASSCODE ?? 'test-passcode-for-ci-only';

async function unlock(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/spanish-mtel-coach/');
  await page.locator('input#passcode').fill(passcode);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.getByText('Current streak')).toBeVisible();
}

async function answerCurrent(page: import('@playwright/test').Page): Promise<void> {
  const radios = page.getByRole('radio');
  await expect(radios).toHaveCount(4);
  await radios.first().check();
  await page.getByRole('button', { name: 'Submit answer' }).click();
}

test('complete a 100-question MTEL mock test and show a score result', async ({ page }) => {
  await unlock(page);
  await page.locator('.nav-shell').getByRole('link', { name: 'MTEL Mock', exact: true }).click();
  await page.getByRole('button', { name: 'Start 100-question test' }).click();

  for (let questionNumber = 1; questionNumber <= 100; questionNumber += 1) {
    await expect(page.getByText(`Question ${questionNumber} of 100`)).toBeVisible();
    await answerCurrent(page);
  }

  await expect(page.getByText(/Score:\s*\d+\/100/)).toBeVisible();
  await expect(page.getByText(/Mock pass (achieved|not reached)/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Review weak areas|Review daily practice history/ })).toBeVisible();
});
