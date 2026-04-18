import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
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
import { getCategories } from '../services/categoryService';
import { RootStackParamList } from '../types';
import { colors } from '../styles';
import { formatCurrency } from '../utils/formatCurrency';
import useMonthlyReportStyles from '@/styles/useMonthlyReportStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'MonthlyReport'>;

export default function MonthlyReport({ navigation, route }: Props) {

  const styles = useMonthlyReportStyles();

  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  // If year and month are provided via route params, use them; otherwise use current date
  const initialDate = route.params?.year && route.params?.month !== undefined
    ? new Date(route.params.year, route.params.month, 1)
    : new Date();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const isDateLocked = route.params?.year !== undefined && route.params?.month !== undefined;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, [selectedDate]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [fetchedTransactions, fetchedCategories] = await Promise.all([
        getUserTransactions(currentUser.uid),
        getCategories(currentUser.uid, 'expense')
      ]);
      setCategories(fetchedCategories);

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

      // Calculate category breakdown for expenses with transactions
      const categoryTotals: { [key: string]: { amount: number; transactions: any[] } } = {};
      currentMonthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = { amount: 0, transactions: [] };
          }
          categoryTotals[t.category].amount += t.amount;
          categoryTotals[t.category].transactions.push(t);
        });

      const breakdown = Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: (data.amount / expenses) * 100,
        transactions: data.transactions.sort((a, b) => {
          const dateA = a.date?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.date?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        })
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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const formatTransactionDate = (date: any): string => {
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderDatePicker = () => (
    <View style={styles.monthPickerContainer}>
      <TouchableOpacity
        style={styles.monthNavButton}
        onPress={() => navigateMonth('prev')}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.monthDisplay}
        onPress={showMonthPicker}
      >
        <Text style={styles.monthText}>{formatMonthYear(selectedDate)}</Text>
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.monthNavButton}
        onPress={() => navigateMonth('next')}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )

  const renderSummaryCards = () => (
    <View style={styles.summaryGrid}>
      <View style={[styles.summaryCard, styles.incomeCard]}>
        <Text style={styles.summaryIcon}>💰</Text>
        <Text style={styles.summaryLabel}>Income</Text>
        <Text style={styles.summaryAmount}>${formatCurrency(monthlyData.income)}</Text>
      </View>
      <View style={[styles.summaryCard, styles.expenseCard]}>
        <Text style={styles.summaryIcon}>💸</Text>
        <Text style={styles.summaryLabel}>Expenses</Text>
        <Text style={styles.summaryAmount}>${formatCurrency(monthlyData.expenses)}</Text>
      </View>
    </View>
  )

  const renderBalanceCard = () => (
    <View style={[styles.summaryCard, styles.balanceCard]}>
      <Text style={styles.balanceLabel}>Net Balance</Text>
      <Text style={[
        styles.balanceAmount,
        { color: monthlyData.balance >= 0 ? colors.income : colors.expense }
      ]}>
        {monthlyData.balance >= 0 ? '+' : ''}${formatCurrency(monthlyData.balance)}
      </Text>
      <Text style={styles.transactionCount}>
        {monthlyData.transactionCount} transactions this month
      </Text>
    </View>
  )

  const renderCategoryBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Expense Breakdown</Text>
      <View style={styles.breakdownContainer}>
        {categoryBreakdown.map((item) => (
          renderCategoryBreakdownItem(item)
        ))}
      </View>
    </View>
  )

  const renderCategoryBreakdownItem = (item: any) => {
    const isExpanded = expandedCategories.has(item.category);
    const categoryData = categories.find(cat => cat.name === item.category);
    const categoryIcon = categoryData?.icon || item.transactions[0]?.icon || '💸';

    return (

      <View
        style={{
          flexDirection: 'row',
          gap: 12,
        }}
      >

        <View style={styles.categoryIconContainer}>
          <Text style={styles.categoryIcon}>{categoryIcon}</Text>
        </View>

        <View key={item.category} style={styles.breakdownItem}>
          <TouchableOpacity
            onPress={() => toggleCategory(item.category)}
            activeOpacity={0.7}
            style={{ flex: 1 }}
          >
            <View style={styles.breakdownHeader}>
              <View style={styles.breakdownLeftSection}>
                <Text style={styles.breakdownCategory}>{item.category}</Text>
              </View>
              <Text style={styles.breakdownAmount}>
                ${formatCurrency(item.amount)}
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
              {item.percentage.toFixed(1)}%
            </Text>
          </TouchableOpacity>

          {/* Transaction Subitems - Conditionally Visible */}
          {isExpanded && (
            <View style={styles.transactionsSublist}>
              {item.transactions.map((transaction: any, index: number) => (
                renderTransactionSubItem(transaction, index)
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  const renderTransactionSubItem = (transaction: any, index: number) => (
    <View key={transaction.id || index} style={styles.transactionSubitem}>
      <View style={styles.transactionSubitemLeft}>
        <View style={styles.transactionSubitemInfo}>
          <Text style={styles.transactionSubitemDescription}>
            {transaction.description || 'No description'}
          </Text>
          <Text style={styles.transactionSubitemDate}>
            {formatTransactionDate(transaction.date || transaction.createdAt)}
          </Text>
        </View>
      </View>
      <Text style={styles.transactionSubitemAmount}>
        ${formatCurrency(transaction.amount)}
      </Text>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyText}>No data yet</Text>
      <Text style={styles.emptySubtext}>
        Start adding transactions to see your financial reports
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.backButton} />
      </View>

      {/* Month Picker - only show if date is not locked */}
      {!isDateLocked && (
        renderDatePicker()
      )}

      {/* Show month title when date is locked */}
      {isDateLocked && (
        <View style={styles.lockedMonthContainer}>
          <Text style={styles.lockedMonthText}>{formatMonthYear(selectedDate)}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          {renderSummaryCards()}
          {renderBalanceCard()}

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            renderCategoryBreakdown()
          )}

          {categoryBreakdown.length === 0 && (
            renderEmptyState()
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}