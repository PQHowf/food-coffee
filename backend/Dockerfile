# Giai đoạn 1: Build file JAR bằng Maven & OpenJDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Giai đoạn 2: Runtime image siêu nhẹ Eclipse Temurin JRE 17
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/food-coffee-api-1.0.0.jar app.jar

# Tạo thư mục uploads ảnh
RUN mkdir -p uploads

# Khai báo biến môi trường cổng mặc định
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
