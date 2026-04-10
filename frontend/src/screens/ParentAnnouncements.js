import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const ParentAnnouncements = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All');

    const AnnouncementItem = ({ icon, title, subtitle, time, status, urgent, color }) => (
        <TouchableOpacity style={[styles.announcementItem, urgent && styles.urgentItem]}>
            <View style={styles.itemLeft}>
                <View style={[styles.itemIconBox, { backgroundColor: urgent ? 'white' : '#f1f5f9' }]}>
                    <MaterialIcons name={icon} size={24} color={urgent ? '#d97706' : '#64748b'} />
                </View>
                <View style={{flex: 1}}>
                    <View style={styles.itemHeader}>
                        <View style={styles.titleRow}>
                            <Text style={styles.itemTitle}>{title}</Text>
                            {status === 'unread' && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.itemTime}>{time}</Text>
                    </View>
                    <Text style={[styles.itemLabel, urgent && { color: '#b45309' }]}>{urgent ? 'Urgent Update' : 'General'}</Text>
                    <Text style={styles.itemSubtitle}>{subtitle}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const TabButton = ({ title }) => (
        <TouchableOpacity 
            style={[styles.tabBtn, activeTab === title && styles.tabBtnActive]} 
            onPress={() => setActiveTab(title)}
        >
            <Text style={[styles.tabText, activeTab === title && styles.tabTextActive]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Announcements</Text>
                    <TouchableOpacity>
                        <Text style={styles.markReadText}>Mark all read</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TabButton title="All" />
                    <TabButton title="Urgent" />
                    <TabButton title="General" />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Announcement List */}
                <AnnouncementItem 
                    icon="warning" 
                    title="Bus Route 5 Delayed" 
                    subtitle="Heavy traffic on Main St due to construction. Expected delay is approximately 15 minutes." 
                    time="10m ago" 
                    status="unread" 
                    urgent={true}
                    color="#f59e0b"
                />
                
                <AnnouncementItem 
                    icon="calendar-month" 
                    title="Holiday Schedule" 
                    subtitle="Reminder: No bus service on Monday, Nov 12th in observance of Veterans Day. Normal service resumes Tuesday." 
                    time="2h ago" 
                    status="unread" 
                    urgent={false}
                />

                <AnnouncementItem 
                    icon="build" 
                    title="App Maintenance" 
                    subtitle="Scheduled downtime this Saturday from 2 AM - 4 AM for system upgrades. Tracking will be unavailable." 
                    time="Yesterday" 
                    status="read" 
                    urgent={false}
                />

                <AnnouncementItem 
                    icon="alt-route" 
                    title="Route 3 Adjustment" 
                    subtitle="The stop at Lincoln Park has been moved 50 meters north for safety improvements." 
                    time="2d ago" 
                    status="read" 
                    urgent={false}
                />
            </ScrollView>

            {/* Bottom Nav */}
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
    container: {
        flex: 1,
        backgroundColor: '#f8f8f5',
    },
    header: {
        backgroundColor: '#f8f8f5',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    markReadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#b45309',
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tabBtn: {
        paddingBottom: 12,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: Theme.colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#0f172a',
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
        gap: 16,
        paddingBottom: 100,
    },
    announcementItem: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    urgentItem: {
        backgroundColor: '#fffbeb',
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.primary,
    },
    itemLeft: {
        flexDirection: 'row',
        gap: 16,
    },
    itemIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    itemTime: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    itemLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    itemSubtitle: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
    },
});

export default ParentAnnouncements;
