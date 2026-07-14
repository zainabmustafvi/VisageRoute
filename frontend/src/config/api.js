// Base URL of the VisageRoute backend.
//
// Configurable at build time via the EXPO_PUBLIC_API_BASE_URL environment
// variable (Expo inlines EXPO_PUBLIC_* vars into the bundle). Accepts either an
// http:// or https:// URL — cleartext http is permitted in release builds via
// the expo-build-properties `usesCleartextTraffic` setting in app.json.
//
// Set it in a `.env` file at the frontend root (see .env.example), e.g.:
//   EXPO_PUBLIC_API_BASE_URL=https://api.your-domain.com
//
// Falls back to the local dev-machine LAN IP when the env var is not set.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.0.106:5000';
