# ESMS Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

**Required variables:**
- `PORT` — Server port (default: 5000)
- `DATABASE_URL` — PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/esms`)
- `JWT_SECRET` — Long random string (min 32 chars) for sign tokens
- `CLIENT_URL` — Frontend URL for CORS (e.g., `http://localhost:3000`)
- `NODE_ENV` — `development` or `production`

### 3. Create PostgreSQL Database

```bash
# Using psql
createdb esms
```

Or via GUI (pgAdmin, DBeaver, etc.).

### 4. Run Database Seed

```bash
npm run seed
```

This will:
- Create all tables
- Insert seed users (with hashed passwords)
- Insert seed venues
- Insert seed events

**Seed credentials:**
- Email: `admin@esms.edu`, Password: `admin123` (super Admin)
- Email: `c.eze@esms.edu`, Password: `pass123` (organizer)

### 5. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will be available at: `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

---

## Project Structure

```
/server
 ├── /config           # Database configuration
 │    └── db.js
 ├── /controllers      # Business logic
 │    ├── authController.js
 │    ├── userController.js
 │    ├── eventController.js
 │    ├── venueController.js
 │    ├── approvalController.js
 │    ├── analyticsController.js
 │    └── notificationController.js
 ├── /routes           # API route handlers
 │    ├── auth.js
 │    ├── users.js
 │    ├── events.js
 │    ├── venues.js
 │    ├── approvals.js
 │    ├── analytics.js
 │    └── notifications.js
 ├── /models           # Database queries (data layer)
 │    ├── userModel.js
 │    ├── eventModel.js
 │    ├── venueModel.js
 │    ├── approvalModel.js
 │    └── notificationModel.js
 ├── /middleware       # Express middleware
 │    ├── authMiddleware.js    # JWT protection & admin checks
 │    └── errorMiddleware.js   # Centralized error handler
 ├── /utils            # Shared utilities
 │    └── conflictDetector.js  # Venue booking conflict logic
 ├── /db               # Database scripts
 │    ├── schema.sql       # Table creation DDL
 │    └── runSeed.js       # Seed data runner
 ├── app.js            # Express app setup
 ├── server.js         # Server entry point
 ├── package.json
 └── .env
```

---

## API Overview

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — User login (returns JWT)

### Users
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id/role` — Update user role (admin only)

### Events
- `GET /api/events` — List all events
- `GET /api/events/:id` — Get event by ID
- `POST /api/events` — Create event (protected)
- `PUT /api/events/:id` — Update event (organizer or admin)
- `DELETE /api/events/:id` — Delete event (organizer or admin)

### Venues
- `GET /api/venues` — List all venues
- `GET /api/venues/:id` — Get venue by ID
- `POST /api/venues` — Create venue (admin only)
- `PUT /api/venues/:id` — Update venue (admin only)
- `DELETE /api/venues/:id` — Delete venue (admin only)

### Approvals
- `GET /api/approvals` — List all approvals (admin only)
- `POST /api/approvals/:eventId` — Approve/reject event (admin only)
- `PUT /api/approvals/:eventId` — Update approval (admin only)

### Analytics
- `GET /api/analytics` — Get dashboard analytics (public)

### Notifications
- `GET /api/notifications` — Get user's notifications (protected)
- `PUT /api/notifications/:id/read` — Mark as read (protected)
- `PUT /api/notifications/mark-all-read` — Mark all as read (protected)

---

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

JWT is valid for **7 days**.

**User roles:**
- `super Admin` — Full system access
- `admin` — Approve events, manage venues and users
- `organizer` — Create and manage own events
- `user` — Basic user (view-only mostly)

---

## Response Format

All endpoints return:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Errors:

```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

---

## Deployment

### Railway

1. Push code to GitHub
2. Create Railway project
3. Connect GitHub repo
4. Add PostgreSQL plugin
5. Set environment variables:
   - `DATABASE_URL` (auto-filled by Railway)
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `NODE_ENV=production`
6. Deploy

Start command: `npm start`

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Verify database user permissions

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### JWT Token Expired
- Tokens expire after 7 days
- User must login again to get new token

### Conflict Detection Warnings
Events are rejected if there's a time overlap at the same venue (excluding rejected/completed events).

---

## Development Notes

- All database queries use parameterized statements (`$1, $2...`) to prevent SQL injection
- Passwords are hashed with bcrypt (10 salt rounds)
- CORS is locked to the frontend URL
- All responses use camelCase field names (mappped from DB snake_case)
- Seed data uses relative dates from `CURRENT_DATE` to stay fresh

