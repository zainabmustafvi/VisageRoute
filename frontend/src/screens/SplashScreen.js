import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Theme from '../theme/Theme';

const SplashScreen = ({ navigation }) => {
    const scaleValue = useRef(new Animated.Value(0.95)).current;
    const slideUpValue = useRef(new Animated.Value(20)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered Animation equivalent to the Stitch CSS Sequence
        Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            Animated.parallel([
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideUpValue, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                })
            ])
        ]).start();

        // Navigate to Login after 3 seconds
        setTimeout(() => {
            navigation.replace('Login');
        }, 3000);
    }, []);

    return (
        <View style={styles.container}>
            {/* Background abstract circles */}
            <View style={[styles.circle, styles.circleTopRight]} />
            <View style={[styles.circle, styles.circleTopRightInner]} />
            <View style={[styles.circle, styles.circleBottomLeft]} />
            <View style={[styles.circle, styles.circleBottomLeftInner]} />

            <View style={styles.centerContainer}>
                {/* Logo Container */}
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleValue }] }]}>
                    <MaterialIcons name="directions-bus" size={64} color={Theme.colors.brandGrey} />
                </Animated.View>

                {/* Text Content */}
                <Animated.View style={[styles.textContainer, { opacity: opacityValue, transform: [{ translateY: slideUpValue }] }]}>
                    <Text style={styles.title}>VisageRoute</Text>
                    <Text style={styles.tagline}>Your Campus Commute,{'\n'}Tracked.</Text>
                </Animated.View>
            </View>

            {/* Footer Version */}
            <Animated.View style={[styles.footer, { opacity: opacityValue, transform: [{ translateY: slideUpValue }] }]}>
                <Text style={styles.version}>V1.0</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContainer: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoContainer: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        marginBottom: 24,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: Theme.typography.sizes['4xl'],
        fontWeight: '800',
        color: Theme.colors.brandGrey,
        marginBottom: 8,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: Theme.typography.sizes.lg,
        fontWeight: '500',
        color: 'rgba(28, 25, 13, 0.8)', // brandGrey at 80% opacity
        textAlign: 'center',
        lineHeight: 28,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    version: {
        fontSize: Theme.typography.sizes.xs,
        color: 'rgba(28, 25, 13, 0.6)',
        fontWeight: '500',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    // Abstract UI elements
    circle: {
        position: 'absolute',
        borderRadius: 9999,
        borderWidth: 2,
        borderColor: 'rgba(28, 25, 13, 0.1)',
    },
    circleTopRight: {
        width: 400,
        height: 400,
        top: '-10%',
        right: '-20%',
    },
    circleTopRightInner: {
        width: 300,
        height: 300,
        top: '-5%',
        right: '-15%',
    },
    circleBottomLeft: {
        width: 400,
        height: 400,
        bottom: '-10%',
        left: '-20%',
    },
    circleBottomLeftInner: {
        width: 300,
        height: 300,
        bottom: '-5%',
        left: '-15%',
    }
});

export default SplashScreen;
