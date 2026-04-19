import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalization } from '../context/LocalizationContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../locales';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLocalization();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageButton,
              {
                backgroundColor: theme.colors.backgroundLight,
                borderColor: language === lang.code ? theme.colors.primary : 'transparent',
              },
            ]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text
              style={[
                styles.buttonText,
                {
                  color: language === lang.code ? theme.colors.text : theme.colors.textSecondary,
                  fontWeight: language === lang.code ? '600' : '500',
                },
              ]}
            >
              {lang.name}
            </Text>
          </TouchableOpacity>
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
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  flag: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 14,
  },
});
