import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';

const AdminBusDetail = ({ navigation, route }) => {
    // Form States
    const [busNumber, setBusNumber] = useState('101');
    const [regNumber, setRegNumber] = useState('KA-05-AB-1234');
    const [capacity, setCapacity] = useState('42');
    const [selectedDriver, setSelectedDriver] = useState('ramesh');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.brandGrey} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Edit Bus Details</Text>
                        <Text style={styles.headerSubtitle}>ADMIN PORTAL</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#9ca3af" />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.busTitle}>Bus #{busNumber}</Text>
                        <Text style={styles.busSubtitle}>Update information below</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>ACTIVE</Text>
                    </View>
                </View>

                <View style={styles.form}>
                    {/* Vehicle Information */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>VEHICLE INFORMATION</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bus Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="bus" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={busNumber}
                                    onChangeText={setBusNumber}
                                    placeholder="e.g. 101"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Registration Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="identifier" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { textTransform: 'uppercase' }]}
                                    value={regNumber}
                                    onChangeText={setRegNumber}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Capacity (Seats)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="seat-recline-normal" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={capacity}
                                    onChangeText={setCapacity}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Personnel */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>PERSONNEL</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Assigned Driver</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="badge-account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={selectedDriver}
                                    onValueChange={(v) => setSelectedDriver(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Ramesh K." value="ramesh" />
                                    <Picker.Item label="Suresh M." value="suresh" />
                                    <Picker.Item label="Rajesh P." value="rajesh" />
                                    <Picker.Item label="Unassigned" value="unassigned" />
                                </Picker>
                            </View>
                            <Text style={styles.helpText}>Select a new driver to reassign automatically.</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.saveButton}>
                            <MaterialCommunityIcons name="content-save-outline" size={24} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.deleteButton}>
                            <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Delete Bus</Text>
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
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 1,
    },
    notificationButton: {
        padding: 8,
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        backgroundColor: colors.primary,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    busTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    busSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    statusBadge: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#15803d',
    },
    form: {
        gap: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        gap: 20,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 1,
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
        color: '#111827',
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
    helpText: {
        fontSize: 10,
        color: '#9ca3af',
        marginTop: 2,
        marginLeft: 4,
    },
    actionRow: {
        gap: 12,
        marginTop: 16,
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
        color: '#fff',
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

export default AdminBusDetail;
