import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    SafeAreaView, TextInput, Switch, ActivityIndicator, Alert, StatusBar 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/Theme';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

const AdminAnnouncementScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [sendPush, setSendPush] = useState(true);
    const [sendEmail, setSendEmail] = useState(false);
    
    // Recipient State
    const [recipientType, setRecipientType] = useState('all'); // 'all', 'route', 'bus'
    const [targetId, setTargetId] = useState('');
    
    // Data for selectors
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoadingData(true);
            const token = await SecureStore.getItemAsync('socketToken');
            const [routesRes, busesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admin/routes`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/admin/buses`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setRoutes(routesRes.data);
            setBuses(busesRes.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSend = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Error', 'Please fill in the subject and message.');
            return;
        }

        if (recipientType !== 'all' && !targetId) {
            Alert.alert('Error', `Please select a specific ${recipientType}.`);
            return;
        }

        try {
            setIsSending(true);
            const token = await SecureStore.getItemAsync('socketToken');
            
            const payload = {
                title,
                content,
                recipients: {
                    type: recipientType,
                    targetId: targetId || null
                },
                deliveryOptions: {
                    push: sendPush,
                    email: sendEmail
                },
                priority: isUrgent ? 'urgent' : 'normal'
            };

            await axios.post(`${API_BASE_URL}/api/admin/announcements`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Announcement sent successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error('Send error:', error);
            Alert.alert('Error', 'Failed to send announcement');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.brandGrey} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Announcement</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Recipients Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recipients</Text>
                    <View style={styles.chipRow}>
                        <TouchableOpacity 
                            style={[styles.chip, recipientType === 'all' && styles.chipActive]} 
                            onPress={() => { setRecipientType('all'); setTargetId(''); }}
                        >
                            <Text style={[styles.chipText, recipientType === 'all' && styles.chipTextActive]}>All Parents</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.chip, recipientType === 'route' && styles.chipActive]} 
                            onPress={() => setRecipientType('route')}
                        >
                            <Text style={[styles.chipText, recipientType === 'route' && styles.chipTextActive]}>By Route</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.chip, recipientType === 'bus' && styles.chipActive]} 
                            onPress={() => setRecipientType('bus')}
                        >
                            <Text style={[styles.chipText, recipientType === 'bus' && styles.chipTextActive]}>By Bus</Text>
                        </TouchableOpacity>
                    </View>

                    {recipientType !== 'all' && (
                        <View style={styles.selectorWrapper}>
                            <Picker
                                selectedValue={targetId}
                                onValueChange={(itemValue) => setTargetId(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label={`Select a ${recipientType}...`} value="" />
                                {recipientType === 'route' ? (
                                    routes.map(r => <Picker.Item key={r._id} label={r.routeName} value={r._id} />)
                                ) : (
                                    buses.map(b => <Picker.Item key={b._id} label={`Bus #${b.busNumber} (${b.plateNumber})`} value={b._id} />)
                                )}
                            </Picker>
                        </View>
                    )}
                </View>

                {/* Content Section */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Subject</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g. Schedule Update"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Message Body</Text>
                        <Text style={styles.charCount}>{content.length}/500</Text>
                    </View>
                    <TextInput 
                        style={[styles.input, styles.textArea]}
                        placeholder="Details about the announcement..."
                        multiline
                        numberOfLines={6}
                        value={content}
                        onChangeText={setContent}
                        maxLength={500}
                        textAlignVertical="top"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Options Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Options</Text>
                    <View style={styles.optionsCard}>
                        <View style={styles.optionItem}>
                            <View style={styles.optionLeft}>
                                <MaterialCommunityIcons name="alert-decagram" size={24} color="#f97316" />
                                <View>
                                    <Text style={styles.optionTitle}>Mark as Urgent</Text>
                                    <Text style={styles.optionSubtitle}>Sends high priority alert</Text>
                                </View>
                            </View>
                            <Switch 
                                value={isUrgent} 
                                onValueChange={setIsUrgent}
                                trackColor={{ false: '#d1d5db', true: colors.primary }}
                            />
                        </View>
                        
                        <View style={styles.divider} />

                        <View style={styles.checkItem}>
                            <TouchableOpacity style={styles.checkRow} onPress={() => setSendPush(!sendPush)}>
                                <MaterialCommunityIcons 
                                    name={sendPush ? "checkbox-marked" : "checkbox-blank-outline"} 
                                    size={24} 
                                    color={sendPush ? colors.primary : "#9ca3af"} 
                                />
                                <Text style={styles.checkText}>Push Notification</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.checkItem}>
                            <TouchableOpacity style={styles.checkRow} onPress={() => setSendEmail(!sendEmail)}>
                                <MaterialCommunityIcons 
                                    name={sendEmail ? "checkbox-marked" : "checkbox-blank-outline"} 
                                    size={24} 
                                    color={sendEmail ? colors.primary : "#9ca3af"} 
                                />
                                <Text style={styles.checkText}>Email Notification</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.sendButton, isSending && { opacity: 0.7 }]} 
                    onPress={handleSend}
                    disabled={isSending}
                >
                    {isSending ? (
                        <ActivityIndicator color="#111827" />
                    ) : (
                        <>
                            <Text style={styles.sendButtonText}>Send Announcement</Text>
                            <MaterialCommunityIcons name="send" size={20} color="#111827" />
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
        color: '#1c190d',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1c190d',
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e8e4ce',
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b6651',
    },
    chipTextActive: {
        color: '#1c190d',
    },
    selectorWrapper: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e8e4ce',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b6651',
        marginLeft: 4,
    },
    charCount: {
        fontSize: 12,
        color: '#9ca3af',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e8e4ce',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1c190d',
    },
    textArea: {
        height: 140,
    },
    optionsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e8e4ce',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1c190d',
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#6b6651',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
    },
    checkItem: {
        padding: 16,
        paddingTop: 8,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c190d',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 16,
        paddingBottom: 32,
        backgroundColor: 'rgba(248, 248, 245, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e8e4ce',
    },
    sendButton: {
        height: 54,
        borderRadius: 14,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
});

export default AdminAnnouncementScreen;
