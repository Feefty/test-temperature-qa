import { test, expect } from "@playwright/test";
import { setThresholds } from "./support/api";

test.describe("Threshold settings", () => {
  // Reset to a known-good baseline before every test, regardless of what an
  // earlier test left behind — keeps each test independent of run order.
  test.beforeEach(async ({ request }) => {
    await setThresholds(request, 22, 35);
  });

  test("loads and displays the current thresholds", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#coldMax")).toHaveValue("22");
    await expect(page.locator("#hotMin")).toHaveValue("35");
  });

  test("a valid update shows a success message and persists", async ({ page }) => {
    await page.goto("/");

    await page.locator("#coldMax").fill("18");
    await page.locator("#hotMin").fill("30");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.locator(".message")).toHaveText("Thresholds updated successfully.");

    await page.reload();
    await expect(page.locator("#coldMax")).toHaveValue("18");
    await expect(page.locator("#hotMin")).toHaveValue("30");
  });

  test("rejects coldMax equal to hotMin", async ({ page }) => {
    await page.goto("/");

    await page.locator("#coldMax").fill("25");
    await page.locator("#hotMin").fill("25");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.locator(".message")).toHaveText("coldMax must be strictly less than hotMin");
  });

  test("rejects coldMax greater than hotMin", async ({ page }) => {
    await page.goto("/");

    await page.locator("#coldMax").fill("40");
    await page.locator("#hotMin").fill("20");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.locator(".message")).toHaveText("coldMax must be strictly less than hotMin");
  });

  test("rejects a gap smaller than 2°C", async ({ page }) => {
    await page.goto("/");

    await page.locator("#coldMax").fill("20");
    await page.locator("#hotMin").fill("21.9");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.locator(".message")).toHaveText(
      "Minimum gap between coldMax and hotMin must be 2°C"
    );
  });

  test("accepts a gap of exactly 2°C", async ({ page }) => {
    await page.goto("/");

    await page.locator("#coldMax").fill("20");
    await page.locator("#hotMin").fill("22");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.locator(".message")).toHaveText("Thresholds updated successfully.");
  });
});
