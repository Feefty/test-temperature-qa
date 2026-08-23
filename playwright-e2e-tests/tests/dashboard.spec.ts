import { test, expect } from '../fixtures/test-fixtures';

test.describe('Dashboard', () => {
  test('loads with all three sections and their accessible controls', async ({ dashboardPage }) => {
    await test.step('open the dashboard', async () => {
      await dashboardPage.open();
      await expect(dashboardPage.heading).toBeVisible();
    });

    await test.step('verify the Capture section is visible with an accessible button', async () => {
      await expect(dashboardPage.page.getByRole('heading', { name: 'Capture' })).toBeVisible();
      await expect(dashboardPage.captureButton).toBeVisible();
      await expect(dashboardPage.captureButton).toBeEnabled();
    });

    await test.step('verify the History section is visible', async () => {
      await expect(dashboardPage.page.getByRole('heading', { name: 'History' })).toBeVisible();
    });

    await test.step('verify the Threshold Settings section is visible with accessible inputs and a Save button', async () => {
      await expect(dashboardPage.page.getByRole('heading', { name: 'Threshold Settings' })).toBeVisible();
      await expect(dashboardPage.coldMaxInput).toBeVisible();
      await expect(dashboardPage.hotMinInput).toBeVisible();
      await expect(dashboardPage.saveButton).toBeVisible();
      await expect(dashboardPage.saveButton).toBeEnabled();
    });
  });

  test('interactive controls are reachable via keyboard in a logical order', async ({ dashboardPage }) => {
    await test.step('open the dashboard', async () => {
      await dashboardPage.open();
    });

    await test.step('verify Tab order reaches Capture, then both threshold inputs, then Save', async () => {
      await dashboardPage.page.keyboard.press('Tab');
      await expect(dashboardPage.captureButton).toBeFocused();

      await dashboardPage.page.keyboard.press('Tab');
      await expect(dashboardPage.coldMaxInput).toBeFocused();

      await dashboardPage.page.keyboard.press('Tab');
      await expect(dashboardPage.hotMinInput).toBeFocused();

      await dashboardPage.page.keyboard.press('Tab');
      await expect(dashboardPage.saveButton).toBeFocused();
    });
  });
});
