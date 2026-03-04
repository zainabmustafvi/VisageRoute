import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import AdminHome from './src/screens/AdminHome';
import DriverHome from './src/screens/DriverHome';
import ParentHome from './src/screens/ParentHome';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false, // Hide headers to match Stitch-to-Native design
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />

          {/* Role-Based Protected Routings */}
          <Stack.Screen name="AdminHome" component={AdminHome} />
          <Stack.Screen name="DriverHome" component={DriverHome} />
          <Stack.Screen name="ParentHome" component={ParentHome} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
