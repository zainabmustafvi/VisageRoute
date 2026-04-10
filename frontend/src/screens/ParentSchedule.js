import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const ParentSchedule = ({ navigation }) => {
    
    const DayItem = ({ day, date, pickupTime, dropoffTime, isActive, isCurrent, specialNote }) => (
        <View style={[styles.dayCard, isActive && styles.dayCardActive, isCurrent && styles.dayCardToday]}>
            {isCurrent && <View style={styles.todayBadge}><Text style={styles.todayText}>Today</Text></View>}
            <View style={[styles.dayCircle, isActive && styles.dayCircleActive]}>
                <Text style={[styles.dayName, isActive && styles.dayNameActive]}>{day}</Text>
                <Text style={styles.dayDate}>{date}</Text>
            </View>
            <View style={styles.scheduleDetails}>
                <View style={styles.timelineLine} />
                
                <View style={styles.scheduleRow}>
                    <View style={[styles.statusDot, pickupTime.completed ? styles.dotCompleted : styles.dotPending]} />
                    <View style={styles.timeInfo}>
                        <Text style={[styles.timeText, pickupTime.completed && styles.textLineThrough]}>{pickupTime.time}</Text>
                        <Text style={pickupTime.completed ? styles.statusTextActive : styles.statusText}>Pickup from Home</Text>
                    </View>
                    <MaterialIcons name={pickupTime.completed ? "check-circle" : "home"} size={18} color={pickupTime.completed ? "#22c55e" : "#d1d5db"} />
                </View>

                <View style={[styles.scheduleRow, { marginTop: 15 }]}>
                    <View style={[styles.statusDot, dropoffTime.next ? styles.dotNext : styles.dotPending]} />
                    <View style={styles.timeInfo}>
                        <Text style={styles.timeText}>{dropoffTime.time}</Text>
                        <Text style={styles.statusText}>Drop-off at Home</Text>
                        {dropoffTime.next && <View style={styles.nextBadge}><Text style={styles.nextText}>Next</Text></View>}
                        {specialNote && <Text style={styles.specialNoteText}>{specialNote}</Text>}
                    </View>
                    <MaterialIcons 
                        name={specialNote ? "warning" : "directions-bus"} 
                        size={18} 
                        color={specialNote ? "#f97316" : (dropoffTime.next ? Theme.colors.primary : "#d1d5db")} 
                    />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={Theme.colors.brandGrey} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Weekly Schedule</Text>
                    <Text style={styles.headerSub}>PARENT PORTAL</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Title and Date Range */}
                <View style={styles.titleRow}>
                    <Text style={styles.h2}>Weekly Schedule</Text>
                    <View style={styles.rangeBadge}>
                        <Text style={styles.rangeText}>Oct 23 - 27</Text>
                        <MaterialIcons name="calendar-today" size={14} color="#6b7280" />
                    </View>
                </View>

                {/* Kid Info Card */}
                <View style={styles.kidCard}>
                    <View style={styles.kidLeft}>
                        <View style={styles.kidAvatar}>
                            <MaterialIcons name="face" size={24} color="#3b82f6" />
                        </View>
                        <View>
                            <Text style={styles.kidName}>Amna</Text>
                            <Text style={styles.kidSub}>Bus #42 • Route A</Text>
                        </View>
                    </View>
                </View>

                {/* Driver Details */}
                <View style={styles.infoSection}>
                    <View style={styles.sectionTitleRow}>
                        <MaterialIcons name="badge" size={14} color="#9ca3af" />
                        <Text style={styles.sectionTitle}>DRIVER DETAILS</Text>
                    </View>
                    <View style={styles.driverCard}>
                        <View style={styles.driverLeft}>
                            <View style={styles.driverIconBox}>
                                <MaterialIcons name="directions-bus" size={24} color="#9ca3af" />
                            </View>
                            <View>
                                <Text style={styles.driverName}>Sadaat Malik</Text>
                                <Text style={styles.driverPhone}>+1 (555) 012-3456</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Admin Upload Information */}
                <View style={styles.infoSection}>
                    <View style={styles.sectionTitleRow}>
                        <MaterialIcons name="admin-panel-settings" size={14} color="#9ca3af" />
                        <Text style={styles.sectionTitle}>ADMIN UPLOAD</Text>
                        <View style={styles.csvBadge}><Text style={styles.csvText}>CSV Parsed</Text></View>
                    </View>
                    <View style={styles.csvCard}>
                        <View style={styles.csvIconBox}>
                            <MaterialIcons name="table-view" size={24} color="#16a34a" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.csvName} numberOfLines={1}>Schedule_Wk42_Final.csv</Text>
                            <Text style={styles.csvDate}>Uploaded Oct 22 • 145 KB</Text>
                        </View>
                        <TouchableOpacity style={styles.viewBtn}><MaterialIcons name="visibility" size={18} color="#9ca3af" /></TouchableOpacity>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="info" size={14} color="#9ca3af" />
                        <Text style={styles.infoText}>This schedule was automatically generated from the administrator's latest CSV file upload.</Text>
                    </View>
                </View>

                {/* Timeline */}
                <View style={styles.timelineSection}>
                    <DayItem 
                        day="Mon" 
                        date="23" 
                        pickupTime={{ time: '07:30 AM', completed: false }}
                        dropoffTime={{ time: '03:30 PM', next: false }}
                        isActive={false}
                        isCurrent={false}
                    />
                    <DayItem 
                        day="Tue" 
                        date="24" 
                        pickupTime={{ time: '07:30 AM', completed: true }}
                        dropoffTime={{ time: '03:30 PM', next: true }}
                        isActive={true}
                        isCurrent={true}
                    />
                    <DayItem 
                        day="Wed" 
                        date="25" 
                        pickupTime={{ time: '07:30 AM', completed: false }}
                        dropoffTime={{ time: '01:00 PM', next: false }}
                        isActive={true}
                        isCurrent={false}
                        specialNote="Early Drop-off (Staff Dev)"
                    />
                    <DayItem 
                        day="Thu" 
                        date="26" 
                        pickupTime={{ time: '07:30 AM', completed: false }}
                        dropoffTime={{ time: '03:30 PM', next: false }}
                        isActive={true}
                        isCurrent={false}
                    />
                </View>

            </ScrollView>

            {/* Bottom Nav Placeholder */}
            <View style={styles.bottomNav}>
                 <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentHome')}>
                    <MaterialIcons name="home" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentTrackBus')}>
                    <MaterialIcons name="map" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="event-note" size={28} color={Theme.colors.primary} />
                    <Text style={[styles.navText, { color: Theme.colors.primary }]}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentAnnouncements')}>
                    <MaterialIcons name="feedback" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Alerts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ParentProfile')}>
                    <MaterialIcons name="person" size={28} color="#9ca3af" />
                    <Text style={styles.navText}>Profile</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backBtn: {
        padding: 5,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    headerSub: {
        fontSize: 9,
        fontWeight: '800',
        color: '#9ca3af',
        letterSpacing: 1.5,
    },
    notificationBtn: {
        padding: 5,
        position: 'relative',
    },
    dot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        backgroundColor: Theme.colors.primary,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'white',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    rangeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 6,
    },
    rangeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6b7280',
    },
    kidCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 24,
    },
    kidLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    kidAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    kidName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    kidSub: {
        fontSize: 11,
        color: '#9ca3af',
    },
    changeBtn: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    changeBtnText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#92400e',
    },
    infoSection: {
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#9ca3af',
        letterSpacing: 1,
    },
    driverCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    driverLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    driverIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    driverName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    driverPhone: {
        fontSize: 11,
        color: '#9ca3af',
    },
    driverActions: {
        flexDirection: 'row',
        gap: 8,
    },
    circleBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    csvBadge: {
        marginLeft: 'auto',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    csvText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#15803d',
    },
    csvCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    csvIconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#dcfce7',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    csvName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    csvDate: {
        fontSize: 11,
        color: '#9ca3af',
    },
    viewBtn: {
        padding: 8,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        paddingHorizontal: 4,
    },
    infoText: {
        fontSize: 10,
        color: '#9ca3af',
        flex: 1,
        lineHeight: 14,
    },
    timelineSection: {
        gap: 16,
    },
    dayCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 16,
        flexDirection: 'row',
        gap: 16,
        opacity: 0.7,
    },
    dayCardActive: {
        opacity: 1,
    },
    dayCardToday: {
        borderColor: Theme.colors.primary,
        borderWidth: 2,
        position: 'relative',
    },
    todayBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderBottomLeftRadius: 16,
        borderTopRightRadius: 22,
    },
    todayText: {
        fontSize: 9,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        textTransform: 'uppercase',
    },
    dayCircle: {
        width: 48,
        height: 70,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    dayCircleActive: {
        backgroundColor: '#fef3c7',
        borderColor: '#fef3c7',
    },
    dayName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        textTransform: 'uppercase',
    },
    dayNameActive: {
        color: '#92400e',
    },
    dayDate: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    scheduleDetails: {
        flex: 1,
        paddingVertical: 4,
    },
    scheduleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    statusDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 3,
        borderColor: 'white',
        marginTop: 4,
        zIndex: 1,
    },
    dotCompleted: {
        backgroundColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
    },
    dotPending: {
        backgroundColor: '#e5e7eb',
    },
    dotNext: {
        backgroundColor: Theme.colors.primary,
    },
    timeInfo: {
        flex: 1,
    },
    timeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Theme.colors.brandGrey,
    },
    textLineThrough: {
        textDecorationLine: 'line-through',
        color: '#9ca3af',
    },
    statusText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    statusTextActive: {
        fontSize: 11,
        color: '#16a34a',
        fontWeight: '600',
    },
    nextBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    nextText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#92400e',
    },
    specialNoteText: {
        fontSize: 11,
        color: '#ea580c',
        fontWeight: '600',
        marginTop: 4,
    },
    footerLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 4,
    },
    footerLinkText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9ca3af',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9ca3af',
    },
});

export default ParentSchedule;
