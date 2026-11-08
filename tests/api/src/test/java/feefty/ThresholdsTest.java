package feefty;

import com.intuit.karate.junit5.Karate;

class ThresholdsTest {
    @Karate.Test
    Karate testThresholds() {
        return Karate.run("thresholds").relativeTo(getClass()).tags("~@knownBug");
    }
}
