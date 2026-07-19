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

const AdminRegisterBus = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [errors, setErrors] = useState({});

    // Form States
    const [busNumber, setBusNumber] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [gpsDeviceId, setGpsDeviceId] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        fetchAvailableDrivers();
    }, []);

    const fetchAvailableDrivers = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const response = await axios.get(`${API_BASE_URL}/api/admin/available-drivers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableDrivers(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        if (!busNumber.trim()) newErrors.busNumber = "Bus number is required";
        if (!plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
        if (!capacity.trim() || isNaN(capacity)) newErrors.capacity = "Valid capacity is required";

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
                busNumber,
                plateNumber: plateNumber.toUpperCase(),
                capacity: parseInt(capacity),
                driverId: selectedDriverId || null,
                gpsDeviceId: gpsDeviceId || null
            };

            const response = await axios.post(`${API_BASE_URL}/api/admin/buses`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert(
                '✅ Success',
                'Bus registered successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Registration Error:', error.response?.data || error.message);
            const errorData = error.response?.data;
            const errorMsg = errorData?.error || 'Failed to register bus. Please try again.';
            
            if (errorMsg.includes('already exists') && errorData?.existingBus) {
                const bus = errorData.existingBus;
                Alert.alert(
                    'Duplicate Bus',
                    `${errorMsg}\n\nExisting Bus Details:\nNumber: ${bus.busNumber}\nPlate: ${bus.plateNumber}\nStatus: ${bus.status}`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', errorMsg);
            }
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
                    autoCapitalize={label.includes('PLATE') ? 'characters' : 'none'}
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
                <Text style={styles.headerTitle}>Register Bus</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
                {/* Vehicle Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="bus" size={20} color="#000" />
                        </View>
                        <Text style={styles.cardTitle}>Vehicle Information</Text>
                    </View>
                    <View style={styles.form}>
                        {renderInput("BUS NUMBER", busNumber, setBusNumber, "ex. 101", "tag", "default", "busNumber")}
                        {renderInput("REGISTRATION PLATE", plateNumber, setPlateNumber, "KA-05-AB-1234", "card-text", "default", "plateNumber")}
                        {renderInput("CAPACITY (SEATS)", capacity, setCapacity, "40", "seat-recline-normal", "numeric", "capacity")}
                        {renderInput("GPS DEVICE ID (OPTIONAL)", gpsDeviceId, setGpsDeviceId, "GPS-9988-X", "crosshairs-gps", "default", "gpsDeviceId")}
                    </View>
                </View>

                {/* Driver Assignment */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="account-tie" size={20} color="#000" />
                        </View>
                        <Text style={styles.cardTitle}>Driver Assignment</Text>
                    </View>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ASSIGN DRIVER (OPTIONAL)</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="badge-account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={selectedDriverId}
                                    onValueChange={(v) => setSelectedDriverId(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a driver..." value="" />
                                    {availableDrivers.map(driver => (
                                        <Picker.Item key={driver._id} label={`${driver.name} (${driver.employeeId})`} value={driver._id} />
                                    ))}
                                </Picker>
                            </View>
                            <Text style={styles.hintText}>Only showing drivers without assigned buses.</Text>
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
                            <Text style={styles.registerButtonText}>Register Bus</Text>
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

export default AdminRegisterBus;
