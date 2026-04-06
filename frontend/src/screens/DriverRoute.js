import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const DriverRoute = () => {
    const stops = [
        { id: 1, name: 'Central Station', time: '07:00 AM', students: 24, type: 'start' },
        { id: 2, name: 'North Square', time: '07:25 AM', students: 12, type: 'stop' },
        { id: 3, name: 'Westside Dorms', time: '07:55 AM', students: 45, type: 'stop' },
        { id: 4, name: 'Engineering Campus', time: '08:30 AM', students: 0, type: 'end' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.driverName}>Sadaat Malik</Text>
                    <View style={styles.headerSubtitleRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.headerSubtitle}>BUS DRIVER #104</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Assigned Details</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>Oct 24, 2023</Text>
                    </View>
                </View>

                <View style={styles.vehicleCard}>
                    <View style={styles.accentBar} />
                    <View style={styles.vehicleCardContent}>
                        <View>
                            <Text style={styles.cardSmallLabel}>VEHICLE DETAILS</Text>
                            <View style={styles.busIdRow}>
                                <Text style={styles.busId}>#104</Text>
                                <Text style={styles.busModel}>Volvo 9700</Text>
                            </View>
                            <View style={styles.badgeRow}>
                                <View style={styles.vehicleInfoBadge}>
                                    <Text style={styles.infoBadgeLabel}>LICENSE</Text>
                                    <Text style={styles.infoBadgeValue}>KWY-882</Text>
                                </View>
                                <View style={styles.vehicleInfoBadge}>
                                    <Text style={styles.infoBadgeLabel}>CAPACITY</Text>
                                    <Text style={styles.infoBadgeValue}>54 Seats</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.busIconContainer}>
                            <MaterialIcons name="directions-bus" size={40} color={Theme.colors.primary} />
                        </View>
                    </View>
                </View>

                <View style={styles.routeHeader}>
                    <View>
                        <Text style={styles.routeTitle}>Route A: Morning Loop</Text>
                        <Text style={styles.routeDuration}>Est. Duration: 1h 30m</Text>
                    </View>
                    <View style={styles.mapIconBtn}>
                        <MaterialIcons name="map" size={20} color={Theme.colors.textSecondaryLight} />
                    </View>
                </View>

                <View style={styles.stopsContainer}>
                    <View style={styles.timelineLine} />
                    {stops.map((stop, index) => (
                        <View key={stop.id} style={styles.stopItem}>
                            <View style={[
                                styles.stopIconContainer,
                                stop.type === 'start' && styles.startIcon,
                                stop.type === 'end' && styles.endIcon,
                                stop.type === 'stop' && styles.midIcon
                            ]}>
                                <MaterialIcons 
                                    name={stop.type === 'start' ? 'flag' : stop.type === 'end' ? 'school' : 'place'} 
                                    size={18} 
                                    color={stop.type === 'start' ? Theme.colors.brandGrey : stop.type === 'end' ? '#fff' : Theme.colors.textSecondaryLight} 
                                />
                            </View>
                            <View style={styles.stopInfo}>
                                <View style={styles.stopTextRow}>
                                    <Text style={[styles.stopName, stop.type === 'stop' && styles.midStopName]}>{stop.name}</Text>
                                    <View style={[styles.timeBadge, stop.type === 'start' && styles.startTimeBadge]}>
                                        <Text style={[styles.timeText, stop.type === 'start' && styles.startTimeText]}>{stop.time}</Text>
                                    </View>
                                </View>
                                <Text style={styles.stopSubtitle}>
                                    {stop.type === 'start' ? 'Start Point' : stop.type === 'end' ? 'Drop-off Point' : 'Bus Stop'} • {stop.students} Students waiting
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 12,
    },
    driverName: {
        fontSize: Theme.typography.sizes['2xl'],
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    headerSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.primary,
        marginRight: 6,
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.textSecondaryLight,
        letterSpacing: 1,
    },
    logoutBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Theme.borderRadius.full,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
    },
    logoutText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.textSecondaryLight,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginVertical: 16,
    },
    mainTitle: {
        fontSize: Theme.typography.sizes['2xl'],
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    dateBadge: {
        backgroundColor: '#eeede9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dateText: {
        fontSize: 10,
        fontWeight: '800',
        color: Theme.colors.textSecondaryLight,
    },
    vehicleCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginBottom: 24,
    },
    accentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 6,
        backgroundColor: Theme.colors.primary,
    },
    vehicleCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingLeft: 26,
    },
    cardSmallLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: Theme.colors.textSecondaryDark,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    busIdRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 12,
    },
    busId: {
        fontSize: Theme.typography.sizes['4xl'],
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    busModel: {
        fontSize: Theme.typography.sizes.sm,
        fontWeight: '700',
        color: Theme.colors.textSecondaryLight,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    vehicleInfoBadge: {
        backgroundColor: '#f8f8f5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    infoBadgeLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: Theme.colors.textSecondaryDark,
        marginBottom: 2,
    },
    infoBadgeValue: {
        fontSize: 12,
        fontWeight: '800',
        color: Theme.colors.brandGrey,
    },
    busIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: Theme.colors.primary + '15',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    routeTitle: {
        fontSize: Theme.typography.sizes.lg,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
    },
    routeDuration: {
        fontSize: 12,
        color: Theme.colors.textSecondaryLight,
        fontWeight: '600',
    },
    mapIconBtn: {
        backgroundColor: '#efefec',
        padding: 10,
        borderRadius: Theme.borderRadius.full,
    },
    stopsContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 2,
        marginBottom: 40,
    },
    timelineLine: {
        position: 'absolute',
        top: 40,
        bottom: 40,
        left: 44,
        width: 4,
        backgroundColor: '#f1f1ee',
        borderRadius: 2,
    },
    stopItem: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 16,
    },
    stopIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        elevation: 4,
        zIndex: 5,
    },
    startIcon: {
        backgroundColor: Theme.colors.primary,
    },
    midIcon: {
        backgroundColor: '#fff',
        borderWidth: 4,
        borderColor: '#eee',
    },
    endIcon: {
        backgroundColor: Theme.colors.brandGrey,
    },
    stopInfo: {
        flex: 1,
    },
    stopTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    stopName: {
        fontSize: Theme.typography.sizes.lg,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        flex: 1,
    },
    midStopName: {
        color: Theme.colors.textSecondaryDark,
    },
    timeBadge: {
        backgroundColor: '#efefec',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    startTimeBadge: {
        backgroundColor: Theme.colors.primary + '30',
    },
    timeText: {
        fontSize: 10,
        fontWeight: '900',
        color: Theme.colors.textSecondaryLight,
    },
    startTimeText: {
        color: Theme.colors.brandGrey,
    },
    stopSubtitle: {
        fontSize: 12,
        color: Theme.colors.textSecondaryDark,
        fontWeight: '600',
        marginTop: 2,
    },
});

export default DriverRoute;
