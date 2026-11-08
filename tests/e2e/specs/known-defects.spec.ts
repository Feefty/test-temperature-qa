import { test, expect } from '@playwright/test';
import { TemperaturePage } from '../pages/TemperaturePage';

// Explicitly opt in: E2E_KNOWN_BUGS=1 yarn playwright test known-defects.spec.ts
// This is a proposed UX requirement, not a behavior established by SPEC.md.
test('success message automatically disappears (known UX issue)', async ({ page }) => {
  test.skip(process.env.E2E_KNOWN_BUGS !== '1', 'Known UX issue; opt in to reproduce');
  const dashboard = new TemperaturePage(page);
  await dashboard.goto();
  await dashboard.save.click();
  await expect(dashboard.alert).toHaveText('Thresholds updated successfully.');
  await expect(dashboard.alert).toBeHidden({ timeout: 5000 });
});
