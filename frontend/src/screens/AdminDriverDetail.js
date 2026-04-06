import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';

const AdminDriverDetail = ({ navigation, route }) => {
    // Mock data initial state
    const [name, setName] = useState('Sadaat Malik');
    const [driverId, setDriverId] = useState('DRV-2024-88');
    const [license, setLicense] = useState('DL-99887766');
    const [dob, setDob] = useState('Jan 15, 1980');
    const [phone, setPhone] = useState('+1 (555) 012-3456');
    const [address, setAddress] = useState('4521 Elm Street, Springfield, IL 62704');
    const [selectedBus, setSelectedBus] = useState('Bus #42');
    const [shift, setShift] = useState('Morning & Evening');
    const [joined, setJoined] = useState('Aug 15, 2021');
    const [experience, setExperience] = useState('5 Years');
    const [contract, setContract] = useState('Full Time');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Driver</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Driver Stats Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <MaterialCommunityIcons name="account-tie" size={48} color={colors.brandGrey} />
                    </View>
                    <Text style={styles.driverNameDisplay}>{name}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>ACTIVE</Text>
                    </View>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Professional Identity */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>PROFESSIONAL IDENTITY</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Driver ID</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="badge-account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={driverId}
                                    onChangeText={setDriverId}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>License Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={license}
                                    onChangeText={setLicense}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Assignment & Employment */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>ASSIGNMENT & EMPLOYMENT</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Assigned Bus</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="bus-side" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={selectedBus}
                                    onValueChange={(v) => setSelectedBus(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Bus #42" value="Bus #42" />
                                    <Picker.Item label="Bus #12" value="Bus #12" />
                                    <Picker.Item label="Bus #88" value="Bus #88" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Shift Type</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="clock-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={shift}
                                    onChangeText={setShift}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Experience</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="briefcase-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={experience}
                                    onChangeText={setExperience}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Contact & Personal */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>CONTACT & PERSONAL</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="phone-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Residential Address</Text>
                            <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { textAlignVertical: 'top' }]}
                                    value={address}
                                    onChangeText={setAddress}
                                    multiline
                                />
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="content-save-outline" size={24} color="#000" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.deleteButton}>
                            <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Delete Driver</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 60 }} />
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
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: '#fff',
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
    },
    profileHeader: {
        backgroundColor: '#fff',
        paddingVertical: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    driverNameDisplay: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    statusBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#15803d',
    },
    formContainer: {
        padding: 20,
        gap: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        gap: 16,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 1,
        marginBottom: 4,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: colors.brandGrey,
    },
    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
    },
    picker: {
        flex: 1,
        marginLeft: -10,
    },
    actionRow: {
        gap: 12,
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    deleteButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
});

export default AdminDriverDetail;
