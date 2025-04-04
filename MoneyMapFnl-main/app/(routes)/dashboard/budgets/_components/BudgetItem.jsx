import { db } from "@/utils/dbConfig";
import { formatCurrencyClient } from "@/utils/currencyUtils";
import { Currencies } from "@/utils/schema";
import { CircleDollarSign, Plus, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function BudgetItem({ budget }) {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  
  useEffect(() => {
    loadCurrencySymbol();
  }, [budget.currency]);
  
  const loadCurrencySymbol = async () => {
    try {
      if (!budget.currency) return;
      
      const result = await db
        .select()
        .from(Currencies)
        .where(c => c.code.equals(budget.currency))
        .limit(1);
      
      if (result && result.length > 0) {
        setCurrencySymbol(result[0].symbol);
      }
    } catch (error) {
      console.error("Error loading currency symbol:", error);
    }
  };

  // Calculate the remaining amount and percentage
  const totalBudget = parseFloat(budget.amount) || 0;
  const spent = budget.totalSpend || 0;
  const remaining = totalBudget - spent;
  const percentageSpent = Math.min(Math.round((spent / totalBudget) * 100), 100) || 0;
  const percentageRemaining = 100 - percentageSpent;

  const progressBarClass = percentageSpent > 80 
    ? "bg-red-500" 
    : percentageSpent > 60 
      ? "bg-orange-500" 
      : "bg-green-500";

  return (
    <div className="border p-5 rounded-lg hover:border-blue-600 transition-all">
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <div className="p-3 bg-blue-100 rounded-md">
            <div className="text-2xl">{budget.icon}</div>
          </div>
          <div>
            <h2 className="font-medium">{budget.name}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <CircleDollarSign size={16} className="mr-1" />
              {formatCurrencyClient(totalBudget, currencySymbol)}
              <span className="ml-1">{budget.currency}</span>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/expenses/${budget.id}`}>
          <button className="p-1 rounded-md hover:bg-gray-100">
            <Plus size={17} />
          </button>
        </Link>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <div className="flex items-center">
            <ReceiptText size={14} className="mr-1" />
            <span>Spent: {formatCurrencyClient(spent, currencySymbol)}</span>
          </div>
          <div>
            Remaining: {formatCurrencyClient(remaining, currencySymbol)}
          </div>
        </div>
        
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressBarClass}`} 
            style={{ width: `${percentageSpent}%` }}
          ></div>
        </div>
        
        <div className="mt-1 text-xs text-right text-gray-500">
          {percentageSpent}% used
        </div>
      </div>
    </div>
  );
}

export default BudgetItem;
