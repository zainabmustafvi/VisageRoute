import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';
import { globalStyles } from '../theme/globalStyles';

import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/auth`;

const LoginScreen = ({ navigation }) => {
    const [role, setRole] = useState('parent');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [illegalCharWarning, setIllegalCharWarning] = useState(false);

    const handleInputChange = (text, setter) => {
        if (/[\$\.\{\}]/.test(text)) {
            setIllegalCharWarning(true);
        } else {
            setIllegalCharWarning(false);
        }
        setter(text);
    };

    const handleLogin = async () => {
        setErrorMsg('');
        
        // Frontend Input Email Format Regex Verification
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg("Please enter a valid email address");
            return;
        }

        if (!password || password.length < 6) {
            setErrorMsg("Password must be at least 6 characters");
            return;
        }

        setLoading(false);
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: email.toLowerCase().trim(),
                password,
                role
            });

            if (response.data && response.data.token) {
                await SecureStore.setItemAsync('userToken', response.data.token);
                await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));

                if (role === 'admin') navigation.replace('AdminHome');
                else if (role === 'driver') navigation.replace('DriverHome');
                else navigation.replace('ParentHome');
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <SafeAreaView style={[globalStyles.container, styles.bgContainer]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', padding: Theme.spacing.lg }}>
                <Text style={styles.logoText}>VisageRoute</Text>
                
                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
                {illegalCharWarning ? <Text style={styles.warningText}>Warning: Avoid potential system syntax characters ($, ., {'{', '}'})</Text> : null}

                {/* Role Toggles */}
                <View style={styles.radioContainer}>
                    {['parent', 'driver', 'admin'].map((item) => (
                        <TouchableOpacity key={item} style={styles.radioOption} onPress={() => setRole(item)}>
                            <View style={[styles.radioCircle, role === item && styles.radioActive]}>
                                {role === item && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>{item.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Email Fields */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons name="email" size={20} color={Theme.colors.textSecondaryLight} style={styles.inputIcon} />
                        <TextInput 
                            style={[globalStyles.input, { paddingLeft: 48 }]} 
                            placeholder="Enter your email" 
                            placeholderTextColor={Theme.colors.textSecondaryLight}
                            value={email}
                            onChangeText={(text) => handleInputChange(text.toLowerCase(), setEmail)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Password Fields */}
                <View style={styles.inputGroup}>
                    <View style={styles.passwordHeader}>
                        <Text style={styles.inputLabel}>Password</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons name="lock" size={20} color={Theme.colors.textSecondaryLight} style={styles.inputIcon} />
                        <TextInput 
                            style={[globalStyles.input, { paddingLeft: 48, paddingRight: 48 }]} 
                            placeholder="Enter password" 
                            placeholderTextColor={Theme.colors.textSecondaryLight}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => handleInputChange(text, setPassword)}
                        />
                        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                            <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={Theme.colors.textSecondaryLight} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Forgot Password Navigation Trigger */}
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: Theme.spacing.md }}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <View style={styles.loginButtonWrapper}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>{loading ? 'Loading...' : 'Login'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    bgContainer: { backgroundColor: Theme.colors.backgroundLight },
    loginButtonWrapper: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 24,
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: '#FACC15',
        height: 56,
        width: '100%',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FACC15',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoText: { fontSize: Theme.typography.sizes['4xl'], color: Theme.colors.brandGrey, textAlign: 'center', marginBottom: Theme.spacing.xl, fontWeight: '800' },
    errorText: { color: Theme.colors.error, textAlign: 'center', marginBottom: 12 },
    warningText: { color: 'orange', fontSize: 11, textAlign: 'center', marginBottom: 8 },
    radioContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    radioOption: { flexDirection: 'row', alignItems: 'center' },
    radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: Theme.colors.borderDark, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    radioActive: { borderColor: Theme.colors.primary },
    radioInner: { height: 10, width: 10, borderRadius: 5, backgroundColor: Theme.colors.primary },
    radioLabel: { fontSize: Theme.typography.sizes.sm, fontWeight: '600', color: Theme.colors.brandGrey },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: Theme.typography.sizes.sm, fontWeight: '600', color: Theme.colors.brandGrey, marginBottom: 8, marginLeft: 4 },
    inputWrapper: { position: 'relative', justifyContent: 'center' },
    inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
    passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    forgotText: { fontSize: Theme.typography.sizes.sm, color: Theme.colors.brandGrey, fontWeight: '600', textDecorationLine: 'underline' },
    eyeIcon: { position: 'absolute', right: 16, zIndex: 1 }
});

export default LoginScreen;