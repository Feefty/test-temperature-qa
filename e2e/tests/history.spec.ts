import { test, expect } from '@playwright/test';

test.describe('History', () => {
  test('a new capture appears at the top of the history table', async ({ page }) => {
    const initialLoad = page.waitForResponse('**/api/temperature/history');
    await page.goto('/');
    await initialLoad;

    const rows = page.locator('table tbody tr');
    const rowCountBefore = await rows.count();

    const captured = page.waitForResponse('**/api/temperature/capture');
    await page.getByRole('button', { name: 'Capture temperature' }).click();
    await captured;
    await expect(page.locator('.capture-result')).toBeVisible();

    await expect(rows).toHaveCount(rowCountBefore + 1 > 15 ? 15 : rowCountBefore + 1);

    const capturedText = await page.locator('.capture-result').innerText();
    const firstRow = rows.first();
    await expect(firstRow).toContainText(capturedText.split(' ')[0]); // the "X.Y°C" part
  });

  test('history never shows more than 15 rows', async ({ page }) => {
    await page.goto('/');

    for (let i = 0; i < 16; i++) {
      const captured = page.waitForResponse('**/api/temperature/capture');
      await page.getByRole('button', { name: 'Capture temperature' }).click();
      await captured;
    }

    await expect(page.locator('table tbody tr')).toHaveCount(15);
  });
});
