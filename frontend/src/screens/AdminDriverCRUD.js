import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AdminDriverCRUD = ({ navigation }) => {
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchDrivers();
        }, [])
    );

    const fetchDrivers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/admin/drivers`);
            setDrivers(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to fetch drivers list');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.employeeId && d.employeeId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderDriverItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        <MaterialCommunityIcons name="account-tie" size={32} color="#9ca3af" />
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: item.isActive !== false ? '#22c55e' : '#ef4444' }]} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.driverName}>{item.name}</Text>
                    <Text style={styles.driverId}>ID: {item.userId} • Emp ID: {item.employeeId || 'N/A'}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaBadgeGrey}>
                            <MaterialCommunityIcons name="bus" size={12} color="#4b5563" />
                            <Text style={styles.metaBadgeGreyText}>Bus: {item.assignedBusId ? 'Assigned' : 'Unassigned'}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item.isActive !== false ? '#f0fdf4' : '#fef2f2' }]}>
                            <Text style={[styles.statusText, { color: item.isActive !== false ? '#15803d' : '#ef4444' }]}>
                                {item.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('AdminDriverDetail', { driverId: item._id })}
                >
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
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
                <TouchableOpacity onPress={fetchDrivers}>
                    <MaterialCommunityIcons name="refresh" size={24} color="#4b5563" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput 
                        placeholder="Search by name, ID or Employee ID..." 
                        style={styles.searchInput}
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('RegisterDriver')}
                >
                    <MaterialCommunityIcons name="account-plus-outline" size={20} color="#111827" />
                    <Text style={styles.addButtonText}>Register New Driver</Text>
                </TouchableOpacity>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredDrivers}
                        renderItem={renderDriverItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No drivers found</Text>
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
    listContent: {
        paddingBottom: 40,
        gap: 12,
    },
    card: {
        backgroundColor: colors.brandWhite,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        padding: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: colors.brandWhite,
    },
    infoContainer: {
        flex: 1,
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    driverId: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 2,
        fontWeight: '500',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    metaBadgeGrey: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 4,
    },
    metaBadgeGreyText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    viewButton: {
        padding: 8,
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

export default AdminDriverCRUD;
