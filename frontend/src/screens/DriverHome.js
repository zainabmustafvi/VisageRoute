import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { io } from 'socket.io-client';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';
import { globalStyles } from '../theme/globalStyles';

// ⚠️ Update to your machine's IP on the same Wi-Fi network
const SOCKET_URL = 'http://192.168.0.105:5000';

// Placeholder route ID — in production this comes from the driver's profile API
const DRIVER_ROUTE_ID = '000000000000000000000001';

const DriverHome = ({ navigation }) => {
    const [tripActive, setTripActive] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [statusMsg, setStatusMsg] = useState('Ready to start trip.');
    const [connecting, setConnecting] = useState(false);

    const socketRef = useRef(null);
    const locationWatcherRef = useRef(null);

    const handleLogout = async () => {
        if (tripActive) await stopTrip();
        await SecureStore.deleteItemAsync('userRole');
        navigation.replace('Login');
    };

    const connectSocket = async () => {
        setConnecting(true);
        // Retrieve the stored JWT token
        const token = await SecureStore.getItemAsync('socketToken');
        if (!token) {
            Alert.alert('Session Error', 'Please log in again.');
            navigation.replace('Login');
            return;
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('[Driver Socket] Connected:', socket.id);
            socket.emit('joinRouteRoom', DRIVER_ROUTE_ID);
            setConnecting(false);
        });

        socket.on('connect_error', (err) => {
            console.error('[Driver Socket] Connection error:', err.message);
            setStatusMsg('⚠️ Could not connect to server. Check network.');
            setConnecting(false);
        });

        socket.on('tripEnded', () => setStatusMsg('Trip completed and broadcast to parents.'));

        socketRef.current = socket;
    };

    const startTrip = async () => {
        // 1. Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location access is required to track the trip.');
            return;
        }

        await connectSocket();
        setTripActive(true);
        setStatusMsg('📍 Trip active — broadcasting location...');

        // 2. Watch location and emit to server every ~4 seconds
        locationWatcherRef.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 4000,
                distanceInterval: 10, // meters
            },
            (loc) => {
                const { latitude, longitude } = loc.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                if (socketRef.current?.connected) {
                    socketRef.current.emit('updateLocation', {
                        lat: latitude,
                        lng: longitude,
                        routeId: DRIVER_ROUTE_ID,
                    });
                }
            }
        );
    };

    const stopTrip = async () => {
        // Stop location watching
        if (locationWatcherRef.current) {
            locationWatcherRef.current.remove();
            locationWatcherRef.current = null;
        }
        // Notify parents trip is over
        if (socketRef.current?.connected) {
            socketRef.current.emit('endTrip', { routeId: DRIVER_ROUTE_ID });
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setTripActive(false);
        setCurrentLocation(null);
        setStatusMsg('Trip ended successfully.');
    };

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (locationWatcherRef.current) locationWatcherRef.current.remove();
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="directions-bus" size={28} color={Theme.colors.brandGrey} />
                    <Text style={styles.headerTitle}>Driver Portal</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <MaterialIcons name="logout" size={20} color={Theme.colors.textSecondaryLight} />
                </TouchableOpacity>
            </View>

            {/* Status Card */}
            <View style={[styles.card, tripActive && styles.cardActive]}>
                <View style={[styles.statusDot, tripActive && styles.statusDotActive]} />
                <Text style={styles.statusLabel}>{tripActive ? 'TRIP IN PROGRESS' : 'OFF DUTY'}</Text>
                <Text style={styles.statusMsg}>{statusMsg}</Text>
                {currentLocation && (
                    <Text style={styles.coordsText}>
                        📍 {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                    </Text>
                )}
            </View>

            {/* Route Info */}
            <View style={styles.card}>
                <Text style={styles.sectionLabel}>ASSIGNED ROUTE</Text>
                <View style={globalStyles.row}>
                    <MaterialIcons name="route" size={20} color={Theme.colors.primary} />
                    <Text style={styles.routeText}>  Route #{DRIVER_ROUTE_ID.slice(-4)}</Text>
                </View>
            </View>

            {/* Trip Controls */}
            <View style={styles.controlsContainer}>
                {connecting ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                ) : tripActive ? (
                    <TouchableOpacity style={styles.stopButton} onPress={stopTrip}>
                        <MaterialIcons name="stop-circle" size={24} color="white" />
                        <Text style={styles.stopButtonText}>End Trip</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.startButton} onPress={startTrip}>
                        <MaterialIcons name="play-circle-filled" size={24} color={Theme.colors.brandGrey} />
                        <Text style={styles.startButtonText}>Start Trip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: Theme.colors.primary,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: Theme.typography.sizes['2xl'],
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    logoutBtn: {
        padding: 8,
        borderRadius: Theme.borderRadius.lg,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    card: {
        margin: 16,
        padding: 20,
        backgroundColor: Theme.colors.surfaceLight,
        borderRadius: Theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardActive: {
        borderColor: Theme.colors.primary,
        backgroundColor: 'rgba(242, 204, 13, 0.08)',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Theme.colors.borderLight,
        marginBottom: 8,
    },
    statusDotActive: {
        backgroundColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 3,
    },
    statusLabel: {
        fontSize: Theme.typography.sizes.xs,
        fontWeight: 'bold',
        color: Theme.colors.textSecondaryLight,
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    statusMsg: {
        fontSize: Theme.typography.sizes.base,
        color: Theme.colors.brandGrey,
        fontWeight: '500',
    },
    coordsText: {
        marginTop: 8,
        fontSize: Theme.typography.sizes.sm,
        color: Theme.colors.textSecondaryLight,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    sectionLabel: {
        fontSize: Theme.typography.sizes.xs,
        fontWeight: 'bold',
        color: Theme.colors.textSecondaryLight,
        letterSpacing: 1.5,
        marginBottom: 10,
    },
    routeText: {
        fontSize: Theme.typography.sizes.base,
        fontWeight: '600',
        color: Theme.colors.brandGrey,
    },
    controlsContainer: {
        margin: 16,
        alignItems: 'center',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: Theme.borderRadius.xl,
        gap: 10,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    startButtonText: {
        fontSize: Theme.typography.sizes.lg,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    stopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: Theme.borderRadius.xl,
        gap: 10,
    },
    stopButtonText: {
        fontSize: Theme.typography.sizes.lg,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default DriverHome;
