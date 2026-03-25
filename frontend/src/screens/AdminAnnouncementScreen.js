import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme/Theme';

const AdminAnnouncementScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('all');
    const [isUrgent, setIsUrgent] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.headerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Announcement</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Audience</Text>
                    <View style={styles.chipRow}>
                        <TouchableOpacity 
                            style={[styles.chip, audience === 'all' && styles.chipActive]} 
                            onPress={() => setAudience('all')}
                        >
                            {audience === 'all' && <MaterialCommunityIcons name="check" size={16} color="#000" />}
                            <Text style={[styles.chipText, audience === 'all' && styles.chipTextActive]}>All Users</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.chip, audience === 'drivers' && styles.chipActive]} 
                            onPress={() => setAudience('drivers')}
                        >
                            {audience === 'drivers' && <MaterialCommunityIcons name="check" size={16} color="#000" />}
                            <Text style={[styles.chipText, audience === 'drivers' && styles.chipTextActive]}>Drivers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.chip, audience === 'students' && styles.chipActive]} 
                            onPress={() => setAudience('students')}
                        >
                            {audience === 'students' && <MaterialCommunityIcons name="check" size={16} color="#000" />}
                            <Text style={[styles.chipText, audience === 'students' && styles.chipTextActive]}>Students</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Subject</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g. Bus Schedule Change"
                        placeholderTextColor="#9ca3af"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Message Body</Text>
                        <Text style={styles.charCount}>{message.length}/500</Text>
                    </View>
                    <TextInput 
                        style={[styles.input, styles.textArea]}
                        placeholder="Write your update here... Be clear and concise."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={6}
                        value={message}
                        onChangeText={setMessage}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Options</Text>
                    <View style={styles.optionsCard}>
                        <View style={styles.optionItem}>
                            <View style={styles.optionLeft}>
                                <View style={styles.optionIconContainer}>
                                    <MaterialCommunityIcons name="alert-decagram" size={24} color="#f97316" />
                                </View>
                                <View>
                                    <Text style={styles.optionTitle}>Mark as Urgent</Text>
                                    <Text style={styles.optionSubtitle}>Sends high priority alert</Text>
                                </View>
                            </View>
                            <Switch 
                                value={isUrgent} 
                                onValueChange={setIsUrgent}
                                trackColor={{ false: '#d1d5db', true: colors.primary }}
                                thumbColor="#fff"
                            />
                        </View>
                        
                        <View style={styles.divider} />

                        <View style={styles.channelItem}>
                            <MaterialCommunityIcons name="checkbox-marked" size={20} color={colors.primary} />
                            <Text style={styles.channelText}>Push Notification</Text>
                        </View>
                        <View style={styles.channelItem}>
                            <MaterialCommunityIcons name="checkbox-blank-outline" size={20} color="#d1d5db" />
                            <Text style={styles.channelText}>SMS Text Message</Text>
                        </View>
                        <View style={styles.channelItem}>
                            <MaterialCommunityIcons name="checkbox-blank-outline" size={20} color="#d1d5db" />
                            <Text style={styles.channelText}>Email</Text>
                        </View>
                    </View>
                </View>
                
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.previewButton}>
                    <Text style={styles.previewButtonText}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send Announcement</Text>
                    <MaterialCommunityIcons name="send" size={20} color="#111827" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 12,
        backgroundColor: colors.brandWhite,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerButtonText: {
        fontSize: 16,
        color: '#6b7280',
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.brandGrey,
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.brandWhite,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    chipTextActive: {
        color: '#000',
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
        fontWeight: '500',
        color: '#6b7280',
        marginLeft: 4,
    },
    charCount: {
        fontSize: 12,
        color: '#9ca3af',
    },
    input: {
        backgroundColor: colors.brandWhite,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: colors.brandGrey,
    },
    textArea: {
        height: 160,
    },
    optionsCard: {
        backgroundColor: colors.brandWhite,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
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
    optionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff7ed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.brandGrey,
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginHorizontal: 16,
    },
    channelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    channelText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 32,
        backgroundColor: colors.brandWhite,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 12,
    },
    previewButton: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    sendButton: {
        flex: 2,
        height: 54,
        borderRadius: 16,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
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
