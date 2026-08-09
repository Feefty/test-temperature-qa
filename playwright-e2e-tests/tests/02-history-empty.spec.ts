import { test, expect } from "@playwright/test";

// Runs before any other spec captures a reading (see README — the suite runs
// serially and files are numbered specifically so this sees a still-empty history).
test.describe("History — before any capture has happened", () => {
  test("shows the empty state message instead of a table", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText("No readings yet. Capture a temperature to get started.")
    ).toBeVisible();
    await expect(page.locator("table")).toHaveCount(0);
  });
});
