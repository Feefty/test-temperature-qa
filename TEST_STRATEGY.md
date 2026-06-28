## 1. Bug Identification

### Confirmed API contract inconsistency

* The API uses two different field names for the temperature capture date:

  * `POST /api/temperature/capture` returns `timestamp`
  * `GET /api/temperature/history` returns `capturedAt`
* Both fields represent the same business information: the date and time when the temperature was captured.
* This should be aligned to keep the API contract consistent and easier to consume.

### Confirmed missing validations

* `PUT /api/thresholds` does not properly validate that `coldMax` and `hotMin` are valid numeric values.
* When `coldMax` is sent as a non-numeric value, the API currently returns `500 Internal Server Error` instead of a controlled `400 Bad Request`.
* When `hotMin` is missing from the payload, the API currently accepts the request with `200 OK` instead of rejecting it with a validation error.

### Confirmed business rules

* `coldMax` must be strictly lower than `hotMin`.
* The minimum gap between `coldMax` and `hotMin` must be at least `2°C`.
* Temperature classification follows this logic:

  * `temperature < coldMax` → `COLD`
  * `coldMax <= temperature < hotMin` → `WARM`
  * `temperature >= hotMin` → `HOT`

### Functional observations

* The History section correctly keeps only the latest 15 temperature readings.
* History data is persisted after a page refresh.
* The current captured temperature displayed in the Capture section is cleared after a page refresh, while the History remains available. This behavior should be clarified with the Product Owner to confirm whether it is intentional.

## 2. Test Plan

### API testing

The API test coverage focuses on the two endpoints explicitly requested in the exercise:

* `POST /api/temperature/capture`
* `PUT /api/thresholds`

The objective is to validate both happy paths and high-risk edge cases.

For `POST /api/temperature/capture`, the main risks are:

* non-deterministic sensor values;
* incorrect temperature classification;
* unstable API response contract;
* inconsistent timestamp field naming.

For `PUT /api/thresholds`, the main risks are:

* invalid threshold configuration;
* missing backend validation;
* unexpected server errors;
* inconsistent error handling.

### E2E testing

The E2E tests focus on the dashboard user journey:

* dashboard loads correctly;
* the main sections are visible;
* the user can capture a deterministic temperature;
* the captured temperature and state are displayed;
* threshold validation errors are visible to the user.


## 3. Prioritization

Given the 3-hour timebox, I prioritized tests that provide the highest value and are most likely to catch real defects.

### Highest priority

* `POST /api/temperature/capture` with `FIXED_TEMPERATURE` to make the capture flow deterministic.
* `PUT /api/thresholds` validation rules because invalid threshold configuration directly impacts temperature classification.
* Negative API scenarios for missing or invalid threshold values because backend validation is a high-risk area.
* E2E dashboard smoke test to ensure the main user interface loads correctly.
* E2E capture scenario to verify that the user can trigger a deterministic reading and see the result.

### Lower priority

* Full automation of `GET /api/temperature/history`.
* Full automation of `GET /api/thresholds`.
* Cross-browser E2E execution.
* Performance testing.
* Accessibility testing.

The priority was to favor depth over breadth, as requested in the exercise, by focusing on meaningful assertions, edge cases, and known-risk areas instead of covering every endpoint superficially.

## 4. Edge Cases

### Threshold boundaries

* `coldMax == hotMin` should be rejected.
* `coldMax > hotMin` should be rejected.
* `hotMin - coldMax < 2°C` should be rejected.
* Negative threshold values should be allowed unless the business explicitly forbids them.
* Decimal threshold values should be supported because the UI allows `step="0.1"`.

### Invalid threshold payloads

* Missing `hotMin`.
* Missing `coldMax`.
* Non-numeric values such as `"abc"`.
* `null` values.
* Empty request body.

### Temperature classification boundaries

With `coldMax = 20` and `hotMin = 35`:

* `temperature < 20` should be `COLD`.
* `temperature = 20` should be `WARM`.
* `20 < temperature < 35` should be `WARM`.
* `temperature = 35` should be `HOT`.
* `temperature > 35` should be `HOT`.

### UI edge cases

* Multiple rapid clicks on `Capture Temperature`.
* Page refresh after a capture.
* Threshold update with invalid values.
* Error message visibility after failed threshold update.
* History should keep only the latest 15 readings.

## 5. What I Would Add With More Time

- Add Karate coverage for `GET /api/temperature/history` and `GET /api/thresholds`.
- Validate the history response contract, ordering by most recent capture, and the maximum size of 15 readings.
- Validate API contract consistency between `timestamp` and `capturedAt`.
- Add more deterministic temperature classification tests using different `FIXED_TEMPERATURE` values:
  - cold value
  - boundary value
  - warm value
  - hot value
- Add database reset or test isolation strategy to guarantee fully independent test runs.
- Add cross-browser E2E execution for Chromium, Firefox, and WebKit.
- Add accessibility checks for keyboard navigation and ARIA attributes.
- Add CI/CD execution using GitHub Actions or a dedicated `docker-compose.test.yml`.
- Add performance testing with k6 for the capture endpoint under repeated load.
- Publish API and E2E test reports as CI artifacts.