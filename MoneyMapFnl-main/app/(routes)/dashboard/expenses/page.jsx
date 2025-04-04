"use client"
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import ExpenseListTable from './_components/ExpenseListTable';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus } from 'lucide-react';

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      getAllExpenses();
    }
  }, [user]);

  /**
   * Used to get All expenses belong to users
   */
  const getAllExpenses = async () => {
    setLoading(true);
    try {
      const result = await db.select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        createdAt: Expenses.createdAt
      })
        .from(Budgets)
        .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
        .orderBy(desc(Expenses.id));
      
      setExpensesList(result);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='p-4 md:p-8'>
      <div className="flex justify-between items-center mb-6">
        <h1 className='font-bold text-2xl md:text-3xl text-gray-800'>My Expenses</h1>
        
        <Link href="/dashboard/expenses/add" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm transition-colors">
          <Plus size={18} />
          <span>Add New</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse h-6 w-24 bg-gray-200 rounded-md"></div>
        </div>
      ) : (
        <ExpenseListTable 
          refreshData={getAllExpenses}
          expensesList={expensesList}
        />
      )}
    </div>
  )
}

export default ExpensesScreen