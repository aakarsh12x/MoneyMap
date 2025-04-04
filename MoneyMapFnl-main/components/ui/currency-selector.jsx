"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { getAllCurrencies } from '@/utils/currencyUtils';

/**
 * CurrencySelector - A reusable component for selecting currencies
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected currency code
 * @param {Function} props.onChange - Handler called when selection changes
 * @param {string} props.placeholder - Placeholder text when no value is selected
 * @param {boolean} props.disabled - Whether the selector is disabled
 */
export function CurrencySelector({ 
  value, 
  onChange, 
  placeholder = "Select currency", 
  disabled = false 
}) {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadCurrencies() {
      try {
        setLoading(true);
        const currencyData = await getAllCurrencies();
        setCurrencies(currencyData);
      } catch (error) {
        console.error('Error loading currencies:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCurrencies();
  }, []);
  
  return (
    <Select 
      value={value} 
      onValueChange={onChange} 
      disabled={disabled || loading}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem 
            key={currency.code} 
            value={currency.code}
          >
            <div className="flex items-center">
              <span className="mr-2">{currency.symbol}</span>
              <span>{currency.code}</span>
              <span className="ml-2 text-gray-500 text-xs">- {currency.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 