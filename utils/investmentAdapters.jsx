import { db } from './dbConfig.jsx';
import { Instruments, PriceHistories } from './investmentSchema.jsx';
import { eq } from 'drizzle-orm';

// Alpha Vantage API Client for Stock Data
class AlphaVantageAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.rateLimit = { requests: 0, resetTime: Date.now() + 60000 }; // 1 request per minute
  }

  async fetchStockPrice(symbol) {
    try {
      // Check rate limit
      if (this.rateLimit.requests >= 5 && Date.now() < this.rateLimit.resetTime) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      }

      const response = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      const quote = data['Global Quote'];
      if (!quote || !quote['05. price']) {
        throw new Error('Invalid data received from Alpha Vantage');
      }

      // Update rate limit
      this.rateLimit.requests++;
      if (this.rateLimit.requests >= 5) {
        this.rateLimit.resetTime = Date.now() + 60000;
        this.rateLimit.requests = 0;
      }

      return {
        symbol: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      throw error;
    }
  }

  async storeStockPrice(symbol, priceData) {
    try {
      // Check if instrument exists, if not create it
      let instrument = await db.select().from(Instruments).where(eq(Instruments.symbol, symbol)).limit(1);
      
      if (instrument.length === 0) {
        const [newInstrument] = await db.insert(Instruments).values({
          symbol: symbol,
          name: symbol, // You might want to fetch company name separately
          type: 'stock',
          exchange: 'NSE', // Default, can be made dynamic
          createdBy: 'system'
        }).returning();
        instrument = [newInstrument];
      }

      // Store price history
      await db.insert(PriceHistories).values({
        instrumentId: instrument[0].id,
        price: priceData.price,
        volume: priceData.volume,
        date: priceData.timestamp,
        source: 'alpha_vantage'
      });

      return priceData;
    } catch (error) {
      console.error(`Error storing stock price for ${symbol}:`, error);
      throw error;
    }
  }
}

// Zyla Labs API Client for Mutual Fund Data
class ZylaLabsAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.zylalabs.com/api/v1.2';
    this.rateLimit = { requests: 0, resetTime: Date.now() + 86400000 }; // 1 request per day
  }

  async fetchMutualFundNAV(schemeCode) {
    try {
      // Check rate limit
      if (this.rateLimit.requests >= 1000 && Date.now() < this.rateLimit.resetTime) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      }

      const response = await fetch(
        `${this.baseUrl}/mutual-funds/nav?scheme_code=${schemeCode}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update rate limit
      this.rateLimit.requests++;
      if (this.rateLimit.requests >= 1000) {
        this.rateLimit.resetTime = Date.now() + 86400000;
        this.rateLimit.requests = 0;
      }

      return {
        schemeCode: schemeCode,
        nav: parseFloat(data.nav),
        date: new Date(data.date),
        schemeName: data.scheme_name,
        fundHouse: data.fund_house,
        schemeType: data.scheme_type,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Error fetching NAV for scheme ${schemeCode}:`, error);
      throw error;
    }
  }

  async storeMutualFundNAV(schemeCode, navData) {
    try {
      // Check if instrument exists, if not create it
      let instrument = await db.select().from(Instruments).where(eq(Instruments.symbol, schemeCode)).limit(1);
      
      if (instrument.length === 0) {
        const [newInstrument] = await db.insert(Instruments).values({
          symbol: schemeCode,
          name: navData.schemeName,
          type: 'mutual_fund',
          exchange: navData.fundHouse,
          createdBy: 'system'
        }).returning();
        instrument = [newInstrument];
      }

      // Store NAV history
      await db.insert(PriceHistories).values({
        instrumentId: instrument[0].id,
        nav: navData.nav,
        date: navData.date,
        source: 'zyla_labs'
      });

      return navData;
    } catch (error) {
      console.error(`Error storing NAV for scheme ${schemeCode}:`, error);
      throw error;
    }
  }
}

// Investment Service - Main service for managing investments
export class InvestmentService {
  constructor(alphaVantageKey, zylaLabsKey) {
    this.stockAdapter = new AlphaVantageAdapter(alphaVantageKey);
    this.mutualFundAdapter = new ZylaLabsAdapter(zylaLabsKey);
  }

  async fetchAndStoreStockPrice(symbol) {
    try {
      const priceData = await this.stockAdapter.fetchStockPrice(symbol);
      await this.stockAdapter.storeStockPrice(symbol, priceData);
      return priceData;
    } catch (error) {
      console.error(`Error in fetchAndStoreStockPrice for ${symbol}:`, error);
      throw error;
    }
  }

  async fetchAndStoreMutualFundNAV(schemeCode) {
    try {
      const navData = await this.mutualFundAdapter.fetchMutualFundNAV(schemeCode);
      await this.mutualFundAdapter.storeMutualFundNAV(schemeCode, navData);
      return navData;
    } catch (error) {
      console.error(`Error in fetchAndStoreMutualFundNAV for ${schemeCode}:`, error);
      throw error;
    }
  }

  async getCurrentPrice(instrumentId) {
    try {
      const priceHistory = await db.select()
        .from(PriceHistories)
        .where(eq(PriceHistories.instrumentId, instrumentId))
        .orderBy(desc(PriceHistories.date))
        .limit(1);
      
      return priceHistory[0] || null;
    } catch (error) {
      console.error(`Error getting current price for instrument ${instrumentId}:`, error);
      throw error;
    }
  }
}

export { AlphaVantageAdapter, ZylaLabsAdapter }; 