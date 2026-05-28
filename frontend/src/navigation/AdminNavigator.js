import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminBusCRUD from '../screens/AdminBusCRUD';
import AdminStudentCRUD from '../screens/AdminStudentCRUD';
import AdminDriverCRUD from '../screens/AdminDriverCRUD';
import AdminAnnouncementScreen from '../screens/AdminAnnouncementScreen';
import { colors } from '../theme/Theme';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Buses') {
                        iconName = focused ? 'bus' : 'bus-side';
                    } else if (route.name === 'Students') {
                        iconName = focused ? 'account-group' : 'account-group-outline';
                    } else if (route.name === 'Drivers') {
                        iconName = focused ? 'badge-account' : 'badge-account-outline';
                    } else if (route.name === 'Alerts') {
                        iconName = focused ? 'bullhorn' : 'bullhorn-outline';
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                },
            })}
        >
            <Tab.Screen name="Home" component={AdminHomeScreen} />
            <Tab.Screen name="Buses" component={AdminBusCRUD} />
            <Tab.Screen name="Students" component={AdminStudentCRUD} />
            <Tab.Screen name="Drivers" component={AdminDriverCRUD} />
            <Tab.Screen name="Alerts" component={AdminAnnouncementScreen} />
        </Tab.Navigator>
    );
};

export default AdminNavigator;
