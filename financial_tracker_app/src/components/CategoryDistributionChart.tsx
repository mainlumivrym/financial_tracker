import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
  title?: string;
}

const COLORS = ['#4ecca3', '#ff6b6b', '#ffd93d', '#6BCF7F', '#A78BFA', '#F472B6', '#FB923C'];

export default function CategoryDistributionChart({ 
  data, 
  title = 'Expense Distribution' 
}: CategoryDistributionChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((item, index) => {
            const color = COLORS[index % COLORS.length];
            return (
              <View key={item.category} style={styles.chartItem}>
                <View style={[styles.chartDot, { backgroundColor: color }]} />
                <View style={styles.chartInfo}>
                  <Text style={styles.chartCategory}>{item.category}</Text>
                  <Text style={styles.chartPercentage}>{item.percentage.toFixed(1)}%</Text>
                </View>
                <Text style={styles.chartAmount}>${item.amount.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    gap: 12,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  chartDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  chartInfo: {
    flex: 1,
  },
  chartCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  chartPercentage: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  chartAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
