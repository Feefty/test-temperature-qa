FROM maven:3.9-eclipse-temurin-17

WORKDIR /karate

COPY pom.xml .
COPY src ./src

CMD ["mvn", "-B", "test"]