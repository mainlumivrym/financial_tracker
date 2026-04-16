import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserTransactions } from '../services/transactionService';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'YearlyReport'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

interface MonthData {
  month: string;
  monthIndex: number;
  year: number;
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export default function YearlyReport({ navigation }: Props) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [yearlyTotals, setYearlyTotals] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const [topExpenseCategory, setTopExpenseCategory] = useState<{ category: string; amount: number } | null>(null);

  useEffect(() => {
    loadYearlyData();
  }, []);

  const loadYearlyData = async () => {
    try {
      setLoading(true);
      const fetchedTransactions = await getUserTransactions(currentUser.uid);

      // Get last 12 months
      const monthsData: MonthData[] = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = monthDate.toLocaleDateString('en-US', { month: 'short' });
        const monthIndex = monthDate.getMonth();
        const year = monthDate.getFullYear();

        // Filter transactions for this month
        const monthTransactions = fetchedTransactions.filter(t => {
          const transactionDate = t.date?.toDate?.() || t.createdAt?.toDate?.();
          return transactionDate &&
                 transactionDate.getMonth() === monthIndex &&
                 transactionDate.getFullYear() === year;
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        monthsData.push({
          month,
          monthIndex,
          year,
          income,
          expenses,
          balance: income - expenses,
          transactionCount: monthTransactions.length
        });
      }

      setMonthlyData(monthsData);

      // Calculate yearly totals
      const totals = monthsData.reduce((acc, month) => ({
        income: acc.income + month.income,
        expenses: acc.expenses + month.expenses,
        balance: acc.balance + month.balance,
        transactionCount: acc.transactionCount + month.transactionCount
      }), { income: 0, expenses: 0, balance: 0, transactionCount: 0 });

      setYearlyTotals(totals);

      // Calculate top expense category across all 12 months
      const categoryTotals: { [key: string]: number } = {};
      fetchedTransactions
        .filter(t => {
          const transactionDate = t.date?.toDate?.() || t.createdAt?.toDate?.();
          if (!transactionDate) return false;
          const monthsAgo = (now.getFullYear() - transactionDate.getFullYear()) * 12 + 
                           (now.getMonth() - transactionDate.getMonth());
          return monthsAgo >= 0 && monthsAgo < 12 && t.type === 'expense';
        })
        .forEach(t => {
          if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
          }
          categoryTotals[t.category] += t.amount;
        });

      const topCategory = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)[0];

      if (topCategory) {
        setTopExpenseCategory({ category: topCategory[0], amount: topCategory[1] });
      }

    } catch (error) {
      console.error('Error loading yearly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = () => {
    const allValues = monthlyData.flatMap(m => [m.income, m.expenses]);
    return Math.max(...allValues, 1);
  };

  const getBarHeight = (value: number) => {
    const maxValue = getMaxValue();
    const maxHeight = 120;
    return Math.max((value / maxValue) * maxHeight, 4);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yearly Report</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ecca3" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <Text style={styles.summaryIcon}>💰</Text>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={styles.summaryAmount}>${yearlyTotals.income.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.expenseCard]}>
              <Text style={styles.summaryIcon}>💸</Text>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryAmount}>${yearlyTotals.expenses.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Text style={styles.balanceLabel}>Net Balance (12 Months)</Text>
            <Text style={[
              styles.balanceAmount,
              { color: yearlyTotals.balance >= 0 ? '#4ecca3' : '#ff6b6b' }
            ]}>
              {yearlyTotals.balance >= 0 ? '+' : ''}${yearlyTotals.balance.toFixed(2)}
            </Text>
            <Text style={styles.transactionCount}>
              {yearlyTotals.transactionCount} transactions
            </Text>
          </View>

          {/* Top Expense Category */}
          {topExpenseCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Spending Category</Text>
              <View style={styles.topCategoryCard}>
                <View style={styles.topCategoryContent}>
                  <Text style={styles.topCategoryName}>{topExpenseCategory.category}</Text>
                  <Text style={styles.topCategoryAmount}>
                    ${topExpenseCategory.amount.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.topCategorySubtext}>in the last 12 months</Text>
              </View>
            </View>
          )}

          {/* Monthly Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Overview</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#4ecca3' }]} />
                  <Text style={styles.legendText}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]} />
                  <Text style={styles.legendText}>Expenses</Text>
                </View>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                style={styles.chartScroll}
                nestedScrollEnabled={true}
              >
                <View style={styles.chart}>
                  {monthlyData.map((monthData, index) => (
                    <View key={index} style={styles.barGroup}>
                      <View style={styles.bars}>
                        <View
                          style={[
                            styles.bar,
                            styles.incomeBar,
                            { height: getBarHeight(monthData.income) }
                          ]}
                        />
                        <View
                          style={[
                            styles.bar,
                            styles.expenseBar,
                            { height: getBarHeight(monthData.expenses) }
                          ]}
                        />
                      </View>
                      <Text style={styles.monthLabel}>{monthData.month}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Monthly Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
            <View style={styles.detailsContainer}>
              {monthlyData.slice().reverse().map((monthData, index) => (
                <View key={index} style={styles.monthDetailCard}>
                  <View style={styles.monthDetailHeader}>
                    <Text style={styles.monthDetailTitle}>
                      {monthData.month} {monthData.year}
                    </Text>
                    <Text style={[
                      styles.monthDetailBalance,
                      { color: monthData.balance >= 0 ? '#4ecca3' : '#ff6b6b' }
                    ]}>
                      {monthData.balance >= 0 ? '+' : ''}${monthData.balance.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.monthDetailStats}>
                    <View style={styles.monthDetailStat}>
                      <Text style={styles.monthDetailStatLabel}>Income</Text>
                      <Text style={styles.monthDetailStatValue}>
                        ${monthData.income.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.monthDetailStat}>
                      <Text style={styles.monthDetailStatLabel}>Expenses</Text>
                      <Text style={styles.monthDetailStatValue}>
                        ${monthData.expenses.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.monthDetailStat}>
                      <Text style={styles.monthDetailStatLabel}>Transactions</Text>
                      <Text style={styles.monthDetailStatValue}>
                        {monthData.transactionCount}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  incomeCard: {
    backgroundColor: '#2a3e3a',
  },
  expenseCard: {
    backgroundColor: '#3e2a2a',
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  balanceCard: {
    backgroundColor: '#2a2a3e',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionCount: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  topCategoryCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 20,
  },
  topCategoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topCategoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  topCategoryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecca3',
  },
  topCategorySubtext: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  chartContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  chartScroll: {
    marginHorizontal: -16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 12,
    minWidth: '100%',
  },
  barGroup: {
    alignItems: 'center',
    gap: 8,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 140,
  },
  bar: {
    width: 16,
    borderRadius: 4,
  },
  incomeBar: {
    backgroundColor: '#4ecca3',
  },
  expenseBar: {
    backgroundColor: '#ff6b6b',
  },
  monthLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12,
  },
  monthDetailCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
  },
  monthDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a4e',
  },
  monthDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  monthDetailBalance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthDetailStat: {
    flex: 1,
  },
  monthDetailStatLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  monthDetailStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 40,
  },
});
