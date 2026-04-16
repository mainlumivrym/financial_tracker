import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserTransactions } from '../services/transactionService';
import { getBudget, getCurrentMonth } from '../services/budgetService';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MonthlyReport'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MonthlyReport({ navigation }: Props) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, [selectedDate]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const fetchedTransactions = await getUserTransactions(currentUser.uid);
      
      // Filter for selected month
      const currentMonthTransactions = fetchedTransactions.filter(t => {
        const transactionDate = t.date?.toDate?.() || t.createdAt?.toDate?.();
        return transactionDate && 
               transactionDate.getMonth() === selectedDate.getMonth() &&
               transactionDate.getFullYear() === selectedDate.getFullYear();
      });

      setTransactions(currentMonthTransactions);

      // Calculate monthly totals
      const income = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setMonthlyData({
        income,
        expenses,
        balance: income - expenses,
        transactionCount: currentMonthTransactions.length
      });

      // Calculate category breakdown for expenses
      const categoryTotals: { [key: string]: number } = {};
      currentMonthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
          }
          categoryTotals[t.category] += t.amount;
        });

      const breakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / expenses) * 100
      }));

      breakdown.sort((a, b) => b.amount - a.amount);
      setCategoryBreakdown(breakdown);
      setTopCategories(breakdown.slice(0, 3));

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMonthPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        display: 'default',
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            setSelectedDate(date);
          }
        },
      });
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
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
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.backButton} />
      </View>

      {/* Month Picker */}
      <View style={styles.monthPickerContainer}>
        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={24} color="#4ecca3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.monthDisplay}
          onPress={showMonthPicker}
        >
          <Text style={styles.monthText}>{formatMonthYear(selectedDate)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#a0a0a0" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={24} color="#4ecca3" />
        </TouchableOpacity>
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
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryAmount}>${monthlyData.income.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.expenseCard]}>
              <Text style={styles.summaryIcon}>💸</Text>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryAmount}>${monthlyData.expenses.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Text style={styles.balanceLabel}>Net Balance</Text>
            <Text style={[
              styles.balanceAmount,
              { color: monthlyData.balance >= 0 ? '#4ecca3' : '#ff6b6b' }
            ]}>
              {monthlyData.balance >= 0 ? '+' : ''}${monthlyData.balance.toFixed(2)}
            </Text>
            <Text style={styles.transactionCount}>
              {monthlyData.transactionCount} transactions this month
            </Text>
          </View>

          {/* Top Spending Categories */}
          {topCategories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Spending Categories</Text>
              <View style={styles.topCategoriesContainer}>
                {topCategories.map((item, index) => (
                  <View key={item.category} style={styles.topCategoryItem}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.topCategoryInfo}>
                      <Text style={styles.topCategoryName}>{item.category}</Text>
                      <Text style={styles.topCategoryAmount}>
                        ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.topCategoryPercentage}>
                      {item.percentage.toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expense Breakdown</Text>
              <View style={styles.breakdownContainer}>
                {categoryBreakdown.map((item) => (
                  <View key={item.category} style={styles.breakdownItem}>
                    <View style={styles.breakdownHeader}>
                      <Text style={styles.breakdownCategory}>{item.category}</Text>
                      <Text style={styles.breakdownAmount}>
                        ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.breakdownBarContainer}>
                      <View 
                        style={[
                          styles.breakdownBar,
                          { width: `${item.percentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.breakdownPercentage}>
                      {item.percentage.toFixed(1)}% of total expenses
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {categoryBreakdown.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No data yet</Text>
              <Text style={styles.emptySubtext}>
                Start adding transactions to see your financial reports
              </Text>
            </View>
          )}

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
    paddingBottom: 15,
  },
  monthPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
  },
  monthDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a3e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
  topCategoriesContainer: {
    gap: 12,
  },
  topCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ecca3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  topCategoryInfo: {
    flex: 1,
  },
  topCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  topCategoryAmount: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  topCategoryPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecca3',
  },
  breakdownContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 16,
    gap: 20,
  },
  breakdownItem: {
    gap: 8,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  breakdownBarContainer: {
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    backgroundColor: '#4ecca3',
    borderRadius: 4,
  },
  breakdownPercentage: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomSpacer: {
    height: 40,
  },
});
