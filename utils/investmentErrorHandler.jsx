// Error handling utilities for investment operations

export class InvestmentError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'InvestmentError';
    this.code = code;
    this.details = details;
  }
}

export class RateLimitError extends InvestmentError {
  constructor(service, retryAfter) {
    super(`Rate limit exceeded for ${service}`, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

export class APIError extends InvestmentError {
  constructor(message, statusCode, service) {
    super(message, 'API_ERROR');
    this.statusCode = statusCode;
    this.service = service;
  }
}

export class DataValidationError extends InvestmentError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR');
    this.field = field;
  }
}

// Retry mechanism for API calls
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      if (error instanceof RateLimitError) {
        // Wait for the specified retry time
        await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
      } else if (error instanceof APIError && error.statusCode >= 500) {
        // Exponential backoff for server errors
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Don't retry for client errors (4xx)
        throw error;
      }
    }
  }
}

// Data validation utilities
export function validateStockSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    throw new DataValidationError('Stock symbol is required', 'symbol');
  }
  
  if (symbol.length < 1 || symbol.length > 10) {
    throw new DataValidationError('Stock symbol must be between 1 and 10 characters', 'symbol');
  }
  
  return symbol.toUpperCase();
}

export function validateMutualFundCode(code) {
  if (!code || typeof code !== 'string') {
    throw new DataValidationError('Mutual fund code is required', 'code');
  }
  
  if (!/^\d{6}$/.test(code)) {
    throw new DataValidationError('Mutual fund code must be 6 digits', 'code');
  }
  
  return code;
}

export function validateQuantity(quantity) {
  const num = parseFloat(quantity);
  if (isNaN(num) || num <= 0) {
    throw new DataValidationError('Quantity must be a positive number', 'quantity');
  }
  return num;
}

export function validatePrice(price) {
  const num = parseFloat(price);
  if (isNaN(num) || num < 0) {
    throw new DataValidationError('Price must be a non-negative number', 'price');
  }
  return num;
}

// Cache management for API responses
class APICache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes default TTL
  }

  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// Logging utility for investment operations
export function logInvestmentOperation(operation, details, success = true) {
  const timestamp = new Date().toISOString();
  const level = success ? 'INFO' : 'ERROR';
  
  console.log(`[${timestamp}] [${level}] Investment ${operation}:`, {
    ...details,
    success,
    timestamp
  });
}

// Error response formatter
export function formatErrorResponse(error) {
  if (error instanceof InvestmentError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };
} 