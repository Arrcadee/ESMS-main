# ESMS Integration Setup Guide

## Prerequisites
- Node.js v14+
- npm or yarn
- PostgreSQL 12+ (or Railway PostgreSQL connection)
- Two terminal windows

---

## Step 1: Backend Setup

### 1.1 Navigate to Server Directory
```bash
cd server
npm install
```

### 1.2 Create `.env` File
Create a file named `.env` in the `server` directory:

```env
# Database Configuration (Railway PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/dbname

# JWT Authentication
JWT_SECRET=your_secret_key_change_this_in_production

# Node Environment
NODE_ENV=development

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# Server Port
PORT=5000
```

**For Railway PostgreSQL:**
- Get your `DATABASE_URL` from Railway dashboard
- It should look like: `postgresql://user:password@terminal.railways.internal:5432/railway`

### 1.3 Initialize Database (First Time Only)
```bash
npm run seed
```

This will:
- Create all required tables (users, venues, events, approvals, notifications)
- Insert sample data for testing

### 1.4 Start the Backend Server
```bash
npm start
```
or for development with auto-reload:
```bash
npm run dev
```

**Expected Output:**
```
✓ ESMS Server running on http://localhost:5000
✓ Health check: http://localhost:5000/api/health
✓ Database connected: 2024-04-28T10:30:45.123Z
```

---

## Step 2: Frontend Setup

### 2.1 Navigate to Root Directory
```bash
cd ..
npm install
```

### 2.2 Verify Proxy Configuration
Check that `package.json` has the proxy field:
```json
{
  "proxy": "http://localhost:5000",
  ...
}
```

This should already be configured. If not, add it manually.

### 2.3 Start the Frontend
```bash
npm start
```

This will open the app in your browser at `http://localhost:3000`

---

## Step 3: Verify Integration

### 3.1 Test Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "message": "ESMS API running"
}
```

### 3.2 Test User Login
Use demo credentials:
- Email: `admin@esms.edu`
- Password: `admin123`

**Frontend will:**
1. Call `/api/auth/login` with credentials
2. Receive JWT token
3. Store token in localStorage
4. Fetch users, venues, and events from backend
5. Display dashboard with real data

### 3.3 Create a New Event
1. Navigate to "Events" page
2. Click "New Event"
3. Fill in event details
4. Submit - this calls `/api/events` (POST)
5. Event is saved to PostgreSQL database

### 3.4 Approve/Reject Events (Admin)
1. Login as admin: `e.nwachukwu@esms.edu` / `pass123`
2. Navigate to "Approvals"
3. Click event to approve or reject
4. Submit - calls `/api/approvals/{eventId}` (POST)
5. Event status updates in database

---

## Data Flow Architecture

```
React Frontend (localhost:3000)
          ↓
   API Utility (src/utils/api.js)
          ↓
   Proxy → http://localhost:5000
          ↓
   Express Server (localhost:5000)
          ↓
   Route → Controller → Model
          ↓
   PostgreSQL Database
          ↓
   Response → Frontend (JSON)
```

---

## Key Integration Points

### Authentication Flow
1. User enters email/password in React form
2. `handleLogin()` calls `authAPI.login()`
3. Backend validates credentials, returns JWT token
4. Token stored in localStorage via `setAuthToken()`
5. Future API calls include `Authorization: Bearer {token}`

### Data Fetching Flow
1. When user logs in, `useEffect` triggers
2. Fetches users, events, venues in parallel
3. Falls back to seed data if API fails
4. Component re-renders with real data from database

### State Management
- React state holds current session data
- User actions trigger async API calls
- State updates optimistically where appropriate
- Database is source of truth for persistent data

---

## Environment Variables Summary

### Backend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `JWT_SECRET` | Token signing key | `your_secret_key` |
| `NODE_ENV` | Environment type | `development` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `PORT` | Server port | `5000` |

### Frontend
- No `.env` needed
- Proxy configured in `package.json`
- API base path: `/api`

---

## Database


 Tables

```sql
users
  - id (PRIMARY KEY)
  - name, email, password
  - role (user, organizer, admin, super Admin)
  - avatar, department
  - created_at

venues
  - id (PRIMARY KEY)
  - name, location, capacity
  - facilities (array)
  - created_at

events
  - id (PRIMARY KEY)
  - title, description, category
  - date, start_time, end_time
  - venue_id (FOREIGN KEY)
  - organizer_id (FOREIGN KEY)
  - status (pending, approved, rejected)
  - approved_by, approval_note
  - attendees, tags
  - created_at

approvals
  - id (PRIMARY KEY)
  - event_id (FOREIGN KEY)
  - approved_by (FOREIGN KEY)
  - status, note
  - created_at
```

---

## Troubleshooting

### "Cannot find module 'pg'"
```bash
cd server
npm install
```

### "CORS error in browser"
- Check `CLIENT_URL=http://localhost:3000` in `.env`
- Verify frontend is running on port 3000
- Check browser console for exact error

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check PostgreSQL/Railway connection status
- Ensure database exists and is accessible
- Test with: `psql $DATABASE_URL`

### "401 Unauthorized errors"
- Token might be invalid or expired
- Check browser localStorage for `authToken`
- Clear localStorage and login again
- Verify `JWT_SECRET` matches between all instances

### "Cannot GET /api/events"
- Backend server not running on port 5000
- Check if route exists in `/server/routes/events.js`
- Verify Express app is serving the routes

---

## Testing Demo Account

### Super Admin
- Email: `admin@esms.edu`
- Password: `admin123`

### Admin
- Email: `e.nwachukwu@esms.edu`
- Password: `pass123`

### Organizer  
- Email: `c.eze@esms.edu`
- Password: `pass123`

### Regular User
- Email: `n.amadi@esms.edu`
- Password: `pass123`

---

## Production Deployment

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use strong random `JWT_SECRET`
4. Connect to production PostgreSQL (Railway)
5. Configure `CLIENT_URL` to production frontend domain
6. Build frontend: `npm run build`
7. Deploy to hosting service (Vercel, Netlify, Railway, etc.)

---

## Running Locally with All Services

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
npm install
npm start
```

Both will start automatically and integrate seamlessly via the proxy.

---

## Verification Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Database connected and seeded
- [ ] Can login with demo credentials
- [ ] Events display from database
- [ ] Can create new events
- [ ] Can approve/reject events (as admin)
- [ ] No CORS errors in browser console
- [ ] No database errors in server logs

---

**Status: ✓ Integration Complete & Fully Functional**
