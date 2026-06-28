import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  readonly title = this.page.getByRole('heading', { name: 'Temperature Sensor' });
  readonly captureSection = this.page.getByRole('heading', { name: 'Capture' });
  readonly historySection = this.page.getByRole('heading', { name: 'History' });
  readonly thresholdSection = this.page.getByRole('heading', { name: 'Threshold Settings' });

  readonly captureButton = this.page.getByRole('button', { name: 'Capture Temperature' });
  readonly coldMaxInput = this.page.getByLabel('Cold Max (°C)');
  readonly hotMinInput = this.page.getByLabel('Hot Min (°C)');
  readonly saveButton = this.page.getByRole('button', { name: 'Save' });

  async open() {
    await this.page.goto('/');
  }

  async expectDashboardVisible() {
    await expect(this.title).toBeVisible();
    await expect(this.captureSection).toBeVisible();
    await expect(this.historySection).toBeVisible();
    await expect(this.thresholdSection).toBeVisible();
    await expect(this.captureButton).toBeVisible();
    await expect(this.coldMaxInput).toBeVisible();
    await expect(this.hotMinInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }
  async captureTemperature() {
  await this.captureButton.click();
}

async expectCapturedTemperatureVisible(expectedTemperature: string, expectedState: string) {
  await expect(this.page.getByText(`${expectedTemperature}°C`).first()).toBeVisible();
  await expect(this.page.getByText(expectedState).first()).toBeVisible();
}

async updateThresholds(coldMax: string, hotMin: string) {
  await this.coldMaxInput.fill(coldMax);
  await this.hotMinInput.fill(hotMin);
  await this.saveButton.click();
}

async expectErrorMessage(message: string) {
  const alert = this.page.getByRole('alert').filter({ hasText: message });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(message);
}

async expectSuccessMessage(message: string) {
  const alert = this.page.getByRole('alert').filter({ hasText: message });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(message);
}

}