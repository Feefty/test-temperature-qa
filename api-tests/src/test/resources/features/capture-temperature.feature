Feature: Temperature Capture API

  Background:
    * url baseUrl

  Scenario: Capture a fixed temperature reading successfully
    Given path '/api/temperature/capture'
    When method POST
    Then status 201
    And match response ==
    """
    {
      id: '#string',
      temperature: 25.5,
      state: 'WARM',
      coldMax: '#number',
      hotMin: '#number',
      timestamp: '#string'
    }
    """