import { test, expect } from '@playwright/test';

test.describe('Threshold settings', () => {
  test('a valid update shows a success message', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Cold Max (°C)').fill('20');
    await page.getByLabel('Hot Min (°C)').fill('30');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('.message--success')).toHaveText('Thresholds updated successfully.');
  });

  test('leaving both fields empty shows an error, not a silent failure', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Cold Max (°C)').fill('');
    await page.getByLabel('Hot Min (°C)').fill('');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('.message--error')).toHaveText('coldMax must be strictly less than hotMin');
  });

  test('BUG: leaving only Cold Max empty leaves the Save button stuck on "Saving..."', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Cold Max (°C)').fill('');
    await page.getByLabel('Hot Min (°C)').fill('30');

    const saveButton = page.getByRole('button', { name: /Save|Saving/ });
    await saveButton.click();

    await expect(saveButton).toHaveText('Saving...');
    await expect(saveButton).toBeDisabled();
    await page.waitForTimeout(1000);
    await expect(saveButton).toHaveText('Saving...');
    await expect(page.locator('.message')).toHaveCount(0);
  });
});
