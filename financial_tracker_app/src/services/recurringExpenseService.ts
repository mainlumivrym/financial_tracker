import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: any; // Firestore Timestamp
  nextDueDate: any; // Firestore Timestamp
  notificationEnabled: boolean;
  notificationTime?: string; // Format: "HH:MM"
  description?: string;
  isPaid: boolean;
  lastPaidDate?: any; // Firestore Timestamp
  paidMonth?: string; // Format: "YYYY-MM" to track which month was paid
  createdAt: any;
  updatedAt: any;
}

export const addRecurringExpense = async (
  userId: string,
  name: string,
  amount: number,
  category: string,
  frequency: RecurringFrequency,
  startDate: Date,
  notificationEnabled: boolean = true,
  notificationTime: string = '09:00',
  description?: string
): Promise<string> => {
  try {
    const nextDueDate = calculateNextDueDate(startDate, frequency);
    
    const recurringExpenseData = {
      userId,
      name,
      amount,
      category,
      frequency,
      startDate: Timestamp.fromDate(startDate),
      nextDueDate: Timestamp.fromDate(nextDueDate),
      notificationEnabled,
      notificationTime,
      description: description || '',
      isPaid: false,
      paidMonth: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'recurringExpenses'), recurringExpenseData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding recurring expense:', error);
    throw error;
  }
};

export const getUserRecurringExpenses = async (userId: string): Promise<RecurringExpense[]> => {
  try {
    const q = query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', userId),
      orderBy('nextDueDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const expenses: RecurringExpense[] = [];
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const expense = {
        id: doc.id,
        ...data,
      } as RecurringExpense;
      
      // Auto-reset paid status if it's a new month
      if (expense.isPaid && expense.paidMonth !== currentMonth) {
        expense.isPaid = false;
        // Update in background (don't await to keep response fast)
        updateRecurringExpense(doc.id, { isPaid: false }).catch(err => 
          console.error('Error auto-resetting paid status:', err)
        );
      }
      
      expenses.push(expense);
    });

    return expenses;
  } catch (error) {
    console.error('Error getting recurring expenses:', error);
    throw error;
  }
};

export const updateRecurringExpense = async (
  expenseId: string,
  updates: Partial<Omit<RecurringExpense, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const expenseRef = doc(db, 'recurringExpenses', expenseId);
    
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert Date objects to Timestamps if present
    if (updates.startDate instanceof Date) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.nextDueDate instanceof Date) {
      updateData.nextDueDate = Timestamp.fromDate(updates.nextDueDate);
    }

    await updateDoc(expenseRef, updateData);
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    throw error;
  }
};

export const deleteRecurringExpense = async (expenseId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'recurringExpenses', expenseId));
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    throw error;
  }
};

export const markAsPaid = async (expenseId: string, frequency: RecurringFrequency): Promise<void> => {
  try {
    const now = new Date();
    const nextDueDate = calculateNextDueDate(now, frequency);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    await updateRecurringExpense(expenseId, {
      nextDueDate: nextDueDate,
      isPaid: true,
      lastPaidDate: now,
      paidMonth: currentMonth,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking as paid:', error);
    throw error;
  }
};

export const markAsUnpaid = async (expenseId: string): Promise<void> => {
  try {
    await updateRecurringExpense(expenseId, {
      isPaid: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking as unpaid:', error);
    throw error;
  }
};

// Helper function to calculate next due date based on frequency
export const calculateNextDueDate = (currentDate: Date, frequency: RecurringFrequency): Date => {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
};

// Get recurring expenses due soon (within next 3 days)
export const getUpcomingRecurringExpenses = async (userId: string): Promise<RecurringExpense[]> => {
  try {
    const allExpenses = await getUserRecurringExpenses(userId);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    return allExpenses.filter(expense => {
      const dueDate = expense.nextDueDate?.toDate?.() || new Date(expense.nextDueDate);
      return dueDate <= threeDaysFromNow;
    });
  } catch (error) {
    console.error('Error getting upcoming recurring expenses:', error);
    throw error;
  }
};
