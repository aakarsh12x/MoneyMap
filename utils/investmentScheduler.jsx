import cron from 'node-cron';
import { InvestmentService } from './investmentAdapters.jsx';
import { db } from './dbConfig.jsx';
import { Instruments, Holdings } from './investmentSchema.jsx';
import { eq } from 'drizzle-orm';

class InvestmentScheduler {
  constructor(alphaVantageKey, zylaLabsKey) {
    this.investmentService = new InvestmentService(alphaVantageKey, zylaLabsKey);
    this.isRunning = false;
  }

  // Start all scheduled jobs
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting Investment Scheduler...');

    // Stock prices - every 5 minutes during market hours (9:30 AM - 3:30 PM IST)
    cron.schedule('*/5 9-15 * * 1-5', async () => {
      console.log('Running stock price update job...');
      await this.updateStockPrices();
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Mutual Fund NAVs - daily at 6 PM IST
    cron.schedule('0 18 * * *', async () => {
      console.log('Running mutual fund NAV update job...');
      await this.updateMutualFundNAVs();
    }, {
      timezone: 'Asia/Kolkata'
    });

    // Portfolio value update - every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log('Running portfolio value update job...');
      await this.updatePortfolioValues();
    });

    this.isRunning = true;
    console.log('Investment Scheduler started successfully');
  }

  // Stop all scheduled jobs
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('Investment Scheduler stopped');
  }

  // Update stock prices for all active holdings
  async updateStockPrices() {
    try {
      // Get all stock holdings
      const stockHoldings = await db.select({
        id: Holdings.id,
        instrumentId: Holdings.instrumentId,
        symbol: Instruments.symbol
      })
      .from(Holdings)
      .innerJoin(Instruments, eq(Holdings.instrumentId, Instruments.id))
      .where(eq(Instruments.type, 'stock'));

      console.log(`Updating ${stockHoldings.length} stock prices...`);

      for (const holding of stockHoldings) {
        try {
          await this.investmentService.fetchAndStoreStockPrice(holding.symbol);
          console.log(`Updated price for ${holding.symbol}`);
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to update price for ${holding.symbol}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in updateStockPrices:', error);
    }
  }

  // Update mutual fund NAVs for all active holdings
  async updateMutualFundNAVs() {
    try {
      // Get all mutual fund holdings
      const mfHoldings = await db.select({
        id: Holdings.id,
        instrumentId: Holdings.instrumentId,
        symbol: Instruments.symbol
      })
      .from(Holdings)
      .innerJoin(Instruments, eq(Holdings.instrumentId, Instruments.id))
      .where(eq(Instruments.type, 'mutual_fund'));

      console.log(`Updating ${mfHoldings.length} mutual fund NAVs...`);

      for (const holding of mfHoldings) {
        try {
          await this.investmentService.fetchAndStoreMutualFundNAV(holding.symbol);
          console.log(`Updated NAV for ${holding.symbol}`);
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to update NAV for ${holding.symbol}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in updateMutualFundNAVs:', error);
    }
  }

  // Update portfolio values and P&L
  async updatePortfolioValues() {
    try {
      const holdings = await db.select({
        id: Holdings.id,
        instrumentId: Holdings.instrumentId,
        quantity: Holdings.quantity,
        averagePrice: Holdings.averagePrice,
        totalInvested: Holdings.totalInvested
      })
      .from(Holdings);

      console.log(`Updating ${holdings.length} portfolio values...`);

      for (const holding of holdings) {
        try {
          const currentPrice = await this.investmentService.getCurrentPrice(holding.instrumentId);
          
          if (currentPrice) {
            const currentValue = parseFloat(holding.quantity) * parseFloat(currentPrice.price);
            const profitLoss = currentValue - parseFloat(holding.totalInvested);
            const profitLossPercentage = (profitLoss / parseFloat(holding.totalInvested)) * 100;

            await db.update(Holdings)
              .set({
                currentValue: currentValue,
                profitLoss: profitLoss,
                profitLossPercentage: profitLossPercentage,
                updatedAt: new Date()
              })
              .where(eq(Holdings.id, holding.id));

            console.log(`Updated portfolio value for holding ${holding.id}`);
          }
        } catch (error) {
          console.error(`Failed to update portfolio value for holding ${holding.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error in updatePortfolioValues:', error);
    }
  }

  // Manual trigger for immediate update
  async manualUpdate(type = 'all') {
    console.log(`Manual update triggered for type: ${type}`);
    
    switch (type) {
      case 'stocks':
        await this.updateStockPrices();
        break;
      case 'mutual_funds':
        await this.updateMutualFundNAVs();
        break;
      case 'portfolio':
        await this.updatePortfolioValues();
        break;
      case 'all':
        await this.updateStockPrices();
        await this.updateMutualFundNAVs();
        await this.updatePortfolioValues();
        break;
      default:
        console.log('Invalid update type');
    }
  }
}

export default InvestmentScheduler; 