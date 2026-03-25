import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminStudentDetail = ({ navigation, route }) => {
    // In a real app, we would fetch student data using the ID from route.params
    const student = {
        name: 'Ayesha Khan',
        dept: 'Computer Science Dept.',
        route: 'Route 4A',
        id: '2024-001',
        year: '3rd Year (Junior)',
        semester: 'Fall 2024',
        rollNo: 'CS-21-045',
        pickup: 'Gulberg Main Stop',
        busNo: 'LEV-892',
        phone: '+92 300 1234567',
        email: 'ayesha.k@uni.edu.pk',
        guardian: 'Mr. Khan (+92 321 7654321)',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Details</Text>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: student.image }} style={styles.profileImage} />
                        <View style={styles.activeBadge}>
                            <MaterialCommunityIcons name="check" size={14} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentDept}>{student.dept}</Text>
                    
                    <View style={styles.badgeRow}>
                        <View style={styles.routeBadge}>
                            <Text style={styles.routeBadgeText}>{student.route}</Text>
                        </View>
                        <View style={styles.idBadge}>
                            <Text style={styles.idBadgeText}>ID: {student.id}</Text>
                        </View>
                    </View>
                </View>

                {/* Information Sections */}
                <View style={styles.infoContainer}>
                    {/* Academic Info */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="school" size={20} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>ACADEMIC INFO</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Academic Year</Text>
                            <Text style={styles.infoValue}>{student.year}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Semester</Text>
                            <Text style={styles.infoValue}>{student.semester}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Roll Number</Text>
                            <Text style={styles.infoValue}>{student.rollNo}</Text>
                        </View>
                    </View>

                    {/* Route Details */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="bus" size={20} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>ROUTE DETAILS</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Assigned Route</Text>
                            <View style={styles.routeValueBadge}>
                                <Text style={styles.routeValueText}>{student.route}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Pickup Point</Text>
                            <Text style={styles.infoValue}>{student.pickup}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Bus Number</Text>
                            <Text style={styles.infoValue}>{student.busNo}</Text>
                        </View>
                    </View>

                    {/* Contact Details */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="phone" size={20} color="#f59e0b" />
                            <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
                        </View>
                        
                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconContainer, { backgroundColor: '#eff6ff' }]}>
                                <MaterialCommunityIcons name="phone" size={16} color="#3b82f6" />
                            </View>
                            <View style={styles.contactMeta}>
                                <Text style={styles.contactLabel}>Phone Number</Text>
                                <Text style={styles.contactValue}>{student.phone}</Text>
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="chat-outline" size={20} color="#d1d5db" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconContainer, { backgroundColor: '#fff7ed' }]}>
                                <MaterialCommunityIcons name="email-outline" size={16} color="#f97316" />
                            </View>
                            <View style={styles.contactMeta}>
                                <Text style={styles.contactLabel}>Email Address</Text>
                                <Text style={styles.contactValue}>{student.email}</Text>
                            </View>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconContainer, { backgroundColor: '#f5f3ff' }]}>
                                <MaterialCommunityIcons name="account-group-outline" size={16} color="#8b5cf6" />
                            </View>
                            <View style={styles.contactMeta}>
                                <Text style={styles.contactLabel}>Guardian Contact</Text>
                                <Text style={styles.contactValue}>{student.guardian}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.editButton}>
                            <MaterialCommunityIcons name="square-edit-outline" size={20} color="#374151" />
                            <Text style={styles.editButtonText}>Edit Student</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton}>
                            <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Delete Student</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        marginLeft: -10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: '#fff',
        paddingTop: 24,
        paddingBottom: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: '#fbbf24',
    },
    activeBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#10b981',
        borderWidth: 3,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    studentDept: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        marginTop: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    routeBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    routeBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#92400e',
    },
    idBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    idBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    infoContainer: {
        padding: 24,
        gap: 24,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 1.5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#f9fafb',
    },
    routeValueBadge: {
        backgroundColor: '#fffbeb',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    routeValueText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b45309',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
    },
    contactIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    contactMeta: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 10,
        color: '#6b7280',
    },
    contactValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 8,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        backgroundColor: '#fef2f2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ef4444',
    },
});

export default AdminStudentDetail;
