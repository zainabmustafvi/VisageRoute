# VisageRoute — Tech Stack
**Architecture:** Hybrid Server-Side (MERN Mobile Flavor)

---

## Frontend — React Native (Expo)

| Package | Version | Purpose |
|---------|---------|---------|
| react-native | latest | Core mobile framework |
| expo | latest | Development platform |
| react-native-maps | latest | Map rendering |
| react-native-vision-camera | v3+ | High-performance camera for face scanning |
| vision-camera-face-detector | latest | Google ML Kit face detection plugin |
| react-native-quick-tflite | latest | TFLite runtime (MobileFaceNet face embeddings) |
| socket.io-client | latest | Real-time GPS event listener |
| @react-native-async-storage/async-storage | latest | Local token/cache storage |
| axios | latest | HTTP API calls |
| expo-location | latest | GPS coordinates (driver) |
| expo-notifications | latest | Local notification handling |

### Map Configuration (OpenStreetMap — No API Key Required)
```jsx
import MapView, { UrlTile, Marker, Polyline } from 'react-native-maps';

<MapView
  provider={null}
  mapType="none"
  style={{ flex: 1 }}
  initialRegion={{ ... }}>
  <UrlTile
    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    maximumZ={19}
    flipY={false}
  />
  <Marker coordinate={{ latitude, longitude }} />
  <Polyline coordinates={routeStops} strokeColor="#FFC107" strokeWidth={3} />
</MapView>
```

---

## Backend — Node.js + Express

| Package | Version | Purpose |
|---------|---------|---------|
| express | latest | HTTP server framework |
| mongoose | latest | MongoDB ODM |
| socket.io | latest | Bidirectional real-time GPS streaming |
| jsonwebtoken | latest | JWT issuance and verification |
| bcryptjs | latest | Password hashing (saltRounds: 12) |
| zod | latest | Strict API input validation |
| express-rate-limit | latest | IP + user-based rate limiting |
| firebase-admin | latest | FCM push notifications to parents |
| nodemailer | latest | Email delivery (driver/parent credentials) |
| dotenv | latest | Environment variable management |
| cors | latest | Cross-origin request handling |
| helmet | latest | HTTP security headers |
| multer | latest | CSV file upload handling |
| csv-parse | latest | Parse uploaded schedule CSV |

---

## Database — MongoDB Atlas (M0 Free Tier)

| Collection | Volatility | Notes |
|------------|-----------|-------|
| users | Low | Base auth collection |
| admins | Low | Extends users |
| drivers | Low | Extends users |
| parents | Low | Extends users, stores FCM token |
| students | Low | Stores 128-d face embedding array |
| buses | Low | Fleet data |
| routes | Low | Stop JSON array |
| busrouteassignments | Low | Bus ↔ Route ↔ Schedule |
| schedules | Low | Admin CSV uploads |
| locationtracking | **Very High** | TTL 24h, Socket.io writes every 10s |
| attendance | Medium | One record per student per trip |
| announcements | Low | Admin broadcasts |
| announcementdeliveries | Medium | Per-parent read tracking |

**Critical Index — Location Tracking:**
```js
locationtrackingSchema.index({ busID: 1, timestamp: -1 })
locationtrackingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 })
```

---

## Real-Time Layer — Socket.io

### Flow
```
Driver (Emitter)
  └── socket.emit('bus_location_update', { busID, lat, lng, speed, timestamp })
          ↓
Server (Processor)
  └── Validates JWT from socket handshake
  └── Identifies parent room for busID
  └── io.to(`bus_${busID}`).emit('bus_location_update', payload)
          ↓
Parent (Listener)
  └── socket.on('bus_location_update', (data) => updateMapMarker(data))
```

### Key Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `bus_location_update` | Driver → Server → Parent | `{ busID, lat, lng, speed, timestamp }` |
| `trip_started` | Driver → Server → Parent | `{ busID, driverName }` |
| `trip_ended` | Driver → Server → Parent | `{ busID }` |
| `child_boarded` | Server → Parent | `{ studentName, boardingTime }` |
| `announcement` | Server → Parent | `{ title, content, priority }` |

---

## AI Face Recognition Stack

### Three-Step Pipeline
```
Step A — Camera (react-native-vision-camera)
  └── High frame-rate camera access
  └── Frame Processor API

Step B — Detection (vision-camera-face-detector / Google ML Kit)
  └── Detects face in frame
  └── Returns bounding box coordinates

Step C — Recognition (react-native-quick-tflite / MobileFaceNet)
  └── Crops bounding box region
  └── Runs MobileFaceNet TFLite model on-device
  └── Outputs 128-d float embedding array
  └── Sends embedding to Node.js via HTTPS POST
  └── Server: cosine similarity vs MongoDB embeddings (threshold ≥ 0.6)
```

### Why On-Device Processing?
- Embedding generation (heavy math) stays on phone → no latency
- Only 128 numbers sent to server → minimal bandwidth
- Raw face images never transmitted or stored → privacy by design

---

## Push Notifications — Firebase Cloud Messaging (FCM)

| Trigger | Recipient | Message |
|---------|-----------|---------|
| Child face scanned (boarded) | Parent | "[Name] safely boarded Bus #[X]" |
| Bus approaching pickup | Parent | "Bus #[X] is arriving — please be ready" |
| Trip started by driver | Parent | "Morning route started — Bus #[X] is on the way" |
| Trip ended | Parent | "Bus #[X] route completed" |
| Admin announcement | All/targeted parents | Custom title + body |

- FCM token stored per parent in `parents.fcmToken`
- Respects per-parent `notificationPreferences` toggles
- Admin urgent alerts bypass preferences (always delivered)

---

## Security Stack

| Layer | Tool | Implementation |
|-------|------|----------------|
| Password Hashing | bcryptjs | saltRounds: 12 |
| Authentication | jsonwebtoken | 15-min expiry + refresh rotation |
| Input Validation | zod | `.strict()` schemas on all endpoints |
| Rate Limiting | express-rate-limit | 100/15min general; 10/15min login |
| HTTP Headers | helmet | XSS, HSTS, clickjacking protection |
| NoSQL Injection | Mongoose strict casting | All inputs sanitized before DB ops |
| RBAC | Custom JWT middleware | Role verified on every protected route |
| Key Management | dotenv | All secrets in `.env`, never in bundle |
| Socket Security | JWT handshake check | Unauthenticated sockets rejected |

---

## Development Environment

| Tool | Purpose |
|------|---------|
| Android Studio + VS Code | IDE for React Native development |
| Expo Go | Live device testing |
| MongoDB Compass | Database GUI |
| Postman | API testing |
| draw.io | Diagrams |
| OS: Windows 10 Pro | Development machine |
| RAM: 8GB / Storage: 237GB | System specs |