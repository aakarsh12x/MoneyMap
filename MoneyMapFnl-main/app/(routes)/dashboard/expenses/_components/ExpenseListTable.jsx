import { db } from "@/utils/dbConfig";
import { Expenses, Currencies } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatCurrencyClient } from "@/utils/currencyUtils";

function ExpenseListTable({ expensesList, refreshData }) {
  const [currencySymbols, setCurrencySymbols] = useState({});
  
  useEffect(() => {
    // Load currency symbols when component mounts
    loadCurrencySymbols();
  }, []);
  
  const loadCurrencySymbols = async () => {
    try {
      const currencies = await db.select().from(Currencies);
      const symbolMap = {};
      
      currencies.forEach(currency => {
        symbolMap[currency.code] = currency.symbol;
      });
      
      setCurrencySymbols(symbolMap);
    } catch (error) {
      console.error("Error loading currency symbols:", error);
    }
  };
  
  const getCurrencySymbol = (currencyCode) => {
    return currencySymbols[currencyCode] || '$';
  };
  
  const deleteExpense = async (expense) => {
    try {
      const result = await db
        .delete(Expenses)
        .where(eq(Expenses.id, expense.id))
        .returning();

      if (result) {
        toast("Expense Deleted!");
        refreshData();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };
  
  return (
    <div className="mt-3">
      <h2 className="font-bold text-lg mb-3">Latest Expenses</h2>
      
      {/* Header - hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-5 rounded-t-lg bg-slate-200 p-3 font-medium text-gray-700">
        <h2>Name</h2>
        <h2>Amount</h2>
        <h2>Currency</h2>
        <h2>Date</h2>
        <h2>Action</h2>
      </div>
      
      {/* Empty state */}
      {expensesList.length === 0 && (
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No expenses found. Add your first expense to get started.</p>
        </div>
      )}
      
      {/* Expense list - card style on mobile */}
      <div className="space-y-3">
        {expensesList.map((expense, index) => (
          <div 
            key={expense.id || index} 
            className="bg-white shadow-sm rounded-lg p-4 md:p-3 md:rounded-none md:shadow-none md:bg-slate-50 md:grid md:grid-cols-5 md:items-center"
          >
            {/* Mobile card layout */}
            <div className="md:hidden flex justify-between items-start mb-2">
              <h3 className="font-medium">{expense.name}</h3>
              <button 
                onClick={() => deleteExpense(expense)}
                className="text-red-500"
              >
                <Trash size={18} />
              </button>
            </div>
            
            <div className="md:hidden flex justify-between text-sm">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">
                {formatCurrencyClient(expense.amount, getCurrencySymbol(expense.currency))}
                <span className="text-xs ml-1 text-gray-500">{expense.currency}</span>
              </span>
            </div>
            
            <div className="md:hidden flex justify-between text-sm mt-1">
              <span className="text-gray-500">Date:</span>
              <span>{expense.createdAt}</span>
            </div>
            
            {/* Desktop row layout */}
            <h2 className="hidden md:block">{expense.name}</h2>
            <h2 className="hidden md:block">
              {formatCurrencyClient(expense.amount, getCurrencySymbol(expense.currency))}
            </h2>
            <h2 className="hidden md:block">{expense.currency}</h2>
            <h2 className="hidden md:block">{expense.createdAt}</h2>
            <div className="hidden md:block">
              <button
                onClick={() => deleteExpense(expense)}
                className="flex items-center text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash size={18} className="mr-1" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpenseListTable;
