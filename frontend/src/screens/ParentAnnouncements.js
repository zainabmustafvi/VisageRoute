import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { io } from 'socket.io-client';

const ParentAnnouncements = ({ navigation }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const socketRef = useRef(null);

    const fetchAnnouncements = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const res = await axios.get(`${API_BASE_URL}/api/parent/announcements`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(res.data);
        } catch (error) {
            if (error.response?.status === 404) {
                setAnnouncements([]);
            } else {
                console.error('Error fetching announcements:', error);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAnnouncements();
        }, [])
    );

    // Socket listener for new announcements
    useEffect(() => {
        let socket;
        const initSocket = async () => {
            const token = await SecureStore.getItemAsync('socketToken');
            if (!token) return;

            socket = io(API_BASE_URL, {
                auth: { token },
                transports: ['websocket'],
            });

            socket.on('newAnnouncement', (newAnn) => {
                // Prepend new announcement instantly to the top
                setAnnouncements(prev => [newAnn, ...prev]);
            });

            socketRef.current = socket;
        };

        initSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchAnnouncements();
    };

    const handleMarkRead = async (item) => {
        Alert.alert(
            item.priority === 'urgent' ? `🚨 ${item.title}` : `📢 ${item.title}`,
            item.content,
            [{ text: 'OK' }]
        );

        if (item.isRead) return;
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            await axios.put(`${API_BASE_URL}/api/parent/announcements/${item._id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(prev => prev.map(ann => 
                ann._id === item._id ? { ...ann, isRead: true } : ann
            ));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            await axios.put(`${API_BASE_URL}/api/parent/announcements/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(prev => prev.map(ann => ({ ...ann, isRead: true })));
            Alert.alert('Success', 'All announcements marked as read.');
        } catch (error) {
            console.error('Error marking all read:', error);
            Alert.alert('Error', 'Failed to mark all as read.');
        }
    };

    const AnnouncementItem = ({ item }) => {
        const isUrgent = item.priority === 'urgent';
        const date = new Date(item.sentAt || item.createdAt);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return (
            <TouchableOpacity 
                style={[styles.activityItem, !item.isRead && styles.unreadItem]} 
                onPress={() => handleMarkRead(item)}
                activeOpacity={0.7}
            >
                <MaterialIcons 
                    name={isUrgent ? "error" : "campaign"} 
                    size={24} 
                    color={isUrgent ? "#ef4444" : Theme.colors.primary} 
                />
                <View style={{flex: 1}}>
                    <View style={styles.activityHeader}>
                        <Text style={[
                            styles.activityTitle, 
                            !item.isRead && styles.unreadTitle,
                            isUrgent && styles.urgentTitle
                        ]}>
                            {item.title}
                        </Text>
                        <Text style={styles.activityTime}>{timeStr}</Text>
                    </View>
                    <Text style={[styles.activitySubtitle, !item.isRead && styles.unreadSubtitle]} numberOfLines={2}>
                        {item.content}
                    </Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    // Filter announcements locally based on active tab
    const filteredAnnouncements = announcements.filter(item => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Urgent') return item.priority === 'urgent';
        if (activeTab === 'General') return item.priority === 'normal' || item.priority === 'general' || !item.priority;
        return true;
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={Theme.colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>School Announcements</Text>
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                    <MaterialIcons name="done-all" size={24} color={Theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabContainer}>
                {['All', 'Urgent', 'General'].map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
                ) : filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((item, idx) => (
                        <React.Fragment key={item._id}>
                            <AnnouncementItem item={item} />
                            {idx < filteredAnnouncements.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="notifications-none" size={60} color="#d1d5db" />
                        <Text style={styles.emptyText}>No announcements in {activeTab}</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomNav}>
                 <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentHome')}>
                    <MaterialIcons name="home" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentTrackBus')}>
                    <MaterialIcons name="map" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentSchedule')}>
                    <MaterialIcons name="event-note" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="notifications" size={28} color={Theme.colors.primary} />
                    <Text style={[styles.navText, { color: Theme.colors.primary }]}>Alerts</Text>
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
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    },
    backBtn: { padding: 5 },
    markAllBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.brandGrey },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    activeTabButton: {
        backgroundColor: Theme.colors.primary,
    },
    tabText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    activeTabText: {
        color: Theme.colors.brandGrey,
    },
    scrollContent: { padding: 16, paddingBottom: 100 },
    activityItem: { flexDirection: 'row', padding: 16, gap: 16, backgroundColor: 'white', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    unreadItem: { backgroundColor: '#fdfcf0', borderColor: Theme.colors.primary },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    activityTitle: { fontSize: 16, fontWeight: '500', color: '#6b7280', flex: 1 },
    unreadTitle: { fontWeight: 'bold', color: '#111827' },
    urgentTitle: { color: '#ef4444' },
    activityTime: { fontSize: 11, color: '#9ca3af' },
    activitySubtitle: { fontSize: 14, color: '#9ca3af', lineHeight: 20 },
    unreadSubtitle: { color: '#4b5563' },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.colors.primary, alignSelf: 'center' },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 4, opacity: 0 },
    emptyState: { padding: 60, alignItems: 'center' },
    emptyText: { marginTop: 12, color: '#9ca3af', fontSize: 16, fontWeight: '500' },
    bottomNav: {
        position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white',
        flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, borderTopWidth: 1, borderTopColor: '#f3f4f6',
    },
    navItem: { alignItems: 'center', gap: 4 },
    navText: { fontSize: 10, fontWeight: '700', color: '#9ca3af' },
});

export default ParentAnnouncements;
