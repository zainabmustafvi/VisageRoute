Architecture: Hybrid Server-Side (MERN Mobile Flavor)

Mobile Frontend: React Native (Expo)

Library: react-native-maps (with OSM tiles), socket.io-client.

Backend Server: Node.js (Express)

Communication: Socket.io for real-time bidirectional GPS data.

Logic: Processing attendance matches and ETA math.

Database: MongoDB Atlas (M0 Free Tier)

Storage: JSON-based student records, logs, and biometric hashes.

Face Intelligence: Google ML Kit (via react-native-vision-camera).

Processing: Face detection happens on the phone; verification happens on the Node.js server.