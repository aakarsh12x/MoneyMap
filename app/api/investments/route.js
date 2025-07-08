import { NextResponse } from 'next/server';
import { db } from '@/utils/dbConfig';
import { Instruments, Holdings, PriceHistories, InvestmentTransactions } from '@/utils/investmentSchema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// GET /api/investments/portfolio - Get user's portfolio
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portfolio = await db.select({
      id: Holdings.id,
      symbol: Instruments.symbol,
      name: Instruments.name,
      type: Instruments.type,
      quantity: Holdings.quantity,
      averagePrice: Holdings.averagePrice,
      totalInvested: Holdings.totalInvested,
      currentValue: Holdings.currentValue,
      profitLoss: Holdings.profitLoss,
      profitLossPercentage: Holdings.profitLossPercentage,
      lastUpdated: Holdings.updatedAt
    })
    .from(Holdings)
    .innerJoin(Instruments, eq(Holdings.instrumentId, Instruments.id))
    .where(eq(Holdings.createdBy, userId))
    .orderBy(desc(Holdings.updatedAt));

    // Calculate portfolio totals
    const totals = portfolio.reduce((acc, holding) => {
      acc.totalInvested += parseFloat(holding.totalInvested);
      acc.currentValue += parseFloat(holding.currentValue);
      acc.profitLoss += parseFloat(holding.profitLoss);
      return acc;
    }, { totalInvested: 0, currentValue: 0, profitLoss: 0 });

    totals.profitLossPercentage = totals.totalInvested > 0 
      ? (totals.profitLoss / totals.totalInvested) * 100 
      : 0;

    return NextResponse.json({
      portfolio,
      totals,
      count: portfolio.length
    });

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/investments/asset - Add new investment
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, name, type, quantity, price, transactionDate, notes } = body;

    if (!symbol || !name || !type || !quantity || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if instrument exists, create if not
    let instrument = await db.select().from(Instruments).where(eq(Instruments.symbol, symbol)).limit(1);
    
    if (instrument.length === 0) {
      const [newInstrument] = await db.insert(Instruments).values({
        symbol,
        name,
        type,
        exchange: type === 'stock' ? 'NSE' : 'MF',
        createdBy: userId
      }).returning();
      instrument = [newInstrument];
    }

    // Create holding
    const totalInvested = parseFloat(quantity) * parseFloat(price);
    const [holding] = await db.insert(Holdings).values({
      instrumentId: instrument[0].id,
      quantity,
      averagePrice: price,
      totalInvested,
      currentValue: totalInvested, // Initially same as invested
      profitLoss: 0,
      profitLossPercentage: 0,
      createdBy: userId
    }).returning();

    // Create transaction record
    await db.insert(InvestmentTransactions).values({
      holdingId: holding.id,
      type: 'buy',
      quantity,
      price,
      totalAmount: totalInvested,
      transactionDate: transactionDate || new Date(),
      notes,
      createdBy: userId
    });

    return NextResponse.json({
      message: 'Investment added successfully',
      holding: {
        id: holding.id,
        symbol,
        name,
        type,
        quantity,
        averagePrice: price,
        totalInvested
      }
    });

  } catch (error) {
    console.error('Error adding investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 