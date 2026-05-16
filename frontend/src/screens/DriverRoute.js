import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Theme from '../theme/Theme';
import { API_BASE_URL } from '../config/api';

const DriverRoute = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [busData, setBusData] = useState(null);
    const [driverName, setDriverName] = useState('Driver');

    const fetchRouteInfo = async () => {
        try {
            const token = await SecureStore.getItemAsync('socketToken');
            const response = await axios.get(`${API_BASE_URL}/api/driver/route`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setRouteData(response.data.route);
            setBusData(response.data.bus);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error fetching route info:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRouteInfo();
            // Also fetch driver name from dashboard for header
            const getDriverName = async () => {
                const token = await SecureStore.getItemAsync('socketToken');
                const res = await axios.get(`${API_BASE_URL}/api/driver/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDriverName(res.data.name);
            };
            getDriverName();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchRouteInfo();
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </SafeAreaView>
        );
    }

    if (!routeData && !loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="event-busy" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Active Assignment</Text>
                    <Text style={styles.emptySubtitle}>You don't have any active bus or route assigned for today.</Text>
                    <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                        <Text style={styles.refreshBtnText}>Check Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.driverName}>{driverName}</Text>
                    <View style={styles.headerSubtitleRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.headerSubtitle}>BUS DRIVER #{busData?.busNumber || '...'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.colors.primary]} />
                }
            >
                <View style={styles.titleSection}>
                    <Text style={styles.mainTitle}>Assigned Details</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                </View>

                <View style={styles.vehicleCard}>
                    <View style={styles.accentBar} />
                    <View style={styles.vehicleCardContent}>
                        <View>
                            <Text style={styles.cardSmallLabel}>VEHICLE DETAILS</Text>
                            <View style={styles.busIdRow}>
                                <Text style={styles.busId}>#{busData?.busNumber || 'N/A'}</Text>
                                <Text style={styles.busModel}>Bus Vehicle</Text>
                            </View>
                            <View style={styles.badgeRow}>
                                <View style={styles.vehicleInfoBadge}>
                                    <Text style={styles.infoBadgeLabel}>LICENSE</Text>
                                    <Text style={styles.infoBadgeValue}>{busData?.plateNumber || 'N/A'}</Text>
                                </View>
                                <View style={styles.vehicleInfoBadge}>
                                    <Text style={styles.infoBadgeLabel}>CAPACITY</Text>
                                    <Text style={styles.infoBadgeValue}>{busData?.capacity || '0'} Seats</Text>
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
                        <Text style={styles.routeTitle}>{routeData?.routeName || 'Unnamed Route'}</Text>
                        <Text style={styles.routeDuration}>Est. Duration: {routeData?.estimatedDuration || 'N/A'}</Text>
                    </View>
                    <View style={styles.mapIconBtn}>
                        <MaterialIcons name="map" size={20} color={Theme.colors.textSecondaryLight} />
                    </View>
                </View>

                <View style={styles.stopsContainer}>
                    <View style={styles.timelineLine} />
                    {(routeData?.stops || []).length > 0 ? (
                        routeData.stops.map((stop, index) => (
                            <View key={index} style={styles.stopItem}>
                                <View style={[
                                    styles.stopIconContainer,
                                    stop.isStart && styles.startIcon,
                                    stop.isEnd && styles.endIcon,
                                    (!stop.isStart && !stop.isEnd) && styles.midIcon
                                ]}>
                                    <MaterialIcons 
                                        name={stop.isStart ? 'flag' : stop.isEnd ? 'school' : 'place'} 
                                        size={18} 
                                        color={stop.isStart ? Theme.colors.brandGrey : stop.isEnd ? '#fff' : Theme.colors.textSecondaryLight} 
                                    />
                                </View>
                                <View style={styles.stopInfo}>
                                    <View style={styles.stopTextRow}>
                                        <Text style={[styles.stopName, (!stop.isStart && !stop.isEnd) && styles.midStopName]}>{stop.locationName}</Text>
                                        <View style={[styles.timeBadge, stop.isStart && styles.startTimeBadge]}>
                                            <Text style={[styles.timeText, stop.isStart && styles.startTimeText]}>{stop.scheduledTime}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.stopSubtitle}>
                                        {stop.isStart ? 'Start Point' : stop.isEnd ? 'Drop Point / Route End' : `Stop #${stop.stopNumber || index + 1}`}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noStopsBox}>
                            <MaterialIcons name="info-outline" size={24} color="#ccc" />
                            <Text style={styles.noStopsText}>No stop information available for this route.</Text>
                        </View>
                    )}
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: Theme.colors.brandGrey,
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
    },
    refreshBtn: {
        marginTop: 30,
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    refreshBtnText: {
        fontWeight: 'bold',
        color: '#000',
    },
    noStopsBox: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noStopsText: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 8,
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
