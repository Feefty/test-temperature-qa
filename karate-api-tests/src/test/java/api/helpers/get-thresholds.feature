@ignore
Feature: Helper - read the currently active thresholds
  Not a standalone test. Called with `call read(...)` from Background sections
  so every scenario can snapshot the current thresholds before mutating them,
  without assuming they are always the seeded 22/35 defaults.

  Scenario: Read the currently active thresholds
    Given url baseUrl
    And path '/api/thresholds'
    When method get
    Then status 200
    * def coldMax = response.coldMax
    * def hotMin = response.hotMin
