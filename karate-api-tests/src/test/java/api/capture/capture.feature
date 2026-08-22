Feature: POST /api/temperature/capture

  # The sensor temperature is fixed for the lifetime of the app container and
  # cannot change between scenarios without a restart. Instead of restarting
  # the app, these scenarios keep the temperature constant (`fixedTemperature`,
  # from karate-config.js) and vary the thresholds via PUT /api/thresholds to
  # deterministically exercise every branch of the COLD/WARM/HOT classifier.
  # Each scenario snapshots the thresholds found on entry and restores them on
  # exit (via `configure afterScenario`), keeping scenarios independent of
  # execution order and of whatever state another suite left behind.

  Background:
    * url baseUrl
    * def originalThresholds = call read('classpath:api/helpers/get-thresholds.feature')
    * def originalColdMax = originalThresholds.coldMax
    * def originalHotMin = originalThresholds.hotMin
    * configure afterScenario =
      """
      function(){
        karate.call('classpath:api/helpers/restore-thresholds.feature', { coldMax: originalColdMax, hotMin: originalHotMin });
      }
      """

  Scenario: A valid capture returns 201 with a well-formed reading
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match header Content-Type contains 'application/json'
    And match response ==
      """
      {
        id: '#uuid',
        temperature: '#number',
        state: '#regex COLD|WARM|HOT',
        coldMax: '#number',
        hotMin: '#number',
        timestamp: '#regex \\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z'
      }
      """

  Scenario: Repeated captures return the same fixed temperature (deterministic mode)
    # If this fails, the app was not started with `FIXED_TEMPERATURE=<fixedTemperature>`
    # (see README), and every classification scenario below would be unreliable too.
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.temperature == fixedTemperature
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.temperature == fixedTemperature

  Scenario: A captured reading is persisted and appears in the history
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    * def captureResponse = response

    Given path '/api/temperature/history'
    When method get
    Then status 200
    * def matchingReadings = karate.filter(response.readings, function(reading){ return reading.id == captureResponse.id })
    And match matchingReadings[0] ==
      """
      {
        id: '#(captureResponse.id)',
        temperature: '#(captureResponse.temperature)',
        state: '#(captureResponse.state)',
        coldMax: '#(captureResponse.coldMax)',
        hotMin: '#(captureResponse.hotMin)',
        capturedAt: '#(captureResponse.timestamp)'
      }
      """
    # The capture endpoint names the instant `timestamp`; the history endpoint
    # names the same instant `capturedAt` (documented as-is in SPEC.md). The
    # match above proves both fields carry the same value for the same
    # reading, so this naming inconsistency is documented, not asserted as a failure.

  @classification
  Scenario: Classifies as COLD when temperature is clearly below coldMax
    * def coldMax = fixedTemperature + 5
    * def hotMin = fixedTemperature + 15
    * call read('classpath:api/helpers/restore-thresholds.feature') { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'COLD'
    And match response.temperature == fixedTemperature

  @classification
  Scenario: Classifies as WARM when temperature is clearly between coldMax and hotMin
    * def coldMax = fixedTemperature - 5
    * def hotMin = fixedTemperature + 5
    * call read('classpath:api/helpers/restore-thresholds.feature') { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'WARM'

  @classification
  Scenario: Classifies as HOT when temperature is clearly above hotMin
    * def coldMax = fixedTemperature - 15
    * def hotMin = fixedTemperature - 5
    * call read('classpath:api/helpers/restore-thresholds.feature') { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'HOT'

  @classification @boundary
  Scenario: Boundary - temperature just below coldMax is still COLD
    * def coldMax = fixedTemperature + 0.1
    * def hotMin = fixedTemperature + 10
    * call read('classpath:api/helpers/restore-thresholds.feature') { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'COLD'

  @classification @boundary
  Scenario: Boundary - temperature exactly equal to coldMax is WARM, not COLD
    * def coldMax = fixedTemperature
    * def hotMin = fixedTemperature + 5
    * call read('classpath:api/helpers/restore-thresholds.feature') { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'WARM'

  @classification @boundary
  Scenario: Boundary - temperature just below hotMin is still WARM, not HOT
    * def coldMax = fixedTemperature - 5
    * def hotMin = fixedTemperature + 0.1
    * call read('classpath:api/helpers/restore-thresholds.feature') { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'WARM'

  @classification @boundary
  Scenario: Boundary - temperature exactly equal to hotMin is HOT
    * def coldMax = fixedTemperature - 5
    * def hotMin = fixedTemperature
    * call read('classpath:api/helpers/restore-thresholds.feature') { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'HOT'
