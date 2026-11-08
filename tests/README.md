# QA Automation â€” Running the Tests

This directory contains a **Karate/JUnit 5/Maven** API suite (`api/`) and a **Playwright/TypeScript** dashboard suite (`e2e/`). Application source code is unchanged. See [`../docs/test-strategy.md`](../docs/test-strategy.md) and [`../docs/api-defects.md`](../docs/api-defects.md).

## Prerequisites

- Docker with Compose; ports 3000 and 5432 available.
- Java 17+ and Maven for Karate.
- Node.js and Yarn (the repository has `yarn.lock`) for Playwright.
- Playwright Chromium browser binaries.

Run commands from the **repository root** unless otherwise stated.

## Start the application in deterministic mode

**Windows PowerShell:**

```powershell
$env:FIXED_TEMPERATURE = '25.5'
docker compose up -d --build
```

**Bash:**

```bash
FIXED_TEMPERATURE=25.5 docker compose up -d --build
```

The app is at `http://localhost:3000`. Database migrations and seed run on container startup. For an already-built app, an environment-only change can be applied with `docker compose up -d --no-deps --force-recreate app`, while the variable is set in the current shell.

Verify the **container** environment and API response:

```powershell
docker compose exec app printenv FIXED_TEMPERATURE
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/temperature/capture'
```

The response must contain `temperature: 25.5`. The `state` depends on the active thresholds. Verification POSTs add history records. Do not run `docker compose up -d` later without retaining the variable in the shell or environment configuration.

## Karate API suite

From the repository root:

```powershell
cd tests/api
mvn test
```

Or without changing directories:

```powershell
mvn -f tests/api/pom.xml test
```

The normal Maven run uses the JUnit runners that exclude scenarios tagged `@knownBug`. The deterministic classification scenarios require the fixed app temperature of 25.5Â°C.

To deliberately reproduce the **six known API failures**:

```powershell
mvn -f tests/api/pom.xml '-Dtest=KnownBugsRunner' test
```

A nonzero Maven exit code is **expected** for that command while the defects remain. Do not use this command as a required green CI check. Reports are generated under `tests/api/target/karate-reports/` and `tests/api/target/surefire-reports/`.

## Playwright E2E suite

Install dependencies and the browser from the repository root:

```powershell
yarn install
.\node_modules\.bin\playwright.cmd install chromium
```

Run the complete Chromium suite:

```powershell
.\node_modules\.bin\playwright.cmd test --project=chromium
```

Bash alternative:

```bash
./node_modules/.bin/playwright test --project=chromium
```

To open the HTML report:

```powershell
.\node_modules\.bin\playwright.cmd show-report tests/e2e/playwright-report
```

Playwright traces and screenshots on failure are written to `tests/e2e/test-results/`. One known-UX scenario is intentionally skipped because auto-dismissal is not specified as a requirement.

## Expected status and execution notes

The most recent verified *separate* runs were:

| Run | Verified result |
| --- | --- |
| Default Karate before deterministic addition | 12 passed |
| Karate deterministic classification | 3 passed |
| Known API defects | 6 failures reproduced intentionally |
| Default Playwright before deterministic addition | 4 passed, 1 skipped |
| Playwright deterministic capture | 1 passed |

A full post-addition regression run is still required; expected default totals are **15 passing Karate** and **5 passing Playwright with 1 skipped**. The expected counts are not a substitute for actual run results.

**Shared-state limitation:** The tests use the same PostgreSQL database. Threshold-mutating tests restore settings, but capture tests create persistent history records. Avoid parallel suite execution and use a dedicated test database for repeatable CI runs.

**Windows note:** If `yarn.ps1` emits a warning that PowerShell treats as a terminating error, call the local `playwright.cmd` binary directly, as shown above.
