Class-Based Database Schema (MongoDB)
Based on your Class Diagram, the following schema structure must be implemented in your Node.js backend using Mongoose.

User Collection (Base Class)
Fields: userID (PK), name, email, phone, passwordHash, role (Admin/Driver/Parent), isActive.

Logic: Role-Based Access Control (RBAC) starts here.

Student Collection
Fields: studentID (PK), parentID (FK), grade, rollNumber, pickupPoint, dropPoint, faceEmbedding (Stored as 128-d Array).

Bus & Route Collection
Bus: busID (PK), busNumber, capacity, licensePlate, status.

Route: routeID (PK), routeName, startPoint, endPoint, stops (JSON Array), estimatedDuration.

Live Location Collection
Fields: locationID (PK), busID (FK), latitude, longitude, speed, timestamp.

Constraint: This collection is highly volatile and requires high-speed writes/reads.

Attendance & Logging Collection
Fields: attendanceID (PK), studentID (FK), busID (FK), driverID (FK), boardingTime, status, verificationMethod.