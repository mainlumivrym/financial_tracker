import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/userService';
import { getUserTransactions } from '../services/transactionService';
import { getBudget, getCurrentMonth } from '../services/budgetService';
import TransactionListItem from '../components/TransactionListItem';
import { colors, globalStyles, spacing, borderRadius } from '../styles';
import { formatCurrency } from '../utils/formatCurrency';

export default function Dashboard({ navigation }) {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [balance, setBalance] = useState({ total: 0, income: 0, expenses: 0 });
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);

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

  const checkBudgetAlerts = async (transactions) => {
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
      const categorySpending = {};
      currentMonthTransactions.forEach(t => {
        if (!categorySpending[t.category]) {
          categorySpending[t.category] = 0;
        }
        categorySpending[t.category] += t.amount;
      });

      // Generate alerts only for categories over budget
      const alerts = [];
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
  return (
    <View style={styles.container}>
      <StatusBar style='light' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
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

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${formatCurrency(balance.total)}</Text>
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statIncome}>+${formatCurrency(balance.income)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statExpense}>-${formatCurrency(balance.expenses)}</Text>
            </View>
          </View>
        </View>


        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
            >
              <Text style={styles.actionIcon}>💸</Text>
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Add Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('BudgetManagement')}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Set Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('RecurringExpenses')}
            >
              <Text style={styles.actionIcon}>🔁</Text>
              <Text style={styles.actionText}>Recurring Expenses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('MonthlyReport')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Monthly Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('YearlyReport')}
            >
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionText}>Yearly Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget Progress */}
        {budgetProgress.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Overview</Text>
              <TouchableOpacity style={{
                height: '100%',
                justifyContent: 'center'
              }} onPress={() => navigation.navigate('BudgetManagement')}>
                <Text style={styles.seeAllText}>Set budget</Text>
              </TouchableOpacity>
            </View>
            
            {/* Budget Total Summary */}
            <View style={styles.budgetSummaryCard}>
              <View style={styles.budgetSummaryRow}>
                <Text style={styles.budgetSummaryLabel}>Total Budget</Text>
                <Text style={styles.budgetSummaryAmount}>
                  ${formatCurrency(budgetProgress.reduce((sum, item) => sum + item.limit, 0), 0)}
                </Text>
              </View>
              <View style={styles.budgetSummaryRow}>
                <Text style={styles.budgetSummaryLabel}>Total Spent</Text>
                <Text style={styles.budgetSummarySpent}>
                  ${formatCurrency(budgetProgress.reduce((sum, item) => sum + item.spent, 0), 0)}
                </Text>
              </View>
              <View style={styles.budgetSummaryDivider} />
              <View style={styles.budgetSummaryRow}>
                <Text style={styles.budgetSummaryLabelBold}>Remaining</Text>
                <Text style={[
                  styles.budgetSummaryRemaining,
                  budgetProgress.reduce((sum, item) => sum + item.remaining, 0) < 0 && styles.budgetSummaryOverBudget
                ]}>
                  ${formatCurrency(budgetProgress.reduce((sum, item) => sum + item.remaining, 0), 0)}
                </Text>
              </View>
            </View>
            
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
                        ? `Over by $${formatCurrency(item.spent - item.limit)}`
                        : `$${formatCurrency(item.remaining)} remaining`
                      }
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity style={{
              height: '100%',
              justifyContent: 'center'
            }} onPress={() => navigation.navigate('FullTransactionList')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {loadingTransactions ? (
              <ActivityIndicator size="small" color="#4ecca3" style={{ marginVertical: 20 }} />
            ) : transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <Text style={styles.emptyStateSubtext}>Start tracking your finances!</Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    fontSize: 24,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.textDark,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 8,
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
    marginBottom: 4,
  },
  statIncome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  statExpense: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.background,
    opacity: 0.2,
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 0,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  transactionsList: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  alertItemWarning: {
    backgroundColor: '#3a3a2e',
    borderLeftColor: colors.warning,
  },
  alertItemOver: {
    backgroundColor: '#3a2e2e',
    borderLeftColor: colors.danger,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  alertPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.warning,
  },
  alertPercentageOver: {
    color: colors.danger,
  },
  budgetSummaryCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  budgetSummaryRow: {
    height:32 ,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetSummaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  budgetSummaryLabelBold: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  budgetSummaryAmount: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  budgetSummarySpent: {
    fontSize: 16,
    color: colors.warning,
    fontWeight: '600',
  },
  budgetSummaryRemaining: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  budgetSummaryOverBudget: {
    color: colors.danger,
  },
  budgetSummaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 8,
  },
  budgetProgressList: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    gap: 20,
  },
  budgetItem: {
    gap: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  budgetAmount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarNormal: {
    backgroundColor: colors.primary,
  },
  progressBarOver: {
    backgroundColor: colors.danger,
  },
  budgetRemaining: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  budgetOver: {
    color: colors.budgetOver,
    fontWeight: '600',
  },
});
