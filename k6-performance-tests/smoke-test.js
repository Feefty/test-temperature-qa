import { captureAndCheck } from './capture.js';

// Minimal, fixed footprint: validates the script and the endpoint, not load
// behavior. Run load-test.js for that.
export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ['rate==0'],
    checks: ['rate==1'],
  },
};

export default captureAndCheck;
