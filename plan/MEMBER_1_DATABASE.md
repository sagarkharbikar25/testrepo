# Member 1: Database Administrator (DBA)
**Branch:** `feature/database`
**Owned files:** `supabase/migrations/*.sql` only. Nobody else touches this folder.
**Stack lock:** Supabase PostgreSQL + PostGIS. No Google Maps, no Render — everything runs through Next.js API routes on Vercel.

> This version fixes three gaps found in the original draft: missing indexes/triggers on `help_requests`, placeholder (non-real) RLS policies, and two RPC functions (`get_nearby_requests`, `get_resource_gaps`) that Member 3's routes call but that nobody had written into a migration. Both are now in this doc — **you must run migrations 003 and 004 with the RPCs included, or Member 3's volunteer-matching and admin-dashboard routes will fail with a "function does not exist" error.**

---

## What you deliver by end of Hour 1

1. Supabase project created, PostGIS extension enabled
2. All 5 migrations below run successfully against it
3. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` shared with the team
4. A short seed script (bottom of this doc) run so the other three members have test data to build against from Hour 1 onward — don't make them wait until Hour 5 to see real rows

---

## Migration 001 — Extensions + Profiles

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('requester', 'volunteer', 'ngo', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  location GEOMETRY(Point, 4326),
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX profiles_location_idx ON profiles USING GIST(location);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Migration 002 — Help Requests, Status History, Feedback

```sql
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  description TEXT NOT NULL,
  ai_category TEXT CHECK (ai_category IN ('medical','food','transportation','education','shelter','general')),
  ai_task TEXT,
  ai_urgency TEXT DEFAULT 'MEDIUM' CHECK (ai_urgency IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  ai_skills_needed TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  ai_confidence FLOAT DEFAULT 0,
  manual_category TEXT,
  manual_urgency TEXT,
  category TEXT GENERATED ALWAYS AS (COALESCE(ai_category, manual_category, 'general')) STORED,
  urgency TEXT GENERATED ALWAYS AS (COALESCE(ai_urgency, manual_urgency, 'MEDIUM')) STORED,
  location GEOMETRY(Point, 4326) NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'REQUESTED'
    CHECK (status IN ('REQUESTED','AI_ANALYZED','MATCHING','ASSIGNED','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED')),
  assigned_volunteer_id UUID REFERENCES profiles(id),
  assigned_ngo_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX help_requests_location_idx ON help_requests USING GIST(location);
CREATE INDEX help_requests_status_idx ON help_requests(status);
CREATE INDEX help_requests_urgency_idx ON help_requests(urgency);
CREATE INDEX help_requests_category_idx ON help_requests(category);
CREATE INDEX help_requests_requester_idx ON help_requests(requester_id);

CREATE TRIGGER help_requests_updated_at BEFORE UPDATE ON help_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requesters can create own requests"
  ON help_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Anyone authenticated can view requests"
  ON help_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Requester or volunteer/admin can update requests"
  ON help_requests FOR UPDATE USING (
    auth.uid() = requester_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','volunteer'))
  );

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
CREATE POLICY "Users can view feedback" ON feedback FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert feedback for their completed requests"
  ON feedback FOR INSERT WITH CHECK (auth.uid() = from_user_id);
```

---

## Migration 003 — Volunteers + `get_nearby_requests` RPC

```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  trust_score FLOAT DEFAULT 3.0 CHECK (trust_score BETWEEN 0 AND 5),
  total_completed INTEGER DEFAULT 0,
  location GEOMETRY(Point, 4326),
  radius_km FLOAT DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX volunteers_location_idx ON volunteers USING GIST(location);
CREATE INDEX volunteers_available_idx ON volunteers(is_available);

CREATE TRIGGER volunteers_updated_at BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view volunteers"
  ON volunteers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Volunteer can update own record" ON volunteers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Volunteer can insert own record" ON volunteers FOR INSERT WITH CHECK (auth.uid() = id);

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

-- RPC: used by Member 3's GET /api/volunteers/requests
CREATE OR REPLACE FUNCTION get_nearby_requests(
  volunteer_location GEOMETRY,
  radius_meters FLOAT
)
RETURNS SETOF help_requests
LANGUAGE SQL STABLE AS $$
  SELECT *
  FROM help_requests
  WHERE status NOT IN ('COMPLETED', 'CANCELLED', 'ACCEPTED', 'IN_PROGRESS')
    AND ST_DWithin(
      location::geography,
      volunteer_location::geography,
      radius_meters
    )
  ORDER BY
    CASE urgency WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
    created_at DESC
  LIMIT 20;
$$;
```

---

## Migration 004 — NGOs, Resources + `get_resource_gaps` RPC

```sql
CREATE TABLE ngos (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  registration_number TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  services TEXT[] DEFAULT '{}',
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER ngos_updated_at BEFORE UPDATE ON ngos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view ngos" ON ngos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "NGO can update own record" ON ngos FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "NGO can insert own record" ON ngos FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medical','food','transportation','education','shelter','general')),
  description TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_total INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'units',
  location GEOMETRY(Point, 4326),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX resources_ngo_idx ON resources(ngo_id);
CREATE INDEX resources_category_idx ON resources(category);
CREATE INDEX resources_location_idx ON resources USING GIST(location);

CREATE TRIGGER resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view resources"
  ON resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "NGO can manage own resources"
  ON resources FOR ALL USING (EXISTS (SELECT 1 FROM ngos WHERE id = ngo_id AND id = auth.uid()));

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

-- RPC: used by Member 3's GET /api/admin/dashboard
CREATE OR REPLACE FUNCTION get_resource_gaps()
RETURNS TABLE(
  category TEXT,
  active_requests BIGINT,
  available_resources BIGINT,
  available_volunteers BIGINT,
  gap_severity TEXT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    cats.cat AS category,
    COUNT(DISTINCT hr.id) AS active_requests,
    COALESCE(SUM(r.quantity_available), 0) AS available_resources,
    COUNT(DISTINCT vol.id) AS available_volunteers,
    CASE
      WHEN COUNT(DISTINCT hr.id) > COALESCE(SUM(r.quantity_available), 0) + COUNT(DISTINCT vol.id) * 3
        THEN 'HIGH'
      WHEN COUNT(DISTINCT hr.id) > COALESCE(SUM(r.quantity_available), 0) + COUNT(DISTINCT vol.id)
        THEN 'MEDIUM'
      ELSE 'LOW'
    END AS gap_severity
  FROM (
    VALUES ('medical'),('food'),('transportation'),('education'),('shelter'),('general')
  ) cats(cat)
  LEFT JOIN help_requests hr ON hr.category = cats.cat AND hr.status NOT IN ('COMPLETED','CANCELLED')
  LEFT JOIN resources r ON r.category = cats.cat AND r.is_active = true AND r.quantity_available > 0
  LEFT JOIN volunteer_skills vs ON vs.category = cats.cat
  LEFT JOIN volunteers vol ON vol.id = vs.volunteer_id AND vol.is_available = true
  GROUP BY cats.cat
  ORDER BY active_requests DESC;
$$;
```

---

## Migration 005 — Matches

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id),
  candidate_type TEXT NOT NULL CHECK (candidate_type IN ('volunteer','ngo')),
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
CREATE POLICY "Anyone authenticated can view matches" ON matches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can insert matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## Seed Script (run once, after all 5 migrations)

Run via Supabase SQL editor or `psql`. Requires 4 auth users already created (register them via `/api/auth/register` first, then grab their UUIDs).

```sql
-- Replace the UUIDs below with real auth.users ids after registering test accounts
-- citizen@nexora.test / rahul@nexora.test / helpfoundation@nexora.test / admin@nexora.test

UPDATE profiles SET role = 'admin' WHERE email = 'admin@nexora.test';

INSERT INTO volunteers (id, bio, is_available, trust_score, location, radius_km)
SELECT id, 'Demo volunteer', true, 4.8, ST_SetSRID(ST_MakePoint(78.9629, 20.5937), 4326), 10
FROM profiles WHERE email = 'rahul@nexora.test';

INSERT INTO volunteer_skills (volunteer_id, category, skill_name)
SELECT id, 'medical', 'medicine_pickup' FROM profiles WHERE email = 'rahul@nexora.test';

INSERT INTO ngos (id, organization_name, services, is_verified)
SELECT id, 'Help Foundation', ARRAY['medical','food'], true
FROM profiles WHERE email = 'helpfoundation@nexora.test';

INSERT INTO resources (ngo_id, name, category, quantity_available, quantity_total, location)
SELECT id, 'Medicine Packets', 'medical', 50, 50, ST_SetSRID(ST_MakePoint(78.9629, 20.5937), 4326)
FROM profiles WHERE email = 'helpfoundation@nexora.test';
```

---

## Handoff

- **To Member 2 & 3:** all tables + both RPC functions live before Hour 1 ends. Ping the group the moment migrations are applied — their routes are blocked until then.
- **To Member 4:** share `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` immediately, frontend needs them for the Supabase client even before real data exists.

## Rules
- Never bypass RLS with a service-role key in frontend code.
- Only you edit `supabase/migrations/*.sql`. If someone needs a schema change, they ask you — they don't edit the file.
