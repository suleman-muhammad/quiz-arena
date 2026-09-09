# Stage 1: Build JAR using Gradle & JDK 21
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy gradle wrapper and config files
COPY gradle/ gradle/
COPY gradlew gradlew.bat build.gradle settings.gradle ./

# Copy source code
COPY src/ src/

# Build production executable JAR without running tests
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

# Stage 2: Ultra-lightweight JRE 21 runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built JAR from builder stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
