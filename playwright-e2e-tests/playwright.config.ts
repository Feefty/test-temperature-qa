import { defineConfig } from "@playwright/test";

const baseURL = process.env.APP_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 10_000 },

  // The app holds one global mutable resource (the threshold singleton) and an
  // append-only history with no reset endpoint. Running workers in parallel would
  // let tests race on that shared state, so the suite runs as a single serial
  // worker instead — slower, but deterministic. See README for details.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
