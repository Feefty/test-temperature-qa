export type SensorState = 'COLD' | 'WARM' | 'HOT';

export interface Thresholds {
  coldMax: number;
  hotMin: number;
}

export interface HistoryRow {
  temperature: number;
  state: SensorState;
  coldMax: number;
  hotMin: number;
  capturedAtText: string;
}
