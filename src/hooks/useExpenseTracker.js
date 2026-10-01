import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getCurrentMonthString } from '../utils/formatters';

export const useExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expData, budData, catData] = await Promise.all([
        api.getExpenses(),
        api.getBudgets(),
        api.getCategories(),
      ]);
      setExpenses(expData);
      setBudgets(budData);
      setCategories(catData.length ? catData : [
        { name: 'Food', color: '#10B981' },
        { name: 'Groceries', color: '#3B82F6' },
        { name: 'Shopping', color: '#8B5CF6' },
        { name: 'Bills', color: '#EF4444' },
        { name: 'Transportation', color: '#F59E0B' },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to sync with Google Sheets');
      showToast('Error loading spreadsheet data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addExpense = async (expenseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });

    const result = await response.json();

    if (result.success) {
      // Re-fetch all expenses directly from server to ensure sync
      await fetchExpenses(); 
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    console.error('Failed to add expense:', err);
    throw err;
  }
};

  const updateExpense = async (id, data) => {
    try {
      await api.updateExpense(id, data);
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
      showToast('Expense updated!');
    } catch (err) {
      showToast('Failed to update expense', 'error');
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast('Expense removed!');
    } catch (err) {
      showToast('Failed to delete expense', 'error');
      throw err;
    }
  };

  const saveBudget = async (month, amount, notes) => {
    try {
      const saved = await api.saveBudget(month, amount, notes);
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.month === month);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });
      showToast('Monthly budget updated!');
    } catch (err) {
      showToast('Failed to save budget', 'error');
      throw err;
    }
  };

  return {
    expenses,
    budgets,
    categories,
    selectedMonth,
    setSelectedMonth,
    loading,
    error,
    toast,
    refreshData: fetchData,
    addExpense,
    updateExpense,
    deleteExpense,
    saveBudget,
  };
};