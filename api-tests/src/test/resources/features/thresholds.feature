Feature: Threshold API

  Background:
    * url baseUrl

  Scenario: Update thresholds successfully
    * def payload = read('classpath:payloads/valid-threshold.json')

    Given path '/api/thresholds'
    And request payload
    When method PUT

    Then status 200
    And match response.coldMax == 20
    And match response.hotMin == 35

  Scenario: Reject when coldMax equals hotMin
    * def payload = read('classpath:payloads/equal-threshold.json')

    Given path '/api/thresholds'
    And request payload
    When method PUT

    Then status 400
    And match response.error == 'coldMax must be strictly less than hotMin'
    And match response.statusCode == 400

  Scenario: Reject when gap between thresholds is less than 2 degrees
    * def payload = read('classpath:payloads/invalid-gap.json')

    Given path '/api/thresholds'
    And request payload
    When method PUT

    Then status 400
    And match response.error == 'Minimum gap between coldMax and hotMin must be 2°C'
    And match response.statusCode == 400  

# Known bug: invalid non-numeric threshold values currently return 500 instead of a controlled 400 validation error.
  Scenario: Non numeric threshold values currently trigger a server error
    * def payload = read('classpath:payloads/invalid-type.json')

    Given path '/api/thresholds'
    And request payload
    When method PUT
    Then status 500

  Scenario: Reject when coldMax is greater than hotMin
    * def payload = read('classpath:payloads/greater-threshold.json')

    Given path '/api/thresholds'
    And request payload
    When method PUT

    Then status 400
    And match response.error == 'coldMax must be strictly less than hotMin'
    And match response.statusCode == 400  

# Known bug: missing hotMin is currently accepted with 200 instead of returning a controlled 400 validation error.
  Scenario: Missing hotMin is currently accepted
    * def payload = read('classpath:payloads/missing-hot-min.json')

    Given path '/api/thresholds'
    And request payload
    When method PUT

    Then status 200
    And match response.coldMax == 20
    And match response.hotMin == '#number'