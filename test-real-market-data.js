// Test script for Real Market Data functionality
// Run with: node test-real-market-data.js

const BASE_URL = 'http://localhost:3001/api';

// Test real market data endpoints
const testRealMarketData = async () => {
  console.log('🧪 Testing Real Market Data API Endpoints\n');

  // 1. Test stocks endpoint
  console.log('1. Testing Stocks API:');
  console.log('GET /api/market-data?type=stocks');
  console.log('curl -X GET http://localhost:3001/api/market-data?type=stocks\n');

  try {
    const stocksResponse = await fetch(`${BASE_URL}/market-data?type=stocks`);
    const stocksData = await stocksResponse.json();
    
    if (stocksData.success) {
      console.log('✅ Stocks data received successfully');
      console.log(`📊 Found ${stocksData.count} stocks`);
      console.log('Sample stock data:');
      console.log(JSON.stringify(stocksData.data[0], null, 2));
    } else {
      console.log('❌ Failed to fetch stocks data');
    }
  } catch (error) {
    console.log('❌ Error testing stocks API:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. Test mutual funds endpoint
  console.log('2. Testing Mutual Funds API:');
  console.log('GET /api/market-data?type=mutual_funds');
  console.log('curl -X GET http://localhost:3001/api/market-data?type=mutual_funds\n');

  try {
    const fundsResponse = await fetch(`${BASE_URL}/market-data?type=mutual_funds`);
    const fundsData = await fundsResponse.json();
    
    if (fundsData.success) {
      console.log('✅ Mutual funds data received successfully');
      console.log(`📊 Found ${fundsData.count} mutual funds`);
      console.log('Sample mutual fund data:');
      console.log(JSON.stringify(fundsData.data[0], null, 2));
    } else {
      console.log('❌ Failed to fetch mutual funds data');
    }
  } catch (error) {
    console.log('❌ Error testing mutual funds API:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 3. Test search functionality
  console.log('3. Testing Search Functionality:');
  console.log('GET /api/market-data?type=stocks&query=RELIANCE');
  console.log('curl -X GET "http://localhost:3001/api/market-data?type=stocks&query=RELIANCE"\n');

  try {
    const searchResponse = await fetch(`${BASE_URL}/market-data?type=stocks&query=RELIANCE`);
    const searchData = await searchResponse.json();
    
    if (searchData.success) {
      console.log('✅ Search functionality working');
      console.log(`🔍 Found ${searchData.count} stocks matching "RELIANCE"`);
    } else {
      console.log('❌ Search functionality failed');
    }
  } catch (error) {
    console.log('❌ Error testing search API:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 4. Test specific stock data
  console.log('4. Testing Specific Stock Data:');
  console.log('POST /api/market-data');
  console.log('curl -X POST http://localhost:3001/api/market-data \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"symbol": "RELIANCE", "type": "stock"}\'\n');

  try {
    const specificResponse = await fetch(`${BASE_URL}/market-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: 'RELIANCE',
        type: 'stock'
      })
    });
    const specificData = await specificResponse.json();
    
    if (specificData.success) {
      console.log('✅ Specific stock data received');
      console.log('Sample data:');
      console.log(JSON.stringify(specificData.data, null, 2));
    } else {
      console.log('❌ Failed to fetch specific stock data');
    }
  } catch (error) {
    console.log('❌ Error testing specific stock API:', error.message);
  }
};

// API Documentation
const showAPIDocumentation = () => {
  console.log('\n📚 API Documentation\n');
  console.log('Available Endpoints:');
  console.log('1. GET /api/market-data?type=stocks');
  console.log('   - Returns popular Indian stocks with real-time data');
  console.log('   - Uses Yahoo Finance API (free, no key required)');
  console.log('   - Includes: price, change, volume, high/low, open/close');
  
  console.log('\n2. GET /api/market-data?type=mutual_funds');
  console.log('   - Returns popular Indian mutual funds with NAV data');
  console.log('   - Uses AMFI API (free, no key required)');
  console.log('   - Includes: NAV, scheme details, fund house, category');
  
  console.log('\n3. GET /api/market-data?type=stocks&query=SEARCH_TERM');
  console.log('   - Search stocks by name or symbol');
  console.log('   - Case-insensitive search');
  
  console.log('\n4. POST /api/market-data');
  console.log('   - Get specific stock or mutual fund data');
  console.log('   - Body: {"symbol": "SYMBOL", "type": "stock|mutual_fund"}');
  
  console.log('\nData Sources:');
  console.log('- Stocks: Yahoo Finance API (real-time)');
  console.log('- Mutual Funds: AMFI NAV data (daily updates)');
  console.log('- Fallback: Mock data when APIs are unavailable');
};

// Features Overview
const showFeatures = () => {
  console.log('\n🚀 Features Overview\n');
  console.log('✅ Real-time stock prices from Yahoo Finance');
  console.log('✅ Daily mutual fund NAV updates from AMFI');
  console.log('✅ Search functionality for stocks and funds');
  console.log('✅ Caching system (5-minute TTL)');
  console.log('✅ Error handling with fallback to mock data');
  console.log('✅ Rate limiting and retry mechanisms');
  console.log('✅ Responsive UI with charts and analytics');
  console.log('✅ Portfolio tracking with P&L calculations');
  console.log('✅ Transaction history and performance metrics');
};

// Setup Instructions
const showSetupInstructions = () => {
  console.log('\n🔧 Setup Instructions\n');
  console.log('1. Start the development server:');
  console.log('   npm run dev');
  console.log('\n2. Navigate to the investments page:');
  console.log('   http://localhost:3001/dashboard/investments');
  console.log('\n3. Use the "Market Data" tab to view real-time data');
  console.log('\n4. Test the API endpoints using the curl commands above');
  console.log('\n5. Add investments to your portfolio using real market data');
};

// Run the tests
const runTests = async () => {
  console.log('🎯 Real Market Data Test Suite\n');
  console.log('Testing live market data integration...\n');
  
  await testRealMarketData();
  showAPIDocumentation();
  showFeatures();
  showSetupInstructions();
  
  console.log('\n✨ Test completed! Check the console for results.');
  console.log('💡 If you see mock data, it means the real APIs are unavailable or rate-limited.');
  console.log('🔄 The system automatically falls back to mock data for demonstration purposes.');
};

// Run if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

export { testRealMarketData, showAPIDocumentation, showFeatures }; 