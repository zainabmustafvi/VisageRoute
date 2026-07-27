import React, { useState, useEffect, useRef } from 'react';
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

// Helper to validate coordinate objects safely
const isValidCoord = (loc) => loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number' && !isNaN(loc.latitude) && !isNaN(loc.longitude);

const ParentTrackBus = ({ route, navigation }) => {
    const studentId = route?.params?.studentId;
    const [childStatus, setChildStatus] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [myLocation, setMyLocation] = useState(null);
    const [eta, setEta] = useState(null);
    const [tripStatus, setTripStatus] = useState('Waiting for driver to start trip...');
    const [connected, setConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null);

    const fetchStatus = async (token) => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/parent/child-status?studentId=${studentId || ''}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setChildStatus(res.data);

            if (res.data.routeInfo?.eta) {
                setEta(res.data.routeInfo.eta);
            }

            // Safe parsing of latestLocation from REST API
            if (res.data.routeInfo?.latestLocation?.latitude && res.data.routeInfo?.latestLocation?.longitude) {
                const lat = Number(res.data.routeInfo.latestLocation.latitude);
                const lng = Number(res.data.routeInfo.latestLocation.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setDriverLocation({ latitude: lat, longitude: lng });
                }
            }

            if (!res.data.routeInfo?.driverOnline) {
                setTripStatus('Bus not currently active. Showing last known location.');
            } else {
                setTripStatus('Bus is active!');
            }
        } catch (error) {
            console.error('Error fetching child status in tracking:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const hasJoinedBusRef = useRef(false);

    useEffect(() => {
        let socket;

        const setupTracking = async () => {
            const token = await SecureStore.getItemAsync('userToken') || await SecureStore.getItemAsync('socketToken');
            if (!token) {
                Alert.alert('Session Error', 'Please log in again.');
                navigation.replace('Login');
                return;
            }

            await fetchStatus(token);

            // Graceful location error handling
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    if (loc && loc.coords && typeof loc.coords.latitude === 'number' && typeof loc.coords.longitude === 'number') {
                        const lat = Number(loc.coords.latitude);
                        const lng = Number(loc.coords.longitude);
                        if (!isNaN(lat) && !isNaN(lng)) {
                            setMyLocation({ latitude: lat, longitude: lng });
                        }
                    }
                }
            } catch (locationErr) {
                console.warn('[Location Error] Gracefully handled GPS failure:', locationErr.message);
            }

            socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket'],
            });

            socket.on('connect', () => {
                console.log('[Parent Socket] Connected:', socket.id);
                setConnected(true);

                const busId = childStatus?.student?.busId;
                if (busId && !hasJoinedBusRef.current) {
                    socket.emit('subscribe_bus', { busID: busId });
                    hasJoinedBusRef.current = true;
                }

                if (childStatus?.routeInfo?.routeId) {
                    socket.emit('joinRouteRoom', childStatus.routeInfo.routeId);
                }
            });

            socket.on('connect_error', (err) => {
                console.error('[Parent Socket] Error:', err.message);
                setTripStatus('Could not connect to server. Check your network.');
            });

            socket.on('bus_location_update', (data) => {
                const lat = Number(data?.latitude !== undefined ? data.latitude : data?.lat);
                const lng = Number(data?.longitude !== undefined ? data.longitude : data?.lng);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setDriverLocation({ latitude: lat, longitude: lng });
                }
                if (data?.eta !== undefined) setEta(data.eta);
                setTripStatus('Bus is on the way!');
            });

            socket.on('locationUpdate', (data) => {
                const loc = data.driverLocation || data;
                const lat = Number(loc?.latitude !== undefined ? loc.latitude : loc?.lat);
                const lng = Number(loc?.longitude !== undefined ? loc.longitude : loc?.lng);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setDriverLocation({ latitude: lat, longitude: lng });
                }
                if (data?.eta !== undefined) setEta(data.eta);
                setTripStatus('Bus is on the way!');
            });

            socket.on('trip_ended', () => {
                setTripStatus('Trip has ended. The bus has arrived.');
                setEta(null);
            });

            socket.on('tripEnded', ({ message }) => {
                setTripStatus(message || 'Trip has ended.');
                setEta(null);
            });

            socketRef.current = socket;
        };

        setupTracking();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [studentId]);

    const handleCallDriver = () => {
        const phone = childStatus?.driverInfo?.phone || childStatus?.driverInfo?.contact || childStatus?.driver?.phone || childStatus?.driver?.contact;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        } else {
            Alert.alert('Unavailable', 'Driver phone number not provided.');
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const d = new Date(timeStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const TimelineItem = ({ title, status, time, isCompleted, isActive, icon }) => (
        <View style={[styles.timelineItem, !isCompleted && !isActive && { opacity: 0.5 }]}>
            <View style={[
                styles.timelineDot, 
                isActive && styles.dotActive, 
                isCompleted && { backgroundColor: '#22c55e' }
            ]}>
                <MaterialIcons 
                    name={isCompleted ? "check" : icon} 
                    size={isCompleted ? 12 : 14} 
                    color={(isCompleted || isActive) ? "white" : "#9ca3af"} 
                />
            </View>
            <Text style={isActive ? styles.timelineLabelActive : styles.timelineLabel}>{title}</Text>
            {status ? <Text style={styles.timelineStatus}>{status}</Text> : null}
            {time ? <Text style={styles.timelineTime}>{time}</Text> : null}
        </View>
    );

    // Build sanitized markers array for LeafletMap
    const mapMarkers = [];
    if (isValidCoord(driverLocation)) {
        mapMarkers.push({ coordinate: driverLocation, icon: 'bus', title: 'Bus Location' });
    }
    if (isValidCoord(myLocation)) {
        mapMarkers.push({ coordinate: myLocation, icon: 'home', title: 'Parent Location' });
    }

    const driverName = childStatus?.driverInfo?.name || childStatus?.driver?.name || 'Not assigned';
    const driverPhone = childStatus?.driverInfo?.phone || childStatus?.driverInfo?.contact || childStatus?.driver?.phone || childStatus?.driver?.contact;

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading live tracking...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Content */}
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
                        <View>
                            <Text style={styles.busIdText}>
                                Bus #{childStatus?.student?.busNumber || 'N/A'}
                            </Text>
                            <Text style={styles.driverText}>
                                Driver: {driverName}{driverPhone ? ` (${driverPhone})` : ''}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.statusRight}>
                        <Text style={styles.arrivingLabel}>ARRIVING IN</Text>
                        <Text style={styles.etaValue}>{eta || '--'} min</Text>
                    </View>
                </View>
            </View>

            {/* Map Area — Exclusively LeafletMap with OSM */}
            <View style={styles.mapContainer}>
                <LeafletMap markers={mapMarkers} />

                {/* Status indicator chip if driver offline */}
                {!childStatus?.routeInfo?.driverOnline && (
                    <View style={styles.floatingBanner}>
                        <Text style={styles.floatingBannerText}>{tripStatus}</Text>
                    </View>
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
                    
                    {/* Timeline */}
                    <View style={styles.timeline}>
                        <TimelineItem 
                            title="Start" 
                            status={childStatus?.routeInfo?.driverOnline ? "Started" : "Pending"}
                            time={formatTime(childStatus?.routeInfo?.wentOnlineAt)}
                            isCompleted={!!childStatus?.routeInfo?.wentOnlineAt}
                            isActive={childStatus?.routeInfo?.driverOnline}
                            icon="play-arrow"
                        />
                        <View style={styles.timelineLine} />
                        <TimelineItem 
                            title="Boarded" 
                            status={childStatus?.attendance?.status === 'boarded' ? "On Board" : "Pending"}
                            time={formatTime(childStatus?.attendance?.boardingTime)}
                            isCompleted={childStatus?.attendance?.status === 'boarded'}
                            isActive={childStatus?.routeInfo?.driverOnline && childStatus?.attendance?.status !== 'boarded'}
                            icon="directions-bus"
                        />
                        <View style={styles.timelineLine} />
                        <TimelineItem 
                            title="ETA" 
                            status={eta ? `${eta} min` : "N/A"}
                            isCompleted={false}
                            isActive={childStatus?.routeInfo?.driverOnline}
                            icon="schedule"
                        />
                        <View style={styles.timelineLine} />
                        <TimelineItem 
                            title="Dropped Off" 
                            status={childStatus?.attendance?.alightingTime ? "Dropped Off" : "Pending"}
                            time={formatTime(childStatus?.attendance?.alightingTime)}
                            isCompleted={!!childStatus?.attendance?.alightingTime}
                            isActive={false}
                            icon="location-on"
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
                            <MaterialIcons name="phone" size={20} color={Theme.colors.brandGrey} />
                            <Text style={styles.callBtnText}>Call Driver {driverPhone ? `(${driverPhone})` : ''}</Text>
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
    driverText: {
        fontSize: 11,
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
});

export default ParentTrackBus;
