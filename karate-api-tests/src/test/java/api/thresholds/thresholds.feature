Feature: PUT /api/thresholds - stable suite

  # Every scenario snapshots whatever thresholds are active on entry (never
  # assumed to be the seeded 22/35 defaults) and restores them on exit via
  # `configure afterScenario`, so scenarios never depend on execution order or
  # leak state into one another.
  #
  # This feature only contains scenarios that pass against the current
  # implementation. Scenarios that encode the expected, robust behavior but
  # currently fail against the app's actual behavior live in
  # thresholds-known-bugs.feature (tagged @known-bug) and run separately -
  # see README.md.

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

  Scenario: Valid update with integers is accepted and persisted
    Given path '/api/thresholds'
    And request { coldMax: 18, hotMin: 32 }
    When method put
    Then status 200
    And match header Content-Type contains 'application/json'
    And match response == { coldMax: 18, hotMin: 32 }

    Given path '/api/thresholds'
    When method get
    Then status 200
    And match response == { coldMax: 18, hotMin: 32 }

  Scenario: Valid update with decimal numbers is accepted and persisted
    Given path '/api/thresholds'
    And request { coldMax: 18.5, hotMin: 32.7 }
    When method put
    Then status 200
    And match response == { coldMax: 18.5, hotMin: 32.7 }

    Given path '/api/thresholds'
    When method get
    Then status 200
    And match response == { coldMax: 18.5, hotMin: 32.7 }

  Scenario: A gap of exactly 2 degrees between coldMax and hotMin is accepted (spec: minimum gap is 2)
    * def coldMax = 20
    * def hotMin = 22
    Given path '/api/thresholds'
    And request { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    When method put
    Then status 200
    And match response == { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }

  Scenario: coldMax equal to hotMin is rejected with 400
    Given path '/api/thresholds'
    And request { coldMax: 25, hotMin: 25 }
    When method put
    Then status 400
    And match header Content-Type contains 'application/json'
    And match response == { error: '#string', statusCode: 400 }

  Scenario: coldMax greater than hotMin is rejected with 400
    Given path '/api/thresholds'
    And request { coldMax: 30, hotMin: 25 }
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario: A gap strictly less than 2 degrees is rejected with 400
    Given path '/api/thresholds'
    And request { coldMax: 20, hotMin: 21.9 }
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario: Rejected updates do not change the thresholds in the database
    * def thresholdsBeforeUpdate = call read('classpath:api/helpers/get-thresholds.feature')
    Given path '/api/thresholds'
    And request { coldMax: 40, hotMin: 30 }
    When method put
    Then status 400

    Given path '/api/thresholds'
    When method get
    Then status 200
    And match response == { coldMax: '#(thresholdsBeforeUpdate.coldMax)', hotMin: '#(thresholdsBeforeUpdate.hotMin)' }
