import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Platform, Linking
} from 'react-native';
import LeafletMap from '../components/LeafletMap';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { io } from 'socket.io-client';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL;

// ── Haversine Distance (returns km) ────────────────────────────────────────
const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Coordinate validation helper ────────────────────────────────────────────
const isValidCoord = (loc) =>
    loc &&
    typeof loc.latitude === 'number' && typeof loc.longitude === 'number' &&
    !isNaN(loc.latitude) && !isNaN(loc.longitude) &&
    isFinite(loc.latitude) && isFinite(loc.longitude) &&
    loc.latitude !== 0 && loc.longitude !== 0;

const ParentTrackBus = ({ route, navigation }) => {
    const studentId = route?.params?.studentId;

    // ── State ─────────────────────────────────────────────────────────────
    const [parentLocation, setParentLocation] = useState(null);   // parent's GPS
    const [driverLocation, setDriverLocation] = useState(null);   // live from socket
    const [distance, setDistance] = useState(null);               // km between them
    const [eta, setEta] = useState(null);
    const [tripStatus, setTripStatus] = useState('Waiting for driver to start trip...');
    const [isLoading, setIsLoading] = useState(true);
    const [busLabel, setBusLabel] = useState('Bus #N/A');
    const [driverLabel, setDriverLabel] = useState('');

    // ── Refs ──────────────────────────────────────────────────────────────
    const socketRef = useRef(null);
    const busIdRef = useRef(null);
    const hasJoinedBusRef = useRef(false);
    const parentLocationRef = useRef(null); // for distance calc inside socket cb

    // ── Fetch profile to get busId ────────────────────────────────────────
    const fetchProfile = useCallback(async (token) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/parent/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const children = res.data?.children || [];
            // If a specific studentId was passed, find that child; else use first
            const child = studentId
                ? children.find(c => c.id === studentId)
                : children[0];

            if (!child) {
                Alert.alert('No Student', 'No student linked to your account.');
                navigation.goBack();
                return null;
            }

            setBusLabel(`Bus #${child.busNumber || 'N/A'}`);

            if (child.busId) {
                busIdRef.current = child.busId;
                return child.busId;
            } else {
                setTripStatus('No bus assigned to your child.');
                return null;
            }
        } catch (err) {
            console.error('[ParentTrack] Profile fetch error:', err);
            Alert.alert('Error', 'Could not load profile. Please try again.');
            return null;
        }
    }, [studentId, navigation]);

    // ── Get parent's current GPS location ─────────────────────────────────
    const getParentLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('[ParentTrack] Location permission denied');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            if (loc?.coords) {
                const lat = Number(loc.coords.latitude);
                const lng = Number(loc.coords.longitude);
                if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
                    const pos = { latitude: lat, longitude: lng };
                    setParentLocation(pos);
                    parentLocationRef.current = pos;
                }
            }
        } catch (err) {
            console.warn('[ParentTrack] GPS error:', err.message);
        }
    }, []);

    // ── Update distance whenever locations change ──────────────────────────
    useEffect(() => {
        if (isValidCoord(parentLocation) && isValidCoord(driverLocation)) {
            const d = haversineKm(
                parentLocation.latitude, parentLocation.longitude,
                driverLocation.latitude, driverLocation.longitude
            );
            setDistance(d);
        } else {
            setDistance(null);
        }
    }, [parentLocation, driverLocation]);

    // ── Socket + initial data setup ───────────────────────────────────────
    useEffect(() => {
        let socket;

        const setup = async () => {
            setIsLoading(true);

            const token = await SecureStore.getItemAsync('userToken') ||
                          await SecureStore.getItemAsync('socketToken');
            if (!token) {
                Alert.alert('Session Error', 'Please log in again.');
                navigation.replace('Login');
                return;
            }

            // 1. Fetch busId via profile
            const busId = await fetchProfile(token);
            if (!busId) {
                setIsLoading(false);
                return;
            }

            // 2. Get parent's own location
            await getParentLocation();

            // 3. Create socket connection
            socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket'],
            });

            // ── Socket event: connected ────────────────────────────────────
            socket.on('connect', () => {
                console.log('[ParentTrack] Socket connected:', socket.id);

                // Subscribe to bus room using busIdRef (not stale closure)
                const bId = busIdRef.current;
                if (bId && !hasJoinedBusRef.current) {
                    console.log('[ParentTrack] Subscribing to bus room:', bId);
                    socket.emit('subscribe_bus', { busID: bId });
                    socket.emit('joinRouteRoom', bId);
                    hasJoinedBusRef.current = true;
                }
            });

            // ── Socket event: bus_location_update (primary) ────────────────
            socket.on('bus_location_update', (data) => {
                const lat = Number(data?.latitude !== undefined ? data.latitude : data?.lat);
                const lng = Number(data?.longitude !== undefined ? data.longitude : data?.lng);

                if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
                    const newDriverLoc = { latitude: lat, longitude: lng };
                    setDriverLocation(newDriverLoc);

                    // Recalculate distance with latest parent location from ref
                    const parentLoc = parentLocationRef.current;
                    if (isValidCoord(parentLoc)) {
                        const d = haversineKm(
                            parentLoc.latitude, parentLoc.longitude,
                            lat, lng
                        );
                        setDistance(d);
                    }
                }
                if (data?.eta !== undefined) setEta(data.eta);
                setTripStatus('Bus is on the way!');
            });

            // ── Socket event: location_changed (secondary) ─────────────────
            socket.on('location_changed', (data) => {
                const lat = Number(data?.latitude !== undefined ? data.latitude : data?.lat);
                const lng = Number(data?.longitude !== undefined ? data.longitude : data?.lng);

                if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
                    const newDriverLoc = { latitude: lat, longitude: lng };
                    setDriverLocation(newDriverLoc);

                    const parentLoc = parentLocationRef.current;
                    if (isValidCoord(parentLoc)) {
                        setDistance(haversineKm(
                            parentLoc.latitude, parentLoc.longitude,
                            lat, lng
                        ));
                    }
                }
                if (data?.eta !== undefined) setEta(data.eta);
                setTripStatus('Bus is on the way!');
            });

            // ── Socket event: locationUpdate (legacy) ─────────────────────
            socket.on('locationUpdate', (data) => {
                const loc = data.driverLocation || data;
                const lat = Number(loc?.latitude !== undefined ? loc.latitude : loc?.lat);
                const lng = Number(loc?.longitude !== undefined ? loc.longitude : loc?.lng);

                if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
                    const newDriverLoc = { latitude: lat, longitude: lng };
                    setDriverLocation(newDriverLoc);

                    const parentLoc = parentLocationRef.current;
                    if (isValidCoord(parentLoc)) {
                        setDistance(haversineKm(
                            parentLoc.latitude, parentLoc.longitude,
                            lat, lng
                        ));
                    }
                }
                if (data?.eta !== undefined) setEta(data.eta);
                setTripStatus('Bus is on the way!');
            });

            // ── Socket event: trip_started ─────────────────────────────────
            socket.on('trip_started', (data) => {
                setTripStatus('Bus is on the way!');
                if (data?.eta) setEta(data.eta);
            });

            // ── Socket event: trip_ended ───────────────────────────────────
            socket.on('trip_ended', () => {
                setTripStatus('Trip has ended. The bus has arrived.');
                setEta(null);
            });

            socket.on('tripEnded', ({ message }) => {
                setTripStatus(message || 'Trip has ended.');
                setEta(null);
            });

            // ── Socket event: disconnect ───────────────────────────────────
            socket.on('disconnect', () => {
                console.log('[ParentTrack] Disconnected — will resubscribe on reconnect');
                hasJoinedBusRef.current = false;
            });

            socketRef.current = socket;

            // If socket already connected synchronously, subscribe now
            if (socket.connected && busIdRef.current && !hasJoinedBusRef.current) {
                console.log('[ParentTrack] Socket already connected, subscribing:', busIdRef.current);
                socket.emit('subscribe_bus', { busID: busIdRef.current });
                hasJoinedBusRef.current = true;
            }

            setIsLoading(false);
        };

        setup();

        return () => {
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
            }
        };
    }, [studentId, fetchProfile, getParentLocation]);

    // ── Call driver ───────────────────────────────────────────────────────
    const handleCallDriver = () => {
        Alert.alert(
            'Call Driver',
            driverLabel ? `Call ${driverLabel}?` : 'Driver phone not available.',
            driverLabel
                ? [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => Linking.openURL(`tel:${driverLabel}`) },
                  ]
                : [{ text: 'OK' }]
        );
    };

    // ── Format distance display ───────────────────────────────────────────
    const getDistanceText = () => {
        if (distance === null) return '--';
        if (distance < 1) return `${Math.round(distance * 1000)} m`;
        return `${distance.toFixed(1)} km`;
    };

    // ── Build markers for LeafletMap ─────────────────────────────────────
    const mapMarkers = [];
    if (isValidCoord(driverLocation)) {
        mapMarkers.push({ coordinate: driverLocation, icon: 'bus', title: 'Bus' });
    }
    if (isValidCoord(parentLocation)) {
        mapMarkers.push({ coordinate: parentLocation, icon: 'home', title: 'You' });
    }

    // ── Loading state ─────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading live tracking...</Text>
            </SafeAreaView>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerWrapperCustom}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Track Bus</Text>
                </View>

                <View style={styles.statusCard}>
                    <View style={styles.statusLeft}>
                        <View style={styles.busIconContainer}>
                            <MaterialIcons name="directions-bus" size={24} color={Theme.colors.brandGrey} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.busIdText}>{busLabel}</Text>
                            <Text style={styles.distanceText}>
                                {tripStatus.includes('on the way')
                                    ? `Distance: ${getDistanceText()}`
                                    : tripStatus}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.statusRight}>
                        <Text style={styles.arrivingLabel}>ARRIVING IN</Text>
                        <Text style={styles.etaValue}>{eta || '--'} min</Text>
                    </View>
                </View>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                <LeafletMap markers={mapMarkers} showDistance={distance} />

                {tripStatus !== 'Bus is on the way!' && (
                    <View style={styles.floatingBanner}>
                        <Text style={styles.floatingBannerText}>{tripStatus}</Text>
                    </View>
                )}

                {/* Map controls */}
                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.controlBtn}>
                        <MaterialIcons name="add" size={24} color={Theme.colors.brandGrey} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn}>
                        <MaterialIcons name="remove" size={24} color={Theme.colors.brandGrey} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlBtn, styles.locationBtn]}
                        onPress={getParentLocation}
                    >
                        <MaterialIcons name="my-location" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom info sheet */}
            <View style={styles.bottomSheet}>
                <View style={styles.handle} />
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Trip Status</Text>
                        <View style={styles.liveBadge}>
                            <Text style={styles.liveBadgeText}>LIVE TRACKING</Text>
                        </View>
                    </View>

                    {/* Distance and status details */}
                    <View style={styles.infoRows}>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="directions-bus" size={20} color={Theme.colors.primary} />
                            <Text style={styles.infoRowText}>{busLabel}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="place" size={20} color={Theme.colors.primary} />
                            <Text style={styles.infoRowText}>
                                Bus {driverLocation ? 'tracked' : 'awaiting signal'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="near-me" size={20} color={Theme.colors.primary} />
                            <Text style={styles.infoRowText}>
                                Distance: {getDistanceText()}
                                {distance !== null && distance >= 1
                                    ? ` (${(distance / 1.609).toFixed(1)} mi)`
                                    : ''}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="schedule" size={20} color={Theme.colors.primary} />
                            <Text style={styles.infoRowText}>
                                ETA: {eta ? `~${eta} min` : 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="my-location" size={20} color={Theme.colors.primary} />
                            <Text style={styles.infoRowText}>
                                {parentLocation ? 'Your location active' : 'Your location unavailable'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

// ── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundLight,
    },
    headerWrapperCustom: {
        backgroundColor: Theme.colors.primary,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 30,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    backBtn: {
        padding: 8,
        borderRadius: 20,
    },
    statusCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    busIconContainer: {
        backgroundColor: '#f3f4f6',
        padding: 10,
        borderRadius: 25,
    },
    busIdText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    distanceText: {
        fontSize: 10,
        color: '#6b7280',
        marginTop: 2,
    },
    statusRight: {
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    arrivingLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: -0.5,
    },
    etaValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    mapContainer: {
        flex: 1,
        zIndex: 1,
    },
    floatingBanner: {
        position: 'absolute',
        top: 16,
        alignSelf: 'center',
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 20,
    },
    floatingBannerText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    mapControls: {
        position: 'absolute',
        right: 20,
        top: '40%',
        gap: 12,
    },
    controlBtn: {
        width: 44,
        height: 44,
        backgroundColor: 'white',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    locationBtn: {
        backgroundColor: Theme.colors.brandGrey,
        borderColor: Theme.colors.brandGrey,
    },
    bottomSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 15,
        marginBottom: 10,
    },
    sheetContent: {
        paddingHorizontal: 25,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    liveBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    liveBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    infoRows: {
        gap: 10,
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    infoRowText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
});

export default ParentTrackBus;

