/**
 * DriverAttendance.js
 *
 * Full on-device face recognition pipeline:
 *  1. react-native-vision-camera  →  live camera frames
 *  2. vision-camera-face-detector →  ML Kit bounding box
 *  3. vision-camera-resize-plugin →  crop + resize to 112×112 RGB
 *  4. react-native-fast-tflite   →  MobileFaceNet 128-d embedding
 *  5. axios POST /api/attendance/verify  →  cosine match on server
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    Dimensions, ActivityIndicator, Alert, FlatList, Platform,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';
import { API_BASE_URL } from '../config/api';

// Vision Camera v4
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useFrameProcessor,
} from 'react-native-vision-camera';

// ML Kit face detection (react-native-vision-camera-face-detector v1.10 for VisionCamera v4)
import { useFaceDetector } from 'react-native-vision-camera-face-detector';

// Frame resize / crop (vision-camera-resize-plugin v3 for VisionCamera v4)
import { useResizePlugin } from 'vision-camera-resize-plugin';

// TFLite inference (react-native-fast-tflite v1)
import { loadTensorflowModel } from 'react-native-fast-tflite';

// Worklets
import { Worklets } from 'react-native-worklets-core';

const { width } = Dimensions.get('window');

// ─── Cosine similarity (JS-side, used only for logging) ──────────────────────
// Real matching happens on the server; this is just for local debug logging.
const cosineSim = (a, b) => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-8);
};

// ─── Constants ────────────────────────────────────────────────────────────────
const MODEL_INPUT_SIZE = 112; // MobileFaceNet expects 112×112
const FACE_CONFIDENCE_MIN = 0.5; // ML Kit probability threshold
const VERIFY_COOLDOWN_MS = 3500; // Min time between API calls

// ─── Main Component ───────────────────────────────────────────────────────────
const DriverAttendance = () => {
    // ── Permissions ────────────────────────────────────────────────────────
    const { hasPermission, requestPermission } = useCameraPermission();

    // ── Camera device: prefer front camera for face scanning ───────────────
    const [facing, setFacing] = useState('front');
    // VisionCamera v4: select a device by position directly (v3 used devices.front/back).
    const device = useCameraDevice(facing);

    // ── App state ──────────────────────────────────────────────────────────
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busNumber, setBusNumber] = useState('...');
    const [scannedStudent, setScannedStudent] = useState(null);
    const [scanResult, setScanResult] = useState(null); // 'success' | 'error' | null
    const [statusMsg, setStatusMsg] = useState('Scanning...');
    const [faceDetected, setFaceDetected] = useState(false);
    const [isActive, setIsActive] = useState(true);

    // ── Refs (worklet-safe) ────────────────────────────────────────────────
    const lastVerifyTime = useRef(0);
    const isVerifying = useRef(false);

    // ── TFLite model (loaded async on mount) ──────────────────────────────
    const [model, setModel] = useState(null);
    const [modelReady, setModelReady] = useState(false);

    useEffect(() => {
        loadTensorflowModel(require('../../assets/mobilefacenet.tflite'))
            .then(m => {
                setModel(m);
                setModelReady(true);
                console.log('[TFLite] MobileFaceNet model loaded');
            })
            .catch(e => console.error('[TFLite] Model load error:', e));
    }, []);

    // ── ML Kit face detector ───────────────────────────────────────────────
    const { detectFaces } = useFaceDetector({
        performanceMode: 'fast',
        classificationMode: 'none',
        landmarkMode: 'none',
        contourMode: 'none',
        minFaceSize: 0.15,
    });

    // ── Resize plugin ──────────────────────────────────────────────────────
    const { resize } = useResizePlugin();

    // ── Worklet→JS bridge callbacks ────────────────────────────────────────
    const onFaceDetectedJS = Worklets.createRunOnJS((embeddingArray) => {
        handleEmbedding(embeddingArray);
    });

    const onFaceStatusJS = Worklets.createRunOnJS((detected) => {
        setFaceDetected(detected);
    });

    // ── Embedding → API ────────────────────────────────────────────────────
    const handleEmbedding = useCallback(async (embeddingArray) => {
        if (isVerifying.current) return;
        const now = Date.now();
        if (now - lastVerifyTime.current < VERIFY_COOLDOWN_MS) return;

        isVerifying.current = true;
        lastVerifyTime.current = now;
        setStatusMsg('Verifying...');

        try {
            const busId = await SecureStore.getItemAsync('assignedBusId');
            const driverId = await SecureStore.getItemAsync('driverId');
            const token = await SecureStore.getItemAsync('socketToken');

            const response = await axios.post(
                `${API_BASE_URL}/api/attendance/verify`,
                {
                    embedding: Array.from(embeddingArray),
                    bus_id: busId,
                    driver_id: driverId,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000,
                }
            );

            console.log('[Attendance] ✅ Match:', response.data.studentName);
            setStatusMsg('Match Found!');

            if (response.data.student) {
                setScanResult('success');
                setScannedStudent(response.data.student);

                // Update local manifest
                setStudents(prev =>
                    prev.map(s =>
                        s._id === response.data.student._id
                            ? { ...s, hasBoarded: true, boardingTime: response.data.student.boardingTime }
                            : s
                    )
                );

                setTimeout(() => {
                    setScanResult(null);
                    setScannedStudent(null);
                    setStatusMsg('Scanning...');
                }, 4000);
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 409) {
                console.log('[Attendance] Already boarded');
                setStatusMsg('Already Boarded');
                setScanResult('success');
            } else if (status === 404) {
                console.log('[Attendance] Unknown face');
                setStatusMsg('Unknown Face');
                setScanResult('error');
            } else if (status === 400) {
                console.log('[Attendance] No valid embedding');
                setStatusMsg('No Face Detected');
                setScanResult('error');
            } else {
                console.error('[Attendance] Server error:', error.message);
                setStatusMsg('Server Error');
                setScanResult('error');
            }
            setTimeout(() => {
                setScanResult(null);
                setStatusMsg('Scanning...');
            }, 2000);
        } finally {
            isVerifying.current = false;
        }
    }, []);

    // ── Frame Processor (runs on GPU thread via Worklets) ──────────────────
    const frameProcessor = useFrameProcessor(
        (frame) => {
            'worklet';

            // Guard: model must be ready (checked via worklet-shared state)
            if (!modelReady || !model) return;

            // 1. Detect faces with ML Kit
            const faces = detectFaces(frame);
            if (!faces || faces.length === 0) {
                onFaceStatusJS(false);
                return;
            }

            // 2. Pick the largest face by bounding box area
            const face = faces.reduce((best, f) => {
                const area = f.bounds.width * f.bounds.height;
                const bestArea = best.bounds.width * best.bounds.height;
                return area > bestArea ? f : best;
            }, faces[0]);

            onFaceStatusJS(true);

            // 3. vision-camera-resize-plugin v3 expects crop coords in FRAME PIXELS
            //    (v2 used normalized 0–1 — this is the key API change).
            //    Add 10% padding on each side of the detected face for better recognition.
            const padX = face.bounds.width * 0.1;
            const padY = face.bounds.height * 0.1;

            const cropX = Math.max(0, face.bounds.x - padX);
            const cropY = Math.max(0, face.bounds.y - padY);
            const cropW = Math.min(frame.width - cropX, face.bounds.width + 2 * padX);
            const cropH = Math.min(frame.height - cropY, face.bounds.height + 2 * padY);

            // 4. Crop + resize to 112×112 RGB Float32
            const resized = resize(frame, {
                scale: {
                    width: MODEL_INPUT_SIZE,
                    height: MODEL_INPUT_SIZE,
                },
                crop: {
                    x: cropX,
                    y: cropY,
                    width: cropW,
                    height: cropH,
                },
                pixelFormat: 'rgb',
                dataType: 'float32',
            });

            if (!resized) return;

            // 5. Normalize to MobileFaceNet's expected [-1, 1] range.
            //    resize-plugin v3 float32 output is already [0, 1], so map [0,1] → [-1,1].
            //    (Mathematically identical to the classic (px/127.5)-1 on a [0,255] input.)
            const pixelCount = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 3;
            for (let i = 0; i < pixelCount; i++) {
                resized[i] = resized[i] * 2.0 - 1.0;
            }

            // 6. Run TFLite inference synchronously
            // fast-tflite v1 runSync takes array of typed arrays, returns array of typed arrays
            const outputs = model.runSync([resized]);
            const embedding = outputs[0]; // Float32Array, length 128

            if (!embedding || embedding.length !== 128) return;

            // 7. Bridge embedding to JS thread for the API call
            onFaceDetectedJS(embedding);
        },
        [model, modelReady, detectFaces, resize, onFaceDetectedJS, onFaceStatusJS]
    );

    // ── Fetch students on mount ────────────────────────────────────────────
    const fetchStudents = async () => {
        try {
            const busId = await SecureStore.getItemAsync('assignedBusId');
            const token = await SecureStore.getItemAsync('socketToken');

            if (!busId) {
                Alert.alert('Error', 'No bus assigned to you.');
                setLoading(false);
                return;
            }

            const dashRes = await axios.get(`${API_BASE_URL}/api/driver/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBusNumber(dashRes.data.busNumber || '...');

            const response = await axios.get(
                `${API_BASE_URL}/api/attendance/students/${busId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(response.data);
        } catch (error) {
            console.error('[Attendance] Fetch Students Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
        fetchStudents();
    }, []);

    // Pause/resume camera when component mounts/unmounts
    useEffect(() => {
        setIsActive(true);
        return () => setIsActive(false);
    }, []);

    // ── Permission gate ────────────────────────────────────────────────────
    if (!hasPermission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <MaterialIcons name="camera-alt" size={64} color="#d1d5db" />
                    <Text style={styles.permissionText}>
                        Camera access is required to scan faces for attendance.
                    </Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
                        <Text style={styles.permissionBtnText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── No device ──────────────────────────────────────────────────────────
    if (!device) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                    <Text style={styles.permissionText}>Loading camera...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Model loading ──────────────────────────────────────────────────────
    if (!modelReady) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                    <Text style={styles.permissionText}>Loading face recognition model...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── Main UI ────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <View style={styles.cameraContainer}>

                {/* Vision Camera with frame processor */}
                <Camera
                    style={StyleSheet.absoluteFillObject}
                    device={device}
                    isActive={isActive}
                    frameProcessor={frameProcessor}
                    pixelFormat="yuv"
                    fps={15}
                />

                {/* Top controls bar */}
                <View style={styles.topControls}>
                    <View style={styles.busBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.busText}>BUS #{busNumber}</Text>
                    </View>
                    <View style={styles.liveBadge}>
                        <View style={[styles.pulseDot, { backgroundColor: faceDetected ? '#22c55e' : '#fff' }]} />
                        <Text style={styles.liveText}>
                            {faceDetected ? 'FACE DETECTED' : 'SCANNING ACTIVE'}
                        </Text>
                    </View>
                </View>

                {/* Camera flip button */}
                <View style={styles.cameraControls}>
                    <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
                    >
                        <MaterialIcons name="flip-camera-ios" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Status badge (centered) */}
                {scanResult === null && (
                    <View style={styles.detectingContainer}>
                        <View style={styles.detectingBadge}>
                            <Text style={styles.detectingSmall}>{statusMsg.toUpperCase()}</Text>
                            <Text style={styles.detectingLarge}>FACES...</Text>
                        </View>
                    </View>
                )}

                {/* Scan oval frame */}
                <View style={styles.scanFrameContainer}>
                    <View style={[
                        styles.scanFrame,
                        scanResult === 'success' && styles.scanFrameSuccess,
                        scanResult === 'error' && styles.scanFrameError,
                        faceDetected && scanResult === null && styles.scanFrameDetected,
                    ]}>
                        <View style={[styles.corner, styles.cornerTL, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                        <View style={[styles.corner, styles.cornerTR, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                        <View style={[styles.corner, styles.cornerBL, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                        <View style={[styles.corner, styles.cornerBR, scanResult === 'error' && { borderColor: '#ef4444' }]} />
                    </View>
                </View>

                {/* Bottom overlay: notification + passenger list */}
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
                                <Text style={styles.successTitle}>{statusMsg}</Text>
                                <Text style={styles.successSubtitle}>Check lighting or try again.</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.listContainer}>
                        <View style={styles.recentHeader}>
                            <Text style={styles.recentLabel}>PASSENGER LIST</Text>
                            <Text style={styles.timestamp}>
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <FlatList
                                data={students}
                                keyExtractor={item => item._id}
                                style={{ maxHeight: 240 }}
                                renderItem={({ item }) => (
                                    <View style={[styles.studentCard, item.hasBoarded && styles.studentCardActive]}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                        </View>
                                        <View style={styles.studentInfo}>
                                            <Text style={styles.studentName}>{item.name}</Text>
                                            <Text style={styles.studentId}>
                                                {item.hasBoarded
                                                    ? `Boarded at ${new Date(item.boardingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                    : 'Not Boarded'}
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
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff',
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
        color: Theme.colors.textSecondaryLight,
        lineHeight: 24,
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
        fontSize: 15,
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
    busBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
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
    scanFrameDetected: {
        borderColor: '#f2cc0d',
        borderWidth: 3,
    },
    scanFrameSuccess: {
        borderColor: '#4ade80',
        borderWidth: 4,
    },
    scanFrameError: {
        borderColor: '#ef4444',
        borderWidth: 4,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#4ade80',
        borderWidth: 6,
    },
    cornerTL: { top: -6, left: -6, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 40 },
    cornerTR: { top: -6, right: -6, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 40 },
    cornerBL: { bottom: -6, left: -6, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 40 },
    cornerBR: { bottom: -6, right: -6, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 40 },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
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
    studentCardActive: {
        backgroundColor: 'rgba(74,222,128,0.1)',
        borderColor: 'rgba(74,222,128,0.2)',
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
});

export default DriverAttendance;
