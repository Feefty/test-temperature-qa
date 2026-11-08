package feefty;

import com.intuit.karate.junit5.Karate;

class NegativeThresholdsTest {
    @Karate.Test
    Karate negativeThresholds() {
        return Karate.run("negative-thresholds").relativeTo(getClass()).tags("~@knownBug");
    }
}
