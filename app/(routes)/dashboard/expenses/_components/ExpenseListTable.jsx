import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function ExpenseListTable({ expensesList, refreshData }) {
  const deleteExpense = async (expense) => {
    const result = await db
      .delete(Expenses)
      .where(eq(Expenses.id, expense.id))
      .returning();

    if (result) {
      toast("Expense Deleted!");
      refreshData();
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="mt-3">
      <h2 className="font-bold text-lg">Latest Expenses</h2>
      <div className="grid grid-cols-4 rounded-tl-xl rounded-tr-xl bg-slate-200 p-2 mt-3">
        <h2 className="font-bold">Name</h2>
        <h2 className="font-bold">Amount</h2>
        <h2 className="font-bold">Date</h2>
        <h2 className="font-bold">Action</h2>
      </div>
      {expensesList.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-slate-50 rounded-b-xl">No expenses found.</div>
      ) : (
        expensesList.map((expenses, index) => (
          <div className="grid grid-cols-4 bg-slate-50 rounded-bl-xl rounded-br-xl p-2" key={expenses.id || index}>
            <h2>{expenses.name}</h2>
            <h2>{formatCurrency(expenses.amount)}</h2>
            <h2>{formatDate(expenses.createdAt)}</h2>
            <h2
              onClick={() => deleteExpense(expenses)}
              className="text-red-500 cursor-pointer"
            >
              Delete
            </h2>
          </div>
        ))
      )}
    </div>
  );
}

export default ExpenseListTable;
