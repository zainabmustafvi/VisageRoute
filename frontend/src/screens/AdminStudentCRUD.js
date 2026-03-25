import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminStudentCRUD = ({ navigation }) => {
    const [students, setStudents] = useState([
        { id: '1', name: 'Ayesha Khan', studentId: '2024-001', dept: 'Computer Science', route: 'Route 4A', status: 'Active' },
        { id: '2', name: 'Zaid Ahmed', studentId: '2024-045', dept: 'Engineering', route: 'Route 1B', status: 'Active' },
        { id: '3', name: 'Fatima Ali', studentId: '2024-089', dept: 'Arts', route: 'Route 2C', status: 'Active' },
    ]);

    const renderStudentItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        <MaterialCommunityIcons name="account" size={32} color="#9ca3af" />
                    </View>
                    <View style={styles.activeDot} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentDept}>{item.dept}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaBadgeYellow}>
                            <Text style={styles.metaBadgeYellowText}>{item.route}</Text>
                        </View>
                        <View style={styles.metaBadgeGrey}>
                            <Text style={styles.metaBadgeGreyText}>ID: {item.studentId}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => navigation.navigate('AdminStudentDetail', { studentId: item.id })}
                >
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
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
                <Text style={styles.headerTitle}>Student Management</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput 
                        placeholder="Search by name or ID..." 
                        style={styles.searchInput}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RegisterStudent')}>
                    <MaterialCommunityIcons name="account-plus" size={20} color="#111827" />
                    <Text style={styles.addButtonText}>Register New Student</Text>
                </TouchableOpacity>

                <FlatList
                    data={students}
                    renderItem={renderStudentItem}
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
});

export default AdminStudentCRUD;
