import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/categoryService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  getBudget,
  setBudget,
  getCurrentMonth,
  formatMonth,
  CategoryBudget
} from '../services/budgetService';
import { RootStackParamList } from '../types';
import useBudgetManagementStyles from '@/styles/useBudgetManagementStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetManagement'>;

interface CategoryWithBudget {
  category: string;
  icon: string;
  limit: string; // String for TextInput
}

export default function BudgetManagement({ navigation }: Props) {
  const styles = useBudgetManagementStyles();

  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryWithBudget[]>([]);
  const currentMonth = getCurrentMonth();


  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);

      // Get all expense categories
      const expenseCategories = await getCategories(currentUser.uid, 'expense');

      // Get existing budget
      const existingBudget = await getBudget(currentUser.uid, currentMonth);

      // Combine categories with budget data
      const budgetsWithCategories: CategoryWithBudget[] = expenseCategories.map(cat => {
        const existingCategoryBudget = existingBudget?.categoryBudgets.find(
          cb => cb.category === cat.name
        );

        return {
          category: cat.name,
          icon: cat.icon,
          limit: existingCategoryBudget ? existingCategoryBudget.limit.toString() : ''
        };
      });

      setCategoryBudgets(budgetsWithCategories);
    } catch (error) {
      console.error('Error loading budget data:', error);
      Alert.alert('Error', 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryLimit = (category: string, value: string) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');

    setCategoryBudgets(prev =>
      prev.map(item =>
        item.category === category
          ? { ...item, limit: numericValue }
          : item
      )
    );
  };

  const calculateTotal = (): number => {
    return categoryBudgets.reduce((sum, item) => {
      const limit = parseFloat(item.limit) || 0;
      return sum + limit;
    }, 0);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Filter out categories with no budget set and convert to CategoryBudget[]
      const budgetsToSave: CategoryBudget[] = categoryBudgets
        .filter(item => item.limit && parseFloat(item.limit) > 0)
        .map(item => ({
          category: item.category,
          limit: parseFloat(item.limit)
        }));

      if (budgetsToSave.length === 0) {
        Alert.alert('Error', 'Please set at least one category budget');
        return;
      }

      await setBudget(currentUser.uid, currentMonth, budgetsToSave);

      Alert.alert(
        'Success',
        'Budget saved successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const totalBudget = calculateTotal();

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Set Budget</Text>
        <Text style={styles.headerSubtitle}>{formatMonth(currentMonth)}</Text>
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={[styles.saveButtonText, saving && styles.saveButtonDisabled]}>
          {saving ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderTotalBudgetCard = () => (
    <View style={styles.totalCard}>
      <Text style={styles.totalLabel}>Total Monthly Budget</Text>
      <Text style={styles.totalAmount}>${formatCurrency(totalBudget)}</Text>
    </View>
  )

  const renderCategoryBudgets = () => (
    <View style={styles.section}>
      <View style={styles.categoriesList}>
        {categoryBudgets.map((item, index) => (
          <View
            key={item.category}
            style={[
              styles.categoryItem,
              index === categoryBudgets.length - 1 && styles.categoryItemLast
            ]}
          >
            <View style={styles.categoryLeft}>
              <View style={styles.categoryIconContainer}>
                <Text style={styles.categoryIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{item.category}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#a0a0a0"
                value={item.limit}
                onChangeText={(value) => updateCategoryLimit(item.category, value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        ))}
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
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Total Budget Card */}
          {renderTotalBudgetCard()}

          {/* Category Budgets */}
          {renderCategoryBudgets()}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}
