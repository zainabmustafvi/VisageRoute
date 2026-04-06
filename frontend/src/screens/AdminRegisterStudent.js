import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';

const AdminRegisterStudent = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [sendLogin, setSendLogin] = useState(true);

    // Form States
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [route, setRoute] = useState('');

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

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                    <Text style={[styles.progressStep, step === 1 && styles.activeStep]}>STEP 1: DETAILS</Text>
                    <Text style={[styles.progressStep, step === 2 && styles.activeStep]}>STEP 2: PHOTO ID</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: step === 1 ? '50%' : '100%' }]} />
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter student's full name"
                                placeholderTextColor="#9ca3af"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Student ID</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="badge-account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.inputInner}
                                        placeholder="Ex: 2023001"
                                        placeholderTextColor="#9ca3af"
                                        value={studentId}
                                        onChangeText={setStudentId}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 0.8 }]}>
                                <Text style={styles.label}>Roll Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 15"
                                    placeholderTextColor="#9ca3af"
                                    value={rollNo}
                                    onChangeText={setRollNo}
                                    keyboardType="numeric"
                                />
                            </View>
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
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="phone-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputInner}
                                    placeholder="(555) 000-0000"
                                    placeholderTextColor="#9ca3af"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Parent Information */}
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
                                    onChangeText={setParentName}
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
                                    onChangeText={setParentEmail}
                                    keyboardType="email-address"
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
                                <Text style={styles.infoSubtitle}>Credentials will be sent to the parent's email address upon registration.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Academic & Transport */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Academic & Transport</Text>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Department</Text>
                            <View style={styles.inputWrapper}>
                                <Picker
                                    selectedValue={department}
                                    onValueChange={(v) => setDepartment(v)}
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
                                    selectedValue={route}
                                    onValueChange={(v) => setRoute(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Route" value="" />
                                    <Picker.Item label="Route A - North Campus" value="r1" />
                                    <Picker.Item label="Route B - Downtown" value="r2" />
                                    <Picker.Item label="Route C - West Side" value="r3" />
                                </Picker>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Student Photo */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Student Photo</Text>
                    <Text style={styles.sectionSubtitle}>Please upload a clear passport-sized photo for the ID card.</Text>
                    <TouchableOpacity style={styles.uploadBox}>
                        <View style={styles.uploadIconCircle}>
                            <MaterialCommunityIcons name="camera-plus-outline" size={32} color={colors.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Tap to upload photo</Text>
                        <Text style={styles.uploadSubtitle}>JPG, PNG up to 5MB</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Register</Text>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        marginLeft: -10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    progressContainer: {
        padding: spacing.lg,
        backgroundColor: '#fff',
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressStep: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
    },
    activeStep: {
        color: colors.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    content: {
        flex: 1,
    },
    section: {
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
        paddingHorizontal: spacing.lg,
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        paddingHorizontal: spacing.lg,
        marginBottom: 16,
    },
    form: {
        paddingHorizontal: spacing.lg,
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
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
    inputIcon: {
        marginRight: 2,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#fefce8',
        borderWidth: 1,
        borderColor: '#fef08a',
        borderRadius: 12,
        padding: 12,
        marginTop: 4,
    },
    checkboxContainer: {
        marginRight: 10,
        marginTop: 2,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    infoSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    picker: {
        flex: 1,
        height: 48,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    uploadBox: {
        marginHorizontal: spacing.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    uploadSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
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
        height: 48,
        backgroundColor: colors.primary,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    secondaryButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.brandGrey,
    },
});

export default AdminRegisterStudent;
