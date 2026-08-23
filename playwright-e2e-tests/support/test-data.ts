import { SensorState, Thresholds } from './types';

// Must match the app's FIXED_TEMPERATURE; read from the same env var so the
// suite adapts to how the app under test was actually started.
export const EXPECTED_FIXED_TEMPERATURE = Number(process.env.FIXED_TEMPERATURE ?? '25.0');

// Mirrors MAX_HISTORY_SIZE in src/app/api/temperature/history/route.ts.
export const HISTORY_PAGE_SIZE = 15;

const MINIMUM_THRESHOLD_GAP = 2;

export function thresholdsForWarmState(fixedTemperature: number): Thresholds {
  return { coldMax: fixedTemperature - 5, hotMin: fixedTemperature + 5 };
}

export interface ClassificationBoundaryCase {
  description: string;
  thresholds: Thresholds;
  expectedState: SensorState;
}

// Thresholds are computed relative to fixedTemperature, so each case stays
// valid if EXPECTED_FIXED_TEMPERATURE changes.
export function classificationBoundaryCases(fixedTemperature: number): ClassificationBoundaryCase[] {
  return [
    {
      description: 'temperature below coldMax',
      thresholds: { coldMax: fixedTemperature + 5, hotMin: fixedTemperature + 15 },
      expectedState: 'COLD',
    },
    {
      description: 'temperature equal to coldMax',
      thresholds: { coldMax: fixedTemperature, hotMin: fixedTemperature + 5 },
      expectedState: 'WARM',
    },
    {
      description: 'temperature strictly between coldMax and hotMin',
      thresholds: thresholdsForWarmState(fixedTemperature),
      expectedState: 'WARM',
    },
    {
      description: 'temperature just below hotMin',
      thresholds: { coldMax: fixedTemperature - 5, hotMin: fixedTemperature + 0.1 },
      expectedState: 'WARM',
    },
    {
      description: 'temperature equal to hotMin',
      thresholds: { coldMax: fixedTemperature - 5, hotMin: fixedTemperature },
      expectedState: 'HOT',
    },
    {
      description: 'temperature above hotMin',
      thresholds: { coldMax: fixedTemperature - 15, hotMin: fixedTemperature - 5 },
      expectedState: 'HOT',
    },
  ];
}

export interface ValidThresholdUpdateCase {
  description: string;
  thresholds: Thresholds;
}

export const VALID_THRESHOLD_UPDATE_CASES: ValidThresholdUpdateCase[] = [
  { description: 'integer values', thresholds: { coldMax: 18, hotMin: 32 } },
  { description: 'decimal values', thresholds: { coldMax: 18.5, hotMin: 32.7 } },
  {
    description: `minimum allowed gap of ${MINIMUM_THRESHOLD_GAP} degrees`,
    thresholds: { coldMax: 20, hotMin: 20 + MINIMUM_THRESHOLD_GAP },
  },
];

export interface InvalidThresholdUpdateCase {
  description: string;
  thresholds: Thresholds;
  expectedMessageFragment: string;
}

export const INVALID_THRESHOLD_UPDATE_CASES: InvalidThresholdUpdateCase[] = [
  {
    description: 'coldMax equal to hotMin',
    thresholds: { coldMax: 25, hotMin: 25 },
    expectedMessageFragment: 'strictly less than',
  },
  {
    description: 'coldMax greater than hotMin',
    thresholds: { coldMax: 30, hotMin: 20 },
    expectedMessageFragment: 'strictly less than',
  },
  {
    description: `a gap below ${MINIMUM_THRESHOLD_GAP} degrees`,
    thresholds: { coldMax: 20, hotMin: 21.5 },
    expectedMessageFragment: 'Minimum gap',
  },
];
