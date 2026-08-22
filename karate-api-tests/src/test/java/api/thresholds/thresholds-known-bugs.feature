@known-bug
Feature: PUT /api/thresholds - known-bug suite

  # Each scenario asserts the behavior a robust API should have (clean 400 +
  # JSON error body, no persisted change). Against the current implementation
  # (src/app/api/thresholds/route.ts) they fail - that failure is the finding.
  #
  # Excluded from the default `mvn test` run (see pom.xml / ApiTestRunner) so
  # a red result here never blocks the stable suite. Run on purpose with:
  #   mvn test -Dtest=KnownBugTestRunner -DfailIfNoTests=false
  # See README.md for the full list of documented bugs.
  #
  # Each scenario still restores whatever thresholds it finds on entry,
  # because several of these bugs persist a change to the database despite
  # returning an unexpected status.

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

  Scenario: Known bug: an empty JSON object body is silently accepted as a no-op instead of rejected
    # Actual: returns 200 with the unchanged current thresholds. There is
    # nothing to update, this should be a 400 "coldMax and hotMin are required".
    Given path '/api/thresholds'
    And request {}
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario: Known bug: a truly empty request body crashes with a raw 500 instead of a clean 400
    # Actual: request.json() throws on the empty body and the route has no
    # try/catch, so Next.js returns a bare 500 with no body and no
    # Content-Type header at all - not the documented { error, statusCode } shape.
    Given path '/api/thresholds'
    And header Content-Type = 'application/json'
    And request ''
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario: Known bug: malformed JSON crashes with a raw 500 instead of a clean 400
    * def malformedJson = '{ coldMax: 20, hotMin ,, }'
    Given path '/api/thresholds'
    And header Content-Type = 'application/json'
    And request malformedJson
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario Outline: Known bug: a non-numeric value crashes with a raw 500 instead of a clean 400
    # Strings and booleans are coerced by JS's `>=`/`-` operators, so the
    # `coldMax >= hotMin` / gap checks pass, and Prisma then throws a
    # client-side validation error when writing a non-Float value into the
    # Float column - unhandled, hence 500. `hotMin: false` needs a negative
    # coldMax in its example to avoid being accidentally caught by coercion
    # (false coerces to 0, and a positive coldMax would trip the order check
    # for the right reason, masking this crash) - the same effect as null,
    # see the null scenario below.
    Given path '/api/thresholds'
    And request <body>
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

    Examples:
      | body                                |
      | { coldMax: '20', hotMin: 35 }       |
      | { coldMax: 20, hotMin: '40' }       |
      | { coldMax: true, hotMin: 35 }       |
      | { coldMax: -5, hotMin: false }      |

  Scenario Outline: Known bug: a null value crashes with a raw 500 instead of a clean 400
    # `null` is coerced to 0 by JS's `>=`/`-` operators, so whether this
    # crashes depends on the sign of the other field: { coldMax: 18, hotMin:
    # null } is accidentally caught by the `coldMax >= hotMin` check (18 >= 0)
    # and returns a clean 400 - not because null is validated, but because it
    # coerces to a value the existing check happens to reject. Both examples
    # below are chosen so that coercion does NOT accidentally save the day,
    # to isolate the real crash: Prisma rejects `null` for a non-nullable
    # Float column, and the route has no try/catch around it.
    Given path '/api/thresholds'
    And request <body>
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

    Examples:
      | body                            |
      | { coldMax: null, hotMin: 35 }   |
      | { coldMax: -5, hotMin: null }   |

  Scenario: Known bug: a partial update (coldMax only) can silently create coldMax > hotMin
    # Reproduces the exact case from the exercise: only coldMax is sent, and
    # the route's `coldMax >= hotMin` check compares a number to `undefined`,
    # which is always false via JS coercion (NaN comparisons never match) - so
    # the check is bypassed. Prisma then ignores the `undefined` hotMin key and
    # updates only coldMax, leaving the thresholds in an inconsistent state
    # where coldMax > hotMin. (Actual: 200, persisting that inconsistent state -
    # see the equivalent stable-suite scenario for how a correctly rejected
    # update is confirmed not to persist.)
    * def inconsistentColdMax = originalHotMin + 10
    Given path '/api/thresholds'
    And request { coldMax: '#(inconsistentColdMax)' }
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario: Known bug: a partial update (hotMin only) can silently create coldMax > hotMin
    * def inconsistentHotMin = originalColdMax - 10
    Given path '/api/thresholds'
    And request { hotMin: '#(inconsistentHotMin)' }
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario: Known bug: a partial update (coldMax only) can silently produce a gap below 2 degrees
    # Same root cause as above, but the order check accidentally still holds
    # (coldMax stays below hotMin) - only the minimum-gap rule is broken.
    * def gapViolatingColdMax = originalHotMin - 1
    Given path '/api/thresholds'
    And request { coldMax: '#(gapViolatingColdMax)' }
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario: Known bug: a partial update (hotMin only) can silently produce a gap below 2 degrees
    * def gapViolatingHotMin = originalColdMax + 1
    Given path '/api/thresholds'
    And request { hotMin: '#(gapViolatingHotMin)' }
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

  Scenario Outline: Known bug: thresholds outside the physical sensor range [-10, 50] are accepted
    # The sensor can only ever report values in [-10, 50] (src/lib/sensor.ts),
    # so thresholds outside that range can never be crossed and are almost
    # certainly a user/config error. The route has no such validation.
    Given path '/api/thresholds'
    And request <body>
    When method put
    Then status 400
    And match response == { error: '#string', statusCode: 400 }

    Examples:
      | body                                |
      | { coldMax: -50, hotMin: 10 }        |
      | { coldMax: 10, hotMin: 100 }        |
      | { coldMax: 1e15, hotMin: 1e16 }     |
