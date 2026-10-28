# Estágio 1: compila o projeto com JDK 21 e Maven Wrapper
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src src
RUN ./mvnw -B -q package -DskipTests

# Estágio 2: executa apenas o .jar com JRE 21
FROM eclipse-temurin:21-jre AS runner
WORKDIR /app

RUN useradd --system --no-create-home cancha
COPY --from=build /app/target/*.jar app.jar
USER cancha

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
