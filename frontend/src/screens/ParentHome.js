import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';

const ParentHome = ({ navigation }) => {
    
    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userRole');
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
                    <MaterialIcons name="notifications" size={24} color="#9ca3af" />
                    <View style={styles.dot} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Welcome Section */}
                <View style={styles.welcomeRow}>
                    <View>
                        <Text style={styles.greeting}>Good afternoon,</Text>
                        <Text style={styles.userName}>Mrs Safdr</Text>
                    </View>
                    <View style={styles.liveBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.liveBadgeText}>Live Tracking</Text>
                    </View>
                </View>

                {/* Status Cards */}
                <View style={styles.statusGrid}>
                    {/* Arrival Card */}
                    <View style={[styles.card, styles.arrivalCard]}>
                        <MaterialIcons name="directions-bus" size={80} color="rgba(0,0,0,0.1)" style={styles.bgIcon} />
                        <View style={styles.cardHeader}>
                            <View style={styles.cardIconBox}>
                                <MaterialIcons name="schedule" size={18} color={Theme.colors.brandGrey} />
                            </View>
                        </View>
                        <Text style={styles.cardLabelText}>ESTIMATED ARRIVAL</Text>
                        <Text style={styles.arrivalValue}>14<Text style={styles.unitText}>min</Text></Text>
                        <View style={styles.busInfo}>
                            <View style={styles.busBadge}><Text style={styles.busBadgeText}>Bus #42</Text></View>
                            <Text style={styles.busSub}>to Home</Text>
                        </View>
                    </View>

                    {/* Student Card */}
                    <TouchableOpacity style={[styles.card, styles.studentCard]}>
                        <View style={styles.studentTop}>
                            <View style={styles.avatar}>
                                <MaterialIcons name="face" size={32} color="#3b82f6" />
                            </View>
                            <View style={styles.safeBadge}>
                                <Text style={styles.safeBadgeText}>SAFE</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.studentName}>Amna</Text>
                            <View style={styles.onBoardRow}>
                                <MaterialIcons name="check-circle" size={14} color="#22c55e" />
                                <Text style={styles.onBoardText}>On Board</Text>
                            </View>
                            <Text style={styles.checkInTime}>Checked in 3:30 PM</Text>
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
                            onPress={() => navigation.navigate('ParentTrackBus')}
                        />
                        <QuickAccessItem 
                            icon="calendar-today" 
                            title="Weekly Schedule" 
                            subtitle="View pick-up & drop-off times" 
                            color="#3b82f6"
                            onPress={() => navigation.navigate('ParentSchedule')}
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
                <View style={styles.announcementCard}>
                    <View style={styles.announcementHeader}>
                        <View style={styles.announcementTitleRow}>
                            <MaterialIcons name="campaign" size={20} color={Theme.colors.primary} />
                            <Text style={styles.announcementTitle}>Announcement</Text>
                        </View>
                        <View style={styles.tag}><Text style={styles.tagText}>Today</Text></View>
                    </View>
                    <Text style={styles.announcementText}>
                        School will close early tomorrow at <Text style={{fontWeight: 'bold', color: 'white'}}>1:00 PM</Text> for staff development. Please check updated bus schedules.
                    </Text>
                    <TouchableOpacity 
                        style={styles.detailsBtn}
                        onPress={() => navigation.navigate('ParentAnnouncements')}
                    >
                        <Text style={styles.detailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="home" size={28} color={Theme.colors.primary} />
                    <Text style={[styles.navText, { color: Theme.colors.primary }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentTrackBus')}>
                    <MaterialIcons name="map" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentSchedule')}>
                    <MaterialIcons name="event-note" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentAnnouncements')}>
                    <MaterialIcons name="feedback" size={28} color="#9ca3af" />
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
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    logoutBtn: {
        padding: 5,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerAppName: {
        fontSize: 18,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    headerSub: {
        fontSize: 9,
        fontWeight: '800',
        color: '#9ca3af',
        letterSpacing: 1.5,
    },
    notificationBtn: {
        padding: 5,
        position: 'relative',
    },
    dot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        backgroundColor: Theme.colors.primary,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'white',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    welcomeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
        color: '#6b7280',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    liveBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#92400e',
    },
    statusGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    card: {
        flex: 1,
        height: 176,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
    },
    arrivalCard: {
        backgroundColor: Theme.colors.primary,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    bgIcon: {
        position: 'absolute',
        right: -20,
        top: -10,
        transform: [{ rotate: '15deg' }],
    },
    cardHeader: {
        flexDirection: 'row',
    },
    cardIconBox: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        padding: 6,
        borderRadius: 8,
    },
    cardLabelText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.6)',
        letterSpacing: 0.5,
    },
    arrivalValue: {
        fontSize: 40,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    unitText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    busInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    busBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    busBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    busSub: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.6)',
        fontWeight: '500',
    },
    studentCard: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    studentTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    safeBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    safeBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#15803d',
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    onBoardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    onBoardText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
    },
    checkInTime: {
        fontSize: 9,
        color: '#9ca3af',
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        letterSpacing: 1,
        marginBottom: 12,
    },
    qaList: {
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    qaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    qaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    qaIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qaTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    qaSubtitle: {
        fontSize: 11,
        color: '#6b7280',
    },
    announcementCard: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    announcementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    announcementTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    announcementTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tag: {
        backgroundColor: '#1f2937',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        color: '#9ca3af',
        fontWeight: 'bold',
    },
    announcementText: {
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    detailsBtn: {
        backgroundColor: 'white',
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsBtnText: {
        color: Theme.colors.brandGrey,
        fontWeight: 'bold',
        fontSize: 14,
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

export default ParentHome;
