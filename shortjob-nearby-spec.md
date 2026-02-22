# Project: ShortJob -- Tìm việc ngắn hạn trong bán kính 3km

## 🎯 Mục tiêu

Xây dựng một web application cho phép:

-   Người đăng việc ngắn hạn (theo giờ / theo ngày)
-   Người tìm việc trong bán kính 3km
-   Hệ thống hiển thị job dựa theo khoảng cách địa lý
-   Có rating 2 chiều sau khi hoàn thành
-   Có hệ thống xác minh số điện thoại cơ bản

Stack yêu cầu:

-   Backend: Golang (Gin)
-   Database: PostgreSQL
-   Cache: Redis
-   Frontend: React + Vite + MUI
-   Auth: JWT
-   Map: Leaflet hoặc Google Maps
-   Deploy: Docker Compose

------------------------------------------------------------------------

# 🏗️ Kiến trúc tổng thể

## Backend Structure

/cmd\
/internal\
/domain\
/usecase\
/repository\
/delivery/http\
/pkg\
/config

## Frontend Structure

/src\
/api\
/pages\
/components\
/hooks\
/context

------------------------------------------------------------------------

# 🗺️ Core Feature: Tìm job trong bán kính 3km

## Haversine SQL Query

``` sql
SELECT *, (
6371 * acos(
cos(radians(?)) *
cos(radians(latitude)) *
cos(radians(longitude) - radians(?)) +
sin(radians(?)) *
sin(radians(latitude))
)
) AS distance
FROM jobs
HAVING distance < 3
ORDER BY distance;
```

Index:

``` sql
CREATE INDEX idx_jobs_location ON jobs(latitude, longitude);
```

------------------------------------------------------------------------

# 🧱 Database Schema

## users

-   id (uuid)
-   name
-   phone
-   password_hash
-   role (employer, worker)
-   latitude
-   longitude
-   rating_avg
-   rating_count
-   created_at

## jobs

-   id (uuid)
-   employer_id (fk users)
-   title
-   description
-   hourly_rate
-   total_payment
-   latitude
-   longitude
-   status (open, assigned, done, cancelled)
-   assigned_worker_id
-   created_at

## applications

-   id
-   job_id
-   worker_id
-   status (pending, accepted, rejected)
-   created_at

## ratings

-   id
-   job_id
-   from_user_id
-   to_user_id
-   score (1-5)
-   comment
-   created_at

------------------------------------------------------------------------

# 🔐 Authentication

POST /auth/register\
POST /auth/login\
POST /auth/refresh

JWT Access Token: 15 phút\
Refresh Token: 7 ngày

------------------------------------------------------------------------

# 📡 API Endpoints

## Job

POST /jobs\
GET /jobs/nearby?lat=...&lng=...\
GET /jobs/{id}\
PUT /jobs/{id}/assign\
PUT /jobs/{id}/complete

## Application

POST /jobs/{id}/apply\
PUT /applications/{id}/accept\
PUT /applications/{id}/reject

## Rating

POST /ratings

------------------------------------------------------------------------

# 🧠 Business Flow

1.  Employer tạo job
2.  Worker gần đó nhìn thấy
3.  Worker apply
4.  Employer accept
5.  Hoàn thành
6.  Hai bên rating

------------------------------------------------------------------------

# 🐳 Docker Compose Services

-   app
-   postgres
-   redis
-   nginx

------------------------------------------------------------------------

# 🛡️ Security

-   Rate limit login
-   Validate input
-   Limit radius tối đa 5km

------------------------------------------------------------------------

# 📈 Future Improvements

-   Escrow payment
-   Identity verification
-   Admin dashboard
-   Fraud detection
-   Subscription model
