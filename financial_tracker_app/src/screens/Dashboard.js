import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/userService';
import { getUserTransactions } from '../services/transactionService';

export default function Dashboard({ navigation }) {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [balance, setBalance] = useState({ total: 0, income: 0, expenses: 0 });

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
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoadingTransactions(false);
      }
    }
  };

  const formatTransactionDate = (transaction) => {
    // Use transaction.date if available, fallback to createdAt
    const timestampField = transaction.date || transaction.createdAt;
    if (!timestampField) return 'Unknown date';
    
    const transactionDate = timestampField.toDate ? timestampField.toDate() : new Date(timestampField);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (transactionDate.toDateString() === today.toDateString()) {
      return `Today, ${transactionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const daysDiff = Math.floor((today - transactionDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        return `${daysDiff} days ago`;
      }
      return transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          <Text style={styles.balanceAmount}>${balance.total.toFixed(2)}</Text>
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statIncome}>+${balance.income.toFixed(2)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statExpense}>-${balance.expenses.toFixed(2)}</Text>
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
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionText}>Add Income</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Set Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>View Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
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
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIconContainer,
                      { backgroundColor: transaction.type === 'income' ? '#4ecca3' : '#ff6b6b' }
                    ]}>
                      <Text style={styles.transactionIcon}>{transaction.icon}</Text>
                    </View>
                    <View>
                      <Text style={styles.transactionTitle}>
                        {transaction.description || transaction.category}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatTransactionDate(transaction)}
                      </Text>
                    </View>
                  </View>
                  <Text style={transaction.type === 'income' ? styles.transactionAmountPositive : styles.transactionAmountNegative}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </Text>
                </View>
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
    backgroundColor: '#1a1a2e',
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
    color: '#a0a0a0',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a3e',
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
    backgroundColor: '#4ecca3',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#1a1a2e',
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a2e',
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
    color: '#1a1a2e',
    opacity: 0.7,
    marginBottom: 4,
  },
  statIncome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  statExpense: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a2e',
    opacity: 0.2,
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4ecca3',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#2a2a3e',
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
    color: '#ffffff',
    textAlign: 'center',
  },
  transactionsList: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  transactionDate: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 2,
  },
  transactionAmountNegative: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  transactionAmountPositive: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ecca3',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#a0a0a0',
  },
});
