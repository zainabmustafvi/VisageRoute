import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Theme from '../theme/Theme';

const { width } = Dimensions.get('window');

const DriverAttendance = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedStudent, setScannedStudent] = useState(null);
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');

    const toggleFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        // Camera permissions are still loading
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <Text style={styles.permissionText}>We need your permission to show the camera</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
                        <Text style={styles.permissionBtnText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.mainTitle}>Scan{"\n"}Attendance</Text>
                    <Text style={styles.headerSubtitle}>
                        Align student face within the frame for automatic logging.
                    </Text>
                </View>
                <View style={styles.busBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.busText}>BUS #104</Text>
                </View>
            </View>

            <View style={styles.cameraContainer}>
                <View style={styles.cameraFeed}>
                    {/* REAL CAMERA FEED */}
                    <CameraView 
                        style={StyleSheet.absoluteFillObject}
                        facing={facing}
                        flash={flash}
                    />
                    
                    <View style={styles.liveBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.liveText}>LIVE FEED</Text>
                    </View>

                    <View style={styles.cameraControls}>
                        <TouchableOpacity style={styles.controlBtn} onPress={toggleFlash}>
                            <MaterialIcons 
                                name={flash === 'on' ? 'flash-on' : 'flash-off'} 
                                size={20} 
                                color="#fff" 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.controlBtn} onPress={toggleFacing}>
                            <MaterialIcons name="flip-camera-ios" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.detectingContainer}>
                        <View style={styles.detectingBadge}>
                            <Text style={styles.detectingSmall}>DETECTING</Text>
                            <Text style={styles.detectingLarge}>FACE...</Text>
                        </View>
                    </View>

                    <View style={styles.scanFrameContainer}>
                        <View style={styles.scanFrame}>
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />
                        </View>
                    </View>

                    <View style={styles.logsOverlay}>
                        <View style={styles.successNotification}>
                            <View style={styles.checkCircle}>
                                <MaterialIcons name="check" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.successTitle}>Attendance Logged</Text>
                                <Text style={styles.successSubtitle}>Sarah Johnson confirmed.</Text>
                            </View>
                        </View>

                        <View style={styles.recentHeader}>
                            <Text style={styles.recentLabel}>RECENT</Text>
                            <Text style={styles.timestamp}>8:45 AM</Text>
                        </View>

                        <View style={styles.studentCard}>
                            <Image 
                                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1LmPaSFO9he1Q8BZYTJKA8k6ZZhgeULYlotlo7_MNttwHY_XR0Mm3xQUnOL36E2oWPAQ-yU5LScqxqkPGa52jXF5fzGV-_6bF3yYL7q6vgiy0F8Y17I0uzmRZVCS_bGyaP831iSA3aTOJulg7yvz8lXvDQYokJzwrHYJqhYANfUHXA2gSZ5HgAKNBdgEMEYefhArEb-uiUmsgTyVRnSZ3p7X9SsXp3MHhx90YdNUOWxoJEZ1S1_a2SGaOY-BDwoBShco1mLhcTBQ' }} 
                                style={styles.studentAvatar}
                            />
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>Sarah</Text>
                                <Text style={styles.studentId}>ID: #882190</Text>
                            </View>
                            <View style={styles.successBadge}>
                                <Text style={styles.successBadgeText}>SUCCESS</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: Theme.colors.textSecondaryLight,
    },
    permissionBtn: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    permissionBtnText: {
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    mainTitle: {
        fontSize: Theme.typography.sizes['4xl'],
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        lineHeight: 38,
    },
    headerSubtitle: {
        fontSize: Theme.typography.sizes.sm,
        color: Theme.colors.textSecondaryLight,
        fontWeight: '500',
        marginTop: 12,
        maxWidth: 220,
        lineHeight: 18,
    },
    busBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#f2cc0d',
        marginRight: 8,
    },
    busText: {
        fontSize: 10,
        fontWeight: '900',
        color: Theme.colors.textSecondaryLight,
        letterSpacing: 1,
    },
    cameraContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    cameraFeed: {
        flex: 1,
        backgroundColor: '#18181b',
        borderRadius: 40,
        overflow: 'hidden',
        position: 'relative',
    },
    liveBadge: {
        position: 'absolute',
        top: 24,
        left: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginRight: 8,
    },
    liveText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    cameraControls: {
        position: 'absolute',
        top: 24,
        right: 24,
        gap: 16,
    },
    controlBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detectingContainer: {
        position: 'absolute',
        top: '20%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    detectingBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
    },
    detectingSmall: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
    detectingLarge: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 2,
    },
    scanFrameContainer: {
        position: 'absolute',
        top: '25%',
        bottom: '35%',
        left: '10%',
        right: '10%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#4ade80',
        borderWidth: 6,
    },
    cornerTL: {
        top: -6,
        left: -6,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 40,
    },
    cornerTR: {
        top: -6,
        right: -6,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 40,
    },
    cornerBL: {
        bottom: -6,
        left: -6,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 40,
    },
    cornerBR: {
        bottom: -6,
        right: -6,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 40,
    },
    logsOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    successNotification: {
        backgroundColor: '#22c55e',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    checkCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    successSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    recentLabel: {
        color: '#9ca3af',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    timestamp: {
        color: '#6b7280',
        fontSize: 10,
        fontWeight: '700',
    },
    studentCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    studentAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    studentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    studentName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    studentId: {
        color: '#9ca3af',
        fontSize: 10,
        fontWeight: '600',
    },
    successBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(74,222,128,0.5)',
    },
    successBadgeText: {
        color: '#4ade80',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
});

export default DriverAttendance;
