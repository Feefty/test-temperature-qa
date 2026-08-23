import { test, expect } from '../fixtures/test-fixtures';
import { classificationBoundaryCases, EXPECTED_FIXED_TEMPERATURE, thresholdsForWarmState } from '../support/test-data';

test.describe('Temperature capture', () => {
  test('repeated captures return the same fixed temperature', async ({ dashboardPage }) => {
    await test.step('open the dashboard', async () => {
      await dashboardPage.open();
    });

    await test.step('first capture matches the configured fixed temperature', async () => {
      await dashboardPage.captureTemperature();
      const firstReading = await dashboardPage.getCapturedTemperature();
      expect(
        firstReading,
        `Expected the app to run with FIXED_TEMPERATURE=${EXPECTED_FIXED_TEMPERATURE}. ` +
          'If this fails, the application under test was not started in deterministic mode.'
      ).toBe(EXPECTED_FIXED_TEMPERATURE);
    });

    await test.step('second capture returns the same temperature', async () => {
      await dashboardPage.captureTemperature();
      const secondReading = await dashboardPage.getCapturedTemperature();
      expect(secondReading).toBe(EXPECTED_FIXED_TEMPERATURE);
    });
  });

  test('the capture button is disabled while a request is in flight', async ({ dashboardPage }) => {
    let releaseCaptureResponse!: () => void;
    const captureResponseGate = new Promise<void>((resolve) => {
      releaseCaptureResponse = resolve;
    });

    await test.step('open the dashboard', async () => {
      await dashboardPage.open();
    });

    await test.step('hold the capture response so the in-flight state is observable', async () => {
      await dashboardPage.page.route('**/api/temperature/capture', async (route) => {
        await captureResponseGate;
        await route.continue();
      });
    });

    await test.step('button disables on click while the request is held', async () => {
      await dashboardPage.captureButton.click();
      await expect(dashboardPage.captureButton).toBeDisabled();
    });

    await test.step('button re-enables once the held request completes', async () => {
      releaseCaptureResponse();
      await expect(dashboardPage.captureButton).toBeEnabled();
    });
  });

  test('a deterministic capture shows the WARM state and returns the button to enabled', async ({
    dashboardPage,
    thresholdApiClient,
    originalThresholds,
  }) => {
    await test.step('prepare thresholds that classify the fixed temperature as WARM', async () => {
      await thresholdApiClient.setThresholds(thresholdsForWarmState(EXPECTED_FIXED_TEMPERATURE));
    });

    await test.step('capture through the UI', async () => {
      await dashboardPage.open();
      await dashboardPage.captureTemperature();
    });

    await test.step('verify temperature, state, badge and re-enabled button', async () => {
      expect(await dashboardPage.getCapturedTemperature()).toBe(EXPECTED_FIXED_TEMPERATURE);
      expect(await dashboardPage.getCapturedState()).toBe('WARM');
      await expect(dashboardPage.capturedStateBadge).toHaveClass(/badge--warm/);
      await expect(dashboardPage.captureButton).toBeEnabled();
    });

    // Fixture dependency only, for its snapshot/restore side effect — see
    // the originalThresholds doc comment in fixtures/test-fixtures.ts.
    void originalThresholds;
  });

  test.describe('Classification boundaries', () => {
    for (const boundaryCase of classificationBoundaryCases(EXPECTED_FIXED_TEMPERATURE)) {
      test(`classifies as ${boundaryCase.expectedState} when ${boundaryCase.description}`, async ({
        dashboardPage,
        thresholdApiClient,
        originalThresholds,
      }) => {
        await test.step('prepare the thresholds for this boundary', async () => {
          await thresholdApiClient.setThresholds(boundaryCase.thresholds);
        });

        await test.step('capture through the UI', async () => {
          await dashboardPage.open();
          await dashboardPage.captureTemperature();
        });

        await test.step(`verify the classification is ${boundaryCase.expectedState}`, async () => {
          expect(await dashboardPage.getCapturedTemperature()).toBe(EXPECTED_FIXED_TEMPERATURE);
          expect(await dashboardPage.getCapturedState()).toBe(boundaryCase.expectedState);
        });

        // Fixture dependency only, for its snapshot/restore side effect — see
        // the originalThresholds doc comment in fixtures/test-fixtures.ts.
        void originalThresholds;
      });
    }
  });
});
