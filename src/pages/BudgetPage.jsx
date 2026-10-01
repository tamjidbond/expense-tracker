import React, { useState, useEffect } from 'react';
import { getMonthName } from '../utils/formatters';
import { Save } from 'lucide-react';

export const BudgetPage = ({ budgets = [], selectedMonth = '', onSaveBudget }) => {
  const currentBudget = budgets.find((b) => b.month === selectedMonth);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentBudget) {
      setAmount(currentBudget.amount !== undefined && currentBudget.amount !== null ? String(currentBudget.amount) : '');
      setNotes(currentBudget.notes || '');
    } else {
      setAmount('');
      setNotes('');
    }
  }, [currentBudget, selectedMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) return;

    setSaving(true);
    try {
      await onSaveBudget(selectedMonth, num, notes);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Monthly Budget Setup</h2>
        <p className="text-sm text-slate-500">Configure financial targets for {getMonthName(selectedMonth)}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Month</label>
            <input
              type="month"
              value={selectedMonth || ''}
              disabled
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Monthly Budget Limit</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={amount || ''}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notes / Plan</label>
            <textarea
              rows={3}
              placeholder="Budget objectives..."
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving to Google Sheets...' : 'Save Monthly Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};