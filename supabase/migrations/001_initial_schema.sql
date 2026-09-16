-- Enable PostGIS extension for Geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE user_role AS ENUM ('requester', 'volunteer', 'ngo_admin');
CREATE TYPE urgency_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE request_category AS ENUM ('food', 'medicine', 'shelter', 'clothes', 'tutoring', 'transport', 'other');
CREATE TYPE request_status AS ENUM ('open', 'accepted', 'in_progress', 'completed', 'cancelled');

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  location_text TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location GEOMETRY(Point, 4326), -- PostGIS coordinates (Lng, Lat)
  org_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for geo-queries on profiles
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);

-- 2. Requests Table
CREATE TABLE requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category request_category NOT NULL,
  urgency urgency_level NOT NULL,
  status request_status DEFAULT 'open' NOT NULL,
  quantity INTEGER,
  unit TEXT,
  location_text TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location GEOMETRY(Point, 4326), -- PostGIS coordinates
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for geo-queries on requests
CREATE INDEX idx_requests_location ON requests USING GIST (location);
CREATE INDEX idx_requests_status ON requests(status);

-- 3. Matches Table (Volunteer accepts Request)
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE UNIQUE NOT NULL, -- Prevents race condition!
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Request Timeline Table (Audit log for status changes)
CREATE TABLE request_timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  status request_status NOT NULL,
  at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  note TEXT
);

-- 5. Resources Table (Offers of help/goods)
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category request_category NOT NULL,
  quantity INTEGER,
  unit TEXT,
  location_text TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location GEOMETRY(Point, 4326), -- PostGIS coordinates
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_resources_location ON resources USING GIST (location);

-- 6. Impact Feed Table (Public activity stream)
CREATE TABLE impact_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  category request_category NOT NULL,
  location_text TEXT,
  display_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Function to auto-update 'updated_at' on requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-sync lat/lng to PostGIS geometry point
CREATE OR REPLACE FUNCTION sync_postgis_location()
RETURNS TRIGGER AS $$
BEGIN
   IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
     NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
   END IF;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER sync_profiles_location
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION sync_postgis_location();

CREATE TRIGGER sync_requests_location
BEFORE INSERT OR UPDATE ON requests
FOR EACH ROW EXECUTE FUNCTION sync_postgis_location();

CREATE TRIGGER sync_resources_location
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION sync_postgis_location();

-- Function to auto-insert impact feed when request completed
CREATE OR REPLACE FUNCTION insert_impact_feed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO impact_feed (request_id, category, location_text, display_text)
    VALUES (NEW.id, NEW.category, COALESCE(NEW.location_text, 'Unknown Location'),
      NEW.category || ' request successfully completed in ' || COALESCE(NEW.location_text, 'the community'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER on_request_completed
AFTER UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION insert_impact_feed();
