import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Platform, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useFocusEffect } from '@react-navigation/native';
import { io } from 'socket.io-client';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

const ParentHome = ({ navigation }) => {
    const [latestAnnouncement, setLatestAnnouncement] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [parentName, setParentName] = useState('Parent');
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [childStatus, setChildStatus] = useState(null);
    const socketRef = useRef(null);
    // Ref mirrors selectedStudentId so socket callback always reads the latest value
    const selectedStudentIdRef = useRef(null);

    // Firebase Cloud Messaging Setup
    useEffect(() => {
        let unsubRefresh = () => {};
        let unsubOpened = () => {};
        let unsubMessage = () => {};

        const setupFCM = async () => {
            try {
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (!enabled) return;

                const fcmToken = await messaging().getToken();
                const token = await SecureStore.getItemAsync('socketToken');
                if (token && fcmToken) {
                    await axios.patch(`${API_BASE_URL}/api/parent/fcm-token`, { fcmToken }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                unsubRefresh = messaging().onTokenRefresh(async (newToken) => {
                    const freshToken = await SecureStore.getItemAsync('socketToken');
                    if (freshToken) {
                        await axios.patch(`${API_BASE_URL}/api/parent/fcm-token`, { fcmToken: newToken }, {
                            headers: { Authorization: `Bearer ${freshToken}` }
                        });
                    }
                });

                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                    }),
                });

                unsubOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
                    if (remoteMessage.data?.type === 'child_boarded') {
                        navigation.navigate('ParentHome');
                    } else if (remoteMessage.data?.type === 'bus_arriving') {
                        navigation.navigate('ParentTrackBus', { studentId: selectedStudentIdRef.current });
                    } else if (remoteMessage.data?.type === 'trip_started') {
                        navigation.navigate('ParentTrackBus', { studentId: selectedStudentIdRef.current });
                    }
                });

                unsubMessage = messaging().onMessage(async (remoteMessage) => {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: remoteMessage.notification?.title,
                            body: remoteMessage.notification?.body,
                            data: remoteMessage.data,
                        },
                        trigger: null,
                    });
                });
            } catch (err) {
                console.warn('[FCM Setup Bypass] FCM is not supported in this client environment:', err.message);
            }
        };

        setupFCM();

        return () => {
            unsubRefresh();
            unsubOpened();
            unsubMessage();
        };
    }, []);

    const fetchData = async (targetStudentId = null) => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            if (!token) return;

            // Fetch Announcements
            const res = await axios.get(`${API_BASE_URL}/api/parent/announcements`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const announcements = res.data;
            setLatestAnnouncement(announcements[0] || null);
            setUnreadCount(announcements.filter(a => !a.isRead).length);

            // Fetch Parent Profile & Students
            const profileRes = await axios.get(`${API_BASE_URL}/api/parent/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParentName(profileRes.data.parent.parentName);
            const children = profileRes.data.children || [];
            setStudents(children);

            // Fetch Child Status
            const activeId = targetStudentId || selectedStudentId || children[0]?.id;
            if (activeId) {
                if (!selectedStudentId) {
                    setSelectedStudentId(activeId);
                    selectedStudentIdRef.current = activeId;
                }
                const statusRes = await axios.get(`${API_BASE_URL}/api/parent/child-status?studentId=${activeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChildStatus(statusRes.data);
            }
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData();
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [selectedStudentId]);

    // Socket connection for instant updates
    useEffect(() => {
        let socket;
        let hasJoinedBus = false;
        const initSocketConnection = async () => {
            const token = await SecureStore.getItemAsync('socketToken');
            if (!token) return;

            socket = io(API_BASE_URL, {
                auth: { token },
                transports: ['websocket'],
            });

            socket.on('connect', () => {
                console.log('[Parent Home Socket] Connected');
            });

            // Listen for trip_started event
            socket.on('trip_started', (data) => {
                console.log('[ParentHome Socket] trip_started received:', data);
                setChildStatus(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        routeInfo: {
                            ...prev.routeInfo,
                            driverOnline: true,
                            eta: data.eta || prev.routeInfo.eta || 15
                        }
                    };
                });
            });

            // Listen for child_boarded event
            socket.on('child_boarded', (data) => {
                console.log('[ParentHome Socket] child_boarded received:', data);
                setChildStatus(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        attendance: {
                            status: 'boarded',
                            boardingTime: data.boardingTime || new Date(),
                            alightingTime: null,
                        }
                    };
                });
            });

            // Listen for attendance updates — use ref to avoid stale closure
            socket.on('attendanceUpdate', (data) => {
                const activeId = selectedStudentIdRef.current;
                const matchesChild =
                    !data.studentId ||
                    !activeId ||
                    data.studentId === activeId ||
                    data.studentId === activeId?.toString();

                console.log('[ParentHome Socket] attendanceUpdate received:', data);

                if (matchesChild) {
                    setChildStatus(prev => ({
                        ...prev,
                        attendance: {
                            status: data.status || 'boarded',
                            boardingTime: data.boardingTime || data.time,
                            alightingTime: null,
                        },
                    }));
                }
            });

            // Listen for real-time bus location updates (new bus room event)
            socket.on('bus_location_update', (data) => {
                const busId = data.busID;
                // Update ETA in child status if it matches the selected student's bus
                setChildStatus(prev => {
                    if (!prev?.student?.busNumber) return prev;
                    return {
                        ...prev,
                        routeInfo: {
                            ...prev.routeInfo,
                            driverOnline: true,
                            eta: data.eta,
                        }
                    };
                });
            });

            // Listen for legacy location updates
            socket.on('locationUpdate', ({ driverLocation, eta: etaMin }) => {
                setChildStatus(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        routeInfo: {
                            ...prev.routeInfo,
                            driverOnline: true,
                            eta: etaMin,
                        }
                    };
                });
            });

            // Listen for trip ended
            socket.on('trip_ended', () => {
                setChildStatus(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        routeInfo: {
                            ...prev.routeInfo,
                            driverOnline: false,
                            eta: null,
                        }
                    };
                });
            });

            socket.on('tripEnded', () => {
                setChildStatus(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        routeInfo: {
                            ...prev.routeInfo,
                            driverOnline: false,
                            eta: null,
                        }
                    };
                });
            });

            // Subscribe to bus room once child status is loaded
            const busId = childStatus?.student?.busId;
            if (busId && !hasJoinedBus) {
                socket.emit('subscribe_bus', { busID: busId });
                hasJoinedBus = true;
            }

            socketRef.current = socket;
        };

        initSocketConnection();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [selectedStudentId]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [selectedStudentId])
    );

    const handleSelectStudent = (id) => {
        setSelectedStudentId(id);
        selectedStudentIdRef.current = id;
        setIsLoading(true);
        fetchData(id);
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userRole');
        await SecureStore.deleteItemAsync('socketToken');
        navigation.replace('Login');
    };

    const QuickAccessItem = ({ icon, title, subtitle, color, onPress }) => (
        <TouchableOpacity style={styles.qaItem} onPress={onPress}>
            <View style={styles.qaLeft}>
                <View style={[styles.qaIconContainer, { backgroundColor: `${color}15` }]}>
                    <MaterialIcons name={icon} size={24} color={color} />
                </View>
                <View>
                    <Text style={styles.qaTitle}>{title}</Text>
                    <Text style={styles.qaSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>
    );

    // Format times elegantly
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const d = new Date(timeStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Render child card status content
    const renderCardStatus = () => {
        if (!childStatus) {
            return (
                <View style={styles.onBoardRow}>
                    <MaterialIcons name="cancel" size={14} color="#9ca3af" />
                    <Text style={styles.onBoardText}>Not On Board</Text>
                </View>
            );
        }

        const { attendance } = childStatus;
        if (attendance && attendance.status === 'boarded') {
            return (
                <View>
                    <View style={styles.onBoardRow}>
                        <View style={[styles.statusIndicatorDot, { backgroundColor: '#22c55e' }]} />
                        <Text style={[styles.onBoardText, { color: '#16a34a' }]}>On Board</Text>
                    </View>
                    <Text style={styles.boardingTimeSub}>Checked in at {formatTime(attendance.boardingTime)}</Text>
                </View>
            );
        } else if (attendance && (attendance.status === 'dropped_off' || attendance.alightingTime)) {
            return (
                <View>
                    <View style={styles.onBoardRow}>
                        <View style={[styles.statusIndicatorDot, { backgroundColor: '#3b82f6' }]} />
                        <Text style={[styles.onBoardText, { color: '#2563eb' }]}>Dropped Off</Text>
                    </View>
                    <Text style={styles.boardingTimeSub}>Alighted at {formatTime(attendance.alightingTime)}</Text>
                </View>
            );
        } else {
            return (
                <View>
                    <View style={styles.onBoardRow}>
                        <View style={[styles.statusIndicatorDot, { backgroundColor: '#9ca3af' }]} />
                        <Text style={styles.onBoardText}>Not On Board</Text>
                    </View>
                    <Text style={styles.boardingTimeSub}>No activity today</Text>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <MaterialIcons name="logout" size={24} color={Theme.colors.brandGrey} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerAppName}>VisageRoute</Text>
                    <Text style={styles.headerSub}>PARENT PORTAL</Text>
                </View>
                <TouchableOpacity 
                    style={styles.notificationBtn}
                    onPress={() => navigation.navigate('ParentAnnouncements')}
                >
                    <MaterialIcons name="notifications" size={26} color="#9ca3af" />
                    {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Welcome Section */}
                <View style={styles.welcomeRow}>
                    <View>
                        <Text style={styles.greeting}>Good afternoon,</Text>
                        <Text style={styles.userName}>{parentName}</Text>
                    </View>
                    {childStatus?.routeInfo?.driverOnline && (
                        <View style={styles.liveBadge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.liveBadgeText}>Live Tracking</Text>
                        </View>
                    )}
                </View>

                {/* Child Selector */}
                {students.length > 1 && (
                    <View style={styles.childSelector}>
                        {students.map((kid) => {
                            const isSelected = kid.id === selectedStudentId;
                            return (
                                <TouchableOpacity 
                                    key={kid.id}
                                    style={[styles.selectorTab, isSelected && styles.selectorTabActive]}
                                    onPress={() => handleSelectStudent(kid.id)}
                                >
                                    <MaterialIcons 
                                        name="face" 
                                        size={16} 
                                        color={isSelected ? Theme.colors.brandGrey : "#9ca3af"} 
                                    />
                                    <Text style={[styles.selectorTabText, isSelected && styles.selectorTabActiveText]}>
                                        {kid.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Status Cards */}
                <View style={styles.statusGrid}>
                    <View style={[styles.card, styles.arrivalCard]}>
                        <MaterialIcons name="directions-bus" size={80} color="rgba(0,0,0,0.1)" style={styles.bgIcon} />
                        <View style={styles.cardHeader}>
                            <View style={styles.cardIconBox}>
                                <MaterialIcons name="schedule" size={18} color={Theme.colors.brandGrey} />
                            </View>
                        </View>
                        <Text style={styles.cardLabelText}>ESTIMATED ARRIVAL</Text>
                        <Text style={styles.arrivalValue}>
                            {childStatus?.routeInfo?.driverOnline ? childStatus.routeInfo.eta || '--' : '--'}
                            <Text style={styles.unitText}>min</Text>
                        </Text>
                        <View style={styles.busInfo}>
                            <View style={styles.busBadge}>
                                <Text style={styles.busBadgeText}>
                                    Bus #{childStatus?.student?.busNumber || 'N/A'}
                                </Text>
                            </View>
                            <Text style={styles.busSub}>
                                {childStatus?.routeInfo?.driverOnline ? 'En Route' : 'Offline'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.card, styles.studentCard]}
                        onPress={() => navigation.navigate('ParentTrackBus', { studentId: selectedStudentId })}
                    >
                        <View style={styles.studentTop}>
                            <View style={styles.avatar}>
                                <MaterialIcons name="face" size={32} color="#3b82f6" />
                            </View>
                            <View style={[
                                styles.safeBadge, 
                                { backgroundColor: childStatus?.attendance?.status === 'boarded' ? '#dcfce7' : '#f3f4f6' }
                            ]}>
                                <Text style={[
                                    styles.safeBadgeText, 
                                    { color: childStatus?.attendance?.status === 'boarded' ? '#15803d' : '#6b7280' }
                                ]}>
                                    {childStatus?.attendance?.status === 'boarded' ? 'SAFE' : 'PENDING'}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.studentName}>{childStatus?.student?.name || 'Child'}</Text>
                            {renderCardStatus()}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Access */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>QUICK ACCESS</Text>
                    <View style={styles.qaList}>
                        <QuickAccessItem 
                            icon="map" 
                            title="Live Map View" 
                            subtitle="Track bus location in real-time" 
                            color="#f59e0b"
                            onPress={() => navigation.navigate('ParentTrackBus', { studentId: selectedStudentId })}
                        />
                        <QuickAccessItem 
                            icon="calendar-today" 
                            title="Weekly Schedule" 
                            subtitle="View pick-up & drop-off times" 
                            color="#3b82f6"
                            onPress={() => navigation.navigate('ParentSchedule', { studentId: selectedStudentId })}
                        />
                        <QuickAccessItem 
                            icon="notifications-active" 
                            title="Manage Notifications" 
                            subtitle="Customize alert preferences" 
                            color="#f97316"
                            onPress={() => navigation.navigate('ParentNotifications')}
                        />
                    </View>
                </View>

                {/* Announcement Card */}
                {latestAnnouncement ? (
                    <View style={[styles.announcementCard, latestAnnouncement.priority === 'urgent' && styles.urgentCard]}>
                        <View style={styles.announcementHeader}>
                            <View style={styles.announcementTitleRow}>
                                <MaterialIcons 
                                    name={latestAnnouncement.priority === 'urgent' ? "priority-high" : "campaign"} 
                                    size={20} 
                                    color={latestAnnouncement.priority === 'urgent' ? "#ef4444" : Theme.colors.primary} 
                                />
                                <Text style={styles.announcementTitle}>{latestAnnouncement.title}</Text>
                            </View>
                            <View style={styles.tag}><Text style={styles.tagText}>New</Text></View>
                        </View>
                        <Text style={styles.announcementText} numberOfLines={3}>
                            {latestAnnouncement.content}
                        </Text>
                        <TouchableOpacity 
                            style={styles.detailsBtn}
                            onPress={() => navigation.navigate('ParentAnnouncements')}
                        >
                            <Text style={styles.detailsBtnText}>View All Alerts</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.announcementCard}>
                         <Text style={[styles.announcementText, { textAlign: 'center', marginBottom: 0 }]}>No recent announcements.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="home" size={28} color={Theme.colors.primary} />
                    <Text style={[styles.navText, { color: Theme.colors.primary }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentTrackBus', { studentId: selectedStudentId })}>
                    <MaterialIcons name="map" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentSchedule', { studentId: selectedStudentId })}>
                    <MaterialIcons name="event-note" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentAnnouncements')}>
                    <MaterialIcons name="notifications" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Alerts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentProfile')}>
                    <MaterialIcons name="person" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    logoutBtn: { padding: 5 },
    headerCenter: { alignItems: 'center' },
    headerAppName: { fontSize: 18, fontWeight: '900', color: Theme.colors.brandGrey },
    headerSub: { fontSize: 9, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.5 },
    notificationBtn: { padding: 5, position: 'relative' },
    badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: 'white' },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    scrollContent: { padding: 24, paddingBottom: 100 },
    welcomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
    greeting: { fontSize: 14, color: '#6b7280' },
    userName: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.brandGrey },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
    liveBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#92400e' },
    childSelector: { flexDirection: 'row', gap: 10, marginBottom: 20, backgroundColor: '#f3f4f6', padding: 4, borderRadius: 16 },
    selectorTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
    selectorTabActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    selectorTabText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
    selectorTabActiveText: { color: Theme.colors.brandGrey },
    statusGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    card: { flex: 1, height: 176, borderRadius: 24, padding: 20, justifyContent: 'space-between' },
    arrivalCard: { backgroundColor: Theme.colors.primary, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8, position: 'relative', overflow: 'hidden' },
    bgIcon: { position: 'absolute', right: -20, top: -10, transform: [{ rotate: '15deg' }] },
    cardHeader: { flexDirection: 'row' },
    cardIconBox: { backgroundColor: 'rgba(255,255,255,0.3)', padding: 6, borderRadius: 8 },
    cardLabelText: { fontSize: 10, fontWeight: 'bold', color: 'rgba(0,0,0,0.6)', letterSpacing: 0.5 },
    arrivalValue: { fontSize: 40, fontWeight: '900', color: Theme.colors.brandGrey },
    unitText: { fontSize: 18, fontWeight: 'bold' },
    busInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    busBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    busBadgeText: { fontSize: 10, fontWeight: 'bold', color: Theme.colors.brandGrey },
    busSub: { fontSize: 10, color: 'rgba(0,0,0,0.6)', fontWeight: '500' },
    studentCard: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb' },
    studentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
    safeBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    safeBadgeText: { fontSize: 9, fontWeight: '900', color: '#15803d' },
    studentName: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.brandGrey },
    onBoardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    statusIndicatorDot: { width: 8, height: 8, borderRadius: 4 },
    onBoardText: { fontSize: 12, fontWeight: '600', color: '#4b5563' },
    boardingTimeSub: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
    section: { marginBottom: 24 },
    sectionHeader: { fontSize: 11, fontWeight: '900', color: Theme.colors.brandGrey, letterSpacing: 1, marginBottom: 12 },
    qaList: { backgroundColor: 'white', borderRadius: 24, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
    qaItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    qaLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    qaIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    qaTitle: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.brandGrey },
    qaSubtitle: { fontSize: 11, color: '#6b7280' },
    announcementCard: { backgroundColor: '#111827', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
    urgentCard: { borderLeftWidth: 6, borderLeftColor: '#ef4444' },
    announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    announcementTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    announcementTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    tag: { backgroundColor: '#1f2937', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    tagText: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold' },
    announcementText: { color: '#d1d5db', fontSize: 14, lineHeight: 20, marginBottom: 20 },
    detailsBtn: { backgroundColor: 'white', height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    detailsBtnText: { color: Theme.colors.brandGrey, fontWeight: 'bold', fontSize: 14 },
    bottomNav: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 15, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    navItem: { alignItems: 'center', gap: 4 },
    navText: { fontSize: 10, fontWeight: '700', color: '#9ca3af' },
});

export default ParentHome;
