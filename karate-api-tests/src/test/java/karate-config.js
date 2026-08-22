function fn() {
  var baseUrl = karate.properties['baseUrl'];
  if (!baseUrl) {
    baseUrl = java.lang.System.getenv('BASE_URL');
  }
  if (!baseUrl) {
    baseUrl = 'http://localhost:3000';
  }

  // Must match the FIXED_TEMPERATURE value the app under test was started with.
  // See README.md "Deterministic mode". Overridable with -DfixedTemperature=<value>.
  var fixedTemperatureRaw = karate.properties['fixedTemperature'];
  if (!fixedTemperatureRaw) {
    fixedTemperatureRaw = java.lang.System.getenv('FIXED_TEMPERATURE');
  }
  if (!fixedTemperatureRaw) {
    fixedTemperatureRaw = '25.0';
  }

  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 10000);

  return {
    baseUrl: baseUrl,
    fixedTemperature: parseFloat(fixedTemperatureRaw)
  };
}
