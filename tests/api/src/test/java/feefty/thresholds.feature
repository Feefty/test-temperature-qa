Feature: Threshold API validation and persistence

  Background:
    * url 'http://localhost:3000'

  Scenario: Read persisted threshold configuration
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response contains { coldMax: '#number', hotMin: '#number' }
    And assert response.hotMin - response.coldMax >= 2

  Scenario Outline: Accept valid threshold pairs and persist them
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response

    Given path 'api', 'thresholds'
    And request { coldMax: <cold>, hotMin: <hot> }
    When method put
    * def updateStatus = responseStatus

    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def persisted = response

    Given path 'api', 'thresholds'
    And request original
    When method put
    Then status 200

    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original
    * match updateStatus == 200
    * match persisted == { coldMax: <cold>, hotMin: <hot> }

    Examples:
      | cold | hot |
      | 20   | 22  |
      | 0    | 2   |
      | -2   | 0   |
      | -5   | 10  |

  Scenario Outline: Reject invalid threshold pairs without changing persistence
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response

    Given path 'api', 'thresholds'
    And request { coldMax: <cold>, hotMin: <hot> }
    When method put
    * def updateStatus = responseStatus

    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def persisted = response
    * match updateStatus == 400
    * match persisted == original

    Examples:
      | cold | hot   |
      | 0    | 0     |
      | 20   | 20    |
      | 20   | -5    |
      | 20   | 21.99 |

  @knownBug

  Scenario: Regression - partial update must not persist an invalid threshold pair
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    * def invalidCold = original.hotMin + 3
    * def payload = { coldMax: '#(invalidCold)' }

    Given path 'api', 'thresholds'
    And request payload
    When method put
    * def updateStatus = responseStatus

    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def persisted = response

    # Restore BEFORE the known-failing assertions.
    Given path 'api', 'thresholds'
    And request original
    When method put
    Then status 200
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original

    # Expected to FAIL against the currently observed BUG-01.
    * match updateStatus == 400
    * match persisted == original