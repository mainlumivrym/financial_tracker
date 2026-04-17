import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles';
import { formatCurrency } from '../utils/formatCurrency';

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

interface TransactionListItemProps {
  transaction: Transaction;
  showCategory?: boolean;
  showTime?: boolean;
}

export default function TransactionListItem({
  transaction,
  showCategory = false,
  showTime = true
}: TransactionListItemProps) {

  const formatTransactionDate = () => {
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
      return transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: transactionDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const renderTransactionIcon = () => (
    <View
      style={[
        styles.transactionIconContainer,
        { backgroundColor: colors.backgroundDark },
      ]}
    >
      <Text style={styles.transactionIcon}>{transaction.icon}</Text>
    </View>
  )

  const renderTransactionInfo = () => (
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionTitle}>
        {transaction.description || transaction.category}
      </Text>
      {transaction.description && (
        <Text style={styles.transactionCategory}>{transaction.category}</Text>
      )}
      {!showTime && (
        <Text style={styles.transactionDate}>{formatTransactionDate()}</Text>
      )}
    </View>
  )

  const renderTransactionAmount = () => (
    <Text
      style={
        transaction.type === 'income'
          ? styles.transactionAmountPositive
          : styles.transactionAmountNegative
      }
    >
      {transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
    </Text>
  )

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        {renderTransactionIcon()}
        {renderTransactionInfo()}
      </View>
      <View style={styles.transactionRight}>
        {renderTransactionAmount()}
        {showTime && (
          <Text style={styles.transactionTime}>{formatTransactionDate()}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmountNegative: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.expense,
    marginBottom: 2,
  },
  transactionAmountPositive: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.income,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
