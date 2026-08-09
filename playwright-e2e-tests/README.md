# Temperature Sensor — Playwright E2E Tests

Dedicated Playwright project, living inside this repository, covering the dashboard UI
of the [temperature sensor app](..) (the parent directory of this folder): capture,
history, and threshold settings.

## Run everything with one command

Requires Docker + Docker Compose. From this directory:

```bash
docker compose -f docker-compose.test.yml up --build --force-recreate --abort-on-container-exit --exit-code-from playwright
```

This will:

1. Start a throwaway PostgreSQL instance
2. Build the app from the parent directory and start it with `FIXED_TEMPERATURE=25.5`
3. Build this test project (official Playwright image, browsers included) and run the suite
4. Exit with the tests' exit code — `0` if everything passed

Every run rebuilds and recreates all three containers with no persistent volumes, so
each run starts from an empty database. This stack is fully separate from the one
started by the main project's own `docker compose up` and from `karate-api-tests`'
stack (own containers, own network, no shared ports) — all three can run side by side.

Clean up afterwards:

```bash
docker compose -f docker-compose.test.yml down -v --remove-orphans
```

### Viewing the reports

Bind-mounted back to the host after a run:

- HTML report: `playwright-report/index.html`
- JUnit XML: `test-results/junit.xml`

## Why the suite runs serially, not in parallel

Playwright parallelizes by default. This app has one global mutable resource (the
threshold singleton) and an append-only reading history with no reset endpoint — running
tests in parallel would let them race on that shared state (one test's threshold change
leaking into another's assertion). `playwright.config.ts` sets `fullyParallel: false` and
`workers: 1` to trade some speed for a deterministic, non-flaky run.

## How independence and determinism are achieved

- **`FIXED_TEMPERATURE`** pins the sensor to one constant value (`25.5°C` by default) for
  the whole run, so every capture is predictable.
- **Thresholds are set through the API** (`tests/support/api.ts`) as test *setup*, not
  through the UI — each test that depends on a particular state (WARM/COLD/HOT, a
  specific validation error) sets exactly the thresholds it needs before acting through
  the UI, rather than assuming whatever a previous test left behind.
- **`03-thresholds.spec.ts`** resets to a known-good `{coldMax: 22, hotMin: 35}` in
  `beforeEach`, so those tests don't depend on each other's edits.
- **Spec files are numbered** (`01-…` to `06-…`) because execution order matters once:
  `02-history-empty.spec.ts` asserts the true empty state, which is only meaningful
  *before* any capture has happened anywhere in the suite. Combined with `workers: 1`,
  numbering the files pins that ordering explicitly instead of leaving it to filesystem
  discovery order.
- A fresh database on every full run (no persistent volumes) means the suite is also
  independent **between** runs, not just within one.

## Cucumber/BDD

Not added. The suite is small enough that plain Playwright test titles already read as
specs (`"rejects coldMax equal to hotMin"`), and layering Gherkin on top would mean
maintaining feature files and step definitions for no real gain in clarity here — it
would be boilerplate, which the exercise explicitly asks to avoid.

## Running without Docker

Requires Node.js 20+, plus the app already running somewhere with a fixed temperature:

```bash
# from the parent directory
FIXED_TEMPERATURE=25.5 docker compose up --build -d

# from this directory
npm install
npx playwright install --with-deps chromium
APP_URL=http://localhost:3000 FIXED_TEMPERATURE=25.5 npm test
```

## Project structure

```
playwright-e2e-tests/
├── docker-compose.test.yml   # throwaway db + app + playwright runner, one command
├── Dockerfile                 # official Playwright image, runs the suite
├── playwright.config.ts       # serial execution, HTML + JUnit reporters
├── package.json
├── tsconfig.json
└── tests/
    ├── support/
    │   └── api.ts             # FIXED_TEMPERATURE + threshold setup helper
    ├── 01-dashboard.spec.ts
    ├── 02-history-empty.spec.ts
    ├── 03-thresholds.spec.ts
    ├── 04-capture.spec.ts
    ├── 05-history.spec.ts
    └── 06-accessibility.spec.ts
```
