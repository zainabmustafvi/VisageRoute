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

The "Three-Step" Integration Logic
In a Native App, face recognition isn't one single block; it’s a relay race between three parts:

Step A: The Camera (The Eyes)
You will use a library called react-native-vision-camera. It gives you access to the phone's camera at a high frame rate.

Step B: The Detector (The Brain - Local)
Attached to that camera is a Frame Processor using Google ML Kit.

What it does: It looks at the video and says, "Hey, I found a face at these coordinates!"

The Result: It gives you a "Bounding Box" (a square around the face).

Step C: The Recognizer (The Identity - Hybrid)
This is where you "identify" the student.

The app crops the image inside that Bounding Box.

It runs a small math model (TensorFlow Lite) to turn that face into a 128-digit array (the "Face Embedding").

The Integration: Your app sends those 128 numbers to your Node.js Server. The server checks its MongoDB database: "Does this set of numbers match Student ID 502?"

2. How to "Add" it to your React Native Code
You don't write complex C++ math. You install specific "wrappers" that handle the heavy lifting.

The "Stack" you need to install:
react-native-vision-camera: The high-performance camera engine.
vision-camera-face-detector: A plugin that connects Google ML Kit to the camera.
react-native-quick-tflite: To run the "Face Embedding" model (like MobileFaceNet) on the phone.

The Real-Time Data Flow (The "Happy Path")
The flow follows a Publisher-Subscriber (Pub/Sub) pattern facilitated by the Node.js server.

Emit (Driver): Every 3–5 seconds, the Driver's app captures the navigator.geolocation coordinates and emits a bus_location_update event via Socket.io to the Node.js server.
Process (Server): The server receives the coordinates, attaches a timestamp, and performs a "Room Broadcast." It identifies which parents are interested in "Bus #5" and sends the data only to them.
Listen (Parent): The Parent's app receives the event and updates the state of the React Native MapView, moving the bus icon smoothly without a page refresh.

Component,Technology,Role
User Interface,React Native,Admin/Parent/Driver Screens
Live Tracking,Socket.io,Stream GPS from Driver → Server → Parent
AI Matching,Node.js + MongoDB,Receive face-vector → Match → Log Attendance
Persistence,MongoDB,Save Trip Logs and Student history
Security,JWT + .env,Ensure only authorized parents see their own children

