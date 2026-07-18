# TODO

## Auth + Driver Tracking Fixes (Backend)
- [x] Inspect `backend/controllers/driverController.js` and confirm all `req.user.userId` usages.
- [x] Update `backend/controllers/driverController.js`: replace `req.user.userId` with `req.user.id` everywhere.
- [x] Update `backend/middleware/authMiddleware.js` per spec (token extraction cleanly from cookie or `Authorization: Bearer`).

- [ ] Verify `locationController`/trip/start/stop flows rely on the corrected request user id.
- [ ] Run backend tests / start server to validate protected endpoints.

