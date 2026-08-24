# k6 Performance Tests — Temperature Sensor

Standalone k6 project covering `POST /api/temperature/capture`, the main write endpoint used for each temperature reading.

## Project Structure

```text
k6-performance-tests/
├── config.js       # Configuration and environment variables
├── checks.js       # Shared response validations
├── capture.js      # Shared VU body (capture, check, pace) used by both scripts
├── smoke-test.js   # 1 virtual user, 5 iterations
└── load-test.js    # Configurable load test
```

## Prerequisites

* Docker
* Docker Compose
* The application running at `http://localhost:3000`

k6 does not need to be installed locally because all tests run through the official Docker image.

## 1. Start the Application

From the repository root, open a first PowerShell terminal:

```powershell
$env:FIXED_TEMPERATURE = "25.0"
docker compose up --build
```

Wait until the application is available at http://localhost:3000.

## 2. Run the Performance Tests

Open a second PowerShell terminal and navigate to the test directory:

```powershell
cd k6-performance-tests
```

### Smoke Test

Validates the script and endpoint with one virtual user and five iterations:

```powershell
docker run --rm -i -e BASE_URL=http://host.docker.internal:3000 -e FIXED_TEMPERATURE=25.0 -v "${PWD}:/scripts" grafana/k6:latest run /scripts/smoke-test.js
```

### Load Test

Runs the default load scenario:

```powershell
docker run --rm -i -e BASE_URL=http://host.docker.internal:3000 -e FIXED_TEMPERATURE=25.0 -v "${PWD}:/scripts" grafana/k6:latest run /scripts/load-test.js
```

### Custom Load Test

Example with 30 virtual users and a one-minute plateau:

```powershell
docker run --rm -i -e BASE_URL=http://host.docker.internal:3000 -e FIXED_TEMPERATURE=25.0 -e VUS=30 -e DURATION=1m -v "${PWD}:/scripts" grafana/k6:latest run /scripts/load-test.js
```

## HTML Reports

### Smoke Test Report

Run the smoke test and generate an HTML report:

```powershell
docker run --rm --user root -e BASE_URL=http://host.docker.internal:3000 -e FIXED_TEMPERATURE=25.0 -e K6_WEB_DASHBOARD=true -e K6_WEB_DASHBOARD_EXPORT=/scripts/k6-smoke-report.html -e K6_WEB_DASHBOARD_PERIOD=1s -e K6_WEB_DASHBOARD_PORT=-1 -v "${PWD}:/scripts" grafana/k6:latest run /scripts/smoke-test.js
```

Open the generated report:

```powershell
Invoke-Item .\k6-smoke-report.html
```

### Load Test Report

Run the load test and generate an HTML report:

```powershell
docker run --rm --user root -e BASE_URL=http://host.docker.internal:3000 -e FIXED_TEMPERATURE=25.0 -e K6_WEB_DASHBOARD=true -e K6_WEB_DASHBOARD_EXPORT=/scripts/k6-load-report.html -e K6_WEB_DASHBOARD_PERIOD=1s -e K6_WEB_DASHBOARD_PORT=-1 -v "${PWD}:/scripts" grafana/k6:latest run /scripts/load-test.js
```

Open the generated report:

```powershell
Invoke-Item .\k6-load-report.html
```

Reports are generated inside the `k6-performance-tests` directory.

## Configuration

| Variable            |                 Default | Description                                       |
| ------------------- | ----------------------: | ------------------------------------------------- |
| `BASE_URL`          | `http://localhost:3000` | Target application URL                            |
| `FIXED_TEMPERATURE` |                  `25.0` | Expected fixed temperature                        |
| `VUS`               |                    `10` | Target virtual users during the load-test plateau |
| `DURATION`          |                   `30s` | Duration of the load-test plateau                 |

`VUS` and `DURATION` apply only to `load-test.js`.

## Workload

The load test follows three stages:

1. Ramp from 0 to `VUS` over 10 seconds.
2. Maintain `VUS` for `DURATION`.
3. Ramp back down to 0 over 10 seconds.

Each virtual user waits one second between captures. With the default 10 virtual users, the expected throughput is approximately 10 requests per second.

## Validations

Every response is checked for:

* HTTP status `201`;
* required fields: `id`, `state`, `coldMax`, `hotMin` and `timestamp`;
* a temperature equal to `FIXED_TEMPERATURE`.

## Performance Thresholds

`load-test.js` thresholds:

| Threshold                         | Expected Result                          |
| --------------------------------- | ---------------------------------------- |
| `http_req_failed < 1%`            | Fewer than 1% of requests fail           |
| `http_req_duration p(95) < 300ms` | 95% of requests complete within 300 ms   |
| `http_req_duration p(99) < 600ms` | 99% of requests complete within 600 ms   |
| `checks > 99%`                    | More than 99% of response checks succeed |

`smoke-test.js` is stricter, since it is meant to catch a broken script or endpoint outright: it
requires 0% failed requests and 100% of checks passing.

The test exits with a non-zero status when a threshold is exceeded.

## Limitations

* Every capture writes a new row to `TemperatureReading`; there is no cleanup between runs.
* Only `POST /api/temperature/capture` is covered; `PUT /api/thresholds` is not load-tested.
* Results reflect one local, single-instance container, not a production topology.