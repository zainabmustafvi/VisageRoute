import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, ActivityIndicator
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';
import { API_BASE_URL } from '../config/api';

const DriverProfile = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const response = await axios.get(`${API_BASE_URL}/api/driver/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
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
        await SecureStore.deleteItemAsync('driverId');
        await SecureStore.deleteItemAsync('assignedBusId');
        await SecureStore.deleteItemAsync('socketToken');
        navigation.replace('Login');
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </SafeAreaView>
        );
    }

    const formatValue = (val) => val || "Not provided";
    const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "Not provided";

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <MaterialIcons name="logout" size={18} color={Theme.colors.textSecondaryLight} />
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.colors.primary]} />
                }
            >
                <View style={styles.profileSection}>
                    <Text style={styles.driverName}>{profile?.name || 'Driver'}</Text>
                    <View style={styles.roleContainer}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{profile?.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
                        </View>
                        <Text style={styles.roleText}>Bus Driver</Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.cardLabel}>PERSONAL INFORMATION</Text>
                    
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="badge" size={20} color={Theme.colors.textSecondaryLight} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Employee ID</Text>
                            <Text style={styles.infoValue}>{formatValue(profile?.employeeId)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="call" size={20} color={Theme.colors.textSecondaryLight} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>{formatValue(profile?.phone)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="drive-eta" size={20} color={Theme.colors.textSecondaryLight} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>License Number</Text>
                            <Text style={styles.infoValue}>{formatValue(profile?.licenseNumber)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="event" size={20} color={Theme.colors.textSecondaryLight} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>License Expiry</Text>
                            <Text style={styles.infoValue}>{formatDate(profile?.licenseExpiry)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardLabel}>VEHICLE ASSIGNMENT</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: Theme.colors.primary + '20' }]}>
                            <MaterialIcons name="directions-bus" size={22} color={Theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Bus Number</Text>
                            <Text style={styles.infoValue}>{profile?.bus ? `Bus ${profile.bus.busNumber}` : 'Not Assigned'}</Text>
                        </View>
                        {profile?.bus && (
                            <View style={styles.assignedBadge}>
                                <Text style={styles.assignedText}>Assigned</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.gridRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Plate Number</Text>
                            <Text style={[styles.infoValue, styles.monoText]}>{formatValue(profile?.bus?.plateNumber)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Bus Capacity</Text>
                            <Text style={styles.infoValue}>{profile?.bus?.capacity ? `${profile.bus.capacity} Passengers` : 'Not provided'}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundLight,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: Theme.typography.sizes['3xl'],
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        letterSpacing: -0.5,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.brandWhite,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Theme.borderRadius.full,
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
        elevation: 2,
    },
    logoutText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.textSecondaryLight,
        marginLeft: 6,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 4,
        borderColor: Theme.colors.brandWhite,
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: Theme.colors.primary,
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: Theme.colors.brandWhite,
        elevation: 4,
    },
    driverName: {
        fontSize: Theme.typography.sizes['2xl'],
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 8,
    },
    statusBadge: {
        backgroundColor: Theme.colors.brandGrey,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: Theme.colors.primary,
        fontSize: 10,
        fontWeight: '900',
    },
    roleText: {
        fontSize: Theme.typography.sizes.sm,
        fontWeight: '700',
        color: Theme.colors.textSecondaryLight,
    },
    infoCard: {
        backgroundColor: Theme.colors.brandWhite,
        borderRadius: Theme.borderRadius.xl,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
        elevation: 1,
    },
    cardLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: Theme.colors.textSecondaryLight,
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 10,
        color: Theme.colors.textSecondaryLight,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: Theme.typography.sizes.base,
        fontWeight: '800',
        color: Theme.colors.brandGrey,
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.borderLight,
        marginVertical: 16,
        opacity: 0.5,
    },
    assignedBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    assignedText: {
        color: '#15803d',
        fontSize: 10,
        fontWeight: '800',
    },
    gridRow: {
        flexDirection: 'row',
        gap: 16,
    },
    monoText: {
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
});

export default DriverProfile;
