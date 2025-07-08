import React from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  defs,
  linearGradient,
  stop
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-3 border border-blue-100">
        <p className="font-semibold text-blue-700 mb-1">{label}</p>
        <p className="text-sm text-gray-700">Budget: <span className="font-bold text-blue-600">₹{payload[1]?.value?.toLocaleString('en-IN')}</span></p>
        <p className="text-sm text-gray-700">Spent: <span className="font-bold text-purple-600">₹{payload[0]?.value?.toLocaleString('en-IN')}</span></p>
      </div>
    );
  }
  return null;
}

function BarChartDashboard({ budgetList }) {
  return (
    <div className="border rounded-2xl p-5 bg-white">
      <h2 className="font-bold text-lg mb-2">Budget vs Spend Overview</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={budgetList}
          margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
          barGap={8}
        >
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6366F1' }} />
          <YAxis tick={{ fontSize: 13, fill: '#6366F1' }} tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EEF2FF' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="totalSpend" name="Spent" fill="url(#colorSpend)" radius={[8, 8, 0, 0]} barSize={28} />
          <Bar dataKey="amount" name="Budget" fill="url(#colorBudget)" radius={[8, 8, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-500 mt-2">Hover over bars for details. Spent = purple, Budget = blue.</div>
    </div>
  );
}

export default BarChartDashboard;
