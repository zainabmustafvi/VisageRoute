# VisageRoute — Requirements Specification
**Project:** VisageRoute — Intelligent Bus Tracking & Management System
**Stack:** React Native (Expo) + Node.js/Express + MongoDB Atlas
**Auth:** JWT Role-Based (Admin / Driver / Parent)

---

## Overview

Build a secure 3-module mobile ecosystem for student transportation management. Each user authenticates via a shared login screen using their assigned User ID, role radio button selection, and password.

---

## Module 1 — Admin

### User Management (CRUD)
- Register students with: name, department, roll number, parent info, pickup/drop points, assigned bus, face photo (generates 128-d embedding for attendance)
- Register drivers with: name, phone, email, license number, license class, expiry, assigned bus (auto-generates login credentials → emailed to driver)
- Register buses with: bus number, license plate, capacity, assigned driver
- View, search, update, and soft-delete students, drivers, and buses
- All forms validated with Zod; duplicate detection on unique fields

### Fleet Assignment
- Assign a specific bus and route to students and one driver per bus
- Manage bus status: available / active / maintenance

### Scheduling
- Upload CSV schedule (Bus Number, Trip Name, Route, Pickup Time, Drop Time, Days of Week)
- Validate CSV format before processing
- Parsed data stored in MongoDB and shown on parent schedule screen
- Admin can view upload history with filename, date, and status

### Broadcast System
- Create announcements with title, message body, priority (urgent/general)
- Target: all parents / specific route / specific bus
- Delivery options: push notification (FCM) and/or email
- Urgent announcements trigger high-priority FCM alerts

---

## Module 2 — Driver

### Authentication
- Login with auto-generated ID and password (created at registration)
- JWT stored securely; role verified on every API call

### Route Visibility
- View assigned bus details (number, plate, capacity)
- View assigned route with stops timeline (name + scheduled time per stop)

### Live GPS Tracking
- Swipe button on dashboard to start/stop trip
- On start: activate device GPS, emit coordinates via **Socket.io** every 10 seconds
  - Event: `bus_location_update` → `{ busID, latitude, longitude, speed, timestamp }`
- Server broadcasts to all parent sockets subscribed to that busID
- On stop: emit trip end event, update driver status to OFFLINE
- Offline fallback: cache coordinates locally, sync when internet restores
- Battery optimization: reduce frequency if battery < 20%

### AI Attendance (Three-Step Integration)

**Step A — Camera (Eyes):**
- `react-native-vision-camera` for high frame-rate camera access

**Step B — Detection (Brain):**
- Frame Processor with Google ML Kit
- Detects face → returns bounding box coordinates

**Step C — Recognition (Identity):**
- Crop image from bounding box
- Run TFLite MobileFaceNet model on-device → 128-d float embedding
- Send embedding via HTTPS POST to Node.js backend
- Backend performs cosine similarity match against stored student embeddings (threshold ≥ 0.6)
- Match → log attendance + send FCM "Child Boarded" to parent
- No match → red border + "Identity not found" toast
- One attendance record per student per trip enforced

---

## Module 3 — Parent

### Authentication
- Login credentials auto-generated and emailed when admin registers child
- JWT role verified; parent can only access their own child's data (OWASP BAC)

### Real-Time Map (OpenStreetMap)
- Live bus location displayed on interactive map using `react-native-maps`
- OSM tile provider (no Google Maps API required):
  ```
  urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  ```
- Bus marker animates to new coordinates every 10 seconds via Socket.io
- Route polyline displayed from start to end point
- Route timeline: current stop centered, previous/upcoming stops faded

### ETA Card
- Dynamic arrival time calculated server-side from current GPS coordinates vs remaining stops
- Shown on dashboard card and map screen
- Updates in real-time as bus location changes

### Child Safety Status
- "On Board" (green) — attendance record exists with status: boarded
- "Not On Board" (grey) — no attendance record yet today
- "Dropped Off" (blue) — alighting time recorded
- Instant update when FCM notification received from attendance scan

### Notifications
- Push notifications via FCM for:
  - Child safely boarded
  - Bus approaching pickup point
  - Route started / ended
  - Admin emergency alerts
- Parent can toggle each notification type on/off
- Preferences stored in MongoDB `notificationPreferences` JSON field
- FCM respects preferences — only sends enabled types

### Schedule View
- Shows weekly pickup/drop times for assigned bus
- Displays admin-uploaded CSV schedule
- Today highlighted; completed pickups shown with checkmark
- Tomorrow's trip timing shown separately

---

## Security Requirements

### Rate Limiting (`express-rate-limit`)
- General: 100 requests / 15 min per IP on all public endpoints
- Login endpoint: 10 attempts / 15 min per IP (strict)
- Broadcast/announcement: 20 requests / hour per authenticated admin
- Graceful 429 response: `{ error: "Too many requests, please wait" }`
- Frontend catches 429 and shows toast — no crash

### Input Validation (Zod)
- Strict schema validation on ALL incoming API request bodies
- Reject unexpected/extra fields (Zod `.strict()`)
- Enforce type checks and length limits:
  - name: string, max 100 chars
  - email: valid email format
  - phone: max 20 chars
  - license: max 50 chars
  - faceEmbedding: array of 128 numbers
- Inline frontend red hints for invalid characters in real-time

### Secure API Key Handling
- All keys in `.env` files (MongoDB URI, JWT secret, Firebase key)
- `.env` listed in `.gitignore` — never committed
- No sensitive keys hard-coded in React Native client bundle
- `.env.example` provided as template

### Authentication (JWT)
- Short expiry: 15 minutes for access token
- Refresh token rotation with secure storage
- HTTP-only cookie or secure Authorization header
- JWT verified on every protected route via middleware

### OWASP Compliance
- **Injection Prevention:** Mongoose strict casting prevents NoSQL injection; all inputs sanitized before DB operations
- **Broken Access Control:** Role middleware verifies JWT role on every route; parents can only query their own child's studentID
- **Generic Error Messages:** Login returns "Invalid credentials" (no user enumeration)
- **Security Comments:** All security logic annotated inline for audit trail

---

## Real-Time Architecture (Socket.io)

```
Publisher:  Driver App
            └── emits: bus_location_update { busID, lat, lng, speed }

Server:     Node.js
            └── receives event
            └── validates JWT from socket handshake
            └── identifies parent room for this busID
            └── broadcasts to: room(busID)

Subscriber: Parent App
            └── listens: bus_location_update
            └── updates OSM map marker state
            └── recalculates ETA
```

- JWT verification added to Socket.io handshake (prevents unauthorized connections)
- Room-based broadcasting (parents only receive their bus's data)

---

## Face Recognition Libraries

```
react-native-vision-camera      High-performance camera engine
vision-camera-face-detector     Google ML Kit face detection plugin
react-native-quick-tflite       TFLite runtime for MobileFaceNet model
```

- Face detection (bounding box): on-device via ML Kit
- Embedding generation (128-d vector): on-device via TFLite
- Identity matching (cosine similarity): server-side via Node.js
- Raw face images never stored — embeddings only

---

## Data Flow Summary

```
Component          Technology              Role
─────────────────────────────────────────────────────
UI Screens         React Native            Admin/Driver/Parent interfaces
Live GPS           Socket.io               Driver → Server → Parent
Face Detection     ML Kit + TFLite         On-device processing
Face Matching      Node.js + MongoDB       Server-side identity verification
Notifications      Firebase FCM            Push alerts to parents
Data Storage       MongoDB Atlas           All records and logs
Authentication     JWT + bcrypt            Secure role-based access
Validation         Zod                     API input sanitization
Rate Limiting      express-rate-limit      Abuse prevention
Maps               react-native-maps+OSM   No Google API needed
```