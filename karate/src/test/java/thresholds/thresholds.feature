Feature: Update temperature thresholds

  Background:
    * url baseUrl
    Given path '/api/thresholds'
    And request { coldMax: 22, hotMin: 35 }
    When method put
    Then status 200

  Scenario: GET returns the currently active thresholds
    Given path '/api/thresholds'
    When method get
    Then status 200
    And match response == { coldMax: 22, hotMin: 35 }

  Scenario: a valid update is accepted and persisted
    Given path '/api/thresholds'
    And request { coldMax: 18, hotMin: 30 }
    And method put
    And status 200
    And match response == { coldMax: 18, hotMin: 30 }
    And path '/api/thresholds'
    When method get
    Then status 200
    And match response == { coldMax: 18, hotMin: 30 }

  Scenario: rejects coldMax equal to hotMin
    Given path '/api/thresholds'
    And request { coldMax: 25, hotMin: 25 }
    When method put
    Then status 400
    And match response == { error: 'coldMax must be strictly less than hotMin', statusCode: 400 }

  Scenario: rejects coldMax greater than hotMin
    Given path '/api/thresholds'
    And request { coldMax: 40, hotMin: 20 }
    When method put
    Then status 400
    And match response == { error: 'coldMax must be strictly less than hotMin', statusCode: 400 }

  Scenario Outline: the minimum 2°C gap is enforced at its exact boundary
    Given path '/api/thresholds'
    And request { coldMax: 20, hotMin: <hotMin> }
    When method put
    Then status <status>
    And match response == <response>
    Examples:
      | hotMin | status | response                                                                         |
      | 21.9   | 400    | { error: 'Minimum gap between coldMax and hotMin must be 2°C', statusCode: 400 } |
      | 22.0   | 200    | {"coldMax":20,"hotMin":22}                                                       |

  Scenario: rejects a non-numeric value
    # Currently fails: bug needs to be fixed
    Given path '/api/thresholds'
    And request { coldMax: 'not-a-number', hotMin: 30 }
    When method put
    Then status 400

  Scenario: rejects any other format than coldMax, hotMin additionnal field shouldn't be allowed
    # To be discussed if this should be allowed or not
    Given path '/api/thresholds'
    And request { coldMax: 18 }
    When method put
    Then status 400

  Scenario: an empty request body returns 400, not an unhandled server error
    Given path '/api/thresholds'
    And header Content-Type = 'application/json'
    And request ''
    When method put
    Then status 400

# I would also add tests on decimal values once the rules around them are clear.