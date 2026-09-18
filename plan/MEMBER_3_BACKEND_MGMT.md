# Member 3: Backend Developer 2 (Management APIs, Live Routing & Command Telemetry)
**Branch:** `feature/backend-management`
**Owned files:**
```
src/app/api/volunteers/**
src/app/api/ngos/**
src/app/api/resources/**
src/app/api/admin/**
src/types/volunteer.ts, ngo.ts, resource.ts, admin.ts
src/lib/validation/volunteer.schema.ts, ngo.schema.ts, resource.schema.ts
```

**Do not touch:** `src/app/api/auth/**`, `requests/**`, `ai/**`, `matches/**`, `src/lib/supabase/**` (Member 2) · `src/app/**` (all UI pages & components, Member 4) · `supabase/migrations/**` (Member 1)

> **Updated Frontend Alignment:** 
> - The Volunteer module now features **Live GPS & Route** (`/volunteer/map`) with turn-by-turn guidance, distance in km, ETA, drive simulation, and response radius.
> - The NGO / Admin Command Center now features **Live Volunteer Tracking** and **Stuck-Volunteer Emergency Reroute** to dispatch backup units via alternate diversion routes when roads are waterlogged or blocked.

---

## 1. Volunteer Routes

### `GET /api/volunteers/requests` (Nearby Opportunities)
- **Flow**: Retrieves volunteer's current GPS location and radius from `volunteers` table, then calls `get_nearby_requests` RPC from Member 1.
- Calculates AI Match Score (0–100) based on volunteer skills and vehicle type vs request requirements.
- **Response 200**:
  ```json
  {
    "data": [
      {
        "id": "d0000000-0000-0000-0000-000000000004",
        "requesterName": "Sagar Kharbikar",
        "category": "Medical Transport",
        "urgency": "CRITICAL",
        "description": "Urgent cold-chain insulin transport required for senior citizen.",
        "address": "Flat 302, Green Valley Apartments, Sector 4",
        "distanceKm": 1.8,
        "etaMinutes": 5,
        "matchScore": 94,
        "itemsNeeded": ["Cold-chain Insulin transport", "Mobility Van"],
        "householdFlags": ["Elderly Household Member (65+)", "Diabetic"]
      }
    ]
  }
  ```

### `POST /api/volunteers/requests/:id/accept`
- **Flow**:
  1. Validates request status is available (`REQUESTED`, `AI_ANALYZED`, or `MATCHING`).
  2. Updates `help_requests`: `status = 'ACCEPTED'`, `assigned_volunteer_id = user.id`.
  3. Inserts into `request_status_history`.
  4. Updates `volunteers`: `active_request_id = request.id`.
  5. Inserts notification for requester:
     `"Dr. Rahul Sharma accepted your request (REQ-4091). Preparing dispatch."`
- **Response 200**: `{ data: { requestId: id, status: 'ACCEPTED' } }`

### `POST /api/volunteers/requests/:id/start`
- Sets `status = 'IN_PROGRESS'`. Emits en-route notification with live ETA to requester.

### `POST /api/volunteers/requests/:id/complete`
- Sets `status = 'COMPLETED'`, `completed_at = now()`.
- Increments `volunteers.total_completed += 1`.
- Emits verification notification to requester and NGO hub.

### `POST /api/volunteers/telemetry` (Live GPS Tracking & Stuck Reporting)
- **Body**:
  ```json
  {
    "latitude": 21.1458,
    "longitude": 79.0882,
    "speed": 42.5,
    "heading": 180,
    "isStuck": false,
    "stuckReason": null // e.g. "Waterlogged / Road Blocked"
  }
  ```
- **Flow**:
  Updates `volunteers` row with `current_latitude`, `current_longitude`, and timestamp.
  If `isStuck === true`, flags the volunteer in `volunteers` table and immediately triggers an incident alert for the NGO Admin Command Map!

### `POST /api/volunteers/profile`
- Upserts volunteer personal data, vehicle access (`SUV / 4x4`, `Rapid Bike`, etc.), dispatch radius slider (1–25 km), and verified skills tags.

---

## 2. Live Tactical Routing Engine (`/api/volunteers/route`)

- **Query Params**: `?startLat=21.1458&startLng=79.0882&destLat=21.1585&destLng=79.0980`
- **Flow**:
  Queries the OSRM Driving Engine (`https://router.project-osrm.org/route/v1/driving/...`) with fallback bezier interpolation:
  Returns:
  - `distanceKm`: Real road distance.
  - `etaMinutes`: Realistic driving time accounting for urban conditions.
  - `coordinates`: Polyline array of `[lat, lng]` coordinates for Leaflet map drawing.
  - `turnInstructions`: Maneuver array (`"Turn Right onto Wardha Road in 350m"`, etc.).
  - `alternateRoute`: Secondary route option (via Ring Road / bypass).

---

## 3. NGO & Resource Inventory Management

### `GET /api/resources`
- Filterable by `category`, `ngo_id`, and `available_only`.
- Returns stock levels, units, warehouse location, and safety buffer warnings.

### `POST /api/resources`
- Inserts new stock items (e.g. `20L Drinking Water Cans`, `Cold-chain Insulin Packs`, `Emergency Ration Kits`).

### `POST /api/ngo/requests/:id/allocate`
- NGO Coordinator allocates inventory items directly to an inbound citizen requisition. Decrements `quantity_available` and updates request status.

### `POST /api/ngos/profile`
- Updates NGO organization credentials, registration number, disaster services, and warehouse address.

---

## 4. Admin Command Operations & Emergency Backup Rerouting

### `GET /api/admin/map-data` (Feeds `CommandMap.tsx`)
- **Response 200**:
  ```json
  {
    "data": {
      "incidents": [
        {
          "id": "PIN-1",
          "title": "Emergency Dialysis Transport",
          "category": "Medical",
          "urgency": "CRITICAL",
          "lat": 21.1458,
          "lng": 79.0882,
          "assignedUnit": "Dr. Rahul Sharma"
        }
      ],
      "volunteers": [
        {
          "id": "VOL-101",
          "name": "Dr. Rahul Sharma",
          "lat": 21.1458,
          "lng": 79.0882,
          "vehicleType": "SUV / 4x4",
          "status": "STUCK", // 'AVAILABLE' | 'EN_ROUTE' | 'STUCK'
          "stuckReason": "Waterlogging on Amravati By-pass (8 mins)",
          "activeRequestId": "PIN-1"
        },
        {
          "id": "VOL-102",
          "name": "Unit Bravo (Priya Nair)",
          "lat": 21.1520,
          "lng": 79.0950,
          "vehicleType": "4x4 Off-Road",
          "status": "AVAILABLE"
        }
      ],
      "warehouses": [
        {
          "id": "WH-1",
          "name": "Central Emergency Logistics Depot",
          "lat": 21.1390,
          "lng": 79.0750
        }
      ]
    }
  }
  ```

### `POST /api/admin/reroute` (⭐ The Stuck-Volunteer Reroute Feature)
- **Body**:
  ```json
  {
    "requestId": "d0000000-0000-0000-0000-000000000004",
    "stuckVolunteerId": "b0000000-0000-0000-0000-000000000002",
    "backupVolunteerId": "b0000000-0000-0000-0000-000000000099",
    "reason": "Primary route blocked by flash waterlogging"
  }
  ```
- **Flow**:
  1. Reassigns `help_requests.assigned_volunteer_id = backupVolunteerId`.
  2. Updates `request_status_history` with note: `"Admin rerouted mission to backup unit due to road hazard."`
  3. Sends push notifications:
     - To **Stuck Volunteer**: `"Mission reassigned to backup unit. Return to safety depot."`
     - To **Backup Volunteer**: `"PRIORITY RE-ASSIGNMENT: Proceed to Emergency Dialysis Mission via North Flyover."`
     - To **Requester**: `"Update: Backup responder dispatched via alternate route. New ETA: 7 mins."`
- **Response 200**: `{ data: { success: true, newAssignedVolunteerId: backupVolunteerId } }`
