// VisageRoute Theme Definitions based on "Stitch-to-Native" Design Spec

export const colors = {
    primary: '#f2cc0d',
    backgroundLight: '#f8f8f5',
    backgroundDark: '#221f10',
    brandGrey: '#1c190d',
    brandWhite: '#ffffff',
    textSecondaryLight: '#6b6651',
    textSecondaryDark: '#ada892',
    borderLight: '#e8e4ce',
    borderDark: '#4a4630',
    surfaceLight: '#ffffff',
    surfaceDark: '#2c2815',
    error: '#ef4444', // For validation feedback
};

export const typography = {
    fontFamily: 'Inter_400Regular', // We'll need expo-font for Inter, or rely on system font for now
    fontFamilyBold: 'Inter_700Bold',
    fontFamilyExtraBold: 'Inter_800ExtraBold',
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 36,
        'logo': 64,
    }
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
};

export const borderRadius = {
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
};
