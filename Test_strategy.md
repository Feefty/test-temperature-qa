# Bug Identification / Inconsistencies

** To have relevant scenarios it's important to imagine how this software will be used, this product is most likely to be linked to a hardware that would detect the current temperature store it and classify it as COLD, WARM or HOT (a weather station maybe) **

1- Bug: The thresholds api is lacking payload validation
     - Entering text in the values triggers a 500 error instead of a 400.
     - Entering one value instead of both works fine on the api but should it ?
     - An empty payload works but shouldn't.
     - Entering one value on the UI doesn't work.
     - Providing additionnal fields doesn't trigger an error this might lead to some security issues (SQLI).
     - Implement some max/min validation this will help the user to detect any hardware malfunction.
     - There should be some validation for decimal values, max number of decimal digits ? one inconsistency is the thresholds api rounds up after 14 decimal digits but the capture api doesn't.
     - The implemented validation is confusing coldMax must be strictly less than hotMin but when you respect this condition there is another one Minimum gap between coldMax and hotMin must be 2°C you can have both rules in the same message.
     - Last but not least the naming of the path should be /api/temperature/thresholds.

2- Capturing temperature api
     - The date field is named timestamp whereas in the history api it's capturedAt this might create some issues if the apis are used by other software.
     - Clear decimal digits rules.
     - This is debatable but I would discuss with the team the necessity of storing the state value since it is a calculated value in a big data environment avoiding this might save some money, the only argument that is relevant to storing this value is to centralize the rules of this value.


# Test plan

- First of all Equivalence Partitioning to test the different states (classes) HOT COLD WARM.
- Boundary Value Analysis to see the states at the boundaries when the captured temperature is equal to the max and min thresholds.
- Varify the validation of the apis.
- Concurrence testing (What happens when the thresholds are updated at the same time as we capture a temperature, what happens when two temperatures are captured at the same time).
- Non passing tests:    - What happens when the thresholds api fails normally the last values should stay.
                        - When the thresholds api fails the right error message should be displayed.
                        - Types validation.
- For the history api when pass the 15 records size check that the most recent ones are the ones that appear.
- Decimal values tests.
- It is worth verifying how the front reacts when using negative values.

# Prioritization

- Equivalence Partitioning to test the different states (classes) HOT COLD WARM and Boundary Value Analysis are a must.

# Edge cases

- Temperatures equal to maxCold and hotMin.
- Having more that 15 temperature records and check that the most recent one are the ones that are listed.
- Decimal limits in both thresholds and capture apis.
- Types validation of the apis.
- Fields validation of thresholds api.

# What you would add with more time

- Load testing to see the apps behavior if we have many recordings.
- Concurrency tests to see what happens if we have recordings of temperature at the same time and to see how the app reacts when we update the thresholds and have a capture at the same time.
- A pipeline to run all tests after every update to the code.

