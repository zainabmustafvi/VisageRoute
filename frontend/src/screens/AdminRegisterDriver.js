import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    TextInput, StatusBar, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

const AdminRegisterDriver = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [availableBuses, setAvailableBuses] = useState([]);
    const [errors, setErrors] = useState({});

    // Form States
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [licenseNo, setLicenseNo] = useState('');
    const [licenseClass, setLicenseClass] = useState('Class C');
    const [expiration, setExpiration] = useState('');
    const [assignedBusId, setAssignedBusId] = useState('');

    useEffect(() => {
        fetchAvailableBuses();
    }, []);

    const fetchAvailableBuses = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const response = await axios.get(`${API_BASE_URL}/api/admin/available-buses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableBuses(response.data);
        } catch (error) {
            console.error('Error fetching buses:', error);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        if (!fullName.trim()) newErrors.fullName = "Full name is required";
        if (!phone.trim()) newErrors.phone = "Phone number is required";
        if (!email.trim() || !email.includes('@')) newErrors.email = "Valid email is required";
        if (!employeeId.trim()) newErrors.employeeId = "Employee ID is required";
        if (!licenseNo.trim()) newErrors.licenseNo = "License number is required";
        if (!expiration.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(expiration)) {
            newErrors.expiration = "Format: YYYY-MM-DD";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please correct the highlighted fields.');
            return;
        }

        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const payload = {
                name: fullName,
                email,
                phone,
                employeeId,
                licenseNumber: licenseNo,
                licenseClass,
                licenseExpiry: expiration.trim(),
                assignedBusId: assignedBusId || null
            };

            const response = await axios.post(`${API_BASE_URL}/api/admin/drivers`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert(
                '✅ Success',
                'Driver registered successfully. Login credentials have been sent to their email.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Registration Error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || 'Failed to register driver. Please try again.';
            
            if (errorMsg.toLowerCase().includes('email')) {
                setErrors(prev => ({ ...prev, email: 'Email already exists' }));
            } else if (errorMsg.toLowerCase().includes('license')) {
                setErrors(prev => ({ ...prev, licenseNo: 'License already exists' }));
            }
            
            Alert.alert('Error', errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const renderInput = (label, value, setter, placeholder, icon, keyboardType = 'default', errorKey) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, errors[errorKey] && styles.inputError]}>
                <MaterialCommunityIcons name={icon} size={20} color={errors[errorKey] ? colors.error : "#9ca3af"} style={styles.inputIcon} />
                <TextInput
                    style={styles.inputInner}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={(v) => {
                        setter(v);
                        if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: null }));
                    }}
                    keyboardType={keyboardType}
                    autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
                />
            </View>
            {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
        </View>
    );

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
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#000" />
                        </View>
                        <Text style={styles.cardTitle}>Personal Information</Text>
                    </View>
                    <View style={styles.form}>
                        {renderInput("FULL NAME", fullName, setFullName, "ex. Sadaat Malik", "account", "default", "fullName")}
                        {renderInput("PHONE NUMBER", phone, setPhone, "0300 1234567", "phone", "phone-pad", "phone")}
                        {renderInput("EMAIL ADDRESS", email, setEmail, "driver@visageroute.com", "email", "email-address", "email")}
                        {renderInput("EMPLOYEE ID", employeeId, setEmployeeId, "EMP-1023", "card-account-details", "default", "employeeId")}
                    </View>
                </View>

                {/* License Details */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="badge-account-outline" size={20} color="#000" />
                        </View>
                        <Text style={styles.cardTitle}>License Details</Text>
                    </View>
                    <View style={styles.form}>
                        {renderInput("LICENSE NUMBER", licenseNo, setLicenseNo, "DL-88997766", "license", "default", "licenseNo")}
                        
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
                                <View style={[styles.inputWrapper, errors.expiration && styles.inputError]}>
                                    <MaterialCommunityIcons name="calendar" size={18} color={errors.expiration ? colors.error : "#9ca3af"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.inputInner}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="#9ca3af"
                                        value={expiration}
                                        onChangeText={(v) => {
                                            setExpiration(v);
                                            if (errors.expiration) setErrors(prev => ({ ...prev, expiration: null }));
                                        }}
                                    />
                                </View>
                                {errors.expiration && <Text style={styles.errorText}>{errors.expiration}</Text>}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bus Assignment */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="bus" size={20} color="#000" />
                        </View>
                        <Text style={styles.cardTitle}>Bus Assignment</Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ASSIGN TO BUS (OPTIONAL)</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="bus-side" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={assignedBusId}
                                    onValueChange={(v) => setAssignedBusId(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a bus..." value="" />
                                    {availableBuses.map(bus => (
                                        <Picker.Item key={bus._id} label={`${bus.plateNumber} (${bus.model})`} value={bus._id} />
                                    ))}
                                </Picker>
                            </View>
                            <Text style={styles.hintText}>Only showing buses without assigned drivers.</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Bottom Action */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.registerButton, isLoading && styles.disabledButton]} 
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="check-circle" size={24} color="#000" />
                            <Text style={styles.registerButtonText}>Register Driver</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        backgroundColor: colors.backgroundLight,
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
        paddingBottom: 40,
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
        gap: 12,
        marginBottom: 20,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 52,
    },
    inputIcon: {
        marginRight: 8,
    },
    inputInner: {
        flex: 1,
        fontSize: 14,
        color: colors.brandGrey,
        fontWeight: '500',
    },
    inputError: {
        borderColor: colors.error,
        backgroundColor: '#fff5f5',
    },
    errorText: {
        fontSize: 11,
        color: colors.error,
        marginLeft: 4,
        marginTop: 2,
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
        borderRadius: 10,
        paddingHorizontal: 8,
        height: 52,
    },
    picker: {
        flex: 1,
        height: 52,
        color: colors.brandGrey,
    },
    hintText: {
        fontSize: 11,
        color: '#9ca3af',
        fontStyle: 'italic',
        marginTop: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
        borderRadius: 14,
        gap: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default AdminRegisterDriver;
