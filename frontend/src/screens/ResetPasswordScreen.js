import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Theme from '../theme/Theme';
import { globalStyles } from '../theme/globalStyles';
import { API_BASE_URL } from '../config/api';

const ResetPasswordScreen = ({ route, navigation }) => {
    const { email, role } = route.params;
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                email, role, resetCode, newPassword
            });
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (err) {
            setErrorMsg(err.response?.data?.error || "Error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: Theme.colors.backgroundLight, padding: Theme.spacing.lg, justifyContent: 'center' }]}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Verification targeted to: {email}</Text>

            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

            <TextInput style={globalStyles.input} placeholder="6-Digit Reset Code" maxLength={6} keyboardType="number-pad" value={resetCode} onChangeText={setResetCode} />
            <TextInput style={globalStyles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
            <TextInput style={globalStyles.input} placeholder="Confirm New Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

            <TouchableOpacity style={globalStyles.button} onPress={handleResetPassword}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={globalStyles.buttonText}>Update Password</Text>}
            </TouchableOpacity>

            <TouchableOpacity disabled={resendTimer > 0} style={{ marginTop: 20 }}>
                <Text style={{ color: resendTimer > 0 ? 'grey' : Theme.colors.primary, textAlign: 'center' }}>
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    title: { fontSize: Theme.typography.sizes['2xl'], color: Theme.colors.brandGrey, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: Theme.colors.textSecondaryLight, textAlign: 'center', marginBottom: 20 },
    error: { color: Theme.colors.error, textAlign: 'center', marginBottom: 10 }
});

export default ResetPasswordScreen;