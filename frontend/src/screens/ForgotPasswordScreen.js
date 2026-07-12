import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import Theme from '../theme/Theme';
import { globalStyles } from '../theme/globalStyles';
import { API_BASE_URL } from '../config/api';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('parent');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSendCode = async () => {
        if (!email) {
            setMsg("Please enter your registered email");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
                email: email.toLowerCase().trim(),
                role
            });
            setMsg("If registered, a verification code has been dispatched.");
            setTimeout(() => {
                navigation.navigate('ResetPassword', { email: email.toLowerCase().trim(), role });
            }, 1200);
        } catch (err) {
            setMsg("Error processing request. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[globalStyles.container, { backgroundColor: Theme.colors.backgroundLight, padding: Theme.spacing.lg }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color={Theme.colors.brandGrey} />
            </TouchableOpacity>
            
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your details to receive an access token code.</Text>

            {msg ? <Text style={styles.feedbackText}>{msg}</Text> : null}

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

            <TextInput 
                style={globalStyles.input}
                placeholder="Enter email address"
                placeholderTextColor={Theme.colors.textSecondaryLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={[globalStyles.button, { marginTop: 20 }]} onPress={handleSendCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={globalStyles.buttonText}>Send Reset Code</Text>}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: { marginTop: 20, marginBottom: 20 },
    title: { fontSize: Theme.typography.sizes['2xl'], color: Theme.colors.brandGrey, fontWeight: '800', marginBottom: 8 },
    subtitle: { color: Theme.colors.textSecondaryLight, marginBottom: 24 },
    feedbackText: { color: Theme.colors.primary, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
    radioContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    radioOption: { flexDirection: 'row', alignItems: 'center' },
    radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: Theme.colors.borderDark, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    radioActive: { borderColor: Theme.colors.primary },
    radioInner: { height: 10, width: 10, borderRadius: 5, backgroundColor: Theme.colors.primary },
    radioLabel: { fontSize: Theme.typography.sizes.sm, fontWeight: '600' }
});

export default ForgotPasswordScreen;