import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { io } from 'socket.io-client';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';
import { globalStyles } from '../theme/globalStyles';

// ⚠️ Update to your machine's IP on the same Wi-Fi network
const SOCKET_URL = 'http://192.168.0.106:5000';

// Placeholder: In production, fetch the child's assigned routeId from the API
const CHILD_ROUTE_ID = '000000000000000000000001';

const ParentHome = ({ navigation }) => {
    const [driverLocation, setDriverLocation] = useState(null);
    const [myLocation, setMyLocation] = useState(null);
    const [eta, setEta] = useState(null);
    const [tripStatus, setTripStatus] = useState('Waiting for driver to start trip...');
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const mapRef = useRef(null);

    const handleLogout = async () => {
        if (socketRef.current) socketRef.current.disconnect();
        await SecureStore.deleteItemAsync('userRole');
        navigation.replace('Login');
    };

    useEffect(() => {
        let socket;

        const setupTracking = async () => {
            // 1. Request location permission to show parent's own position
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setMyLocation({
                    lat: loc.coords.latitude,
                    lng: loc.coords.longitude,
                });
            }

            // 2. Connect to socket with stored JWT
            const token = await SecureStore.getItemAsync('socketToken');
            if (!token) {
                Alert.alert('Session Error', 'Please log in again.');
                navigation.replace('Login');
                return;
            }

            socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket'],
            });

            socket.on('connect', () => {
                console.log('[Parent Socket] Connected:', socket.id);
                setConnected(true);
                // Join route room to receive driver's location updates
                socket.emit('joinRouteRoom', CHILD_ROUTE_ID);
            });

            socket.on('connect_error', (err) => {
                console.error('[Parent Socket] Error:', err.message);
                setTripStatus('⚠️ Could not connect to server. Check your network.');
            });

            // 3. Listen for live location updates from the driver
            socket.on('locationUpdate', ({ driverLocation: loc, eta: etaMin }) => {
                setDriverLocation(loc);
                setEta(etaMin);
                setTripStatus('🚌 Bus is on the way!');

                // Auto-animate map to fit both markers
                if (mapRef.current && myLocation) {
                    mapRef.current.fitToCoordinates(
                        [
                            { latitude: loc.lat, longitude: loc.lng },
                            { latitude: myLocation.lat, longitude: myLocation.lng },
                        ],
                        { edgePadding: { top: 80, right: 60, bottom: 80, left: 60 }, animated: true }
                    );
                }
            });

            // 4. Listen for trip completion
            socket.on('tripEnded', ({ message }) => {
                setTripStatus(`✅ ${message}`);
                setEta(null);
            });

            socketRef.current = socket;
        };

        setupTracking();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const defaultRegion = {
        latitude: myLocation?.lat || 24.8607,
        longitude: myLocation?.lng || 67.0011,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="child-care" size={28} color={Theme.colors.brandGrey} />
                    <Text style={styles.headerTitle}>Track Your Child</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <MaterialIcons name="logout" size={20} color={Theme.colors.brandGrey} />
                </TouchableOpacity>
            </View>

            {/* Status Bar */}
            <View style={[styles.statusBar, driverLocation && styles.statusBarActive]}>
                <View style={[styles.statusDot, connected && styles.statusDotConnected]} />
                <Text style={styles.statusText}>{tripStatus}</Text>
                {eta !== null && (
                    <View style={styles.etaBadge}>
                        <MaterialIcons name="schedule" size={14} color={Theme.colors.brandGrey} />
                        <Text style={styles.etaText}> ETA: ~{eta} min</Text>
                    </View>
                )}
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                {Platform.OS === 'web' ? (
                    <View style={styles.mapPlaceholder}>
                        <MaterialIcons name="map" size={48} color={Theme.colors.textSecondaryLight} />
                        <Text style={styles.overlayText}>Live Map is only available on Android/iOS devices.</Text>
                        <Text style={[styles.overlayText, { fontSize: 12 }]}>Open VisageRoute in Expo Go to see the live tracking.</Text>
                    </View>
                ) : (
                    <>
                        <MapView
                            ref={mapRef}
                            style={StyleSheet.absoluteFillObject}
                            provider={PROVIDER_DEFAULT}
                            initialRegion={defaultRegion}
                            showsUserLocation={false}
                            showsMyLocationButton={false}
                        >
                            {/* Driver / Bus Marker */}
                            {driverLocation && (
                                <Marker
                                    coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }}
                                    title="Bus Location"
                                    description={`ETA: ~${eta} minutes`}
                                >
                                    <View style={styles.busMarker}>
                                        <MaterialIcons name="directions-bus" size={20} color={Theme.colors.brandGrey} />
                                    </View>
                                </Marker>
                            )}

                            {/* Parent / Home Marker */}
                            {myLocation && (
                                <Marker
                                    coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }}
                                    title="Your Location"
                                >
                                    <View style={styles.homeMarker}>
                                        <MaterialIcons name="home" size={20} color="white" />
                                    </View>
                                </Marker>
                            )}
                        </MapView>

                        {/* Overlay when no driver yet */}
                        {!driverLocation && (
                            <View style={styles.mapOverlay}>
                                <ActivityIndicator size="large" color={Theme.colors.primary} />
                                <Text style={styles.overlayText}>Waiting for live bus location...</Text>
                            </View>
                        )}
                    </>
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
        paddingVertical: 14,
        backgroundColor: Theme.colors.primary,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: Theme.typography.sizes.xl,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    logoutBtn: {
        padding: 8,
        borderRadius: Theme.borderRadius.lg,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Theme.colors.surfaceLight,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.borderLight,
        gap: 8,
        flexWrap: 'wrap',
    },
    statusBarActive: {
        backgroundColor: 'rgba(242, 204, 13, 0.1)',
        borderBottomColor: Theme.colors.primary,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#d1d5db',
    },
    statusDotConnected: {
        backgroundColor: '#22c55e',
    },
    statusText: {
        flex: 1,
        fontSize: Theme.typography.sizes.sm,
        fontWeight: '600',
        color: Theme.colors.brandGrey,
    },
    etaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: Theme.borderRadius.full,
    },
    etaText: {
        fontSize: Theme.typography.sizes.sm,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    mapContainer: {
        flex: 1,
    },
    busMarker: {
        backgroundColor: Theme.colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: Theme.colors.brandGrey,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    homeMarker: {
        backgroundColor: '#3b82f6',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(248, 248, 245, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: Theme.colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 12,
    },
    overlayText: {
        fontSize: Theme.typography.sizes.base,
        color: Theme.colors.textSecondaryLight,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default ParentHome;
