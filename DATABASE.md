# DATABASE.md — Supabase PostgreSQL Schema

## Overview

Database: Supabase PostgreSQL
Tables: 6 core tables
Auth: Supabase Auth (users managed by Supabase, profiles in our table)
RLS: Enabled on all tables

---

## ER Diagram

```
auth.users (Supabase managed)
    │
    └──1:1── profiles
                │
                ├──1:N── requests ──1:N── request_timeline
                │            │
                │            └──1:1── matches ──N:1── profiles (volunteer)
                │
                └──1:N── resources
```

---

## Table Definitions

---

### Table: `profiles`

Extends Supabase Auth users with app-specific data.

| Column | Type | Required | Constraints |
|---|---|---|---|
| id | uuid | ✅ | PK, FK → auth.users(id) ON DELETE CASCADE |
| name | text | ✅ | NOT NULL |
| role | text | ✅ | CHECK IN ('requester','volunteer','ngo_admin') |
| location_text | text | ❌ | |
| lat | decimal(10,6) | ❌ | |
| lng | decimal(10,6) | ❌ | |
| bio | text | ❌ | |
| org_name | text | ❌ | For ngo_admin only |
| created_at | timestamptz | ✅ | DEFAULT now() |
| updated_at | timestamptz | ✅ | DEFAULT now() |

**Indexes:** `idx_profiles_role ON profiles(role)`

---

### Table: `requests`

Core table — all help requests.

| Column | Type | Required | Constraints |
|---|---|---|---|
| id | uuid | ✅ | PK DEFAULT gen_random_uuid() |
| requester_id | uuid | ✅ | FK → profiles(id) |
| title | text | ✅ | NOT NULL, max 200 chars |
| description | text | ❌ | |
| category | text | ✅ | CHECK IN ('food','medicine','shelter','clothes','tutoring','transport','other') |
| urgency | text | ✅ | CHECK IN ('LOW','MEDIUM','HIGH','CRITICAL') |
| status | text | ✅ | DEFAULT 'open', CHECK IN ('open','accepted','in_progress','completed','cancelled') |
| quantity | integer | ❌ | |
| unit | text | ❌ | |
| location_text | text | ❌ | |
| lat | decimal(10,6) | ❌ | |
| lng | decimal(10,6) | ❌ | |
| ai_category_confidence | decimal(4,2) | ❌ | From Gemini (P1) |
| created_at | timestamptz | ✅ | DEFAULT now() |
| updated_at | timestamptz | ✅ | DEFAULT now() |

**Indexes:**
```sql
idx_requests_status ON requests(status);
idx_requests_urgency ON requests(urgency);
idx_requests_category ON requests(category);
idx_requests_requester ON requests(requester_id);
idx_requests_location ON requests(lat, lng);
```

**Trigger:** Auto-update `updated_at` on row change.

---

### Table: `matches`

Tracks volunteer-request assignment.

| Column | Type | Required | Constraints |
|---|---|---|---|
| id | uuid | ✅ | PK DEFAULT gen_random_uuid() |
| request_id | uuid | ✅ | FK → requests(id), UNIQUE (one volunteer per request) |
| volunteer_id | uuid | ✅ | FK → profiles(id) |
| assigned_by | uuid | ❌ | FK → profiles(id) — for NGO-assigned matches |
| note | text | ❌ | Completion note |
| created_at | timestamptz | ✅ | DEFAULT now() |

**Constraint:** `UNIQUE(request_id)` — one active match per request.

**Indexes:** `idx_matches_volunteer ON matches(volunteer_id)`

---

### Table: `request_timeline`

Audit log of status transitions.

| Column | Type | Required | Constraints |
|---|---|---|---|
| id | uuid | ✅ | PK DEFAULT gen_random_uuid() |
| request_id | uuid | ✅ | FK → requests(id) |
| status | text | ✅ | The status at this point in time |
| changed_by | uuid | ✅ | FK → profiles(id) |
| note | text | ❌ | |
| created_at | timestamptz | ✅ | DEFAULT now() |

**Index:** `idx_timeline_request ON request_timeline(request_id, created_at)`

---

### Table: `resources`

Available resources offered by volunteers/NGOs/providers.

| Column | Type | Required | Constraints |
|---|---|---|---|
| id | uuid | ✅ | PK DEFAULT gen_random_uuid() |
| provider_id | uuid | ✅ | FK → profiles(id) |
| title | text | ✅ | NOT NULL |
| description | text | ❌ | |
| category | text | ✅ | Same CHECK as requests.category |
| quantity | integer | ❌ | |
| unit | text | ❌ | |
| is_available | boolean | ✅ | DEFAULT true |
| location_text | text | ❌ | |
| lat | decimal(10,6) | ❌ | |
| lng | decimal(10,6) | ❌ | |
| available_until | date | ❌ | |
| created_at | timestamptz | ✅ | DEFAULT now() |

---

### Table: `impact_feed`

Anonymized public feed of completed helps.

| Column | Type | Required | Constraints |
|---|---|---|---|
| id | uuid | ✅ | PK DEFAULT gen_random_uuid() |
| request_id | uuid | ✅ | FK → requests(id) |
| category | text | ✅ | |
| location_text | text | ✅ | City-level only (no precise address) |
| completed_at | timestamptz | ✅ | DEFAULT now() |
| display_text | text | ✅ | e.g. "Food packets delivered · Nagpur" |

---

## Complete SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('requester', 'volunteer', 'ngo_admin')),
  location_text text,
  lat decimal(10,6),
  lng decimal(10,6),
  bio text,
  org_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- Requests table
CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('food','medicine','shelter','clothes','tutoring','transport','other')),
  urgency text NOT NULL CHECK (urgency IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','in_progress','completed','cancelled')),
  quantity integer,
  unit text,
  location_text text,
  lat decimal(10,6),
  lng decimal(10,6),
  ai_category_confidence decimal(4,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_urgency ON requests(urgency);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_requester ON requests(requester_id);
CREATE INDEX idx_requests_location ON requests(lat, lng);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE REFERENCES requests(id),
  volunteer_id uuid NOT NULL REFERENCES profiles(id),
  assigned_by uuid REFERENCES profiles(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_volunteer ON matches(volunteer_id);

-- Request timeline
CREATE TABLE request_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id),
  status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES profiles(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_request ON request_timeline(request_id, created_at);

-- Resources
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('food','medicine','shelter','clothes','tutoring','transport','other')),
  quantity integer,
  unit text,
  is_available boolean NOT NULL DEFAULT true,
  location_text text,
  lat decimal(10,6),
  lng decimal(10,6),
  available_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Impact feed
CREATE TABLE impact_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES requests(id),
  category text NOT NULL,
  location_text text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  display_text text NOT NULL
);
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_feed ENABLE ROW LEVEL SECURITY;

-- PROFILES
-- Users can read any profile (needed for name display)
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- REQUESTS
-- Any authenticated user can read open requests
CREATE POLICY "requests_select_open" ON requests FOR SELECT
  USING (status = 'open' OR requester_id = auth.uid());
-- Only requester can insert
CREATE POLICY "requests_insert_own" ON requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());
-- Requester can update own, volunteer can update assigned
CREATE POLICY "requests_update" ON requests FOR UPDATE
  USING (
    requester_id = auth.uid() OR
    EXISTS (SELECT 1 FROM matches WHERE request_id = requests.id AND volunteer_id = auth.uid())
  );

-- MATCHES
-- Volunteers can see their own matches; NGO can see all
CREATE POLICY "matches_select" ON matches FOR SELECT
  USING (volunteer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ngo_admin'));
-- Authenticated volunteers/NGOs can insert
CREATE POLICY "matches_insert" ON matches FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('volunteer','ngo_admin'))
  );

-- IMPACT FEED — public read
CREATE POLICY "impact_feed_public" ON impact_feed FOR SELECT USING (true);

-- REQUEST TIMELINE — authenticated read
CREATE POLICY "timeline_select" ON request_timeline FOR SELECT USING (auth.uid() IS NOT NULL);

-- RESOURCES — authenticated read, own insert/update
CREATE POLICY "resources_select" ON resources FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "resources_insert_own" ON resources FOR INSERT WITH CHECK (provider_id = auth.uid());
```

---

## Seed / Demo Data

```sql
-- NOTE: Auth users must be created via Supabase Auth first.
-- Replace UUIDs with actual Supabase Auth UIDs after creation.

-- Sample profiles (insert after auth.users exist)
INSERT INTO profiles (id, name, role, location_text, lat, lng, org_name) VALUES
('usr-001', 'Ritu Sharma', 'requester', 'Dharampeth, Nagpur', 21.1458, 79.0882, null),
('usr-002', 'Aryan Kulkarni', 'volunteer', 'Sitabuldi, Nagpur', 21.1505, 79.0806, null),
('usr-003', 'Priya Nair', 'volunteer', 'Sadar, Nagpur', 21.1585, 79.0747, null),
('usr-004', 'Anita Deshmukh', 'ngo_admin', 'Civil Lines, Nagpur', 21.1456, 79.0847, 'Asha Foundation'),
('usr-005', 'Mohan Tiwari', 'requester', 'Itwari, Nagpur', 21.1380, 79.0952, null),
('usr-006', 'Sunita Bhole', 'requester', 'Kamptee, Nagpur', 21.2197, 79.1970, null),
('usr-007', 'Rahul Meshram', 'volunteer', 'Gandhibagh, Nagpur', 21.1461, 79.1010, null);

-- Sample requests
INSERT INTO requests (id, requester_id, title, description, category, urgency, status, quantity, unit, location_text, lat, lng) VALUES
('req-001', 'usr-001', 'Need food packets for 3 days', 'Family of 4, lost income after factory shutdown', 'food', 'HIGH', 'open', 5, 'packets', 'Dharampeth, Nagpur', 21.1458, 79.0882),
('req-002', 'usr-005', 'Insulin needed urgently', 'Father is diabetic, pharmacy out of stock nearby', 'medicine', 'CRITICAL', 'accepted', 2, 'vials', 'Itwari, Nagpur', 21.1380, 79.0952),
('req-003', 'usr-006', 'Winter clothes for children', 'Three children ages 4-10 need warm clothes', 'clothes', 'MEDIUM', 'in_progress', 6, 'sets', 'Kamptee, Nagpur', 21.2197, 79.1970),
('req-004', 'usr-001', 'Math tutoring for daughter', 'Class 8 student needs exam help', 'tutoring', 'LOW', 'completed', 1, 'session', 'Dharampeth, Nagpur', 21.1458, 79.0882),
('req-005', 'usr-005', 'Transport to hospital', 'Monthly checkup, no auto available', 'transport', 'HIGH', 'open', 1, 'trip', 'Itwari, Nagpur', 21.1380, 79.0952);

-- Matches
INSERT INTO matches (request_id, volunteer_id, note) VALUES
('req-002', 'usr-002', 'Will deliver insulin by 3 PM'),
('req-003', 'usr-003', 'Collecting clothes from donation drive'),
('req-004', 'usr-007', 'Session completed online');

-- Timeline entries
INSERT INTO request_timeline (request_id, status, changed_by) VALUES
('req-001', 'open', 'usr-001'),
('req-002', 'open', 'usr-005'),
('req-002', 'accepted', 'usr-002'),
('req-003', 'open', 'usr-006'),
('req-003', 'accepted', 'usr-003'),
('req-003', 'in_progress', 'usr-003'),
('req-004', 'open', 'usr-001'),
('req-004', 'accepted', 'usr-007'),
('req-004', 'in_progress', 'usr-007'),
('req-004', 'completed', 'usr-007');

-- Resources
INSERT INTO resources (provider_id, title, category, quantity, unit, location_text, lat, lng) VALUES
('usr-004', '25kg Rice from Asha Foundation', 'food', 25, 'kg', 'Civil Lines, Nagpur', 21.1456, 79.0847),
('usr-002', 'Basic medicine kit (OTC)', 'medicine', 10, 'kits', 'Sitabuldi, Nagpur', 21.1505, 79.0806),
('usr-004', 'Winter clothes — mixed sizes', 'clothes', 50, 'pieces', 'Civil Lines, Nagpur', 21.1456, 79.0847);

-- Impact feed
INSERT INTO impact_feed (request_id, category, location_text, display_text) VALUES
('req-004', 'tutoring', 'Nagpur', 'Tutoring session completed · Nagpur');
```
