import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, RefreshControl, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ParentProfile = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const res = await axios.get(`${API_BASE_URL}/api/parent/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (error) {
            console.error('Error fetching parent profile:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userRole');
        await SecureStore.deleteItemAsync('socketToken');
        navigation.replace('Login');
    };

    const formatValue = (val) => val || "Not provided";

    const InfoItem = ({ icon, label, value, color }) => (
        <View style={styles.infoItem}>
            <View style={[styles.infoIconBox, { backgroundColor: `${color}10` }]}>
                <MaterialIcons name={icon} size={20} color={color} />
            </View>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    const StudentField = ({ label, value, icon, badge }) => (
        <View style={styles.studentField}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldRow}>
                {icon && <MaterialIcons name={icon} size={14} color="#9ca3af" style={{marginRight: 4}} />}
                {badge ? (
                    <View style={styles.badge}><Text style={styles.badgeText}>{value}</Text></View>
                ) : (
                    <Text style={styles.fieldValue}>{value}</Text>
                )}
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    const shortId = profile?.parent?.parentId ? `#P-${profile.parent.parentId.substring(18).toUpperCase()}` : 'N/A';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={Theme.colors.brandGrey} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Profile</Text>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.colors.primary]} />
                }
            >
                <View style={styles.profileHeader}>
                    <Text style={styles.userName}>{profile?.parent?.parentName || 'Parent Account'}</Text>
                    <Text style={styles.userRole}>Parent Portal</Text>
                </View>

                {/* Parent Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PARENT INFORMATION</Text>
                    <View style={styles.infoCard}>
                        <InfoItem icon="badge" label="Parent ID" value={shortId} color="#6b7280" />
                        <View style={styles.divider} />
                        <InfoItem icon="call" label="Contact Number" value={formatValue(profile?.parent?.phone)} color={Theme.colors.primary} />
                        <View style={styles.divider} />
                        <InfoItem icon="mail" label="Email Address" value={formatValue(profile?.parent?.parentEmail)} color="#3b82f6" />
                    </View>
                </View>

                {/* Student Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>STUDENT PROFILE</Text>
                    {profile?.children && profile.children.length > 0 ? (
                        profile.children.map((child, idx) => (
                            <View key={child.id || idx} style={[styles.studentCard, { marginBottom: 16 }]}>
                                <View style={styles.gradientOverlay} />
                                <View style={styles.studentTop}>
                                    <View style={styles.avatarLarge}>
                                        <MaterialIcons name="face" size={40} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text style={styles.studentName}>{child.name || 'Child'}</Text>
                                        <View style={styles.statusBadge}>
                                            <View style={styles.pulseDot} />
                                            <Text style={styles.statusBadgeText}>Active Student</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.studentGrid}>
                                    <StudentField label="Registration ID" value={formatValue(child.rollNo)} />
                                    <StudentField label="Grade" value={formatValue(child.grade)} icon="school" />
                                    <StudentField label="Assigned Bus" value={child.busNumber ? `Bus #${child.busNumber}` : 'Not Assigned'} icon="directions-bus" badge />
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.studentCard}>
                            <Text style={styles.fieldValue}>No children registered.</Text>
                        </View>
                    )}
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPPORT</Text>
                    <View style={styles.supportCard}>
                        <TouchableOpacity style={styles.supportItem} onPress={handleLogout}>
                            <View style={styles.supportLeft}>
                                <MaterialIcons name="logout" size={20} color="#ef4444" />
                                <Text style={[styles.supportText, { color: '#ef4444' }]}>Log Out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.versionText}>VisageRoute App v1.0.0 (Build 2026)</Text>
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
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentAnnouncements')}>
                    <MaterialIcons name="notifications" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Alerts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="person" size={28} color={Theme.colors.primary} />
                    <Text style={[styles.navText, { color: Theme.colors.primary }]}>Profile</Text>
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
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    profileHeader: {
        marginBottom: 24,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    userRole: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#9ca3af',
        letterSpacing: 1.5,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: Theme.colors.brandGrey,
    },
    divider: {
        height: 1,
        backgroundColor: '#f9fafb',
        marginHorizontal: 16,
    },
    studentCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 100,
        height: 100,
        backgroundColor: 'rgba(242, 204, 13, 0.05)',
        borderBottomLeftRadius: 100,
    },
    studentTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    avatarLarge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 5,
        marginTop: 4,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    studentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    studentField: {
        flexBasis: '45%',
    },
    fieldLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 5,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    badge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#92400e',
    },
    supportCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    supportItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    supportLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    supportText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4b5563',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 10,
        color: '#d1d5db',
        marginTop: 30,
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

export default ParentProfile;
