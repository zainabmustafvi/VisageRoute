import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminDriverDetail = ({ navigation, route }) => {
    // Mock data for driver details
    const driver = {
        name: 'Sadaat Malik',
        status: 'On Route',
        id: 'DRV-2024-88',
        license: 'DL-99887766',
        dob: 'Jan 15, 1980',
        phone: '+1 (555) 012-3456',
        address: '4521 Elm Street, Springfield, IL 62704',
        busNo: 'Bus #42 (Yellow Bird)',
        busCapacity: '45 Students',
        routeName: 'Route 5 - North Campus',
        shift: 'Morning & Evening',
        joined: 'Aug 15, 2021',
        experience: '5 Years',
        contract: 'Full Time',
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Driver Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{driver.status}</Text>
                    </View>
                    <Text style={styles.driverId}>ID: {driver.id}</Text>
                </View>

                {/* Personal Info */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
                        <Text style={styles.cardTitle}>Personal Info</Text>
                    </View>
                    <View style={styles.infoList}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>License No.</Text>
                            <Text style={styles.infoValue}>{driver.license}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Date of Birth</Text>
                            <Text style={styles.infoValue}>{driver.dob}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{driver.phone}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={[styles.infoItem, { alignItems: 'flex-start' }]}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={[styles.infoValue, styles.addressText]}>{driver.address}</Text>
                        </View>
                    </View>
                </View>

                {/* Assigned Route */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="routes" size={24} color={colors.primary} />
                            <Text style={styles.cardTitle}>Assigned Route</Text>
                        </View>
                        <TouchableOpacity style={styles.mapBadge}>
                            <Text style={styles.mapBadgeText}>View Map</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.busInfoBox}>
                        <View style={styles.busIconContainer}>
                             <MaterialCommunityIcons name="bus" size={32} color={colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.busName}>{driver.busNo}</Text>
                            <Text style={styles.busCapacity}>Capacity: {driver.busCapacity}</Text>
                        </View>
                    </View>

                    <View style={styles.infoList}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Route Name</Text>
                            <Text style={styles.infoValue}>{driver.routeName}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Shift</Text>
                            <Text style={styles.infoValue}>{driver.shift}</Text>
                        </View>
                    </View>
                </View>

                {/* Employment */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="file-document-edit-outline" size={24} color={colors.primary} />
                        <Text style={styles.cardTitle}>Employment</Text>
                    </View>
                    <View style={styles.infoList}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Date Joined</Text>
                            <Text style={styles.infoValue}>{driver.joined}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Experience</Text>
                            <Text style={styles.infoValue}>{driver.experience}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Contract Type</Text>
                            <Text style={styles.infoValue}>{driver.contract}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionColumn}>
                    <TouchableOpacity style={styles.editButton}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#000" />
                        <Text style={styles.editButtonText}>Edit Driver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton}>
                        <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
                        <Text style={styles.deleteButtonText}>Delete Driver</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        backgroundColor: '#f8f8f5',
    },
    backButton: {
        marginLeft: -10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollPadding: {
        padding: spacing.lg,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    driverName: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.brandGrey,
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: 'Manrope-ExtraBold',
    },
    statusBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#15803d',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    driverId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8c8b5f',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    infoList: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 14,
        color: '#8c8b5f',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.brandGrey,
    },
    addressText: {
        textAlign: 'right',
        maxWidth: '60%',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
    },
    mapBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    mapBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#8c8b5f',
    },
    busInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#f8f8f5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    busIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: colors.primary + '33',
        alignItems: 'center',
        justifyContent: 'center',
    },
    busName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    busCapacity: {
        fontSize: 12,
        color: '#8c8b5f',
        marginTop: 2,
    },
    actionColumn: {
        gap: 12,
        paddingTop: 8,
    },
    editButton: {
        backgroundColor: colors.primary,
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    deleteButton: {
        backgroundColor: '#fef2f2',
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
});

export default AdminDriverDetail;
