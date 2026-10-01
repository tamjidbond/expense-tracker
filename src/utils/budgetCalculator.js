export const calculateBudgetMetrics = (expenses = [], budget = null, selectedMonth = '') => {
  const safeSelectedMonth = selectedMonth || new Date().toISOString().substring(0, 7);
  const todayStr = new Date().toISOString().substring(0, 10); // 'YYYY-MM-DD'

  // Filter expenses for selected month
  const monthExpenses = expenses.filter((e) => {
    const expenseMonth = e.month || (e.date ? String(e.date).substring(0, 7) : '');
    return expenseMonth === safeSelectedMonth;
  });

  // Calculate Today's Spent across expenses matching today's date
  const todaySpent = expenses.reduce((sum, e) => {
    if (!e.date) return sum;
    const cleanDate = String(e.date).split('T')[0].trim();
    if (cleanDate === todayStr) {
      const amt = parseFloat(e.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }
    return sum;
  }, 0);

  // Total spent for the month
  const totalSpent = monthExpenses.reduce((sum, e) => {
    const amt = parseFloat(e.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const parsedBudget = budget ? parseFloat(budget.amount) : 0;
  const monthlyBudget = isNaN(parsedBudget) ? 0 : parsedBudget;
  const remainingBudget = monthlyBudget - totalSpent;
  const budgetUtilization = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  // Date parsing
  const [yearStr, monthStr] = safeSelectedMonth.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const monthIndex = (parseInt(monthStr, 10) || (new Date().getMonth() + 1)) - 1;

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === monthIndex;
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  let daysElapsed = 0;
  let daysRemaining = 0;

  if (isCurrentMonth) {
    daysElapsed = now.getDate();
    daysRemaining = Math.max(0, totalDaysInMonth - daysElapsed + 1);
  } else if (now > new Date(year, monthIndex + 1, 0)) {
    daysElapsed = totalDaysInMonth;
    daysRemaining = 0;
  } else {
    daysElapsed = 0;
    daysRemaining = totalDaysInMonth;
  }

  // Recommended Daily Spending Limit
  let recommendedDailyLimit = 0;
  if (remainingBudget < 0) {
    recommendedDailyLimit = 'Budget exceeded';
  } else if (daysRemaining === 0) {
    recommendedDailyLimit = 'Month complete';
  } else {
    recommendedDailyLimit = remainingBudget / daysRemaining;
  }

  // Today's Budget Remaining
  let todayBudgetLeft = 0;
  if (typeof recommendedDailyLimit === 'number') {
    todayBudgetLeft = recommendedDailyLimit - todaySpent;
  } else {
    todayBudgetLeft = recommendedDailyLimit;
  }

  let budgetStatus = 'green';
  if (budgetUtilization >= 100) budgetStatus = 'red';
  else if (budgetUtilization >= 90) budgetStatus = 'orange';
  else if (budgetUtilization >= 70) budgetStatus = 'yellow';

  return {
    monthlyBudget,
    totalSpent,
    todaySpent,
    todayBudgetLeft,
    remainingBudget,
    budgetUtilization,
    daysElapsed,
    daysRemaining,
    recommendedDailyLimit,
    totalTransactions: monthExpenses.length,
    budgetStatus,
  };
};