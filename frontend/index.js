import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// Register the FCM background/quit-state handler at module scope (a
// react-native-firebase requirement — it cannot live inside a component).
// Guarded off web, where the native module is unavailable.
// Notification-type payloads are displayed by the OS automatically; this
// handler exists so data-only messages are processed without a runtime warning.
if (Platform.OS !== 'web') {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async () => {
    // No-op: OS handles display of notification payloads.
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
