export const calculateBudgetMetrics = (expenses = [], budget = null, selectedMonth = '') => {
  // 1. Fallback for selectedMonth if missing or invalid
  const safeSelectedMonth = selectedMonth || new Date().toISOString().substring(0, 7);

  // 2. Filter expenses for the target month (with fallback checking e.date)
  const monthExpenses = expenses.filter((e) => {
    const expenseMonth = e.month || (e.date ? e.date.substring(0, 7) : '');
    return expenseMonth === safeSelectedMonth;
  });

  // 3. Calculate total spent with robust Number parsing
  const totalSpent = monthExpenses.reduce((sum, e) => {
    const amt = parseFloat(e.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  // 4. Extract monthly budget safely
  const parsedBudget = budget ? parseFloat(budget.amount) : 0;
  const monthlyBudget = isNaN(parsedBudget) ? 0 : parsedBudget;

  const remainingBudget = monthlyBudget - totalSpent;
  const budgetUtilization = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  // 5. Date and days calculation safely
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

  const dailyAverage = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

  // 6. Recommended daily limit handling
  let recommendedDailyLimit = 0;
  if (remainingBudget < 0) {
    recommendedDailyLimit = 'Budget exceeded';
  } else if (daysRemaining === 0) {
    recommendedDailyLimit = 'Month complete';
  } else {
    recommendedDailyLimit = remainingBudget / daysRemaining;
  }

  // 7. Budget health status colors
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