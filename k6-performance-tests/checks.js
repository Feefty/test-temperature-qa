import { check } from 'k6';

// Parses the body at most once and tolerates a missing/invalid JSON body
// (e.g. an aborted request), so a broken response fails checks instead of
// throwing and aborting the iteration.
function parseBody(res) {
  try {
    return res.json();
  } catch {
    return null;
  }
}

// Shared contract check for POST /api/temperature/capture, used by both the
// smoke and load tests.
export function checkCaptureResponse(res, expectedTemperature) {
  const body = parseBody(res);

  return check(res, {
    'status is 201': (r) => r.status === 201,
    'body has id, state, coldMax and hotMin': () =>
      body !== null &&
      typeof body.id === 'string' &&
      typeof body.state === 'string' &&
      typeof body.coldMax === 'number' &&
      typeof body.hotMin === 'number' &&
      typeof body.timestamp === 'string',
    'temperature matches FIXED_TEMPERATURE': () => body !== null && body.temperature === expectedTemperature,
  });
}
