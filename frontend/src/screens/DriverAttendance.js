import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Alert, FlatList
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Theme from '../theme/Theme';

const API_BASE_URL = 'http://192.168.0.106:5000'; // Match project pattern

const { width } = Dimensions.get('window');

const DriverAttendance = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedStudent, setScannedStudent] = useState(null);
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null); // 'success', 'error', null
    const [busNumber, setBusNumber] = useState('...');
    const [statusMsg, setStatusMsg] = useState('Ready'); // Diagnostic text
    
    const cameraRef = useRef(null);
    const scanIntervalRef = useRef(null);

    const toggleFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const fetchStudents = async () => {
        try {
            const busId = await SecureStore.getItemAsync('assignedBusId');
            const token = await SecureStore.getItemAsync('socketToken');
            
            if (!busId) {
                Alert.alert("Error", "No bus assigned to you.");
                setLoading(false);
                return;
            }

            // Also fetch dashboard data to get bus number (same as DriverHome)
            const dashRes = await axios.get(`${API_BASE_URL}/api/driver/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBusNumber(dashRes.data.busNumber || '...');

            const response = await axios.get(`${API_BASE_URL}/api/attendance/students/${busId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Fetch Students Error:", error);
            setLoading(false);
        }
    };

    const startScanning = () => {
        if (isScanning) return;
        setIsScanning(true);
        console.log("[Attendance] Starting scanner loop...");
        runScannerCycle();
    };

    const runScannerCycle = async () => {
        if (!isScanning) return;

        if (cameraRef.current) {
            try {
                console.log("[Attendance] Capturing frame...");
                setStatusMsg('Capturing...');
                const photo = await cameraRef.current.takePictureAsync({
                    base64: true,
                    quality: 0.2, // Even lower for speed
                    skipProcessing: true,
                    shutterSound: false,
                    fastMode: true
                });
                
                setStatusMsg('Verifying...');
                await verifyFace(photo.base64);
            } catch (e) {
                console.error("[Attendance] Capture Error:", e);
            }
        } else {
            console.warn("[Attendance] Camera ref not ready");
        }

        // Schedule next capture if still scanning
        if (isScanning) {
            scanIntervalRef.current = setTimeout(runScannerCycle, 3000);
        }
    };

    const stopScanning = () => {
        console.log("[Attendance] Stopping scanner...");
        setIsScanning(false);
        if (scanIntervalRef.current) {
            clearTimeout(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
    };

    const verifyFace = async (base64) => {
        try {
            console.log("[Attendance] Sending to backend for verification...");
            const busId = await SecureStore.getItemAsync('assignedBusId');
            const driverId = await SecureStore.getItemAsync('driverId');
            const token = await SecureStore.getItemAsync('socketToken');

            const response = await axios.post(`${API_BASE_URL}/api/attendance/verify`, {
                imageBase64: base64,
                bus_id: busId,
                driver_id: driverId
            }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000 // 10s timeout
            });

            console.log("[Attendance] Verification Response:", response.data);
            setStatusMsg('Match Found!');

            if (response.data.student) {
                setScanResult('success');
                setScannedStudent(response.data.student);
                
                // Update student list locally
                setStudents(prev => prev.map(s => 
                    s._id === response.data.student._id 
                    ? { ...s, hasBoarded: true, boardingTime: response.data.student.boardingTime } 
                    : s
                ));

                // Auto clear notification after 4s
                setTimeout(() => {
                    setScanResult(null);
                    setScannedStudent(null);
                    setStatusMsg('Ready');
                }, 4000);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("[Attendance] Result: Identity Not Found (404)");
                setStatusMsg('Unknown Face');
                setScanResult('error');
                setTimeout(() => { setScanResult(null); setStatusMsg('Ready'); }, 2000);
            } else if (error.response?.status === 400) {
                console.log("[Attendance] Result: No face detected (400)");
                setStatusMsg('No face detected');
                setScanResult('error');
                setTimeout(() => { setScanResult(null); setStatusMsg('Ready'); }, 2000);
            } else {
                console.error("[Attendance] Network/Server Error:", error.message || error);
                setStatusMsg('Server Error');
                // Also show red border for generic errors so driver knows something is wrong
                setScanResult('error');
                setTimeout(() => { setScanResult(null); setStatusMsg('Ready'); }, 2000);
            }
        }
    };

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
        fetchStudents();
        startScanning();

        return () => stopScanning();
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
        <View style={styles.container}>
            <View style={styles.cameraContainer}>
                <CameraView 
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    facing={facing}
                    enableTorch={flash === 'on'}
                />
                
                {/* Status Overlay */}
                <View style={styles.topControls}>
                    <View style={styles.busBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.busText}>BUS #{busNumber}</Text>
                    </View>
                    <View style={styles.liveBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.liveText}>SCANNING ACTIVE</Text>
                    </View>
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

                {scanResult === null && isScanning && (
                    <View style={styles.detectingContainer}>
                        <View style={styles.detectingBadge}>
                            <Text style={styles.detectingSmall}>{statusMsg.toUpperCase()}</Text>
                            <Text style={styles.detectingLarge}>FACES...</Text>
                        </View>
                    </View>
                )}

                <View style={styles.scanFrameContainer}>
                    <View style={[
                        styles.scanFrame, 
                        scanResult === 'success' && styles.scanFrameSuccess,
                        scanResult === 'error' && styles.scanFrameError
                    ]}>
                        <View style={[styles.corner, styles.cornerTL, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                        <View style={[styles.corner, styles.cornerTR, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                        <View style={[styles.corner, styles.cornerBL, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                        <View style={[styles.corner, styles.cornerBR, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                    </View>
                </View>

                <View style={styles.bottomOverlay}>
                    {scanResult === 'success' && scannedStudent && (
                        <View style={styles.successNotification}>
                            <View style={styles.checkCircle}>
                                <MaterialIcons name="check" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.successTitle}>Attendance Logged</Text>
                                <Text style={styles.successSubtitle}>{scannedStudent.name} confirmed.</Text>
                            </View>
                        </View>
                    )}

                    {scanResult === 'error' && (
                        <View style={[styles.successNotification, { backgroundColor: '#ef4444' }]}>
                            <View style={styles.checkCircle}>
                                <MaterialIcons name="close" size={20} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.successTitle}>Identity Not Found</Text>
                                <Text style={styles.successSubtitle}>Check lighting or try again.</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.listContainer}>
                        <View style={styles.recentHeader}>
                            <Text style={styles.recentLabel}>PASSENGER LIST</Text>
                            <Text style={styles.timestamp}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>

                        <FlatList
                            data={students}
                            keyExtractor={item => item._id}
                            style={{ maxHeight: 250 }}
                            renderItem={({ item }) => (
                                <View style={[styles.studentCard, item.hasBoarded && styles.studentCardActive]}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{item.name}</Text>
                                        <Text style={styles.studentId}>
                                            {item.hasBoarded ? `Boarded at ${new Date(item.boardingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not Boarded'}
                                        </Text>
                                    </View>
                                    {item.hasBoarded ? (
                                        <View style={styles.successBadge}>
                                            <MaterialIcons name="check-circle" size={18} color="#4ade80" />
                                            <Text style={styles.successBadgeText}>BOARDED</Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.successBadge, { borderColor: 'rgba(255,255,255,0.2)' }]}>
                                            <Text style={[styles.successBadgeText, { color: '#9ca3af' }]}>PENDING</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                </View>
            </View>
        </View>
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
        backgroundColor: '#000',
    },
    topControls: {
        position: 'absolute',
        top: 50,
        left: 24,
        right: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    liveBadge: {
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
        top: 110,
        right: 24,
        gap: 16,
        zIndex: 10,
    },
    controlBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    detectingContainer: {
        position: 'absolute',
        top: '20%',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 5,
    },
    detectingBadge: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    detectingSmall: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
    detectingLarge: {
        color: '#fff',
        fontSize: 14,
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
        borderColor: 'rgba(255,255,255,0.3)',
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
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    listContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 30,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    successNotification: {
        backgroundColor: '#22c55e',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
        elevation: 10,
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
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    timestamp: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '700',
    },
    studentCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    studentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    studentName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
    studentId: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '600',
    },
    successBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74,222,128,0.3)',
    },
    successBadgeText: {
        color: '#4ade80',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        marginLeft: 4,
    },
    scanFrameSuccess: {
        borderColor: '#4ade80',
        borderWidth: 4,
    },
    scanFrameError: {
        borderColor: '#ef4444',
        borderWidth: 4,
    },
    studentCardActive: {
        backgroundColor: 'rgba(74,222,128,0.1)',
        borderColor: 'rgba(74,222,128,0.2)',
    }
});

export default DriverAttendance;
