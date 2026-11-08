import { test, expect } from '@playwright/test';
import { TemperaturePage } from '../pages/TemperaturePage';

test('valid thresholds can be saved and persist after reload', async ({ page, request }) => {
  const initial = await (await request.get('/api/thresholds')).json();
  const dashboard = new TemperaturePage(page);
  try {
    await dashboard.goto();
    await dashboard.setThresholds('20', '22.1');
    await expect(dashboard.alert).toHaveText('Thresholds updated successfully.');
    await page.reload();
    await expect(dashboard.coldMax).toHaveValue('20');
    await expect(dashboard.hotMin).toHaveValue('22.1');
  } finally {
    const restore = await request.put('/api/thresholds', { data: initial });
    expect(restore.ok(), 'restore original thresholds').toBeTruthy();
  }
});

test('invalid threshold gap is rejected without changing stored settings', async ({ page, request }) => {
  const initial = await (await request.get('/api/thresholds')).json();
  const dashboard = new TemperaturePage(page);
  try {
    await dashboard.goto();
    await dashboard.setThresholds('20', '21');
    await expect(dashboard.alert).toBeVisible();
    await expect(dashboard.alert).toHaveClass(/message--error/);
    const after = await (await request.get('/api/thresholds')).json();
    expect(after).toEqual(initial);
  } finally {
    const restore = await request.put('/api/thresholds', { data: initial });
    expect(restore.ok(), 'restore original thresholds').toBeTruthy();
  }
});
