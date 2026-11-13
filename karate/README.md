## Run everything with one command

Requires Docker + Docker Compose. From this directory:

```bash
docker compose -f docker-compose.yml up --build --abort-on-container-exit --exit-code-from karate
```

This will start the app and run all karate tests, some tests fail while waiting for bug fixes.

### Viewing the report

The Karate HTML report is bind-mounted back to the host at
`target/karate-reports/karate-summary.html` — open it in a browser after a run.

## Running without Docker

Requires Java 17+ and Maven, plus the app already running somewhere with a fixed
temperature:

```bash
# from the parent directory
FIXED_TEMPERATURE=25.5 docker compose up --build -d

# from this directory
BASE_URL=http://localhost:3000 FIXED_TEMPERATURE=25.5 mvn test
```