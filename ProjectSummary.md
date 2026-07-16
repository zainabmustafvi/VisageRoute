# Project Summary & Overview: VisageRoute

**VisageRoute** is an Intelligent Bus Tracking & Management System designed with a "Secure by Design" architecture. It consists of a 3-module ecosystem tailored for Admins, Drivers, and Parents, enabling secure user authentication, AI-powered face recognition attendance, real-time GPS tracking, and automated parent alerts.

---

## 1. What Has Been Done (Completed Milestones)

### A. Core Architecture & Tech Stack Setup
- **Mobile Frontend**: React Native Expo application structure using `NavigationContainer` and `native-stack` navigation.
- **Backend Services**: Express.js server on Node.js running on Port 5000.
- **Database Layer**: MongoDB Atlas integration using Mongoose ODM.
- **Real-Time Communication**: Socket.io setup for real-time bi-directional GPS event streaming.

### B. Database Design & Schemas
Mongoose schemas and compound indexes are fully designed and implemented:
- **Users, Admins, Drivers, & Parents**: Base auth schemas with Role-Based Access Control (RBAC).
- **Students**: Includes fields for parent mapping and 128-dimensional floating-point array for MobileFaceNet face embeddings.
- **Buses & Routes**: Stores fleet identifiers, capacity, driver assignments, and GeoJSON style coordinates for stops.
- **Live Location Tracking**: Optimized with an index on `{ busID: 1, timestamp: -1 }` and a 24-hour TTL index for automated data pruning.
- **Attendance & Announcements**: Enforces one boarding/alighting record per student per trip per day.

### C. Security Hardening (OWASP Compliance)
- **Encryption**: Hashed passwords using `bcryptjs` (saltRounds: 12).
- **Authentication**: Stateless session security using JWT (15-min access token + refresh token rotation).
- **Input Sanitization & Protection**:
  - `express-rate-limit` to prevent brute force attacks (stricter limit on login endpoints).
  - `helmet` for secure HTTP headers.
  - `express-mongo-sanitize` to block NoSQL query injections.
  - Zod schemas for input validation on all endpoint request bodies.

### D. Complete Screen Implementation (Frontend UI)
All **25 screens** from the Google Stitch custom UI mockups have been successfully constructed in React Native:
- **Authentication**: `SplashScreen` and `LoginScreen` (with role selection radios for Parent, Driver, and Admin).
- **Admin Module**:
  - `AdminHomeScreen` dashboard showing quick actions (register bus/student/driver, upload schedule, push announcements).
  - CRUD list and detail views (`AdminStudentCRUD`, `AdminDriverCRUD`, `AdminBusCRUD`, and details).
  - `AdminUploadSchedule` handling CSV parsing and verification.
  - `AdminAnnouncementScreen` with audience selection (chips) and channel options.
- **Driver Module**:
  - `DriverHome` showing assigned bus details.
  - `DriverRoute` containing timeline stops with scheduled times.
  - `DriverAttendance` providing camera views and scanning feedback.
  - `DriverProfile` showing ratings, trips, and offline sync.
- **Parent Module**:
  - `ParentHome` containing safety status cards ("On Board", "Dropped Off").
  - `ParentTrackBus` hosting the interactive OpenStreetMap using `UrlTile` in `react-native-maps`.
  - `ParentSchedule` displaying the weekly timetable.
  - `ParentNotifications` for configuring push alert toggles.
  - `ParentAnnouncements` showing general and urgent alerts.

### E. Diagnostic & Database Resolution
- **Issue Solved**: Fixed the MongoDB connection error `queryTxt ETIMEOUT` in `server.js` by transitioning the `MONGO_URI` connection string from `mongodb+srv://` to standard `mongodb://` protocol. This bypasses local DNS resolver timeouts on UDP port 53 by querying the three shard hosts directly.
- **Verification**: Verified MongoDB connectivity successfully using node diagnostic scripts to retrieve parent, driver, and admin credentials.

---

## 2. Project Status Checklist

- [x] Base database models and indexing strategies defined
- [x] Security middlewares and input validation built
- [x] Real-time Socket.io handshake and room management ready
- [x] Full UI transition from Stitch HTML design to React Native screens
- [x] Database configuration optimized for local DNS connection robustness
- [ ] Complete end-to-end integration testing (Frontend ↔ Backend APIs)
- [ ] On-device camera frame processor and TFLite (MobileFaceNet) integration
- [ ] Push notification credentials (FCM) provisioning and testing
- [ ] Socket.io end-to-end GPS stream simulation (Driver app emitter to Parent app listener)

---

## 3. Next Steps & Action Plan

### Step 1: Run & Validate Local API Requests
- Verify that the React Native screens successfully call the backend login and data retrieval endpoints.
- Check that the Zod validator errors show up correctly as red hints in the forms if inputs are invalid.
- Verify that rate-limiting handles too many requests gracefully.

### Step 2: Implement On-Device Face Recognition Components
- Wire up `react-native-vision-camera` and `vision-camera-face-detector` on the driver attendance screen.
- Set up the TFLite runtime in the React Native project to load the `MobileFaceNet` model.
- Test the crop and embedding generation step, sending the vector to the backend `/api/attendance/check` endpoint.

### Step 3: Run Real-Time GPS Tracking Simulation
- Test the Socket.io connection by swiping "Start Trip" on the driver screen, monitoring the emitted `bus_location_update` events on the server.
- Verify that the Parent's Map screen connects to the matching bus socket room and smoothly updates the OpenStreetMap marker.

### Step 4: Finalize Firebase Notification Handlers
- Set up Firebase Cloud Messaging (FCM) on both backend and frontend.
- Verify that when a student's attendance is registered, the parent's device receives the push notification corresponding to their notification preferences.
