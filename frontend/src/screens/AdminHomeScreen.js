import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminHomeScreen = ({ navigation }) => {
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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Welcome Message */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeSub}>Good morning,</Text>
                    <Text style={styles.welcomeMain}>Administrator</Text>
                </View>

                {/* Stats Section */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity
                        style={[styles.statsCard, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Buses')}
                    >
                        <View style={styles.statsCardIconBg}>
                            <MaterialCommunityIcons name="bus" size={24} color={colors.brandGrey} />
                        </View>
                        <MaterialCommunityIcons name="arrow-top-right" size={20} color={colors.brandGrey} style={styles.statsCardArrow} />
                        <View>
                            <Text style={styles.statsNumber}>4</Text>
                            <Text style={styles.statsLabel}>ACTIVE BUSES</Text>
                        </View>
                        <MaterialCommunityIcons name="bus" size={100} color={colors.brandGrey} style={styles.statsCardBgIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statsCard, styles.statsCardWhite]}
                        onPress={() => navigation.navigate('Students')}
                    >
                        <View style={styles.statsCardIconBgLight}>
                            <MaterialCommunityIcons name="school" size={24} color="#4b5563" />
                        </View>
                        <View>
                            <Text style={styles.statsNumberDark}>142</Text>
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
                                <Text style={styles.itemSubtitle}>Create new driver profile</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Upload Schedule */}
                        <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('UploadSchedule')}>
                            <View style={[styles.itemIconContainer, { backgroundColor: '#fef9c3' }]}>
                                <MaterialCommunityIcons name="calendar-upload" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemTitle}>Upload Schedule</Text>
                                <Text style={styles.itemSubtitle}>Import bus routes & timings</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.managementItem} onPress={() => navigation.navigate('Alerts')}>
                            <View style={[styles.itemIconContainer, { backgroundColor: '#f3f4f6' }]}>
                                <MaterialCommunityIcons name="bullhorn" size={20} color="#6b7280" />
                            </View>
                            <View style={styles.itemTextContainer}>
                                <Text style={styles.itemTitle}>Announcements</Text>
                                <Text style={styles.itemSubtitle}>Push notifications to users</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
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
        paddingVertical: spacing.md,
        backgroundColor: colors.brandWhite,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: borderRadius.md,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    logoutText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: 'bold',
        color: colors.brandGrey,
        lineHeight: 18,
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 1,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f9fafb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.brandWhite,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    welcomeSection: {
        marginBottom: spacing.lg,
    },
    welcomeSub: {
        fontSize: typography.sizes.sm,
        color: '#6b7280',
    },
    welcomeMain: {
        fontSize: typography.sizes['2xl'],
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statsCard: {
        flex: 1,
        height: 160,
        borderRadius: 20,
        padding: spacing.md,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    statsCardWhite: {
        backgroundColor: colors.brandWhite,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statsCardIconBg: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        alignSelf: 'flex-start',
    },
    statsCardIconBgLight: {
        backgroundColor: '#f3f4f6',
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        alignSelf: 'flex-start',
    },
    statsCardArrow: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        opacity: 0.5,
    },
    statsNumber: {
        fontSize: 40,
        fontWeight: '800',
        color: colors.brandGrey,
    },
    statsNumberDark: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    statsLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(0, 0, 0, 0.6)',
        letterSpacing: 0.5,
    },
    statsLabelLight: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6b7280',
        letterSpacing: 0.5,
    },
    statsCardBgIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        opacity: 0.1,
        transform: [{ rotate: '12deg' }],
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.brandGrey,
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    managementCard: {
        backgroundColor: colors.brandWhite,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    managementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    itemIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: typography.sizes.sm,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginHorizontal: spacing.md,
    },
    alertCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    alertTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    alertTitle: {
        fontSize: typography.sizes.base,
        fontWeight: 'bold',
        color: colors.brandWhite,
    },
    alertTime: {
        fontSize: 10,
        color: '#9ca3af',
        backgroundColor: '#1f2937',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    alertBody: {
        fontSize: typography.sizes.sm,
        color: '#d1d5db',
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    alertButton: {
        backgroundColor: colors.brandWhite,
        height: 44,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertButtonText: {
        fontSize: typography.sizes.sm,
        fontWeight: 'bold',
        color: '#111827',
    },
});

export default AdminHomeScreen;
