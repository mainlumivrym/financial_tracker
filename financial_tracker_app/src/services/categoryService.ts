import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { TransactionType } from '../types';

interface Category {
  id?: string;
  name: string;
  icon: string;
  type: TransactionType;
  isDefault: boolean;
  userId?: string;
  createdAt?: any;
}

interface DefaultCategory {
  name: string;
  icon: string;
  type: TransactionType;
  isDefault: boolean;
}

interface CustomCategoryData {
  name: string;
  icon: string;
  type: TransactionType;
}

// Default categories that will be seeded
const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: 'Food', icon: '🍔', type: 'expense', isDefault: true },
  { name: 'Transport', icon: '🚗', type: 'expense', isDefault: true },
  { name: 'Shopping', icon: '🛍️', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: '🎬', type: 'expense', isDefault: true },
  { name: 'Bills', icon: '📄', type: 'expense', isDefault: true },
  { name: 'Health', icon: '🏥', type: 'expense', isDefault: true },
  { name: 'Other', icon: '📦', type: 'expense', isDefault: true },
];

const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: 'Salary', icon: '💼', type: 'income', isDefault: true },
  { name: 'Freelance', icon: '💻', type: 'income', isDefault: true },
  { name: 'Investment', icon: '📈', type: 'income', isDefault: true },
  { name: 'Gift', icon: '🎁', type: 'income', isDefault: true },
  { name: 'Other', icon: '💰', type: 'income', isDefault: true },
];

/**
 * Get all categories for a specific type (expense or income)
 * Includes both default categories and user-created custom categories
 */
export const getCategories = async (userId: string, type: TransactionType): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    
    // Query for default categories OR user's custom categories
    const q = query(
      categoriesRef,
      where('type', '==', type),
      orderBy('isDefault', 'desc'), // Default categories first
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Include if it's a default category OR if it belongs to this user
      if (data.isDefault || data.userId === userId) {
        categories.push({
          id: doc.id,
          ...data
        });
      }
    });

    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

/**
 * Add a custom category for a user
 */
export const addCustomCategory = async (userId: string, categoryData: CustomCategoryData): Promise<Category> => {
  try {
    const categoriesRef = collection(db, 'categories');
    
    const newCategory = {
      userId,
      name: categoryData.name,
      icon: categoryData.icon,
      type: categoryData.type, // 'expense' or 'income'
      isDefault: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(categoriesRef, newCategory);
    
    return {
      id: docRef.id,
      ...newCategory
    };
  } catch (error) {
    console.error('Error adding custom category:', error);
    throw error;
  }
};

/**
 * Initialize default categories in Firestore
 * This should be called once to seed the database
 */
export const seedDefaultCategories = async (): Promise<void> => {
  try {
    const categoriesRef = collection(db, 'categories');
    
    // Check if default categories already exist
    const q = query(categoriesRef, where('isDefault', '==', true));
    const existingDefaults = await getDocs(q);
    
    if (existingDefaults.empty) {
      // Add default expense categories (no userId for default categories)
      for (const category of DEFAULT_EXPENSE_CATEGORIES) {
        await addDoc(categoriesRef, {
          name: category.name,
          icon: category.icon,
          type: category.type,
          isDefault: true,
          createdAt: Timestamp.now(),
        });
      }
      
      // Add default income categories (no userId for default categories)
      for (const category of DEFAULT_INCOME_CATEGORIES) {
        await addDoc(categoriesRef, {
          name: category.name,
          icon: category.icon,
          type: category.type,
          isDefault: true,
          createdAt: Timestamp.now(),
        });
      }
      
      console.log('Default categories seeded successfully');
    } else {
      console.log('Default categories already exist');
    }
  } catch (error) {
    console.error('Error seeding default categories:', error);
    throw error;
  }
};
