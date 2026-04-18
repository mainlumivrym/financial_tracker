import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { themeName, setTheme, theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Theme</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.themeButton,
            { 
              backgroundColor: theme.colors.backgroundLight,
              borderColor: themeName === 'farmland' ? theme.colors.primary : 'transparent'
            }
          ]}
          onPress={() => setTheme('farmland')}
        >
          <Text style={styles.emoji}>🌾</Text>
          <Text style={[
            styles.buttonText,
            { 
              color: themeName === 'farmland' ? theme.colors.text : theme.colors.textSecondary,
              fontWeight: themeName === 'farmland' ? '600' : '500'
            }
          ]}>
            Farmland
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeButton,
            { 
              backgroundColor: theme.colors.backgroundLight,
              borderColor: themeName === 'dark' ? theme.colors.primary : 'transparent'
            }
          ]}
          onPress={() => setTheme('dark')}
        >
          <Text style={styles.emoji}>🌙</Text>
          <Text style={[
            styles.buttonText,
            { 
              color: themeName === 'dark' ? theme.colors.text : theme.colors.textSecondary,
              fontWeight: themeName === 'dark' ? '600' : '500'
            }
          ]}>
            Dark
          </Text>
        </TouchableOpacity>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
