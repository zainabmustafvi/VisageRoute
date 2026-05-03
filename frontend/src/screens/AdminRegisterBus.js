import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';

const AdminRegisterBus = ({ navigation }) => {
    const [busNumber, setBusNumber] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');

    const drivers = [
        { id: '1', name: 'Ramesh K.', status: 'Available' },
        { id: '2', name: 'Suresh M.', status: 'Available' },
        { id: '3', name: 'John D.', status: 'On Leave' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register New Bus</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.title}>Register New Bus</Text>
                        <Text style={styles.subtitle}>Enter vehicle details below</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="bus" size={24} color={colors.primary} />
                    </View>
                </View>

                <View style={styles.form}>
                    {/* Bus Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>BUS NUMBER</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="tag-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 101"
                                placeholderTextColor="#9ca3af"
                                value={busNumber}
                                onChangeText={setBusNumber}
                            />
                        </View>
                    </View>

                    {/* Registration Plate */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>REGISTRATION PLATE</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="card-text-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { textTransform: 'uppercase' }]}
                                placeholder="e.g. KA-05-AB-1234"
                                placeholderTextColor="#9ca3af"
                                value={plateNumber}
                                onChangeText={setPlateNumber}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>

                    {/* Capacity */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CAPACITY</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="seat-recline-normal" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="40"
                                placeholderTextColor="#9ca3af"
                                value={capacity}
                                onChangeText={setCapacity}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Assign Driver */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ASSIGN DRIVER</Text>
                        <View style={styles.pickerWrapper}>
                            <MaterialCommunityIcons name="badge-account-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <Picker
                                selectedValue={selectedDriver}
                                onValueChange={(itemValue) => setSelectedDriver(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select a driver" value="" />
                                {drivers.map((driver) => (
                                    <Picker.Item 
                                        key={driver.id} 
                                        label={`${driver.name} (${driver.status})`} 
                                        value={driver.id} 
                                    />
                                ))}
                                <Picker.Item label="-- Leave Unassigned --" value="unassigned" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.registerButton}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                            <Text style={styles.registerButtonText}>Register Bus</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        backgroundColor: colors.brandWhite,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        marginLeft: -10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    cancelText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fef9c3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6b7280',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.brandWhite,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 52,
    },
    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.brandWhite,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: colors.brandGrey,
        fontWeight: '500',
    },
    picker: {
        flex: 1,
        fontSize: 14,
        color: colors.brandGrey,
        marginLeft: -10,
    },
    buttonContainer: {
        marginTop: 16,
        gap: 12,
    },
    registerButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    cancelButton: {
        backgroundColor: colors.brandWhite,
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6b7280',
    },
});

export default AdminRegisterBus;
