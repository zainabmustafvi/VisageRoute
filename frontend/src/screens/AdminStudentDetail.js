import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';

const AdminStudentDetail = ({ navigation, route }) => {
    // In a real app, we would fetch student data using the ID from route.params
    // Initial State
    const [name, setName] = useState('Ayesha Khan');
    const [dept, setDept] = useState('Computer Science Dept.');
    const [selectedRoute, setSelectedRoute] = useState('Route 4A');
    const [studentId, setStudentId] = useState('2024-001');
    const [year, setYear] = useState('3rd Year (Junior)');
    const [semester, setSemester] = useState('Fall 2024');
    const [rollNo, setRollNo] = useState('CS-21-045');
    const [pickup, setPickup] = useState('Gulberg Main Stop');
    const [busNo, setBusNo] = useState('LEV-892');
    const [phone, setPhone] = useState('+92 300 1234567');
    const [email, setEmail] = useState('ayesha.k@uni.edu.pk');
    const [guardian, setGuardian] = useState('Mr. Khan (+92 321 7654321)');
    const [image, setImage] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80');

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
                        <TouchableOpacity style={styles.editImageBadge}>
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
                                    style={styles.input}
                                    value={studentId}
                                    onChangeText={setStudentId}
                                    placeholder="ID"
                                />
                            </View>
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
                                    <Picker.Item label="Route 4A" value="Route 4A" />
                                    <Picker.Item label="Route 2B" value="Route 2B" />
                                    <Picker.Item label="Route 5C" value="Route 5C" />
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
                            <Text style={styles.inputLabel}>Guardian Contact</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-group-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={guardian}
                                    onChangeText={setGuardian}
                                    placeholder="Guardian Details"
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
