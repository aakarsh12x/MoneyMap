// Test script for Investment API endpoints
// Run with: node test-investment-api.js

const BASE_URL = 'http://localhost:3001/api/investments';

// Example API calls (replace with actual authentication token)
const testAPI = async () => {
  console.log('🧪 Testing Investment API Endpoints\n');

  // 1. Add a new stock investment
  console.log('1. Adding a new stock investment:');
  const addStockPayload = {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    type: 'stock',
    quantity: 10,
    price: 2500,
    transactionDate: new Date().toISOString(),
    notes: 'Initial purchase'
  };

  console.log('POST /api/investments/asset');
  console.log('Payload:', JSON.stringify(addStockPayload, null, 2));
  console.log('curl -X POST http://localhost:3001/api/investments/asset \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('  -d \'' + JSON.stringify(addStockPayload) + '\'\n');

  // 2. Add a mutual fund investment
  console.log('2. Adding a mutual fund investment:');
  const addMFPayload = {
    symbol: '120010', // SBI Bluechip Fund
    name: 'SBI Bluechip Fund Direct Growth',
    type: 'mutual_fund',
    quantity: 1000,
    price: 45.67,
    transactionDate: new Date().toISOString(),
    notes: 'SIP investment'
  };

  console.log('POST /api/investments/asset');
  console.log('Payload:', JSON.stringify(addMFPayload, null, 2));
  console.log('curl -X POST http://localhost:3001/api/investments/asset \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('  -d \'' + JSON.stringify(addMFPayload) + '\'\n');

  // 3. Get portfolio
  console.log('3. Fetching portfolio:');
  console.log('GET /api/investments/portfolio');
  console.log('curl -X GET http://localhost:3001/api/investments/portfolio \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN"\n');

  // 4. Get specific investment details
  console.log('4. Getting investment details:');
  console.log('GET /api/investments/{id}');
  console.log('curl -X GET http://localhost:3001/api/investments/1 \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN"\n');

  // 5. Update investment (buy more)
  console.log('5. Updating investment (buying more):');
  const updatePayload = {
    quantity: 5,
    price: 2550,
    transactionDate: new Date().toISOString(),
    notes: 'Additional purchase'
  };

  console.log('PUT /api/investments/{id}');
  console.log('Payload:', JSON.stringify(updatePayload, null, 2));
  console.log('curl -X PUT http://localhost:3001/api/investments/1 \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
  console.log('  -d \'' + JSON.stringify(updatePayload) + '\'\n');

  // 6. Delete investment
  console.log('6. Deleting investment:');
  console.log('DELETE /api/investments/{id}');
  console.log('curl -X DELETE http://localhost:3001/api/investments/1 \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN"\n');

  console.log('📊 Expected API Responses:');
  console.log('✅ Success responses include:');
  console.log('   - message: "Investment added/updated/deleted successfully"');
  console.log('   - holding: { id, symbol, name, type, quantity, averagePrice, totalInvested }');
  console.log('   - portfolio: Array of all holdings with current values and P&L');
  console.log('   - totals: { totalInvested, currentValue, profitLoss, profitLossPercentage }');
  console.log('\n❌ Error responses include:');
  console.log('   - error: "Unauthorized" (401)');
  console.log('   - error: "Investment not found" (404)');
  console.log('   - error: "Missing required fields" (400)');
  console.log('   - error: "Internal server error" (500)');
};

// Environment setup instructions
const setupInstructions = () => {
  console.log('\n🔧 Setup Instructions:\n');
  console.log('1. Install dependencies:');
  console.log('   npm install node-cron');
  console.log('\n2. Add environment variables to .env.local:');
  console.log('   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key');
  console.log('   ZYLA_LABS_API_KEY=your_zyla_labs_key');
  console.log('\n3. Run database migrations:');
  console.log('   npm run db:push');
  console.log('\n4. Start the development server:');
  console.log('   npm run dev');
  console.log('\n5. Test the API endpoints using the curl commands above');
};

// Rate limiting and error handling examples
const errorHandlingExamples = () => {
  console.log('\n🛡️ Error Handling Examples:\n');
  
  console.log('Rate Limit Handling:');
  console.log('- Alpha Vantage: 5 requests per minute');
  console.log('- Zyla Labs: 1000 requests per month');
  console.log('- Automatic retry with exponential backoff');
  console.log('- Cache responses for 5 minutes');
  
  console.log('\nData Validation:');
  console.log('- Stock symbols: 1-10 characters');
  console.log('- Mutual fund codes: 6 digits');
  console.log('- Quantity: positive numbers');
  console.log('- Price: non-negative numbers');
  
  console.log('\nAPI Error Responses:');
  console.log('- 401: Unauthorized (missing/invalid token)');
  console.log('- 400: Bad Request (validation errors)');
  console.log('- 404: Not Found (investment doesn\'t exist)');
  console.log('- 429: Too Many Requests (rate limit exceeded)');
  console.log('- 500: Internal Server Error (server issues)');
};

// Run the test
testAPI();
setupInstructions();
errorHandlingExamples(); 