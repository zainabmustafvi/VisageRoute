import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, StatusBar, Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { colors, typography, spacing } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

const AdminRegisterStudent = ({ navigation, route }) => {
    const studentData = route.params?.student;
    const isEditMode = !!studentData;

    const [sendLogin, setSendLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [buses, setBuses] = useState([]);
    const [isLoadingBuses, setIsLoadingBuses] = useState(false);

    // Photo state
    const [photoUri, setPhotoUri] = useState(null);
    const [photoBase64, setPhotoBase64] = useState(null);
    const [errors, setErrors] = useState({});

    // Form states
    const [fullName, setFullName] = useState(studentData?.name || '');
    const [email, setEmail] = useState(studentData?.email || '');
    const [phone, setPhone] = useState(studentData?.phone || '');
    const [address, setAddress] = useState(studentData?.address || '');
    const [parentName, setParentName] = useState(studentData?.parentName || '');
    const [parentEmail, setParentEmail] = useState(studentData?.parentEmail || '');
    const [department, setDepartment] = useState(studentData?.department || '');
    const [busId, setBusId] = useState(studentData?.busId?._id || studentData?.busId || '');
    const [rollNo, setRollNo] = useState(studentData?.rollNo || '');
    const [year, setYear] = useState(studentData?.year || '');
    const [semester, setSemester] = useState(studentData?.semester || '');
    const [pickupPoint, setPickupPoint] = useState(studentData?.pickupPoint || '');

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            setIsLoadingBuses(true);
            const token = await SecureStore.getItemAsync('socketToken');
            const res = await axios.get(`${API_BASE_URL}/api/admin/buses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBuses(res.data);
        } catch (error) {
            console.error('Error fetching buses:', error);
        } finally {
            setIsLoadingBuses(false);
        }
    };

    const handleFieldChange = (field, value, setter) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // ─── Open Phone Gallery ───────────────────────────────────────────
    const handlePickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo gallery.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setPhotoUri(asset.uri);
            const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
            setPhotoBase64(base64);
        }
    };

    // ─── Form Validation ──────────────────────────────────────────────
    const validateForm = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = true;
        if (!email.trim() || !email.includes('@')) newErrors.email = true;
        if (!phone.trim()) newErrors.phone = true;
        if (!address.trim()) newErrors.address = true;
        if (!parentName.trim()) newErrors.parentName = true;
        if (!parentEmail.trim() || !parentEmail.includes('@')) newErrors.parentEmail = true;
        
        // Photo is only strictly required for new registrations
        if (!isEditMode && !photoBase64) newErrors.photo = true;

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return false;
        }
        return true;
    };

    // ─── Submit Registration / Update ──────────────────────────────────
    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const url = isEditMode 
                ? `${API_BASE_URL}/api/admin/students/${studentData._id}`
                : `${API_BASE_URL}/api/admin/students`;
            
            const payload = {
                name: fullName,
                email,
                phone,
                address,
                parentName,
                parentEmail,
                department,
                routeId: busId, // Use the selected bus ID
                rollNo,
                year,
                semester,
                pickupPoint,
                imageBase64: photoBase64,
            };

            if (isEditMode) {
                await axios.put(url, payload, { headers: { Authorization: `Bearer ${token}` } });
                Alert.alert('Success', 'Student updated successfully!');
            } else {
                await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
                Alert.alert('Success', 'Student registered successfully!');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            Alert.alert('Registration Failed', error.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Student' : 'Register Student'}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* ── Photo Upload ── */}
                <View style={styles.photoSection}>
                    <TouchableOpacity 
                        style={[styles.photoFrame, errors.photo && styles.errorBorder]} 
                        onPress={handlePickPhoto}
                    >
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={40} color="#9ca3af" />
                                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.photoTip}>Take a clear face photo for AI attendance</Text>
                </View>

                {/* ── Personal Details ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={[styles.inputWrapper, errors.fullName && styles.errorBorder]}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="Enter full name"
                                    placeholderTextColor="#9ca3af"
                                    value={fullName}
                                    onChangeText={(v) => handleFieldChange('fullName', v, setFullName)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={[styles.inputWrapper, errors.email && styles.errorBorder]}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="student@university.edu"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={(v) => handleFieldChange('email', v, setEmail)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={[styles.inputWrapper, errors.phone && styles.errorBorder]}>
                                <MaterialCommunityIcons name="phone-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="03001234567"
                                    placeholderTextColor="#9ca3af"
                                    value={phone}
                                    onChangeText={(v) => handleFieldChange('phone', v, setPhone)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Home Address</Text>
                            <View style={[styles.inputWrapper, errors.address && styles.errorBorder]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="Street, City"
                                    placeholderTextColor="#9ca3af"
                                    value={address}
                                    onChangeText={(v) => handleFieldChange('address', v, setAddress)}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* ── Parent Information ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Parent/Guardian Information</Text>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Parent Full Name</Text>
                            <View style={[styles.inputWrapper, errors.parentName && styles.errorBorder]}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="Enter parent's full name"
                                    placeholderTextColor="#9ca3af"
                                    value={parentName}
                                    onChangeText={(v) => handleFieldChange('parentName', v, setParentName)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Parent Email Address</Text>
                            <View style={[styles.inputWrapper, errors.parentEmail && styles.errorBorder]}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="parent@example.com"
                                    placeholderTextColor="#9ca3af"
                                    value={parentEmail}
                                    onChangeText={(v) => handleFieldChange('parentEmail', v, setParentEmail)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {!isEditMode && (
                            <View style={styles.infoBox}>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() => setSendLogin(!sendLogin)}
                                >
                                    <MaterialCommunityIcons
                                        name={sendLogin ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={24}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoTitle}>Send Login Credentials</Text>
                                    <Text style={styles.infoSubtitle}>Parent login email: {parentEmail || '[email entered above]'}</Text>
                                    <Text style={styles.infoSubtitle}>Credentials will be sent to parent's email upon registration.</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Academic & Transport ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Academic & Transport</Text>
                    <View style={styles.form}>
                         <View style={styles.inputGroup}>
                            <Text style={styles.label}>Roll Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="e.g. 21-CS-123"
                                    placeholderTextColor="#9ca3af"
                                    value={rollNo}
                                    onChangeText={setRollNo}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Department</Text>
                            <View style={styles.inputWrapper}>
                                <Picker
                                    selectedValue={department}
                                    onValueChange={(v) => handleFieldChange('department', v, setDepartment)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Department" value="" />
                                    <Picker.Item label="Computer Science" value="cs" />
                                    <Picker.Item label="Engineering" value="eng" />
                                    <Picker.Item label="Arts & Humanities" value="arts" />
                                    <Picker.Item label="Business Administration" value="bus" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Assigned Bus</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="bus" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={busId}
                                    onValueChange={(v) => handleFieldChange('busId', v, setBusId)}
                                    style={styles.picker}
                                    enabled={!isLoadingBuses}
                                >
                                    <Picker.Item label={isLoadingBuses ? "Loading Buses..." : "Select Bus"} value="" />
                                    {buses.map(b => (
                                        <Picker.Item 
                                            key={b._id} 
                                            label={`Bus #${b.busNumber} (${b.plateNumber})`} 
                                            value={b._id} 
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                        
                         <View style={styles.inputGroup}>
                            <Text style={styles.label}>Pickup Point</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="Enter pickup location"
                                    placeholderTextColor="#9ca3af"
                                    value={pickupPoint}
                                    onChangeText={setPickupPoint}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()} disabled={isLoading}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <>
                            <Text style={styles.primaryButtonText}>{isEditMode ? 'Update' : 'Register'}</Text>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#000" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    content: { flex: 1 },
    photoSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#f9fafb',
    },
    photoFrame: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        alignItems: 'center',
    },
    photoPlaceholderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9ca3af',
        marginTop: 5,
    },
    photoTip: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 15,
    },
    section: { paddingTop: 20 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
        paddingHorizontal: spacing.lg,
        marginBottom: 6,
    },
    form: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 10,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    inputIcon: {
        marginRight: 10,
    },
    inputInner: {
        flex: 1,
        fontSize: 15,
        color: colors.brandGrey,
    },
    picker: {
        flex: 1,
        marginLeft: -10,
    },
    errorBorder: {
        borderColor: '#ef4444',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f0f9ff',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bae6fd',
        marginTop: 10,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    infoSubtitle: {
        fontSize: 12,
        color: '#0ea5e9',
        marginTop: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        padding: spacing.lg,
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    primaryButton: {
        flex: 2,
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    primaryButtonDisabled: {
        opacity: 0.7,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    secondaryButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6b7280',
    },
});

export default AdminRegisterStudent;
