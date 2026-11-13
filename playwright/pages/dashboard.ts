import { Page, Locator } from '@playwright/test';

export class Dashboard {
  readonly page: Page;
  readonly captureButton: Locator;
  readonly historyTable: Locator;
  readonly coldMax: Locator;
  readonly hotMin: Locator;
  readonly saveThresholdButton: Locator;
  readonly thresholdUpdateMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.captureButton = page.getByRole("button", { name: "Capture temperature" });
    this.historyTable = page.getByRole('table'); // I would require a more robust selector
    this.coldMax = page.locator("#coldMax");
    this.hotMin = page.locator("#hotMin");
    this.saveThresholdButton = page.getByRole("button", { name: "Save" });
    this.thresholdUpdateMessage = page.locator(".message");
  }

  async gotoDashboard() {
    await this.page.goto('/');
  }

  async clickCaptureButton() {
    await this.captureButton.click();
  }

  async clickSaveThresholdButton() {
    await this.saveThresholdButton.click();
  }

  async fillColdMax(coldMax: number) {
    await this.coldMax.fill(String(coldMax));
  }

  async fillHotMin(coldMax: number) {
    await this.hotMin.fill(String(coldMax));
  }
}