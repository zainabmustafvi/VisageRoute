# VisageRoute
**Intelligent Bus Tracking & Management System**

A secure, 3-module React Native mobile application for student transportation management. Built with a "Secure by Design" approach using JWT authentication, role-based access control, real-time GPS tracking via Socket.io, and AI-powered facial recognition attendance.

---

## Modules

| Module | Users | Key Features |
|--------|-------|-------------|
| Admin  | Institute Staff | CRUD for students/drivers/buses, schedule upload, announcements |
| Driver | Bus Drivers | Live GPS sharing, face-scan attendance, route view |
| Parent | Student Parents | Real-time bus tracking (OSM), on-board status, notifications |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native (Expo) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (M0 Free Tier) |
| Real-time GPS | Socket.io |
| Maps | react-native-maps + OpenStreetMap tiles |
| Face Detection | react-native-vision-camera + Google ML Kit |
| Face Recognition | TensorFlow Lite (MobileFaceNet — 128-d embeddings) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Authentication | JWT (Role-Based: Admin / Driver / Parent) |
| Security | bcrypt, Zod validation, express-rate-limit, OWASP |

---

## Project Structure

```
VisageRoute/
├── frontend/                  # React Native (Expo)
│   ├── app/
│   │   ├── (auth)/            # Login, Splash
│   │   ├── admin/             # Admin module screens
│   │   ├── driver/            # Driver module screens
│   │   └── parent/            # Parent module screens
│   ├── components/            # Shared UI components
│   ├── hooks/                 # Custom hooks (useAuth, useLocation)
│   ├── services/              # API calls, Socket.io client
│   ├── theme/                 # Colors, typography (yellow/white theme)
│   └── utils/                 # Helpers, validators
│
├── backend/                   # Node.js + Express
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth (JWT), rate-limit, validation
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── services/              # FCM, Socket.io, face matching
│   ├── sockets/               # Socket.io event handlers
│   └── utils/                 # ETA calc, embedding matcher
│
├── .env.example               # Environment variable template
└── README.md
```

---

## Environment Variables

```env
# Backend (backend/.env)
MONGO_URI=your_mongodb_atlas_uri          # NOTE: MONGO_URI (not MONGODB_URI)
JWT_SECRET=your_jwt_secret_min_32_chars
PORT=5000
NODE_ENV=development
CLIENT_URL=                               # only used when NODE_ENV=production

# Firebase Admin (FCM) — from Firebase Console → Project settings → Service accounts
FIREBASE_PROJECT_ID=visageroute-4d751     # must match frontend/google-services.json
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@visageroute-4d751.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email (nodemailer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

```env
# Frontend (frontend/.env) — inlined into the APK at build time
EXPO_PUBLIC_API_BASE_URL=http://your_backend_ip:5000   # used for BOTH REST + Socket.io
```

> ⚠️ Never commit `.env` files or `google-services.json`.
> `FIREBASE_PRIVATE_KEY` must be on **one line** with literal `\n` for newlines, in double quotes.

---
##Capture Real-Time Logs via ADB (Recommended)

The Android Debug Bridge (ADB) allows you to stream the internal system logs of any connected device or emulator directly to your computer terminal.Connect your device: Connect your physical Android phone via USB and ensure USB Debugging is turned on in your phone's Developer Options.Clear old logs: Open your computer's terminal and clear out stale history so you only see the new crash data:

bash
adb logcat -c

Stream error logs: Run the following command to filter and display only critical runtime errors:

bash
adb logcat *:E

Use code with caution.Trigger the crash: Open your APK app on the phone and make it crash.

Analyze the output: Look for tags like AndroidRuntime, unknown, ReactNative, or SoLoader. The terminal will print a detailed Java stack trace pointing to the exact library or component that failed

## (Removed) Face Recognition Flow

The face recognition + face-scanned attendance feature has been removed from VisageRoute.


## Real-Time GPS Flow (Socket.io)

```
Driver swipes START on dashboard
       ↓
Device GPS activated → coordinates every 10 seconds
       ↓
Driver app emits: socket.emit('bus_location_update', { busID, lat, lng, speed })
       ↓
Server receives → attaches timestamp → broadcasts to parent room
       ↓
Parent app receives → updates OSM map marker smoothly
```

---

## Security Highlights

- **JWT:** 15-min expiry + refresh token rotation
- **Passwords:** bcrypt (saltRounds: 12)
- **Rate Limiting:** express-rate-limit on all endpoints (stricter on /login)
- **Input Validation:** Zod schemas on all API inputs
- **RBAC Middleware:** Role verified on every protected route
- **Face Data:** Only 128-d embeddings stored — no raw images
- **Keys:** All API keys in `.env` — never in client bundle
- **OWASP:** NoSQL injection prevention via Mongoose strict casting

---

## Getting Started

```bash
# Clone repo
git clone https://github.com/your-username/visageroute.git

# Backend setup
cd backend
npm install
cp .env.example .env        # fill in your keys
npm run dev

# Frontend setup
cd frontend
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_BASE_URL
npx expo start
```

> **Note:** the camera / face-scan features use native modules and **cannot run in Expo Go**.
> Use `npx expo start` only for the non-camera screens, or build a real APK (see below).

---

## Building a Shareable Android APK

This produces a **standalone release APK** (`app-release.apk`) that runs on its own — no
Metro / dev server needed — so you can send it to anyone with an Android phone.

### Prerequisites (one-time)

| Requirement | Notes |
|-------------|-------|
| **JDK 17** + **Android SDK** | Install via Android Studio |
| **`frontend/google-services.json`** | Firebase Console → your project → Add app → **Android**, package **`com.visageroute.app`**, download, place in `frontend/` |
| **`expo-build-properties`** | Already in `package.json`; run `npx expo install` if node_modules is fresh |

> Minimum Android version is **8.0 (minSdk 26)** — required by the face-detection library.

### Step 1 — Point the app at your backend (IMPORTANT)

The backend URL is **baked into the APK at build time** from `frontend/.env`. Anyone you
share the APK with must be able to reach this URL, so a **public HTTPS URL is recommended**
(a `localhost`/LAN IP only works on the same WiFi as your dev machine).

```bash
# frontend/.env
EXPO_PUBLIC_API_BASE_URL=https://your-public-backend.com   # http:// also works (cleartext is enabled)
```

If `.env` is missing, the app falls back to the LAN IP hardcoded in `src/config/api.js`.

### Step 2 — Build the APK

```bash
cd frontend

# (first time, or after changing native deps / app.json)
npx expo prebuild -p android --clean

# compile the standalone release APK
cd android
./gradlew assembleRelease
```

### Step 3 — Grab & share

```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

Send that file (Drive, WhatsApp, etc.). The installer must enable "Install from unknown
sources". **Change the backend URL?** Re-run Step 1 + Step 2.

### Notes

- **Signing:** the release APK is signed with the **debug keystore** (fine for testing/sharing,
  not the Play Store). For testers to install *updates* over an old build, generate one release
  keystore and reuse it.
- **Size:** ~168 MB — it bundles all CPU architectures + the TFLite model. To shrink, use ABI
  splits or an `.aab` app bundle.
- **Camera stack:** VisionCamera **v4** + `react-native-vision-camera-face-detector` +
  `vision-camera-resize-plugin` v3 (required for React Native 0.83).

---

## Development Timeline

| Phase | Month | Focus |
|-------|-------|-------|
| Foundation | Month 1 | Auth, security baseline, UI setup |
| Core Modules | Month 2 | Admin CRUD, driver APIs, validation, rate limiting |
| Real-time & AI | Month 3 | GPS tracking, face recognition, FCM, security audit |

---

*Developed by Zainab Mustafvi — Session 2022–2026*

