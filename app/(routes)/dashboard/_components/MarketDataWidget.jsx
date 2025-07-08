"use client"
import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function MarketDataWidget({ marketData, loading }) {
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

  if (loading) {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Market Watch</h3>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!marketData || marketData.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Market Watch</h3>
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
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No market data available</p>
          <p className="text-xs text-gray-400 mt-1">Check back later for live prices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Market Watch</h3>
        <Link 
          href="/dashboard/investments" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          View All
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {marketData.map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">{stock.symbol}</p>
                <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-1 rounded">
                  {stock.exchange}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{stock.name}</p>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-sm">{formatCurrency(stock.price)}</p>
              <div className="flex items-center space-x-1">
                {stock.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <p className={`text-xs ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(stock.changePercent)}
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
          View Full Market Data
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

export default MarketDataWidget; 