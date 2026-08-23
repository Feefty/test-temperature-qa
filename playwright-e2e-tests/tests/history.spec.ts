import { test, expect } from '../fixtures/test-fixtures';
import { EXPECTED_FIXED_TEMPERATURE, HISTORY_PAGE_SIZE, thresholdsForWarmState } from '../support/test-data';

test.describe('History', () => {
  test('a deterministic capture is persisted and appears at the top of history', async ({
    dashboardPage,
    thresholdApiClient,
    originalThresholds,
  }) => {
    const warmThresholds = thresholdsForWarmState(EXPECTED_FIXED_TEMPERATURE);

    await test.step('prepare thresholds that classify the fixed temperature as WARM', async () => {
      await thresholdApiClient.setThresholds(warmThresholds);
    });

    let previousTopRowText: string | null = null;
    await test.step('open the dashboard and record the current top row, if any', async () => {
      await dashboardPage.open();
      const rowCountBefore = await dashboardPage.historyRows.count();
      previousTopRowText = rowCountBefore > 0 ? await dashboardPage.historyRows.first().innerText() : null;
    });

    await test.step('capture through the UI', async () => {
      await dashboardPage.captureTemperature();
    });

    await test.step('wait for the top row to reflect this new capture', async () => {
      // History rows have no ID in the UI, so a fresh capture is detected by
      // waiting for the top row's content to change from its prior value.
      if (previousTopRowText !== null) {
        await expect(dashboardPage.historyRows.first()).not.toHaveText(previousTopRowText);
      } else {
        await expect(dashboardPage.historyRows.first()).toBeVisible();
      }
    });

    await test.step('verify temperature, state, threshold snapshot and capture date', async () => {
      const latestReading = await dashboardPage.getLatestHistoryReading();
      expect(latestReading.temperature).toBe(EXPECTED_FIXED_TEMPERATURE);
      expect(latestReading.state).toBe('WARM');
      expect(latestReading.coldMax).toBe(warmThresholds.coldMax);
      expect(latestReading.hotMin).toBe(warmThresholds.hotMin);
      expect(latestReading.capturedAtText).not.toBe('');
    });

    // Fixture dependency only, for its snapshot/restore side effect — see
    // the originalThresholds doc comment in fixtures/test-fixtures.ts.
    void originalThresholds;
  });

  test('a captured reading keeps the coldMax/hotMin active at capture time, even after thresholds later change', async ({
    dashboardPage,
    thresholdApiClient,
    originalThresholds,
  }) => {
    const thresholdsAtCapture = thresholdsForWarmState(EXPECTED_FIXED_TEMPERATURE);
    const thresholdsAfterCapture = {
      coldMax: EXPECTED_FIXED_TEMPERATURE - 15,
      hotMin: EXPECTED_FIXED_TEMPERATURE + 15,
    };

    await test.step('prepare thresholds that will be active at capture time', async () => {
      await thresholdApiClient.setThresholds(thresholdsAtCapture);
    });

    await test.step('capture through the UI', async () => {
      await dashboardPage.open();
      await dashboardPage.captureTemperature();
    });

    await test.step('change the current thresholds after the capture', async () => {
      await thresholdApiClient.setThresholds(thresholdsAfterCapture);
    });

    await test.step('verify the reloaded reading still reflects the thresholds active at capture time', async () => {
      await dashboardPage.open();
      const latestReading = await dashboardPage.getLatestHistoryReading();
      expect(latestReading.temperature).toBe(EXPECTED_FIXED_TEMPERATURE);
      expect(latestReading.coldMax).toBe(thresholdsAtCapture.coldMax);
      expect(latestReading.hotMin).toBe(thresholdsAtCapture.hotMin);
    });

    // Fixture dependency only, for its snapshot/restore side effect — see
    // the originalThresholds doc comment in fixtures/test-fixtures.ts.
    void originalThresholds;
  });

  test(`shows at most ${HISTORY_PAGE_SIZE} readings`, async ({ dashboardPage, request }) => {
    await test.step(`add more than ${HISTORY_PAGE_SIZE} readings via the API`, async () => {
      // Adds enough captures regardless of prior history size. Readings
      // can't be deleted afterward (no such endpoint) — an accepted,
      // permanent side effect of this test.
      await Promise.all(
        Array.from({ length: HISTORY_PAGE_SIZE + 1 }, () => request.post('/api/temperature/capture'))
      );
    });

    await test.step('open the dashboard and verify the row count is capped', async () => {
      await dashboardPage.open();
      await expect(dashboardPage.historyRows).toHaveCount(HISTORY_PAGE_SIZE);
    });
  });
});
