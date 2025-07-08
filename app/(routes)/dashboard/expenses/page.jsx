"use client"
import React, { useEffect, useState } from 'react'
import { db } from '@/utils/dbConfig';
import { Budgets, Expenses } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import ExpenseListTable from './_components/ExpenseListTable';
import AddExpense from './_components/AddExpense';
import { useUser } from '@clerk/nextjs';

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      getAllExpenses();
      getBudgets();
    }
  }, [user]);

  const getAllExpenses = async () => {
    const result = await db.select({
      id: Expenses.id,
      name: Expenses.name,
      amount: Expenses.amount,
      createdAt: Expenses.createdAt,
      budgetId: Expenses.budgetId,
    }).from(Budgets)
      .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
      .orderBy(desc(Expenses.id));
    setExpensesList(result);
  };

  const getBudgets = async () => {
    const result = await db.select({
      id: Budgets.id,
      name: Budgets.name,
    }).from(Budgets)
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress));
    setBudgetList(result);
    if (result.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(result[0].id);
    }
  };

  return (
    <div className='p-10'>
      <h2 className='font-bold text-3xl mb-6'>My Expenses</h2>
      <div className='mb-8 bg-white p-6 rounded-2xl shadow-sm border max-w-xl'>
        <h3 className='font-semibold text-lg mb-2'>Add Expense</h3>
        <div className='mb-3'>
          <label className='block text-sm font-medium mb-1'>Select Budget</label>
          <select
            className='w-full border rounded-lg p-2 text-gray-700'
            value={selectedBudgetId}
            onChange={e => setSelectedBudgetId(e.target.value)}
          >
            {budgetList.length === 0 && <option value=''>No budgets found</option>}
            {budgetList.map(budget => (
              <option value={budget.id} key={budget.id}>{budget.name}</option>
            ))}
          </select>
        </div>
        <AddExpense
          budgetId={selectedBudgetId}
          user={user}
          refreshData={getAllExpenses}
        />
      </div>
      <ExpenseListTable refreshData={getAllExpenses} expensesList={expensesList} />
    </div>
  )
}

export default ExpensesScreen