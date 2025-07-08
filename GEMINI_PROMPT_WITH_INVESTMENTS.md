# Updated Gemini Prompt for MoneyMap App with Investments

You are given a task to integrate a React component into your codebase. Please verify your project has the following setup:

## Project Requirements
- shadcn/ui project structure
- Tailwind CSS v4.0
- TypeScript/JavaScript support
- Next.js 14+ with App Router

If any of these are missing, provide instructions on how to setup project via shadcn CLI, install Tailwind or TypeScript.

## MoneyMap App Context
This is a comprehensive financial management application that includes:

### Core Features:
- **Budget Management**: Track expenses and income streams
- **Investment Portfolio**: Real-time stock and mutual fund tracking
- **Market Data**: Live prices from Yahoo Finance and AMFI APIs
- **Financial Analytics**: Charts and performance metrics
- **AI Financial Advice**: Smart recommendations based on spending patterns

### Investment Module Features:
- **Portfolio Tracking**: Monitor stocks and mutual funds
- **Real-time Market Data**: Live prices and NAV updates
- **Performance Analytics**: Profit/loss calculations and charts
- **Investment Discovery**: Search and explore new opportunities
- **SIP Planning**: Systematic Investment Plan management

### Technical Stack:
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **UI Components**: shadcn/ui with custom glowing effects
- **APIs**: Yahoo Finance (stocks), AMFI (mutual funds)
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: Clerk
- **Animations**: Framer Motion, custom GlowingEffect

## Component Integration Guidelines

### 1. Determine Project Structure
Check if the default path for components is `/components/ui`. If not, provide instructions on why it's important to create this folder.

### 2. Glowing Effect Integration
The app uses a custom `GlowingEffect` component for interactive cards. When adding new components:

```jsx
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Wrap card containers with:
<div className="relative p-6 border rounded-lg bg-white">
  <GlowingEffect
    spread={40}
    glow={true}
    disabled={false}
    proximity={64}
    inactiveZone={0.01}
  />
  {/* Card content */}
</div>
```

### 3. Investment-Aware Components
When creating components, consider:
- **Real Data Only**: No mock data, use live APIs
- **Error Handling**: Graceful fallbacks for API failures
- **Loading States**: Smooth loading animations
- **Empty States**: Clear messaging when no data available

### 4. Financial Data Formatting
Use consistent formatting for financial data:

```jsx
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
```

### 5. API Integration
The app uses these APIs for real data:
- **Stocks**: `GET /api/market-data?type=stocks`
- **Mutual Funds**: `GET /api/market-data?type=mutual_funds`
- **Portfolio**: `GET /api/investments/portfolio`

### 6. Component Examples

#### Investment Card:
```jsx
<div className="relative bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-semibold">{investment.symbol}</h4>
      <p className="text-sm text-gray-600">{investment.name}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold">{formatCurrency(investment.price)}</p>
      <p className={`text-sm ${investment.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatPercentage(investment.changePercent)}
      </p>
    </div>
  </div>
</div>
```

#### Market Data Widget:
```jsx
<div className="relative p-6 border rounded-lg bg-white">
  <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
  <h3 className="font-semibold text-lg mb-4">Market Watch</h3>
  {/* Market data content */}
</div>
```

## Copy-Paste Component Integration

When integrating new components:

1. **Verify Dependencies**: Ensure `motion` library is installed
2. **Add Glowing Effects**: Wrap interactive elements with `GlowingEffect`
3. **Handle Real Data**: Use live APIs, no mock data
4. **Error States**: Provide clear feedback when data unavailable
5. **Responsive Design**: Ensure mobile-friendly layouts
6. **Accessibility**: Include proper ARIA labels and keyboard navigation

## File Structure
```
MoneyMapFnl-main/
├── app/
│   ├── (routes)/dashboard/
│   │   ├── investments/
│   │   │   ├── _components/
│   │   │   │   ├── MarketDataDisplay.jsx
│   │   │   │   ├── InvestmentPortfolio.jsx
│   │   │   │   ├── InvestmentChart.jsx
│   │   │   │   └── AddInvestment.jsx
│   │   │   └── page.jsx
│   │   └── _components/
│   │       ├── InvestmentSummary.jsx
│   │       ├── MarketDataWidget.jsx
│   │       └── CardInfo.jsx
│   └── api/
│       ├── market-data/
│       └── investments/
├── components/ui/
│   ├── glowing-effect.tsx
│   └── [other shadcn components]
└── utils/
    ├── realMarketData.jsx
    └── [other utilities]
```

## Integration Checklist
- [ ] Verify shadcn/ui setup
- [ ] Install required dependencies (motion, etc.)
- [ ] Add GlowingEffect to interactive cards
- [ ] Implement real data fetching
- [ ] Add proper error handling
- [ ] Include loading states
- [ ] Test responsive design
- [ ] Verify accessibility features

This updated prompt ensures that any new components integrate seamlessly with the MoneyMap app's investment features and maintain the high-quality user experience with real-time financial data. 