# Project Specification — Temperature Sensor (Full-Stack)

Project to generate as the support material for the QA Engineer kata. The project is **functional, with zero tests**. The QA candidate is responsible for building the entire test coverage.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Full-stack framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 18 |
| Language | TypeScript | 5.x |
| Package manager | Yarn (PnP) | — |
| Containerization | Docker + Docker Compose | — |

**No test framework is included** (no Vitest, Jest, Playwright, Cypress, etc.). The `package.json` does not contain any test-related `devDependencies`.

---

## Architecture

```
temperature-sensor/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   └── 20240101000000_init/
│   │       └── migration.sql
│   └── seed.ts
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard (home page)
│   │   ├── api/
│   │   │   ├── temperature/
│   │   │   │   ├── capture/route.ts    # POST /api/temperature/capture
│   │   │   │   └── history/route.ts    # GET  /api/temperature/history
│   │   │   └── thresholds/
│   │   │       └── route.ts            # GET + PUT /api/thresholds
│   │   ├── components/
│   │   │   ├── CaptureButton.tsx
│   │   │   ├── HistoryTable.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── TemperatureDisplay.tsx
│   │   │   └── ThresholdForm.tsx
│   │   └── globals.css
│   └── lib/
│       ├── prisma.ts             # Prisma Client singleton
│       ├── sensor.ts             # Temperature sensor simulator
│       ├── classifier.ts         # Classification logic
│       └── types.ts              # Shared types
├── public/
│   └── logo.svg
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── tsconfig.json
├── package.json
├── yarn.lock
└── README.md
```

---

## Data Model (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model TemperatureReading {
  id          String   @id @default(uuid())
  temperature Float
  state       String   // "COLD" | "WARM" | "HOT"
  coldMax     Float    // Snapshot of the cold threshold at capture time
  hotMin      Float    // Snapshot of the hot threshold at capture time
  capturedAt  DateTime @default(now())

  @@map("temperature_readings")
}

model Threshold {
  id        String   @id @default("singleton")
  coldMax   Float    @default(22)
  hotMin    Float    @default(35)
  updatedAt DateTime @updatedAt

  @@map("thresholds")
}
```

---

## API Routes (Next.js Route Handlers)

### `POST /api/temperature/capture`

1. Read the temperature from the sensor simulator.
2. Read the active thresholds from the database.
3. Classify the temperature.
4. Persist the reading (with threshold snapshot).
5. Return the reading.

**Response 201**:
```json
{
  "id": "uuid",
  "temperature": 28.5,
  "state": "WARM",
  "coldMax": 22,
  "hotMin": 35,
  "capturedAt": "2026-06-15T10:00:00.000Z"
}
```

### `GET /api/temperature/history`

Returns the last 15 readings, sorted from newest to oldest.

**Response 200**:
```json
{
  "readings": [
    {
      "id": "uuid",
      "temperature": 28.5,
      "state": "WARM",
      "coldMax": 22,
      "hotMin": 35,
      "capturedAt": "2026-06-15T10:00:00.000Z"
    }
  ],
  "count": 15,
  "maxSize": 15
}
```

### `GET /api/thresholds`

Returns the active thresholds.

**Response 200**:
```json
{
  "coldMax": 22,
  "hotMin": 35
}
```

### `PUT /api/thresholds`

Updates the thresholds. Validation rules implemented:
- The body must be valid JSON; `coldMax` and `hotMin` are required finite numbers.
- `coldMax` must be strictly less than `hotMin`.
- The minimum gap must be 2°C.

**Request body**:
```json
{
  "coldMax": 18,
  "hotMin": 32
}
```

**Response 200** (thresholds updated):
```json
{
  "coldMax": 18,
  "hotMin": 32
}
```

**Response 400** (validation failed):
```json
{
  "error": "coldMax must be strictly less than hotMin",
  "statusCode": 400
}
```

---

## Classification Logic (`src/lib/classifier.ts`)

```typescript
export function classifyTemperature(
  temperature: number,
  coldMax: number,
  hotMin: number
): SensorState {
  if (temperature < coldMax) return "COLD";
  if (temperature >= hotMin) return "HOT";
  return "WARM";
}
```

Boundaries:
- `< coldMax` → COLD
- `>= hotMin` → HOT
- otherwise → WARM (coldMax ≤ temp < hotMin)

---

## Sensor Simulator (`src/lib/sensor.ts`)

```typescript
const SENSOR_MIN = -10;
const SENSOR_MAX = 50;

export function readTemperature(): number {
  const fixedTemp = process.env.FIXED_TEMPERATURE;
  if (fixedTemp) {
    return parseFloat(fixedTemp);
  }

  const value = Math.random() * (SENSOR_MAX - SENSOR_MIN) + SENSOR_MIN;
  return Math.round(value * 10) / 10;
}
```

- Range: -10°C to 50°C
- Precision: 1 decimal place
- If the environment variable `FIXED_TEMPERATURE` is set, returns that value (for determinism in test/demo scenarios). The value must be a number within the sensor range; otherwise the capture fails with a 500 error.

---

## Shared Types (`src/lib/types.ts`)

```typescript
export type SensorState = "COLD" | "WARM" | "HOT";

export interface TemperatureReading {
  id: string;
  temperature: number;
  state: SensorState;
  coldMax: number;
  hotMin: number;
  capturedAt: string;
}

export interface ThresholdConfig {
  coldMax: number;
  hotMin: number;
}

export interface HistoryResponse {
  readings: TemperatureReading[];
  count: number;
  maxSize: number;
}
```

---

## Frontend (Next.js Pages)

### Home Page — Dashboard (`src/app/page.tsx`)

A single client-side page (`"use client"`) with a header (Logo + title "Temperature Sensor" + subtitle "TEST QA ENGINEER") and 3 card sections:

1. **Capture**: a "Capture Temperature" button that calls `POST /api/temperature/capture` and displays the result (value + state with colored badge via `TemperatureDisplay`).

2. **History**: a table showing the last 15 captures (temperature, state, cold max, hot min, date/time). Automatically refreshes after each capture via a `refreshKey` state mechanism.

3. **Threshold Settings**: a form with two number fields (coldMax, hotMin) with step 0.1 and a "Save" button. Displays current values on load. Shows success or error messages inline.

### UI Components

| Component | Role |
|---|---|
| `Logo` | Renders the SVG logo from `/public/logo.svg` |
| `CaptureButton` | Button + capture result display, disables during API call |
| `TemperatureDisplay` | Shows temperature + colored badge (cold/warm/hot) |
| `HistoryTable` | Table of readings, fetched from history endpoint |
| `ThresholdForm` | Form to view/edit thresholds, with inline messages |

### UI Behaviors

- The capture button is disabled during the API call (prevents double-clicks).
- The state is shown with a colored badge: `badge--cold`, `badge--warm`, `badge--hot`.
- The threshold form displays a success or error message after submission (`aria-live="polite"`, `role="alert"`).
- Data is fetched client-side (`useEffect` + `fetch`) to keep the dashboard interactive.
- Accessibility: labels on inputs, `aria-live` for status messages, `aria-label` on capture button.

---

## Docker

### `Dockerfile` (multi-stage, Yarn)

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn prisma generate
RUN yarn build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node -e \"...seed script...\" && node server.js"]
```

The CMD runs Prisma migrations, seeds the default thresholds, then starts the server.

### `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: temperature_sensor
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d temperature_sensor"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:password@db:5432/temperature_sensor
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pgdata:
```

---

## Next.js Configuration

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

The `standalone` output mode is enabled for Docker deployment.

---

## TypeScript Configuration

- `strict: true`
- `target: ES2017`
- Path alias `@/*` → `./src/*`
- Bundler module resolution

---

## ESLint Configuration

Uses flat config (`eslint.config.mjs`) with `next/core-web-vitals` preset via `@eslint/eslintrc` FlatCompat.

---

## Environment Variables (`.env.example`)

```env
DATABASE_URL=postgresql://admin:password@localhost:5432/temperature_sensor
FIXED_TEMPERATURE=
```

- `DATABASE_URL`: PostgreSQL connection string.
- `FIXED_TEMPERATURE`: Leave empty for random mode, or set a value (e.g. `28.5`) for deterministic captures.

---

## Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "lint": "next lint"
  }
}
```

Seed runner configured via `prisma.seed` field: `tsx prisma/seed.ts`.

---

## Seed (`prisma/seed.ts`)

Inserts the default threshold singleton:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.threshold.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      coldMax: 22,
      hotMin: 35,
    },
  });
  console.log("Seeded default thresholds: coldMax=22, hotMin=35");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

---

## Important Notice

> ⚠️ **This project intentionally contains bugs, edge cases, and inconsistencies. Finding and reporting them is part of the QA exercise.**
