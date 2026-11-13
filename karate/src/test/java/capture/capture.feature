Feature: Capture a temperature reading

  Background:
    * url baseUrl

  Scenario: capture and verify the response
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
    * def today = new java.text.SimpleDateFormat('yyyy-MM-dd').format(new java.util.Date())
    And match response.timestamp contains today

  Scenario: capture is classified WARM when the fixed temperature sits strictly between the thresholds
    Given path '/api/thresholds'
    And request { coldMax: 22, hotMin: 35 }
    And method put
    And status 200
    And path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'WARM'
    And match response.coldMax == 22
    And match response.hotMin == 35

  Scenario: capture is classified COLD when the fixed temperature is below coldMax
    Given path '/api/thresholds'
    And request { coldMax: 30, hotMin: 32 }
    And method put
    And status 200
    And path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'COLD'

  Scenario: capture is classified HOT when the fixed temperature is above hotMin
    Given path '/api/thresholds'
    And request { coldMax: -10, hotMin: 20 }
    And method put
    And status 200
    And path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'HOT'

  Scenario: When the captured value is equal to coldMax the state is WARM
    Given path '/api/thresholds'
    And request { coldMax: '#(fixedTemperature)', hotMin: '#(fixedTemperaturePlus5)' }
    And method put
    And status 200
    And path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'WARM'

  Scenario: When the captured value is equal to hotMin the state is HOT
    Given path '/api/thresholds'
    And request { coldMax: '#(fixedTemperatureMinus5)', hotMin: '#(fixedTemperature)' }
    And method put
    And status 200
    And path '/api/temperature/capture'
    When method post
    Then status 201
    And match response.state == 'HOT'