Feature: Restore threshold configuration after deterministic test

  Scenario:
    * url 'http://localhost:3000'
    Given path 'api', 'thresholds'
    And request original
    When method put
    Then status 200
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original
