# Test Case Catalogue — Feefty Temperature Sensor

## Scope and conventions

This catalogue maps the implemented Karate API and Playwright E2E tests to their expected outcomes. The executable source files remain authoritative for exact assertions and setup. Priorities are risk-based recommendations, not requirements from `SPEC.md`.

- **Default:** part of the normal regression run.
- **Known defect:** deliberately excluded from the passing API suite (`@knownBug`); assertions describe the desired behavior and currently fail.
- **Skipped by default:** Playwright opt-in reproduction, not a confirmed `SPEC.md` requirement.
- **Environment:** application at `http://localhost:3000` with PostgreSQL; deterministic classification requires `FIXED_TEMPERATURE=25.5` in the application container.
- **Last reported run:** Karate 15 passed (default); six known-defect cases failed as expected when run separately. Playwright 5 passed, one skipped. These are suite totals, not individual archived test reports.

## API test cases — Karate

| ID | Priority | Scenario / test data | Expected result | Execution | Source |
|---|---|---|---|---|---|
| API-001 | P0 | POST capture, then GET history | Capture returns 201 with ID, temperature, state, thresholds and timestamp; matching reading appears in history with mapped `capturedAt` | Default | `capture-history.feature` |
| API-002 | P0 | Perform 16 captures, then GET history | Latest 15 readings returned newest first; oldest of the 16 excluded | Default | `capture-history.feature` |
| API-003a | P0 | Fixed 25.5°C, thresholds (20,22) | 201; `temperature=25.5`, `state=HOT`, thresholds echoed | Default | `deterministic-capture.feature` |
| API-003b | P0 | Fixed 25.5°C, thresholds (24,27) | 201; `temperature=25.5`, `state=WARM`, thresholds echoed | Default | `deterministic-capture.feature` |
| API-003c | P0 | Fixed 25.5°C, thresholds (26,28) | 201; `temperature=25.5`, `state=COLD`, thresholds echoed | Default | `deterministic-capture.feature` |
| API-004 | P1 | PUT numeric strings `"20"`, `"22"` | 400; existing thresholds unchanged | Known defect | `negative-thresholds.feature` |
| API-005 | P1 | PUT nonnumeric strings `"abc"`, `"xyz"` | 400; existing thresholds unchanged | Known defect | `negative-thresholds.feature` |
| API-006 | P1 | PUT array values `[20]`, `[22]` | 400; existing thresholds unchanged | Known defect | `negative-thresholds.feature` |
| API-007 | P1 | PUT `coldMax=null`, `hotMin=35` | 400; existing thresholds unchanged | Known defect | `negative-thresholds.feature` |
| API-008 | P1 | PUT malformed JSON | 400; existing thresholds unchanged | Known defect | `negative-thresholds.feature` |
| API-009 | P1 | PUT boolean thresholds `false`, `true` | 400; existing thresholds unchanged | Default | `negative-thresholds.feature` |
| API-010 | P0 | GET persisted thresholds | 200; numeric `coldMax` and `hotMin`, gap at least 2°C | Default | `thresholds.feature` |
| API-011a | P0 | PUT valid (20,22) — minimum 2°C gap | 200; values persisted; original configuration restored | Default | `thresholds.feature` |
| API-011b | P0 | PUT valid (0,2) — zero boundary | 200; values persisted; original configuration restored | Default | `thresholds.feature` |
| API-011c | P0 | PUT valid (-2,0) — negative/zero boundary | 200; values persisted; original configuration restored | Default | `thresholds.feature` |
| API-011d | P0 | PUT valid (-5,10) — negative/positive | 200; values persisted; original configuration restored | Default | `thresholds.feature` |
| API-012a | P0 | PUT invalid (0,0) — equal thresholds | 400; existing configuration unchanged | Default | `thresholds.feature` |
| API-012b | P0 | PUT invalid (20,20) — equal thresholds | 400; existing configuration unchanged | Default | `thresholds.feature` |
| API-012c | P0 | PUT invalid (20,-5) — reversed thresholds | 400; existing configuration unchanged | Default | `thresholds.feature` |
| API-012d | P0 | PUT invalid (20,21.99) — gap below 2°C | 400; existing configuration unchanged | Default | `thresholds.feature` |
| API-013 | P0 | Partial PUT with `coldMax = current hotMin + 3` | 400; no invalid threshold pair persisted | Known defect | `thresholds.feature` |

All source paths in this table are relative to `tests/api/src/test/java/feefty/`.

### API procedure and preconditions

1. Start the application and database. For API-003a–c, set `FIXED_TEMPERATURE=25.5` **in the running application container**.
2. For threshold update cases, read the original configuration using `GET /api/thresholds` before sending `PUT /api/thresholds`.
3. Check the expected HTTP status and verify persisted values with a subsequent GET; valid-update cases restore the original configuration.
4. For capture cases, send `POST /api/temperature/capture`; verify the response and, where specified, `GET /api/temperature/history`.
5. Run `@knownBug` cases separately from the default passing suite. API-013 restores the original configuration before its intentionally failing assertions. Capture/history tests create database records; the suite is not fully isolated.

## E2E test cases — Playwright

| ID | Priority | Scenario | Expected result | Execution | Source |
|---|---|---|---|---|---|
| E2E-001 | P1 | Capture a reading from dashboard | Captured temperature and state displayed | Default | `capture.spec.ts` |
| E2E-002 | P0 | Capture fixed 25.5°C with HOT thresholds | Dashboard displays 25.5°C and HOT | Default | `deterministic-capture.spec.ts` |
| E2E-003 | P0 | Capture and inspect history | History refreshes; no more than 15 readings displayed | Default | `history.spec.ts` |
| E2E-004 | P1 | Save thresholds and observe success message | Proposed UX expectation: success message becomes hidden within 5 seconds | **Skipped by default; opt-in known UX issue** | `known-defects.spec.ts` |
| E2E-005 | P0 | Save valid thresholds and reload | Saved thresholds persist after reload | Default | `thresholds.spec.ts` |
| E2E-006 | P0 | Submit invalid threshold gap | Invalid update rejected; stored configuration unchanged | Default | `thresholds.spec.ts` |

All source paths in this table are relative to `tests/e2e/specs/`. UI interactions and precise locators are implemented in the spec files and `tests/e2e/pages/TemperaturePage.ts`.

**E2E-004 qualification:** `known-defects.spec.ts` explicitly describes auto-dismiss as a *proposed UX requirement*, not a behavior established by `SPEC.md`. The test calls `test.skip` unless `E2E_KNOWN_BUGS=1`; it must not be reported as a passing default test.

## Traceability, defects and limitations

- API defect descriptions and observed behavior: [`api-defects.md`](api-defects.md).
- Test rationale, risk priorities and unimplemented scenarios: [`test-strategy.md`](test-strategy.md).
- Setup, commands, reporting and shared-state caveats: [`../tests/README.md`](../tests/README.md).
- This catalogue records **21 Karate scenario executions** (15 default + six known-defect) across **13 scenario definitions**, plus six Playwright test definitions (five default passing, one skipped in the reported run).
- A known-defect case describes **expected** behavior and is intentionally failing against the observed implementation. It is not evidence that the application passes that case.
- This is a traceability inventory, not a claim of complete boundary, accessibility, performance or concurrency coverage.
