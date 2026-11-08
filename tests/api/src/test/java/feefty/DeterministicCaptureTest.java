package feefty;

import com.intuit.karate.junit5.Karate;

class DeterministicCaptureTest {
    @Karate.Test
    Karate deterministicCapture() {
        return Karate.run("deterministic-capture").relativeTo(getClass());
    }
}
