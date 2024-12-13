// utils/getFinancialAdvice.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDNUYkYoFmcd7SpAaeJbt1TQGBWN3WHX8g");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to fetch user-specific data (mocked for this example)

// Function to generate personalized financial advice
const getFinancialAdvice = async (totalBudget, totalIncome, totalSpend) => {
  console.log(totalBudget, totalIncome, totalSpend);
  try {
    const userPrompt = `
      Based on the following financial data:
      - Total Budget: ${totalBudget} Rupees 
      - Expenses: ${totalSpend} Rupees
      - Incomes: ${totalIncome} Rupees
      Provide detailed financial advice in 2 sentences to help the user manage their finances more effectively.
    `;

    // Send the prompt to the Gemini API using generateContent
    const result = await model.generateContent(userPrompt);
    const advice = result.response.text();

    console.log(advice);
    return advice;
  } catch (error) {
    console.error("Error fetching financial advice:", error);
    return "Sorry, I couldn't fetch the financial advice at this moment. Please try again later.";
  }
};

export default getFinancialAdvice;