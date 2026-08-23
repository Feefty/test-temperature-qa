import { test, expect } from '../fixtures/test-fixtures';
import { INVALID_THRESHOLD_UPDATE_CASES, VALID_THRESHOLD_UPDATE_CASES } from '../support/test-data';

test.describe('Threshold updates', () => {
  for (const updateCase of VALID_THRESHOLD_UPDATE_CASES) {
    test(`a valid update with ${updateCase.description} succeeds and persists`, async ({
      dashboardPage,
      thresholdApiClient,
      originalThresholds,
    }) => {
      await test.step('open the dashboard', async () => {
        await dashboardPage.open();
      });

      await test.step('submit the new thresholds through the form', async () => {
        await dashboardPage.updateThresholds(updateCase.thresholds.coldMax, updateCase.thresholds.hotMin);
      });

      await test.step('verify the success message and accessible live-region semantics', async () => {
        await expect(dashboardPage.thresholdMessage).toContainText('Thresholds updated successfully.');
        await expect(dashboardPage.thresholdMessage).toHaveAttribute('aria-live', 'polite');
      });

      await test.step('verify the form reflects the saved values', async () => {
        await expect(dashboardPage.coldMaxInput).toHaveValue(String(updateCase.thresholds.coldMax));
        await expect(dashboardPage.hotMinInput).toHaveValue(String(updateCase.thresholds.hotMin));
      });

      await test.step('verify persistence through the API', async () => {
        const persistedThresholds = await thresholdApiClient.getCurrentThresholds();
        expect(persistedThresholds).toEqual(updateCase.thresholds);
      });

      // Fixture dependency only, for its snapshot/restore side effect — see
      // the originalThresholds doc comment in fixtures/test-fixtures.ts.
      void originalThresholds;
    });
  }

  for (const invalidCase of INVALID_THRESHOLD_UPDATE_CASES) {
    test(`an update with ${invalidCase.description} is rejected and not persisted`, async ({
      dashboardPage,
      thresholdApiClient,
      originalThresholds,
    }) => {
      await test.step('open the dashboard', async () => {
        await dashboardPage.open();
      });

      await test.step('submit the invalid thresholds through the form', async () => {
        await dashboardPage.updateThresholds(invalidCase.thresholds.coldMax, invalidCase.thresholds.hotMin);
      });

      await test.step('verify a validation error is shown and the form recovers', async () => {
        await expect(dashboardPage.thresholdMessage).toContainText(invalidCase.expectedMessageFragment);
        await expect(dashboardPage.saveButton).toBeEnabled();
      });

      await test.step('verify the rejected thresholds were not persisted', async () => {
        const persistedThresholds = await thresholdApiClient.getCurrentThresholds();
        expect(persistedThresholds).toEqual(originalThresholds);
      });
    });
  }
});
