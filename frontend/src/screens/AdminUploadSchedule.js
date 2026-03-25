import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminUploadSchedule = ({ navigation }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(new Animated.Value(0));
    const [selectedFile, setSelectedFile] = useState(null);

    const handleUpload = () => {
        setIsUploading(true);
        Animated.timing(progress, {
            toValue: 0.45,
            duration: 2000,
            useNativeDriver: false,
        }).start();
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
                    <TouchableOpacity style={styles.templateButton}>
                        <MaterialCommunityIcons name="download" size={20} color={colors.primary} />
                        <Text style={styles.templateButtonText}>Download Template</Text>
                    </TouchableOpacity>
                </View>

                {/* Upload Zone */}
                {!selectedFile ? (
                    <TouchableOpacity style={styles.uploadZone} onPress={() => setSelectedFile({ name: 'Spring_Semester_2024_Final.csv', size: '2.4 MB' })}>
                        <View style={styles.uploadIconCircle}>
                            <MaterialCommunityIcons name="cloud-upload" size={40} color={colors.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Tap to upload</Text>
                        <Text style={styles.uploadSubtitle}>or drag and drop your file here</Text>
                        <View style={styles.sizeBadge}>
                            <Text style={styles.sizeBadgeText}>Max size: 5MB</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.fileSelectedCard}>
                        <Text style={styles.sectionLabel}>READY TO UPLOAD</Text>
                        <View style={styles.fileRow}>
                            <View style={styles.fileIconContainer}>
                                <MaterialCommunityIcons name="description" size={24} color="#10b981" />
                            </View>
                            <View style={styles.fileMeta}>
                                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                <Text style={styles.fileSize}>{selectedFile.size}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Recent Activity */}
                <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>Recent Activity</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Activity List */}
                <View style={styles.activityList}>
                    {/* Uploading Item */}
                    <View style={styles.activityItem}>
                        <View style={styles.activityMain}>
                            <View style={[styles.activityIconBox, { backgroundColor: colors.primary + '20' }]}>
                                <MaterialCommunityIcons name="upload-network" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.activityMeta}>
                                <Text style={styles.activityFileName} numberOfLines={1}>Fall_2024_Draft_v2.xlsx</Text>
                                <Text style={styles.activityStatusLoading}>Uploading...</Text>
                            </View>
                        </View>
                        <View style={styles.progressRow}>
                            <View style={styles.progressBarBg}>
                                <Animated.View style={[styles.progressBarFill, { width: '45%' }]} />
                            </View>
                            <Text style={styles.progressPercent}>45%</Text>
                        </View>
                    </View>

                    {/* Completed Item */}
                    <View style={styles.activityItem}>
                        <View style={styles.activityMain}>
                            <View style={styles.activityIconBox}>
                                <MaterialCommunityIcons name="table-large" size={20} color="#6b7280" />
                            </View>
                            <View style={styles.activityMeta}>
                                <Text style={styles.activityFileName} numberOfLines={1}>Fall_Semester_2023.csv</Text>
                                <View style={styles.activityDetails}>
                                    <Text style={styles.activityDate}>Oct 24, 2023</Text>
                                    <View style={styles.dot} />
                                    <View style={styles.statusRow}>
                                        <MaterialCommunityIcons name="check-circle" size={12} color="#10b981" />
                                        <Text style={styles.statusTextActive}>Active</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="dots-vertical" size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Archived Item */}
                    <View style={[styles.activityItem, { opacity: 0.6 }]}>
                        <View style={styles.activityMain}>
                            <View style={styles.activityIconBox}>
                                <MaterialCommunityIcons name="table-large" size={20} color="#6b7280" />
                            </View>
                            <View style={styles.activityMeta}>
                                <Text style={styles.activityFileName} numberOfLines={1}>Summer_Schedule_2023.xlsx</Text>
                                <View style={styles.activityDetails}>
                                    <Text style={styles.activityDate}>May 15, 2023</Text>
                                    <View style={styles.dot} />
                                    <Text style={styles.statusArchived}>Archived</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="dots-vertical" size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.publishButton, !selectedFile && { opacity: 0.5 }]} 
                    onPress={handleUpload}
                    disabled={!selectedFile}
                >
                    <MaterialCommunityIcons name="publish" size={24} color="#1c190d" />
                    <Text style={styles.publishButtonText}>Upload & Publish</Text>
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
    viewAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
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
    activityStatusLoading: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 12,
        paddingLeft: 52,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#f8f8f5',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b6651',
    },
    activityDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    activityDate: {
        fontSize: 12,
        color: '#6b6651',
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
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
    statusArchived: {
        fontSize: 12,
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
});

export default AdminUploadSchedule;
