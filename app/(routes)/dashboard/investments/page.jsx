"use client"
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { TrendingUp, TrendingDown, Plus, BarChart3, Search, RefreshCw, Coins } from 'lucide-react';
import InvestmentPortfolio from './_components/InvestmentPortfolio';
import AddInvestment from './_components/AddInvestment';
import InvestmentChart from './_components/InvestmentChart';
import MarketDataDisplay from './_components/MarketDataDisplay';
import CryptoMarketWidget from '../_components/CryptoMarketWidget';

function InvestmentsScreen() {
  const { user } = useUser();
  const [portfolio, setPortfolio] = useState([]);
  const [totals, setTotals] = useState({
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio', 'market', 'crypto', 'discover'

  // Handle tab parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['portfolio', 'market', 'crypto', 'discover'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/investments/portfolio');
      const data = await response.json();
      
      if (response.ok) {
        setPortfolio(data.portfolio);
        setTotals(data.totals);
      } else {
        console.error('Error fetching portfolio:', data.error);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    if (percentage === null || percentage === undefined) return '0.00%';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-3xl">My Investments</h2>
        <AddInvestment onInvestmentAdded={fetchPortfolio} />
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Invested</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.totalInvested)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart3 className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Current Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.currentValue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Profit/Loss</p>
              <p className={`text-2xl font-bold ${totals.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totals.profitLoss)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${totals.profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totals.profitLoss >= 0 ? (
                <TrendingUp className="text-green-600" />
              ) : (
                <TrendingDown className="text-red-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Return %</p>
              <p className={`text-2xl font-bold ${totals.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(totals.profitLossPercentage)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${totals.profitLossPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totals.profitLossPercentage >= 0 ? (
                <TrendingUp className="text-green-600" />
              ) : (
                <TrendingDown className="text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'portfolio'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Portfolio
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'market'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Stock Market
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'crypto'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Crypto Market
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Discover
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'portfolio' && (
        <>
          {/* Portfolio Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
            <InvestmentChart portfolio={portfolio} />
          </div>

          {/* Investment Portfolio */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Investment Holdings</h3>
            <InvestmentPortfolio 
              portfolio={portfolio} 
              onPortfolioUpdate={fetchPortfolio}
            />
          </div>
        </>
      )}

      {activeTab === 'market' && (
        <MarketDataDisplay />
      )}

      {activeTab === 'crypto' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Crypto Market Data</h3>
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-500">Live prices from CoinGecko</span>
            </div>
          </div>
          <CryptoMarketWidget loading={false} />
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Investment Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Popular Stocks</h4>
              <p className="text-gray-600 mb-4">Track top-performing Indian stocks with real-time data</p>
              <button 
                onClick={() => setActiveTab('market')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                View Stocks
              </button>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Mutual Funds</h4>
              <p className="text-gray-600 mb-4">Explore SIP opportunities with NAV tracking</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                View Funds
              </button>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Cryptocurrencies</h4>
              <p className="text-gray-600 mb-4">Monitor crypto prices and market trends</p>
              <button 
                onClick={() => setActiveTab('crypto')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
              >
                View Crypto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentsScreen; 