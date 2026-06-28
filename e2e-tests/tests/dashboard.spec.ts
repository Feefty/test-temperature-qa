import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Temperature Sensor Dashboard', () => {
  test('should display the main dashboard sections', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.open();
    await dashboardPage.expectDashboardVisible();
  });
});

test('should capture a fixed temperature and display it in the dashboard', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);

  await dashboardPage.open();
  await dashboardPage.captureTemperature();

  await dashboardPage.expectCapturedTemperatureVisible('25.5', 'WARM');
});

test('should display an error when coldMax is greater than hotMin', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);

  await dashboardPage.open();
  await dashboardPage.updateThresholds('30', '20');

  await dashboardPage.expectErrorMessage('coldMax must be strictly less than hotMin');
});