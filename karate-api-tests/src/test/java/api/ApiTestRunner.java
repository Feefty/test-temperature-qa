package api;

import com.intuit.karate.junit5.Karate;

/**
 * Runs the stable API test suite, excluding known defects
 */
class ApiTestRunner {

    @Karate.Test
    Karate testStableSuite() {
        return Karate.run().tags("~@known-bug").relativeTo(getClass());
    }
}
