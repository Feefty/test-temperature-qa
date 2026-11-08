import { test, expect } from '@playwright/test';
import { TemperaturePage } from '../pages/TemperaturePage';

test('fixed sensor reading is displayed as 25.5 C and HOT', async ({ page, request }) => {
  const initialResponse = await request.get('/api/thresholds');
  expect(initialResponse.ok()).toBeTruthy();
  const initial = await initialResponse.json();

  try {
    const update = await request.put('/api/thresholds', {
      data: { coldMax: 20, hotMin: 22 },
    });
    expect(update.ok()).toBeTruthy();

    const dashboard = new TemperaturePage(page);
    await dashboard.goto();
    await dashboard.capture.click();
    await expect(dashboard.result).toBeVisible();
    await expect(dashboard.result).toContainText('25.5');
    await expect(dashboard.result.locator('.badge--hot')).toHaveText('HOT');

    // Verify the backend record as well as the rendered UI.
    const historyResponse = await request.get('/api/temperature/history');
    expect(historyResponse.ok()).toBeTruthy();
    const history = await historyResponse.json();
    expect(history.readings.some((reading: { temperature: number; state: string; coldMax: number; hotMin: number }) =>
      reading.temperature === 25.5 && reading.state === 'HOT' &&
      reading.coldMax === 20 && reading.hotMin === 22
    )).toBeTruthy();
  } finally {
    const restore = await request.put('/api/thresholds', { data: initial });
    expect(restore.ok(), 'restore original thresholds').toBeTruthy();
  }
});
