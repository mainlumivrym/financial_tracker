import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TransactionType } from '../types';

const TRANSACTIONS_COLLECTION = 'transactions';

interface Transaction {
  id?: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  icon: string;
  date: Timestamp;
  createdAt: Timestamp;
}

interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  icon: string;
  date: Date | Timestamp;
}

// Add a new transaction
export const addTransaction = async (userId: string, transactionData: TransactionInput): Promise<Transaction> => {
  try {
    // Convert date to Timestamp if it's a Date object
    const dataToSave = {
      userId,
      ...transactionData,
      date: transactionData.date instanceof Date 
        ? Timestamp.fromDate(transactionData.date) 
        : transactionData.date,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), dataToSave);
    return { id: docRef.id, ...transactionData };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// Get all transactions for a user
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

// Update a transaction
export const updateTransaction = async (transactionId: string, updates: Partial<TransactionInput>): Promise<{ id: string } & Partial<TransactionInput>> => {
  try {
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await updateDoc(transactionRef, updates);
    return { id: transactionId, ...updates };
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (transactionId: string): Promise<string> => {
  try {
    await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, transactionId));
    return transactionId;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Get transactions for a specific date range
export const getTransactionsByDateRange = async (userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions by date range:', error);
    throw error;
  }
};
