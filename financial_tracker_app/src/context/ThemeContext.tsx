import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@chanch_theme';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  backgroundLight: string;
  backgroundDark: string;
  text: string;
  textSecondary: string;
  income: string;
  expense: string;
  divider: string;
}

interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

interface ThemeBorderRadius {
  sm: number;
  md: number;
  lg: number;
  full: number;
}

interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}

type ThemeName = 'farmland' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Farmland Theme - Peaceful country-inspired palette
const farmlandTheme: Theme = {
  colors: {
    primary: '#7BA05B',
    primaryDark: '#6B7D63',
    background: '#F5F1E8',
    backgroundLight: '#FFFFFF',
    backgroundDark: '#E8E4DB',
    text: '#3E3832',
    textSecondary: '#6B655C',
    textDark: '#1a1a2e',
    income: '#7BA05B',
    expense: '#C17B5B',
    divider: '#D4CFC4',
    success: '#4ecca3',        // Success/positive (green)
    warning: '#ffd93d',        // Warning/caution (yellow)
    danger: '#ff6b6b',         // Error/danger (red)
    info: '#6b9eff',           // Info (blue)
    budgetNormal: '#4ecca3',   // Within budget (green)
    budgetWarning: '#ffd93d',  // Approaching limit (yellow)
    budgetOver: '#ff6b6b',     // Over budget (red)
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
};

// Dark Theme - Sleek dark palette with neon green accents
const darkTheme: Theme = {
  colors: {
    primary: '#4ecca3',
    primaryDark: '#2a3e3a',
    background: '#1a1a2e',
    backgroundLight: '#2a2a3e',
    backgroundDark: '#16162a',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textDark: '#1a1a2e',
    income: '#4ecca3',
    expense: '#ff6b6b',
    divider: '#3a3a4e',
    success: '#4ecca3',        // Success/positive (green)
    warning: '#ffd93d',        // Warning/caution (yellow)
    danger: '#ff6b6b',         // Error/danger (red)
    info: '#6b9eff',           // Info (blue)
    budgetNormal: '#4ecca3',   // Within budget (green)
    budgetWarning: '#ffd93d',  // Approaching limit (yellow)
    budgetOver: '#ff6b6b',     // Over budget (red)
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
};

const themes: Record<ThemeName, Theme> = {
  farmland: farmlandTheme,
  dark: darkTheme,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: farmlandTheme,
  themeName: 'farmland',
  setTheme: async () => {},
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeName, setThemeName] = useState<ThemeName>('farmland');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && themes[savedTheme]) {
        setThemeName(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeName) => {
    try {
      if (themes[newTheme]) {
        setThemeName(newTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const value = {
    theme: themes[themeName],
    themeName,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export type { Theme, ThemeName, ThemeColors, ThemeSpacing, ThemeBorderRadius };

export { farmlandTheme, darkTheme };
