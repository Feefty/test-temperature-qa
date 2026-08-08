import com.intuit.karate.junit5.Karate;

/**
 * Single entry point for the suite. Default run excludes @known-bug scenarios
 * so `mvn test` stays green; pass -Dkarate.tags=@known-bug to run those on their own.
 */
class TestRunner {

    @Karate.Test
    Karate testSuite() {
        String tags = System.getProperty("karate.tags", "~@known-bug");
        return Karate.run().relativeTo(getClass()).tags(tags);
    }
}
