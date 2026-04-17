/**
 * Format a number as currency with comma separators
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "1,234.56")
 */
export const formatCurrency = (amount: number, decimals: number = 2): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a number as currency with dollar sign and comma separators
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with dollar sign (e.g., "$1,234.56")
 */
export const formatCurrencyWithSymbol = (amount: number, decimals: number = 2): string => {
  return `$${formatCurrency(amount, decimals)}`;
};
