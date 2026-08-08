Feature: Capture a temperature reading

  Background:
    * url baseUrl

  Scenario: a successful capture returns 201 with the full reading shape
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response ==
      """
      {
        id: '#string',
        temperature: '#number',
        state: '#string',
        coldMax: '#number',
        hotMin: '#number',
        timestamp: '#string'
      }
      """
    And match response.temperature == fixedTemperature
    And match response.state == '#regex (COLD|WARM|HOT)'

  # FIXED_TEMPERATURE pins the sensor to one constant value for the whole run, which is
  # what makes capture deterministic. To still exercise all three classification states
  # against that single fixed reading, these scenarios move the *thresholds* around it
  # instead of trying to change the sensor value.

  Scenario: capture is classified WARM when the fixed temperature sits strictly between the thresholds
    Given path '/api/thresholds'
    And request { coldMax: 22, hotMin: 35 }
    When method put
    Then status 200

    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'WARM'
    And match response.coldMax == 22
    And match response.hotMin == 35

  Scenario: capture is classified COLD when the fixed temperature is below coldMax
    Given path '/api/thresholds'
    And request { coldMax: 30, hotMin: 32 }
    When method put
    Then status 200

    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'COLD'

  Scenario: capture is classified HOT when the fixed temperature is at or above hotMin
    Given path '/api/thresholds'
    And request { coldMax: 10, hotMin: 20 }
    When method put
    Then status 200

    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'HOT'

  Scenario: the coldMax boundary is inclusive on the WARM side, not COLD
    Given path '/api/thresholds'
    And request { coldMax: '#(fixedTemperature)', hotMin: '#(fixedTemperaturePlus5)' }
    When method put
    Then status 200

    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'WARM'

  Scenario: the hotMin boundary is inclusive on the HOT side
    Given path '/api/thresholds'
    And request { coldMax: '#(fixedTemperatureMinus5)', hotMin: '#(fixedTemperature)' }
    When method put
    Then status 200

    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'HOT'

  Scenario: a captured reading is persisted and retrievable from history
    Given path '/api/thresholds'
    And request { coldMax: 22, hotMin: 35 }
    When method put
    Then status 200

    Given path '/api/temperature/capture'
    When method post
    Then status 201
    * def capturedId = response.id

    Given path '/api/temperature/history'
    When method get
    Then status 200
    And match response.readings[0].id == capturedId
    And match response.readings[0].temperature == fixedTemperature

  @known-bug
  Scenario: the capture response should name the timestamp field consistently with history
    # Currently fails: capture returns `timestamp`, history returns `capturedAt` for the
    # same value, and the shared TemperatureReading type only declares `capturedAt`.
    # See TEST_STRATEGY.md, "Bug identification".
    Given path '/api/temperature/capture'
    When method post
    Then status 201
    And match response contains { capturedAt: '#string' }
