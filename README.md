# Temperature Sensor — QA Engineer Kata

Full-stack temperature sensor simulation app. The QA candidate is responsible for building test coverage.

> ⚠️ **This project is delivered without any tests.** It is intended as support material for a QA exercise.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript strict
- Prisma 6 + PostgreSQL 18
- Docker Compose

## Run the project

```bash
docker compose up --build
```

The app is available at http://localhost:3000.

Migration and seed run automatically on container startup.

## Local dev (without Docker for the app)

```bash
docker compose up db -d
cp .env.example .env
yarn install
yarn db:push
yarn db:seed
yarn dev
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/temperature/capture` | Capture a sensor reading |
| GET | `/api/temperature/history` | Returns the last 15 readings |
| GET | `/api/thresholds` | Returns active thresholds |
| PUT | `/api/thresholds` | Updates thresholds |

## Dashboard

Single page with 3 sections:
1. **Capture** — Button to trigger a sensor reading
2. **History** — Table of the last 15 captures
3. **Thresholds** — Configuration form for COLD/HOT boundaries

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `FIXED_TEMPERATURE` | Fixed sensor value (empty = random) |

---

## QA Exercise — Expectations

**Duration: 3 hours maximum.**

This project is intentionally delivered with **zero tests** and contains **deliberate bugs, edge cases, and inconsistencies** for candidates to discover and cover. Finding them is part of the exercise.

> We value **depth over breadth** — a few well-written tests that demonstrate edge-case thinking and catch real bugs are worth more than shallow happy-path coverage of every endpoint.

---

### Deliverable 1 — Test Strategy Document (~45 min)

Before writing any code, explore the app and its API, then produce a short document covering:

- **Bug identification**: List any bugs, inconsistencies, or missing validations you find.
- **Test plan**: What would you test and why? What are the high-risk areas?
- **Prioritization**: If you had limited time, which tests deliver the most value first?
- **Edge cases**: List boundary values and negative scenarios worth covering.
- **What you would add with more time**: Performance testing, CI/CD pipeline, additional coverage — describe briefly.

> This is not a formal document. Bullet points are fine. We want to see how you think, not how you format.

---

### Deliverable 2 — API Tests (separate project, ~1h)

Create a dedicated Karate test project targeting these two endpoints:

- `POST /api/temperature/capture`
- `PUT /api/thresholds`

**Requirements:**
- Tests must be runnable with a single command (provide instructions in a README)
- Tests must be deterministic and independent
- Use `FIXED_TEMPERATURE` env variable for deterministic capture scenarios

---

### Deliverable 3 — E2E Tests (separate project, ~1h15)

Create a dedicated Playwright test project covering the dashboard UI.

**Requirements:**
- Tests must be runnable with a single command (provide instructions in a README)
- Use `FIXED_TEMPERATURE` for deterministic scenarios
- Tests must be independent (no shared state between runs)

> Adding Cucumber/BDD on top is optional. If you do, make sure it adds clarity, not just boilerplate.

---

### Bonus (optional, if time allows)

- CI/CD: Provide a `docker-compose.test.yml` or pipeline config for isolated test execution
- Test reports: HTML or JUnit XML output
- Performance: K6 script for load testing the capture endpoint
- Accessibility: Keyboard navigation, ARIA attributes validation

---

### Evaluation criteria

| Criteria | Weight | What we look for |
|----------|--------|------------------|
| Bug identification | 25% | Did you find the planted inconsistencies and missing validations? |
| Test strategy quality | 25% | Prioritization, risk-based thinking, edge-case awareness |
| Code quality | 25% | Clean structure, readable tests, meaningful assertions |
| Runability | 15% | Can we run your tests with one command? Clear instructions? |
| Coverage depth | 10% | Beyond happy paths — boundary values, negative scenarios |
