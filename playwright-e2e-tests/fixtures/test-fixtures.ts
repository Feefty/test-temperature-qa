import { test as base, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { ThresholdApiClient } from '../support/ThresholdApiClient';
import { Thresholds } from '../support/types';

interface DashboardFixtures {
  dashboardPage: DashboardPage;
  thresholdApiClient: ThresholdApiClient;
  /**
   * Snapshots the thresholds in place before the test and restores them
   * after, even on failure. Depend on this fixture in any test that changes
   * thresholds through the UI or the API. If the test never reads the
   * snapshot itself, add `void originalThresholds;` in the test body —
   * otherwise `noUnusedParameters` fails the build.
   */
  originalThresholds: Thresholds;
}

export const test = base.extend<DashboardFixtures>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  thresholdApiClient: async ({ request }, use) => {
    await use(new ThresholdApiClient(request));
  },

  originalThresholds: async ({ thresholdApiClient }, use) => {
    const originalThresholds = await thresholdApiClient.getCurrentThresholds();
    await use(originalThresholds);
    await thresholdApiClient.setThresholds(originalThresholds);
  },
});

export { expect };
