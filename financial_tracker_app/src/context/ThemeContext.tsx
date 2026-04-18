import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@chanch_theme';

export interface SelectableTheme {
  themeName: ThemeName
  icon: string
  displayName: string
}

interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  backgroundLight: string;
  backgroundDark: string;
  text: string;
  textSecondary: string;
  textDark: string;
  income: string;
  expense: string;
  divider: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  budgetNormal: string;
  budgetWarning: string;
  budgetOver: string;
  greenCardBackground: string;
  greenCardText: string;
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

type ThemeName = 'farmland' | 'dark' | 'lavender' | 'deepSea' | 'valley' | 'sakura';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
  selectableThemes: SelectableTheme[];
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
    expense: '#D66B5B',
    divider: '#D4CFC4',
    success: '#4ecca3',        // Success/positive (green)
    warning: '#ffd93d',        // Warning/caution (yellow)
    danger: '#ff6b6b',         // Error/danger (red)
    info: '#6b9eff',           // Info (blue)
    budgetNormal: '#4ecca3',   // Within budget (green)
    budgetWarning: '#ffd93d',  // Approaching limit (yellow)
    budgetOver: '#ff6b6b',     // Over budget (red)
    greenCardBackground: '#7BA05B',
    greenCardText: '#E8E4DB',
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

// Lavender Theme - Soft purple and pink palette
const lavenderTheme: Theme = {
  colors: {
    primary: '#B8A5D6',
    primaryDark: '#9B86BD',
    background: '#F8F5FC',
    backgroundLight: '#FFFFFF',
    backgroundDark: '#EFE9F7',
    text: '#4A3F5C',
    textSecondary: '#8B7FA3',
    textDark: '#2D2438',
    income: '#8BC88B',
    expense: '#E89FA3',
    divider: '#E0D5ED',
    success: '#8BC88B',
    warning: '#F3C969',
    danger: '#E89FA3',
    info: '#9BA8D6',
    budgetNormal: '#8BC88B',
    budgetWarning: '#F3C969',
    budgetOver: '#E89FA3',
    greenCardBackground: '#B8A5D6',
    greenCardText: '#FFFFFF',
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

// Sakura Theme - Cherry blossom-inspired soft pinks
const sakuraTheme: Theme = {
  colors: {
    primary: '#FFB7C5',
    primaryDark: '#E89AAB',
    background: '#FFF5F7',
    backgroundLight: '#FFFFFF',
    backgroundDark: '#FFE8ED',
    text: '#5D3A47',
    textSecondary: '#A8748A',
    textDark: '#3D1F2E',
    income: '#A8D8A8',
    expense: '#FF8FA3',
    divider: '#FFD6E0',
    success: '#A8D8A8',
    warning: '#FFD27F',
    danger: '#FF8FA3',
    info: '#B8C9E8',
    budgetNormal: '#A8D8A8',
    budgetWarning: '#FFD27F',
    budgetOver: '#FF8FA3',
    greenCardBackground: '#FFB7C5',
    greenCardText: '#5D3A47',
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

// Valley Theme - Nature-inspired grassy greens
const valleyTheme: Theme = {
  colors: {
    primary: '#6FA842',
    primaryDark: '#5A8835',
    background: '#F0F5E8',
    backgroundLight: '#FAFCF5',
    backgroundDark: '#E5EDDB',
    text: '#2D3E1F',
    textSecondary: '#5C6E4A',
    textDark: '#1C2614',
    income: '#6FA842',
    expense: '#D97642',
    divider: '#D4E0C4',
    success: '#6FA842',
    warning: '#E8B740',
    danger: '#D97642',
    info: '#7EB8A8',
    budgetNormal: '#6FA842',
    budgetWarning: '#E8B740',
    budgetOver: '#D97642',
    greenCardBackground: '#6FA842',
    greenCardText: '#F0F5E8',
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

// Deep Sea Theme - Ocean-inspired blues and teals
const deepSeaTheme: Theme = {
  colors: {
    primary: '#5DADE2',
    primaryDark: '#2980B9',
    background: '#0B1C2E',
    backgroundLight: '#1A3A52',
    backgroundDark: '#051525',
    text: '#E8F4F8',
    textSecondary: '#85C1E2',
    textDark: '#0B1C2E',
    income: '#58D68D',
    expense: '#EC7063',
    divider: '#2C5F7E',
    success: '#58D68D',
    warning: '#F7DC6F',
    danger: '#EC7063',
    info: '#5DADE2',
    budgetNormal: '#58D68D',
    budgetWarning: '#F7DC6F',
    budgetOver: '#EC7063',
    greenCardBackground: '#2980B9',
    greenCardText: '#E8F4F8',
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
    greenCardBackground: '#4ecca3',
    greenCardText: '#2a2a3e',
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
  lavender: lavenderTheme,
  deepSea: deepSeaTheme,
  valley: valleyTheme,
  sakura: sakuraTheme,
};

const selectableThemes: SelectableTheme[] = [
  {
    themeName: 'farmland',
    displayName: 'Farmland',
    icon: '🌾',
  },
  {
    themeName: 'dark',
    displayName: 'Dark',
    icon: '🌙',
  },
  {
    themeName: 'lavender',
    displayName: 'Lavender',
    icon: '🌸',
  },
  {
    themeName: 'deepSea',
    displayName: 'Deep Sea',
    icon: '🌊',
  },
  {
    themeName: 'valley',
    displayName: 'Valley',
    icon: '🌿',
  },
  {
    themeName: 'sakura',
    displayName: 'Sakura',
    icon: '🌸',
  },
];

const ThemeContext = createContext<ThemeContextType>({
  theme: farmlandTheme,
  themeName: 'farmland',
  setTheme: async () => { },
  selectableThemes: selectableThemes,
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeName, setThemeName] = useState<ThemeName>('farmland');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'farmland' || savedTheme === 'dark' || savedTheme === 'lavender' || savedTheme === 'deepSea' || savedTheme === 'valley' || savedTheme === 'sakura')) {
        setThemeName(savedTheme as ThemeName);
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
    selectableThemes,
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
