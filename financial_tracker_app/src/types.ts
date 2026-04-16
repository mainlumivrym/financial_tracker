// User Types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  profilePicture?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// Transaction Types
export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  icon?: string;
  createdAt: any; // Firestore Timestamp
}

// Navigation Types
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  UserInfo: undefined;
  AddTransaction: { type: 'expense' | 'income' };
  FullTransactionList: undefined;
  BudgetManagement: undefined;
  MonthlyReport: { year?: number; month?: number } | undefined;
  YearlyReport: undefined;
};

// Auth Context Types
export interface AuthContextType {
  currentUser: any | null; // Firebase User
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}