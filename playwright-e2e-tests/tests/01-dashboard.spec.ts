import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("renders the header and all three sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Temperature Sensor" })).toBeVisible();
    await expect(page.getByText("TEST QA ENGINEER")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Capture" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Threshold Settings" })).toBeVisible();

    await expect(page.getByRole("button", { name: "Capture temperature" })).toBeVisible();
    await expect(page.locator("#coldMax")).toBeVisible();
    await expect(page.locator("#hotMin")).toBeVisible();
  });
});
