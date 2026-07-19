import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, ActivityIndicator, Dimensions, Animated, PanResponder
} from 'react-native';
import axios from 'axios';
import LeafletMap from '../components/LeafletMap';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as Battery from 'expo-battery';
import NetInfo from '@react-native-community/netinfo';
import { io } from 'socket.io-client';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 48;
const BUTTON_SIZE = 104;
const SWIPE_RANGE = SLIDER_WIDTH - BUTTON_SIZE - 8;

import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL;
const DRIVER_ROUTE_ID_DEFAULT = '000000000000000000000001';

const DriverHome = ({ navigation }) => {
    const [tripActive, setTripActive] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [driverData, setDriverData] = useState({ name: 'Loading...', busNumber: '...', isOnline: false });
    const [loading, setLoading] = useState(true);
    const [batteryLevel, setBatteryLevel] = useState(1);
    const [isOnline, setIsOnline] = useState(true);
    const [locationHistory, setLocationHistory] = useState([]);
    const [updateInterval, setUpdateInterval] = useState(10000); // 10 seconds default

    const socketRef = useRef(null);
    const locationSubscriptionRef = useRef(null);
    const pan = useRef(new Animated.Value(0)).current;

    const handleLogout = async () => {
        if (tripActive) await stopTrip();
        await SecureStore.deleteItemAsync('userRole');
        await SecureStore.deleteItemAsync('driverId');
        await SecureStore.deleteItemAsync('assignedBusId');
        navigation.replace('Login');
    };

    const fetchDashboardData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const response = await axios.get(`${API_BASE_URL}/api/driver/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDriverData(response.data);
            setTripActive(response.data.isOnline);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setLoading(false);
        }
    };

    const updateTripStatusOnServer = async (isOnline) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                console.error('Driver token missing. Skipping trip status update to prevent unauthenticated request.');
                return;
            }

            const endpoint = isOnline ? 'start-trip' : 'stop-trip';
            await axios.patch(`${API_BASE_URL}/api/driver/${endpoint}`, {
                busID: driverData.assignedBusId,
                driverID: driverData.driverId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error updating trip status:', error);
        }

    };

    const connectSocket = async () => {
        setConnecting(true);
        const token = await SecureStore.getItemAsync('userToken');
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
            // Join bus room for real-time tracking
            if (driverData.assignedBusId) {
                socket.emit('join_bus_room', { busID: driverData.assignedBusId });
            }
            // Also join legacy route room for backward compatibility
            socket.emit('joinRouteRoom', driverData.routeId || DRIVER_ROUTE_ID_DEFAULT);
            setConnecting(false);
        });

        socket.on('connect_error', (err) => {
            console.error('[Driver Socket] Connection error:', err.message);
            setConnecting(false);
        });

        socketRef.current = socket;
    };

    const startTrip = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location access is required.');
            resetSlider();
            return;
        }

        await connectSocket();
        await updateTripStatusOnServer(true);
        setTripActive(true);

        Alert.alert("Status", "You started location sharing");

        // Start continuous GPS tracking with watchPositionAsync
        startGPSTracking();
    };

    const startGPSTracking = async () => {
        // Remove any existing subscription
        if (locationSubscriptionRef.current) {
            locationSubscriptionRef.current.remove();
        }

        const subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 10000,
                distanceInterval: 10,
            },
            (location) => {
                const { latitude, longitude, speed, accuracy } = location.coords;
                const timestamp = new Date().toISOString();

                if (!driverData.assignedBusId) {
                    console.warn("Skipping location update: assignedBusId is missing");
                    return;
                }

                const locationData = {
                    bus_id: driverData.assignedBusId,
                    latitude,
                    longitude,
                    speed: speed || 0,
                    accuracy: accuracy || 0,
                    timestamp
                };

                setCurrentLocation({ lat: latitude, lng: longitude });

                // Emit via socket to parents in bus room
                if (socketRef.current?.connected) {
                    socketRef.current.emit('bus_location_update', {
                        busID: driverData.assignedBusId,
                        latitude,
                        longitude,
                        speed: speed || 0,
                        timestamp,
                    });
                }

                // Also save to backend via HTTP
                sendLocationToBackend(locationData);
            }
        );

        locationSubscriptionRef.current = subscription;
    };

    const sendLocationToBackend = async (data) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');

            // Safety guard: do not send unauthenticated requests that trigger 401/redirect loops.
            if (!token) {
                console.error("Driver token missing. Skipping /api/location/update to prevent global 401 redirect loop.");
                return;
            }

            await axios.post(`${API_BASE_URL}/api/location/update`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Backend Sync Error:", error);
            // If it failed due to network, cache it
            if (!error.response) await cacheLocation(data);
        }

    };

    const cacheLocation = async (data) => {
        try {
            const cached = await SecureStore.getItemAsync('cached_locations');
            const list = cached ? JSON.parse(cached) : [];
            list.push(data);
            await SecureStore.setItemAsync('cached_locations', JSON.stringify(list));
        } catch (e) {
            console.error("Caching Error:", e);
        }
    };

    const syncCachedLocations = async () => {
        try {
            const cached = await SecureStore.getItemAsync('cached_locations');
            if (!cached) return;

            const list = JSON.parse(cached);
            if (list.length === 0) return;

            console.log(`Syncing ${list.length} cached locations...`);
            for (const loc of list) {
                await sendLocationToBackend(loc);
            }

            await SecureStore.deleteItemAsync('cached_locations');
        } catch (e) {
            console.error("Sync Error:", e);
        }
    };

    const stopTrip = async () => {
        // Stop GPS tracking
        if (locationSubscriptionRef.current) {
            locationSubscriptionRef.current.remove();
            locationSubscriptionRef.current = null;
        }
        // Disconnect socket and emit trip ended
        if (socketRef.current?.connected) {
            socketRef.current.emit('trip_ended', { busID: driverData.assignedBusId });
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        await updateTripStatusOnServer(false);
        setTripActive(false);
        setCurrentLocation(null);
        resetSlider();
        Alert.alert("Status", "Location sharing stopped");
    };

    const resetSlider = () => {
        Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
        }).start();
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !tripActive,
            onMoveShouldSetPanResponder: () => !tripActive,
            onPanResponderMove: Animated.event([null, { dx: pan }], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: (e, gestureState) => {
                if (gestureState.dx > SWIPE_RANGE * 0.75) {
                    Animated.timing(pan, {
                        toValue: SWIPE_RANGE,
                        duration: 200,
                        useNativeDriver: false,
                    }).start(() => {
                        startTrip();
                    });
                } else {
                    resetSlider();
                }
            },
        })
    ).current;

    useEffect(() => {
        fetchDashboardData();

        // Battery tracking
        const batteryListener = Battery.addBatteryLevelListener(({ batteryLevel }) => {
            setBatteryLevel(batteryLevel);
            if (batteryLevel < 0.2) {
                setUpdateInterval(30000);
            } else {
                setUpdateInterval(10000);
            }
        });

        // Connectivity tracking
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected);
            if (state.isConnected) {
                syncCachedLocations();
            }
        });

        return () => {
            if (locationSubscriptionRef.current) {
                locationSubscriptionRef.current.remove();
            }
            if (socketRef.current) socketRef.current.disconnect();
            batteryListener.remove();
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (tripActive && driverData.assignedBusId) {
            startGPSTracking();
        }
    }, [tripActive, driverData.assignedBusId]);

    const translateX = pan.interpolate({
        inputRange: [0, SWIPE_RANGE],
        outputRange: [0, SWIPE_RANGE],
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.driverNameTitle}>{driverData.name}</Text>
                    <View style={styles.headerSubRow}>
                        <View style={styles.headerDot} />
                        <Text style={styles.headerSub}>BUS DRIVER #{driverData.busNumber}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.main}>
                {tripActive ? (
                    <View style={styles.mapContainer}>
                        <LeafletMap markers={currentLocation ? [{ coordinate: currentLocation, icon: 'driver' }] : []} />
                        
                        <View style={styles.mapOverlay}>
                             <View style={styles.statusBadge}>
                                <View style={[styles.pulseDot, styles.pulseDotActive]} />
                                <Text style={styles.statusText}>SHARING LIVE LOCATION</Text>
                             </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.statusDisplay}>
                        <View style={styles.statusLabelRow}>
                            <View style={[styles.pulseDot, tripActive && styles.pulseDotActive]} />
                            <Text style={styles.statusLabel}>CURRENT STATUS</Text>
                        </View>
                        <Text style={[styles.statusMain, tripActive && styles.statusMainActive]}>
                            {tripActive ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                        <Text style={styles.statusDesc}>
                            {tripActive 
                                ? 'You are broadcasting your live location to students.' 
                                : 'You are hidden from students. Start your route to broadcast location.'}
                        </Text>
                    </View>
                )}

                {connecting ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                ) : tripActive ? (
                    <TouchableOpacity style={[styles.stopTripBtn, { backgroundColor: '#FACC15' }]} onPress={stopTrip}>
                        <View style={styles.stopIconBox}>
                            <MaterialIcons name="location-off" size={32} color="#000" />
                        </View>
                        <Text style={[styles.stopText, { color: '#000' }]}>STOP SHARING LOCATION</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderTrack}>
                            <Text style={styles.swipeText}>Swipe to Start</Text>
                            <View style={styles.chevronRow}>
                                <MaterialIcons name="chevron-right" size={24} color="#ccc" style={styles.chevron} />
                                <MaterialIcons name="chevron-right" size={24} color="#ccc" style={[styles.chevron, { marginLeft: -12 }]} />
                            </View>
                        </View>
                        <Animated.View
                            style={[styles.sliderHandle, { transform: [{ translateX }] }]}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.handleInner}>
                                <MaterialIcons name="location-on" size={32} color={Theme.colors.textSecondaryDark} />
                            </View>
                        </Animated.View>
                    </View>
                )}

                {!tripActive && (
                    <View style={styles.hintContainer}>
                        <MaterialIcons name="touch-app" size={18} color="#9ca3af" />
                        <Text style={styles.hintText}>Long press or slide to activate</Text>
                    </View>
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
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 20,
    },
    driverNameTitle: {
        fontSize: Theme.typography.sizes['2xl'],
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    headerSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    headerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.primary,
        marginRight: 6,
    },
    headerSub: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.textSecondaryLight,
        letterSpacing: 1,
    },
    logoutBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Theme.borderRadius.full,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
        elevation: 2,
    },
    logoutText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.textSecondaryLight,
        textTransform: 'uppercase',
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statusDisplay: {
        alignItems: 'center',
        marginBottom: 60,
    },
    statusLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    pulseDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#9ca3af',
        marginRight: 8,
    },
    pulseDotActive: {
        backgroundColor: Theme.colors.primary,
        // animate-pulse in React Native would need timing
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.textSecondaryLight,
        letterSpacing: 2,
    },
    statusMain: {
        fontSize: 48,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        letterSpacing: -1,
    },
    statusMainActive: {
        color: Theme.colors.primary,
    },
    statusDesc: {
        fontSize: Theme.typography.sizes.sm,
        color: Theme.colors.textSecondaryLight,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
        maxWidth: 280,
    },
    sliderContainer: {
        width: SLIDER_WIDTH,
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 60,
        justifyContent: 'center',
        paddingHorizontal: 4,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        position: 'relative',
    },
    sliderTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 40,
    },
    swipeText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    chevronRow: {
        flexDirection: 'row',
        marginLeft: 8,
    },
    chevron: {
        // animate pulse
    },
    sliderHandle: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: '#f8f8f5',
        position: 'absolute',
        left: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eeede9',
    },
    handleInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eeede9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopTripBtn: {
        width: SLIDER_WIDTH,
        height: 120,
        backgroundColor: Theme.colors.primary,
        borderRadius: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 16,
        elevation: 10,
    },
    stopIconBox: {
        width: BUTTON_SIZE - 16,
        height: BUTTON_SIZE - 16,
        borderRadius: 44,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopText: {
        fontSize: 16,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        flex: 1,
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
        opacity: 0.6,
    },
    hintText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
    },
    locationBadge: {
        marginTop: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    coordsText: {
        fontSize: 12,
        fontWeight: '700',
        color: Theme.colors.textSecondaryDark,
        fontFamily: 'monospace',
    },
    mapContainer: {
        width: '100%',
        height: 300,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
        backgroundColor: '#f3f4f6',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerContainer: {
        backgroundColor: Theme.colors.primary,
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },
    mapOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
    },
    statusBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 6,
    }
});

export default DriverHome;
