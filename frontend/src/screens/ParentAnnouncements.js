import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const ParentAnnouncements = ({ navigation }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchAnnouncements();
    };

    const handleMarkRead = async (id, isRead) => {
        if (isRead) return;
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            await axios.put(`${API_BASE_URL}/api/parent/announcements/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(prev => prev.map(ann => 
                ann._id === id ? { ...ann, isRead: true } : ann
            ));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const AnnouncementItem = ({ item }) => {
        const isUrgent = item.priority === 'urgent';
        const date = new Date(item.sentAt || item.createdAt);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return (
            <TouchableOpacity 
                style={[styles.activityItem, !item.isRead && styles.unreadItem]} 
                onPress={() => handleMarkRead(item._id, item.isRead)}
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
                    <Text style={[styles.activitySubtitle, !item.isRead && styles.unreadSubtitle]}>
                        {item.content}
                    </Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={Theme.colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>School Announcements</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            >
                {isLoading ? (
                    <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
                ) : announcements.length > 0 ? (
                    announcements.map((item, idx) => (
                        <React.Fragment key={item._id}>
                            <AnnouncementItem item={item} />
                            {idx < announcements.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="notifications-none" size={60} color="#d1d5db" />
                        <Text style={styles.emptyText}>No school announcements found</Text>
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
                    <MaterialIcons name="feedback" size={28} color={Theme.colors.primary} />
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
    container: { flex: 1, backgroundColor: '#f8f8f5' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.brandGrey },
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
