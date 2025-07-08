"use client"
import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Percent, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function InvestmentSummary({ portfolioData, loading }) {
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
          <h2 className="font-bold text-lg">Investment Portfolio</h2>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!portfolioData || !portfolioData.totals) {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Investment Portfolio</h2>
          <Link 
            href="/dashboard/investments" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">No Investments Yet</h3>
          <p className="text-xs text-gray-500 mb-3">Start building your investment portfolio</p>
          <Link 
            href="/dashboard/investments" 
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Add Investment
          </Link>
        </div>
      </div>
    );
  }

  const { totals, portfolio } = portfolioData;

  return (
    <div className="p-6 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Investment Portfolio</h2>
        <Link 
          href="/dashboard/investments" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          View All
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Invested */}
        <div className="p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Invested</p>
              <p className="text-sm font-bold">{formatCurrency(totals.totalInvested)}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Current Value */}
        <div className="p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current Value</p>
              <p className="text-sm font-bold">{formatCurrency(totals.currentValue)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <BarChart3 className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className="p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Profit/Loss</p>
              <p className={`text-sm font-bold ${totals.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.profitLoss)}
              </p>
            </div>
            <div className={`p-2 rounded-full ${totals.profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totals.profitLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Return Percentage */}
        <div className="p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Return %</p>
              <p className={`text-sm font-bold ${totals.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(totals.profitLossPercentage)}
              </p>
            </div>
            <div className={`p-2 rounded-full ${totals.profitLossPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Percent className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Portfolio Preview */}
      {portfolio && portfolio.length > 0 && (
        <div className="border-t pt-3">
          <h3 className="font-semibold text-sm mb-2">Recent Holdings</h3>
          <div className="space-y-2">
            {portfolio.slice(0, 2).map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                <div>
                  <p className="font-medium">{investment.symbol || investment.code}</p>
                  <p className="text-gray-500 truncate">{investment.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(investment.currentValue)}</p>
                  <p className={`${investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(investment.profitLossPercentage)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentSummary; 