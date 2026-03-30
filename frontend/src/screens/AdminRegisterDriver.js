import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';

const AdminRegisterDriver = ({ navigation }) => {
    // Personal Info
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [employeeId, setEmployeeId] = useState('');

    // License Details
    const [licenseNo, setLicenseNo] = useState('');
    const [licenseClass, setLicenseClass] = useState('Class C');
    const [expiration, setExpiration] = useState('');

    // Assignment
    const [route, setRoute] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register Driver</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
                {/* Personal Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="account-outline" size={24} color={colors.primary} />
                        <Text style={styles.cardTitle}>Personal Information</Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>FULL NAME</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ex. Sadaat Malik"
                                placeholderTextColor="#9ca3af"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PHONE NUMBER</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="(555) 000-0000"
                                placeholderTextColor="#9ca3af"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>EMAIL ADDRESS</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="driver@saferoute.edu"
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>EMPLOYEE ID</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ID-123456"
                                placeholderTextColor="#9ca3af"
                                value={employeeId}
                                onChangeText={setEmployeeId}
                            />
                        </View>
                    </View>
                </View>

                {/* License Details */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="badge-account-outline" size={24} color={colors.primary} />
                        <Text style={styles.cardTitle}>License Details</Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>LICENSE NUMBER</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DL-88997766"
                                placeholderTextColor="#9ca3af"
                                value={licenseNo}
                                onChangeText={setLicenseNo}
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>CLASS</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={licenseClass}
                                        onValueChange={(v) => setLicenseClass(v)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Class A" value="Class A" />
                                        <Picker.Item label="Class B" value="Class B" />
                                        <Picker.Item label="Class C" value="Class C" />
                                    </Picker>
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1.2 }]}>
                                <Text style={styles.label}>EXPIRATION</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#9ca3af"
                                    value={expiration}
                                    onChangeText={setExpiration}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bus Assignment */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="bus" size={24} color={colors.primary} />
                        <Text style={styles.cardTitle}>Bus Assignment</Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ASSIGNED ROUTE</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="map-marker-path" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={route}
                                    onValueChange={(v) => setRoute(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a route..." value="" />
                                    <Picker.Item label="Route 101 - North Campus Loop" value="r1" />
                                    <Picker.Item label="Route 204 - Downtown Connector" value="r2" />
                                    <Picker.Item label="Route 305 - Stadium Shuttle" value="r3" />
                                    <Picker.Item label="Unassigned (Pool)" value="unassigned" />
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Sticky Bottom Action */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.registerButton}>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#000" />
                    <Text style={styles.registerButtonText}>Register Driver</Text>
                </TouchableOpacity>
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
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
    cancelText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    content: {
        flex: 1,
    },
    scrollPadding: {
        padding: spacing.lg,
        gap: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f3f4f6',
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
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 1,
        marginLeft: 2,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 14,
        color: colors.brandGrey,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
    },
    picker: {
        flex: 1,
        height: 48,
        marginLeft: -10,
    },
    inputIcon: {
        marginRight: 4,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: 32,
        backgroundColor: 'rgba(248, 248, 245, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    registerButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 12,
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default AdminRegisterDriver;
