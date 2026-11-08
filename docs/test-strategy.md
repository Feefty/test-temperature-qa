# Temperature Sensor â€” QA Test Strategy

## Objective and scope

Risk-based validation of the Temperature Sensor dashboard and its HTTP API. Focus on threshold configuration integrity, temperature classification, capture persistence, and user-visible behavior. The application intentionally contains defects; tests should demonstrate them without modifying production code.

The assessment asks for a short strategy, a separate Karate API project, and Playwright E2E coverage. Prioritize meaningful assertions and reproducible defect evidence over broad but shallow coverage.

## Risk-based priorities

| Priority | Risk | Why it matters | Approach |
| --- | --- | --- | --- |
| P0 | Invalid threshold pairs persist | Incorrect classification and corrupted configuration | API positive/negative/boundary tests; partial-update regression |
| P0 | Incorrect COLD/WARM/HOT classification | Core sensor functionality | Deterministic `FIXED_TEMPERATURE=25.5` scenarios with different threshold pairs |
| P0 | Invalid input causes server errors | Poor validation and uncontrolled 500 responses | Karate negative payloads and malformed JSON |
| P1 | Capture/history inconsistency | Missing or misleading readings | Capture 201, persistence, latest-15 response window and dashboard refresh |
| P1 | UI validation and persistence | Users may think a rejected change was saved | Playwright valid/invalid updates, reload and feedback |
| P2 | Feedback accessibility and lifecycle | Confusing or persistent UI notifications | Known UX observation; optional regression |

## Findings and defect evidence

Detailed steps and observations: [`api-defects.md`](api-defects.md).

- **BUG-01 (high):** Partial PUT `{ "coldMax": 20 }` can persist `coldMax=20, hotMin=-3`, violating ordering and the 2Â°C minimum gap.
- **BUG-02 (medium):** Invalid value types (strings, arrays, null with a numeric partner) return HTTP 500 with empty responses. Controlled client-error responses are expected; the defect tests assert 400.
- **BUG-03 (medium):** Malformed JSON returns HTTP 500 instead of a controlled client error.
- **API consistency observation:** Capture responds with `timestamp`; history responds with `capturedAt`. This is a naming inconsistency, not independently established as a functional failure.
- **UI observation:** Threshold success feedback persists; automatic dismissal is not explicitly required by the supplied specification, so the Playwright check remains skipped.
- **Initial capture display:** The current UI renders a captured value only after the user triggers a capture. Whether a default value should be shown is a product requirement question, not a confirmed bug.

## Test design

### API â€” Karate

- GET/PUT threshold behavior: valid full updates, minimum gap, equality, reversed values, negative values, persistence and partial-update invariants.
- Invalid request types and malformed JSON; verify error status and, where assertions proceed, that stored thresholds are unchanged.
- POST capture: HTTP 201, response fields and classification.
- GET history: captured reading appears, returned window has at most 15 records, ordered newest first. A 15-item response limit does **not** imply deletion of older database rows.
- Deterministic classification with fixed temperature **25.5Â°C**:

| coldMax | hotMin | Captured temperature | Expected |
| ---: | ---: | ---: | --- |
| 20 | 22 | 25.5 | HOT |
| 24 | 27 | 25.5 | WARM |
| 26 | 28 | 25.5 | COLD |

### UI â€” Playwright

- Save valid thresholds, confirm success and persistence after reload.
- Reject invalid threshold gap, show error feedback and preserve stored settings.
- Capture a reading, display temperature/state, refresh history and enforce at most 15 visible rows.
- In deterministic mode, verify the exact `25.5Â°C` capture and HOT classification.
- Retain the success-message dismissal check as an explicitly skipped observation until a product requirement defines its lifecycle.

## Additional boundary and negative cases

Consider equality, 1.9Â°C/2.0Â°C/2.1Â°C gaps, reversed and negative thresholds, missing fields, nulls, strings, arrays, malformed JSON, and numeric precision. Also consider classification exactly at `coldMax` and `hotMin`; expected inclusivity should be confirmed from the specification and classifier implementation before asserting it. Other worthwhile cases include API failures during UI save/capture, history timestamp ordering ties, and concurrent threshold updates.

## Isolation, determinism and limitations

- The application must be started with `FIXED_TEMPERATURE=25.5` **in the app container**, not only in the test shell. Restarting Compose without this variable can silently restore random readings.
- Threshold-mutating Playwright tests use cleanup to restore the original values. Deterministic scenarios are designed to restore thresholds after their assertions.
- Tests still share a PostgreSQL database. Capture tests append persistent readings; execution is serial, not fully isolated. Do not run suites concurrently against the same database.
- The default Karate run excludes six `@knownBug` scenarios, preserving a green functional baseline while keeping the defects reproducible through `KnownBugsRunner`.
- Current results were verified locally on Windows with Docker, Maven and Chromium. They do not establish CI portability or cross-browser coverage.

## Execution evidence (8 November 2026)

- Before deterministic additions: default Karate 12 passed; known-defect runner 6 failed as expected; Playwright 4 passed and 1 skipped.
- Added deterministic tests: Karate 3 passed; Playwright 1 passed; thresholds restored to `-5/-3`.
- **The expanded suites have not yet been executed together**. Expected default totals are 15 Karate passing and 5 Playwright passing with 1 skipped; these are targets, not a recorded combined result.

## Further improvements

1. Provision a fresh database per test run or isolate data by test-specific database/schema; seed known initial state.
2. Add a dedicated Docker test profile with fixed sensor values and readiness checks, then CI jobs for default Karate and Playwright runs.
3. Add deterministic equality and classification boundary cases, stronger response schemas, and error-handling assertions.
4. Extend browser coverage, accessibility checks, network-failure handling, and optional performance/load tests for capture.
5. Review timestamp contract consistency and notification lifecycle with the product owner.

## Executable test-case traceability

See [Test Case Catalogue](test-cases.md) for the implemented API and E2E scenario inventory, source references, and known-defect mapping.
