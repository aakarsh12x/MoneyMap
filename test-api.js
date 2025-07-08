// Test script for market data API
// Using built-in fetch (available in Node.js 18+)

async function testMarketDataAPI() {
  try {
    console.log('Testing Market Data API...\n');
    
    // Test stocks endpoint
    console.log('1. Testing stocks endpoint...');
    const stocksResponse = await fetch('http://localhost:3000/api/market-data?type=stocks');
    const stocksData = await stocksResponse.json();
    
    if (stocksData.success) {
      console.log('✅ Stocks API working');
      console.log(`   Found ${stocksData.count} stocks`);
      if (stocksData.data.length > 0) {
        const firstStock = stocksData.data[0];
        console.log(`   Sample stock: ${firstStock.symbol} - ${firstStock.name}`);
        console.log(`   Price: ${firstStock.price}, Change: ${firstStock.change}, Change%: ${firstStock.changePercent}`);
      }
    } else {
      console.log('❌ Stocks API failed:', stocksData.error);
    }
    
    console.log('\n2. Testing mutual funds endpoint...');
    const fundsResponse = await fetch('http://localhost:3000/api/market-data?type=mutual_funds');
    const fundsData = await fundsResponse.json();
    
    if (fundsData.success) {
      console.log('✅ Mutual Funds API working');
      console.log(`   Found ${fundsData.count} mutual funds`);
      if (fundsData.data.length > 0) {
        const firstFund = fundsData.data[0];
        console.log(`   Sample fund: ${firstFund.code} - ${firstFund.name}`);
        console.log(`   NAV: ${firstFund.nav}, Category: ${firstFund.category}`);
      }
    } else {
      console.log('❌ Mutual Funds API failed:', fundsData.error);
    }
    
    console.log('\n3. Testing search functionality...');
    const searchResponse = await fetch('http://localhost:3000/api/market-data?type=stocks&query=RELIANCE');
    const searchData = await searchResponse.json();
    
    if (searchData.success) {
      console.log('✅ Search API working');
      console.log(`   Found ${searchData.count} results for "RELIANCE"`);
    } else {
      console.log('❌ Search API failed:', searchData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMarketDataAPI(); 