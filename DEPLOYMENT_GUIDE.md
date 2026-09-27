# Hướng dẫn Triển Khai Lên Render & Kết Nối Database Supabase

Tài liệu này hướng dẫn từng bước để đưa toàn bộ dự án **Food & Coffee** lên môi trường Production miễn phí:
- **Database**: PostgreSQL lưu trữ trên **Supabase** (dữ liệu vĩnh viễn, không lo mất khi restart máy chủ).
- **Backend**: Java Spring Boot 3 chạy trên **Render Web Service**.
- **Frontend**: Giao diện chạy trên **Render Static Site**.

---

## BƯỚC 1: TẠO DATABASE TRÊN SUPABASE

1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập (bằng tài khoản GitHub hoặc Google).
2. Bấm **"New project"**:
   - **Name**: `food-coffee-db`
   - **Database Password**: Nhập mật khẩu an toàn (ví dụ: `FoodCoffee2026@Secure`) -> *Nhớ lưu lại mật khẩu này*.
   - **Region**: Chọn `Singapore` (để tốc độ về Việt Nam nhanh nhất).
   - Chọn gói **Free Plan** rồi bấm **Create new project**.
3. Sau khi project khởi tạo xong:
   - Vào mục **Project Settings** (biểu tượng bánh răng ở cột trái) -> Chọn **Database**.
   - Cuộn xuống phần **Connection string** -> Chọn tab **URI** hoặc **JDBC**:
     - Định dạng JDBC URL:  
       `jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
     - Username mặc định: `postgres`
     - Password: Mật khẩu bạn đã đặt ở bước 2.

> 💡 *Lưu ý*: Spring Boot với `spring.jpa.hibernate.ddl-auto=update` sẽ **tự động tạo toàn bộ bảng (`places`, `users`)** ngay lần đầu chạy, bạn không cần phải viết câu lệnh SQL thủ công!

---

## BƯỚC 2: TRIỂN KHAI BACKEND LÊN RENDER

1. Truy cập [https://render.com](https://render.com) và đăng nhập bằng GitHub.
2. Đẩy (push) thư mục code này lên một repository trên GitHub của bạn.
3. Trên Render Dashboard, bấm **New +** -> Chọn **Web Service**.
4. Chọn repository GitHub vừa push.
5. Điền thông tin cấu hình:
   - **Name**: `food-coffee-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests` hoặc `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/food-coffee-api-1.0.0.jar`
   - **Instance Type**: `Free`
6. Cuộn xuống phần **Environment Variables** và thêm các biến môi trường:
   - `SPRING_DATASOURCE_URL`: Chuỗi kết nối JDBC Supabase (ví dụ: `jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?sslmode=require`)
   - `SPRING_DATASOURCE_USERNAME`: `postgres`
   - `SPRING_DATASOURCE_PASSWORD`: `<Mật khẩu Supabase của bạn>`
   - `SPRING_DATASOURCE_DRIVER_CLASS_NAME`: `org.postgresql.Driver`
   - `SPRING_JPA_DIALECT`: `org.hibernate.dialect.PostgreSQLDialect`
7. Bấm **Create Web Service**.  
   Render sẽ tự động build file `.jar` và kết nối trực tiếp vào Supabase.  
   Sau khi hoàn tất, bạn sẽ nhận được một đường link URL backend dạng:  
   `https://food-coffee-backend-xxxx.onrender.com`

---

## BƯỚC 3: TRIỂN KHAI FRONTEND LÊN RENDER STATIC SITE

1. Trên Render Dashboard, bấm **New +** -> Chọn **Static Site**.
2. Chọn cùng repository GitHub đó.
3. Điền cấu hình:
   - **Name**: `food-coffee-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: *(Để trống)*
   - **Publish Directory**: `.`
4. Bấm **Create Static Site**.  
   Render sẽ tạo đường link web trực tiếp cho bạn (ví dụ: `https://food-coffee-frontend.onrender.com`).

---

## BƯỚC 4: KẾT NỐI FRONTEND VỚI BACKEND RENDER

Trong file `frontend/js/services/apiService.js`, bạn chỉ cần cấu hình URL backend Render của bạn:

```javascript
const API_BASE_URL = 'https://food-coffee-backend-xxxx.onrender.com/api';
```

Hoặc khi mở web trên trình duyệt, bạn có thể thiết lập ngay trong Console F12 mà không cần sửa code:
```javascript
localStorage.setItem('RENDER_API_BASE_URL', 'https://food-coffee-backend-xxxx.onrender.com/api');
location.reload();
```

---

## TỔNG KẾT KIẾN TRÚC LIVE
```text
[ Người Dùng Trình Duyệt ]
           │
           ▼
[ Render Static Site (HTML / CSS / JS MVC) ]
           │ (Fetch API)
           ▼
[ Render Web Service (Java Spring Boot 3 REST API) ]
           │ (JDBC SSL)
           ▼
[ Supabase Cloud Database (PostgreSQL Cloud) ]
```
Toàn bộ dữ liệu thêm quán, sửa quán, xoá quán và tài khoản sẽ được lưu vĩnh viễn trên Supabase và đồng bộ tức thì lên Render!
