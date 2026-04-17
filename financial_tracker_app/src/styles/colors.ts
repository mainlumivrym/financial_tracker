// Color palette for the Financial Tracker app
export interface Colors {
  // Primary colors
  primary: string;
  primaryDark: string;
  // Background colors
  background: string;
  backgroundLight: string;
  backgroundDark: string;
  // Text colors
  text: string;
  textSecondary: string;
  textDark: string;
  // Status colors
  success: string;
  warning: string;
  danger: string;
  info: string;
  // Income/Expense colors
  income: string;
  expense: string;
  // UI Element colors
  border: string;
  borderLight: string;
  divider: string;
  // Recurring expense status colors
  statusDefault: string;
  statusDueSoon: string;
  statusOverdue: string;
  statusPaid: string;
  // Budget colors
  budgetNormal: string;
  budgetWarning: string;
  budgetOver: string;
  // Opacity variants
  overlay: string;
  shadow: string;
  // Transparent
  transparent: string;
}

export const colors: Colors = {
  // Primary colors
  primary: '#4ecca3',        // Main green accent
  primaryDark: '#2a3e3a',    // Dark green background
  
  // Background colors
  background: '#1a1a2e',     // Main dark background
  backgroundLight: '#2a2a3e', // Card/component background
  backgroundDark: '#16162a',  // Darker sections
  
  // Text colors
  text: '#ffffff',           // Primary text (white)
  textSecondary: '#a0a0a0',  // Secondary text (gray)
  textDark: '#1a1a2e',       // Dark text (for light backgrounds)
  
  // Status colors
  success: '#4ecca3',        // Success/positive (green)
  warning: '#ffd93d',        // Warning/caution (yellow)
  danger: '#ff6b6b',         // Error/danger (red)
  info: '#6b9eff',           // Info (blue)
  
  // Income/Expense colors
  income: '#4ecca3',         // Income (green)
  expense: '#ff6b6b',        // Expense (red)
  
  // UI Element colors
  border: '#3a3a4e',         // Border color
  borderLight: '#2a2a3e',    // Lighter border
  divider: '#3a3a4e',        // Divider line
  
  // Recurring expense status colors
  statusDefault: '#3a3a4e',  // Default/regular
  statusDueSoon: '#ffd93d',  // Due soon (yellow)
  statusOverdue: '#ff6b6b',  // Overdue (red)
  statusPaid: '#4ecca3',     // Paid (green)
  
  // Budget colors
  budgetNormal: '#4ecca3',   // Within budget (green)
  budgetWarning: '#ffd93d',  // Approaching limit (yellow)
  budgetOver: '#ff6b6b',     // Over budget (red)
  
  // Opacity variants (for overlays, disabled states, etc.)
  overlay: 'rgba(0, 0, 0, 0.8)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Transparent
  transparent: 'transparent',
};

export default colors;
