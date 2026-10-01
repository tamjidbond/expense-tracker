const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '৳';

export const formatCurrency = (amount) => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return '৳0';
  
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount).replace('BDT', '৳');
};

export const getMonthName = (yearMonth) => {
  if (!yearMonth || !yearMonth.includes('-')) return yearMonth;
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const getCurrentMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};