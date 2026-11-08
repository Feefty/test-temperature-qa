Feature: Fixed sensor temperature classification across all three states

  Background:
    * url 'http://localhost:3000'
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    # Cleanup runs even if a scenario assertion fails.
    * configure afterScenario = function(){ karate.call('classpath:feefty/restore-original-thresholds.feature', { original: karate.get('original') }) }

  Scenario Outline: Fixed 25.5 C is classified as <expectedState>
    Given path 'api', 'thresholds'
    And request { coldMax: <coldMax>, hotMin: <hotMin> }
    When method put
    Then status 200
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    And match response.temperature == 25.5
    And match response.state == '<expectedState>'
    And match response.coldMax == <coldMax>
    And match response.hotMin == <hotMin>

    Examples:
      | coldMax | hotMin | expectedState |
      | 20      | 22     | HOT           |
      | 24      | 27     | WARM          |
      | 26      | 28     | COLD          |
