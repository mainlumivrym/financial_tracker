import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress: () => void;
  rightButton?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
  };
  backButtonColor?: string;
}

export default function ScreenHeader({
  title,
  subtitle,
  onBackPress,
  rightButton,
  backButtonColor
}: ScreenHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
      >
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={backButtonColor || theme.colors.text} 
        />
      </TouchableOpacity>
      
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightButton ? (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={rightButton.onPress}
          disabled={rightButton.disabled}
        >
          <Text 
            style={[
              styles.rightButtonText,
              { color: theme.colors.primary },
              rightButton.disabled && styles.rightButtonDisabled
            ]}
          >
            {rightButton.text}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightButton: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  rightButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rightButtonDisabled: {
    opacity: 0.5,
  },
});
