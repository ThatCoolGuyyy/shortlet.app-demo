# Shortlet Backend Challenge Submission

## Overview

This is a complete TypeScript + Express implementation of the Shortlet apartment listing and booking API. The solution fulfills all core requirements from the challenge:

✅ **Core Requirements Met:**
- REST API for apartment listings with CRUD operations
- Advanced filtering (location, price range, amenities) with pagination
- Booking system with overlap prevention
- Individual apartment booking retrieval
- Comprehensive error handling and input validation

✅ **Technical Requirements Met:**
- Built with Node.js 20, Express.js, and TypeScript
- PostgreSQL database with TypeORM ORM and migrations
- Complete unit and integration test suite (Jest + Supertest + pg-mem)
- JWT-based authentication with role-based access control (host/guest)
- Environment variable configuration management
- Health check endpoint (`/health`)
- Clean, well-documented, readable code

✅ **Bonus Features Included:**
- TypeScript throughout
- JWT authentication with role differentiation
- API caching with apicache
- Rate limiting (express-rate-limit)
- Docker containerization (multi-stage build)
- GitHub Actions CI/CD pipeline with automated testing and deployment
- Deployment to Render with health checks

## Architecture & Design

The API follows a layered architecture:
- **Controllers**: Handle HTTP request/response mapping
- **Services**: Encapsulate business logic (apartments, bookings, users)
- **Entities**: TypeORM models with database relationships
- **DTOs**: Request/response validation using class-validator
- **Middleware**: Authentication and authorization guards
- **Routes**: Clean endpoint organization

Key design decisions:
- Overlap prevention uses database-level date validation in booking service
- Pagination is configurable (default 10 items per page)
- JWT tokens encode user ID and role for efficient authorization
- Migrations ensure reproducible schema across environments

## Live Deployment

**Base URL:** `https://shortlet-app-demo.onrender.com`

The API is deployed on Render and ready for testing. Health check: `GET /health`

## Local Development

### Prerequisites
- Node.js v20+
- PostgreSQL database (local, Docker, or remote)

### Setup

```bash
npm install
```

Create `.env` file:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/shortlet_app
JWT_SECRET=your-secret-key-here
```

### Running Locally

```bash
npm run dev
```

API available at `http://localhost:3000`

### Running Tests

```bash
npm test
```

Tests run against an isolated in-memory PostgreSQL instance (pg-mem), requiring no external database setup.

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

All endpoints accept and return JSON. Endpoints marked 🔒 require JWT authentication.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | – | Health check |
| `POST` | `/auth/register` | – | Register user (role: `host` or `guest`) |
| `POST` | `/auth/login` | – | Login & receive JWT |
| `POST` | `/apartments` | 🔒 host | Create apartment listing |
| `GET` | `/apartments` | – | List apartments with filters & pagination |
| `GET` | `/apartments/:apartmentId` | – | Get apartment details |
| `POST` | `/apartments/:apartmentId/bookings` | 🔒 guest | Create booking |
| `GET` | `/apartments/:apartmentId/bookings` | 🔒 | List apartment bookings |

### Example Usage

```bash
# Register as host
curl -X POST https://shortlet-app-demo.onrender.com/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Alice Host",
    "email": "alice@example.com",
    "password": "password123",
    "role": "host"
  }'

# Response includes JWT token - use for subsequent requests
# TOKEN=<received-token>

# Create apartment listing (requires host token)
curl -X POST https://shortlet-app-demo.onrender.com/apartments \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Ocean View Apartment",
    "description": "Spacious beachfront apartment",
    "location": "Victoria Island",
    "pricePerNight": 250,
    "amenities": ["wifi", "pool", "balcony"]
  }'

# List apartments with filters
curl 'https://shortlet-app-demo.onrender.com/apartments?location=Lagos&minPrice=100&maxPrice=500&page=1&pageSize=10'

# Create booking (requires guest token)
curl -X POST https://shortlet-app-demo.onrender.com/apartments/{apartmentId}/bookings \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -d '{
    "startDate": "2024-12-20",
    "endDate": "2024-12-25"
  }'
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
1. Installs dependencies
2. Runs TypeScript compilation
3. Executes full test suite
4. Builds Docker image
5. Deploys to Render via deploy hook (on `main` branch)

Secrets configured in GitHub:
- `RENDER_DEPLOY_HOOK_URL` – Render deployment webhook

## Database Schema

The application uses three main entities:

**User** - Authentication & authorization
- id (UUID)
- email, name, passwordHash
- role (host/guest)

**Apartment** - Property listings
- id (UUID)
- title, description, location
- pricePerNight, amenities[]
- hostId (foreign key)

**Booking** - Reservations
- id (UUID)
- apartmentId, guestId (foreign keys)
- startDate, endDate, totalPrice
- Unique constraint preventing overlapping bookings

## Testing Coverage

**Unit Tests:**
- User service (password hashing, registration validation)
- Apartment service (filtering logic, pagination)
- Booking service (overlap detection, price calculation)
- Async error handler middleware

**Integration Tests:**
- Full auth flow (register → login)
- Apartment CRUD + filtering
- Booking creation with validation

All tests use Jest with Supertest for HTTP mocking and pg-mem for database isolation.

## License

MIT
