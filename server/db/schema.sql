-- ─── USERS TABLE ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'user',
  avatar       TEXT,
  department   TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── VENUES TABLE ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  location     TEXT,
  capacity     INTEGER,
  facilities   TEXT[],
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── EVENTS TABLE ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id             SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT,
  date           DATE NOT NULL,
  start_time     TEXT,
  end_time       TEXT,
  venue_id       INTEGER REFERENCES venues(id) ON DELETE SET NULL,
  organizer_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  approved_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approval_note  TEXT DEFAULT '',
  attendees      INTEGER DEFAULT 0,
  tags           TEXT[],
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── APPROVALS TABLE ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approvals (
  id           SERIAL PRIMARY KEY,
  event_id     INTEGER REFERENCES events(id) ON DELETE CASCADE,
  approved_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  note         TEXT DEFAULT '',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── NOTIFICATIONS TABLE ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT,
  title        TEXT,
  message      TEXT,
  event_id     INTEGER REFERENCES events(id) ON DELETE CASCADE,
  read         BOOLEAN DEFAULT false,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_event_id ON approvals(event_id);
