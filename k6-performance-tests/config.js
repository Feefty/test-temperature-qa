export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Must match the value the app under test was started with.
export const FIXED_TEMPERATURE = Number(__ENV.FIXED_TEMPERATURE || '25.0');

export const CAPTURE_URL = `${BASE_URL}/api/temperature/capture`;
