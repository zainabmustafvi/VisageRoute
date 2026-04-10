import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Image, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminBusCRUD = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const [buses, setBuses] = useState([
        { id: '1', busNumber: '101', plate: 'KA-05-AB-1234', capacity: 42, driver: 'Ramesh K.', status: 'Active' },
        { id: '2', busNumber: '104', plate: 'KA-05-CJ-9982', capacity: 32, driver: 'Unassigned', status: 'Maintenance' },
        { id: '3', busNumber: '105', plate: 'KA-05-XY-4567', capacity: 50, driver: 'Suresh M.', status: 'Active' },
    ]);

    const renderBusItem = ({ item }) => (
        <View style={styles.busCard}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconContainer, item.status === 'Active' ? styles.iconActive : styles.iconInactive]}>
                        <MaterialCommunityIcons name="bus" size={24} color={item.status === 'Active' ? '#d97706' : '#9ca3af'} />
                    </View>
                    <View>
                        <Text style={styles.busTitle}>Bus #{item.busNumber}</Text>
                        <Text style={styles.busPlate}>{item.plate}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
                    <Text style={[styles.statusText, item.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>CAPACITY</Text>
                    <Text style={styles.detailValue}>{item.capacity} Seats</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>DRIVER</Text>
                    <Text style={[styles.detailValue, item.driver === 'Unassigned' && styles.unassignedText]}>
                        {item.driver}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.updateButton}
                onPress={() => navigation.navigate('AdminBusDetail', { busId: item.id })}
            >
                <MaterialCommunityIcons name="eye-outline" size={18} color="#111827" />
                <Text style={styles.updateButtonText}>View Details</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#4b5563" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bus Management</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.title}>Bus Management</Text>
                        <Text style={styles.subtitle}>Manage registration & details</Text>
                    </View>
                    <View style={styles.totalBadge}>
                        <Text style={styles.totalText}>Total: 24</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RegisterBus')}>
                    <MaterialCommunityIcons name="plus-circle" size={20} color={colors.brandGrey} />
                    <Text style={styles.addButtonText}>Add New Bus</Text>
                </TouchableOpacity>

                <FlatList
                    data={buses}
                    renderItem={renderBusItem}
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes['2xl'],
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    subtitle: {
        fontSize: typography.sizes.sm,
        color: '#6b7280',
        marginTop: 4,
    },
    totalBadge: {
        backgroundColor: colors.brandWhite,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    totalText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        gap: 8,
        marginBottom: 24,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    listContent: {
        gap: 16,
        paddingBottom: 40,
    },
    busCard: {
        backgroundColor: colors.brandWhite,
        borderRadius: 24,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconActive: {
        backgroundColor: '#fffbeb',
    },
    iconInactive: {
        backgroundColor: '#f9fafb',
    },
    busTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    busPlate: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#6b7280',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusActive: {
        backgroundColor: '#f0fdf4',
        borderColor: '#dcfce7',
    },
    statusInactive: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    statusTextActive: {
        color: '#15803d',
    },
    statusTextInactive: {
        color: '#4b5563',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    unassignedText: {
        color: '#9ca3af',
        fontStyle: 'italic',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
    },
    updateButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brandGrey,
    },
});

export default AdminBusCRUD;
