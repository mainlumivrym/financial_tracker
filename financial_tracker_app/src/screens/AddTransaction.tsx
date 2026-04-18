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
import useAddTransactionsStyles from '@/styles/useAddTransactionsStyles';
import ScreenHeader from '@/components/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import React from 'react';

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
  const { theme } = useTheme();
  const styles = useAddTransactionsStyles();

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
      // Use imperative API for Android - date only
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        onChange: (event, selectedDate) => {
          if (selectedDate) {
            setDate(selectedDate);
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
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
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
        <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
      </TouchableOpacity>

      {/* iOS only - Android uses imperative API */}
      {Platform.OS === 'ios' && showDatePicker && (
        <>
          <DateTimePicker
            value={date}
            mode="date"
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
                category === cat.name && styles.categoryItemSelected,
                category && category !== cat.name && { opacity: 0.9 }
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
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.highlight} style={styles.checkmark} />
              )}
            </TouchableOpacity>
          ))}
          {/* Add Custom Category Button */}
          <TouchableOpacity
            style={styles.addCategoryItem}
            onPress={() => setShowAddCategoryModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.addCategoryItemText}>Add</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  )

  const renderHeader = () => (
    <ScreenHeader
      title={`Add ${transactionType === 'expense' ? 'Expense' : 'Income'}`}
      onBackPress={() => navigation.goBack()}
      rightButton={{
        text: loading ? 'Saving...' : 'Save',
        onPress: handleSave,
        disabled: loading
      }}
    />
  )

  const renderLeftColumn = () => (
    <ScrollView style={styles.leftColumn} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Amount Input */}
      <View style={styles.amountSection}>
        <Text style={styles.currencySymbol}>$</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          placeholderTextColor="#a0a0a066"
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
  )

  const renderRightColumn = () => (
    <View style={styles.rightColumn}>
      {renderCategoryPicker()}
    </View>
  )

  const renderAddCategoryModal = () => (
    <AddCategoryModal
      visible={showAddCategoryModal}
      onClose={() => setShowAddCategoryModal(false)}
      onAdd={handleAddCategory}
      type={transactionType}
    />
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />

      {/* Header */}
      {renderHeader()}

      <View style={styles.mainContent}>
        {/* Left Column - Input Fields */}
        {renderLeftColumn()}

        {/* Right Column - Categories */}
        {renderRightColumn()}
      </View>

      {/* Add Category Modal */}
      {renderAddCategoryModal()}
    </KeyboardAvoidingView>
  );
}