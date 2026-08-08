Feature: Update temperature thresholds

  Background:
    * url baseUrl
    # Every scenario starts from the same known-good thresholds, regardless of what a
    # previous scenario left behind — this is what makes the scenarios order-independent.
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
    When method put
    Then status 200
    And match response == { coldMax: 18, hotMin: 30 }

    Given path '/api/thresholds'
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

    Examples:
      | hotMin | status |
      | 21.9   | 400    |
      | 22.0   | 200    |
      | 22.1   | 200    |

  @known-bug
  Scenario: rejects a non-numeric coldMax
    # Currently fails: coldMax/hotMin aren't type-checked. A string on either side makes
    # both `coldMax >= hotMin` and `hotMin - coldMax < 2` evaluate to false (JS coercion),
    # so both guards are bypassed and the value reaches Prisma unvalidated.
    # See TEST_STRATEGY.md, "Bug identification".
    Given path '/api/thresholds'
    And request { coldMax: 'not-a-number', hotMin: 30 }
    When method put
    Then status 400

  @known-bug
  Scenario: rejects a request missing hotMin
    Given path '/api/thresholds'
    And request { coldMax: 18 }
    When method put
    Then status 400

  @known-bug
  Scenario: rejects thresholds with no relation to the sensor's physical range
    # Sensor range is -10..50°C (src/lib/sensor.ts). Only the relative rules (strictly
    # less than, 2°C minimum gap) are enforced today — nothing bounds either value to
    # the range the sensor can actually produce.
    Given path '/api/thresholds'
    And request { coldMax: -500, hotMin: 500 }
    When method put
    Then status 400

  @known-bug
  Scenario: an empty request body returns 400, not an unhandled server error
    Given path '/api/thresholds'
    And header Content-Type = 'application/json'
    And request ''
    When method put
    Then status 400
