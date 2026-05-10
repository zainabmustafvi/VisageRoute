import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AdminStudentCRUD = ({ navigation }) => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchStudents();
        }, [])
    );

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/admin/students`);
            setStudents(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to fetch students list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_BASE_URL}/api/admin/students/${id}`);
                            setStudents(students.filter(s => s._id !== id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete student');
                        }
                    }
                }
            ]
        );
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.rollNo && s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderStudentItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    {item.imageBase64 ? (
                        <Image source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <MaterialCommunityIcons name="account" size={32} color="#9ca3af" />
                        </View>
                    )}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentId}>ID: {item.rollNo || 'N/A'}</Text>
                    <Text style={styles.studentDept}>{item.department || 'General'}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaBadgeYellow}>
                            <Text style={styles.metaBadgeYellowText}>{item.busId?.plateNumber || 'No Bus'}</Text>
                        </View>
                        <View style={styles.metaBadgeGrey}>
                            <Text style={styles.metaBadgeGreyText}>{item.email}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.actionColumn}>
                <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('AdminStudentDetail', { studentId: item._id })}
                >
                    <MaterialCommunityIcons name="eye-outline" size={22} color="#9ca3af" />
                </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item._id, item.name)}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#4b5563" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Management</Text>
                <TouchableOpacity onPress={fetchStudents}>
                    <MaterialCommunityIcons name="refresh" size={24} color="#4b5563" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput 
                        placeholder="Search by name or email..." 
                        style={styles.searchInput}
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('RegisterStudent')}
                >
                    <MaterialCommunityIcons name="account-plus" size={20} color="#111827" />
                    <Text style={styles.addButtonText}>Register New Student</Text>
                </TouchableOpacity>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredStudents}
                        renderItem={renderStudentItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No students found</Text>
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
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    studentId: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#9ca3af',
        marginTop: 1,
    },
    activeDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: colors.brandWhite,
    },
    infoContainer: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    studentDept: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    metaBadgeYellow: {
        backgroundColor: '#fffbeb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    metaBadgeYellowText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#b45309',
    },
    metaBadgeGrey: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    metaBadgeGreyText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    detailsButton: {
        padding: 4,
    },
    actionColumn: {
        gap: 12,
        alignItems: 'center',
    },
    editButton: {
        padding: 8,
        backgroundColor: '#eef2ff',
        borderRadius: 10,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#fef2f2',
        borderRadius: 10,
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

export default AdminStudentCRUD;
