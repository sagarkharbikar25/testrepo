-- NOTE: Replace the UUIDs below with real Auth UUIDs from your Supabase Authentication dashboard after creating the users.

-- 1. Insert Profiles (Mock Users)
INSERT INTO profiles (id, name, role, location_text, lat, lng, org_name) VALUES
('11111111-1111-1111-1111-111111111111', 'Rahul Sharma', 'requester', 'Dharampeth, Nagpur', 21.1458, 79.0882, NULL),
('22222222-2222-2222-2222-222222222222', 'Priya Deshmukh', 'volunteer', 'Sitabuldi, Nagpur', 21.1505, 79.0806, NULL),
('33333333-3333-3333-3333-333333333333', 'Aman Gupta', 'ngo_admin', 'Civil Lines, Nagpur', 21.1456, 79.0847, 'Nagpur Relief Org'),
('44444444-4444-4444-4444-444444444444', 'Kavita Patel', 'requester', 'Itwari, Nagpur', 21.1555, 79.1136, NULL),
('55555555-5555-5555-5555-555555555555', 'Vikram Singh', 'volunteer', 'Kamptee, Nagpur', 21.2227, 79.1970, NULL);

-- 2. Insert Open Requests (Requester: Rahul, Kavita)
INSERT INTO requests (id, requester_id, title, description, category, urgency, status, quantity, unit, location_text, lat, lng) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Need food packets', 'Need 10 food packets for stranded workers', 'food', 'CRITICAL', 'open', 10, 'packets', 'Dharampeth, Nagpur', 21.1458, 79.0882),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Insulin required', 'Urgent need for Novolog insulin', 'medicine', 'HIGH', 'open', 2, 'vials', 'Dharampeth, Nagpur', 21.1458, 79.0882),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'Winter clothes for kids', 'Need warm clothes for 3 children aged 5-10', 'clothes', 'MEDIUM', 'open', 3, 'sets', 'Itwari, Nagpur', 21.1555, 79.1136);

-- 3. Insert In-Progress Request (Matched with Priya)
INSERT INTO requests (id, requester_id, title, description, category, urgency, status, quantity, unit, location_text, lat, lng) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Need transport to hospital', 'Wheelchair accessible vehicle required', 'transport', 'HIGH', 'in_progress', 1, 'vehicle', 'Itwari, Nagpur', 21.1555, 79.1136);

INSERT INTO matches (request_id, volunteer_id) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222');

-- 4. Insert Resources (Offered by Volunteers & NGOs)
INSERT INTO resources (provider_id, title, category, quantity, unit, location_text, lat, lng, is_available) VALUES
('33333333-3333-3333-3333-333333333333', 'Bulk Rice and Dal', 'food', 50, 'kg', 'Civil Lines, Nagpur', 21.1456, 79.0847, true),
('55555555-5555-5555-5555-555555555555', 'First Aid Kits', 'medicine', 5, 'kits', 'Kamptee, Nagpur', 21.2227, 79.1970, true);

-- Note: 'impact_feed' table will auto-populate via trigger when requests are marked 'completed'.
