import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserTransactions } from '../services/transactionService';
import { RootStackParamList } from '../types';
import TransactionListItem from '../components/TransactionListItem';

type Props = NativeStackScreenProps<RootStackParamList, 'FullTransactionList'>;

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description?: string;
  icon: string;
  date?: any;
  createdAt?: any;
}

export default function FullTransactionList({ navigation }: Props) {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (currentUser) {
      try {
        setLoading(true);
        const fetchedTransactions = await getUserTransactions(currentUser.uid);
        
        // Sort by date, newest first
        const sorted = fetchedTransactions.sort((a, b) => {
          const dateA = a.date?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.date?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        setTransactions(sorted);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    }
  };


  const groupTransactionsByMonth = () => {
    const grouped: { [key: string]: Transaction[] } = {};
    
    transactions.forEach((transaction) => {
      const timestampField = transaction.date || transaction.createdAt;
      if (!timestampField) return;
      
      const date = timestampField.toDate ? timestampField.toDate() : new Date(timestampField);
      const monthKey = date.toLocaleDateString('en-US', { 
        month: 'long',
        year: 'numeric'
      });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(transaction);
    });
    
    return grouped;
  };

  const calculateMonthBalance = (monthTransactions: Transaction[]) => {
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    return { income, expenses, balance };
  };

  const groupedTransactions = groupTransactionsByMonth();

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
        <Text style={styles.headerTitle}>All Transactions</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ecca3" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Start tracking your finances!</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedTransactions).map(([month, monthTransactions]) => {
            const { income, expenses, balance } = calculateMonthBalance(monthTransactions);
            
            return (
              <View key={month} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{month}</Text>
                <View style={styles.transactionsList}>
                  {monthTransactions.map((transaction) => (
                    <TransactionListItem
                      key={transaction.id}
                      transaction={transaction}
                      showCategory={true}
                      showTime={false}
                    />
                  ))}
                  
                  {/* Month Balance Summary */}
                  <View style={styles.monthSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Income</Text>
                      <Text style={styles.summaryIncome}>+${income.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Expenses</Text>
                      <Text style={styles.summaryExpense}>-${expenses.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                      <Text style={styles.summaryTotalLabel}>Balance</Text>
                      <Text style={[
                        styles.summaryTotalAmount,
                        { color: balance >= 0 ? '#4ecca3' : '#ff6b6b' }
                      ]}>
                        {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  transactionsList: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 12,
  },
  monthSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3a4e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  summaryIncome: {
    fontSize: 14,
    color: '#4ecca3',
    fontWeight: '600',
  },
  summaryExpense: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  summaryTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3a3a4e',
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  summaryTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});
