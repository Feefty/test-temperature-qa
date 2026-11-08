Feature: Threshold API negative input validation

  Background:
    * url 'http://localhost:3000'

  # HTTP 400 is the desired client-error contract for invalid inputs.
  # Some cases currently return HTTP 500; these are intentionally failing defect-reproduction tests.
  # Every scenario reads the baseline and checks persistence if its rejection assertion passes.

  @knownBug

  Scenario: Reject numeric strings instead of numeric thresholds
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    Given path 'api', 'thresholds'
    And request { coldMax: '20', hotMin: '22' }
    When method put
    Then status 400
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original

  @knownBug

  Scenario: Reject nonnumeric strings
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    Given path 'api', 'thresholds'
    And request { coldMax: 'abc', hotMin: 'xyz' }
    When method put
    Then status 400
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original

  @knownBug

  Scenario: Reject array values
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    Given path 'api', 'thresholds'
    And request { coldMax: [20], hotMin: [22] }
    When method put
    Then status 400
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original

  @knownBug

  Scenario: Reject null coldMax with valid hotMin
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    Given path 'api', 'thresholds'
    And request { coldMax: null, hotMin: 35 }
    When method put
    Then status 400
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original

  @knownBug

  Scenario: Reject malformed JSON with a client error
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    Given path 'api', 'thresholds'
    And header Content-Type = 'application/json'
    And request '{"coldMax": 20, "hotMin": '
    When method put
    Then status 400
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original

  Scenario: Reject boolean threshold values without changing configuration
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def original = response
    Given path 'api', 'thresholds'
    And request { coldMax: false, hotMin: true }
    When method put
    Then status 400
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    And match response == original
