"use client"
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Coins, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import marketDataCache from '@/utils/marketDataCache';

function CryptoMarketWidget({ loading }) {
  const [cryptoData, setCryptoData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const fetchCryptoData = async () => {
    try {
      setIsLoading(true);
      
      // Check cache first - use user-specific cache key
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      const cacheKey = `crypto_data_${userEmail || 'default'}`;
      const cachedCryptoData = marketDataCache.get(cacheKey);
      if (cachedCryptoData) {
        setCryptoData(cachedCryptoData);
        setIsLoading(false);
        return;
      }
      
      // Using CoinGecko API (free tier) - fetching in INR
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=5&page=1&sparkline=false&locale=en');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setCryptoData(data);
        marketDataCache.set(cacheKey, data);
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      // Fallback data if API fails
      const fallbackData = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 3500000, // Approx 35 lakhs INR
          price_change_percentage_24h: 2.5,
          market_cap: 65000000000000 // 65 lakh crores INR
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 210000, // Approx 2.1 lakhs INR
          price_change_percentage_24h: -1.2,
          market_cap: 25000000000000 // 25 lakh crores INR
        }
      ];
      setCryptoData(fallbackData);
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      const cacheKey = `crypto_data_${userEmail || 'default'}`;
      marketDataCache.set(cacheKey, fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    if (percentage === null || percentage === undefined) return '0.00%';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `₹${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `₹${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `₹${(marketCap / 1e6).toFixed(2)}M`;
    }
    return formatCurrency(marketCap);
  };

  if (loading || isLoading) {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Crypto Market</h3>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!cryptoData || cryptoData.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Crypto Market</h3>
          <Link 
            href="/dashboard/investments" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Coins className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No crypto data available</p>
          <p className="text-xs text-gray-400 mt-1">Check back later for live prices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Crypto Market</h3>
        <Link 
          href="/dashboard/investments" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          View All
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {cryptoData.map((crypto) => (
          <div key={crypto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">{crypto.symbol.toUpperCase()}</p>
                <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-1 rounded">
                  {crypto.name}
                </span>
              </div>
              <p className="text-xs text-gray-500">Market Cap: {formatMarketCap(crypto.market_cap)}</p>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-sm">{formatCurrency(crypto.current_price)}</p>
              <div className="flex items-center space-x-1">
                {crypto.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <p className={`text-xs ${crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(crypto.price_change_percentage_24h)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <Link 
          href="/dashboard/investments" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center"
        >
          View Full Crypto Data
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

export default CryptoMarketWidget; 