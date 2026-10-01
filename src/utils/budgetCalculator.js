export const calculateBudgetMetrics = (expenses = [], budget, selectedMonth) => {
  const monthExpenses = expenses.filter((e) => e.month === selectedMonth);
  const totalSpent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthlyBudget = budget ? Number(budget.amount) || 0 : 0;
  const remainingBudget = monthlyBudget - totalSpent;

  const budgetUtilization = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;

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

  const dailyAverage = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

  let recommendedDailyLimit = 0;
  if (remainingBudget < 0) {
    recommendedDailyLimit = 'Budget exceeded';
  } else if (daysRemaining === 0) {
    recommendedDailyLimit = 'Month complete';
  } else {
    recommendedDailyLimit = remainingBudget / daysRemaining;
  }

  let budgetStatus = 'green';
  if (budgetUtilization >= 100) budgetStatus = 'red';
  else if (budgetUtilization >= 90) budgetStatus = 'orange';
  else if (budgetUtilization >= 70) budgetStatus = 'yellow';

  return {
    monthlyBudget,
    totalSpent,
    remainingBudget,
    budgetUtilization,
    daysElapsed,
    daysRemaining,
    dailyAverage,
    recommendedDailyLimit,
    totalTransactions: monthExpenses.length,
    budgetStatus,
  };
};