import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import ParentHome from './src/screens/ParentHome';
import AdminNavigator from './src/navigation/AdminNavigator';
import DriverNavigator from './src/navigation/DriverNavigator';
import AdminRegisterBus from './src/screens/AdminRegisterBus';
import AdminRegisterStudent from './src/screens/AdminRegisterStudent';
import AdminRegisterDriver from './src/screens/AdminRegisterDriver';
import AdminUploadSchedule from './src/screens/AdminUploadSchedule';
import AdminBusDetail from './src/screens/AdminBusDetail';
import AdminStudentDetail from './src/screens/AdminStudentDetail';
import AdminDriverDetail from './src/screens/AdminDriverDetail';

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
          <Stack.Screen name="AdminHome" component={AdminNavigator} />
          <Stack.Screen name="RegisterBus" component={AdminRegisterBus} />
          <Stack.Screen name="RegisterStudent" component={AdminRegisterStudent} />
          <Stack.Screen name="RegisterDriver" component={AdminRegisterDriver} />
          <Stack.Screen name="UploadSchedule" component={AdminUploadSchedule} />
          <Stack.Screen name="AdminBusDetail" component={AdminBusDetail} />
          <Stack.Screen name="AdminStudentDetail" component={AdminStudentDetail} />
          <Stack.Screen name="AdminDriverDetail" component={AdminDriverDetail} />
          <Stack.Screen name="DriverHome" component={DriverNavigator} />
          <Stack.Screen name="ParentHome" component={ParentHome} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
