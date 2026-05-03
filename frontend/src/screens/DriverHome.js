import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Platform, SafeAreaView, ActivityIndicator, Dimensions, Animated, PanResponder
} from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { io } from 'socket.io-client';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 48;
const BUTTON_SIZE = 104;
const SWIPE_RANGE = SLIDER_WIDTH - BUTTON_SIZE - 8;

import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL;
const DRIVER_ROUTE_ID = '000000000000000000000001';

const DriverHome = ({ navigation }) => {
    const [tripActive, setTripActive] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [connecting, setConnecting] = useState(false);

    const socketRef = useRef(null);
    const locationWatcherRef = useRef(null);
    const pan = useRef(new Animated.Value(0)).current;

    const handleLogout = async () => {
        if (tripActive) await stopTrip();
        await SecureStore.deleteItemAsync('userRole');
        navigation.replace('Login');
    };

    const connectSocket = async () => {
        setConnecting(true);
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
        setTripActive(true);

        locationWatcherRef.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 4000,
                distanceInterval: 10,
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
        if (locationWatcherRef.current) {
            locationWatcherRef.current.remove();
            locationWatcherRef.current = null;
        }
        if (socketRef.current?.connected) {
            socketRef.current.emit('endTrip', { routeId: DRIVER_ROUTE_ID });
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setTripActive(false);
        setCurrentLocation(null);
        resetSlider();
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
        return () => {
            if (locationWatcherRef.current) locationWatcherRef.current.remove();
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const translateX = pan.interpolate({
        inputRange: [0, SWIPE_RANGE],
        outputRange: [0, SWIPE_RANGE],
        extrapolate: 'clamp',
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.driverNameTitle}>Sadaat Malik</Text>
                    <View style={styles.headerSubRow}>
                        <View style={styles.headerDot} />
                        <Text style={styles.headerSub}>BUS DRIVER #104</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.main}>
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

                {connecting ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                ) : tripActive ? (
                    <TouchableOpacity style={styles.stopTripBtn} onPress={stopTrip}>
                        <View style={styles.stopIconBox}>
                            <MaterialIcons name="location-off" size={32} color="#fff" />
                        </View>
                        <Text style={styles.stopText}>STOP SHARING LOCATION</Text>
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
                                <MaterialIcons name="location-off" size={32} color={Theme.colors.textSecondaryDark} />
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
                
                {currentLocation && (
                    <View style={styles.locationBadge}>
                         <Text style={styles.coordsText}>
                            📍 {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                        </Text>
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
});

export default DriverHome;
