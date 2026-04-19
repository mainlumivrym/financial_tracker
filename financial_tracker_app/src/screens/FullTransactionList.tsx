import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SectionListData
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SwipeRow } from 'react-native-swipe-list-view';
import { useAuth } from '../context/AuthContext';
import { getUserTransactions, deleteTransaction } from '../services/transactionService';
import { RootStackParamList } from '../types';
import TransactionListItem from '../components/TransactionListItem';
import useFullTransactionListStyles from '@/styles/useFullTransactionListStyles';
import ScreenHeader from '@/components/ScreenHeader';
import { useLocalization } from '@/context/LocalizationContext';
import { useTheme } from '../context/ThemeContext';

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
  const styles = useFullTransactionListStyles();
  const { theme } = useTheme();
  const { t } = useLocalization();

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

  const handleDeleteTransaction = async (transactionId: string, transactionDescription: string) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transactionDescription}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              // Reload transactions after deletion
              loadTransactions();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
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

    // Convert to sections format for SectionList
    return Object.entries(grouped).map(([month, data]) => ({
      title: month,
      data
    }));
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

  const sections = groupTransactionsByMonth();

  const renderHeader = () => (
    <ScreenHeader
      title={t('fullTransactionsList.title')}
      onBackPress={() => navigation.goBack()}
    />
  )

  const renderSectionHeader = (section: SectionListData<Transaction>) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.dateHeader}>{section.title}</Text>
      </View>
    );
  };

  const renderEmptyContainer = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyText}>{t('dashboard.noTransactions')}</Text>
      <Text style={styles.emptySubtext}>{t('dashboard.startTracking')}</Text>
    </View>
  );

  const renderSectionItem = (
    item: Transaction,
    isFirst: boolean,
    isLast: boolean
  ) => (
    <SwipeRow
      rightOpenValue={-75}
      disableRightSwipe
      friction={8}
    >
      {/* Hidden delete button */}
      <View style={[
        styles.rowBack,
        isFirst && styles.rowBackFirst,
        isLast && styles.rowBackLast
      ]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTransaction(
            item.id,
            item.description || item.category
          )}
        >
          <Ionicons name="trash-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Visible transaction item */}
      <View style={[
        styles.itemContainer,
        isFirst && styles.itemContainerFirst,
        isLast && styles.itemContainerLast
      ]}>
        <TransactionListItem
          transaction={item}
          showCategory={true}
          showTime={false}
        />
      </View>
    </SwipeRow>
  );

  const renderSectionSummary = (
    income: number,
    expenses: number,
    balance: number
  ) => (
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
          { color: balance >= 0 ? theme.colors.income : theme.colors.expense }
        ]}>
          {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
        </Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      {renderHeader()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ecca3" />
        </View>
      ) : transactions.length === 0 ? (
        renderEmptyContainer()
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={true}
          renderSectionHeader={({ section }) => (
            renderSectionHeader(section)
          )}
          renderItem={({ item, index, section }) => {
            const isFirst = index === 0;
            const isLast = index === section.data.length - 1;

            return (
              renderSectionItem(item, isFirst, isLast)
            );
          }}
          renderSectionFooter={({ section }) => {
            const { income, expenses, balance } = calculateMonthBalance(section.data);

            return (
              renderSectionSummary(income, expenses, balance)
            );
          }}
          style={styles.scrollView}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}