# ---------- Stage 1: Build the application ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

# Set the working directory
WORKDIR /app

# Copy only the pom.xml first for dependency caching
COPY pom.xml .
COPY src ./src

# Package the application (skip tests for faster build, remove if you want tests to run)
RUN mvn clean package -DskipTests

# ---------- Stage 2: Create the runtime image ----------
FROM eclipse-temurin:21-jre AS runtime

# Set a non-root user for security
RUN useradd -ms /bin/bash springuser

# Set working directory
WORKDIR /app

# Copy the JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership
RUN chown springuser:springuser app.jar

# Switch to non-root user
USER springuser

# Expose the port your Spring Boot app runs on (default 8080)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]

