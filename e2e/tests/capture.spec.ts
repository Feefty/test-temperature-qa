import { test, expect } from '@playwright/test';

test.describe('Capture', () => {
  test('capturing a temperature shows a value and a state badge', async ({ page }) => {
    await page.goto('/');

    const captureButton = page.getByRole('button', { name: 'Capture temperature' });
    await captureButton.click();

    const result = page.locator('.capture-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('°C');
    await expect(result.locator('.badge')).toHaveText(/COLD|WARM|HOT/);
  });
});
