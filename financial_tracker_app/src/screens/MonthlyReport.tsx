import React, { useState, useEffect, use } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable
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
import ScreenHeader from '@/components/ScreenHeader';
import DailyOverviewGraph from '@/components/DailyOverviewGraph';
import { useTheme } from '../context/ThemeContext';
import { useLocalization } from '@/context/LocalizationContext';
import SectionHeader from '@/components/SectionHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'MonthlyReport'>;

export default function MonthlyReport({ navigation, route }: Props) {
  const { theme } = useTheme();
  const styles = useMonthlyReportStyles();
  const { t } = useLocalization();

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
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);


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

      // Calculate daily breakdown
      const daysInMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      ).getDate();

      const dailyTotals: { [key: number]: { income: number; expenses: number } } = {};

      // Initialize all days
      for (let day = 1; day <= daysInMonth; day++) {
        dailyTotals[day] = { income: 0, expenses: 0 };
      }

      // Sum transactions by day
      currentMonthTransactions.forEach(t => {
        const transactionDate = t.date?.toDate?.() || t.createdAt?.toDate?.();
        if (transactionDate) {
          const day = transactionDate.getDate();
          if (t.type === 'income') {
            dailyTotals[day].income += t.amount;
          } else {
            dailyTotals[day].expenses += t.amount;
          }
        }
      });

      const daily = Object.entries(dailyTotals).map(([day, data]) => ({
        day: parseInt(day),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }));

      setDailyData(daily);

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

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const calculateSelectedSum = (): number => {
    let sum = 0;
    categoryBreakdown.forEach(category => {
      category.transactions.forEach((transaction: any) => {
        if (selectedTransactions.has(transaction.id)) {
          sum += transaction.amount;
        }
      });
    });
    return sum;
  };

  const clearSelection = () => {
    setSelectedTransactions(new Set());
    setIsWidgetExpanded(false);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    // Clear selections when exiting selection mode
    if (selectionMode) {
      setSelectedTransactions(new Set());
    }
  };

  const handleLongPress = (transactionId: string) => {
    // Enter selection mode and select the item
    setSelectionMode(true);
    setSelectedTransactions(new Set([transactionId]));
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
        <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.monthDisplay}
        onPress={showMonthPicker}
      >
        <Text style={styles.monthText}>{formatMonthYear(selectedDate)}</Text>
        <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.monthNavButton}
        onPress={() => navigateMonth('next')}
      >
        <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  )

  const renderSummaryCards = () => (
    <View style={styles.summaryGrid}>
      <View style={[styles.summaryCard, styles.incomeCard]}>
        <Text style={styles.summaryIcon}>💰</Text>
        <Text style={styles.summaryLabel}>{t('common.income')}</Text>
        <Text style={styles.summaryAmount}>${formatCurrency(monthlyData.income)}</Text>
      </View>
      <View style={[styles.summaryCard, styles.expenseCard]}>
        <Text style={styles.summaryIcon}>💸</Text>
        <Text style={styles.summaryLabel}>{t('common.expenses')}</Text>
        <Text style={styles.summaryAmount}>${formatCurrency(monthlyData.expenses)}</Text>
      </View>
    </View>
  )

  const renderBalanceCard = () => (
    <View style={[styles.summaryCard, styles.balanceCard]}>
      <Text style={styles.balanceLabel}>{t('reports.netBalance')}</Text>
      <Text style={[
        styles.balanceAmount,
        { color: monthlyData.balance >= 0 ? theme.colors.income : theme.colors.expense }
      ]}>
        {monthlyData.balance >= 0 ? '+' : ''}${formatCurrency(monthlyData.balance)}
      </Text>
      <Text style={styles.transactionCount}>
        {monthlyData.transactionCount} {t('reports.transactionsThisMonth')}
      </Text>
    </View>
  )

  const renderCategoryBreakdown = () => (
    <View style={styles.section}>
      <SectionHeader
        title={t('reports.expenseBreakdown')}
      />

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

  const renderTransactionSubItem = (transaction: any, index: number) => {
    const isSelected = selectedTransactions.has(transaction.id);

    return (
      <Pressable
        key={transaction.id || index}
        style={[
          styles.transactionSubitem,
          isSelected && selectionMode && styles.transactionSubitemSelected
        ]}
        onPress={() => selectionMode && toggleTransactionSelection(transaction.id)}
        onLongPress={() => handleLongPress(transaction.id)}
        delayLongPress={400}
      >
        <View style={styles.transactionSubitemLeft}>
          {selectionMode && (
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </View>
          )}
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
      </Pressable>
    );
  }

  const renderDailyGraph = () => (
    <View style={styles.section}>
      <SectionHeader
        title={t('reports.dailyOverview')}
      />
      <View style={styles.dailyGraphContainer}>
        <DailyOverviewGraph
          dailyData={dailyData}
          incomeLabel={t('common.income')}
          expensesLabel={t('common.expenses')}
        />
      </View>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyText}>{t('common.noData')}</Text>
      <Text style={styles.emptySubtext}>
        {t('common.startAddingTransactions')}
      </Text>
    </View>
  )

  const renderHeader = () => (
    <ScreenHeader
      title={t('reports.monthlyReport')}
      onBackPress={() => navigation.goBack()}
    />
  )

  const renderFloatingWidget = () => (

    <View style={[
      styles.floatingWidget,
      isWidgetExpanded && styles.floatingWidgetExpanded
    ]}>
      <TouchableOpacity
        style={styles.floatingWidgetContent}
        onPress={() => setIsWidgetExpanded(!isWidgetExpanded)}
        activeOpacity={0.9}
      >
        <View style={styles.floatingWidgetInfo}>
          <Text style={styles.floatingWidgetCount}>
            {selectedTransactions.size} {selectedTransactions.size === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.floatingWidgetSum}>
            ${formatCurrency(selectedSum)}
          </Text>
        </View>
        <View style={styles.floatingWidgetActions}>
          <TouchableOpacity
            style={styles.floatingWidgetButton}
            onPress={(e) => {
              e.stopPropagation();
              clearSelection();
              setSelectionMode(false);
            }}
          >
            <Ionicons name="close" size={24} color={theme.colors.greenCardText} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded List */}
      {isWidgetExpanded && (
        <View style={styles.floatingWidgetList}>
          <View style={styles.floatingWidgetDivider} />
          <ScrollView style={styles.floatingWidgetScrollView} showsVerticalScrollIndicator={false}>
            {categoryBreakdown.map(category =>
              category.transactions
                .filter((t: any) => selectedTransactions.has(t.id))
                .map((transaction: any) => (
                  <View key={transaction.id} style={styles.floatingWidgetItem}>
                    <View style={styles.floatingWidgetItemLeft}>
                      <Text style={styles.floatingWidgetItemDescription}>
                        {transaction.description || 'No description'}
                      </Text>
                      <Text style={styles.floatingWidgetItemCategory}>
                        {transaction.category} • {formatTransactionDate(transaction.date || transaction.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.floatingWidgetItemAmount}>
                      ${formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  )

  const selectedSum = calculateSelectedSum();
  const hasSelection = selectedTransactions.size > 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      {renderHeader()}

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

          {/* Daily Graph */}
          {dailyData.length > 0 && (
            renderDailyGraph()
          )}

          {categoryBreakdown.length === 0 && (
            renderEmptyState()
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* Floating Selection Widget */}
      {selectionMode && (
        renderFloatingWidget()
      )}
    </View>
  );
}