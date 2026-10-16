const SENSOR_MIN = -10;
const SENSOR_MAX = 50;

export function readTemperature(): number {
  const fixedTemp = process.env.FIXED_TEMPERATURE;
  if (fixedTemp) {
    // FIX #7 : parseFloat("abc") → NaN était enregistré en base puis renvoyé comme null,
    // et parseFloat("25abc") → 25 passait silencieusement. Number() est strict.
    const value = Number(fixedTemp);
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid FIXED_TEMPERATURE: "${fixedTemp}" is not a number`);
    }
    // FIX #8 : une valeur hors de la plage du capteur (-10 à 50, cf. SPEC) était acceptée.
    if (value < SENSOR_MIN || value > SENSOR_MAX) {
      throw new Error(
        `Invalid FIXED_TEMPERATURE: ${value} is outside sensor range [${SENSOR_MIN}, ${SENSOR_MAX}]`
      );
    }
    return value;
  }

  const value = Math.random() * (SENSOR_MAX - SENSOR_MIN) + SENSOR_MIN;
  return Math.round(value * 10) / 10;
}
