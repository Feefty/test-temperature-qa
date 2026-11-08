package feefty;

import com.intuit.karate.junit5.Karate;

class KnownBugsRunner {
    @Karate.Test
    Karate reproduceKnownBugs() {
        return Karate.run("thresholds", "negative-thresholds")
                .relativeTo(getClass()).tags("@knownBug");
    }
}