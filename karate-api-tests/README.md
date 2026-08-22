# Karate API Tests — Temperature Sensor

Standalone Karate/Maven project covering two endpoints of the `temperature-sensor` application:

- `POST /api/temperature/capture`
- `PUT /api/thresholds`

It does not modify the application source code.

## Prerequisites

- JDK 17+
- Maven 3.9+
- Docker and Docker Compose

## Project structure

```text
karate-api-tests/
├── pom.xml
└── src/test/java/
    ├── karate-config.js              # baseUrl + fixedTemperature
    └── api/
        ├── ApiTestRunner.java        # stable suite (mvn test)
        ├── KnownBugTestRunner.java   # known-bug suite
        ├── helpers/                  # reusable feature files (@ignore)
        ├── capture/
        │   └── capture.feature       # stable suite
        └── thresholds/
            ├── thresholds.feature            # stable suite
            └── thresholds-known-bugs.feature # known-bug suite
```

## Starting the application

From the repository root:

```bash
# macOS / Linux
FIXED_TEMPERATURE=25.0 docker compose up --build
```

```powershell
# Windows PowerShell
$env:FIXED_TEMPERATURE = "25.0"
docker compose up --build
```

The application is then available at `http://localhost:3000`.

## Running the tests

Stable suite (expected to pass):

```bash
mvn test
```

Known-bug suite:

```bash
mvn test -Dtest=KnownBugTestRunner -DfailIfNoTests=false
```

The stable suite contains scenarios that pass against the current implementation. The known-bug
suite asserts the API contract the application should honor and is expected to fail, since it
reproduces known application defects.

## Configuration

Target URL (defaults to `http://localhost:3000`):

```bash
mvn test -DbaseUrl=http://my-host:3000
```

Fixed temperature the application was started with (defaults to `25.0`):

```bash
mvn test -DfixedTemperature=18.3
```

## Determinism and independence

`FIXED_TEMPERATURE` makes captures deterministic. Since the temperature itself cannot change
without restarting the application, the tests instead vary the thresholds through
`PUT /api/thresholds` to exercise `COLD`, `WARM` and `HOT` classification. Each scenario reads the
current thresholds before making changes and restores them afterward, so scenarios do not depend
on execution order or on each other.

## Reports

```text
target/karate-reports/
target/surefire-reports/
```

## Scope note

Detailed defect descriptions, severity levels, root-cause analysis and prioritization are
documented in the Deliverable 1 test strategy.
