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

const AdminBusDetail = ({ navigation, route }) => {
    const { busId: paramId } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [availableDrivers, setAvailableDrivers] = useState([]);

    // Form States
    const [busNumber, setBusNumber] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [gpsDeviceId, setGpsDeviceId] = useState('');
    const [status, setStatus] = useState('available');
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        fetchData();
    }, [paramId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = await SecureStore.getItemAsync('socketToken');
            const [busRes, driversRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/buses`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/admin/available-drivers`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const bus = busRes.data.find(b => b._id === paramId);
            if (!bus) throw new Error('Bus not found');

            setBusNumber(bus.busNumber || '');
            setPlateNumber(bus.plateNumber || '');
            setCapacity(bus.capacity?.toString() || '');
            setGpsDeviceId(bus.gpsDeviceId || '');
            setStatus(bus.status || 'available');
            setSelectedDriverId(bus.driverId?._id || '');

            // Add the current driver to the list of available drivers so we can select them again
            let drivers = driversRes.data;
            if (bus.driverId && !drivers.find(d => d._id === bus.driverId._id)) {
                drivers = [bus.driverId, ...drivers];
            }
            setAvailableDrivers(drivers);
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to fetch bus details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = await SecureStore.getItemAsync('socketToken') || await SecureStore.getItemAsync('userToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const cleanDriverId = selectedDriverId ? (typeof selectedDriverId === 'object' ? String(selectedDriverId._id || selectedDriverId.id) : String(selectedDriverId)) : null;

            const payload = {
                busNumber,
                plateNumber: plateNumber.toUpperCase(),
                capacity: parseInt(capacity),
                driverId: cleanDriverId,
                gpsDeviceId: gpsDeviceId || null,
                status
            };

            await axios.put(`${API_BASE_URL}/api/admin/buses/${paramId}`, payload, { headers });
            if (cleanDriverId) {
                await axios.post(`${API_BASE_URL}/api/admin/assign-bus-driver`, { driverId: cleanDriverId, busId: paramId }, { headers }).catch(() => {});
            }

            Alert.alert('Success', 'Bus updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Save error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Failed to update bus');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this bus? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync('socketToken');
                            await axios.delete(`${API_BASE_URL}/api/admin/buses/${paramId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete bus');
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
                <Text style={styles.headerTitle}>Edit Bus</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.busTitle}>Bus #{busNumber}</Text>
                        <Text style={styles.busSubtitle}>Update information below</Text>
                    </View>
                    <View style={[styles.statusBadge, status === 'available' ? styles.statusActive : styles.statusMaintenance]}>
                        <Text style={[styles.statusText, status === 'available' ? styles.statusTextActive : styles.statusTextMaintenance]}>
                            {status.toUpperCase()}
                        </Text>
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
                                <TextInput style={styles.input} value={busNumber} onChangeText={setBusNumber} placeholder="e.g. 101" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Registration Number</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="identifier" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { textTransform: 'uppercase' }]}
                                    value={plateNumber}
                                    onChangeText={setPlateNumber}
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Status</Text>
                            <View style={styles.pickerWrapper}>
                                <MaterialCommunityIcons name="list-status" size={20} color="#9ca3af" style={styles.inputIcon} />
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(v) => setStatus(v)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Available" value="available" />
                                    <Picker.Item label="In Use" value="in-use" />
                                    <Picker.Item label="Maintenance" value="maintenance" />
                                </Picker>
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
                                    selectedValue={selectedDriverId}
                                    onValueChange={(v) => {
                                        const cleanVal = v ? (typeof v === 'object' ? String(v._id || v.id || '') : String(v)) : '';
                                        setSelectedDriverId(cleanVal);
                                    }}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Unassigned" value="" />
                                    {availableDrivers.map(driver => (
                                        <Picker.Item key={driver._id} label={`${driver.name} (${driver.employeeId || 'N/A'})`} value={driver._id} />
                                    ))}
                                </Picker>
                            </View>
                            <Text style={styles.helpText}>Select a new driver to reassign automatically.</Text>
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
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
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
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
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
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusActive: {
        backgroundColor: '#f0fdf4',
        borderColor: '#dcfce7',
    },
    statusMaintenance: {
        backgroundColor: '#fef2f2',
        borderColor: '#fee2e2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusTextActive: {
        color: '#15803d',
    },
    statusTextMaintenance: {
        color: '#ef4444',
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

export default AdminBusDetail;
