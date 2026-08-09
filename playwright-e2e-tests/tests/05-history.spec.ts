import { test, expect } from "@playwright/test";
import { setThresholds } from "./support/api";

test.describe("History", () => {
  test("a new capture appears as the newest row after reloading", async ({ page, request }) => {
    await setThresholds(request, 22, 35);
    const captureRes = await request.post("/api/temperature/capture");
    expect(captureRes.ok()).toBeTruthy();
    const captured = await captureRes.json();

    await page.goto("/");

    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toContainText(`${captured.temperature}°C`);
    await expect(firstRow.locator(".badge")).toHaveText(captured.state);
    await expect(firstRow).toContainText("22°C");
    await expect(firstRow).toContainText("35°C");
  });

  test("stays capped at 15 rows even after many captures", async ({ page, request }) => {
    await setThresholds(request, 22, 35);
    for (let i = 0; i < 16; i++) {
      await request.post("/api/temperature/capture");
    }

    await page.goto("/");
    await expect(page.locator("tbody tr")).toHaveCount(15);
  });
});
