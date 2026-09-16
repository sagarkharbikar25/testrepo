-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_feed ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
-- Anyone can read profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);
-- Users can only insert/update their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Requests Policies
-- Anyone can view open requests
CREATE POLICY "Open requests are viewable by everyone" ON requests
  FOR SELECT USING (status = 'open');
-- Requesters can view their own requests regardless of status
CREATE POLICY "Users can view their own requests" ON requests
  FOR SELECT USING (auth.uid() = requester_id);
-- Volunteers can view requests they have accepted
CREATE POLICY "Volunteers can view accepted requests" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches WHERE matches.request_id = requests.id AND matches.volunteer_id = auth.uid()
    )
  );
-- NGO Admins can view all requests
CREATE POLICY "NGO Admins can view all requests" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ngo_admin'
    )
  );
-- Users can create requests
CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
-- Users can update their own requests (only if open)
CREATE POLICY "Users can update their open requests" ON requests
  FOR UPDATE USING (auth.uid() = requester_id AND status = 'open');

-- Note: Updating request status after acceptance is handled by the Backend Service Role (API), 
-- bypassing these RLS policies. This ensures Volunteers can't maliciously edit request fields.

-- 3. Matches Policies
-- Users can view matches involving their requests
CREATE POLICY "Requesters can view matches for their requests" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests WHERE requests.id = matches.request_id AND requests.requester_id = auth.uid()
    )
  );
-- Volunteers can view their own matches
CREATE POLICY "Volunteers can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = volunteer_id);
-- Match creation is handled by Backend API (Service Role) to prevent race conditions safely

-- 4. Timeline Policies
-- Anyone can view timelines for open requests
CREATE POLICY "Timeline is viewable for open requests" ON request_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests WHERE requests.id = request_timeline.request_id AND requests.status = 'open'
    )
  );
-- Users can view timeline for their own requests
CREATE POLICY "Users can view timeline for their own requests" ON request_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests WHERE requests.id = request_timeline.request_id AND requests.requester_id = auth.uid()
    )
  );
-- Volunteers can view timeline for requests they accepted
CREATE POLICY "Volunteers can view timeline for assigned requests" ON request_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches WHERE matches.request_id = request_timeline.request_id AND matches.volunteer_id = auth.uid()
    )
  );

-- 5. Resources Policies
-- Anyone can view available resources
CREATE POLICY "Available resources are viewable by everyone" ON resources
  FOR SELECT USING (is_available = true);
-- Providers can view and manage their own resources
CREATE POLICY "Users manage own resources" ON resources
  FOR ALL USING (auth.uid() = provider_id);

-- 6. Impact Feed Policies
-- The impact feed is fully public
CREATE POLICY "Impact feed is public" ON impact_feed
  FOR SELECT USING (true);
-- Insertion is handled purely via the database trigger. Users cannot manually insert impact feeds.
