import React from 'react';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { calculateBudgetMetrics } from '../utils/budgetCalculator';
import { Plus, ArrowUpRight, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage = ({
  expenses,
  budgets,
  categories,
  selectedMonth,
  setSelectedMonth,
  onOpenAddModal,
  onNavigateToExpenses,
}) => {
  const currentBudget = budgets.find((b) => b.month === selectedMonth);
  const metrics = calculateBudgetMetrics(expenses, currentBudget, selectedMonth);
  const monthExpenses = expenses.filter((e) => e.month === selectedMonth);

  const daysInMonth = new Date(
    parseInt(selectedMonth.split('-')[0]),
    parseInt(selectedMonth.split('-')[1]),
    0
  ).getDate();

  const dailyChartData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayStr = String(i + 1).padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayStr}`;
    const dayTotal = monthExpenses
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
    return { day: i + 1, amount: dayTotal };
  });

  const categoryTotals = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categoryChartData = Object.keys(categoryTotals).map((cat) => {
    const config = categories.find((c) => c.name === cat);
    return {
      name: cat,
      value: categoryTotals[cat],
      color: config?.color || '#10B981',
    };
  });

  const statusColors = {
    green: 'border-emerald-500 bg-emerald-50/50 text-emerald-700',
    yellow: 'border-yellow-500 bg-yellow-50/50 text-yellow-700',
    orange: 'border-amber-500 bg-amber-50/50 text-amber-700',
    red: 'border-rose-500 bg-rose-50/50 text-rose-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview for {getMonthName(selectedMonth)}</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Budget</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(metrics.monthlyBudget)}</p>
          <p className="text-xs text-slate-400 mt-2">Target</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(metrics.totalSpent)}</p>
          <p className="text-xs text-slate-400 mt-2">{metrics.totalTransactions} transactions</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm ${statusColors[metrics.budgetStatus]}`}>
          <p className="text-xs font-semibold uppercase tracking-wider">Remaining Budget</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(metrics.remainingBudget)}</p>
          <p className="text-xs mt-2 font-medium">{metrics.budgetUtilization.toFixed(1)}% used</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Spending Limit</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {typeof metrics.recommendedDailyLimit === 'number'
              ? formatCurrency(metrics.recommendedDailyLimit)
              : metrics.recommendedDailyLimit}
          </p>
          <p className="text-xs text-slate-400 mt-2">{metrics.daysRemaining} days remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Daily Spending Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip formatter={(val) => [formatCurrency(val), 'Spent']} labelFormatter={(day) => `Day ${day}`} />
                <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Category Breakdown</h3>
          <div className="h-64 flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No expenses recorded for this month</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
          <button onClick={onNavigateToExpenses} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {monthExpenses.slice(0, 5).map((exp) => (
            <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600 text-xs font-semibold">
                  {exp.category.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{exp.item}</p>
                  <p className="text-xs text-slate-400">{exp.date} • {exp.paymentMethod}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(exp.amount)}</span>
            </div>
          ))}

          {monthExpenses.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">No recent transactions found</div>
          )}
        </div>
      </div>
    </div>
  );
};