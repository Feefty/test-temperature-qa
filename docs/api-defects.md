# Feefty Temperature Sensor — API Defect Report

## Execution context
- API base URL: `http://localhost:3000`
- Framework: Karate 1.4.1, JUnit 5, Maven
- Test branch: `feature/qa-automation` (based on `develop`)
- Evidence: local exploratory API requests and Karate scenarios, 7 November 2026
- Results across three separate runs: 18 scenarios, 12 passed, 6 failed. Not a single consolidated run.

## BUG-01 — Partial threshold update bypasses configuration invariants
**Severity:** High (functional/data integrity)

**Steps:**
1. Set valid thresholds `coldMax=-5`, `hotMin=-3`.
2. `PUT /api/thresholds` with body `{ "coldMax": 20 }`.
3. `GET /api/thresholds`.

**Expected:** Reject an update that would make `coldMax >= hotMin` or violate the minimum 2°C gap; preserve the previous pair.

**Observed:** Partial update was accepted and the invalid pair `coldMax=20`, `hotMin=-3` persisted. Full-pair restoration to `-5/-3` was subsequently verified.

**Automated coverage:** `thresholds.feature` — partial-update regression scenario; fails against current application.

## BUG-02 — Invalid threshold value types yield HTTP 500
**Severity:** Medium (input validation/error handling)

**Steps:** Send each of these bodies with `PUT /api/thresholds`:
- `{ "coldMax": "20", "hotMin": "22" }`
- `{ "coldMax": "abc", "hotMin": "xyz" }`
- `{ "coldMax": [20], "hotMin": [22] }`
- `{ "coldMax": null, "hotMin": 35 }`

**Expected:** Client input rejected with a controlled 4xx response (the regression suite uses HTTP 400).

**Observed:** HTTP 500 with empty response for each case.

**Automated coverage:** `negative-thresholds.feature`; four failing scenarios. Because the HTTP-status assertions fail, their subsequent persistence assertions are not executed in those runs.

## BUG-03 — Malformed JSON yields HTTP 500
**Severity:** Medium (request parsing/error handling)

**Steps:** `PUT /api/thresholds` with `Content-Type: application/json` and malformed body `{"coldMax": 20, "hotMin": `.

**Expected:** Controlled 4xx client error (the regression suite uses HTTP 400).

**Observed:** HTTP 500 with empty response.

**Automated coverage:** `negative-thresholds.feature`; failing scenario. Subsequent persistence assertion was not executed after status failure.

## API contract observation — timestamp naming
`POST /api/temperature/capture` responds with `timestamp`, while `GET /api/temperature/history` represents the same time as `capturedAt`. This inconsistency is present in the route implementation. It should be documented as a contract/design concern, not asserted as a confirmed functional failure without a specification requiring consistent naming.

## History behavior
`GET /api/temperature/history` returns the latest 15 readings ordered by `capturedAt` descending (`take: 15`). This is response-window limiting, **not database deletion**. The capture/history Karate suite passed 2 scenarios; its run created 17 readings.

## Submission notes
- Known failing regression tests are retained intentionally to make defects reproducible.
- `mvn test` across all suites will fail while these defects remain unfixed.
- Do not classify these as Maven or Karate infrastructure failures.
- Test outputs and exploratory helper scripts are excluded from version control.
