import { StyleSheet } from 'react-native';
import Theme from './Theme';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundLight,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Typography
    h1: {
        color: Theme.colors.brandGrey,
        fontSize: Theme.typography.sizes['3xl'],
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    p: {
        color: Theme.colors.brandGrey,
        fontSize: Theme.typography.sizes.base,
    },
    // Form Elements
    input: {
        backgroundColor: Theme.colors.surfaceLight,
        borderWidth: 1,
        borderColor: Theme.colors.borderLight,
        borderRadius: Theme.borderRadius.lg,
        height: 56,
        paddingHorizontal: Theme.spacing.md,
        fontSize: Theme.typography.sizes.base,
        color: Theme.colors.brandGrey,
    },
    inputError: {
        borderColor: Theme.colors.error,
        borderWidth: 2,
    },
    // Buttons
    primaryButton: {
        backgroundColor: Theme.colors.primary,
        height: 56,
        borderRadius: Theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: Theme.colors.brandGrey,
        fontSize: Theme.typography.sizes.base,
        fontWeight: 'bold',
    },
    // Utilities
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
