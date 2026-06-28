# API Tests — Karate

This project contains API tests for the Temperature Sensor application using Karate and JUnit 5.

## Scope

The tests cover the two API endpoints requested in the exercise:

- `POST /api/temperature/capture`
- `PUT /api/thresholds`

## Covered scenarios

### Temperature capture

- Capture a temperature reading using deterministic mode
- Validate HTTP status `201 Created`
- Validate the API response contract
- Validate the expected temperature and state using `FIXED_TEMPERATURE=25.5`

### Thresholds

- Update thresholds successfully
- Reject thresholds where `coldMax == hotMin`
- Reject thresholds where `coldMax > hotMin`
- Reject thresholds when the gap is lower than `2°C`
- Document current behavior for invalid non-numeric values
- Document current behavior for missing `hotMin`

## Prerequisites

The main application must be running on:

```text
http://localhost:3000