const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = {
  async getExpenses() {
    const res = await fetch(`${API_BASE}/expenses`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async addExpense(expense) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async updateExpense(id, expense) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  },

  async deleteExpense(id) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  },

  async getBudgets() {
    const res = await fetch(`${API_BASE}/budgets`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async saveBudget(month, amount, notes) {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, amount, notes }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  },
};