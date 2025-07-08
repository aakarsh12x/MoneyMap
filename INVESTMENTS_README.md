# Investments Module - MoneyMap Finance Tracker

## Overview
The Investments module provides comprehensive portfolio management capabilities for tracking stocks and mutual funds with live data integration.

## Features

### 📊 Portfolio Management
- **Real-time tracking** of stock prices and mutual fund NAVs
- **Portfolio overview** with total invested, current value, and P&L
- **Performance analytics** with charts and visualizations
- **Transaction history** for all buy/sell activities

### 🔄 Live Data Integration
- **Alpha Vantage API** for stock prices (500 requests/day free)
- **Zyla Labs API** for mutual fund NAVs (1000 requests/month free)
- **Automatic updates** via scheduled jobs
- **Rate limiting** and error handling

### 📈 Analytics & Charts
- **Portfolio allocation** pie chart
- **Performance comparison** bar charts
- **Individual investment** performance tracking
- **P&L percentage** calculations

## Database Schema

### Tables
1. **Instruments** - Available investment instruments
2. **Holdings** - User's investment holdings
3. **PriceHistories** - Historical price/NAV data
4. **InvestmentTransactions** - Buy/sell transaction records

## API Endpoints

### Portfolio Management
- `GET /api/investments/portfolio` - Get user's portfolio
- `POST /api/investments/asset` - Add new investment
- `GET /api/investments/[id]` - Get specific investment details
- `PUT /api/investments/[id]` - Update investment
- `DELETE /api/investments/[id]` - Delete investment

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local`:
```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
ZYLA_LABS_API_KEY=your_zyla_labs_key
```

### 2. Install Dependencies
```bash
npm install node-cron
```

### 3. Database Migration
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

## Usage Examples

### Adding a Stock Investment
```javascript
const response = await fetch('/api/investments/asset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    type: 'stock',
    quantity: 10,
    price: 2500,
    transactionDate: new Date().toISOString(),
    notes: 'Initial purchase'
  })
});
```

### Adding a Mutual Fund Investment
```javascript
const response = await fetch('/api/investments/asset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: '120010',
    name: 'SBI Bluechip Fund Direct Growth',
    type: 'mutual_fund',
    quantity: 1000,
    price: 45.67,
    transactionDate: new Date().toISOString(),
    notes: 'SIP investment'
  })
});
```

## Scheduler Configuration

### Automatic Updates
- **Stocks**: Every 5 minutes during market hours (9:30 AM - 3:30 PM IST)
- **Mutual Funds**: Daily at 6 PM IST
- **Portfolio Values**: Every 15 minutes

### Manual Updates
```javascript
import InvestmentScheduler from '@/utils/investmentScheduler';

const scheduler = new InvestmentScheduler(alphaVantageKey, zylaLabsKey);
scheduler.manualUpdate('stocks'); // Update stock prices
scheduler.manualUpdate('mutual_funds'); // Update NAVs
scheduler.manualUpdate('portfolio'); // Update portfolio values
scheduler.manualUpdate('all'); // Update everything
```

## Error Handling

### Rate Limiting
- Alpha Vantage: 5 requests per minute
- Zyla Labs: 1000 requests per month
- Automatic retry with exponential backoff
- Cache responses for 5 minutes

### Data Validation
- Stock symbols: 1-10 characters
- Mutual fund codes: 6 digits
- Quantity: positive numbers
- Price: non-negative numbers

## API Response Examples

### Success Response
```json
{
  "message": "Investment added successfully",
  "holding": {
    "id": 1,
    "symbol": "RELIANCE",
    "name": "Reliance Industries Ltd",
    "type": "stock",
    "quantity": 10,
    "averagePrice": 2500,
    "totalInvested": 25000
  }
}
```

### Portfolio Response
```json
{
  "portfolio": [
    {
      "id": 1,
      "symbol": "RELIANCE",
      "name": "Reliance Industries Ltd",
      "type": "stock",
      "quantity": 10,
      "averagePrice": 2500,
      "totalInvested": 25000,
      "currentValue": 25500,
      "profitLoss": 500,
      "profitLossPercentage": 2.0
    }
  ],
  "totals": {
    "totalInvested": 25000,
    "currentValue": 25500,
    "profitLoss": 500,
    "profitLossPercentage": 2.0
  },
  "count": 1
}
```

## Testing

### Run Test Script
```bash
node test-investment-api.js
```

### Curl Examples
```bash
# Get portfolio
curl -X GET http://localhost:3001/api/investments/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add investment
curl -X POST http://localhost:3001/api/investments/asset \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "symbol": "RELIANCE",
    "name": "Reliance Industries Ltd",
    "type": "stock",
    "quantity": 10,
    "price": 2500,
    "transactionDate": "2024-01-15T00:00:00.000Z",
    "notes": "Initial purchase"
  }'
```

## File Structure

```
app/(routes)/dashboard/investments/
├── page.jsx                           # Main investments page
└── _components/
    ├── InvestmentPortfolio.jsx        # Portfolio display component
    ├── AddInvestment.jsx              # Add investment form
    └── InvestmentChart.jsx            # Charts and analytics

utils/
├── investmentSchema.jsx               # Database schema
├── investmentAdapters.jsx             # API adapters
├── investmentScheduler.jsx            # Scheduled jobs
└── investmentErrorHandler.jsx         # Error handling

app/api/investments/
├── route.js                          # Portfolio endpoints
└── [id]/route.js                     # Individual investment endpoints
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include data validation
4. Update documentation
5. Test with the provided examples

## Support

For issues or questions:
1. Check the error logs in the console
2. Verify API keys are correctly set
3. Ensure database migrations are applied
4. Test with the provided curl examples 