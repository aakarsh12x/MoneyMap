import { NextResponse } from 'next/server';
import { db } from '@/utils/dbConfig';
import { Holdings, Instruments, PriceHistories, InvestmentTransactions } from '@/utils/investmentSchema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

// GET /api/investments/[id] - Get specific investment details
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const holding = await db.select({
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
      createdAt: Holdings.createdAt,
      updatedAt: Holdings.updatedAt
    })
    .from(Holdings)
    .innerJoin(Instruments, eq(Holdings.instrumentId, Instruments.id))
    .where(and(eq(Holdings.id, id), eq(Holdings.createdBy, userId)))
    .limit(1);

    if (holding.length === 0) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    // Get price history
    const priceHistory = await db.select({
      price: PriceHistories.price,
      nav: PriceHistories.nav,
      date: PriceHistories.date,
      source: PriceHistories.source
    })
    .from(PriceHistories)
    .where(eq(PriceHistories.instrumentId, holding[0].instrumentId))
    .orderBy(desc(PriceHistories.date))
    .limit(30); // Last 30 days

    // Get transaction history
    const transactions = await db.select({
      id: InvestmentTransactions.id,
      type: InvestmentTransactions.type,
      quantity: InvestmentTransactions.quantity,
      price: InvestmentTransactions.price,
      totalAmount: InvestmentTransactions.totalAmount,
      transactionDate: InvestmentTransactions.transactionDate,
      fees: InvestmentTransactions.fees,
      notes: InvestmentTransactions.notes
    })
    .from(InvestmentTransactions)
    .where(eq(InvestmentTransactions.holdingId, id))
    .orderBy(desc(InvestmentTransactions.transactionDate));

    return NextResponse.json({
      holding: holding[0],
      priceHistory,
      transactions
    });

  } catch (error) {
    console.error('Error fetching investment details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/investments/[id] - Update investment
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { quantity, price, transactionDate, notes } = body;

    if (!quantity || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current holding
    const currentHolding = await db.select()
      .from(Holdings)
      .where(and(eq(Holdings.id, id), eq(Holdings.createdBy, userId)))
      .limit(1);

    if (currentHolding.length === 0) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    const holding = currentHolding[0];
    const newQuantity = parseFloat(holding.quantity) + parseFloat(quantity);
    const newTotalInvested = parseFloat(holding.totalInvested) + (parseFloat(quantity) * parseFloat(price));
    const newAveragePrice = newTotalInvested / newQuantity;

    // Update holding
    await db.update(Holdings)
      .set({
        quantity: newQuantity,
        averagePrice: newAveragePrice,
        totalInvested: newTotalInvested,
        updatedAt: new Date()
      })
      .where(eq(Holdings.id, id));

    // Add transaction record
    await db.insert(InvestmentTransactions).values({
      holdingId: id,
      type: parseFloat(quantity) > 0 ? 'buy' : 'sell',
      quantity: Math.abs(parseFloat(quantity)),
      price,
      totalAmount: Math.abs(parseFloat(quantity) * parseFloat(price)),
      transactionDate: transactionDate || new Date(),
      notes,
      createdBy: userId
    });

    return NextResponse.json({
      message: 'Investment updated successfully',
      holding: {
        id,
        quantity: newQuantity,
        averagePrice: newAveragePrice,
        totalInvested: newTotalInvested
      }
    });

  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/investments/[id] - Delete investment
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if holding exists and belongs to user
    const holding = await db.select()
      .from(Holdings)
      .where(and(eq(Holdings.id, id), eq(Holdings.createdBy, userId)))
      .limit(1);

    if (holding.length === 0) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    // Delete transactions first (foreign key constraint)
    await db.delete(InvestmentTransactions).where(eq(InvestmentTransactions.holdingId, id));
    
    // Delete holding
    await db.delete(Holdings).where(eq(Holdings.id, id));

    return NextResponse.json({
      message: 'Investment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 