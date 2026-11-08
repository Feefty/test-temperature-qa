package feefty;

import com.intuit.karate.junit5.Karate;

class CaptureHistoryTest {
    @Karate.Test
    Karate captureHistory() {
        return Karate.run("capture-history").relativeTo(getClass());
    }
}