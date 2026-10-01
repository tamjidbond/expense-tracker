import React from 'react';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { calculateBudgetMetrics } from '../utils/budgetCalculator';
import { Plus, ArrowUpRight, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage = ({
  expenses = [],
  budgets = [],
  categories = [],
  selectedMonth = '',
  setSelectedMonth,
  onOpenAddModal,
  onNavigateToExpenses,
}) => {
  const currentBudget = budgets.find((b) => b.month === selectedMonth);
  const metrics = calculateBudgetMetrics(expenses, currentBudget, selectedMonth);

  // Safe Month Filtering
  const monthExpenses = expenses.filter((e) => {
    const expMonth = e.month || (e.date ? String(e.date).substring(0, 7) : '');
    return expMonth === selectedMonth;
  });

  // Safe Days-in-Month Calculation
  const daysInMonth = selectedMonth.includes('-')
    ? new Date(
        parseInt(selectedMonth.split('-')[0], 10),
        parseInt(selectedMonth.split('-')[1], 10),
        0
      ).getDate()
    : 30;

  // Daily Chart Aggregation
  const dailyChartData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayStr = String(dayNum).padStart(2, '0');
    const fullDateStr = `${selectedMonth}-${dayStr}`;

    const dayTotal = monthExpenses.reduce((sum, e) => {
      if (!e.date) return sum;
      const cleanExpDate = String(e.date).split('T')[0].trim();
      const [, , d] = cleanExpDate.split('-');
      const expDayNum = parseInt(d, 10);

      if (cleanExpDate === fullDateStr || expDayNum === dayNum) {
        const amt = parseFloat(e.amount);
        return sum + (isNaN(amt) ? 0 : amt);
      }
      return sum;
    }, 0);

    return { day: dayNum, amount: dayTotal };
  });

  // Category Breakdown Aggregation
  const categoryTotals = {};
  monthExpenses.forEach((e) => {
    const cat = e.category || 'Other';
    const amt = parseFloat(e.amount) || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
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
            value={selectedMonth || ''}
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

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Budget</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(metrics.monthlyBudget)}</p>
          <p className="text-xs text-slate-400 mt-2">Target Limit</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(metrics.totalSpent)}</p>
          <p className="text-xs text-slate-400 mt-2">{metrics.totalTransactions} transactions</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm ${statusColors[metrics.budgetStatus] || statusColors.green}`}>
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

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Today's Spent</p>
          <p className="text-xl font-bold text-emerald-950 mt-1">{formatCurrency(metrics.todaySpent)}</p>
          <p className="text-xs text-emerald-600 mt-2">Spent today</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm ${
          typeof metrics.todayBudgetLeft === 'number' && metrics.todayBudgetLeft < 0
            ? 'bg-rose-50/60 border-rose-200 text-rose-800'
            : 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
        }`}>
          <p className="text-xs font-semibold uppercase tracking-wider">Today's Budget Left</p>
          <p className="text-xl font-bold mt-1">
            {typeof metrics.todayBudgetLeft === 'number'
              ? formatCurrency(metrics.todayBudgetLeft)
              : metrics.todayBudgetLeft}
          </p>
          <p className="text-xs mt-2 opacity-80">Remaining for today</p>
        </div>
      </div>

      {/* Analytics Charts */}
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

      {/* Recent Transactions Table */}
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
                  {exp.category ? exp.category.substring(0, 3).toUpperCase() : 'EXP'}
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