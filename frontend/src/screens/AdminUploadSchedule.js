import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    StatusBar, Animated, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

const AdminUploadSchedule = ({ navigation }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [recentUploads, setRecentUploads] = useState([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchRecentUploads();
        }, [])
    );

    const fetchRecentUploads = async () => {
        try {
            setIsLoadingRecent(true);
            const token = await SecureStore.getItemAsync('socketToken');
            const response = await axios.get(`${API_BASE_URL}/api/admin/recent-uploads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentUploads(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoadingRecent(false);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all files and validate manually for better compatibility
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                const file = result.assets[0];
                const fileName = file.name.toLowerCase();
                
                // Validate extension
                if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
                    Alert.alert('Invalid Format', 'Please select a CSV or Excel (.xlsx, .xls) file.');
                    return;
                }

                // Check size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    Alert.alert('Error', 'File size exceeds 5MB limit');
                    return;
                }
                setSelectedFile(file);
            }
        } catch (err) {
            console.error('Pick error:', err);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const downloadTemplate = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const fileUri = `${FileSystem.documentDirectory}schedule_template.csv`;
            
            const downloadRes = await FileSystem.downloadAsync(
                `${API_BASE_URL}/api/admin/schedule-template`,
                fileUri,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (downloadRes.status === 200) {
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                Alert.alert('Error', 'Failed to download template');
            }
        } catch (err) {
            console.error('Download error:', err);
            Alert.alert('Error', 'Could not download template');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            setUploadProgress(0);
            const token = await SecureStore.getItemAsync('socketToken');

            const formData = new FormData();
            
            // On some platforms, mimeType might be missing or generic
            let mimeType = selectedFile.mimeType;
            if (!mimeType || mimeType === 'application/octet-stream') {
                if (selectedFile.name.endsWith('.csv')) mimeType = 'text/csv';
                else if (selectedFile.name.endsWith('.xlsx')) mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                else if (selectedFile.name.endsWith('.xls')) mimeType = 'application/vnd.ms-excel';
            }

            formData.append('schedule', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: mimeType || 'application/octet-stream'
            });

            const response = await axios.post(`${API_BASE_URL}/api/admin/upload-schedule`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            Alert.alert('Success', `Schedule uploaded successfully! Processed ${response.data.count} assignments.`, [
                { text: 'OK', onPress: () => {
                    setSelectedFile(null);
                    fetchRecentUploads();
                }}
            ]);

            if (response.data.errors) {
                console.warn('Upload warnings:', response.data.errors);
            }

        } catch (error) {
            console.error('Upload error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Failed to upload schedule. Please check file format.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Schedule</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Instructions */}
                <View style={styles.instructionCard}>
                    <Text style={styles.instructionText}>
                        Please upload the bus schedule in Excel or CSV format. Ensure all columns match the provided template.
                    </Text>
                    <TouchableOpacity style={styles.templateButton} onPress={downloadTemplate}>
                        <MaterialCommunityIcons name="download" size={20} color={colors.primary} />
                        <Text style={styles.templateButtonText}>Download Template</Text>
                    </TouchableOpacity>
                </View>

                {/* Upload Zone */}
                {!selectedFile ? (
                    <TouchableOpacity style={styles.uploadZone} onPress={pickDocument}>
                        <View style={styles.uploadIconCircle}>
                            <MaterialCommunityIcons name="cloud-upload" size={40} color={colors.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Tap to upload</Text>
                        <Text style={styles.uploadSubtitle}>or select a CSV/XLSX file</Text>
                        <View style={styles.sizeBadge}>
                            <Text style={styles.sizeBadgeText}>Max size: 5MB</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.fileSelectedCard}>
                        <Text style={styles.sectionLabel}>READY TO UPLOAD</Text>
                        <View style={styles.fileRow}>
                            <View style={styles.fileIconContainer}>
                                <MaterialCommunityIcons 
                                    name={selectedFile.name.endsWith('.csv') ? 'file-delimited' : 'file-excel'} 
                                    size={24} 
                                    color="#10b981" 
                                />
                            </View>
                            <View style={styles.fileMeta}>
                                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                <Text style={styles.fileSize}>{formatSize(selectedFile.size)}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Progress Bar during upload */}
                {isUploading && (
                    <View style={styles.uploadProgressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Uploading...</Text>
                            <Text style={styles.progressLabel}>{uploadProgress}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
                        </View>
                    </View>
                )}

                {/* Recent Activity */}
                <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>Recently Processed</Text>
                    <TouchableOpacity onPress={fetchRecentUploads}>
                        <MaterialCommunityIcons name="refresh" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Activity List */}
                <View style={styles.activityList}>
                    {isLoadingRecent ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : recentUploads.length === 0 ? (
                        <Text style={styles.emptyText}>No recent uploads found.</Text>
                    ) : (
                        recentUploads.map((item, index) => (
                            <View key={item._id || index} style={styles.activityItem}>
                                <View style={styles.activityMain}>
                                    <View style={styles.activityIconBox}>
                                        <MaterialCommunityIcons name="table-large" size={20} color="#6b7280" />
                                    </View>
                                    <View style={styles.activityMeta}>
                                        <Text style={styles.activityFileName} numberOfLines={1}>
                                            {item.fileName || 'Schedule Data'}
                                        </Text>
                                        <View style={styles.activityDetails}>
                                            <Text style={styles.activityDate}>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </Text>
                                            <View style={styles.dot} />
                                            <View style={styles.statusRow}>
                                                <MaterialCommunityIcons 
                                                    name={item.isActive ? "check-circle" : "archive-clock"} 
                                                    size={12} 
                                                    color={item.isActive ? "#10b981" : "#9ca3af"} 
                                                />
                                                <Text style={item.isActive ? styles.statusTextActive : styles.statusArchived}>
                                                    {item.isActive ? 'Active' : 'Archived'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.activityContext}>
                                            Bus #{item.busId?.busNumber} • {item.routeId?.routeName}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.publishButton, (!selectedFile || isUploading) && { opacity: 0.5 }]} 
                    onPress={handleUpload}
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? (
                        <ActivityIndicator color="#1c190d" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="publish" size={24} color="#1c190d" />
                            <Text style={styles.publishButtonText}>Upload & Publish</Text>
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
        backgroundColor: '#f8f8f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        backgroundColor: '#f8f8f5',
        borderBottomWidth: 1,
        borderBottomColor: '#e8e4ce',
    },
    backButton: {
        marginLeft: -10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    instructionCard: {
        gap: 12,
        marginBottom: 24,
    },
    instructionText: {
        fontSize: 16,
        color: colors.brandGrey,
        lineHeight: 22,
    },
    templateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e8e4ce',
        backgroundColor: '#fff',
    },
    templateButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brandGrey,
    },
    uploadZone: {
        height: 200,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#e8e4ce',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32,
    },
    uploadIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary + '15',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    uploadSubtitle: {
        fontSize: 14,
        color: '#6b6651',
    },
    sizeBadge: {
        backgroundColor: '#f8f8f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    sizeBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6b6651',
    },
    fileSelectedCard: {
        marginBottom: 32,
        gap: 8,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6b6651',
        letterSpacing: 1,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e8e4ce',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    fileIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#dcfce7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    fileMeta: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brandGrey,
    },
    fileSize: {
        fontSize: 12,
        color: '#6b6651',
        marginTop: 2,
    },
    uploadProgressContainer: {
        marginBottom: 32,
        gap: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e8e4ce',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    activityList: {
        gap: 12,
    },
    activityItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e8e4ce',
    },
    activityMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityMeta: {
        flex: 1,
    },
    activityFileName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.brandGrey,
    },
    activityDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    activityDate: {
        fontSize: 11,
        color: '#6b6651',
    },
    activityContext: {
        fontSize: 10,
        color: '#9ca3af',
        marginTop: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#d1d5db',
        marginHorizontal: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusTextActive: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
    },
    statusArchived: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6b7280',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: spacing.lg,
        paddingBottom: 32,
        backgroundColor: 'rgba(248, 248, 245, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e8e4ce',
    },
    publishButton: {
        backgroundColor: colors.primary,
        height: 52,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    publishButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1c190d',
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default AdminUploadSchedule;
