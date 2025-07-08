// Real-time market data service for stocks and mutual funds
// import { apiCache } from './investmentErrorHandler.jsx';

// Free APIs for real market data
const API_ENDPOINTS = {
  // Indian Stocks - NSE/BSE
  STOCKS: {
    NSE: 'https://api.nseindia.com/api/quote-equity',
    BSE: 'https://api.bseindia.com/BseIndiaAPI/api/ProduceCSVForWeb',
    YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart'
  },
  // Indian Mutual Funds
  MUTUAL_FUNDS: {
    AMFI: 'https://www.amfiindia.com/spages/NAVAll.txt',
    MONEY_CONTROL: 'https://www.moneycontrol.com/mutual-funds/nav',
    ZYLA_LABS: 'https://api.zylalabs.com/api/v1.2/mutual-funds/nav'
  }
};

// Popular Indian stocks for demo
const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', exchange: 'NSE' }
];

// Popular Indian Mutual Funds for demo
const POPULAR_MUTUAL_FUNDS = [
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap' }
];

// Real Indian Mutual Fund Schemes
const REAL_MUTUAL_FUNDS = [
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
  { code: '120010', name: 'SBI Bluechip Fund Direct Growth', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' }
];

class RealMarketDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get stock price using Yahoo Finance API (free, no key required)
  async getStockPrice(symbol) {
    const cacheKey = `stock_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.STOCKS.YAHOO_FINANCE}/${symbol}.NS?interval=1d&range=1d`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart.result[0];
      
      if (!result || !result.meta) {
        throw new Error('Invalid stock data received');
      }

      const stockData = {
        symbol: symbol,
        price: result.meta.regularMarketPrice || 0,
        change: (result.meta.regularMarketPrice || 0) - (result.meta.previousClose || 0),
        changePercent: result.meta.previousClose ? 
          (((result.meta.regularMarketPrice || 0) - (result.meta.previousClose || 0)) / result.meta.previousClose) * 100 : 0,
        volume: result.meta.regularMarketVolume || 0,
        high: result.meta.regularMarketDayHigh || 0,
        low: result.meta.regularMarketDayLow || 0,
        open: result.meta.regularMarketOpen || 0,
        previousClose: result.meta.previousClose || 0,
        exchange: 'NSE',
        timestamp: new Date(),
        source: 'yahoo_finance'
      };

      this.setCachedData(cacheKey, stockData);
      return stockData;
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      // Return null if API fails
      return null;
    }
  }

  // Get mutual fund NAV using AMFI API (free, no key required)
  async getMutualFundNAV(schemeCode) {
    const cacheKey = `mf_${schemeCode}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // AMFI provides NAV data in text format
      const response = await fetch(API_ENDPOINTS.MUTUAL_FUNDS.AMFI);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch NAV data: ${response.status}`);
      }

      const text = await response.text();
      const lines = text.split('\n');
      
      // Parse AMFI NAV data
      for (const line of lines) {
        if (line.includes(schemeCode)) {
          const parts = line.split(';');
          if (parts.length >= 4) {
                                  const navData = {
              code: schemeCode,
              nav: parseFloat(parts[3]) || 0,
              date: new Date(parts[2]) || new Date(),
              name: parts[1] || `Fund ${schemeCode}`,
              fundHouse: parts[0] || 'Unknown Fund House',
              category: 'Large Cap',
              timestamp: new Date(),
              source: 'amfi'
            };
            
            this.setCachedData(cacheKey, navData);
            return navData;
          }
        }
      }
      
      throw new Error('Scheme not found in NAV data');
    } catch (error) {
      console.error(`Error fetching NAV for scheme ${schemeCode}:`, error);
      // Return null if API fails
      return null;
    }
  }

  // Get popular stocks with real data
  async getPopularStocks() {
    const stocks = [];
    
    for (const stock of POPULAR_STOCKS) {
      try {
        const data = await this.getStockPrice(stock.symbol);
        if (data) {
          stocks.push({
            ...stock,
            ...data
          });
        }
      } catch (error) {
        console.error(`Error fetching ${stock.symbol}:`, error);
        // Skip stocks that can't be fetched
      }
    }
    
    return stocks;
  }

  // Get popular mutual funds with real data
  async getPopularMutualFunds() {
    const funds = [];
    
    for (const fund of REAL_MUTUAL_FUNDS) {
      try {
        const data = await this.getMutualFundNAV(fund.code);
        if (data) {
          funds.push({
            ...fund,
            ...data
          });
        }
      } catch (error) {
        console.error(`Error fetching ${fund.code}:`, error);
        // Skip funds that can't be fetched
      }
    }
    
    return funds;
  }

  // Return null when real data is not available
  getMockStockData(symbol) {
    return null;
  }

  getMockMutualFundData(schemeCode) {
    return null;
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Search stocks
  async searchStocks(query) {
    const stocks = await this.getPopularStocks();
    return stocks.filter(stock => 
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Search mutual funds
  async searchMutualFunds(query) {
    const funds = await this.getPopularMutualFunds();
    return funds.filter(fund => 
      fund.name.toLowerCase().includes(query.toLowerCase()) ||
      fund.code.includes(query)
    );
  }
}

export default RealMarketDataService; 