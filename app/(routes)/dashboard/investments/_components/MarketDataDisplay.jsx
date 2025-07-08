"use client"
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, Star, Eye, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import marketDataCache from '@/utils/marketDataCache';

function MarketDataDisplay() {
  const [stocks, setStocks] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('stocks');
  const [selectedItem, setSelectedItem] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedStocks = marketDataCache.get('stocks');
        const cachedFunds = marketDataCache.get('mutual_funds');
        
        if (cachedStocks && cachedFunds) {
          setStocks(cachedStocks);
          setMutualFunds(cachedFunds);
          setLastRefresh(new Date());
          setLoading(false);
          return;
        }
      }
      
      // Fetch stocks
      const stocksResponse = await fetch('/api/market-data?type=stocks');
      const stocksData = await stocksResponse.json();
      
      // Fetch mutual funds
      const fundsResponse = await fetch('/api/market-data?type=mutual_funds');
      const fundsData = await fundsResponse.json();
      
      if (stocksData.success) {
        setStocks(stocksData.data);
        marketDataCache.set('stocks', stocksData.data);
      }
      
      if (fundsData.success) {
        setMutualFunds(fundsData.data);
        marketDataCache.set('mutual_funds', fundsData.data);
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // Clear cache and force refresh
    marketDataCache.clearKey('stocks');
    marketDataCache.clearKey('mutual_funds');
    fetchMarketData(true);
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

  const formatVolume = (volume) => {
    if (volume === null || volume === undefined) return '0';
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getChangeColor = (change) => {
    if (change === null || change === undefined) return 'text-gray-600';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change) => {
    if (change === null || change === undefined) return null;
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFunds = mutualFunds.filter(fund =>
    fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fund.code.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Live Market Data</h3>
          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search stocks or mutual funds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stocks'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Stocks ({filteredStocks.length})
        </button>
        <button
          onClick={() => setActiveTab('mutual_funds')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'mutual_funds'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mutual Funds ({filteredFunds.length})
        </button>
      </div>

      {/* Stocks Tab */}
      {activeTab === 'stocks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => (
            <div key={stock.symbol} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{stock.symbol}</h4>
                  <p className="text-sm text-gray-600">{stock.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{stock.name} ({stock.symbol})</DialogTitle>
                      </DialogHeader>
                      <StockDetails stock={stock} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold">{formatCurrency(stock.price)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Change</span>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(stock.change)}
                    <span className={`font-medium ${getChangeColor(stock.change)}`}>
                      {formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Volume</span>
                  <span className="text-sm">{formatVolume(stock.volume)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mutual Funds Tab */}
      {activeTab === 'mutual_funds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFunds.map((fund) => (
            <div key={fund.code} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{fund.code}</h4>
                  <p className="text-sm text-gray-600">{fund.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{fund.name} ({fund.code})</DialogTitle>
                      </DialogHeader>
                      <MutualFundDetails fund={fund} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">NAV</span>
                  <span className="font-semibold">{formatCurrency(fund.nav)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Change</span>
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(fund.change)}
                    <span className={`font-medium ${getChangeColor(fund.change)}`}>
                      {formatCurrency(fund.change)} ({formatPercentage(fund.changePercent)})
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category</span>
                  <span className="text-sm">{fund.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stock Details Component
function StockDetails({ stock }) {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Current Price</h4>
          <p className="text-lg font-bold">{formatCurrency(stock.price)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Change</h4>
          <p className={`text-lg font-bold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Open</h4>
          <p className="text-sm">{formatCurrency(stock.open)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Previous Close</h4>
          <p className="text-sm">{formatCurrency(stock.previousClose)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">High</h4>
          <p className="text-sm">{formatCurrency(stock.high)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Low</h4>
          <p className="text-sm">{formatCurrency(stock.low)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Volume</h4>
          <p className="text-sm">{stock.volume?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Exchange</h4>
          <p className="text-sm">{stock.exchange}</p>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500">
          Data source: {stock.source} • Last updated: {new Date(stock.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Mutual Fund Details Component
function MutualFundDetails({ fund }) {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-500">NAV</h4>
          <p className="text-lg font-bold">{formatCurrency(fund.nav)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Scheme Code</h4>
          <p className="text-sm">{fund.code}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Category</h4>
          <p className="text-sm">{fund.category}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Fund House</h4>
          <p className="text-sm">{fund.fundHouse}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">NAV Date</h4>
          <p className="text-sm">{new Date(fund.date).toLocaleDateString()}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Scheme Type</h4>
          <p className="text-sm">Direct Growth</p>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500">
          Data source: {fund.source} • Last updated: {new Date(fund.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default MarketDataDisplay; 