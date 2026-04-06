import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminDriverCRUD = ({ navigation }) => {
    const [drivers, setDrivers] = useState([
        { id: '1', name: 'Sadaat Malik', driverId: 'DRV-001', status: 'Active', phone: '(555) 000-0000' },
        { id: '2', name: 'Ali Raza', driverId: 'DRV-004', status: 'Off Duty', phone: '(555) 111-1111' },
        { id: '3', name: 'Sana Javed', driverId: 'DRV-009', status: 'Active', phone: '(555) 222-2222' },
    ]);

    const renderDriverItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: item.status === 'Active' ? '#f0fdf4' : '#f3f4f6' }]}>
                    <MaterialCommunityIcons name="account-tie" size={32} color={item.status === 'Active' ? '#22c55e' : '#9ca3af'} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.driverName}>{item.name}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
                            <Text style={[styles.statusText, item.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
                                {item.status}
                            </Text>
                        </View>
                        <Text style={styles.driverId}>ID: #{item.driverId}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => navigation.navigate('AdminDriverDetail', { driverId: item.id })}
                >
                    <Text style={styles.detailsText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#4b5563" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Driver Management</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.pageHeader}>
                    <Text style={styles.title}>Registered Drivers</Text>
                    <Text style={styles.totalText}>Total: 12</Text>
                </View>

                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RegisterDriver')}>
                    <MaterialCommunityIcons name="account-plus" size={20} color="#111827" />
                    <Text style={styles.addButtonText}>Add New Driver</Text>
                </TouchableOpacity>

                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search by name or ID..."
                        style={styles.searchInput}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                <FlatList
                    data={drivers}
                    renderItem={renderDriverItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.brandWhite,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    totalText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        gap: 8,
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.brandWhite,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.brandGrey,
    },
    listContent: {
        gap: 12,
    },
    card: {
        backgroundColor: colors.brandWhite,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
    },
    driverName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusActive: {
        backgroundColor: '#f0fdf4',
    },
    statusInactive: {
        backgroundColor: '#f3f4f6',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusTextActive: {
        color: '#166534',
    },
    statusTextInactive: {
        color: '#4b5563',
    },
    driverId: {
        fontSize: 12,
        color: '#6b7280',
    },
    detailsButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    detailsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
    },
    endText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 24,
        marginBottom: 40,
    },
});

export default AdminDriverCRUD;
