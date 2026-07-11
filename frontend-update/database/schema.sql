-- Route to Hungary — database schema
-- Written for SQLite to start; portable to Postgres/MySQL with minor tweaks
-- (AUTOINCREMENT -> SERIAL, TEXT -> VARCHAR, etc.)

-- Scholarships you cover (starts with one row: Stipendium Hungaricum)
CREATE TABLE IF NOT EXISTS scholarships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active INTEGER DEFAULT 1
);

-- USAT/HAT (and future test) prep sections
CREATE TABLE IF NOT EXISTS test_prep_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_name TEXT NOT NULL,          -- e.g. 'USAT', 'HAT'
  tag TEXT,                         -- e.g. 'Section'
  title TEXT NOT NULL,              -- e.g. 'Verbal reasoning'
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Bullet points / resources under each prep section
CREATE TABLE IF NOT EXISTS test_prep_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES test_prep_sections(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Application procedure timeline steps
CREATE TABLE IF NOT EXISTS procedure_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scholarship_id INTEGER NOT NULL REFERENCES scholarships(id),
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT
);

-- Guides: motivation letter, CV, etc.
CREATE TABLE IF NOT EXISTS guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'motivation_letter', 'cv', etc.
  body TEXT,                        -- markdown content
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Consultation service offerings + pricing
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price_pkr INTEGER,
  description TEXT
);

-- Consultation requests submitted via the contact form
-- (the backend currently writes these to data/messages.json —
--  migrate the POST /api/contact handler to insert here once this exists)
CREATE TABLE IF NOT EXISTS consultation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',        -- 'new', 'contacted', 'closed'
  received_at TEXT DEFAULT CURRENT_TIMESTAMP
);
