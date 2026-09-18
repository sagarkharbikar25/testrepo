# Member 1: Database Administrator (DBA)
**Branch:** `feature/database`
**Owned files:** `supabase/migrations/*.sql` only. Nobody else touches this folder.
**Stack lock:** Supabase PostgreSQL + PostGIS. Everything connects to Next.js App Router API routes on Vercel.

> **Updated Frontend Alignment:** The frontend is now 100% built with 3 distinct modules (`requester`, `volunteer`, `ngo/admin`), dedicated `/notifications` pages for every role, requester household vulnerability flags (elderly, wheelchair, infant, cold-chain medication), GPS location picking, volunteer tactical live route telemetry, vehicle access types, response radius slider, and admin backup rerouting.
> All 5 migrations below have been updated to match the actual frontend payload shapes, so backend members 2 and 3 can integrate seamlessly without schema mismatch.

---

## What you deliver by end of Hour 1

1. Supabase project created, PostGIS extension enabled
2. All 5 migrations below executed in order
3. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` shared in `.env.local`
4. Run the seed script (bottom of this doc) so all 3 roles have rich mock data matching the frontend immediately.

---

## Migration 001 — Extensions + Profiles & Household Vulnerability

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('requester', 'volunteer', 'ngo', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  location GEOMETRY(Point, 4326),
  latitude FLOAT,
  longitude FLOAT,
  address TEXT,
  
  -- Requester profile fields (matched to /requester/profile)
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  special_needs TEXT[] DEFAULT '{}', -- e.g. ['Elderly Household Member (65+)', 'Wheelchair / Mobility Assistance', 'Diabetic / Cold-Chain Medicine Required', 'Infant / Small Children (0-5 yrs)']
  household_notes TEXT,
  
  -- Volunteer profile fields (matched to /volunteer/profile)
  vehicle_access TEXT,              -- e.g. 'SUV / 4x4', 'Rapid Bike', 'Utility Van', 'None (Foot Response)'
  dispatch_radius_km FLOAT DEFAULT 5.0,
  
  -- Verification & Auditing
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX profiles_location_idx ON profiles USING GIST(location);
CREATE INDEX profiles_role_idx ON profiles(role);

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

## Migration 002 — Help Requests, Items Needed, Status History & Feedback

```sql
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  requester_name TEXT,
  requester_phone TEXT,
  description TEXT NOT NULL,
  
  -- AI classification + Frontend items
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
  
  -- Items and Household Flags (matched to /requester/request/new)
  items_needed TEXT[] DEFAULT '{}',
  household_flags TEXT[] DEFAULT '{}',
  
  -- Location (Supports both PostGIS and direct lat/lng for zero-overhead JSON serialization)
  location GEOMETRY(Point, 4326) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  address TEXT NOT NULL,
  
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
CREATE POLICY "Requester, volunteer, or admin can update requests"
  ON help_requests FOR UPDATE USING (
    auth.uid() = requester_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','volunteer','ngo'))
  );

-- Request audit & lifecycle tracking
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

-- Feedback & Delivery Verification
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

## Migration 003 — Volunteers, Live Telemetry & GPS Stuck Detection

```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  trust_score FLOAT DEFAULT 3.0 CHECK (trust_score BETWEEN 0 AND 5),
  total_completed INTEGER DEFAULT 0,
  
  -- Live Telemetry for Google-Maps style Tactical Route Navigation & Stuck Detection
  location GEOMETRY(Point, 4326),
  current_latitude FLOAT,
  current_longitude FLOAT,
  heading FLOAT DEFAULT 0,
  speed_kmh FLOAT DEFAULT 0,
  radius_km FLOAT DEFAULT 5.0,
  vehicle_type TEXT DEFAULT 'SUV / 4x4',
  
  -- Stuck & Hazard Detection (Supports Admin Live Rerouting)
  is_stuck BOOLEAN DEFAULT false,
  stuck_reason TEXT,              -- e.g. 'Waterlogging on Amravati By-pass', 'Tree Fall / Debris'
  stuck_at TIMESTAMPTZ,
  active_request_id UUID REFERENCES help_requests(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX volunteers_location_idx ON volunteers USING GIST(location);
CREATE INDEX volunteers_available_idx ON volunteers(is_available);
CREATE INDEX volunteers_stuck_idx ON volunteers(is_stuck);

CREATE TRIGGER volunteers_updated_at BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view volunteers"
  ON volunteers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Volunteer can update own record" ON volunteers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Volunteer can insert own record" ON volunteers FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills Tags
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

-- RPC: Used by Member 3's GET /api/volunteers/requests (Calculates distance and orders by urgency)
CREATE OR REPLACE FUNCTION get_nearby_requests(
  volunteer_lat FLOAT,
  volunteer_lng FLOAT,
  radius_meters FLOAT
)
RETURNS TABLE (
  id UUID,
  requester_id UUID,
  requester_name TEXT,
  requester_phone TEXT,
  description TEXT,
  category TEXT,
  urgency TEXT,
  items_needed TEXT[],
  household_flags TEXT[],
  latitude FLOAT,
  longitude FLOAT,
  address TEXT,
  status TEXT,
  distance_meters FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE AS $$
  SELECT 
    hr.id,
    hr.requester_id,
    hr.requester_name,
    hr.requester_phone,
    hr.description,
    hr.category,
    hr.urgency,
    hr.items_needed,
    hr.household_flags,
    hr.latitude,
    hr.longitude,
    hr.address,
    hr.status,
    ST_Distance(
      hr.location::geography,
      ST_SetSRID(ST_MakePoint(volunteer_lng, volunteer_lat), 4326)::geography
    ) as distance_meters,
    hr.created_at
  FROM help_requests hr
  WHERE hr.status NOT IN ('COMPLETED', 'CANCELLED', 'ACCEPTED', 'IN_PROGRESS')
    AND ST_DWithin(
      hr.location::geography,
      ST_SetSRID(ST_MakePoint(volunteer_lng, volunteer_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY
    CASE hr.urgency WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
    distance_meters ASC;
$$;
```

---

## Migration 004 — NGOs, Resource Inventory & Requisition Mesh

```sql
CREATE TABLE ngos (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  registration_number TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  services TEXT[] DEFAULT '{}',
  website TEXT,
  warehouse_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER ngos_updated_at BEFORE UPDATE ON ngos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view ngos" ON ngos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "NGO can update own record" ON ngos FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "NGO can insert own record" ON ngos FOR INSERT WITH CHECK (auth.uid() = id);

-- Resource Inventory Mesh (matched to /ngo/resources)
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
  latitude FLOAT,
  longitude FLOAT,
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
CREATE POLICY "Anyone authenticated can view resources" ON resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "NGO can manage own resources" ON resources FOR ALL USING (
  EXISTS (SELECT 1 FROM ngos WHERE id = resources.ngo_id AND id = auth.uid())
);

-- Resource Gap Analysis RPC: Used by Admin Dashboard
CREATE OR REPLACE FUNCTION get_resource_gaps()
RETURNS TABLE (
  category TEXT,
  total_requests BIGINT,
  critical_requests BIGINT,
  total_units_available BIGINT,
  gap_status TEXT
)
LANGUAGE SQL STABLE AS $$
  WITH req_stats AS (
    SELECT 
      category,
      COUNT(*) AS total_req,
      COUNT(*) FILTER (WHERE urgency = 'CRITICAL') AS crit_req
    FROM help_requests
    WHERE status NOT IN ('COMPLETED', 'CANCELLED')
    GROUP BY category
  ),
  res_stats AS (
    SELECT 
      category,
      COALESCE(SUM(quantity_available), 0) AS total_avail
    FROM resources
    WHERE is_active = true
    GROUP BY category
  )
  SELECT 
    COALESCE(r.category, s.category) AS category,
    COALESCE(r.total_req, 0) AS total_requests,
    COALESCE(r.crit_req, 0) AS critical_requests,
    COALESCE(s.total_avail, 0) AS total_units_available,
    CASE 
      WHEN COALESCE(s.total_avail, 0) < COALESCE(r.crit_req, 0) THEN 'CRITICAL_SHORTAGE'
      WHEN COALESCE(s.total_avail, 0) < COALESCE(r.total_req, 0) THEN 'MODERATE_SHORTAGE'
      ELSE 'SURPLUS'
    END AS gap_status
  FROM req_stats r
  FULL OUTER JOIN res_stats s ON r.category = s.category;
$$;
```

---

## Migration 005 — Unified Realtime Notifications Table

> **NEW & CRITICAL**: The frontend now has dedicated, active notification feeds for:
> - Requester (`/requester/notifications`)
> - Volunteer (`/volunteer/notifications`)
> - NGO / Admin (`/ngo/notifications`)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('requester', 'volunteer', 'ngo', 'admin')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL, -- 'DISPATCH', 'TRIAGE', 'ALERT', 'COMPLETED', 'NEW_REQUEST', 'SUPPLY', 'REROUTE'
  urgency TEXT DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  request_id UUID REFERENCES help_requests(id) ON DELETE SET NULL,
  
  -- Actionable routing
  action_label TEXT,
  action_href TEXT,
  phone_action TEXT,
  
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX notif_user_idx ON notifications(user_id);
CREATE INDEX notif_role_idx ON notifications(role);
CREATE INDEX notif_read_idx ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Enable Supabase Realtime so cross-tab & live push updates trigger automatically
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE volunteers;
```

---

## Seed Script (Execute in Supabase SQL Editor)

```sql
-- 1. Test Admin Profile
INSERT INTO profiles (id, full_name, email, role, phone, address, is_verified)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Disaster Control Command', 'admin@nexoralink.org', 'admin', '+91 71225 61234', 'Command Center, Civil Lines, Nagpur', true),
  ('b0000000-0000-0000-0000-000000000002', 'Dr. Rahul Sharma', 'volunteer@nexoralink.org', 'volunteer', '+91 98230 44120', 'Nagpur Metropolitan', true),
  ('c0000000-0000-0000-0000-000000000003', 'Sagar Kharbikar', 'requester@nexoralink.org', 'requester', '+91 98230 11492', 'Flat 302, Green Valley Apartments, Sector 4', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Volunteer Details with Vehicle & Response Radius
INSERT INTO volunteers (id, bio, is_available, trust_score, total_completed, location, current_latitude, current_longitude, radius_km, vehicle_type, is_stuck, stuck_reason)
VALUES 
  ('b0000000-0000-0000-0000-000000000002', 'Certified Trauma EMT & 4x4 Emergency Driver', true, 4.9, 24, ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326), 21.1458, 79.0882, 10.0, 'SUV / 4x4', false, null)
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Active Requester Help Request
INSERT INTO help_requests (id, requester_id, requester_name, requester_phone, description, ai_category, ai_urgency, items_needed, household_flags, location, latitude, longitude, address, status)
VALUES 
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Sagar Kharbikar', '+91 98230 11492', 'Urgent cold-chain insulin transport required for senior citizen.', 'medical', 'CRITICAL', ARRAY['Cold-chain Insulin vial', 'Mobility Transport'], ARRAY['Elderly Household Member (65+)', 'Diabetic / Cold-Chain Medicine Required'], ST_SetSRID(ST_MakePoint(79.0980, 21.1585), 4326), 21.1585, 79.0980, 'Flat 302, Green Valley Apts, Sector 4', 'REQUESTED')
ON CONFLICT (id) DO NOTHING;
```
