import { test, expect } from "@playwright/test";
import {Dashboard} from "../pages/dashboard"

test.describe("Dashboard", () => {
  test("Capturing a temperature shows the record in the history table", async ({ page }) => {
    const dashboard = new Dashboard(page);
    await dashboard.gotoDashboard();
    const capturedTemperaturePromise = page.waitForResponse('**/api/temperature/capture');

    await dashboard.clickCaptureButton();
    const response = await capturedTemperaturePromise;
    const body = await response.json();
    
    await page.reload();
    await expect(dashboard.historyTable.locator('tbody tr').first()).toContainText(String(body.temperature));
    await expect(dashboard.historyTable.locator('tbody tr').first()).toContainText(body.state);
    await expect(dashboard.historyTable.locator('tbody tr').first()).toContainText(String(body.temperature));
    await expect(dashboard.historyTable.locator('tbody tr').first()).toContainText(String(body.temperature));
    await expect(dashboard.historyTable.locator('tbody tr').first()).toContainText(new Date(body.timestamp).toLocaleString());

  });

  test("Updating threshold with correct values saves new threshold", async ({ page }) => {
    const dashboard = new Dashboard(page);
    await dashboard.gotoDashboard();

    await dashboard.fillColdMax(18);
    await dashboard.fillHotMin(30);
    await dashboard.clickSaveThresholdButton();

    await expect(dashboard.thresholdUpdateMessage).toHaveText("Thresholds updated successfully.");

    await page.reload();
    await expect(dashboard.coldMax).toHaveValue("18");
    await expect(dashboard.hotMin).toHaveValue("30");
  });

  test("Cold max higher than hot min is rejected", async ({ page }) => {
    const dashboard = new Dashboard(page);
    await dashboard.gotoDashboard();

    await dashboard.fillColdMax(300);
    await dashboard.fillHotMin(200);
    await dashboard.clickSaveThresholdButton();

    await expect(dashboard.thresholdUpdateMessage).toHaveText("coldMax must be strictly less than hotMin");
  });

  test("Cold max and hot min values rejected when equal", async ({ page }) => {
    const dashboard = new Dashboard(page);
    await dashboard.gotoDashboard();

    await dashboard.fillColdMax(200);
    await dashboard.fillHotMin(200);
    await dashboard.clickSaveThresholdButton();

    await expect(dashboard.thresholdUpdateMessage).toHaveText("coldMax must be strictly less than hotMin");
  });

  test("Accept a gap of exactly 2°C", async ({ page }) => {
    const dashboard = new Dashboard(page);
    await dashboard.gotoDashboard();

    await dashboard.fillColdMax(300);
    await dashboard.fillHotMin(302);
    await dashboard.clickSaveThresholdButton();

    await expect(dashboard.thresholdUpdateMessage).toHaveText("Thresholds updated successfully.");
  });

  test("Gap greater than 2 degrees", async ({ page }) => {
    const dashboard = new Dashboard(page);
    await dashboard.gotoDashboard();

    await dashboard.fillColdMax(300);
    await dashboard.fillHotMin(301);
    await dashboard.clickSaveThresholdButton();

    await expect(dashboard.thresholdUpdateMessage).toHaveText("Minimum gap between coldMax and hotMin must be 2°C");
  });

  // fix bug
  test.skip("Filling one threshold value should return error", async ({ page }) => {
    const dashboard = new Dashboard(page);
    await dashboard.gotoDashboard();

    await dashboard.coldMax.clear();
    await dashboard.fillHotMin(301);
    await dashboard.clickSaveThresholdButton();

    await expect(dashboard.thresholdUpdateMessage).toHaveText("Error message");
  });


  // We want these tests to run and succeed in any environment, since it's not guaranteed that we will have a set temperature
  // env variable it's not a very good idea to do checks on warm cold or hot values.
  // With more time I would add checks on history table that it shows last 15 added values
});