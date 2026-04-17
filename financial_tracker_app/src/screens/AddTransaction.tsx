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
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { addTransaction } from '../services/transactionService';
import { getCategories, addCustomCategory } from '../services/categoryService';
import { RootStackParamList, TransactionType } from '../types';
import AddCategoryModal from '../components/AddCategoryModal';

interface Category {
  id?: string;
  name: string;
  icon: string;
  type?: string;
  isDefault?: boolean;
  userId?: string;
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Load categories from Firebase
  useEffect(() => {
    loadCategories();
  }, [transactionType]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await getCategories(currentUser.uid, transactionType);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat.name);
    setSelectedIcon(cat.icon);
  };

  const handleAddCategory = async (categoryData: { name: string; icon: string; type: string }) => {
    try {
      const newCategory = await addCustomCategory(currentUser.uid, categoryData);
      setCategories([...categories, newCategory]);
      setShowAddCategoryModal(false);
      Alert.alert('Success', 'Custom category added!');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const showDateTimePicker = () => {
    if (Platform.OS === 'android') {
      // Use imperative API for Android
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (selectedDate) {
            // After date is selected, show time picker
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: (timeEvent, selectedTime) => {
                if (selectedTime) {
                  setDate(selectedTime);
                }
              },
            });
          }
        },
      });
    } else {
      // Use component for iOS
      setShowDatePicker(true);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // iOS only - update date immediately as user scrolls
    if (selectedDate) {
      setDate(selectedDate);
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
        onPress={showDateTimePicker}
      >
        <Ionicons name="calendar-outline" size={20} color="#4ecca3" />
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
      </TouchableOpacity>
      
      {/* iOS only - Android uses imperative API */}
      {Platform.OS === 'ios' && showDatePicker && (
        <>
          <DateTimePicker
            value={date}
            mode="datetime"
            display="spinner"
            onChange={onDateChange}
            textColor="#ffffff"
          />
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )

  const renderCategoryPicker = () => (
    <ScrollView 
      style={styles.categoriesScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.categoriesScrollContent}
    >
      {loadingCategories ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id || cat.name}
              style={[
                styles.categoryItem,
                category === cat.name && styles.categoryItemSelected
              ]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text style={styles.categoryItemIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryItemText,
                category === cat.name && styles.categoryItemTextSelected
              ]}>
                {cat.name}
              </Text>
              {category === cat.name && (
                <Ionicons name="checkmark-circle" size={20} color="#4ecca3" style={styles.checkmark} />
              )}
            </TouchableOpacity>
          ))}
          {/* Add Custom Category Button */}
          <TouchableOpacity
            style={styles.addCategoryItem}
            onPress={() => setShowAddCategoryModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4ecca3" />
            <Text style={styles.addCategoryItemText}>Add</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  )

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
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

      <View style={styles.mainContent}>
        {/* Left Column - Input Fields */}
        <ScrollView style={styles.leftColumn} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="What was this for?"
              placeholderTextColor="#a0a0a0"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Right Column - Categories */}
        <View style={styles.rightColumn}>
          {renderCategoryPicker()}
        </View>
      </View>

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onAdd={handleAddCategory}
        type={transactionType}
      />
    </KeyboardAvoidingView>
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rightColumn: {
    width: 132,
    backgroundColor: '#16162a',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#2a2a3e',
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0a0',
    marginBottom: 12,
    textAlign: 'center',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4ecca3',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    minWidth: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  categoriesScroll: {
    flex: 1,
  },
  categoriesScrollContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  categoryItemSelected: {
    borderColor: '#4ecca3',
    backgroundColor: '#2a3e3a',
  },
  categoryItemIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  categoryItemText: {
    fontSize: 11,
    color: '#a0a0a0',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryItemTextSelected: {
    color: '#4ecca3',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  addCategoryItem: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: '#4ecca3',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  addCategoryItemText: {
    fontSize: 11,
    color: '#4ecca3',
    fontWeight: '600',
  },
  loadingText: {
    color: '#a0a0a0',
    fontSize: 14,
    padding: 16,
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
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
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
    padding: 14,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a4e',
    minHeight: 110,
    textAlignVertical: 'top',
  },
  bottomSpacer: {
    height: 20,
  },
});
