# Temperature Sensor — Karate API Tests

Dedicated Karate (BDD API testing) project, living inside this repository, covering
two endpoints of the temperature sensor app (the parent directory of this folder):

- `POST /api/temperature/capture`
- `PUT /api/thresholds`

## Run everything with one command

Requires Docker + Docker Compose. From this directory:

```bash
docker compose -f docker-compose.test.yml up --build --force-recreate --abort-on-container-exit --exit-code-from karate
```

This will:

1. Start a throwaway PostgreSQL instance
2. Build the app from the parent directory and start it with `FIXED_TEMPERATURE=25.5`
3. Build this test project and run `mvn test` against it
4. Exit with the tests' exit code — `0` if everything passed

Every run rebuilds and recreates all three containers and there are no persistent
volumes, so each run starts from an empty database. This stack is fully separate
from the one started by the main project's own `docker compose up` (own containers,
own network, no shared ports) — the two can run side by side.

Clean up afterwards:

```bash
docker compose -f docker-compose.test.yml down -v --remove-orphans
```

### Viewing the report

The Karate HTML report is bind-mounted back to the host at
`target/karate-reports/karate-summary.html` — open it in a browser after a run.

## How determinism and independence are achieved

`FIXED_TEMPERATURE` pins the sensor to one constant value (`25.5°C` by default, set in
`docker-compose.test.yml`) for the entire run — that's what makes `POST /capture`
deterministic. To still exercise all three classification states against that single
fixed reading, the capture scenarios move the **thresholds** around it instead of
trying to change the sensor value:

| Thresholds set                  | 25.5°C classifies as |
|----------------------------------|-----------------------|
| `coldMax=22, hotMin=35` (default) | WARM                  |
| `coldMax=30, hotMin=32`           | COLD                  |
| `coldMax=10, hotMin=20`           | HOT                   |

Each capture scenario sets the thresholds it needs immediately before capturing, so it
doesn't depend on what any other scenario left behind. `thresholds.feature` uses a
`Background` that resets to a known-good `{coldMax: 22, hotMin: 35}` before every
scenario for the same reason — combined with a fresh database on every run, scenario
order never matters.

## Known-bug scenarios

A few scenarios encode the *intended* behavior for issues written up in this
repository's test strategy document (missing type validation on
`PUT /api/thresholds`, no bound check against the sensor's physical range, the
`timestamp`/`capturedAt` field-naming inconsistency, an empty body crashing instead of
returning 400). They're tagged `@known-bug` and **excluded from the default run** so the
primary suite stays green.

Run them on their own to see them fail against the current implementation (run the
primary command above first, or bring up `db-test` and `app-test` manually):

```bash
docker compose -f docker-compose.test.yml run --rm karate mvn -q test -Dkarate.tags=@known-bug
```

On Windows PowerShell, quote the last argument so `@` isn't misinterpreted:
```powershell
docker compose -f docker-compose.test.yml run --rm karate mvn -q test "-Dkarate.tags=@known-bug"
```

## Running without Docker

Requires Java 17+ and Maven, plus the app already running somewhere with a fixed
temperature:

```bash
# from the parent directory
FIXED_TEMPERATURE=25.5 docker compose up --build -d

# from this directory
BASE_URL=http://localhost:3000 FIXED_TEMPERATURE=25.5 mvn test
```

## Project structure

```
karate-api-tests/
├── docker-compose.test.yml   # throwaway db + app + karate runner, one command
├── Dockerfile                 # maven + JDK image that runs `mvn test`
├── pom.xml
├── README.md
└── src/test/java/
    ├── karate-config.js       # baseUrl / fixedTemperature, read from env
    ├── TestRunner.java        # JUnit5 entry point; -Dkarate.tags controls which tags run
    ├── capture/
    │   └── capture.feature
    └── thresholds/
        └── thresholds.feature
```
