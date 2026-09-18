# 03 — NexoraLink Database Schema

## Overview

**Database**: Supabase PostgreSQL  
**Extension Required**: `postgis` (for location/distance queries)  
**Auth**: Supabase Auth (`auth.users` table managed by Supabase)

Migration ownership is strictly separated to avoid conflicts.

---

## Migration Files & Ownership

| Migration File | Owner | Contents |
|---------------|-------|----------|
| `001_extensions_profiles.sql` | Person 2 (BE-R) | Enable PostGIS, create profiles table |
| `002_help_requests.sql` | Person 2 (BE-R) | help_requests, request_status_history, feedback |
| `003_volunteers.sql` | Person 3 (BE-M) | volunteers, volunteer_skills |
| `004_ngos_resources.sql` | Person 3 (BE-M) | ngos, resources, resource_requests, resource_allocations |
| `005_matches.sql` | Person 4 (AI) | matches table |

**Rule**: Never edit another person's migration file. If a dependency is needed, declare it in the contract doc and wait for the owning migration to run first.

---

## Migration 001 — Extensions + Profiles
**Owner: Person 2**

```sql
-- Enable PostGIS for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('requester', 'volunteer', 'ngo', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  location GEOMETRY(Point, 4326),  -- PostGIS point (lon, lat)
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for location-based queries
CREATE INDEX profiles_location_idx ON profiles USING GIST(location);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Migration 002 — Help Requests + Feedback
**Owner: Person 2**

```sql
-- Help requests
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Raw input
  description TEXT NOT NULL,
  
  -- AI-extracted fields
  ai_category TEXT CHECK (ai_category IN ('medical','food','transportation','education','shelter','general')),
  ai_task TEXT,
  ai_urgency TEXT DEFAULT 'MEDIUM' CHECK (ai_urgency IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  ai_skills_needed TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  ai_confidence FLOAT DEFAULT 0,
  
  -- Override (if AI fails, user manually sets)
  manual_category TEXT,
  manual_urgency TEXT,
  
  -- Effective values (computed from AI or manual)
  category TEXT GENERATED ALWAYS AS (
    COALESCE(ai_category, manual_category, 'general')
  ) STORED,
  urgency TEXT GENERATED ALWAYS AS (
    COALESCE(ai_urgency, manual_urgency, 'MEDIUM')
  ) STORED,
  
  -- Location
  location GEOMETRY(Point, 4326) NOT NULL,
  address TEXT,
  
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'REQUESTED'
    CHECK (status IN ('REQUESTED','AI_ANALYZED','MATCHING','ASSIGNED','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED')),
  
  assigned_volunteer_id UUID REFERENCES profiles(id),
  assigned_ngo_id UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX help_requests_location_idx ON help_requests USING GIST(location);
CREATE INDEX help_requests_status_idx ON help_requests(status);
CREATE INDEX help_requests_urgency_idx ON help_requests(urgency);
CREATE INDEX help_requests_requester_idx ON help_requests(requester_id);
CREATE INDEX help_requests_category_idx ON help_requests(category);

CREATE TRIGGER help_requests_updated_at
  BEFORE UPDATE ON help_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters can create own requests"
  ON help_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Anyone authenticated can view requests"
  ON help_requests FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Requester can update own requests"
  ON help_requests FOR UPDATE USING (
    auth.uid() = requester_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','volunteer'))
  );

-- Request status history
CREATE TABLE request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX rsh_request_idx ON request_status_history(request_id);

ALTER TABLE request_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view status history"
  ON request_status_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can insert status history"
  ON request_status_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id),
  to_user_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(request_id, from_user_id)
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view feedback"
  ON feedback FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert feedback for their completed requests"
  ON feedback FOR INSERT WITH CHECK (auth.uid() = from_user_id);
```

---

## Migration 003 — Volunteers
**Owner: Person 3**

```sql
-- Volunteer profile (extends profiles)
CREATE TABLE volunteers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  trust_score FLOAT DEFAULT 3.0 CHECK (trust_score BETWEEN 0 AND 5),
  total_completed INTEGER DEFAULT 0,
  location GEOMETRY(Point, 4326),  -- can differ from profile location
  radius_km FLOAT DEFAULT 5.0,     -- how far they're willing to go
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX volunteers_location_idx ON volunteers USING GIST(location);
CREATE INDEX volunteers_available_idx ON volunteers(is_available);

CREATE TRIGGER volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view volunteers"
  ON volunteers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Volunteer can update own record"
  ON volunteers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Volunteer can insert own record"
  ON volunteers FOR INSERT WITH CHECK (auth.uid() = id);

-- Volunteer skills
CREATE TABLE volunteer_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('medical','food','transportation','education','shelter','general')),
  skill_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(volunteer_id, category, skill_name)
);

CREATE INDEX vs_volunteer_idx ON volunteer_skills(volunteer_id);
CREATE INDEX vs_category_idx ON volunteer_skills(category);

ALTER TABLE volunteer_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view skills"
  ON volunteer_skills FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Volunteer can manage own skills"
  ON volunteer_skills FOR ALL USING (auth.uid() = volunteer_id);
```

---

## Migration 004 — NGOs + Resources
**Owner: Person 3**

```sql
-- NGO profile (extends profiles)
CREATE TABLE ngos (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  registration_number TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  services TEXT[] DEFAULT '{}',   -- categories they serve
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER ngos_updated_at
  BEFORE UPDATE ON ngos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view ngos"
  ON ngos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "NGO can update own record"
  ON ngos FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "NGO can insert own record"
  ON ngos FOR INSERT WITH CHECK (auth.uid() = id);

-- Resources managed by NGOs
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medical','food','transportation','education','shelter','general')),
  description TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_total INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'units',      -- packets, kg, beds, etc.
  location GEOMETRY(Point, 4326),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX resources_ngo_idx ON resources(ngo_id);
CREATE INDEX resources_category_idx ON resources(category);
CREATE INDEX resources_location_idx ON resources USING GIST(location);

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view resources"
  ON resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "NGO can manage own resources"
  ON resources FOR ALL USING (
    EXISTS (SELECT 1 FROM ngos WHERE id = ngo_id AND id = auth.uid())
  );

-- Resource requests (requester asks NGO for resource)
CREATE TABLE resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id),
  help_request_id UUID REFERENCES help_requests(id),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  quantity_requested INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','DECLINED','FULFILLED')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view resource requests"
  ON resource_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Requester can create resource requests"
  ON resource_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "NGO can update resource requests"
  ON resource_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM resources r JOIN ngos n ON r.ngo_id = n.id
            WHERE r.id = resource_id AND n.id = auth.uid())
  );
```

---

## Migration 005 — Matches
**Owner: Person 4**

```sql
-- Match results (stored for dashboard analytics)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id),
  candidate_type TEXT NOT NULL CHECK (candidate_type IN ('volunteer','ngo')),
  
  -- Score breakdown
  distance_score FLOAT DEFAULT 0,
  skill_score FLOAT DEFAULT 0,
  availability_score FLOAT DEFAULT 0,
  urgency_score FLOAT DEFAULT 0,
  trust_score FLOAT DEFAULT 0,
  total_score FLOAT NOT NULL,
  
  distance_km FLOAT,
  is_selected BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX matches_request_idx ON matches(request_id);
CREATE INDEX matches_score_idx ON matches(total_score DESC);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view matches"
  ON matches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can insert matches"
  ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## Entity Relationships Summary

```
auth.users (Supabase managed)
    │
    └──► profiles (id FK to auth.users)
              │
              ├──► help_requests (requester_id FK)
              │         │
              │         ├──► request_status_history (request_id FK)
              │         ├──► feedback (request_id FK)
              │         ├──► resource_requests (help_request_id FK)
              │         └──► matches (request_id FK)
              │
              ├──► volunteers (id FK to profiles)
              │         └──► volunteer_skills (volunteer_id FK)
              │
              └──► ngos (id FK to profiles)
                        └──► resources (ngo_id FK)
                                  └──► resource_requests (resource_id FK)
```

---

## Resource Gap Detection Query
**Used by admin dashboard — runs in API route owned by Person 3**

```sql
-- Count active requests vs available supply per category
SELECT
  r.category,
  COUNT(DISTINCT hr.id) AS active_requests,
  COALESCE(SUM(r2.quantity_available), 0) AS available_resources,
  COUNT(DISTINCT v.id) AS available_volunteers
FROM (
  SELECT UNNEST(ARRAY['medical','food','transportation','education','shelter','general']) AS category
) r
LEFT JOIN help_requests hr ON hr.category = r.category
  AND hr.status NOT IN ('COMPLETED','CANCELLED')
LEFT JOIN resources r2 ON r2.category = r.category AND r2.is_active = true
LEFT JOIN volunteers v ON v.is_available = true
LEFT JOIN volunteer_skills vs ON vs.volunteer_id = v.id AND vs.category = r.category
GROUP BY r.category
ORDER BY (COUNT(DISTINCT hr.id) - COALESCE(SUM(r2.quantity_available), 0)) DESC;
```

---

## Key Constraints & Notes

- All location columns use `GEOMETRY(Point, 4326)` — WGS84 (standard lat/lon)
- Distance queries use `ST_DWithin` with PostGIS
- `help_requests.category` and `urgency` are GENERATED ALWAYS columns — prefer AI values, fall back to manual
- RLS is enabled on every table — never bypass with service role key in frontend
- `volunteers.location` may differ from `profiles.location` (they could be helping from a different area)
- `trust_score` is updated after each completed + rated request via feedback upsert logic
