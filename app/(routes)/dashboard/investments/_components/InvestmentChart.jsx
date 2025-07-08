"use client"
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function InvestmentChart({ portfolio }) {
  // Prepare data for the chart
  const chartData = portfolio?.map(investment => ({
    name: investment.symbol || investment.code,
    invested: investment.totalInvested,
    current: investment.currentValue,
    profit: investment.profitLoss
  })) || [];

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No portfolio data available</p>
          <p className="text-sm text-gray-400 mt-1">Add investments to see performance charts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => [
              formatCurrency(value), 
              name === 'invested' ? 'Invested' : 
              name === 'current' ? 'Current Value' : 'Profit/Loss'
            ]}
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="invested" fill="#3B82F6" name="Invested" />
          <Bar dataKey="current" fill="#10B981" name="Current Value" />
          <Bar dataKey="profit" fill="#EF4444" name="Profit/Loss" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default InvestmentChart; 