# VisageRoute — MongoDB Database Design
**Stack:** MongoDB Atlas (M0 Free Tier) | Mongoose ODM | Node.js/Express

---

## 1. User Collection (Base — RBAC)

```js
// Collection: users
{
  _id: ObjectId,
  userID: { type: String, unique: true },   // Auto-generated: ADM001 / DR001 / PAR001
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, maxlength: 100 },
  phone: { type: String, maxlength: 20 },
  passwordHash: { type: String, required: true },        // bcrypt hashed
  role: { type: String, enum: ['Admin', 'Driver', 'Parent'], required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Security Notes:**
- Role stored here drives all RBAC middleware checks
- passwordHash uses bcrypt (saltRounds: 12)
- Never return passwordHash in API responses

---

## 2. Admin Collection (extends User)

```js
// Collection: admins
{
  _id: ObjectId,
  userID: { type: String, ref: 'User', required: true },
  department: { type: String, maxlength: 50 },
  permissionLevel: { type: Number, enum: [1, 2, 3], default: 1 }
  // 1 = Standard Admin, 2 = Senior Admin, 3 = Super Admin
}
```

---

## 3. Driver Collection (extends User)

```js
// Collection: drivers
{
  _id: ObjectId,
  userID: { type: String, ref: 'User', required: true },
  licenseNumber: { type: String, unique: true, maxlength: 50 },
  licenseExpiry: { type: Date },
  assignedBusID: { type: ObjectId, ref: 'Bus', default: null },
  rating: { type: Number, default: 0.0 },
  totalTrips: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false }
}
```

---

## 4. Parent Collection (extends User)

```js
// Collection: parents
{
  _id: ObjectId,
  userID: { type: String, ref: 'User', required: true },
  address: { type: String },
  emergencyContact: { type: String, maxlength: 20 },
  notificationPreferences: {
    arrivalNotify: { type: Boolean, default: true },
    startNotify:   { type: Boolean, default: true },
    onboardNotify: { type: Boolean, default: true }
  },
  fcmToken: { type: String, default: null }  // Firebase push token
}
```

---

## 5. Student Collection

```js
// Collection: students
{
  _id: ObjectId,
  studentID: { type: String, unique: true },  // Auto: STU001
  parentID: { type: ObjectId, ref: 'Parent', required: true },
  name: { type: String, required: true, maxlength: 100 },
  grade: { type: String, maxlength: 10 },
  rollNumber: { type: String, unique: true, maxlength: 20 },
  department: { type: String, maxlength: 50 },
  pickupPoint: { type: String, maxlength: 255 },
  dropPoint: { type: String, maxlength: 255 },
  assignedBusID: { type: ObjectId, ref: 'Bus', default: null },
  faceEmbedding: { type: [Number], default: [] },  // 128-d float array (MobileFaceNet)
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

**Face Embedding Notes:**
- Stored as 128-element float array
- Generated on-device via TFLite (MobileFaceNet)
- Never store raw face images — embeddings only
- Cosine similarity threshold for match: >= 0.6

---

## 6. Bus Collection

```js
// Collection: buses
{
  _id: ObjectId,
  busID: { type: String, unique: true },   // Auto: BUS001
  busNumber: { type: String, unique: true, maxlength: 20 },
  licensePlate: { type: String, unique: true, maxlength: 20 },
  capacity: { type: Number, required: true },
  assignedDriverID: { type: ObjectId, ref: 'Driver', default: null },
  status: { type: String, enum: ['available', 'active', 'maintenance'], default: 'available' },
  lastMaintenance: { type: Date, default: null }
}
```

---

## 7. Route Collection

```js
// Collection: routes
{
  _id: ObjectId,
  routeID: { type: String, unique: true },   // Auto: RTE001
  routeName: { type: String, required: true, maxlength: 100 },
  startPoint: { type: String, maxlength: 255 },
  endPoint: { type: String, maxlength: 255 },
  stops: [
    {
      stopNumber: Number,
      locationName: String,
      scheduledTime: String,   // "07:30 AM"
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  ],
  estimatedDuration: { type: Number },   // minutes
  isActive: { type: Boolean, default: true },
  createdBy: { type: ObjectId, ref: 'Admin' }
}
```

---

## 8. Bus Route Assignment Collection

```js
// Collection: busrouteassignments
{
  _id: ObjectId,
  assignmentID: { type: String, unique: true },
  busID: { type: ObjectId, ref: 'Bus', required: true },
  routeID: { type: ObjectId, ref: 'Route', required: true },
  scheduleTime: { type: String },        // "07:30 AM"
  daysOfWeek: { type: [Number] },        // [1,2,3,4,5] Mon–Fri
  isActive: { type: Boolean, default: true },
  createdBy: { type: ObjectId, ref: 'Admin' }
}
```

---

## 9. Schedule Collection (CSV Upload)

```js
// Collection: schedules
{
  _id: ObjectId,
  uploadedBy: { type: ObjectId, ref: 'Admin', required: true },
  fileName: { type: String },              // e.g. "Spring_Semester_2024.csv"
  fileSize: { type: String },              // e.g. "2.4 MB"
  csvData: [
    {
      busNumber: String,                   // matches buses.busNumber
      tripName: String,
      route: String,
      pickupTime: String,                  // "07:30 AM"
      dropTime: String,                    // "03:30 PM"
      daysOfWeek: [Number]                 // [1,2,3,4,5]
    }
  ],
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  uploadedAt: { type: Date, default: Date.now }
}
```

**Sample CSV Format:**
```
Bus Number, Trip Name, Route, Pickup Time, Drop Time, Days of Week
256, Morning Shift, Route A, 07:30 AM, 08:30 AM, "1,2,3,4,5"
102, Staff Shuttle, Route B, 08:00 AM, 09:00 AM, "1,2,3,4,5"
105, Late Evening,  Route C, 06:30 PM, 07:30 PM, "1,2,3,4,5"
```

---

## 10. Live Location Collection ⚡ (High Volatility)

```js
// Collection: locationtracking
// INDEX: { busID: 1, timestamp: -1 }  ← required for fast reads
{
  _id: ObjectId,
  busID: { type: ObjectId, ref: 'Bus', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speed: { type: Number, default: 0 },
  accuracy: { type: Number },
  timestamp: { type: Date, default: Date.now }
}
```

**Performance Notes:**
- Emit via Socket.io every 10 seconds from driver device
- Index on `{ busID, timestamp }` for fast parent queries
- TTL index: auto-delete records older than 24 hours
  ```js
  locationtrackingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 })
  ```
- Never store more than rolling 24-hour history

---

## 11. Attendance Collection

```js
// Collection: attendance
{
  _id: ObjectId,
  attendanceID: { type: String, unique: true },
  studentID: { type: ObjectId, ref: 'Student', required: true },
  busID: { type: ObjectId, ref: 'Bus', required: true },
  driverID: { type: ObjectId, ref: 'Driver', required: true },
  date: { type: Date, required: true },
  boardingTime: { type: Date },
  alightingTime: { type: Date, default: null },
  status: { type: String, enum: ['boarded', 'alighted', 'absent'], default: 'boarded' },
  verificationMethod: { type: String, enum: ['face', 'manual'], default: 'face' },
  latitude: { type: Number },     // location when scanned
  longitude: { type: Number }
}
```

**Constraint:** One record per student per trip per day (enforced via unique compound index):
```js
attendanceSchema.index({ studentID: 1, busID: 1, date: 1 }, { unique: true })
```

---

## 12. Announcement Collection

```js
// Collection: announcements
{
  _id: ObjectId,
  announcementID: { type: String, unique: true },
  adminID: { type: ObjectId, ref: 'Admin', required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  recipients: {
    type: { type: String, enum: ['all', 'route', 'bus'] },
    targetID: { type: String, default: null }  // routeID or busID if targeted
  },
  priority: { type: String, enum: ['urgent', 'general'], default: 'general' },
  sentAt: { type: Date, default: Date.now },
  isSent: { type: Boolean, default: false }
}
```

---

## 13. Announcement Delivery Collection

```js
// Collection: announcementdeliveries
{
  _id: ObjectId,
  announcementID: { type: ObjectId, ref: 'Announcement', required: true },
  userID: { type: ObjectId, ref: 'User', required: true },
  deliveredAt: { type: Date, default: Date.now },
  readAt: { type: Date, default: null }
}
```

**Unread Count Query:**
```js
AnnouncementDelivery.countDocuments({ userID: parentId, readAt: null })
```

---

## Indexes Summary

```js
// Performance-critical indexes
users:                    { email: 1 }           unique
students:                 { parentID: 1 }
students:                 { assignedBusID: 1 }
attendance:               { studentID: 1, busID: 1, date: 1 }   unique
locationtracking:         { busID: 1, timestamp: -1 }
locationtracking:         { timestamp: 1 }       TTL 86400s
announcementdeliveries:   { userID: 1, readAt: 1 }
busrouteassignments:      { busID: 1, isActive: 1 }
```

---

## Collection Relationships

```
User (base)
 ├── Admin      → creates → Announcements
 ├── Driver     → assigned to → Bus → assigned to → Route
 └── Parent     → has → Student → assigned to → Bus

Bus → emits → LocationTracking (via Socket.io)
Driver → marks → Attendance (via Face Recognition)
Attendance → triggers → FCM Notification → Parent
Admin → uploads → Schedule (CSV)
Admin → sends → Announcement → AnnouncementDelivery → Parent
```