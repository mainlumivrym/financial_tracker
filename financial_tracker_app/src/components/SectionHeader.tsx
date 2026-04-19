import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({ 
  title, 
  actionText, 
  onActionPress 
}: SectionHeaderProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    sectionHeader: {
      height: 44,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    actionButton: {
      height: '100%',
      justifyContent: 'center',
    },
    actionText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onActionPress}
        >
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
