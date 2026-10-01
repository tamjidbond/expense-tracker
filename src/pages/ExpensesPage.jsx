import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { Search, Plus, Trash2, Edit2, Calendar, CreditCard, Tag } from 'lucide-react';

export const ExpensesPage = ({
  expenses = [],
  categories = [],
  selectedMonth = '',
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  const filtered = expenses.filter((e) => {
    // 1. Safe month matching (falls back to e.date if e.month is missing)
    const expenseMonth = e.month || (e.date ? String(e.date).substring(0, 7) : '');
    const matchesMonth = selectedMonth ? expenseMonth === selectedMonth : true;

    // 2. Safe string searching (prevents .toLowerCase() on undefined)
    const itemText = (e.item || '').toLowerCase();
    const notesText = (e.notes || '').toLowerCase();
    const queryText = (search || '').toLowerCase();
    const matchesSearch = itemText.includes(queryText) || notesText.includes(queryText);

    // 3. Category & Payment method matching
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesPayment = selectedPayment === 'ALL' || e.paymentMethod === selectedPayment;

    return matchesMonth && matchesSearch && matchesCategory && matchesPayment;
  });

  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    const amountA = parseFloat(a.amount) || 0;
    const amountB = parseFloat(b.amount) || 0;

    if (sortOrder === 'newest') return timeB - timeA;
    if (sortOrder === 'oldest') return timeA - timeB;
    if (sortOrder === 'highest') return amountB - amountA;
    if (sortOrder === 'lowest') return amountA - amountB;
    return 0;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Expenses</h2>
          <p className="text-xs sm:text-sm text-slate-500">Manage and filter your transaction records</p>
        </div>
        <button
          onClick={onAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search item or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Payment Method Filter */}
        <select
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Mobile Payment">Mobile Payment</option>
          <option value="Other">Other</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="highest">Sort: Highest Amount</option>
          <option value="lowest">Sort: Lowest Amount</option>
        </select>
      </div>

      {/* Transactions Display Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Mobile View: Card List (Hidden on sm and larger) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {sorted.map((exp) => (
            <div key={exp.id} className="p-3.5 flex flex-col gap-2 hover:bg-slate-50/50 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{exp.item}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{exp.date}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900 text-base">{formatCurrency(exp.amount)}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-medium">
                    <Tag className="w-2.5 h-2.5" />
                    {exp.category || 'Uncategorized'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    {exp.paymentMethod || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(exp)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No transactions matching your criteria
            </div>
          )}
        </div>

        {/* Desktop & Tablet View: Full Table (Hidden on small mobile) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{exp.date}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{exp.item}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      {exp.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{exp.paymentMethod || 'N/A'}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(exp.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(exp)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(exp.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No transactions matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};