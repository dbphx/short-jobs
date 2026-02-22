# ShortJob — Tìm việc ngắn hạn trong bán kính 3km

A full-stack web application for finding and posting short-term jobs within a 3km radius.

## Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Backend    | Golang (Gin), GORM            |
| Database   | PostgreSQL                    |
| Cache      | Redis                         |
| Frontend   | React + Vite + MUI            |
| Auth       | JWT (access + refresh tokens) |
| Map        | Leaflet (OpenStreetMap)       |
| Deploy     | Docker Compose                |

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (optional)

### Run with Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost (via nginx) or http://localhost:3000 (direct)
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Run Locally (development)

**Backend:**
```bash
cd backend
cp .env.example .env  # Edit with your DB/Redis credentials
go run cmd/api/main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Path                          | Auth | Role     |
|--------|-------------------------------|------|----------|
| POST   | `/api/auth/register`          | No   | -        |
| POST   | `/api/auth/login`             | No   | -        |
| POST   | `/api/auth/refresh`           | No   | -        |
| POST   | `/api/jobs`                   | Yes  | Employer |
| GET    | `/api/jobs/nearby?lat=&lng=`  | Yes  | Any      |
| GET    | `/api/jobs/:id`               | Yes  | Any      |
| PUT    | `/api/jobs/:id/assign`        | Yes  | Employer |
| PUT    | `/api/jobs/:id/complete`      | Yes  | Employer |
| POST   | `/api/jobs/:id/apply`         | Yes  | Worker   |
| PUT    | `/api/applications/:id/accept`| Yes  | Employer |
| PUT    | `/api/applications/:id/reject`| Yes  | Employer |
| POST   | `/api/ratings`                | Yes  | Any      |

## Project Structure

```
work-near-me/
├── backend/
│   ├── cmd/api/main.go           # Entry point
│   ├── config/                   # Viper config
│   ├── internal/
│   │   ├── domain/               # Models
│   │   ├── repository/           # Database layer
│   │   ├── usecase/              # Business logic
│   │   └── delivery/http/        # Handlers & middleware
│   └── pkg/                      # JWT & hashing utils
├── frontend/
│   └── src/
│       ├── api/                  # Axios client
│       ├── context/              # Auth context
│       ├── components/           # Reusable UI
│       └── pages/                # Route pages
├── nginx/                        # Reverse proxy config
├── scripts/                      # DB init
└── docker-compose.yml
```
