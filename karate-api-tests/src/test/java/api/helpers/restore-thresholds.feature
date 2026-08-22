@ignore
Feature: Helper - write given threshold values
  Not a standalone test. Called from `configure afterScenario` hooks to
  restore the thresholds a scenario found on entry, even when the scenario
  failed or the endpoint under test behaved unexpectedly. Also called
  directly by classification scenarios in capture.feature to set up the
  thresholds a test needs, since it is the same PUT operation either way.

  Scenario: Write the given coldMax and hotMin values
    Given url baseUrl
    And path '/api/thresholds'
    And request { coldMax: '#(coldMax)', hotMin: '#(hotMin)' }
    When method put
    Then status 200
