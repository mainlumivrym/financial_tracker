import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('UserInfo')}
          >
            <Text style={styles.avatar}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$12,450.00</Text>
          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statIncome}>+$5,200</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statExpense}>-$2,890</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
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
            <View style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIconContainer, { backgroundColor: '#ff6b6b' }]}>
                  <Text style={styles.transactionIcon}>🍔</Text>
                </View>
                <View>
                  <Text style={styles.transactionTitle}>Restaurant</Text>
                  <Text style={styles.transactionDate}>Today, 2:30 PM</Text>
                </View>
              </View>
              <Text style={styles.transactionAmountNegative}>-$45.00</Text>
            </View>

            <View style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIconContainer, { backgroundColor: '#4ecca3' }]}>
                  <Text style={styles.transactionIcon}>💼</Text>
                </View>
                <View>
                  <Text style={styles.transactionTitle}>Salary</Text>
                  <Text style={styles.transactionDate}>Yesterday</Text>
                </View>
              </View>
              <Text style={styles.transactionAmountPositive}>+$5,200.00</Text>
            </View>

            <View style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIconContainer, { backgroundColor: '#ffd93d' }]}>
                  <Text style={styles.transactionIcon}>🛒</Text>
                </View>
                <View>
                  <Text style={styles.transactionTitle}>Groceries</Text>
                  <Text style={styles.transactionDate}>2 days ago</Text>
                </View>
              </View>
              <Text style={styles.transactionAmountNegative}>-$128.50</Text>
            </View>
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
});
