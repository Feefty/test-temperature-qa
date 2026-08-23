import { APIRequestContext } from '@playwright/test';
import { Thresholds } from './types';

/**
 * Direct API access to /api/thresholds, used to prepare and restore state
 * around UI scenarios. Business assertions stay in the tests; this client
 * only performs the HTTP calls.
 */
export class ThresholdApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getCurrentThresholds(): Promise<Thresholds> {
    const response = await this.request.get('/api/thresholds');
    return response.json();
  }

  async setThresholds(thresholds: Thresholds): Promise<void> {
    const response = await this.request.put('/api/thresholds', { data: thresholds });
    if (!response.ok()) {
      throw new Error(
        `Failed to set thresholds to ${JSON.stringify(thresholds)}: ${response.status()} ${await response.text()}`
      );
    }
  }
}
