"use client";
import { db } from "@/utils/dbConfig";
import { Currencies, UserSettings } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { CircleDollarSign, PiggyBank, Tag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { eq } from "drizzle-orm";
import { convertCurrency, formatCurrencyClient } from "@/utils/currencyUtils";

function CardInfo({ budgetList, incomeList }) {
  const { user } = useUser();
  const [currencies, setCurrencies] = useState({});
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserCurrency();
      loadCurrencies();
    }
  }, [user]);

  useEffect(() => {
    if (Object.keys(currencies).length > 0) {
      calculateTotals();
    }
  }, [budgetList, incomeList, currencies, baseCurrency]);

  const loadUserCurrency = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const result = await db
        .select()
        .from(UserSettings)
        .where(eq(UserSettings.userId, userEmail));
      
      if (result && result.length > 0) {
        setBaseCurrency(result[0].baseCurrency);
      }
    } catch (error) {
      console.error("Error loading user currency:", error);
    }
  };

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const currencyData = await db.select().from(Currencies);
      
      // Create a map for easier access
      const currencyMap = {};
      currencyData.forEach(currency => {
        currencyMap[currency.code] = currency;
      });
      
      setCurrencies(currencyMap);
    } catch (error) {
      console.error("Error loading currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = async () => {
    try {
      let totalBudgetAmount = 0;
      let totalIncomeAmount = 0;
      let totalSpentAmount = 0;

      // Calculate total budget in base currency
      for (const budget of budgetList) {
        const amount = parseFloat(budget.amount) || 0;
        const currency = budget.currency || "USD";
        
        // Convert to base currency
        if (currency !== baseCurrency) {
          const rate = currencies[currency]?.rate || 1;
          const baseRate = currencies[baseCurrency]?.rate || 1;
          totalBudgetAmount += (amount / rate) * baseRate;
        } else {
          totalBudgetAmount += amount;
        }
      }

      // Calculate total income in base currency
      for (const income of incomeList) {
        const amount = parseFloat(income.amount) || 0;
        const currency = income.currency || "USD";
        
        // Convert to base currency
        if (currency !== baseCurrency) {
          const rate = currencies[currency]?.rate || 1;
          const baseRate = currencies[baseCurrency]?.rate || 1;
          totalIncomeAmount += (amount / rate) * baseRate;
        } else {
          totalIncomeAmount += amount;
        }
      }

      // Calculate total spent in base currency
      for (const budget of budgetList) {
        const spent = budget.totalSpend || 0;
        const currency = budget.currency || "USD";
        
        // Convert to base currency
        if (currency !== baseCurrency) {
          const rate = currencies[currency]?.rate || 1;
          const baseRate = currencies[baseCurrency]?.rate || 1;
          totalSpentAmount += (spent / rate) * baseRate;
        } else {
          totalSpentAmount += spent;
        }
      }

      setTotalBudget(Math.round(totalBudgetAmount * 100) / 100);
      setTotalIncome(Math.round(totalIncomeAmount * 100) / 100);
      setTotalSpent(Math.round(totalSpentAmount * 100) / 100);
    } catch (error) {
      console.error("Error calculating totals:", error);
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    return currencies[currencyCode]?.symbol || "$";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
      <div className="p-5 bg-white rounded-lg flex items-center gap-3 shadow-sm border">
        <div className="p-3 bg-purple-100 rounded-md">
          <PiggyBank className="text-purple-600" />
        </div>
        <div>
          <h2 className="text-gray-400">Total Budget</h2>
          <h2 className="text-xl font-bold text-gray-800">
            {loading 
              ? "Loading..." 
              : formatCurrencyClient(totalBudget, getCurrencySymbol(baseCurrency))
            }
            <span className="text-xs ml-1">{baseCurrency}</span>
          </h2>
        </div>
      </div>
      <div className="p-5 bg-white rounded-lg flex items-center gap-3 shadow-sm border">
        <div className="p-3 bg-pink-100 rounded-md">
          <CircleDollarSign className="text-pink-600" />
        </div>
        <div>
          <h2 className="text-gray-400">Total Income</h2>
          <h2 className="text-xl font-bold text-gray-800">
            {loading 
              ? "Loading..." 
              : formatCurrencyClient(totalIncome, getCurrencySymbol(baseCurrency))
            }
            <span className="text-xs ml-1">{baseCurrency}</span>
          </h2>
        </div>
      </div>
      <div className="p-5 bg-white rounded-lg flex items-center gap-3 shadow-sm border lg:col-span-1 md:col-span-2">
        <div className="p-3 bg-orange-100 rounded-md">
          <Tag className="text-orange-600" />
        </div>
        <div>
          <h2 className="text-gray-400">Total Spent</h2>
          <h2 className="text-xl font-bold text-gray-800">
            {loading 
              ? "Loading..." 
              : formatCurrencyClient(totalSpent, getCurrencySymbol(baseCurrency))
            }
            <span className="text-xs ml-1">{baseCurrency}</span>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default CardInfo;
