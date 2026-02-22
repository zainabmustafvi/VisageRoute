# VisageRoute Development & Security Hardening Plan

**Role:** Senior Security Engineer / Full Stack Developer  
**Timeline:** 3 Months  
**Objective:** Build the VisageRoute ecosystem (Admin, Driver, Parent) with a "Secure by Design" approach, implementing strict rate limiting, input validation, secure key management, JWT authentication, and OWASP best practices.

---

## Month 1: Foundation, Auth & Security Baseline
**Goal:** Setup the core architecture (React Native Expo + Node.js/Express + MongoDB) and establish a rock-solid security perimeter.

### Week 1: Project Setup & Environment Security
- [ ] **Initialize Monorepo:** Setup React Native (Expo) frontend and Node.js (Express) backend.
- [ ] **Secure API Key Handling (`.env`):**
  - Setup `.env` files for both frontend and backend.
  - Move all sensitive keys (MongoDB URI, Firebase credentials, Maps API keys, JWT Secrets) into `.env`.
  - Add `.env` to `.gitignore`. Ensure no keys are hard-coded in the React Native client-side bundle.
- [ ] **Database Setup:** Connect to MongoDB Atlas (M0 Free Tier). Define initial collections based on requirements.

### Week 2: Security Hardening - Authentication
- [ ] **Auth Backend Integration:** Implement login logic for Admin, Driver, and Parent roles.
- [ ] **Secure Authentication (JWT):**
  - Implement JWT issuance with **short expiration times** (e.g., 15-30 mins).
  - Configure secure storage: Use **HTTP-only cookies** or secure headers for tokens to prevent XSS attacks.
  - Implement a secure Refresh Token rotation mechanism if required.

### Week 3 & 4: UI Foundation & Access Control
- [ ] **Frontend UI Implementation:** Build Splash Screen and Login Screen using the "Stitch-to-Native" HTML/CSS specs (Stylesheets + Theme.js).
- [ ] **OWASP - Broken Access Control:**
  - Build role-based middleware (Admin, Driver, Parent).
  - Ensure users can only access endpoints authorized for their specific role (e.g., Parents can only view their own child's status).
- [ ] **UI Security Feedback:** Ensure Login UI provides generic error messages ("Invalid credentials") to prevent user enumeration.

---

## Month 2: Core Modules & API Hardening
**Goal:** Develop the Admin and Driver CRUD operations while applying strict validation and network-layer defenses.

### Week 1: Admin Module & Input Validation
- [ ] **Admin Backend APIs:** Create CRUD endpoints for Students, Drivers, and Bus Profiles.
- [ ] **Strict Input Validation (Joi/Zod):**
  - Implement strict schema-based validation for all incoming requests.
  - Reject unexpected fields (no polluting the database).
  - Enforce type checks and strict length limits (crucial for student/bus registration forms).

### Week 2: Rate Limiting & Network Security
- [ ] **API Rate Limiting (`express-rate-limit`):**
  - Apply general IP-based rate limiting on all public API endpoints.
  - Apply strict User-based rate limiting on sensitive routes (e.g., Login, Password Reset, Broadcasts).
- [ ] **Graceful UI Handling for 429s:** Implement UI logic to catch `429 Too Many Requests` errors and display a toast ("Too many attempts, please wait") without crashing the app.

### Week 3: Driver Module & OWASP Defenses
- [ ] **Driver Backend APIs:** Link students and drivers to designated bus routes.
- [ ] **OWASP - Injection Prevention:**
  - Sanitize all database inputs using mongoose strict casting to prevent NoSQL injection.
  - Include clear inline code comments explaining the security logic for future audits.
- [ ] **UI Sanitization Feedback:** Add visual indicators (red hints) in the frontend when invalid characters are typed in real-time.

### Week 4: Scheduling & Initial Socket Setup
- [ ] **Scheduling API:** Endpoints to define and update bus departure/arrival timings.
- [ ] **Socket.io Foundation:** Setup secure Socket.io server. Add JWT verification to the socket handshake connection to ensure only authenticated users can emit/listen.

---

## Month 3: Real-Time Tracking, AI, and Launch
**Goal:** Implement complex features (Live GPS, AI Attendance, Notifications) securely, followed by a full security audit.

### Week 1: Live Tracking & Parent Interface
- [ ] **Driver Location Emitter:** Implement driver app logic to emit GPS coordinates via Socket.io during active trips.
- [ ] **Parent Map UI:** Integrate `react-native-maps` and OSM tiles.
- [ ] **ETA Calculation:** Build server-side logic for dynamic ETA and broadcast it securely to specific parent sockets.

### Week 2: AI Attendance System
- [ ] **On-Device Face Detection:** Integrate `react-native-vision-camera` and Google ML Kit.
- [ ] **Secure Embedding Transmission:** Extract face-vectors on the mobile device and send securely (via HTTPS) to the backend.
- [ ] **Server-Side Matching:** Implement attendance logic on Node.js to match vectors against registered student hashes.

### Week 3: Broadcast System & Notifications
- [ ] **Broadcast API:** Implement Push Notifications for alerts and emergencies.
- [ ] **Notification Security:** Ensure broadcast APIs are strictly Admin-only and rate-limited to avoid spam/abuse.
- [ ] **Parent Notification Preferences:** Build UI for managing alert preferences.

### Week 4: Security Audit, Testing, & Final Polish
- [ ] **End-to-End Security Audit:**
  - Verify all `.env` integrations.
  - Test Input Validation schemas with malicious inputs.
  - Test JWT expiration and HTTP-only cookie security.
  - Trigger Rate Limits to test 429 graceful degradation.
  - Confirm OWASP practices (No SQL Injection, rigorous BAC tests).
- [ ] **Documentation:** Ensure all security comments are present and update `databasedesign.md` with the finalized schemas.
- [ ] **Production Build:** Lock down CORS, disable debug logs, and build the APK/IPA.
