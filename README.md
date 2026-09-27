# Food & Coffee Recommendation Web Application

Hệ thống đề xuất quán ăn và quán cafe được tái cấu trúc hoàn chỉnh theo chuẩn kiến trúc **MVC (Model - View - Controller)** kết hợp **Java Spring Boot REST API**.

---

## 🏗️ Cấu Trúc Thư Mục Chuẩn MVC

```
Food-Coffee/
│
├── backend/                                # [JAVA SPRING BOOT MVC & REST API]
│   ├── pom.xml                             # Cấu hình Maven (Spring Boot 3, JPA, H2, Lombok)
│   ├── README.md                           # Hướng dẫn chạy backend
│   └── src/main/
│       ├── java/com/foodcoffee/
│       │   ├── Application.java            # Main Spring Boot Class
│       │   ├── controller/                 # [C - Controllers] REST Endpoints
│       │   │   ├── PlaceController.java    # /api/places (CRUD quán ăn/cafe)
│       │   │   ├── UserController.java     # /api/users (đăng nhập, profile)
│       │   │   └── FileUploadController.java # /api/upload (xử lý upload ảnh đa nền tảng)
│       │   ├── model/                      # [M - Models/Entities]
│       │   │   ├── Place.java              # JPA Entity Quán
│       │   │   └── User.java               # JPA Entity Người dùng
│       │   ├── repository/                 # Data Access Layer
│       │   │   ├── PlaceRepository.java
│       │   │   └── UserRepository.java
│       │   ├── service/                    # Business Logic Layer
│       │   │   ├── PlaceService.java
│       │   │   ├── UserService.java
│       │   │   └── FileStorageService.java # Quản lý lưu trữ ảnh đĩa cứng
│       │   └── config/
│       │       ├── WebMvcConfig.java       # CORS & Static mapping (/uploads/**)
│       │       └── DataInitializer.java    # Seed Data ban đầu
│       └── resources/
│           └── application.properties      # Cấu hình H2, Server port 8080, Upload limit
│
├── frontend/                               # [CLIENT-SIDE MVC ARCHITECTURE]
│   ├── index.html                          # [V - View] Giao diện người dùng chính
│   ├── assets/
│   │   └── css/
│   │       └── style.css                   # Định kiểu giao diện & hiệu ứng
│   └── js/
│       ├── models/                         # [M - Model]
│       │   └── state.js                    # Quản lý State, LocalStorage & Dữ liệu hạt giống
│       ├── views/                          # [V - View]
│       │   └── view.js                     # Render Place Cards, Modals, Toasts, DOM Elements
│       ├── controllers/                    # [C - Controller]
│       │   └── appController.js            # Điều phối sự kiện, liên kết Model & View
│       └── services/                       # API Service Layer
│           └── apiService.js               # Kết nối REST API tới Java Spring Boot
│
├── index.html                              # Chuyển hướng tự động tới frontend/index.html
└── README.md
```

---

## 🚀 Hướng Dẫn Chạy Dự Án

### 1. Khởi chạy Frontend (Live Server)
Dự án frontend đang chạy tại: **[http://127.0.0.1:3000](http://127.0.0.1:3000)** (tự động chuyển hướng tới `frontend/index.html`).

### 2. Khởi chạy Backend Java Spring Boot (khi đã cài JDK 17 & Maven)
```bash
cd backend
mvn spring-boot:run
```
- **Backend API URL**: `http://localhost:8080/api`
- **H2 Console**: `http://localhost:8080/h2-console`
- Khi backend bật, frontend sẽ tự động nhận diện và đồng bộ dữ liệu vào cơ sở dữ liệu!
