import { 
  collection, 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const BUDGETS_COLLECTION = 'budgets';

export interface CategoryBudget {
  category: string;
  limit: number;
}

export interface Budget {
  userId: string;
  month: string; // Format: "YYYY-MM" (e.g., "2026-04")
  categoryBudgets: CategoryBudget[];
  totalBudget: number;
  createdAt: any;
  updatedAt: any;
}

/**
 * Get budget for a specific user and month
 */
export const getBudget = async (userId: string, month: string): Promise<Budget | null> => {
  try {
    const budgetId = `${userId}_${month}`;
    const budgetRef = doc(db, BUDGETS_COLLECTION, budgetId);
    const budgetDoc = await getDoc(budgetRef);
    
    if (budgetDoc.exists()) {
      return budgetDoc.data() as Budget;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting budget:', error);
    throw error;
  }
};

/**
 * Set or update budget for a specific month
 */
export const setBudget = async (
  userId: string, 
  month: string, 
  categoryBudgets: CategoryBudget[]
): Promise<Budget> => {
  try {
    const budgetId = `${userId}_${month}`;
    const budgetRef = doc(db, BUDGETS_COLLECTION, budgetId);
    
    // Calculate total budget
    const totalBudget = categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0);
    
    // Check if budget exists
    const existingBudget = await getDoc(budgetRef);
    
    const budgetData: Budget = {
      userId,
      month,
      categoryBudgets,
      totalBudget,
      createdAt: existingBudget.exists() 
        ? existingBudget.data().createdAt 
        : Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(budgetRef, budgetData);
    
    return budgetData;
  } catch (error) {
    console.error('Error setting budget:', error);
    throw error;
  }
};

/**
 * Update specific category budget
 */
export const updateCategoryBudget = async (
  userId: string,
  month: string,
  category: string,
  limit: number
): Promise<void> => {
  try {
    const budgetId = `${userId}_${month}`;
    const budgetRef = doc(db, BUDGETS_COLLECTION, budgetId);
    const budgetDoc = await getDoc(budgetRef);
    
    if (!budgetDoc.exists()) {
      throw new Error('Budget not found');
    }
    
    const budget = budgetDoc.data() as Budget;
    const categoryIndex = budget.categoryBudgets.findIndex(cb => cb.category === category);
    
    if (categoryIndex >= 0) {
      budget.categoryBudgets[categoryIndex].limit = limit;
    } else {
      budget.categoryBudgets.push({ category, limit });
    }
    
    // Recalculate total
    const totalBudget = budget.categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0);
    
    await updateDoc(budgetRef, {
      categoryBudgets: budget.categoryBudgets,
      totalBudget,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating category budget:', error);
    throw error;
  }
};

/**
 * Get current month in YYYY-MM format
 */
export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Format month string to readable format
 */
export const formatMonth = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};
