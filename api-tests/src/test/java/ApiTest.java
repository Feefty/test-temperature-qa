import com.intuit.karate.junit5.Karate;

class ApiTest {

    @Karate.Test
    Karate runApiTests() {
        return Karate.run("classpath:features");
    }
}