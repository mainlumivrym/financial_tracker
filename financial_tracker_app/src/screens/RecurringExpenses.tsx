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
import useRecurringExpensesStyles from '@/styles/useRecurringExpensesStyles';
import ScreenHeader from '@/components/ScreenHeader';
import { useLocalization } from '@/context/LocalizationContext';


type Props = NativeStackScreenProps<RootStackParamList, 'RecurringExpenses'>;

export default function RecurringExpenses({ navigation }: Props) {
  const styles = useRecurringExpensesStyles();
  const {t} = useLocalization();


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
      Alert.alert(t('common.error'), t('recurring.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!name.trim() || !amount || !category) {
      Alert.alert(t('common.error'), t('recurring.fillAllFields'));
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
      Alert.alert(t('common.success'), t('recurring.addedSuccessfully'));
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert(t('common.error'), t('recurring.failedToAdd'));
    }
  };

  const handleDelete = (expense: RecurringExpense) => {
    Alert.alert(
      t('recurring.deleteConfirm'),
      `${t('recurring.areYouSureYouWantToDelete')} "${expense.name}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecurringExpense(expense.id);
              loadData();
              Alert.alert(t('common.success'), t('recurring.deletedSuccessfully'));
            } catch (error) {
              Alert.alert(t('common.error'), t('recurring.failedToDelete'));
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
      Alert.alert(t('common.error'), t('recurring.failedToUpdatePaidStatus'));
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
   <ScreenHeader
      title={t('recurring.recurringExpenses')}
      onBackPress={() => navigation.goBack()}
      rightButton={{
        text: loading ? t('common.saving') : t('common.save'),
        onPress: () => setModalVisible(true),
      }}
    />
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
            <Text style={styles.detailLabel}>{t('recurring.nextDue')}:</Text>
            <Text style={[
              styles.detailValue,
              isOverdue && !expense.isPaid && styles.overdueText,
              isDueSoon && !expense.isPaid && styles.dueSoonText
            ]}>
              {formatDate(expense.nextDueDate)}
              {isOverdue && ` (${t('recurring.overdue')})`}
              {isDueSoon && !isOverdue && ` (${daysUntil}d)`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('recurring.frequency')}:</Text>
            <Text style={styles.detailValue}>{expense.frequency}</Text>
          </View>
          {expense.notificationEnabled && (
            <View style={styles.detailRow}>
              <Ionicons name="notifications" size={14} color="#4ecca3" />
              <Text style={styles.detailValue}>
                {t('recurring.reminderAt')} {expense.notificationTime}
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
      <Text style={styles.paidBadgeText}>{t('recurring.paid')}</Text>
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
            <Text style={styles.modalTitle}>{t('recurring.addRecurring')}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>{t('common.name')} *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Rent, Netflix, Gym"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>{t('common.amount')} *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>{t('common.category')} *</Text>
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

            <Text style={styles.inputLabel}>{t('recurring.frequency')}</Text>
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

            <Text style={styles.inputLabel}>{t('recurring.startDate')}</Text>
            <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
              <Ionicons name="calendar-outline" size={20} color="#4ecca3" />
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>{t('recurring.enableNotifications')}</Text>
              <Switch
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                trackColor={{ false: '#3a3a4e', true: '#4ecca3' }}
                thumbColor="#ffffff"
              />
            </View>

            <Text style={styles.inputLabel}>{t('common.description')} ({t('common.optional')})</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('common.additionalNotes')}
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
              <Text style={styles.submitButtonText}>{t('common.add')} {t('recurring.addRecurring')}</Text>
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
          {expense.isPaid ? t('recurring.markUnpaid') : t('recurring.markPaid')}
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
            <Text style={styles.emptyText}>{t('recurring.noExpenses')}</Text>
            <Text style={styles.emptySubtext}>
              {t('recurring.addInstructions')}
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
                <Text style={styles.deleteBtnText}>{t('common.delete')}</Text>
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