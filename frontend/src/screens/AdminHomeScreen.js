import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const AdminHomeScreen = ({ navigation }) => {
    const [stats, setStats] = useState({ buses: 0, students: 0, drivers: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const res = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchStats();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View>
                        <Text style={styles.headerSubtitle}>ADMIN PORTAL</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
                    <MaterialCommunityIcons name="logout" size={20} color={colors.brandGrey} />
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            >
                {/* Welcome Message */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeSub}>Good morning,</Text>
                    <Text style={styles.welcomeMain}>Administrator</Text>
                </View>

                {/* Stats Section */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity
                        style={[styles.statsCard, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('AdminBusCRUD')}
                    >
                        <View style={styles.statsCardIconBg}>
                            <MaterialCommunityIcons name="bus" size={24} color={colors.brandGrey} />
                        </View>
                        <MaterialCommunityIcons name="arrow-top-right" size={20} color={colors.brandGrey} style={styles.statsCardArrow} />
                        <View>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.brandGrey} />
                            ) : (
                                <Text style={styles.statsNumber}>{stats.buses}</Text>
                            )}
                            <Text style={styles.statsLabel}>ACTIVE BUSES</Text>
                        </View>
                        <MaterialCommunityIcons name="bus" size={100} color={colors.brandGrey} style={styles.statsCardBgIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statsCard, styles.statsCardWhite]}
                        onPress={() => navigation.navigate('AdminStudentCRUD')}
                    >
                        <View style={styles.statsCardIconBgLight}>
                            <MaterialCommunityIcons name="school" size={24} color="#4b5563" />
                        </View>
                        <View>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#4b5563" />
                            ) : (
                                <Text style={styles.statsNumberDark}>{stats.students}</Text>
                            )}
                            <Text style={styles.statsLabelLight}>TOTAL STUDENTS</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Management Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MANAGEMENT</Text>
                    <View style={styles.managementCard}>
                        {/* New Bus */}
                        <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('RegisterBus')}>
                            <View style={[styles.itemIconContainer, { backgroundColor: '#fef9c3' }]}>
                                <MaterialCommunityIcons name="plus-circle" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemTitle}>Register New Bus</Text>
                                <Text style={styles.itemSubtitle}>Add basic vehicle details</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* New Student */}
                        <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('RegisterStudent')}>
                            <View style={[styles.itemIconContainer, { backgroundColor: '#f3f4f6' }]}>
                                <MaterialCommunityIcons name="account-plus" size={20} color="#6b7280" />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemTitle}>Register Student</Text>
                                <Text style={styles.itemSubtitle}>Enroll new student for transport</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* New Driver */}
                        <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('RegisterDriver')}>
                            <View style={[styles.itemIconContainer, { backgroundColor: '#f3f4f6' }]}>
                                <MaterialCommunityIcons name="badge-account-horizontal" size={20} color="#6b7280" />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemTitle}>Register Driver</Text>
                                <Text style={styles.itemSubtitle}>Onboard new vehicle driver</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>

                         <View style={styles.divider} />

                        {/* Announcements */}
                        <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('AdminAnnouncement')}>
                            <View style={[styles.itemIconContainer, { backgroundColor: '#fee2e2' }]}>
                                <MaterialCommunityIcons name="bullhorn" size={20} color="#ef4444" />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemTitle}>Make Announcement</Text>
                                <Text style={styles.itemSubtitle}>Broadcast to parents & students</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Operations Section */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>OPERATIONS</Text>
                    <View style={styles.managementCard}>
                        <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('UploadSchedule')}>
                            <View style={[styles.itemIconContainer, { backgroundColor: '#ecfdf5' }]}>
                                <MaterialCommunityIcons name="file-upload" size={20} color="#10b981" />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemTitle}>Upload Schedule</Text>
                                <Text style={styles.itemSubtitle}>Bulk import CSV/XLSX schedules</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        paddingHorizontal: spacing.lg,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#9ca3af',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    logoutText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    welcomeSection: {
        marginBottom: 25,
    },
    welcomeSub: {
        fontSize: 16,
        color: '#6b7280',
    },
    welcomeMain: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    statsCard: {
        flex: 1,
        height: 160,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    statsCardWhite: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statsCardIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsCardIconBgLight: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsCardArrow: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    statsNumber: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.brandGrey,
    },
    statsNumberDark: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.brandGrey,
    },
    statsLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.5)',
        letterSpacing: 0.5,
    },
    statsLabelLight: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 0.5,
    },
    statsCardBgIcon: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        opacity: 0.1,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#9ca3af',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 5,
    },
    managementCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    managementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 15,
    },
    itemIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginHorizontal: 16,
    },
});

export default AdminHomeScreen;
