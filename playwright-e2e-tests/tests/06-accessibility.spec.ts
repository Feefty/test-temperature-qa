import { test, expect } from "@playwright/test";
import { setThresholds } from "./support/api";

test.describe("Accessibility", () => {
  test("the capture button can be triggered with the keyboard alone", async ({ page, request }) => {
    await setThresholds(request, 22, 35);
    await page.goto("/");

    const button = page.getByRole("button", { name: "Capture temperature" });
    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.locator(".capture-result")).toBeVisible();
  });

  test("the threshold form can be submitted with the keyboard alone", async ({ page, request }) => {
    await setThresholds(request, 22, 35);
    await page.goto("/");

    await page.locator("#coldMax").fill("18");
    await page.locator("#hotMin").fill("30");
    await page.getByRole("button", { name: "Save" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.locator(".message")).toHaveText("Thresholds updated successfully.");
  });

  test("status messages use an aria-live region so assistive tech announces them", async ({
    page,
    request,
  }) => {
    await setThresholds(request, 22, 35);
    await page.goto("/");

    await page.getByRole("button", { name: "Capture temperature" }).click();
    await expect(page.locator(".capture-result")).toHaveAttribute("aria-live", "polite");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.locator(".message")).toHaveAttribute("aria-live", "polite");
  });
});
