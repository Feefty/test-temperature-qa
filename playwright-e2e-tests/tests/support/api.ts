import { APIRequestContext } from "@playwright/test";

export const FIXED_TEMPERATURE = process.env.FIXED_TEMPERATURE
  ? parseFloat(process.env.FIXED_TEMPERATURE)
  : 25.5;

export async function setThresholds(request: APIRequestContext, coldMax: number, hotMin: number) {
  const res = await request.put("/api/thresholds", { data: { coldMax, hotMin } });
  if (!res.ok()) {
    throw new Error(`Failed to set thresholds via API: ${res.status()} ${await res.text()}`);
  }
}
