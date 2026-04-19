import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/userService';
import { getUserTransactions } from '../services/transactionService';
import { getBudget, getCurrentMonth } from '../services/budgetService';
import TransactionListItem from '../components/TransactionListItem';
import SectionHeader from '../components/SectionHeader';
import { formatCurrency } from '../utils/formatCurrency';
import useDashboardStyles from '../styles/useDashboardStyles';
import { RootStackParamList } from '../types';
import { useLocalization } from '@/context/LocalizationContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface UserProfile {
  username?: string;
  profilePicture?: string;
  phone?: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  icon: string;
  date?: any;
  createdAt?: any;
}

interface Balance {
  total: number;
  income: number;
  expenses: number;
}

interface BudgetAlert {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  status: 'over';
}

interface BudgetProgress {
  category: string;
  spent: number;
  limit: number;
  remaining: number;
  percentage: number;
}

export default function Dashboard({ navigation }: Props) {
  const styles = useDashboardStyles();
  const { t } = useLocalization();

  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [balance, setBalance] = useState<Balance>({ total: 0, income: 0, expenses: 0 });
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);

  const loadUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  };

  const loadTransactions = async () => {
    if (currentUser) {
      try {
        setLoadingTransactions(true);
        const fetchedTransactions = await getUserTransactions(currentUser.uid);

        // Sort by createdAt (or date), newest first
        const sorted = fetchedTransactions.sort((a, b) => {
          const dateA = a.date?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.date?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        setTransactions(sorted);

        // Calculate balance
        const totalIncome = fetchedTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = fetchedTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setBalance({
          total: totalIncome - totalExpenses,
          income: totalIncome,
          expenses: totalExpenses
        });

        // Check budget and generate alerts
        await checkBudgetAlerts(fetchedTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoadingTransactions(false);
      }
    }
  };

  const checkBudgetAlerts = async (transactions: Transaction[]) => {
    try {
      const currentMonth = getCurrentMonth();
      const budget = await getBudget(currentUser.uid, currentMonth);

      if (!budget || !budget.categoryBudgets.length) {
        setBudgetAlerts([]);
        return;
      }

      // Filter transactions for current month
      const now = new Date();
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = t.date?.toDate?.() || t.createdAt?.toDate?.();
        return transactionDate &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear() &&
          t.type === 'expense';
      });

      // Calculate spending per category
      const categorySpending: Record<string, number> = {};
      currentMonthTransactions.forEach(t => {
        if (!categorySpending[t.category]) {
          categorySpending[t.category] = 0;
        }
        categorySpending[t.category] += t.amount;
      });

      // Generate alerts only for categories over budget
      const alerts: BudgetAlert[] = [];
      budget.categoryBudgets.forEach(categoryBudget => {
        const spent = categorySpending[categoryBudget.category] || 0;
        const percentage = (spent / categoryBudget.limit) * 100;

        // Only alert when over 100%
        if (percentage > 100) {
          alerts.push({
            category: categoryBudget.category,
            spent,
            limit: categoryBudget.limit,
            percentage,
            status: 'over'
          });
        }
      });

      // Sort by percentage (highest first)
      alerts.sort((a, b) => b.percentage - a.percentage);
      setBudgetAlerts(alerts);

      // Generate progress data for all budgeted categories
      const progress = budget.categoryBudgets.map(categoryBudget => {
        const spent = categorySpending[categoryBudget.category] || 0;
        const percentage = Math.min((spent / categoryBudget.limit) * 100, 100);
        const remaining = Math.max(categoryBudget.limit - spent, 0);

        return {
          category: categoryBudget.category,
          spent,
          limit: categoryBudget.limit,
          remaining,
          percentage
        };
      });

      // Sort by percentage (highest first)
      progress.sort((a, b) => b.percentage - a.percentage);
      setBudgetProgress(progress);
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  };

  // Reload profile and transactions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
      loadTransactions();
    }, [currentUser])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{t('dashboard.welcome')}</Text>
        <Text style={styles.userName}>{userProfile?.username || 'User'}</Text>
      </View>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => navigation.navigate('UserInfo')}
      >
        {userProfile?.profilePicture ? (
          <Image
            source={{ uri: userProfile.profilePicture }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.avatar}>👤</Text>
        )}
      </TouchableOpacity>
    </View>
  )

  const renderBalanceCard = () => (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>{t('dashboard.balance')}</Text>
      <Text style={styles.balanceAmount}>${formatCurrency(balance.total)}</Text>
      <View style={styles.balanceStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('dashboard.income')}</Text>
          <Text style={styles.statIncome}>+${formatCurrency(balance.income)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('dashboard.expense')}</Text>
          <Text style={styles.statExpense}>-${formatCurrency(balance.expenses)}</Text>
        </View>
      </View>
    </View>
  )
  const renderQuickActionsItem = (
    icon: string,
    text: string,
    onPress: () => void
  ) => (

    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionText}>{text}</Text>
    </TouchableOpacity>
  )

  const renderQuickActions = () => (
    <View style={styles.section}>
      <View style={styles.actionsGrid}>

        {renderQuickActionsItem('💸', t('dashboard.addExpense'), () => navigation.navigate('AddTransaction', { type: 'expense' }))}
        {renderQuickActionsItem('💰', t('dashboard.addIncome'), () => navigation.navigate('AddTransaction', { type: 'income' }))}
        {renderQuickActionsItem('🎯', t('dashboard.setBudget'), () => navigation.navigate('BudgetManagement'))}
        {renderQuickActionsItem('🔁', t('dashboard.recurringExpenses'), () => navigation.navigate('RecurringExpenses'))}
        {renderQuickActionsItem('📊', t('dashboard.monthlyReport'), () => navigation.navigate('MonthlyReport'))}
        {renderQuickActionsItem('📈', t('dashboard.yearlyReport'), () => navigation.navigate('YearlyReport'))}

      </View>
    </View>
  )

  const renderBudgetOverview = () => (
    <View style={styles.section}>
      <SectionHeader title={t('dashboard.budgetOverview')} />

      {/* Budget Total Summary */}
      <View style={styles.budgetSummaryCard}>
        <View style={styles.budgetSummaryRow}>
          <Text style={styles.budgetSummaryLabel}>{t('dashboard.totalBudget')}</Text>
          <Text style={styles.budgetSummaryAmount}>
            ${formatCurrency(budgetProgress.reduce((sum, item) => sum + item.limit, 0), 0)}
          </Text>
        </View>
        <View style={styles.budgetSummaryRow}>
          <Text style={styles.budgetSummaryLabel}>{t('dashboard.totalSpent')}</Text>
          <Text style={styles.budgetSummarySpent}>
            ${formatCurrency(budgetProgress.reduce((sum, item) => sum + item.spent, 0), 0)}
          </Text>
        </View>
        <View style={styles.budgetSummaryDivider} />
        <View style={styles.budgetSummaryRow}>
          <Text style={styles.budgetSummaryLabelBold}>{t('dashboard.remaining')}</Text>
          <Text style={[
            styles.budgetSummaryRemaining,
            budgetProgress.reduce((sum, item) => sum + item.remaining, 0) < 0 && styles.budgetSummaryOverBudget
          ]}>
            ${formatCurrency(budgetProgress.reduce((sum, item) => sum + item.remaining, 0), 0)}
          </Text>
        </View>
      </View>

      {renderBudgetProgress()}
    </View>
  )

  const renderBudgetProgress = () => (

    <View style={styles.budgetProgressList}>
      {budgetProgress.slice(0, 5).map((item) => {
        const isOverBudget = item.spent > item.limit;
        const progressPercentage = isOverBudget ? 100 : item.percentage;

        return (
          <View key={item.category} style={styles.budgetItem}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetCategory}>{item.category}</Text>
              <Text style={styles.budgetAmount}>
                ${formatCurrency(item.spent, 0)} / ${formatCurrency(item.limit, 0)}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPercentage}%` },
                  isOverBudget ? styles.progressBarOver : styles.progressBarNormal
                ]}
              />
            </View>
            <Text style={[
              styles.budgetRemaining,
              isOverBudget && styles.budgetOver
            ]}>
              {isOverBudget
                ? `${t('dashboard.overBy')} $${formatCurrency(item.spent - item.limit)}`
                : `$${formatCurrency(item.remaining)} ${t('dashboard.remaining')}`
              }
            </Text>
          </View>
        );
      })}
    </View>
  )

  const renderRecentTransactions = () => (
    <View style={styles.section}>
      <SectionHeader 
        title={t('dashboard.recentTransactions')}
        actionText={t('dashboard.viewAll')}
        onActionPress={() => navigation.navigate('FullTransactionList')}
      />

      <View style={styles.transactionsList}>
        {loadingTransactions ? (
          <ActivityIndicator size="small" color="#4ecca3" style={{ marginVertical: 20 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{t('transactions.noTransactions')}</Text>
            <Text style={styles.emptyStateSubtext}>{t('transactions.startTracking')}</Text>
          </View>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <TransactionListItem
              key={transaction.id}
              transaction={transaction}
              showTime={false}
            />
          ))
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar style='light' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        {renderHeader()}

        {/* Balance Card */}
        {renderBalanceCard()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Budget Progress */}
        {budgetProgress.length > 0 && (
          renderBudgetOverview()
        )}

        {/* Recent Transactions */}
        {renderRecentTransactions()}
      </ScrollView>
    </View>
  );
}