import { Platform } from 'react-native';

/**
 * VisageRoute API Configuration Manager
 * Provides centralized URL management for switching seamlessly between:
 * - Local Wi-Fi / LAN IP (Physical Device on same Wi-Fi)
 * - Port Forwarding / Public Tunnel (ngrok, VS Code Tunnel, Localtunnel, Cloudflare)
 * - Android Emulator (10.0.2.2 loopback)
 * - iOS Simulator (localhost)
 * - Production / Cloud
 */

// 1. Define preconfigured target endpoints
export const ENVIRONMENTS = {
  // Option A: Public Tunnel / Port Forwarding (Recommended for physical devices over cellular or remote testing)
  // Replace with your active ngrok / VS Code forwarded URL:
  TUNNEL: 'https://your-tunnel-subdomain.ngrok-free.app',

  // Option B: Local LAN IP (For physical devices on the exact same Wi-Fi)
  LOCAL_LAN: 'http://192.168.0.106:5000',

  // Option C: Android Emulator loopback
  EMULATOR_ANDROID: 'http://10.0.2.2:5000',

  // Option D: iOS Simulator
  SIMULATOR_IOS: 'http://localhost:5000',

  // Option E: Production / Cloud deployment
  PRODUCTION: 'https://visageroute-api.onrender.com',
};

// 2. Active Environment Selector
// You can override this dynamically by setting EXPO_PUBLIC_API_BASE_URL in frontend/.env
const SELECTED_ENVIRONMENT = 'LOCAL_LAN'; // Change to 'TUNNEL', 'LOCAL_LAN', 'EMULATOR_ANDROID', etc.

/**
 * Resolve the active API Base URL.
 * Priority:
 * 1. EXPO_PUBLIC_API_BASE_URL (from frontend/.env if defined)
 * 2. SELECTED_ENVIRONMENT preset
 * 3. Platform-aware sensible fallback
 */
export const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/+$/, '');
  }

  if (ENVIRONMENTS[SELECTED_ENVIRONMENT]) {
    return ENVIRONMENTS[SELECTED_ENVIRONMENT].replace(/\/+$/, '');
  }

  // Automatic Fallback for Emulators vs Real devices
  if (Platform.OS === 'android') {
    return ENVIRONMENTS.EMULATOR_ANDROID;
  }
  return ENVIRONMENTS.LOCAL_LAN;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Health check utility to verify backend connectivity and inspect environment metadata
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export default {
  API_BASE_URL,
  ENVIRONMENTS,
  getApiBaseUrl,
  checkApiHealth,
};
