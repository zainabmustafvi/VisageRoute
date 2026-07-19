import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    SafeAreaView, TextInput, StatusBar, ActivityIndicator, Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

const AdminDriverDetail = ({ navigation, route }) => {
    const { driverId: paramId } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [availableBuses, setAvailableBuses] = useState([]);

    // Form States
    const [name, setName] = useState('');
    const [userId, setUserId] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseClass, setLicenseClass] = useState('Class B');
    const [licenseExpiry, setLicenseExpiry] = useState('');
    const [assignedBusId, setAssignedBusId] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchData();
    }, [paramId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = await SecureStore.getItemAsync('socketToken');
            const [driverRes, busesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/drivers`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/admin/available-buses`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const driver = driverRes.data.find(d => d._id === paramId);
            if (!driver) throw new Error('Driver not found');

            setName(driver.name || '');
            setUserId(driver.userId || '');
            setEmployeeId(driver.employeeId || '');
            setEmail(driver.email || '');
            setPhone(driver.phone || '');
            setAddress(driver.address || '');
            setLicenseNumber(driver.licenseNumber || '');
            setLicenseClass(driver.licenseClass || 'Class B');
            setLicenseExpiry(driver.licenseExpiry || '');
            setAssignedBusId(driver.assignedBusId || '');
            setIsActive(driver.isActive !== false);

            setAvailableBuses(busesRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to fetch driver details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = await SecureStore.getItemAsync('socketToken');
            const payload = {
                name, email, phone, employeeId, address,
                licenseNumber, licenseClass, licenseExpiry,
                assignedBusId: assignedBusId || null
            };

            await axios.put(`${API_BASE_URL}/api/admin/drivers/${paramId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Driver updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Save error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Failed to update driver');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirm Delete Driver',
            'Are you sure you want to delete this driver account? They will no longer be able to log in.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('socketToken');
                            await axios.delete(`${API_BASE_URL}/api/admin/drivers/${paramId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete driver');
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

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
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#dcfce7' : '#fee2e2' }]}>
                        <Text style={[styles.statusText, { color: isActive ? '#15803d' : '#ef4444' }]}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
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
                                <TextInput style={styles.input} value={name} onChangeText={setName} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Driver ID (Login ID)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="badge-account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput style={[styles.input, { color: '#9ca3af' }]} value={userId} editable={false} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Employee ID</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="id-card" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput style={styles.input} value={employeeId} onChangeText={setEmployeeId} />
                            </View>
                        </View>
                    </View>

                    {/* License Details */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>LICENSE INFORMATION</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>License Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput style={styles.input} value={licenseNumber} onChangeText={setLicenseNumber} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>License Class</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="form-select" size={20} color="#9ca3af" style={styles.inputIcon} />
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Expiry Date (YYYY-MM-DD)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="calendar-clock" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput style={styles.input} value={licenseExpiry} onChangeText={setLicenseExpiry} placeholder="YYYY-MM-DD" />
                            </View>
                        </View>
                    </View>

                    {/* Assignment */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>ASSIGNMENT</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Assigned Bus</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="bus-side" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={assignedBusId}
                                    onValueChange={(v) => setAssignedBusId(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Unassigned" value="" />
                                    {availableBuses.map(bus => (
                                        <Picker.Item key={bus._id} label={`Bus #${bus.busNumber} (${bus.plateNumber})`} value={bus._id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>CONTACT DETAILS</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="phone-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="content-save-outline" size={24} color="#000" />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <MaterialCommunityIcons name="account-off-outline" size={20} color="#ef4444" />
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
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
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
