Project Name: VisageRoute

Goal: Build a 3-module mobile ecosystem for secure student transit management.It is a Role based login for parent, driver and admin, with their specific Use-id , radio button selection of role and password.

1. Admin Module (Mobile-Integrated)
User Management: Create, Read, Update, Delete (CRUD) students, drivers, and bus profiles.

Fleet Assignment: Link specific students and one driver to a designated bus route.

Scheduling: Define and update bus departure/arrival timings.

Broadcast System: Send push notifications (alerts/emergencies) to all parents or specific routes.

2. Driver Module
Route Visibility: View assigned route and passenger list.

Live Tracking: Emit GPS coordinates via Socket.io to the backend when a trip is started.

AI Attendance: Use on-device camera to detect faces, generate embeddings, and send them to the Node.js server for attendance logging.

3. Parent Module
Real-time Map: Observe the bus location live on an OpenStreetMap interface.

ETA Card: View dynamic arrival time based on server-side distance calculations.

Safety Status: View "On-Board" or "Dropped" status for their specific child.

Notifications: Manage alert preferences for arrival and emergency pings.

Security: 
"Act as a Senior Security Engineer. Harden the VisageRoute codebase by implementing the following:

Rate Limiting: Apply express-rate-limit on all public API endpoints (IP + User-based). Ensure graceful 429 error responses.

Input Validation: Use Joi or Zod for strict schema-based validation. Reject unexpected fields, enforce type checks, and set length limits on all inputs (especially student/bus registration).

Secure API Key Handling: Move all Firebase, MongoDB, and Map keys to .env files. Ensure no sensitive keys are hard-coded or exposed in the React Native client-side bundle.

Authentication: Implement JWT with short expiration and secure HTTP-only cookie/header storage.

OWASP Compliance: Follow best practices for preventing Injection and Broken Access Control. Include clear comments explaining the security logic."

Component,Technology,Role
User Interface,React Native,Admin/Parent/Driver Screens
Live Tracking,Socket.io,Stream GPS from Driver → Server → Parent
AI Matching,Node.js + MongoDB,Receive face-vector → Match → Log Attendance
Persistence,MongoDB,Save Trip Logs and Student history
Security,JWT + .env,Ensure only authorized parents see their own children