"use client";
import React, { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import CardInfo from "./_components/CardInfo";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses, Incomes } from "@/utils/schema";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";
import InvestmentSummary from "./_components/InvestmentSummary";
import MarketDataWidget from "./_components/MarketDataWidget";
import CryptoMarketWidget from "./_components/CryptoMarketWidget";
import { TrendingUp, Plus, BarChart3, PiggyBank, DollarSign, TrendingDown, Wallet, Download, FileText } from "lucide-react";
import Link from "next/link";
import marketDataCache from "@/utils/marketDataCache";
import ReportGenerator from "@/utils/reportGenerator";

function Dashboard() {
  const { user } = useUser();

  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportFormat, setReportFormat] = useState('csv');
  const [showReportMenu, setShowReportMenu] = useState(false);

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      // Store user email for cache keys
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', user.primaryEmailAddress.emailAddress);
      }
      getBudgetList();
    } else {
      // Clear data when user is not available
      setBudgetList([]);
      setIncomeList([]);
      setExpensesList([]);
      setPortfolioData(null);
      setMarketData(null);
      // Clear user email from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userEmail');
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      fetchInvestmentData();
    } else {
      // Clear investment data when user is not available
      setPortfolioData(null);
      setMarketData(null);
    }
  }, [user]);

  // Close report menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReportMenu && !event.target.closest('.report-menu')) {
        setShowReportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReportMenu]);

  /**
   * Generate and download financial report
   */
  const generateReport = async (format = 'csv') => {
    setGeneratingReport(true);
    try {
      const userData = {
        fullName: user?.fullName,
        firstName: user?.firstName,
        email: user?.primaryEmailAddress?.emailAddress
      };

      const financialData = {
        totalIncome,
        totalExpenses,
        budgetList,
        incomeList,
        expensesList,
        portfolioData,
        marketData
      };

      const reportGenerator = new ReportGenerator(userData, financialData);
      reportGenerator.downloadReport(format);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
      setShowReportMenu(false);
    }
  };



  /**
   * Fetch investment portfolio and market data
   */
  const fetchInvestmentData = async () => {
    try {
      // Fetch portfolio data
      const portfolioResponse = await fetch('/api/investments/portfolio');
      const portfolioResult = await portfolioResponse.json();
      
      if (portfolioResult.success) {
        setPortfolioData(portfolioResult);
      }

      // Check cache first for market data - include user email in cache key
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const cacheKey = `dashboard_stocks_${userEmail}`;
      const cachedMarketData = marketDataCache.get(cacheKey);
      if (cachedMarketData) {
        setMarketData(cachedMarketData);
        setLoading(false);
        return;
      }

      // Fetch market data for popular stocks
      const marketResponse = await fetch('/api/market-data?type=stocks');
      const marketResult = await marketResponse.json();
      
      if (marketResult.success && marketResult.data && marketResult.data.length > 0) {
        const topStocks = marketResult.data.slice(0, 5); // Get top 5 stocks
        setMarketData(topStocks);
        marketDataCache.set(cacheKey, topStocks);
      } else {
        setMarketData([]); // Set empty array if no data
      }
    } catch (error) {
      console.error('Error fetching investment data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * used to get budget List
   */
  const getBudgetList = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),

        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .groupBy(Budgets.id)
      .orderBy(desc(Budgets.id));
    setBudgetList(result);
    getAllExpenses();
    getIncomeList();
  };

  /**
   * Get Income stream list
   */
  const getIncomeList = async () => {
    try {
      const result = await db
        .select({
          ...getTableColumns(Incomes),
          totalAmount: sql`SUM(CAST(${Incomes.amount} AS NUMERIC))`.mapWith(
            Number
          ),
        })
        .from(Incomes)
        .where(eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress))
        .groupBy(Incomes.id);

      setIncomeList(result);
    } catch (error) {
      console.error("Error fetching income list:", error);
    }
  };

  /**
   * Used to get All expenses belong to users
   */
  const getAllExpenses = async () => {
    const result = await db
      .select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        createdAt: Expenses.createdAt,
      })
      .from(Budgets)
      .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
      .orderBy(desc(Expenses.id));
    setExpensesList(result);
  };

  // Calculate summary statistics with proper type conversion
  const totalIncome = incomeList.reduce((sum, income) => {
    const amount = parseFloat(income.totalAmount) || parseFloat(income.amount) || 0;
    return sum + amount;
  }, 0);
  
  const totalExpenses = expensesList.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount) || 0;
    return sum + amount;
  }, 0);
  
  const netIncome = totalIncome - totalExpenses;

  // Format numbers properly
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Show loading if user is not properly loaded
  if (!user || !user.primaryEmailAddress?.emailAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Loading your data...</h2>
          <p className="text-gray-600 text-lg">Please wait while we fetch your financial information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName || user?.fullName} 👋
              </h1>
              <p className="text-gray-600">
                Here's your financial overview for today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live data</span>
              </div>
              <div className="relative report-menu">
                <button
                  onClick={() => setShowReportMenu(!showReportMenu)}
                  disabled={generatingReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingReport ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{generatingReport ? 'Generating...' : 'Download Report'}</span>
                </button>
                
                {showReportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => generateReport('csv')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>CSV Report</span>
                      </button>
                      <button
                        onClick={() => generateReport('json')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4 text-green-600" />
                        <span>JSON Report</span>
                      </button>
                      <button
                        onClick={() => generateReport('html')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>HTML Report</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* AI Insights Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
            <p className="text-sm text-gray-600">Personalized financial advice and analysis</p>
          </div>
          <div className="p-6">
            <CardInfo budgetList={budgetList} incomeList={incomeList} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{formatCurrency(totalIncome)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{formatCurrency(netIncome)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Budgets</p>
                <p className="text-2xl font-bold text-purple-600">{budgetList.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Market Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Market Data */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Stock Market</h3>
                <p className="text-sm text-gray-600">Live market data and trends</p>
              </div>
              <div className="p-6">
                <MarketDataWidget marketData={marketData} loading={loading} />
              </div>
            </div>
            
            {/* Crypto Market Data */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Cryptocurrency</h3>
                <p className="text-sm text-gray-600">Top crypto prices and movements</p>
              </div>
              <div className="p-6">
                <CryptoMarketWidget loading={loading} />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Investment Summary Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Portfolio Summary</h3>
                <p className="text-sm text-gray-600">Your investment overview</p>
              </div>
              <div className="p-6">
                <InvestmentSummary portfolioData={portfolioData} loading={loading} />
              </div>
            </div>
            
            {/* Latest Budgets */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Latest Budgets</h3>
                <p className="text-sm text-gray-600">Your recent budget categories</p>
              </div>
              <div className="p-6 space-y-4">
                {budgetList?.length > 0
                  ? budgetList.slice(0, 3).map((budget, index) => (
                      <BudgetItem budget={budget} key={index} />
                    ))
                  : [1, 2, 3].map((item, index) => (
                      <div
                        key={index}
                        className="h-16 w-full bg-gray-200 rounded-lg animate-pulse"
                      ></div>
                    ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Access your most used features</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Link 
                href="/dashboard/investments" 
                className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-sm text-gray-900 text-center">View Investments</p>
                <p className="text-xs text-gray-600 mt-1 text-center">Track your portfolio</p>
              </Link>
              
              <Link 
                href="/dashboard/investments" 
                className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-sm text-gray-900 text-center">Add Investment</p>
                <p className="text-xs text-gray-600 mt-1 text-center">Buy stocks/funds</p>
              </Link>
              
              <Link 
                href="/dashboard/investments?tab=market" 
                className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-sm text-gray-900 text-center">Market Data</p>
                <p className="text-xs text-gray-600 mt-1 text-center">Live prices</p>
              </Link>
              
              <Link 
                href="/dashboard/budgets" 
                className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-sm text-gray-900 text-center">Manage Budgets</p>
                <p className="text-xs text-gray-600 mt-1 text-center">Track spending</p>
              </Link>

              <div className="relative group report-menu">
                <button
                  onClick={() => setShowReportMenu(!showReportMenu)}
                  disabled={generatingReport}
                  className="w-full group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 hover:shadow-md transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {generatingReport ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FileText className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <p className="font-semibold text-sm text-gray-900 text-center">
                    {generatingReport ? 'Generating...' : 'Download Report'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 text-center">Export data</p>
                </button>
                
                {showReportMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => generateReport('csv')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>CSV Report</span>
                      </button>
                      <button
                        onClick={() => generateReport('json')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4 text-green-600" />
                        <span>JSON Report</span>
                      </button>
                      <button
                        onClick={() => generateReport('html')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>HTML Report</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Spending Overview</h3>
                <p className="text-sm text-gray-600">Monthly budget vs expenses</p>
              </div>
              <div className="p-6">
                <BarChartDashboard budgetList={budgetList} />
              </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                <p className="text-sm text-gray-600">Your latest transactions</p>
              </div>
              <div className="p-6">
                <ExpenseListTable
                  expensesList={expensesList}
                  refreshData={() => getBudgetList()}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Additional Info Cards */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Financial Tips</h3>
              <p className="text-sm opacity-90 mb-4">
                Consider setting aside 20% of your income for savings and investments.
              </p>
              <div className="flex items-center text-sm opacity-75">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                AI-powered advice
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Savings Goal</h3>
              <p className="text-sm opacity-90 mb-4">
                You're on track to reach your monthly savings target!
              </p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-xs opacity-75">75% of monthly goal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
