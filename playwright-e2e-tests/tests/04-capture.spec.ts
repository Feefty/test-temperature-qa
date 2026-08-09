import { test, expect } from "@playwright/test";
import { setThresholds, FIXED_TEMPERATURE } from "./support/api";

test.describe("Capture", () => {
  test("shows the temperature and the correct state badge (WARM)", async ({ page, request }) => {
    // FIXED_TEMPERATURE sits strictly between these thresholds -> WARM.
    await setThresholds(request, 22, 35);
    await page.goto("/");

    await page.getByRole("button", { name: "Capture temperature" }).click();

    const result = page.locator(".capture-result");
    await expect(result).toContainText(`${FIXED_TEMPERATURE}°C`);
    await expect(result.locator(".badge--warm")).toHaveText("WARM");
  });

  test("shows COLD or HOT depending on where the thresholds sit relative to the fixed reading", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const captureButton = page.getByRole("button", { name: "Capture temperature" });
    const result = page.locator(".capture-result");

    // Thresholds entirely above the fixed reading -> COLD.
    await setThresholds(request, FIXED_TEMPERATURE + 5, FIXED_TEMPERATURE + 7);
    await captureButton.click();
    await expect(result.locator(".badge--cold")).toHaveText("COLD");

    // Thresholds entirely below the fixed reading -> HOT.
    await setThresholds(request, FIXED_TEMPERATURE - 7, FIXED_TEMPERATURE - 5);
    await captureButton.click();
    await expect(result.locator(".badge--hot")).toHaveText("HOT");
  });

  test("disables the button and shows a loading label while the request is in flight", async ({
    page,
    request,
  }) => {
    await setThresholds(request, 22, 35);
    await page.goto("/");

    // Slow the capture request down so the loading state is actually observable.
    await page.route("**/api/temperature/capture", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    const button = page.getByRole("button", { name: "Capture temperature" });
    await button.click();

    await expect(button).toBeDisabled();
    await expect(button).toHaveText("Capturing...");

    await expect(button).toBeEnabled();
    await expect(button).toHaveText("Capture Temperature");
  });
});
