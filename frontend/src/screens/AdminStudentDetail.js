import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

const AdminStudentDetail = ({ navigation, route }) => {
    const { studentId: paramId } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [dept, setDept] = useState('');
    const [selectedRoute, setSelectedRoute] = useState('');
    const [studentId, setStudentId] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [pickup, setPickup] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [image, setImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, [paramId]);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            // Fetch student and buses in parallel
            const [studentRes, busesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/students/${paramId}`),
                axios.get(`${API_BASE_URL}/api/admin/buses`)
            ]);

            const s = studentRes.data;
            setBuses(busesRes.data);
            
            setName(s.name || '');
            setDept(s.department || '');
            setSelectedRoute(s.busId?._id || '');
            setStudentId(s.rollNo || ''); // Using rollNo as studentId for display
            setYear(s.year || '');
            setSemester(s.semester || '');
            setRollNo(s.rollNo || '');
            setPickup(s.pickupPoint || '');
            setPhone(s.phone || '');
            setEmail(s.email || '');
            setParentName(s.parentName || '');
            setParentEmail(s.parentEmail || '');
            if (s.imageBase64) {
                setImage(`data:image/jpeg;base64,${s.imageBase64}`);
            } else {
                setImage('https://ui-avatars.com/api/?name=' + s.name + '&background=f2cc0d&color=000&size=200');
            }
        } catch (err) {
            console.error('Fetch detail error:', err);
            Alert.alert('Error', 'Failed to fetch details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const payload = {
                name,
                email,
                phone,
                address: 'N/A', // Assuming address is now optional or managed elsewhere
                parentName,
                parentEmail,
                department: dept,
                rollNo,
                year,
                semester,
                pickupPoint: pickup,
                routeId: selectedRoute,
                imageBase64: imageBase64
            };

            await axios.put(`${API_BASE_URL}/api/admin/students/${paramId}`, payload);
            Alert.alert('Success', 'Student updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error('Save error:', err);
            Alert.alert('Error', 'Failed to update student');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this student?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_BASE_URL}/api/admin/students/${paramId}`);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete student');
                        }
                    }
                }
            ]
        );
    };

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
            setImage(asset.uri);
            const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
            setImageBase64(base64);
        }
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
                <Text style={styles.headerTitle}>Edit Student</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Card - Keeping Aesthetic but adding Edit Button for Image */}
                <View style={styles.profileCard}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.profileImage} />
                        <TouchableOpacity style={styles.editImageBadge} onPress={handlePickPhoto}>
                            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.studentNameDisplay}>{name}</Text>
                    <Text style={styles.studentIdDisplay}>ID: {studentId}</Text>
                </View>

                {/* Form Sections */}
                <View style={styles.formContainer}>
                    {/* Basic Information */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Full Name"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Student ID</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="badge-account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: '#9ca3af' }]}
                                    value={studentId}
                                    editable={false}
                                    placeholder="ID"
                                />
                            </View>
                            <Text style={styles.hintText}>Student ID (Roll No) cannot be changed.</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Roll Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="numeric" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={rollNo}
                                    onChangeText={setRollNo}
                                    placeholder="Roll No"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Year</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="calendar-range" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={year}
                                    onChangeText={setYear}
                                    placeholder="Year (e.g. 3rd Year)"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Semester</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="book-open-variant" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={semester}
                                    onChangeText={setSemester}
                                    placeholder="Semester (e.g. Fall 2024)"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Academic & Transport */}
                    <View style={styles.card}>
                        <Text style={styles.sectionLabel}>ACADEMIC & TRANSPORT</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Department</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="school-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={dept}
                                    onChangeText={setDept}
                                    placeholder="Department"
                                />
                            </View>
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Assigned Route</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="bus-side" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={selectedRoute}
                                    onValueChange={(v) => setSelectedRoute(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Route" value="" />
                                    {buses.map(bus => (
                                        <Picker.Item key={bus._id} label={`${bus.plateNumber} (${bus.busType})`} value={bus._id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Pickup Point</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={pickup}
                                    onChangeText={setPickup}
                                    placeholder="Pickup Point"
                                />
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
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    placeholder="Phone"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    placeholder="Email"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Parent/Guardian Name</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-group-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={parentName}
                                    onChangeText={setParentName}
                                    placeholder="Parent Name"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Parent Email</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="email-check-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={parentEmail}
                                    onChangeText={setParentEmail}
                                    placeholder="Parent Email"
                                />
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
                            <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                            <Text style={styles.deleteButtonText}>Delete Student</Text>
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
    profileCard: {
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
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    editImageBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.brandGrey,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentNameDisplay: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    studentIdDisplay: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    hintText: {
        fontSize: 10,
        color: '#9ca3af',
        fontStyle: 'italic',
        marginTop: 2,
        marginLeft: 4,
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

export default AdminStudentDetail;
