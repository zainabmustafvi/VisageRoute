import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';
import { globalStyles } from '../theme/globalStyles';

const DriverHome = ({ navigation }) => {
    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userRole');
        navigation.replace('Login');
    };

    return (
        <View style={[globalStyles.container, globalStyles.centerContent]}>
            <Text style={globalStyles.h1}>Driver Portal</Text>
            <Text style={[globalStyles.p, { marginVertical: Theme.spacing.md }]}>Welcome, Driver. Your route awaits.</Text>

            <TouchableOpacity style={[globalStyles.primaryButton, { paddingHorizontal: 32 }]} onPress={handleLogout}>
                <Text style={globalStyles.primaryButtonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

export default DriverHome;
