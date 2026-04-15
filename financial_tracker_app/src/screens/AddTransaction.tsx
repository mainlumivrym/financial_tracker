import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { addTransaction } from '../services/transactionService';
import { RootStackParamList, TransactionType } from '../types';

interface Category {
  name: string;
  icon: string;
}

const EXPENSE_CATEGORIES: Category[] = [
  { name: 'Food', icon: '🍔' },
  { name: 'Transport', icon: '🚗' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Bills', icon: '📄' },
  { name: 'Health', icon: '🏥' },
  { name: 'Other', icon: '📦' },
];

const INCOME_CATEGORIES: Category[] = [
  { name: 'Salary', icon: '💼' },
  { name: 'Freelance', icon: '💻' },
  { name: 'Investment', icon: '📈' },
  { name: 'Gift', icon: '🎁' },
  { name: 'Other', icon: '💰' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export default function AddTransaction({ navigation, route }: Props) {
  const { currentUser } = useAuth();
  const transactionType: TransactionType = route?.params?.type || 'expense';

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat.name);
    setSelectedIcon(cat.icon);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const { type } = event;

    // On dismiss (cancel or neutral button), just hide picker
    if (type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    // On set (OK button), update date and hide picker
    if (type === 'set' && selectedDate) {
      setDate(selectedDate);
      setShowDatePicker(false);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const handleSave = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setLoading(true);

      await addTransaction(currentUser.uid, {
        type: transactionType,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        icon: selectedIcon,
        date: date
      });

      Alert.alert(
        'Success',
        `${transactionType === 'expense' ? 'Expense' : 'Income'} added successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const renderDatePicker = () => (
    <View style={styles.section}>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#4ecca3" />
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
      </TouchableOpacity>
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="datetime"
          is24Hour={false}
          display="default"
          onChange={onDateChange}
        />
      )}
      {showDatePicker && Platform.OS === 'ios' && (
        <View>
          <DateTimePicker
            value={date}
            mode="datetime"
            is24Hour={false}
            display="spinner"
            onChange={onDateChange}
          />
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  const renderCategoryPicker = () => (
    <View style={styles.section}>

      <View style={styles.categoriesGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.categoryButton,
              category === cat.name && styles.categoryButtonSelected
            ]}
            onPress={() => handleCategorySelect(cat)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[
              styles.categoryText,
              category === cat.name && styles.categoryTextSelected
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

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
        <Text style={styles.headerTitle}>
          Add {transactionType === 'expense' ? 'Expense' : 'Income'}
        </Text>
        <TouchableOpacity
          style={styles.saveHeaderButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[
            styles.saveHeaderButtonText,
            loading && styles.saveHeaderButtonDisabled
          ]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#a0a0a0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Date & Time */}
        {renderDatePicker()}

        {/* Category Selection */}
        {renderCategoryPicker()}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="What was this for?"
            placeholderTextColor="#a0a0a0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveHeaderButton: {
    padding: 8,
  },
  saveHeaderButtonText: {
    fontSize: 16,
    color: '#4ecca3',
    fontWeight: '600',
  },
  saveHeaderButtonDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4ecca3',
    marginRight: 10,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
    minWidth: 150,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '30%',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: '#4ecca3',
    backgroundColor: '#2a3e3a',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#4ecca3',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  doneButton: {
    backgroundColor: '#4ecca3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a4e',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bottomSpacer: {
    height: 40,
  },
});
