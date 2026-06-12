const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin (keys from .env — never hardcode)
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase Admin initialization failed:', error.message);
    }
  } else {
    console.warn('Firebase Admin credentials not fully provided in .env. Push notifications will be skipped.');
  }
}

// Core send function
const sendNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return;
  if (!admin.apps.length) {
    console.log('[FCM Bypass] Firebase Admin not initialized. Skipping notification:', title);
    return;
  }
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: { ...data, type: data.type || 'general' },
      android: {
        priority: data.priority === 'urgent' ? 'high' : 'normal',
        notification: { sound: 'default' },
      },
      apns: {
        payload: { aps: { sound: 'default' } },
      },
    });
    console.log(`FCM notification sent successfully to token: ${fcmToken.substring(0, 10)}...`);
  } catch (error) {
    // Token may be stale — remove it from DB
    if (error.code === 'messaging/registration-token-not-registered' || 
        error.message?.includes('registration-token-not-registered') ||
        error.code === 'messaging/invalid-argument') {
      console.log(`FCM token stale. Removing from database: ${fcmToken.substring(0, 10)}...`);
      await User.findOneAndUpdate(
        { fcmToken },
        { $set: { fcmToken: null } }
      );
    }
    console.error('FCM send error:', error.message);
  }
};

// Send to multiple parents at once
const sendToMultiple = async (fcmTokens, title, body, data = {}) => {
  const validTokens = fcmTokens.filter(Boolean);
  if (!validTokens.length) return;
  const promises = validTokens.map(token => 
    sendNotification(token, title, body, data)
  );
  await Promise.allSettled(promises);
};

module.exports = { sendNotification, sendToMultiple };
