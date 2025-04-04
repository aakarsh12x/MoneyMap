"use client"
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses, UserSettings } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader, ArrowLeft } from "lucide-react";
import moment from "moment";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CurrencySelector } from '@/components/ui/currency-selector';

function AddExpensePage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState("");
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchBudgets();
      loadUserCurrency();
    }
  }, [user]);

  const loadUserCurrency = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const result = await db
        .select()
        .from(UserSettings)
        .where(eq(UserSettings.userId, userEmail));
      
      if (result && result.length > 0) {
        setCurrency(result[0].baseCurrency);
      }
    } catch (error) {
      console.error("Error loading user currency:", error);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoadingBudgets(true);
      const result = await db
        .select()
        .from(Budgets)
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
      
      setBudgets(result);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budgets");
    } finally {
      setLoadingBudgets(false);
    }
  };

  const addNewExpense = async () => {
    if (!selectedBudget) {
      toast.error("Please select a budget");
      return;
    }

    try {
      setLoading(true);
      const result = await db
        .insert(Expenses)
        .values({
          name: name,
          amount: amount,
          budgetId: selectedBudget,
          currency: currency,
          createdAt: moment().format("DD/MM/YYYY"),
        })
        .returning();

      if (result) {
        toast.success("New expense added!");
        router.push('/dashboard/expenses');
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/expenses" className="mr-4">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-2xl md:text-3xl text-gray-800">Add New Expense</h1>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Name
            </label>
            <Input
              placeholder="e.g. Grocery Shopping"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <Input
              placeholder="e.g. 50.00"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <CurrencySelector 
              value={currency}
              onChange={setCurrency}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Category
            </label>
            {loadingBudgets ? (
              <div className="flex justify-center py-2">
                <Loader size={20} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <Select onValueChange={setSelectedBudget} value={selectedBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id.toString()}>
                      {budget.name} ({budget.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <Button
            onClick={addNewExpense}
            disabled={!name || !amount || !selectedBudget || loading}
            className="w-full mt-2"
          >
            {loading ? (
              <Loader size={20} className="animate-spin mr-2" />
            ) : "Add Expense"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddExpensePage 