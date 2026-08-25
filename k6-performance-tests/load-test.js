import { captureAndCheck } from './capture.js';

const TARGET_VUS = Number(__ENV.VUS || '10');
const SUSTAIN_DURATION = __ENV.DURATION || '30s';
const RAMP_DURATION = '10s';

// Ramp up to TARGET_VUS, sustain, ramp down — avoids hitting the app with an
// instant step load.
export const options = {
  stages: [
    { duration: RAMP_DURATION, target: TARGET_VUS },
    { duration: SUSTAIN_DURATION, target: TARGET_VUS },
    { duration: RAMP_DURATION, target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    checks: ['rate>0.99'],
  },
};

export default captureAndCheck;
