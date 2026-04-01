import React from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const DriverProfile = ({ navigation }) => {
    const handleLogout = () => {
        // Implement logout logic here
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <MaterialIcons name="logout" size={18} color={Theme.colors.textSecondaryLight} />
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwOEKQBTWBJknnI5pVE3BtnVoY1Dp_EPCpSn8hnWME4pWLEvuvfVCpZ5EMT1BXNv5tcP-94bT4rtt0Y9dzICq7GUPlofJCfRf8G6_k4irmqo97VUoQvwSt85VlPsYbTvUOh9MqLMpJjPxEvO6JRDV1uYwpPpfCTbQmbELsgfbW2e107-VzCcwiKGiQZYuj7begMSpcRlzskGunCABogsGAIi_gVxVh7B9NNxKddm-e9LrpoT15t6xvukeuKmBPzaJue-JSX1toUCg' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editBadge}>
                            <MaterialIcons name="edit" size={16} color={Theme.colors.brandGrey} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.driverName}>Sadaat Malik</Text>
                    <View style={styles.roleContainer}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>ACTIVE</Text>
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
                            <Text style={styles.infoValue}>#104</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="call" size={20} color={Theme.colors.textSecondaryLight} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>+1 (555) 012-3456</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="drive-eta" size={20} color={Theme.colors.textSecondaryLight} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>License Number</Text>
                            <Text style={styles.infoValue}>DL-9823-7721</Text>
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
                            <Text style={styles.infoValue}>Bus 104</Text>
                        </View>
                        <View style={styles.assignedBadge}>
                            <Text style={styles.assignedText}>Assigned</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.gridRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Plate Number</Text>
                            <Text style={[styles.infoValue, styles.monoText]}>KPA-8829</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Model</Text>
                            <Text style={styles.infoValue}>Volvo 9700</Text>
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
