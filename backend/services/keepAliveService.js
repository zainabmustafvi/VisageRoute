const axios = require('axios');

/**
 * Automated Keep-Alive / Self-Ping Service
 * Prevents Render Free Tier web services from sleeping after 15 minutes of inactivity.
 *
 * @param {number} intervalMinutes - Interval between pings in minutes (default: 14)
 */
const startKeepAlive = (intervalMinutes = 14) => {
  const targetUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  const isEnabled = process.env.KEEP_ALIVE_ENABLED !== 'false';

  if (!isEnabled) {
    console.log('[Keep-Alive] Disabled via KEEP_ALIVE_ENABLED=false');
    return;
  }

  if (!targetUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Keep-Alive] Warning: No target URL set (KEEP_ALIVE_URL, RENDER_EXTERNAL_URL, or BACKEND_URL). Keep-alive ping is idle.');
    } else {
      console.log('[Keep-Alive] Local development detected; keep-alive self-ping is idle.');
    }
    return;
  }

  const cleanUrl = targetUrl.replace(/\/+$/, '');
  const healthEndpoint = `${cleanUrl}/health`;
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;

  console.log(`[Keep-Alive] Initialized. Pinging ${healthEndpoint} every ${intervalMinutes} minutes.`);

  const ping = async () => {
    try {
      const startTime = Date.now();
      const response = await axios.get(healthEndpoint, {
        timeout: 10000,
        headers: { 'User-Agent': 'VisageRoute-KeepAlive/1.0' }
      });
      const latency = Date.now() - startTime;
      console.log(`[Keep-Alive] Ping successful [${response.status}] - Latency: ${latency}ms - Time: ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`[Keep-Alive] Ping failed: ${error.message}`);
    }
  };

  // Schedule regular interval pings
  const timer = setInterval(ping, intervalMs);

  // Unref timer so it doesn't prevent graceful process shutdown
  if (timer.unref) {
    timer.unref();
  }
};

module.exports = { startKeepAlive };
