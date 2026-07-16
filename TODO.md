# VisageRoute Face + Attendance Removal - TODO

- [x] Inspect face + attendance touchpoints (backend controller/routes, Student schema, frontend attendance screen, driver navigator).
- [x] Remove backend `/api/attendance` mounting in `backend/server.js`.
- [x] Remove `faceEmbedding` from `backend/models/Student.js`.
- [x] Remove Attendance tab/screen wiring in `frontend/src/navigation/DriverNavigator.js`.
- [x] Remove attendance + face files that are now unused (frontend `DriverAttendance.js`, backend attendance controller/routes/faceService).


- [ ] Remove unused dependencies from `backend/package.json` and `frontend/package.json`.
- [ ] Run `npm install` in both backend and frontend to refresh lockfiles.
- [ ] Run backend start (smoke) and frontend typecheck/compile (Expo).

