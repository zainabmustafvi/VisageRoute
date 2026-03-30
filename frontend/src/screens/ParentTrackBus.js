import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Platform
} from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { io } from 'socket.io-client';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

// ⚠️ Update to your machine's IP on the same Wi-Fi network
const SOCKET_URL = 'http://192.168.0.106:5000';

// Placeholder: In production, fetch the child's assigned routeId from the API
const CHILD_ROUTE_ID = '000000000000000000000001';

const ParentTrackBus = ({ navigation }) => {
    const [driverLocation, setDriverLocation] = useState(null);
    const [myLocation, setMyLocation] = useState(null);
    const [eta, setEta] = useState(null);
    const [tripStatus, setTripStatus] = useState('Waiting for driver to start trip...');
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const mapRef = useRef(null);

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
            {/* Header Content */}
            <View style={styles.headerWrapperCustom}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Track Bus</Text>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="notifications" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.statusCard}>
                    <View style={styles.statusLeft}>
                        <View style={styles.busIconContainer}>
                            <MaterialIcons name="directions-bus" size={24} color={Theme.colors.brandGrey} />
                        </View>
                        <View>
                            <Text style={styles.busIdText}>Bus #42 - Route A</Text>
                            <Text style={styles.driverText}>Driver: Malik Haris</Text>
                        </View>
                    </View>
                    <View style={styles.statusRight}>
                        <Text style={styles.arrivingLabel}>ARRIVING IN</Text>
                        <Text style={styles.etaValue}>{eta || '--'} min</Text>
                    </View>
                </View>
            </View>

            {/* Map Area */}
            <View style={styles.mapContainer}>
                {Platform.OS === 'web' ? (
                    <View style={styles.mapPlaceholder}>
                        <MaterialIcons name="map" size={48} color={Theme.colors.textSecondaryLight} />
                        <Text style={styles.overlayText}>Live Map is only available on Android/iOS devices.</Text>
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
                            mapType={Platform.OS === 'android' ? "none" : "standard"}
                        >
                            <UrlTile
                                urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                shouldReplaceMapContent={true}
                                maximumZ={19}
                                flipY={false}
                            />
                            {driverLocation && (
                                <Marker coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }}>
                                    <View style={styles.busMarker}>
                                        <MaterialIcons name="directions-bus" size={20} color={Theme.colors.brandGrey} />
                                    </View>
                                </Marker>
                            )}
                            {myLocation && (
                                <Marker coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }}>
                                    <View style={styles.homeMarker}>
                                        <MaterialIcons name="home" size={20} color="white" />
                                    </View>
                                </Marker>
                            )}
                        </MapView>
                        {!driverLocation && (
                            <View style={styles.mapOverlay}>
                                <ActivityIndicator size="large" color={Theme.colors.primary} />
                                <Text style={styles.overlayText}>Waiting for live bus location...</Text>
                            </View>
                        )}
                    </>
                )}
                
                {/* Floating Map Controls */}
                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.controlBtn}><MaterialIcons name="add" size={24} color={Theme.colors.brandGrey} /></TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn}><MaterialIcons name="remove" size={24} color={Theme.colors.brandGrey} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.controlBtn, styles.locationBtn]}><MaterialIcons name="my-location" size={24} color="white" /></TouchableOpacity>
                </View>
            </View>

            {/* Bottom Info Sheet */}
            <View style={styles.bottomSheet}>
                <View style={styles.handle} />
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Route Timeline</Text>
                        <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE TRACKING</Text></View>
                    </View>
                    
                    {/* Mock Timeline */}
                    <View style={styles.timeline}>
                        <View style={[styles.timelineItem, { opacity: 0.5 }]}>
                            <View style={styles.timelineDot}><MaterialIcons name="check" size={12} color="white" /></View>
                            <Text style={styles.timelineLabel}>G-11</Text>
                        </View>
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, styles.dotActive]}><MaterialIcons name="directions-bus" size={14} color={Theme.colors.brandGrey} /></View>
                            <Text style={styles.timelineLabelActive}>Golra</Text>
                            <Text style={styles.timelineStatus}>In Progress</Text>
                        </View>
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: Theme.colors.brandGrey }]}><MaterialIcons name="location-on" size={14} color="white" /></View>
                            <Text style={styles.timelineLabel}>Dhok Pracha</Text>
                            <Text style={styles.timelineTime}>8:55 AM</Text>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.callBtn}>
                            <MaterialIcons name="call" size={18} color={Theme.colors.brandGrey} />
                            <Text style={styles.callBtnText}>Call Driver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn}>
                            <MaterialIcons name="share" size={18} color={Theme.colors.brandGrey} />
                            <Text style={styles.shareBtnText}>Share ETA</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundLight,
    },
    headerWrapper: {
        backgroundColor: Theme.colors.brandGrey,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 10,
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
        tracking: 0.5,
    },
    backBtn: {
        padding: 8,
        borderRadius: 20,
    },
    iconBtn: {
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
    driverText: {
        fontSize: 11,
        color: '#6b7280',
    },
    statusRight: {
        alignItems: 'flex-end',
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
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e5e7eb',
    },
    overlayText: {
        marginTop: 10,
        color: '#6b7280',
        fontWeight: '500',
    },
    busMarker: {
        backgroundColor: Theme.colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
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
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingBottom: 30,
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
        marginBottom: 20,
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
    timeline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    timelineItem: {
        alignItems: 'center',
        width: 90,
    },
    timelineDot: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    dotActive: {
        backgroundColor: Theme.colors.primary,
        borderWidth: 4,
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    timelineLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#f3f4f6',
        marginTop: -30,
    },
    timelineLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    timelineLabelActive: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#111827',
    },
    timelineStatus: {
        fontSize: 9,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    timelineTime: {
        fontSize: 9,
        color: '#9ca3af',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    callBtn: {
        flex: 1,
        backgroundColor: Theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        height: 56,
        borderRadius: 20,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    callBtnText: {
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: 12,
        color: Theme.colors.brandGrey,
    },
    shareBtn: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        height: 56,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    shareBtnText: {
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: 12,
        color: '#374151',
    },
});

export default ParentTrackBus;
