import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useLocalization } from '@/context/LocalizationContext';

interface DailyData {
  day: number;
  income: number;
  expenses: number;
  net: number;
}

interface DailyOverviewGraphProps {
  dailyData: DailyData[];
  showLegend?: boolean;
  incomeLabel?: string;
  expensesLabel?: string;
}

export default function DailyOverviewGraph({ 
  dailyData, 
  showLegend = true,
  incomeLabel = 'Income',
  expensesLabel = 'Expenses'
}: DailyOverviewGraphProps) {
  const { theme } = useTheme();
  const { t } = useLocalization();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getMaxDailyValue = () => {
    const allValues = dailyData.flatMap(d => [d.income, d.expenses]);
    return Math.max(...allValues, 1);
  };

  const getDailyBarWidth = (value: number) => {
    const maxValue = getMaxDailyValue();
    if (value === 0) return 0;
    return `${Math.max((value / maxValue) * 100, 1)}%`;
  };

  const styles = StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    graphVertical: {
      gap: 8,
      paddingVertical: theme.spacing.sm,
    },
    dayRowContainer: {
      position: 'relative',
    },
    rowGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: 2,
    },
    rowLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      width: 24,
      textAlign: 'right',
    },
    rowBars: {
      flex: 1,
      gap: 2,
    },
    rowBar: {
      height: 8,
      borderRadius: 2,
      minWidth: 2,
    },
    incomeBar: {
      backgroundColor: theme.colors.income,
    },
    expenseBar: {
      backgroundColor: theme.colors.expense,
    },
    tooltip: {
      position: 'absolute',
      right: theme.spacing.md,
      top: 0,
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1000,
      minWidth: 120,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    tooltipRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 2,
      gap: theme.spacing.sm,
    },
    tooltipLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    tooltipValue: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    tooltipDay: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    tooltipDivider: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
      marginTop: 4,
      paddingTop: 4,
    },
  });

  const renderDayRow = (dayData: DailyData) => (
    <View key={dayData.day} style={styles.dayRowContainer}>
      <TouchableOpacity
        style={styles.rowGroup}
        onPress={() => setSelectedDay(selectedDay === dayData.day ? null : dayData.day)}
        activeOpacity={0.7}
      >
        <Text style={styles.rowLabel}>{dayData.day}</Text>
        <View style={styles.rowBars}>
          {dayData.income > 0 && (
            <View
              style={[
                styles.rowBar,
                styles.incomeBar,
                { width: getDailyBarWidth(dayData.income) }
              ]}
            />
          )}
          {dayData.expenses > 0 && (
            <View
              style={[
                styles.rowBar,
                styles.expenseBar,
                { width: getDailyBarWidth(dayData.expenses) }
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
      
      {selectedDay === dayData.day && (
        renderDayTooltip(dayData)
      )}
    </View>
  );

  const renderDayTooltip = (dayData: DailyData) => (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipDay}>{t('common.day')} {dayData.day}</Text>
      {dayData.income > 0 && (
        <View style={styles.tooltipRow}>
          <Text style={styles.tooltipLabel}>{incomeLabel}:</Text>
          <Text style={[styles.tooltipValue, { color: theme.colors.income }]}>
            ${formatCurrency(dayData.income)}
          </Text>
        </View>
      )}
      {dayData.expenses > 0 && (
        <View style={styles.tooltipRow}>
          <Text style={styles.tooltipLabel}>{expensesLabel}:</Text>
          <Text style={[styles.tooltipValue, { color: theme.colors.expense }]}>
            ${formatCurrency(dayData.expenses)}
          </Text>
        </View>
      )}
      {(dayData.income > 0 || dayData.expenses > 0) && (
        <View style={[styles.tooltipRow, styles.tooltipDivider]}>
          <Text style={[styles.tooltipLabel, { fontWeight: '600' }]}>{t('common.net')}:</Text>
          <Text style={[styles.tooltipValue, { color: dayData.net >= 0 ? theme.colors.income : theme.colors.expense }]}>
            {dayData.net >= 0 ? '+' : ''}${formatCurrency(dayData.net)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.income }]} />
            <Text style={styles.legendText}>{incomeLabel}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.expense }]} />
            <Text style={styles.legendText}>{expensesLabel}</Text>
          </View>
        </View>
      )}

      <View style={styles.graphVertical}>
        {dailyData.map((dayData) => (
          renderDayRow(dayData)
        ))}
      </View>
    </View>
  );
}


