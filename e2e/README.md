# Temperature Sensor: E2E Tests (Playwright)

Playwright tests covering the dashboard UI: capture, history, and threshold settings.

## Prerequisites

- The app under test running locally at `http://localhost:3000` from the repo root:
  ```bash
  docker compose up --build
  ```

## Setup (first time only)

```bash
cd e2e
npm install
npx playwright install chromium
```

## Run the suite (single command)

```bash
npx playwright test [--ui]
```

## What's covered

- `tests/capture.spec.ts` : verifies that a temperature and state are displayed after a capture.
- `tests/history.spec.ts` : verifies that the new capture appears at the top and that the table never has more than 15 rows.
- `tests/thresholds.spec.ts` :
  - verifies that a valid update works
  - empty fields currently show an incorrect business rule error instead of a required-field message
  - a separate `BUG:` test locks in the confirmed stuck "Saving..." button issue when only Cold Max is left empty

  See TEST_STRATEGY.md for more details about these bugs.