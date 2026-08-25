# Playwright E2E Tests — Temperature Sensor

Standalone Playwright/TypeScript project covering the Temperature Sensor dashboard UI: capture,
history and threshold settings.

## Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose

## Quick start

Use two terminals: one keeps the application running, the other installs and runs the tests.

**Terminal 1 — start the application** (from the repository root):

```bash
# macOS / Linux
FIXED_TEMPERATURE=25.0 docker compose up --build
```

```powershell
# Windows PowerShell
$env:FIXED_TEMPERATURE = "25.0"
docker compose up --build
```

Leave this running. The app is now available at `http://localhost:3000`.

**Terminal 2 — install and run the tests** (from this `playwright-e2e-tests/` folder):

One-time setup:

```bash
cd playwright-e2e-tests
npm install
npx playwright install chromium
```

Once the app is up, run the whole suite with a single command:

```bash
npm test
```

Other useful commands:

```bash
npm run test:headed    # headed browser
npm run test:debug     # Playwright inspector
npm run report         # open the last HTML report
```

## Test suite

**20 tests, `npm test`** — expected to pass:

| File | Tests |
|---|---|
| `dashboard.spec.ts` | Dashboard loads with all sections and accessible controls · keyboard tab order is logical |
| `capture.spec.ts` | Repeated captures return the fixed temperature · capture button disables while the request is held in flight (deterministic via `page.route()`) · a WARM capture shows state, badge and re-enabled button · 6 classification boundaries (`COLD`/`WARM`/`HOT`, incl. exact `coldMax`/`hotMin`) |
| `history.spec.ts` | A capture appears at the top of history with correct values · a captured reading keeps the `coldMax`/`hotMin` active at capture time even after thresholds later change · history shows at most 15 readings |
| `thresholds.spec.ts` | Valid update: integers · decimals · minimum 2° gap · Invalid update rejected: `coldMax == hotMin` · `coldMax > hotMin` · gap below 2° |

## Project structure

```text
playwright-e2e-tests/
├── playwright.config.ts
├── pages/
│   └── DashboardPage.ts          # locators, navigation, user actions
├── fixtures/
│   └── test-fixtures.ts          # DashboardPage + threshold snapshot/restore
├── support/
│   ├── ThresholdApiClient.ts     # GET/PUT /api/thresholds
│   ├── test-data.ts              # fixed temperature, boundary/threshold cases
│   └── types.ts
└── tests/
    ├── dashboard.spec.ts
    ├── capture.spec.ts
    ├── history.spec.ts
    └── thresholds.spec.ts
```
## Why Cucumber was not used

Cucumber was not used because the project is small and Playwright test names already describe the scenarios clearly. Adding Gherkin files and step definitions would introduce unnecessary complexity and duplication. Cucumber would be more useful if the scenarios needed to be reviewed by non-technical stakeholders.

## Page Object Model (POM)

This project follows the Page Object Model pattern. `DashboardPage` centralizes dashboard locators and user interactions, while assertions remain in the test files.

`ThresholdApiClient` handles API-based setup and verification. The custom fixture provides both components to the tests and automatically snapshots and restores thresholds.

This separation keeps the tests readable, reusable and easier to maintain.

## Determinism and independence

`FIXED_TEMPERATURE` makes captures deterministic. Since the temperature cannot change without
restarting the application, tests instead vary thresholds through the API to exercise `COLD`,
`WARM` and `HOT`. A dedicated test fails clearly if the running app was not started with the
expected fixed temperature. Every test that changes thresholds snapshots the current values in a
fixture and restores them afterward, even on failure. Because thresholds are a single shared
record, the suite runs with one worker to avoid concurrent updates racing each other.

The in-flight capture button test holds the `/api/temperature/capture` response behind a
manually-released `page.route()` gate instead of racing the real (fast, local) request — this
guarantees the disabled state is observed on every run rather than depending on timing.

## Reports

```text
playwright-report/
test-results/junit.xml
```

## Limitations

- The History table has no accessible name or caption, and the capture result uses aria-live without an explicit status role. Tests therefore rely on the surrounding sections and stable structural locators for these elements.
- An empty-history UI state is not tested because it cannot be reproduced reliably without deleting existing readings.