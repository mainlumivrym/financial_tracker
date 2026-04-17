import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from './colors';

// Common reusable styles across the app
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
  },
  
  cardSmall: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
  },
  
  // Text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  
  body: {
    fontSize: 16,
    color: colors.text,
  },
  
  bodySecondary: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  small: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  
  buttonOutline: {
    backgroundColor: colors.transparent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  
  // Section spacing
  section: {
    marginBottom: 30,
  },
  
  sectionSmall: {
    marginBottom: 20,
  },
  
  // Shadow (for iOS)
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
  
  // Loading/Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

// Typography scale
export interface Typography {
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    display: number;
  };
  fontWeight: {
    regular: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
  };
}

export const typography: Typography = {
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: 'bold',
  },
};

// Spacing scale
export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  base: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Border radius scale
export interface BorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export const borderRadius: BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export default globalStyles;
