## Run everything with one command

```bash
docker compose -f docker-compose.yml up --build --abort-on-container-exit --exit-code-from playwright
```

### Viewing the reports

Bind-mounted back to the host after a run:

- HTML report: `playwright-report/index.html`
- JUnit XML: `test-results/junit.xml`

## Running without Docker

Requires Node.js 20+, plus the app already running somewhere with a fixed temperature:

```bash
# from the parent directory
FIXED_TEMPERATURE=25.5 docker compose up --build -d

# from this directory
npm install
npx playwright install --with-deps chromium
APP_URL=http://localhost:3000 FIXED_TEMPERATURE=25.5 npm test
```