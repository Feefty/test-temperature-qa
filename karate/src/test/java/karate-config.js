function fn() {
  var baseUrl = java.lang.System.getenv('BASE_URL') || 'http://localhost:3000';
  var fixedTemperatureEnv = java.lang.System.getenv('FIXED_TEMPERATURE');
  var fixedTemperature = fixedTemperatureEnv ? parseFloat(fixedTemperatureEnv) : 25.5;

  karate.configure('connectTimeout', 10000);
  karate.configure('readTimeout', 10000);

  return {
    baseUrl: baseUrl,
    fixedTemperature: fixedTemperature,
    fixedTemperaturePlus5: fixedTemperature + 5,
    fixedTemperatureMinus5: fixedTemperature - 5
  };
}