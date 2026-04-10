import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const ParentNotifications = ({ navigation }) => {
    const [arrivalNotify, setArrivalNotify] = useState(true);
    const [startNotify, setStartNotify] = useState(true);
    const [onBoardNotify, setOnBoardNotify] = useState(false);

    const SettingItem = ({ icon, title, subtitle, value, onToggle, color }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${color}10` }]}>
                    <MaterialIcons name={icon} size={24} color={color} />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <Switch 
                value={value} 
                onValueChange={onToggle}
                trackColor={{ false: '#e5e7eb', true: Theme.colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
            />
        </View>
    );

    const ActivityItem = ({ icon, title, subtitle, time, color }) => (
        <View style={styles.activityItem}>
            <MaterialIcons name={icon} size={18} color={color} />
            <View style={{flex: 1}}>
                <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{title}</Text>
                    <Text style={styles.activityTime}>{time}</Text>
                </View>
                <Text style={styles.activitySubtitle}>{subtitle}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={Theme.colors.brandGrey} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <Text style={styles.headerSub}>PREFERENCES</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.settingsBtn}>
                    <MaterialIcons name="settings" size={24} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Alert Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ALERT SETTINGS</Text>
                    <View style={styles.card}>
                        <SettingItem 
                            icon="notifications-active" 
                            title="Arrival Push Notify" 
                            subtitle="Get notified when bus is nearby" 
                            value={arrivalNotify} 
                            onToggle={setArrivalNotify}
                            color="#f59e0b"
                        />
                        <View style={styles.divider} />
                        <SettingItem 
                            icon="schedule-send" 
                            title="Start Notification" 
                            subtitle="Alert when the route starts" 
                            value={startNotify} 
                            onToggle={setStartNotify}
                            color="#3b82f6"
                        />
                        <View style={styles.divider} />
                        <SettingItem 
                            icon="child-care" 
                            title="On Board Child Notification" 
                            subtitle="Know when Amna is on board" 
                            value={onBoardNotify} 
                            onToggle={setOnBoardNotify}
                            color="#22c55e"
                        />
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
                    <View style={styles.card}>
                        <ActivityItem 
                            icon="directions-bus" 
                            title="Bus #42 is arriving" 
                            subtitle="Approaching your location" 
                            time="2m ago" 
                            color="#f59e0b"
                        />
                        <View style={styles.divider} />
                        <ActivityItem 
                            icon="check-circle" 
                            title="Amna safely on board" 
                            subtitle="Checked in at 7:15 AM" 
                            time="6h ago" 
                            color="#22c55e"
                        />
                        <View style={styles.divider} />
                        <ActivityItem 
                            icon="schedule" 
                            title="Morning Route Started" 
                            subtitle="Bus #42 left the station" 
                            time="7h ago" 
                            color="#3b82f6"
                        />
                    </View>
                </View>

                <View style={styles.footerNote}>
                    <Text style={styles.footerNoteText}>
                        Push notifications are sent to your current device. To receive alerts via SMS or Email, please visit your{' '}
                        <Text style={styles.footerLink}>Profile Settings</Text>.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Nav Placeholder */}
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    headerSub: {
        fontSize: 9,
        fontWeight: '800',
        color: '#9ca3af',
        letterSpacing: 1.5,
    },
    settingsBtn: {
        padding: 5,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        letterSpacing: 1,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    itemSubtitle: {
        fontSize: 11,
        color: '#6b7280',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f9fafb',
        marginHorizontal: 16,
    },
    activityItem: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.brandGrey,
    },
    activityTime: {
        fontSize: 10,
        color: '#9ca3af',
    },
    activitySubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    footerNote: {
        paddingHorizontal: 8,
        marginTop: 8,
    },
    footerNoteText: {
        fontSize: 11,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 18,
    },
    footerLink: {
        color: Theme.colors.primary,
        fontWeight: '600',
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

export default ParentNotifications;
