import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
  Switch
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import {
  RecurringExpense,
  RecurringFrequency,
  getUserRecurringExpenses,
  addRecurringExpense,
  deleteRecurringExpense,
  markAsPaid,
  markAsUnpaid,
} from '../services/recurringExpenseService';
import {
  requestNotificationPermissions,
} from '../services/notificationService';
import { getCategories } from '../services/categoryService';
import { formatCurrency } from '../utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'RecurringExpenses'>;

export default function RecurringExpenses({ navigation }: Props) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
    requestNotificationPermissions();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedExpenses, fetchedCategories] = await Promise.all([
        getUserRecurringExpenses(currentUser.uid),
        getCategories(currentUser.uid, 'expense')
      ]);
      setExpenses(fetchedExpenses);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load recurring expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!name.trim() || !amount || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const expenseId = await addRecurringExpense(
        currentUser.uid,
        name,
        parseFloat(amount),
        category,
        frequency,
        startDate,
        notificationEnabled,
        notificationTime,
        description
      );

      // Note: Notifications are now handled by Firebase Cloud Functions

      setModalVisible(false);
      resetForm();
      loadData();
      Alert.alert('Success', 'Recurring expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add recurring expense');
    }
  };

  const handleDelete = (expense: RecurringExpense) => {
    Alert.alert(
      'Delete Recurring Expense',
      `Are you sure you want to delete "${expense.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecurringExpense(expense.id);
              loadData();
              Alert.alert('Success', 'Recurring expense deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recurring expense');
            }
          },
        },
      ]
    );
  };

  const handleTogglePaid = async (expense: RecurringExpense) => {
    try {
      if (expense.isPaid) {
        // Mark as unpaid
        await markAsUnpaid(expense.id);
        loadData();
      } else {
        // Mark as paid
        await markAsPaid(expense.id, expense.frequency);
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update paid status');
    }
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setFrequency('monthly');
    setStartDate(new Date());
    setNotificationEnabled(true);
    setNotificationTime('09:00');
    setDescription('');
  };

  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: startDate,
        mode: 'date',
        display: 'default',
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            setStartDate(date);
          }
        },
      });
    }
  };

  const formatDate = (date: any): string => {
    const d = date?.toDate?.() || new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilDue = (nextDueDate: any): number => {
    const dueDate = nextDueDate?.toDate?.() || new Date(nextDueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getFrequencyMonogram = (freq: RecurringFrequency): string => {
    switch (freq) {
      case 'daily': return 'D';
      case 'weekly': return 'W';
      case 'monthly': return 'M';
      case 'yearly': return 'Y';
      default: return '?';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Recurring Expenses</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#4ecca3" />
      </TouchableOpacity>
    </View>
  )

  const renderExpenseCard = (
    expense: RecurringExpense,
    isOverdue: Boolean,
    isDueSoon: Boolean,
    daysUntil: number
  ) => (

    <View key={expense.id} style={styles.expenseCard}>
      {/* Status stripe */}
      <View style={[
        styles.statusStripe,
        expense.isPaid && styles.statusStripePaid,
        !expense.isPaid && isOverdue && styles.statusStripeOverdue,
        !expense.isPaid && !isOverdue && isDueSoon && styles.statusStripeDueSoon
      ]} />
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseIconContainer}>
            <Text style={styles.expenseIcon}>{getFrequencyMonogram(expense.frequency)}</Text>
          </View>
          <View style={styles.expenseInfo}>
            <View style={styles.expenseNameRow}>
              <Text style={styles.expenseName}>{expense.name}</Text>
              {expense.isPaid && renderPaidBadge()}
            </View>
            <Text style={styles.expenseCategory}>{expense.category}</Text>
          </View>
          <Text style={styles.expenseAmount}>${formatCurrency(expense.amount)}</Text>
        </View>

        <View style={styles.expenseDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Due:</Text>
            <Text style={[
              styles.detailValue,
              isOverdue && !expense.isPaid && styles.overdueText,
              isDueSoon && !expense.isPaid && styles.dueSoonText
            ]}>
              {formatDate(expense.nextDueDate)}
              {isOverdue && ' (Overdue)'}
              {isDueSoon && !isOverdue && ` (${daysUntil}d)`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frequency:</Text>
            <Text style={styles.detailValue}>{expense.frequency}</Text>
          </View>
          {expense.notificationEnabled && (
            <View style={styles.detailRow}>
              <Ionicons name="notifications" size={14} color="#4ecca3" />
              <Text style={styles.detailValue}>
                Reminder at {expense.notificationTime}
              </Text>
            </View>
          )}
        </View>

        {renderExpenseActions(expense)}
      </View>
    </View>
  )

  const renderPaidBadge = () => (
    <View style={styles.paidBadge}>
      <Ionicons name="checkmark-circle" size={16} color="#1a1a2e" />
      <Text style={styles.paidBadgeText}>Paid</Text>
    </View>
  )

  const renderAddExpenseModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Recurring Expense</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Rent, Netflix, Gym"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Amount *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryChip,
                    category === cat.name && styles.categoryChipSelected
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryChipText,
                    category === cat.name && styles.categoryChipTextSelected
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              {(['daily', 'weekly', 'monthly', 'yearly'] as RecurringFrequency[]).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.frequencyButtonSelected
                  ]}
                  onPress={() => setFrequency(freq)}
                >
                  <Text style={[
                    styles.frequencyButtonText,
                    frequency === freq && styles.frequencyButtonTextSelected
                  ]}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
              <Ionicons name="calendar-outline" size={20} color="#4ecca3" />
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Enable Notifications</Text>
              <Switch
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                trackColor={{ false: '#3a3a4e', true: '#4ecca3' }}
                thumbColor="#ffffff"
              />
            </View>

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Additional notes..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
              <Text style={styles.submitButtonText}>Add Recurring Expense</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  const renderExpenseActions = (expense: RecurringExpense) => (
    <View style={styles.expenseActions}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          expense.isPaid && styles.actionButtonUnpaid
        ]}
        onPress={() => handleTogglePaid(expense)}
      >
        <Ionicons
          name={expense.isPaid ? "close-circle" : "checkmark-circle"}
          size={20}
          color={expense.isPaid ? "#ffd93d" : "#4ecca3"}
        />
        <Text style={[
          styles.actionButtonText,
          expense.isPaid && styles.actionButtonUnpaidText
        ]}>
          {expense.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
        </Text>
      </TouchableOpacity>
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
      ) : expenses.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No recurring expenses yet</Text>
            <Text style={styles.emptySubtext}>
              Add recurring expenses to get reminders
            </Text>
          </View>
        </View>
      ) : (
        <SwipeListView
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item: expense }) => {
            const daysUntil = getDaysUntilDue(expense.nextDueDate);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil >= 0 && daysUntil <= 3;

            return (
              renderExpenseCard(
                expense,
                isOverdue,
                isDueSoon,
                daysUntil
              )
            );
          }}
          renderHiddenItem={({ item }) => (
            <View style={styles.rowBack}>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash" size={24} color="#ffffff" />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-100}
          disableRightSwipe
          closeOnRowPress
          contentContainerStyle={styles.swipeListContent}
          style={styles.swipeList}
        />
      )}

      {/* Add Expense Modal */}
      {renderAddExpenseModal()}

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
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
  },
  expensesList: {
    gap: 16,
  },
  expenseCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  expenseContent: {
    padding: 16,
    paddingLeft: 20,
  },
  statusStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: '#3a3a4e',
  },
  statusStripePaid: {
    backgroundColor: '#4ecca3',
  },
  statusStripeOverdue: {
    backgroundColor: '#ff6b6b',
  },
  statusStripeDueSoon: {
    backgroundColor: '#ffd93d',
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ecca3',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  expenseNamePaid: {
    color: '#1a1a2e',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4ecca3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  expenseCategoryPaid: {
    color: '#1a1a2e',
    opacity: 0.7,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecca3',
  },
  expenseAmountPaid: {
    color: '#1a1a2e',
  },
  expenseDetails: {
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 32
  },
  detailLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  detailLabelPaid: {
    color: '#1a1a2e',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
  },
  detailValuePaid: {
    color: '#1a1a2e',
  },
  overdueText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  dueSoonText: {
    color: '#ffd93d',
    fontWeight: 'bold',
  },
  expenseActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ecca3',
  },
  actionButtonUnpaid: {
    backgroundColor: '#3e3a2a',
  },
  actionButtonUnpaidText: {
    color: '#ffd93d',
  },
  swipeList: {
    paddingHorizontal: 20,
  },
  swipeListContent: {
    paddingBottom: 40,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 15,
    marginBottom: 16,
    borderRadius: 16,
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: '100%',
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalForm: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0a0',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
  },
  categoryChipSelected: {
    backgroundColor: '#4ecca3',
  },
  categoryChipIcon: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#ffffff',
  },
  categoryChipTextSelected: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    backgroundColor: '#4ecca3',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  frequencyButtonTextSelected: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#4ecca3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});
