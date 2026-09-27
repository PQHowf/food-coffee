# Food & Coffee Recommendation API - Java Spring Boot Backend

Dự án Java Backend REST API chuẩn Spring Boot 3 & Java 17+ giải quyết triệt để vấn đề quá tải trình duyệt và lưu trữ dữ liệu tập trung.

## Cấu trúc thư mục

```
backend/
├── pom.xml
├── src/
│   └── main/
│       ├── java/com/foodcoffee/
│       │   ├── Application.java             # Main Application
│       │   ├── config/
│       │   │   ├── DataInitializer.java     # Nạp dữ liệu mẫu ban đầu
│       │   │   └── WebMvcConfig.java        # CORS & static upload mapping
│       │   ├── controller/
│       │   │   ├── PlaceController.java     # REST API /api/places
│       │   │   ├── UserController.java      # REST API /api/users
│       │   │   └── FileUploadController.java# REST API /api/upload
│       │   ├── model/
│       │   │   ├── Place.java               # JPA Entity Quán ăn & Cafe
│       │   │   └── User.java                # JPA Entity Người dùng
│       │   ├── repository/
│       │   │   ├── PlaceRepository.java
│       │   │   └── UserRepository.java
│       │   └── service/
│       │       ├── FileStorageService.java  # Lưu trữ tệp tải lên
│       │       ├── PlaceService.java
│       │       └── UserService.java
│       └── resources/
│           └── application.properties       # Cấu hình H2, Server port 8080, Upload limit
```

## Cách cài đặt và chạy trên macOS

### 1. Cài đặt Java 17 và Maven (nếu chưa có):
```bash
brew install openjdk@17 maven
```

### 2. Khởi chạy Server:
```bash
cd backend
mvn spring-boot:run
```

- **REST API Endpoint**: `http://localhost:8080/api`
- **H2 Database Console**: `http://localhost:8080/h2-console`
- **Thư mục ảnh upload**: `backend/uploads/`
