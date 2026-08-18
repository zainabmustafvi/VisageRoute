import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DriverHome from '../screens/DriverHome';
import DriverProfile from '../screens/DriverProfile';
import DriverRoute from '../screens/DriverRoute';
import Theme from '../theme/Theme';

const Tab = createBottomTabNavigator();

const DriverNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'account' : 'account-outline';
                    } else if (route.name === 'Route & Bus') {
                        iconName = focused ? 'bus-clock' : 'bus-clock';
                    }

                    return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
                },
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    height: 80,
                    paddingBottom: 20,
                    paddingTop: 10,
                    backgroundColor: Theme.colors.surfaceLight,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.borderLight,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                },
            })}
        >
            <Tab.Screen name="Home" component={DriverHome} />
            <Tab.Screen name="Profile" component={DriverProfile} />
            <Tab.Screen name="Route & Bus" component={DriverRoute} />
        </Tab.Navigator>
    );
};

export default DriverNavigator;
