import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    SafeAreaView, TextInput, StatusBar, Image, ActivityIndicator, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { colors, typography, spacing } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../config/api'; // adjust path if needed

const AdminRegisterStudent = ({ navigation }) => {
    const [sendLogin, setSendLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Photo state
    const [photoUri, setPhotoUri] = useState(null);
    const [photoBase64, setPhotoBase64] = useState(null);
    const [errors, setErrors] = useState({}); // Track field-specific errors

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [routeId, setRouteId] = useState(''); // Corrected name to match schema

    const handleFieldChange = (field, value, setter) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // ─── Open Phone Gallery ───────────────────────────────────────────
    const handlePickPhoto = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo gallery to select a student photo.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,     // Crop to square
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setPhotoUri(asset.uri);

            // Convert to base64 for backend transmission
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: 'base64',
            });
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
        if (!photoBase64) newErrors.photo = true;

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            Alert.alert('Validation Error', 'Please fill in all required fields marked in red.');
            return false;
        }
        return true;
    };

    // ─── Submit Registration ──────────────────────────────────────────
    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/admin/students`, {
                name: fullName,
                email,
                phone,
                address,
                parentName,
                parentEmail,
                department,
                routeId,
                imageBase64: photoBase64,
            }, { timeout: 30000 });

            Alert.alert(
                '✅ Registration Successful',
                `${fullName} has been registered.\nLogin credentials have been sent to:\n${parentEmail}`,
                [{ text: 'Done', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.log('Registration error:', error.response?.data || error.message);
            const message =
                error.response?.data?.error ||
                'Registration failed. Please try again.';

            // Check specifically for face detection failure
            if (message.includes('No face detected')) {
                Alert.alert(
                    '⚠️ No Face Detected',
                    'No face detected. Please upload a clear photo of the student\'s face.\n\n• Ensure the face is well-lit\n• Use a passport-style front-facing photo\n• Avoid blurry or very small images'
                );
            } else {
                Alert.alert('Registration Failed', message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register Student</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── Student Photo Picker ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Student Photo</Text>
                    <Text style={styles.sectionSubtitle}>
                        Upload a clear, front-facing photo. This will be used for the attendance system.
                    </Text>

                    <TouchableOpacity 
                        style={[styles.photoPickerBox, errors.photo && styles.inputError]} 
                        onPress={handlePickPhoto}
                    >
                        {photoUri ? (
                            <View style={styles.photoPreviewContainer}>
                                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                                <View style={styles.changePhotoBadge}>
                                    <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                                    <Text style={styles.changePhotoText}>Change Photo</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <View style={styles.uploadIconCircle}>
                                    <MaterialCommunityIcons name="camera-plus-outline" size={32} color={colors.primary} />
                                </View>
                                <Text style={styles.uploadTitle}>Tap to select from gallery</Text>
                                <Text style={styles.uploadSubtitle}>JPG, PNG • Clear front-facing face photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Face encoding status indicator */}
                    {photoUri && (
                        <View style={styles.faceStatusRow}>
                            <MaterialCommunityIcons name="face-recognition" size={18} color="#10b981" />
                            <Text style={styles.faceStatusText}>
                                Photo selected — face will be encoded upon registration
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── Basic Information ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={[styles.input, errors.fullName && styles.inputError]}
                                placeholder="Enter student's full name"
                                placeholderTextColor="#9ca3af"
                                value={fullName}
                                onChangeText={(v) => handleFieldChange('fullName', v, setFullName)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
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
                            <View style={styles.inputWrapper}>
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
                            <View style={styles.inputWrapper}>
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
                            <View style={styles.inputWrapper}>
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
                            <View style={styles.inputWrapper}>
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
                                <Text style={styles.infoTitle}>Send Login ID & Password</Text>
                                <Text style={styles.infoSubtitle}>Credentials will be sent to the parent's email upon registration.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ── Academic & Transport ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Academic & Transport</Text>
                    <View style={styles.form}>
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
                            <Text style={styles.label}>Assigned Bus Route</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="bus" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={routeId}
                                    onValueChange={(v) => handleFieldChange('routeId', v, setRouteId)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Route" value="" />
                                    <Picker.Item label="Route A - North Campus" value="65f1234567890abcdef12345" />
                                    <Picker.Item label="Route B - Downtown" value="65f1234567890abcdef12346" />
                                    <Picker.Item label="Route C - West Side" value="65f1234567890abcdef12347" />
                                </Picker>
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
                            <Text style={styles.primaryButtonText}>Register</Text>
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
    backButton: { marginLeft: -10 },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    content: { flex: 1 },
    section: { paddingTop: 20 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
        paddingHorizontal: spacing.lg,
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        paddingHorizontal: spacing.lg,
        marginBottom: 14,
    },
    form: { paddingHorizontal: spacing.lg, gap: 16 },
    inputGroup: { gap: 6 },
    label: { fontSize: 14, fontWeight: '500', color: '#374151' },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 14,
        color: colors.brandGrey,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
    },
    inputInner: {
        flex: 1,
        fontSize: 14,
        color: colors.brandGrey,
        marginLeft: 8,
    },
    inputIcon: { marginRight: 2 },
    picker: { flex: 1, height: 48 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#fefce8',
        borderWidth: 1,
        borderColor: '#fef08a',
        borderRadius: 12,
        padding: 12,
        marginTop: 4,
    },
    checkboxContainer: { marginRight: 10, marginTop: 2 },
    infoTextContainer: { flex: 1 },
    infoTitle: { fontSize: 14, fontWeight: 'bold', color: colors.brandGrey },
    infoSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },

    // ── Photo Picker ─────────────────────────────────
    photoPickerBox: {
        marginHorizontal: spacing.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        overflow: 'hidden',
    },
    uploadPlaceholder: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    uploadTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.brandGrey,
        marginBottom: 4,
    },
    uploadSubtitle: { fontSize: 12, color: '#9ca3af' },

    photoPreviewContainer: { alignItems: 'center', padding: 20 },
    photoPreview: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 3,
        borderColor: colors.primary,
    },
    changePhotoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.brandGrey,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 12,
    },
    changePhotoText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },

    faceStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: spacing.lg,
        marginTop: 10,
    },
    faceStatusText: { fontSize: 12, color: '#10b981', fontWeight: '500' },

    // ── Footer ─────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        padding: spacing.lg,
        paddingBottom: 32,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        height: 50,
        backgroundColor: colors.primary,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonDisabled: { opacity: 0.6 },
    primaryButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    secondaryButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: { fontSize: 16, fontWeight: '600', color: colors.brandGrey },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    photoError: {
        borderColor: '#ef4444',
    },
});

export default AdminRegisterStudent;
