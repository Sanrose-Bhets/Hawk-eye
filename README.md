# Hawk-eye

Hawk-eye is a full-stack examination management platform for colleges. It provides role-based portals for RTE staff, student services and students, covering the entire exam lifecycle: student records, result publishing, exam routines, seat plans, class room booking, admit card generation and data backup.

The project is split into two applications:

- `Backend/` - a NestJS REST API
- `Frontend/` - a React single page application

## Table of Contents

- [Tech Stack](#tech-stack)
- [Role-Based Portals](#role-based-portals)
- [Core Features](#core-features)
- [Infrastructure Features](#infrastructure-features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Quality Tooling](#quality-tooling)
- [API Documentation](#api-documentation)

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| NestJS 11 + TypeScript | Application framework |
| Prisma ORM (v8, @prisma/orm-postgres) | Type-safe database access via contract-based driver adapter |
| PostgreSQL 16 | Primary relational database |
| Redis 7 + ioredis | Caching, refresh token storage, BullMQ transport |
| BullMQ | Background job processing (asynchronous email delivery) |
| @nestjs/throttler | API rate limiting |
| MinIO (S3-compatible) via @aws-sdk/client-s3 | Object storage with presigned URLs |
| Passport + JWT | Authentication and authorization |
| class-validator + class-transformer | Request DTO validation and transformation |
| @nestjs/swagger | Automatic OpenAPI documentation |
| Winston + nest-winston | Structured logging with daily rotation |
| @nestjs/schedule | Cron and scheduled jobs |
| pdfkit | PDF generation (admit cards) |
| sharp | Server-side image optimization |
| multer | In-memory file upload handling |
| csv-parse | CSV parsing for bulk student import |
| Resend / Nodemailer | Swappable email delivery providers |
| temporal-polyfill | TC39 Temporal API polyfill |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool and dev server |
| Tailwind CSS v4 | Styling |
| Redux Toolkit + Redux Persist | Global state with localStorage persistence |
| React Router 7 | Client-side routing |
| Axios | HTTP client with automatic token-refresh interceptor |
| @dnd-kit | Drag-and-drop seat canvas editor |
| Tiptap | Rich text editor for email composition |
| Chart.js + react-chartjs-2 | Performance analytics charts |
| lucide-react | Icon set |
| html-to-image | Client-side image export |

### DevOps and Tooling

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Local infrastructure and production images |
| NGINX | Frontend web server with security headers and API proxy |
| GitHub Actions | CI/CD pipeline that builds and pushes images to Docker Hub |
| Lefthook | Git hooks for pre-commit checks |
| ESLint + Prettier | Code linting and formatting |

## Role-Based Portals

Hawk-eye exposes three separate login portals and dashboards, guarded by JWT role claims:

| Role | Access |
|---|---|
| Student Service (STUDENT_SERVICE) | Student, faculty, module, teacher and result management, bulk email, class bookings, backup |
| RTE (RTE) | Floor plans and seat plans, classes, exam routines, admit cards, calendar notes, backup |
| Student (STUDENT) | Own profile, results, analytics, modules, seating, today's/upcoming exams, admit card download |

## Core Features

### Authentication

- Email and password login with bcrypt password hashing.
- JWT access token (short-lived) and refresh token (7 days) rotation.
- Tokens delivered as `httpOnly` cookies with `sameSite` and path constraints.
- Refresh tokens are stored in Redis and revoked on rotation.
- Role-based authorization via `JwtAuthGuard` and `RolesGuard` with a custom `@Roles()` decorator.
- Exponential backoff on password checks via bcrypt cost factor.

### Rate Limiting

- A global `ThrottlerGuard` applies a default limit of 100 requests per minute to every route.
- Stricter per-route limits protect sensitive endpoints:
  - Login: 5 attempts per 15 minutes.
  - Token refresh: 10 attempts per 15 minutes.
  - Backup import: 3 attempts per hour.

### Students

- Full CRUD with pagination, keyword search and faculty filtering.
- Bcrypt-hashed passwords with a default account password for bulk-created students.
- Bulk import from CSV (a `sample-students.csv` template is included) with per-row error reporting.
- Profile image upload using `sharp` for re-encoding and compression, stored in object storage.
- Parent email captured per student to drive automated parent notifications.
- Student list responses cached in Redis with 5 minute TTL and pattern-based invalidation on writes.

### Faculties, Modules and Teachers

- Faculty management where modules and semesters are organized.
- Modules with optional codes, module leaders and semester mappings (`ModuleSemester`).
- Teachers assigned to faculties and modules, used to route exam notification emails.

### Results and Performance Analytics

- Results with per-module scores and grades, drafted and then published.
- Publishing results automatically queues emails to both the student and their parent.
- Bulk import of result items with a post-import performance check.
- Performance analytics comparing semester GPA, average score and standing.
- A scheduled weekly sweep (Monday 08:00, override with `PERFORMANCE_CRON`) detects performance decreases (5% score or 0.30 GPA drop, or a standing downgrade) and queues alert emails to students and parents.
- Duplicate performance alerts are suppressed within a 7-day window.

### Calendar Notes

- RTE staff can maintain dated notes and announcements in a shared calendar.

### Exam Routines

- Exam scheduling with date, start/end time, duration, faculty and module.
- Notifies all teachers assigned to the module as soon as an exam routine is created.

### Admit Cards

- PDF admit cards generated with `pdfkit` (student, module, exam and seating details).
- Bulk generation for an entire faculty and semester, or one-off for a single student.
- PDFs uploaded to object storage and served through short-lived presigned URLs.
- Students can view and download their own admit card from their portal.

### Seat Plans

- Floor plan editor with a drag-and-drop seat canvas (powered by @dnd-kit), including doors, seat labels and renaming.
- Classes built on top of floor plans with student-to-seat assignments.
- Seating information is surfaced to students in their portal.

### Class Bookings

- Room (class) booking with purpose and time window.
- A cron job running every minute automatically frees bookings once their end time passes.

### Mail Management

- Compose emails to students or parents from the rich text editor (Tiptap).
- Bulk dispatch to multiple students with per-student error reporting.
- Full email log with status tracking (`queued`, `sent`, `failed`), pagination and stats.
- Emails are queued via BullMQ and delivered by a swappable provider (Resend or Nodemailer) selected through a provider token.

### Data Backup

- Role-scoped backup: Student Service exports its own tables, RTE exports its tables.
- Backup export as JSON attachments including student profile images as base64.
- Import validates role ownership and only replaces tables the current role owns; it rejects payloads containing foreign tables.
- Preview endpoint reports row counts per table before import.
- A weekly automated backup email (Sunday 00:00) is queued with the full backup attached.

### Health Check

- A `GET /api/v1/health` endpoint reports service availability and timestamp.

## Infrastructure Features

### Background Jobs with BullMQ

- A dedicated email queue provides asynchronous, reliable mail delivery.
- Jobs carry automatic retries with exponential backoff (3 attempts), and email log records are updated to `sent` or `failed` on completion.
- Used by result publishing, performance alerts, exam routine notifications, parent mail and weekly backups.

### Redis Usage

- **Queue transport:** BullMQ relies on Redis for job storage and worker coordination.
- **Caching:** student list caching via `CacheService` with TTL and pattern invalidation.
- **Auth:** server-side refresh token storage with 7 day expiry, enabling revocation and rotation.

### Object Storage (MinIO / S3)

- A `FILE_STORAGE` abstraction supports two interchangeable implementations.
- `S3FileStorageService` (default) uses the AWS SDK against any S3-compatible endpoint, auto-creates the bucket on startup, and returns 1-hour presigned URLs for downloads.
- `LocalFileStorageService` is available for local development without external services.
- Used for student profile images, admit card PDFs and backup image retrieval.
- Selection is driven by the `FILE_STORAGE_TYPE` environment variable.

### Logging

- Winston with `DailyRotateFile` transports, wired into NestJS as the application logger.
- A global `LoggingInterceptor` records incoming requests, and a global `HttpExceptionFilter` normalizes errors into a consistent response shape.

### Scheduled Jobs

| Job | Schedule |
|---|---|
| Weekly backup email | Sunday 00:00 |
| Weekly performance decrease sweep | Monday 08:00 (override via `PERFORMANCE_CRON`) |
| Auto-free expired class bookings | Every minute |

### Docker and Deployment

- `Backend/docker-compose.yml` provisions PostgreSQL 16, Redis 7 (with persistence), MinIO and the Redis Commander web UI.
- The backend image is a two-stage `node:22-bookworm-slim` build running as the unprivileged `node` user.
- The frontend is built with `node:alpine` and served by `nginx:alpine` running as the `nginx` user, with:
  - SPA fallback via `try_files` to `index.html`.
  - Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permission-Policy, Content-Security-Policy).
  - Request proxying from `/api/` to the backend service.

### CI/CD

- A GitHub Actions pipeline (`pipeline.yaml`) triggers on push and pull requests to `main`.
- It builds both images with Buildx and pushes `latest` plus a short-SHA tag to Docker Hub.
- Open Container Initiative labels embed the build version and build time.

### Git Hooks (Lefthook)

- A pre-commit hook runs in parallel, gated by changed file globs:
  - Frontend and backend TypeScript typechecks (`tsc -b --noEmit`).
  - Frontend and backend Prettier format checks.
- This enforces type safety and formatting before any commit lands.

## Architecture

- **API layer:** Controllers expose a REST API under the `/api/v1` prefix, protected by guards and decorators.
- **Service layer:** Business logic (validation, orchestration, queueing and file uploads).
- **Repository layer:** Data-access interfaces decoupled from Prisma models, populated through dependency injection tokens so repositories can be swapped and tested independently.
- **Factory layer:** Maps Prisma models to typed API entities/DTOs.
- **State and transport:** The frontend talks to the API through an Axios client that transparently refreshes expired access tokens using the stored refresh token and clears credentials when refresh fails.

## Project Structure

```
.
├── Backend/
│   ├── docker-compose.yml        # Postgres, Redis, Redis Commander, MinIO
│   ├── prisma/                   # Contract + JSON schema and seed scripts
│   └── src/
│       ├── common/               # Redis, cache, file storage, guards, decorators,
│       │                         # filters, interceptors, swagger, winston
│       └── modules/              # Feature modules (auth, student, results,
│                                 # seat-plan, mail, backup, admit-card, ...)
├── Frontend/
│   └── src/
│       ├── components/           # UI, dashboard, auth, seat-plan components
│       ├── context/              # Sidebar context
│       ├── lib/                  # Axios client, API modules, hooks, types
│       ├── pages/                # Home, login and dashboard pages
│       └── redux/                # Redux store, persistence, user slice
├── docker/
│   ├── backend/Dockerfile
│   └── frontend/                 # Dockerfile and nginx.conf
├── .github/workflows/pipeline.yaml
├── lefthook.yml
└── sample-students.csv           # CSV template for student bulk import
```

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm
- Docker and Docker Compose

### 1. Start the infrastructure

```bash
cd Backend
cp .env .env.local   # adjust as needed
docker compose up -d
```

This starts PostgreSQL (port 5434), Redis (6379), MinIO (9000 API, 9001 console) and Redis Commander (8081).

### 2. Set up the database

```bash
cd Backend
npm install
npm run seed           # creates the STUDENT_SERVICE and RTE accounts
```

The seed users default to `ssd@islingtoncollege.com` and `rte@islingtoncollege.com` with password `admin123` (configurable through environment variables).

### 3. Run the backend

```bash
cd Backend
npm run start:dev      # http://localhost:3000
```

Swagger documentation is available at `http://localhost:3000/api`.

### 4. Run the frontend

```bash
cd Frontend
npm install
npm run dev            # http://localhost:5173
```

Copy `Frontend/.env` and point `VITE_API_URL` at the backend, e.g. `http://localhost:3000`.

## Environment Variables

### Backend

| Variable | Description | Default |
|---|---|---|
| `PORT` | API port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `FRONTEND_URL` | Allowed CORS origin | - |
| `JWT_SECRET` | Access token signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | - |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection | `127.0.0.1` / `6379` |
| `FILE_STORAGE_TYPE` | `s3` or `local` | `s3` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_FORCE_PATH_STYLE` | Object storage configuration | - |
| `MAIL_PROVIDER` | `resend` or `nodemailer` | `resend` |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` | Email provider credentials | - |
| `SEED_SERVICE_EMAIL`, `SEED_SERVICE_PASSWORD`, `SEED_RTE_EMAIL`, `SEED_RTE_PASSWORD` | Seed account credentials | - |
| `BACKUP_EMAIL` | Recipient of the weekly automated backup | - |
| `PERFORMANCE_CRON` | Override for the performance sweep schedule | `0 8 * * 1` |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run start:dev` | Start the API in watch mode |
| `npm run build` | Compile the NestJS application |
| `npm run start:prod` | Run the compiled production build |
| `npm run lint` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript type checking |
| `npm run format` / `npm run format:check` | Prettier write / verify |
| `npm test` | Run Jest unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run seed` | Seed Student Service and RTE accounts |
| `npm run seed:faculties` | Seed faculties |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run format:check` | Prettier verify |

## Docker

Start all required services locally:

```bash
docker compose -f Backend/docker-compose.yml up -d
```

- PostgreSQL: `localhost:5434`
- Redis: `localhost:6379`
- MinIO API / Console: `localhost:9000` / `localhost:9001`
- Redis Commander: `localhost:8081`

Production images are defined in `docker/backend/Dockerfile` and `docker/frontend/Dockerfile`. The frontend container serves the compiled SPA via NGINX and proxies `/api/` requests to the backend service.

## CI/CD

The GitHub Actions workflow `.github/workflows/pipeline.yaml` runs on push and pull requests to `main`. It:

1. Reads the short commit SHA and build timestamp.
2. Sets up Docker Buildx and logs in to Docker Hub using repository secrets.
3. Builds and pushes `hawk-eye-frontend` and `hawk-eye-api` images under the `latest` and short-SHA tags.
4. Injects OCI labels (`VERSION`, `BUILD_TIME`) as build arguments.

## Quality Tooling

- **Prettier** enforces consistent code formatting across both applications.
- **ESLint** (with typescript-eslint and React hooks rules) enforces code quality on the frontend.
- **Lefthook** runs backend and frontend typechecks plus Prettier checks as a pre-commit hook, in parallel.
- **Jest** provides unit and e2e testing coverage on the backend.
- The frontend uses **React Router code splitting** (lazy-loaded routes) to keep the initial bundle small.

## API Documentation

Interactive Swagger documentation is generated with `@nestjs/swagger` and served at:

```
GET /api
```

All API routes are namespaced under `/api/v1`. Protected routes require the JWT cookie set at login and enforce role-based access through the roles guard.