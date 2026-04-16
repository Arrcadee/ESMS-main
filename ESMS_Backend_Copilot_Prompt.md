# ESMS BACKEND — COPILOT PROMPT (AMENDED)
> Fully reviewed against the live ESMS-main React frontend source code.
> Every data shape, field name, role value, status value, and endpoint contract
> below is verified against the actual frontend hooks, pages, modals, and seed data.

---

## OBJECTIVE

You are building the **complete, production-ready backend and PostgreSQL database** for the **ESMS (Event Scheduling Management System)** React frontend.

The frontend is **already complete and must NOT be modified**. It currently runs on local seed data. Your job is to build the API layer that cleanly replaces that data layer.

---

## STACK (MANDATORY)

| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `pg` | PostgreSQL client (native, no ORM) |
| `dotenv` | Environment variables |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT auth tokens |
| `cors` | Cross-origin headers |
| `helmet` | Security headers |
| `morgan` | HTTP request logging |

---

## PROJECT STRUCTURE

```
/server
 ├── /config
 │    └── db.js               ← pg Pool + connect()
 ├── /controllers
 │    ├── authController.js
 │    ├── userController.js
 │    ├── eventController.js
 │    ├── venueController.js
 │    ├── approvalController.js
 │    └── analyticsController.js
 ├── /routes
 │    ├── auth.js
 │    ├── users.js
 │    ├── events.js
 │    ├── venues.js
 │    ├── approvals.js
 │    └── analytics.js
 ├── /models
 │    ├── userModel.js
 │    ├── eventModel.js
 │    ├── venueModel.js
 │    └── approvalModel.js
 ├── /middleware
 │    ├── authMiddleware.js    ← JWT protect()
 │    └── errorMiddleware.js   ← centralised error handler
 ├── /utils
 │    └── conflictDetector.js  ← port of frontend detectConflicts()
 ├── /db
 │    └── seed.sql             ← seed data matching frontend initialUsers / initialVenues / initialEvents
 ├── app.js
 ├── server.js
 ├── package.json
 └── .env
```

---

## ENVIRONMENT VARIABLES (.env)

```
PORT=5000
DATABASE_URL=<Railway PostgreSQL connection string>
JWT_SECRET=<strong random secret — min 32 chars>
CLIENT_URL=<Vercel frontend URL, e.g. https://esms.vercel.app>
```

---

## DATABASE SCHEMA (STRICTLY FOLLOW)

### CRITICAL: Exact field names must align with frontend field access

```sql
-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'user',
  avatar       TEXT,                        -- 2-char initials, e.g. "AO"
  department   TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── VENUES ───────────────────────────────────────────────────────────────────
CREATE TABLE venues (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  location     TEXT,                        -- mapped from frontend "building" field
  capacity     INTEGER,
  facilities   TEXT[],                      -- PostgreSQL array, e.g. {"Projector","AC"}
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── EVENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE events (
  id             SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT,                      -- one of the 8 CATEGORIES (see below)
  date           DATE NOT NULL,             -- stored as DATE "YYYY-MM-DD"
  start_time     TEXT,                      -- "HH:MM" 24-hr format, e.g. "09:00"
  end_time       TEXT,                      -- "HH:MM" 24-hr format, e.g. "17:00"
  venue_id       INTEGER REFERENCES venues(id) ON DELETE SET NULL,
  organizer_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | completed
  approved_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approval_note  TEXT DEFAULT '',
  attendees      INTEGER DEFAULT 0,
  tags           TEXT[],                    -- PostgreSQL array
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── APPROVALS ────────────────────────────────────────────────────────────────
CREATE TABLE approvals (
  id           SERIAL PRIMARY KEY,
  event_id     INTEGER REFERENCES events(id) ON DELETE CASCADE,
  approved_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  note         TEXT DEFAULT '',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
-- Optional but recommended to support the notification bell in the frontend
CREATE TABLE notifications (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT,         -- "approval" | "rejection" | "submission" | "reminder"
  title        TEXT,
  message      TEXT,
  event_id     INTEGER REFERENCES events(id) ON DELETE CASCADE,
  read         BOOLEAN DEFAULT false,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### VALID ROLE VALUES (from frontend constants.js)
```
"super Admin"    ← ROLES.SUPER_ADMIN (note the capital A and space)
"admin"          ← ROLES.ADMIN
"organizer"      ← ROLES.ORGANIZER
"user"           ← ROLES.USER
```

### VALID STATUS VALUES (from frontend constants.js)
```
"pending"
"approved"
"rejected"
"completed"
```

### VALID CATEGORY VALUES (from frontend constants.js)
```
"Academic", "Cultural", "Sports", "Administrative",
"Workshop", "Seminar", "Conference", "Social"
```

---

## API RESPONSE FORMAT (MANDATORY — every endpoint)

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

For arrays:
```json
{
  "success": true,
  "data": [],
  "message": ""
}
```

For errors:
```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error description"
}
```

---

## JSON FIELD NAMING CONVENTION

**All JSON responses must use camelCase** to match the frontend's direct property access.
Map database snake_case columns to camelCase in all responses:

| Database column | JSON response key |
|---|---|
| `venue_id` | `venueId` |
| `organizer_id` | `organizerId` |
| `approved_by` | `approvedBy` |
| `approval_note` | `approvalNote` |
| `start_time` | `startTime` |
| `end_time` | `endTime` |
| `created_at` | `createdAt` |
| `user_id` | `userId` |
| `event_id` | `eventId` |

---

## ENDPOINT SPECIFICATIONS

### 1. AUTH — `/api/auth`

#### POST `/api/auth/register`
**Request body:**
```json
{
  "name": "Chisom Eze",
  "email": "c.eze@esms.edu",
  "password": "pass123",
  "department": "Student Affairs",
  "role": "user"
}
```
**Logic:**
- Validate name, email, password are present
- Check email uniqueness
- Hash password with `bcrypt` (saltRounds: 10)
- Auto-generate `avatar`: first letter of each word in name, joined, uppercased, max 2 chars (e.g. "Chisom Eze" → "CE")
- Insert user, return JWT + user object (omit password)

**Response `data`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 3,
    "name": "Chisom Eze",
    "email": "c.eze@esms.edu",
    "role": "user",
    "avatar": "CE",
    "department": "Student Affairs",
    "createdAt": "2024-01-10T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/login`
**Request body:**
```json
{ "email": "admin@esms.edu", "password": "admin123" }
```
**Logic:**
- Find user by email
- Compare password with `bcrypt.compare()`
- Return JWT (expires: `"7d"`) + user object (omit password)

**Response `data`:** Same shape as register response.

---

### 2. USERS — `/api/users`

#### GET `/api/users`
- **Protected:** Yes (JWT required)
- Returns all users, passwords excluded
- Response `data` is an array

**Each user object:**
```json
{
  "id": 1,
  "name": "Dr. Adaeze Okafor",
  "email": "admin@esms.edu",
  "role": "super Admin",
  "avatar": "AO",
  "department": "Administration",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT `/api/users/:id/role`
- **Protected:** Yes (JWT required, caller must be `super Admin`)
- Update a user's role
- **Request body:** `{ "role": "admin" }`
- Used by the UsersPage role-change dropdown

---

### 3. EVENTS — `/api/events`

> **CRITICAL:** The event object shape is the most important.
> The frontend accesses: `event.id`, `event.title`, `event.description`,
> `event.category`, `event.date`, `event.startTime`, `event.endTime`,
> `event.venueId`, `event.organizerId`, `event.status`, `event.approvedBy`,
> `event.approvalNote`, `event.attendees`, `event.tags`, `event.createdAt`

#### GET `/api/events`
- **Protected:** No (public)
- Returns all events as array
- `date` field must be returned as `"YYYY-MM-DD"` string (not full ISO timestamp)
  — the frontend does `e.date >= fmtDate(new Date())` string comparison

**Each event object:**
```json
{
  "id": 1,
  "title": "Annual Science Exhibition",
  "description": "Showcase of student research...",
  "category": "Academic",
  "date": "2024-04-21",
  "startTime": "09:00",
  "endTime": "17:00",
  "venueId": 1,
  "organizerId": 3,
  "status": "approved",
  "approvedBy": 2,
  "approvalNote": "Approved. Ensure safety protocols.",
  "attendees": 342,
  "tags": ["research", "innovation"],
  "createdAt": "2024-04-06T00:00:00.000Z"
}
```

#### GET `/api/events/:id`
- Returns single event or 404

#### POST `/api/events`
- **Protected:** Yes (JWT required)
- **Request body:**
```json
{
  "title": "New Workshop",
  "description": "...",
  "category": "Workshop",
  "date": "2024-05-10",
  "startTime": "09:00",
  "endTime": "12:00",
  "venueId": 2,
  "tags": ["learning"]
}
```
- Server sets: `organizerId` from JWT user, `status = "pending"`, `attendees = 0`, `approvedBy = null`, `approvalNote = ""`
- **Run conflict detection on server side** (same logic as frontend `detectConflicts()`):
  - For the same `date` and `venueId`, check no existing non-rejected/non-completed event overlaps the time window
  - If conflict found, return `400` with message describing the conflicting event title
- Returns created event object

#### PUT `/api/events/:id`
- **Protected:** Yes (JWT required)
- Caller must be the organizer OR admin/super Admin
- Accepts same fields as POST (partial update supported)
- Re-run conflict detection on update (exclude the event being edited)
- Returns updated event

#### DELETE `/api/events/:id`
- **Protected:** Yes (JWT required)
- Caller must be the organizer OR admin/super Admin
- Returns `{ "success": true, "data": null, "message": "Event deleted." }`

---

### 4. VENUES — `/api/venues`

#### GET `/api/venues`
- **Protected:** No (public)
- Returns all venues

**Each venue object:**
```json
{
  "id": 1,
  "name": "Main Auditorium",
  "location": "Main Block",
  "capacity": 800,
  "facilities": ["Projector", "AC", "Sound System", "Stage"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

> NOTE: Frontend accesses `venue.name`, `venue.capacity`, `venue.building` (legacy),
> and `venue.facilities`. The `building` field in seed data maps to `location` in DB.
> When serving venues, **include a `building` alias** equal to `location` for backward
> compatibility until the frontend is updated:
> ```json
> { "location": "Main Block", "building": "Main Block", ... }
> ```

#### POST `/api/venues`
- **Protected:** Yes (admin/super Admin only)
- **Request body:** `{ "name", "location", "capacity", "facilities": [] }`

#### PUT `/api/venues/:id`
- **Protected:** Yes (admin/super Admin only)

#### DELETE `/api/venues/:id`
- **Protected:** Yes (admin/super Admin only)

---

### 5. APPROVALS — `/api/approvals`

#### GET `/api/approvals`
- **Protected:** Yes (admin/super Admin only)
- Returns all approval records joined with event title and approver name

#### POST `/api/approvals/:eventId`
- **Protected:** Yes (admin/super Admin only)
- **Creates** a new approval record for an event
- **Request body:** `{ "status": "approved" | "rejected", "note": "optional text" }`
- **Side effects (CRITICAL):**
  1. Update `events.status` to the new status
  2. Update `events.approved_by` to the current user's id
  3. Update `events.approval_note` to the provided note
  4. Insert into `notifications` table:
     - For approval: `{ userId: event.organizerId, type: "approval", title: "Event Approved", message: '"<title>" has been approved.', eventId }`
     - For rejection: `{ userId: event.organizerId, type: "rejection", title: "Event Rejected", message: '"<title>" was rejected: <note>', eventId }`
- Returns the updated event object

#### PUT `/api/approvals/:eventId`
- **Protected:** Yes (admin/super Admin only)
- Updates an existing approval decision
- Same side effects as POST

---

### 6. ANALYTICS — `/api/analytics`

#### GET `/api/analytics`
- **Protected:** No (public)
- Performs aggregation queries

**Response `data`:**
```json
{
  "totalEvents": 8,
  "approvedEvents": 2,
  "pendingEvents": 3,
  "rejectedEvents": 1,
  "completedEvents": 2,
  "totalAttendees": 1570,
  "approvalRate": 75,
  "totalVenues": 6,
  "totalUsers": 6,
  "byCategory": [
    { "category": "Academic", "count": 2 },
    { "category": "Workshop", "count": 2 }
  ],
  "byMonth": [
    { "month": "Jan", "count": 0 },
    { "month": "Feb", "count": 0 },
    ...
    { "month": "Dec", "count": 0 }
  ],
  "venueUsage": [
    { "id": 1, "name": "Main Auditorium", "location": "Main Block", "building": "Main Block", "capacity": 800, "eventCount": 4 }
  ],
  "organizerLeaderboard": [
    { "id": 3, "name": "Chisom Eze", "avatar": "CE", "department": "Student Affairs", "role": "organizer", "eventCount": 4 }
  ]
}
```

> The frontend AnalyticsPage computes all these values from raw event/user/venue arrays.
> Move this computation server-side. `approvalRate` = round((approved+completed) / (total - pending) * 100) if denominator > 0 else 0.

---

### 7. NOTIFICATIONS — `/api/notifications`

#### GET `/api/notifications`
- **Protected:** Yes (JWT required)
- Returns notifications for the current user (from JWT), ordered newest first
- Response `data` is array

**Each notification object:**
```json
{
  "id": 1,
  "userId": 3,
  "type": "approval",
  "title": "Event Approved",
  "message": "\"Annual Science Exhibition\" has been approved.",
  "eventId": 1,
  "read": false,
  "createdAt": "2024-04-12T00:00:00.000Z"
}
```

#### PUT `/api/notifications/:id/read`
- **Protected:** Yes
- Marks a single notification as read

#### PUT `/api/notifications/mark-all-read`
- **Protected:** Yes
- Marks all notifications for the current user as read

---

## JWT MIDDLEWARE

File: `/server/middleware/authMiddleware.js`

```javascript
// protect() — attach req.user from token
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, data: null, message: 'Not authorised, no token' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach full user (minus password) to req.user
    const result = await pool.query('SELECT id, name, email, role, avatar, department FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows[0]) throw new Error('User not found');
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, data: null, message: 'Token invalid or expired' });
  }
};

// adminOnly() — must be admin or super Admin
const adminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super Admin')) {
    return res.status(403).json({ success: false, data: null, message: 'Admin access required' });
  }
  next();
};
```

---

## CONFLICT DETECTION UTILITY

File: `/server/utils/conflictDetector.js`

Port the frontend logic exactly:

```javascript
// Returns array of conflicting events
const detectConflicts = async (pool, newEvent, excludeId = null) => {
  const timeToMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Fetch events on same date at same venue, excluding completed/rejected and excludeId
  const { rows } = await pool.query(`
    SELECT id, title, start_time, end_time
    FROM events
    WHERE date = $1
      AND venue_id = $2
      AND status NOT IN ('rejected', 'completed')
      ${excludeId ? 'AND id != $3' : ''}
  `, excludeId
    ? [newEvent.date, newEvent.venueId, excludeId]
    : [newEvent.date, newEvent.venueId]
  );

  const newStart = timeToMin(newEvent.startTime);
  const newEnd   = timeToMin(newEvent.endTime);

  return rows.filter(ev => {
    const existStart = timeToMin(ev.start_time);
    const existEnd   = timeToMin(ev.end_time);
    return newStart < existEnd && newEnd > existStart;
  });
};
```

---

## SEED DATA — `/server/db/seed.sql`

Seed must exactly match frontend `initialUsers`, `initialVenues`, `initialEvents`.

### Users (passwords must be bcrypt-hashed):
```sql
INSERT INTO users (name, email, password, role, avatar, department) VALUES
  ('Dr. Adaeze Okafor',       'admin@esms.edu',       '<bcrypt(admin123)>', 'super Admin', 'AO', 'Administration'),
  ('Prof. Emmanuel Nwachukwu','e.nwachukwu@esms.edu',  '<bcrypt(pass123)>',  'admin',       'EN', 'Academic Affairs'),
  ('Chisom Eze',              'c.eze@esms.edu',        '<bcrypt(pass123)>',  'organizer',   'CE', 'Student Affairs'),
  ('Tobenna Obi',             't.obi@esms.edu',        '<bcrypt(pass123)>',  'organizer',   'TO', 'Sports & Recreation'),
  ('Ngozi Amadi',             'n.amadi@esms.edu',      '<bcrypt(pass123)>',  'user',        'NA', 'Engineering'),
  ('Ikenna Chukwu',           'i.chukwu@esms.edu',     '<bcrypt(pass123)>',  'user',        'IC', 'Sciences');
```

### Venues:
```sql
INSERT INTO venues (name, location, capacity, facilities) VALUES
  ('Main Auditorium',   'Main Block',      800,  ARRAY['Projector','AC','Sound System','Stage']),
  ('Conference Hall A', 'Admin Block',     150,  ARRAY['Projector','AC','Whiteboard']),
  ('Lecture Hall 101',  'Academic Block 1',200,  ARRAY['Projector','AC']),
  ('Sports Complex',    'Sports Ground',   1200, ARRAY['Floodlights','Sound System','Bleachers']),
  ('ICT Lab',           'Science Block',   60,   ARRAY['Computers','Projector','AC']),
  ('Seminar Room B2',   'Admin Block',     80,   ARRAY['Projector','Whiteboard']);
```

### Events:
Match the 8 seed events. Use relative dates from CURRENT_DATE:
```sql
INSERT INTO events (title, description, category, date, start_time, end_time, venue_id, organizer_id, status, approved_by, approval_note, attendees, tags) VALUES
  ('Annual Science Exhibition',       'Showcase of student research...',     'Academic',   CURRENT_DATE + 5,   '09:00','17:00', 1, 3, 'approved',  2, 'Approved. Ensure safety protocols.',   342, ARRAY['research','innovation']),
  ('Inter-Department Football Championship','Annual football competition...',  'Sports',    CURRENT_DATE + 12,  '10:00','18:00', 4, 4, 'approved',  2, '',                                      520, ARRAY['sports','competition']),
  ('Leadership & Governance Workshop', 'Interactive workshop...',             'Workshop',  CURRENT_DATE + 3,   '13:00','17:00', 2, 3, 'pending',   NULL, '',                                   0,   ARRAY['leadership']),
  ('Alumni Homecoming Gala',          'Annual reunion...',                    'Social',    CURRENT_DATE + 20,  '18:00','22:00', 1, 3, 'pending',   NULL, '',                                   0,   ARRAY['alumni','networking']),
  ('Python Programming Bootcamp',     '3-day intensive bootcamp...',          'Workshop',  CURRENT_DATE - 3,   '08:00','16:00', 5, 4, 'completed', 2, 'Approved.',                             58,  ARRAY['programming','python']),
  ('Cultural Heritage Day',           'Celebration of diverse cultures...',   'Cultural',  CURRENT_DATE - 8,   '10:00','20:00', 1, 3, 'completed', 1, 'Approved — great initiative.',          650, ARRAY['culture','diversity']),
  ('Research Methodology Seminar',    'Seminar for postgrad students...',     'Seminar',   CURRENT_DATE + 8,   '10:00','13:00', 3, 3, 'rejected',  2, 'Venue unavailable. Please reschedule.',0,   ARRAY['research','postgrad']),
  ('International Conference on AI',  'Two-day international conference...',  'Conference',CURRENT_DATE + 30,  '08:00','18:00', 1, 4, 'pending',   NULL, '',                                   0,   ARRAY['AI','technology','international']);
```

---

## CENTRALISED ERROR HANDLER

File: `/server/middleware/errorMiddleware.js`

```javascript
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    data: null,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

---

## app.js SKELETON

```javascript
const express  = require('express');
const helmet   = require('helmet');
const morgan   = require('morgan');
const cors     = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const eventRoutes     = require('./routes/events');
const venueRoutes     = require('./routes/venues');
const approvalRoutes  = require('./routes/approvals');
const analyticsRoutes = require('./routes/analytics');
const notifRoutes     = require('./routes/notifications');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/venues',        venueRoutes);
app.use('/api/approvals',     approvalRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notifRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'ESMS API running' }));

app.use(errorHandler);

module.exports = app;
```

---

## package.json

```json
{
  "name": "esms-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node db/runSeed.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "pg": "^8.11.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## SECURITY REQUIREMENTS

- Never return `password` field in any response
- CORS locked to `CLIENT_URL` only
- JWT expiry: `"7d"`
- Role checks enforced server-side (not just client-side)
- Use parameterised queries (`$1, $2, ...`) — never string-interpolate SQL

---

## RAILWAY DEPLOYMENT

- Use `process.env.PORT` (Railway assigns dynamically)
- Use `process.env.DATABASE_URL` with `ssl: { rejectUnauthorized: false }` in pg Pool config:
  ```javascript
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  ```
- Start command: `npm start`
- Set all `.env` variables in Railway dashboard as environment variables

---

## INTEGRATION CONTRACT CHECKLIST

Before considering the backend complete, verify every item:

- [ ] `GET /api/events` returns array with `venueId`, `organizerId`, `startTime`, `endTime`, `approvedBy`, `approvalNote`, `attendees`, `tags` in camelCase
- [ ] `event.date` is `"YYYY-MM-DD"` string (not ISO timestamp) for calendar/filter string comparisons
- [ ] `event.status` is one of exactly: `"pending"`, `"approved"`, `"rejected"`, `"completed"`
- [ ] `user.role` is one of exactly: `"super Admin"`, `"admin"`, `"organizer"`, `"user"` (note "super Admin" capital A)
- [ ] `venue.building` field present in venue response (alias of `location`) for frontend VenuesPage/AnalyticsPage
- [ ] `venue.facilities` is a JSON array
- [ ] `event.tags` is a JSON array
- [ ] POST /api/events conflict detection works (same venue + date + overlapping times)
- [ ] POST /api/approvals/:eventId updates both `approvals` table AND `events` table status
- [ ] POST /api/approvals/:eventId creates notification for the event organizer
- [ ] GET /api/analytics returns `byCategory`, `byMonth`, `venueUsage`, `organizerLeaderboard`
- [ ] All protected routes return 401 without valid token
- [ ] Admin-only routes return 403 for `organizer` and `user` roles
- [ ] Passwords hashed with bcrypt — never stored or returned in plain text
- [ ] Seed data matches frontend initialUsers, initialVenues, initialEvents exactly
- [ ] Health check endpoint `/api/health` responds 200

---

## GENERATE ALL OF THE FOLLOWING

Produce complete, working code for **every file** listed in the project structure above:

1. `server.js` — starts the server
2. `app.js` — express app config
3. `config/db.js` — pg Pool
4. `middleware/authMiddleware.js` — protect + adminOnly
5. `middleware/errorMiddleware.js`
6. `utils/conflictDetector.js`
7. `models/userModel.js` — all user DB queries
8. `models/eventModel.js` — all event DB queries (return camelCase)
9. `models/venueModel.js` — all venue DB queries (include building alias)
10. `models/approvalModel.js` — all approval DB queries
11. `controllers/authController.js`
12. `controllers/userController.js`
13. `controllers/eventController.js`
14. `controllers/venueController.js`
15. `controllers/approvalController.js`
16. `controllers/analyticsController.js`
17. `controllers/notificationController.js`
18. `routes/auth.js`
19. `routes/users.js`
20. `routes/events.js`
21. `routes/venues.js`
22. `routes/approvals.js`
23. `routes/analytics.js`
24. `routes/notifications.js`
25. `db/seed.sql` — with bcrypt-hashed passwords pre-computed
26. `db/runSeed.js` — script to execute seed.sql
27. `package.json`
28. `.env.example`

Implement step by step, file by file. Do not skip any file. Each file must be complete with no TODOs or placeholders.
