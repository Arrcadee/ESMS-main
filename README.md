# ESMS — Event Scheduling Management System

A production-grade, full-featured Event Scheduling Management System built with React.js.
Implements all modules from the Requirements Analysis document including authentication,
event management, conflict detection, approval workflows, calendar, analytics, and more.

---

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** v16 or higher → https://nodejs.org
- **npm** v8 or higher (comes with Node.js)

Verify your versions:
```bash
node --version
npm --version
```

---

## 🚀 Quick Start (3 steps)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Start the development server
```bash
npm start
```

### Step 3 — Open in your browser
The app will automatically open at:
```
http://localhost:3000
```

---

## 🔐 Demo Login Accounts

Use these pre-loaded accounts to explore the system across all roles:

| Role         | Email                      | Password   | Access Level                          |
|--------------|----------------------------|------------|---------------------------------------|
| Super Admin  | admin@esms.edu             | admin123   | Full system access + user management  |
| Admin        | e.nwachukwu@esms.edu       | pass123    | Approve/reject events, full dashboard |
| Organizer    | c.eze@esms.edu             | pass123    | Create & manage own events            |
| User         | n.amadi@esms.edu           | pass123    | View approved events only             |

---

## 📁 Project Structure

```
esms/
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── index.js            # React DOM render entry point
│   └── App.jsx             # Complete application (all components)
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

---

## ✅ Implemented Modules

### 1. Authentication & User Management
- Login / Registration with role-based access control
- Four roles: Super Admin, Admin, Organizer, User
- Super Admin can reassign roles from the Users page

### 2. Event Management
- Create, edit, delete events
- Full attributes: title, description, category, date, time, venue, organizer, status, tags
- Attendance tracking with progress bars

### 3. Conflict Detection Engine
- Real-time automatic validation on form changes
- Detects venue + time overlap simultaneously
- Blocks submission when conflicts exist
- Shows detailed conflict warning with the clashing event name and time

### 4. Approval Workflow
- Organizers submit → Admins review → Approve or Reject with notes
- Status tracking: Pending → Approved / Rejected → Completed
- Dedicated Approvals page for admins with pending badge count

### 5. Notification System
- In-app notification panel with unread indicator
- Per-user routing: organizers get approval/rejection alerts, admins get submission alerts
- Mark all read, click-to-read individual notifications

### 6. Calendar & Visualization
- Interactive monthly calendar with day-by-day event chips
- Navigate months forward/backward
- Color-coded events by status (approved = green, pending = amber)
- Month summary list below calendar

### 7. Analytics Dashboard
- KPI cards: approval rate, total attendees, venues, users
- Donut chart: event status breakdown
- Bar chart: events by category and monthly approved events
- Venue utilization progress bars
- Organizer leaderboard

### 8. Search & Filtering
- Global search bar in top bar (searches title, description, category)
- Advanced filter panel: status, category, venue, date range
- Active filter count badge

---

## 🏗️ Production Build

To create an optimized production build:

```bash
npm run build
```

Output goes to the `build/` folder. You can serve it with any static file server:

```bash
# Using npx serve (no install needed)
npx serve -s build

# Using Python
cd build && python3 -m http.server 3000
```

---

## 🔧 Extending the System

### Adding a real backend (Node.js + Express + PostgreSQL)

The app currently uses in-memory state. To connect a real backend:

1. Replace the `initialUsers`, `initialEvents`, `initialVenues`, `initialNotifications` arrays
   with API calls using `fetch` or `axios`.
2. Use `useEffect` on component mount to load data:
   ```js
   useEffect(() => {
     fetch('/api/events').then(r => r.json()).then(setEvents);
   }, []);
   ```
3. Replace state mutations (setEvents, etc.) with API calls:
   ```js
   const handleSaveEvent = async (data) => {
     const res = await fetch('/api/events', { method: 'POST', body: JSON.stringify(data) });
     const newEvent = await res.json();
     setEvents(prev => [...prev, newEvent]);
   };
   ```

### Recommended Backend Stack (from Requirements Analysis)
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL with the schema below
- **Auth**: JWT tokens (replace password-in-state with bcrypt + JWT)
- **Email**: Nodemailer with SMTP
- **SMS**: Twilio API

### Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hash
  role        VARCHAR(20) DEFAULT 'User',
  department  VARCHAR(100),
  avatar      VARCHAR(10),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Venues
CREATE TABLE venues (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  capacity    INTEGER NOT NULL,
  building    VARCHAR(100),
  facilities  TEXT[]
);

-- Events
CREATE TABLE events (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  category      VARCHAR(50),
  date          DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  venue_id      INTEGER REFERENCES venues(id),
  organizer_id  INTEGER REFERENCES users(id),
  status        VARCHAR(20) DEFAULT 'pending',
  approved_by   INTEGER REFERENCES users(id),
  approval_note TEXT,
  attendees     INTEGER DEFAULT 0,
  tags          TEXT[],
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  type        VARCHAR(30),
  title       VARCHAR(150),
  message     TEXT,
  event_id    INTEGER REFERENCES events(id),
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Audit Log (optional)
CREATE TABLE audit_log (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  action      VARCHAR(50),
  entity      VARCHAR(50),
  entity_id   INTEGER,
  details     TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_date     ON events(date);
CREATE INDEX idx_events_venue    ON events(venue_id);
CREATE INDEX idx_events_status   ON events(status);
CREATE INDEX idx_notifs_user     ON notifications(user_id);
```

---

## 📜 Available Scripts

| Command         | Description                              |
|-----------------|------------------------------------------|
| `npm start`     | Start development server (localhost:3000)|
| `npm run build` | Create optimised production build        |
| `npm test`      | Run test suite                           |

---

## ⚠️ Troubleshooting

**Port 3000 already in use?**
```bash
# Run on a different port
PORT=3001 npm start
```

**Module not found errors?**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Blank white screen?**
- Open browser DevTools → Console tab
- Check for JavaScript errors and share them

---

## 📄 License

For academic and institutional use. Built as a dissertation implementation project.
