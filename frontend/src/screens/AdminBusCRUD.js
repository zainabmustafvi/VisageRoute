import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

const AdminBusCRUD = ({ navigation }) => {
    const [buses, setBuses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchBuses();
        }, [])
    );

    const fetchBuses = async () => {
        try {
            setIsLoading(true);
            const token = await SecureStore.getItemAsync('socketToken');
            const response = await axios.get(`${API_BASE_URL}/api/admin/buses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBuses(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to fetch buses list');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBuses = buses.filter(b => 
        (b.busNumber && b.busNumber.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (b.plateNumber && b.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderBusItem = ({ item }) => (
        <View style={styles.busCard}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconContainer, item.status === 'available' ? styles.iconActive : styles.iconMaintenance]}>
                        <MaterialCommunityIcons 
                            name="bus" 
                            size={24} 
                            color={item.status === 'available' ? '#d97706' : '#ef4444'} 
                        />
                    </View>
                    <View>
                        <Text style={styles.busTitle}>Bus #{item.busNumber}</Text>
                        <Text style={styles.busPlate}>{item.plateNumber}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, item.status === 'available' ? styles.statusActive : styles.statusMaintenance]}>
                    <Text style={[styles.statusText, item.status === 'available' ? styles.statusTextActive : styles.statusTextMaintenance]}>
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
                    <Text style={[styles.detailValue, !item.driverId && styles.unassignedText]}>
                        {item.driverId?.name || 'Unassigned'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.updateButton}
                onPress={() => navigation.navigate('AdminBusDetail', { busId: item._id })}
            >
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#111827" />
                <Text style={styles.updateButtonText}>Edit Details</Text>
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
                <TouchableOpacity onPress={fetchBuses}>
                    <MaterialCommunityIcons name="refresh" size={24} color="#4b5563" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput 
                        placeholder="Search by bus number or plate..." 
                        style={styles.searchInput}
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RegisterBus')}>
                    <MaterialCommunityIcons name="plus-circle" size={20} color={colors.brandGrey} />
                    <Text style={styles.addButtonText}>Add New Bus</Text>
                </TouchableOpacity>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredBuses}
                        renderItem={renderBusItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No buses found</Text>
                            </View>
                        }
                    />
                )}
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.brandWhite,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: spacing.md,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.brandGrey,
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 16,
        gap: 8,
        marginBottom: spacing.lg,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    listContent: {
        paddingBottom: 40,
        gap: 16,
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
    iconMaintenance: {
        backgroundColor: '#fef2f2',
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
    statusMaintenance: {
        backgroundColor: '#fef2f2',
        borderColor: '#fee2e2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    statusTextActive: {
        color: '#15803d',
    },
    statusTextMaintenance: {
        color: '#ef4444',
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
    },
});

export default AdminBusCRUD;
