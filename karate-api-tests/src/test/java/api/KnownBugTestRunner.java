package api;

import com.intuit.karate.junit5.Karate;

/**
 * Runs scenarios that reproduce known application defects
 */
class KnownBugTestRunner {

    @Karate.Test
    Karate testKnownBugSuite() {
        return Karate.run().tags("@known-bug").relativeTo(getClass());
    }
}
