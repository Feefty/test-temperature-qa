import { test, expect } from '@playwright/test';
import { TemperaturePage } from '../pages/TemperaturePage';

test('capture refreshes history and history shows no more than 15 readings', async ({ page }) => {
  const dashboard = new TemperaturePage(page);
  await dashboard.goto();
  const responsePromise = page.waitForResponse(r => r.url().endsWith('/api/temperature/capture') && r.request().method() === 'POST');
  await dashboard.capture.click();
  const captureResponse = await responsePromise;
  expect(captureResponse.status()).toBe(201);
  const reading = await captureResponse.json();
  await expect(dashboard.historyRows.first()).toBeVisible();
  await expect(dashboard.historyRows.first()).toContainText(String(reading.temperature));
  const rowCount = await dashboard.historyRows.count();
  expect(rowCount).toBeGreaterThan(0);
  expect(rowCount).toBeLessThanOrEqual(15);
});
