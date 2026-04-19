import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SelectableTheme, useTheme } from '../context/ThemeContext';
import { useLocalization } from '@/context/LocalizationContext';

export default function ThemeSwitcher() {
  const { themeName, setTheme, theme, selectableThemes } = useTheme();
  const { t } = useLocalization();

  const renderThemeButton = (selectableTheme: SelectableTheme) => (
    <TouchableOpacity
      style={[
        styles.themeButton,
        {
          backgroundColor: theme.colors.backgroundLight,
          borderColor: themeName === selectableTheme.themeName ? theme.colors.primary : 'transparent'
        }
      ]}
      onPress={() => setTheme(selectableTheme.themeName)}
    >
      <Text style={styles.emoji}>{selectableTheme.icon}</Text>
      <Text style={[
        styles.buttonText,
        {
          color: themeName === selectableTheme.themeName ? theme.colors.text : theme.colors.textSecondary,
          fontWeight: themeName === selectableTheme.themeName ? '600' : '500'
        }
      ]}>
        {t(`themes.${selectableTheme.themeName}`)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {selectableThemes.map((selectableTheme) => (
          <View key={selectableTheme.themeName}>
            {renderThemeButton(selectableTheme)}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 14,
  },
});
