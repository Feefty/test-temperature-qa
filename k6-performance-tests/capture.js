import http from 'k6/http';
import { sleep } from 'k6';
import { CAPTURE_URL, FIXED_TEMPERATURE } from './config.js';
import { checkCaptureResponse } from './checks.js';

// Shared VU body for smoke-test.js and load-test.js: one capture, checked
// against the contract, then a 1s pace between requests.
export function captureAndCheck() {
  const res = http.post(CAPTURE_URL);
  checkCaptureResponse(res, FIXED_TEMPERATURE);
  sleep(1);
}
