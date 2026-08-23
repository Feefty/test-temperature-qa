import { expect, Locator, Page } from '@playwright/test';
import { HistoryRow, SensorState } from '../support/types';

/**
 * Page object for the dashboard's Capture, History and Threshold Settings
 * sections. The app has a single page, so a BasePage/PageFactory split
 * would add abstraction without benefit.
 */
export class DashboardPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly captureButton: Locator;
  readonly captureResult: Locator;
  readonly capturedStateBadge: Locator;
  readonly historyTable: Locator;
  readonly historyRows: Locator;
  readonly coldMaxInput: Locator;
  readonly hotMinInput: Locator;
  readonly saveButton: Locator;
  readonly thresholdMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Temperature Sensor', level: 1 });
    this.captureButton = page.getByRole('button', { name: 'Capture temperature' });
    // No ARIA role on this element (aria-live only), so the class name is
    // the most stable available locator.
    this.captureResult = page.locator('.capture-result');
    this.capturedStateBadge = this.captureResult.locator('.badge');

    this.historyTable = page.getByRole('table');
    this.historyRows = this.historyTable.locator('tbody tr');

    this.coldMaxInput = page.getByLabel('Cold Max (°C)');
    this.hotMinInput = page.getByLabel('Hot Min (°C)');
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    // getByRole('alert') alone also matches Next.js's always-present, hidden
    // route announcer, so the "message" class targets the form's own alert.
    this.thresholdMessage = page.locator('.message[role="alert"]');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async captureTemperature(): Promise<void> {
    await this.captureButton.click();
    // CaptureButton sets the result before it re-enables, so waiting for
    // the button guarantees the result region reflects this capture.
    await expect(this.captureButton).toBeEnabled();
  }

  async getCapturedTemperature(): Promise<number> {
    const capturedText = await this.captureResult.innerText();
    const temperatureMatch = capturedText.match(/(-?\d+(\.\d+)?)°C/);
    if (!temperatureMatch) {
      throw new Error(`Could not parse a temperature from captured result "${capturedText}"`);
    }
    return Number(temperatureMatch[1]);
  }

  async getCapturedState(): Promise<string> {
    return (await this.capturedStateBadge.innerText()).trim();
  }

  async enterColdMax(coldMax: string): Promise<void> {
    await this.coldMaxInput.fill(coldMax);
  }

  async enterHotMin(hotMin: string): Promise<void> {
    await this.hotMinInput.fill(hotMin);
  }

  async updateThresholds(coldMax: number, hotMin: number): Promise<void> {
    await this.enterColdMax(String(coldMax));
    await this.enterHotMin(String(hotMin));
    await this.saveButton.click();
  }

  async getHistoryRows(): Promise<HistoryRow[]> {
    const rows = await this.historyRows.all();
    return Promise.all(rows.map((row) => this.parseHistoryRow(row)));
  }

  async getLatestHistoryReading(): Promise<HistoryRow> {
    const rows = await this.getHistoryRows();
    if (rows.length === 0) {
      throw new Error('History table has no rows');
    }
    return rows[0];
  }

  private async parseHistoryRow(row: Locator): Promise<HistoryRow> {
    const [temperatureText, stateText, coldMaxText, hotMinText, capturedAtText] =
      await row.locator('td').allInnerTexts();
    return {
      temperature: Number(temperatureText.replace('°C', '')),
      state: stateText.trim() as SensorState,
      coldMax: Number(coldMaxText.replace('°C', '')),
      hotMin: Number(hotMinText.replace('°C', '')),
      capturedAtText,
    };
  }
}
