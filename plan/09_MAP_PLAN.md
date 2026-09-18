# 09 — NexoraLink Map Plan
**Owner: Person 4 (Leaflet component)**  
**Owner: Person 1 (map containers in UI pages)**

---

## Map Instances in the Application

| Map | Page | Owner | Markers Shown |
|-----|------|-------|--------------|
| Mini Request Map | Requester: New Request Form | Person 1 (uses NexoraMap) | Location picker pin |
| Request Detail Map | Requester: Request detail | Person 1 | Request location + assigned volunteer |
| Volunteer Dashboard Map | Volunteer dashboard | Person 1 | Nearby requests (color by urgency) |
| Admin Coordination Map | Admin dashboard | Person 1 | ALL markers — requests, volunteers, NGOs, resources |
| NGO Resource Map | NGO dashboard | Person 1 | Own resources + nearby requests |

---

## NexoraMap Component (Person 4 builds)

**File**: `src/features/map/NexoraMap.tsx`  
**Import pattern** (Person 1 uses this everywhere):
```typescript
import dynamic from 'next/dynamic'
const NexoraMap = dynamic(() => import('@/features/map/NexoraMap'), { ssr: false })
```

**Props interface** (defined in `src/types/matching.ts`):
```typescript
export type MarkerType = 'request' | 'volunteer' | 'ngo' | 'resource'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  type: MarkerType
  label: string
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status?: string
  popup?: string
}

export interface NexoraMapProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  height?: string
  interactive?: boolean
  onMarkerClick?: (marker: MapMarker) => void
  onLocationSelect?: (lat: number, lng: number) => void  // for location picker mode
}
```

---

## Marker Visual Design

| Type | Color | Size | Shape |
|------|-------|------|-------|
| Request (LOW) | `#22C55E` | 10px | Circle |
| Request (MEDIUM) | `#F59E0B` | 12px | Circle |
| Request (HIGH) | `#F97316` | 15px | Circle |
| Request (CRITICAL) | `#EF4444` | 18px | Circle + pulse animation |
| Volunteer (available) | `#3B82F6` | 12px | Circle |
| Volunteer (busy) | `#64748B` | 10px | Circle |
| NGO (verified) | `#8B5CF6` | 14px | Diamond (rotated square) |
| NGO (unverified) | `#A78BFA` | 10px | Diamond |
| Resource | `#10B981` | 12px | Square |

---

## Map Data Sources

### Admin Map: `GET /api/admin/map-data`
Returns all locations in one call (Person 3 implements data layer).
```typescript
// Person 1 usage in AdminMapView.tsx:
const { data } = await fetch('/api/admin/map-data').then(r => r.json())

const markers: MapMarker[] = [
  ...data.requests.map(r => ({
    id: r.id, lat: r.lat, lng: r.lng,
    type: 'request', label: r.category,
    urgency: r.urgency, status: r.status,
  })),
  ...data.volunteers.map(v => ({
    id: v.id, lat: v.lat, lng: v.lng,
    type: 'volunteer', label: v.name,
  })),
  // ...ngos, resources
]
```

### Request Location Picker
Mini map that lets requester click to set location:
```typescript
// In NewRequestForm.tsx — Person 1 wires this up:
<NexoraMap
  markers={selectedLocation ? [{
    id: 'selected',
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    type: 'request',
    label: 'Request Location',
  }] : []}
  onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
  height="250px"
  zoom={13}
/>
```

### Volunteer Dashboard Map
Shows nearby open requests with urgency colors:
```typescript
// Data from GET /api/volunteers/requests
// Transform to MapMarker[]
```

---

## Dependencies

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

**package.json entry** (Person 2 adds this to `package.json` since they set up the project):
```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  }
}
```

Person 4 must coordinate with Person 2 to add these dependencies without conflict.

**Rule**: Person 2 adds to package.json during Hour 0. Person 4 does NOT independently edit package.json.  
Person 4 tells Person 2: "Add leaflet ^1.9.4 and react-leaflet ^4.2.1 to dependencies"

---

## CSS for Leaflet (add to `src/app/globals.css` — Person 2 coordinates)

```css
@import 'leaflet/dist/leaflet.css';

/* Override Leaflet z-index to work within Next.js layout */
.leaflet-container {
  z-index: 0;
}

/* Pulse animation for CRITICAL markers */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
```

---

## Map Legend Component (Person 1 builds)

```typescript
// src/components/ui/MapLegend.tsx [Person 1]
export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur rounded-lg p-3 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>
        Help Requests
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/>
        Volunteers
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rotate-45 bg-violet-500 inline-block"/>
        NGOs
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"/>
        Resources
      </div>
    </div>
  )
}
```

---

## Failure Modes & Fallbacks

| Failure | Fallback |
|---------|---------|
| Leaflet SSR error | `dynamic(() => import(...), { ssr: false })` |
| No location selected | Default to city center (detect from IP or hardcode for demo) |
| Map container height 0 | Always set explicit height via `style={{ height: '400px' }}` |
| OSM tiles fail | Tiles fail silently — map still usable |
| Too many markers | Cluster if > 50 markers (not needed for demo) |
