# Test Strategy: Temperature Sensor

## Scope and Approach

I tested both the API (four endpoints: capture, history, thresholds GET/PUT) and the dashboard UI (capture button, history table, threshold form). Approach was manual exploration: hitting endpoints directly in Postman and reading the specs to understand actual behavior, then exercising the same flows through the browser to compare UI and API behaviors. I prioritized boundary values and validation gaps over exhaustive happy-path coverage.

## 1. Bug Identification

### UI
- Missing validation & blocked UI on partial input: UI stuck in "Saving..." state when I enter only one threshold (for example: coldMax), Expected : Clear validation message "hotMin or coldMax is required" (Severity: Critical)
- Incorrect error message for empty fields : When both threshold fields are empty, the application displays "coldMax must be strictly less than hotMin" instead of "coldMax and hotMin are required" (Severity: Major)

### API
- Data inconsistency on partial update: Sending {"coldMax": 40} while hotMin = 35 returns 200 OK and saves invalid values (coldMax > hotMin). Expected: 400 Bad Request with validation against existing data. (Critical)
- Crash on wrong type: Sending a string (for example "test") for coldMax/hotMin returns 500. 
Expected: 400 with clear “must be a number” message. (Critical)
- Crash on null value: Sending {"coldMax": null, "hotMin": 30} returns 500 (non-nullable field). Expected: 400 “coldMax is required”. (Major)
- Unreachable thresholds accepted: Values outside sensor range (-10 to 50) return 200 OK, making HOT/COLD unreachable.
Expected: 400 or warning. (Major)
- Field naming inconsistency: POST /capture uses timestamp while GET /history uses capturedAt for the same data. Expected: consistent field name. (Minor)

## 2. Test Plan & High-Risk Areas

Roughly highest to lowest risk:

- Threshold form (UI) : direct user impact; stuck button or unclear message = bad UX.
- Temperature classification : wrong logic means the dashboard shows the wrong status.
- Threshold validation (API) : main source of bugs; directly affects UI.
- API consistency : inconsistent field names can break integrations.
- Error handling : crashes instead of clear messages.
- History list : lower risk.
- Fixed test mode : mainly for testing, low user impact.

## 3. Prioritization (limited time)

If I had limited time, I’d focus on:

- Reproducing the stuck "Saving..." button (high user impact).
- Testing form errors (empty, partial, invalid inputs).
- Verifying boundary values for temperature classification.
- Checking history limit (15 items).
- Validating API responses (capture + thresholds, naming consistency).
- Everything else (rare edge cases) if time allows.

## 4. Edge Cases

**Threshold values**
- coldMax equal to hotMin (should be rejected)
- coldMax greater than hotMin (should be rejected)
- gap of exactly 2 degrees (should be accepted)
- gap of 1.9 degrees (should be rejected)
- negative values, or zero
- very large numbers
- empty, missing, or wrong-type values


**Temperature / classification**
- temperature exactly equal to coldMax (should show WARM, not COLD)
- temperature exactly equal to hotMin (should show HOT)
- temperature just above or below each limit
- fixed test temperature set outside the normal sensor range

**History**
- no readings yet
- exactly 15 readings
- more than 15 readings (the oldest one should disappear)
- changing thresholds after a reading was saved shouldn't change that old reading

**Concurrency**
- clicking Capture very quickly, multiple times in a row


## 5. What I'd add with more time

- Accessibility testing: ensure the app works with keyboard navigation and screen readers.
- Cross-browser & cross-device testing: verify compatibility across different browsers and devices.
- Extra coverage on temperature classification logic, as it’s small but critical.
