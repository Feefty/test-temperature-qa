import { expect, type Page } from '@playwright/test';

export class TemperaturePage {
  constructor(readonly page: Page) {}
  get coldMax() { return this.page.locator('#coldMax'); }
  get hotMin() { return this.page.locator('#hotMin'); }
  get save() { return this.page.getByRole('button', { name: 'Save', exact: true }); }
  get capture() { return this.page.getByRole('button', { name: 'Capture temperature' }); }
  get result() { return this.page.locator('.capture-result'); }
  get alert() { return this.page.locator('.message[role="alert"]'); }
  get historyRows() { return this.page.locator('table tbody tr'); }
  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Temperature Sensor' })).toBeVisible();
    await expect(this.coldMax).not.toHaveValue('');
    await expect(this.hotMin).not.toHaveValue('');
  }
  async setThresholds(coldMax: string, hotMin: string) {
    await this.coldMax.fill(coldMax);
    await this.hotMin.fill(hotMin);
    await this.save.click();
  }
}
