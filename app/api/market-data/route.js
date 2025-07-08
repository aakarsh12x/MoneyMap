import { NextResponse } from 'next/server';
import RealMarketDataService from '@/utils/realMarketData.jsx';

const marketDataService = new RealMarketDataService();

// GET /api/market-data/stocks - Get popular stocks with real data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'stocks' or 'mutual_funds'
    const query = searchParams.get('query'); // search query

    if (type === 'stocks') {
      let stocks;
      if (query) {
        stocks = await marketDataService.searchStocks(query);
      } else {
        stocks = await marketDataService.getPopularStocks();
      }
      
      return NextResponse.json({
        success: true,
        data: stocks,
        count: stocks.length
      });
    } else if (type === 'mutual_funds') {
      let funds;
      if (query) {
        funds = await marketDataService.searchMutualFunds(query);
      } else {
        funds = await marketDataService.getPopularMutualFunds();
      }
      
      return NextResponse.json({
        success: true,
        data: funds,
        count: funds.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid type parameter. Use "stocks" or "mutual_funds"'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch market data'
    }, { status: 500 });
  }
}

// POST /api/market-data/stock - Get specific stock data
export async function POST(request) {
  try {
    const body = await request.json();
    const { symbol, type } = body;

    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Symbol is required'
      }, { status: 400 });
    }

    let data;
    if (type === 'stock') {
      data = await marketDataService.getStockPrice(symbol);
    } else if (type === 'mutual_fund') {
      data = await marketDataService.getMutualFundNAV(symbol);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid type. Use "stock" or "mutual_fund"'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching specific market data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch market data'
    }, { status: 500 });
  }
} 