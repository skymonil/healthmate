# ---------- Stage 1: Build the application ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy only pom.xml for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source
COPY src ./src

# Build application (skip tests for faster build)
RUN mvn clean package -DskipTests

# ---------- Stage 2: Create the runtime image ----------
FROM eclipse-temurin:21-jre-alpine AS runtime

# Add non-root user
RUN addgroup --system spring && adduser --system --ingroup spring springuser

WORKDIR /app

# Install CA certificates (with cleanup)


# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Set ownership
COPY --chown=springuser:springuser --from=builder /app/target/*.jar app.jar

USER springuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--spring.profiles.active=prod"]
