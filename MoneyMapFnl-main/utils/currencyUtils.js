import { db } from './dbConfig';
import { Currencies } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Fetches all available currencies from the database
 * @returns {Promise<Array>} Array of currency objects
 */
export async function getAllCurrencies() {
  try {
    const currencies = await db.select().from(Currencies);
    return currencies || [];
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }
}

/**
 * Gets the user's base currency
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} The base currency code (defaults to INR if not found)
 */
export async function getUserBaseCurrency(userEmail) {
  try {
    const result = await db.query.UserSettings.findFirst({
      where: eq(UserSettings.userId, userEmail),
    });
    return result?.baseCurrency || 'INR';
  } catch (error) {
    console.error('Error fetching user base currency:', error);
    return 'INR';
  }
}

/**
 * Converts an amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - The source currency code
 * @param {string} toCurrency - The target currency code
 * @returns {Promise<number>} The converted amount
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;

  try {
    const currencies = await getAllCurrencies();
    
    // Find exchange rates
    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
    
    // Convert: first to base currency, then to target currency
    const convertedAmount = (amount / fromRate) * toRate;
    
    // Round to 2 decimal places
    return Math.round(convertedAmount * 100) / 100;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
}

/**
 * Formats a monetary amount with appropriate currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code
 * @returns {Promise<string>} Formatted amount with currency symbol
 */
export async function formatCurrency(amount, currencyCode = 'INR') {
  try {
    const currencies = await getAllCurrencies();
    const currency = currencies.find(c => c.code === currencyCode);
    
    if (!currency) {
      return new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: 'INR' 
      }).format(amount);
    }
    
    // Format based on currency code
    return `${currency.symbol}${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `₹${amount.toFixed(2)}`;
  }
}

/**
 * Client-side currency formatter (synchronous, for display purposes)
 * @param {number} amount - The amount to format
 * @param {string} currencySymbol - The currency symbol
 * @returns {string} Formatted amount with currency symbol
 */
export function formatCurrencyClient(amount, currencySymbol = '₹') {
  return `${currencySymbol}${Number(amount).toFixed(2)}`;
} 