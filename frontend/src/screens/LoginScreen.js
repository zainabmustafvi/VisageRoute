import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';
import { globalStyles } from '../theme/globalStyles';

// For physical devices or Expo testing, point this to your machine's Wi-Fi IP Address
const API_URL = 'http://192.168.0.105:5000/api/auth';

const LoginScreen = ({ navigation }) => {
    const [role, setRole] = useState('parent');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // 1. Basic Frontend Validation
        if (!userId || !password) {
            setErrorMsg('Please enter both User ID and Password.');
            return;
        }
        setErrorMsg('');
        setLoading(true);

        try {
            // 2. Axios Request
            const response = await axios.post(`${API_URL}/login`, {
                userId,
                password,
                role
            });

            // 3. Store user data/token (Fallback if cookies are tricky in RN)
            // Since it's React Native, cookies from Axios exist but SecureStore is safer for persistent sessions
            if (response.data.user) {
                // Securely store role to redirect next time without login
                await SecureStore.setItemAsync('userRole', response.data.user.role);

                // 4. Role-based Navigation mapping
                switch (response.data.user.role) {
                    case 'admin': navigation.replace('AdminHome'); break;
                    case 'driver': navigation.replace('DriverHome'); break;
                    case 'parent': navigation.replace('ParentHome'); break;
                }
            }
        } catch (error) {
            // 5. Security Feedback Handling
            if (error.response && error.response.status === 401) {
                setErrorMsg('Invalid credentials'); // Generic error as requested
            } else if (error.response && error.response.status === 429) {
                setErrorMsg('Too many attempts, please wait.'); // Graceful rate limit handling
            } else {
                setErrorMsg('Network error. Ensure backend is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                {/* Header Hero Section */}
                <View style={styles.heroContainer}>
                    <View style={styles.iconCircle}>
                        <MaterialIcons name="directions-bus" size={32} color={Theme.colors.brandGrey} />
                    </View>
                    <Text style={styles.heroTitle}>VisageRoute</Text>
                    <Text style={styles.heroSubtitle}>Track your campus ride</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.instructionText}>Please sign in to continue</Text>

                    {/* Error Message */}
                    {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                    {/* Role Selection */}
                    <View style={styles.roleContainer}>
                        {['parent', 'driver', 'admin'].map((r) => (
                            <TouchableOpacity
                                key={r}
                                style={styles.radioGroup}
                                onPress={() => setRole(r)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.radioOuter, role === r && styles.radioOuterActive]}>
                                    {role === r && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.radioLabel}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* User ID Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>User ID</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="person" size={20} color={Theme.colors.textSecondaryLight} style={styles.inputIcon} />
                            <TextInput
                                style={[globalStyles.input, { paddingLeft: 44, borderColor: errorMsg ? Theme.colors.error : Theme.colors.borderLight }]}
                                placeholder="Enter User ID"
                                value={userId}
                                onChangeText={setUserId}
                                autoCapitalize="none"
                                placeholderTextColor={Theme.colors.textSecondaryLight}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.passwordHeader}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TouchableOpacity><Text style={styles.forgotText}>Forgot?</Text></TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="lock" size={20} color={Theme.colors.textSecondaryLight} style={styles.inputIcon} />
                            <TextInput
                                style={[globalStyles.input, { paddingLeft: 44, paddingRight: 44, borderColor: errorMsg ? Theme.colors.error : Theme.colors.borderLight }]}
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                placeholderTextColor={Theme.colors.textSecondaryLight}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={Theme.colors.textSecondaryLight} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={globalStyles.primaryButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={globalStyles.primaryButtonText}>
                            {loading ? 'Authenticating...' : 'Log In'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.supportContainer}>
                        <MaterialIcons name="support-agent" size={16} color={Theme.colors.textSecondaryLight} />
                        <Text style={styles.supportText}>Need help? Contact Transport Dept.</Text>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundLight,
    },
    heroContainer: {
        height: 240,
        backgroundColor: 'rgba(242, 204, 13, 0.2)', // primary at 20%
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    heroTitle: {
        fontSize: Theme.typography.sizes['3xl'],
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    heroSubtitle: {
        fontSize: Theme.typography.sizes.sm,
        color: Theme.colors.textSecondaryLight,
        marginTop: 4,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    welcomeText: {
        fontSize: Theme.typography.sizes['2xl'],
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
        textAlign: 'center',
        marginBottom: 4,
    },
    instructionText: {
        fontSize: Theme.typography.sizes.base,
        color: Theme.colors.textSecondaryLight,
        textAlign: 'center',
        marginBottom: 24,
    },
    errorText: {
        color: Theme.colors.error,
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '500',
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Theme.colors.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        backgroundColor: Theme.colors.surfaceLight,
    },
    radioOuterActive: {
        borderColor: Theme.colors.primary,
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Theme.colors.primary,
    },
    radioLabel: {
        fontSize: Theme.typography.sizes.sm,
        fontWeight: '500',
        color: Theme.colors.brandGrey,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: Theme.typography.sizes.sm,
        fontWeight: '600',
        color: Theme.colors.brandGrey,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotText: {
        fontSize: Theme.typography.sizes.sm,
        color: Theme.colors.primary,
        fontWeight: '500',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        zIndex: 1,
        padding: 4,
    },
    supportContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        gap: 8,
    },
    supportText: {
        fontSize: Theme.typography.sizes.xs,
        color: Theme.colors.textSecondaryLight,
    }
});

export default LoginScreen;
