Feature: Temperature capture and history API

  Background:
    * url 'http://localhost:3000'

  Scenario: Capture returns 201 and is persisted in history with mapped timestamp
    Given path 'api', 'thresholds'
    When method get
    Then status 200
    * def thresholds = response
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    And match response == { id: '#string', temperature: '#number', state: '#string', coldMax: '#number', hotMin: '#number', timestamp: '#string' }
    * def captured = response
    * match captured.coldMax == thresholds.coldMax
    * match captured.hotMin == thresholds.hotMin
    * match ['COLD', 'WARM', 'HOT'] contains captured.state
    Given path 'api', 'temperature', 'history'
    When method get
    Then status 200
    And match response == { readings: '#[]', count: '#number', maxSize: 15 }
    * def history = response
    * match history.count == history.readings.length
    * def matching = karate.filter(history.readings, function(x){ return x.id == captured.id })
    * match matching == "#[]"
    * assert matching.length == 1
    * match matching[0].temperature == captured.temperature
    * match matching[0].state == captured.state
    * match matching[0].coldMax == captured.coldMax
    * match matching[0].hotMin == captured.hotMin
    * match matching[0].capturedAt == captured.timestamp

  Scenario: History returns newest 15 after 16 sequential captures
    * def ids = []
    # Capture 1
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 2
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 3
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 4
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 5
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 6
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 7
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 8
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 9
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 10
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 11
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 12
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 13
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 14
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 15
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    # Capture 16
    Given path 'api', 'temperature', 'capture'
    When method post
    Then status 201
    * eval ids.push(response.id)
    Given path 'api', 'temperature', 'history'
    When method get
    Then status 200
    * def history = response
    * match history.maxSize == 15
    * match history.count == 15
    * match history.readings == "#[15]"
    * def returnedIds = karate.map(history.readings, function(x){ return x.id })
    * match returnedIds == ids.slice(1).reverse()
    * assert returnedIds.indexOf(ids[0]) == -1
    * def timestamps = karate.map(history.readings, function(x){ return x.capturedAt })
    * def sortedTimestamps = timestamps.slice().sort().reverse()
    * match timestamps == sortedTimestamps
