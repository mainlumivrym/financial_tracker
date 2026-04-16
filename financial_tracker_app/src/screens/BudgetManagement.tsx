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
import { 
  getBudget, 
  setBudget, 
  getCurrentMonth, 
  formatMonth,
  CategoryBudget 
} from '../services/budgetService';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetManagement'>;

interface CategoryWithBudget {
  category: string;
  icon: string;
  limit: string; // String for TextInput
}

export default function BudgetManagement({ navigation }: Props) {
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ecca3" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Total Budget Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Monthly Budget</Text>
            <Text style={styles.totalAmount}>${totalBudget.toFixed(2)}</Text>
          </View>

          {/* Category Budgets */}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 2,
  },
  saveButton: {
    width: 70,
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#4ecca3',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  totalCard: {
    backgroundColor: '#4ecca3',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1a1a2e',
    opacity: 0.8,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 8,
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
  categoriesList: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a4e',
  },
  categoryItemLast: {
    borderBottomWidth: 0,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3a3a4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#4ecca3',
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
