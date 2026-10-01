import React, { useState } from 'react';
import { useExpenseTracker } from './hooks/useExpenseTracker';
import { Navigation } from './components/Navigation';
import { ExpenseModal } from './components/ExpenseModal';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetPage } from './pages/BudgetPage';

export function App() {
  const {
    expenses,
    budgets,
    categories,
    selectedMonth,
    setSelectedMonth,
    loading,
    error,
    toast,
    refreshData,
    addExpense,
    updateExpense,
    deleteExpense,
    saveBudget,
  } = useExpenseTracker();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
    } else {
      await addExpense(data);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 md:pb-0">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={refreshData}
        loading={loading}
      />

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toast.message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={refreshData} className="underline font-semibold text-xs ml-4">
              Retry Sync
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            expenses={expenses}
            budgets={budgets}
            categories={categories}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onOpenAddModal={handleOpenAdd}
            onNavigateToExpenses={() => setActiveTab('expenses')}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesPage
            expenses={expenses}
            categories={categories}
            selectedMonth={selectedMonth}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={deleteExpense}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPage
            budgets={budgets}
            selectedMonth={selectedMonth}
            onSaveBudget={saveBudget}
          />
        )}
      </main>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingExpense}
        categories={categories}
      />
    </div>
  );
}

export default App;