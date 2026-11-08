import { test, expect } from '@playwright/test';
import { TemperaturePage } from '../pages/TemperaturePage';

test('capturing a reading displays its temperature and state', async ({ page }) => {
  const dashboard = new TemperaturePage(page);
  await dashboard.goto();
  const captureResponse = page.waitForResponse(r => r.url().endsWith('/api/temperature/capture') && r.request().method() === 'POST');
  await dashboard.capture.click();
  const response = await captureResponse;
  expect(response.status()).toBe(201);
  const reading = await response.json();
  await expect(dashboard.result).toContainText(String(reading.temperature));
  await expect(dashboard.result.locator('.badge')).toHaveText(reading.state);
});
