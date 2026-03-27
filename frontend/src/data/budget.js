export const incomeCategories = ['Salary', 'Freelance', 'Side Project', 'Other'];
export const expenseCategories = [
  'Rent', 'Groceries', 'Dining Out', 'Gym/Fitness', 'Beauty/Personal Care',
  'Transport', 'Subscriptions', 'Shopping', 'Healthcare', 'Other',
];

export const budgetTargets = {
  Rent: 1500, Groceries: 400, 'Dining Out': 200, 'Gym/Fitness': 80,
  'Beauty/Personal Care': 60, Transport: 150, Subscriptions: 80, Shopping: 200,
  Healthcare: 100, Other: 150,
};

function genTransactions(year, month) {
  const txns = [];
  let id = month * 100;
  const daysInMonth = new Date(year, month, 0).getDate();

  txns.push({ id: ++id, date: `${year}-${String(month).padStart(2,'0')}-01`, description: 'Monthly Salary', category: 'Salary', type: 'income', amount: 5200, recurring: true });
  txns.push({ id: ++id, date: `${year}-${String(month).padStart(2,'0')}-01`, description: 'Rent', category: 'Rent', type: 'expense', amount: 1500, recurring: true });
  txns.push({ id: ++id, date: `${year}-${String(month).padStart(2,'0')}-01`, description: 'Gym Membership', category: 'Gym/Fitness', type: 'expense', amount: 60, recurring: true });
  txns.push({ id: ++id, date: `${year}-${String(month).padStart(2,'0')}-01`, description: 'Spotify + Netflix', category: 'Subscriptions', type: 'expense', amount: 28, recurring: true });
  txns.push({ id: ++id, date: `${year}-${String(month).padStart(2,'0')}-15`, description: 'Freelance Project', category: 'Freelance', type: 'income', amount: 800 + Math.floor(Math.random() * 400) });

  const expItems = [
    { desc: 'Trader Joe\'s', cat: 'Groceries', min: 40, max: 90 },
    { desc: 'Whole Foods', cat: 'Groceries', min: 30, max: 70 },
    { desc: 'Chipotle', cat: 'Dining Out', min: 12, max: 18 },
    { desc: 'Sushi dinner', cat: 'Dining Out', min: 35, max: 60 },
    { desc: 'Uber', cat: 'Transport', min: 15, max: 35 },
    { desc: 'Gas', cat: 'Transport', min: 40, max: 60 },
    { desc: 'Amazon order', cat: 'Shopping', min: 20, max: 120 },
    { desc: 'Haircut', cat: 'Beauty/Personal Care', min: 30, max: 45 },
    { desc: 'Pharmacy', cat: 'Healthcare', min: 15, max: 40 },
    { desc: 'Coffee shop', cat: 'Dining Out', min: 5, max: 8 },
    { desc: 'Target run', cat: 'Shopping', min: 25, max: 75 },
    { desc: 'Protein powder', cat: 'Gym/Fitness', min: 35, max: 55 },
  ];

  for (let i = 0; i < 25; i++) {
    const item = expItems[Math.floor(Math.random() * expItems.length)];
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    txns.push({
      id: ++id,
      date: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      description: item.desc,
      category: item.cat,
      type: 'expense',
      amount: item.min + Math.floor(Math.random() * (item.max - item.min)),
    });
  }

  return txns.sort((a, b) => a.date.localeCompare(b.date));
}

export const allTransactions = [
  ...genTransactions(2025, 10),
  ...genTransactions(2025, 11),
  ...genTransactions(2025, 12),
  ...genTransactions(2026, 1),
  ...genTransactions(2026, 2),
  ...genTransactions(2026, 3),
];

export function getTransactionsForMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return allTransactions.filter(t => t.date.startsWith(prefix));
}

export function getMonthlyTotals(year, month) {
  const txns = getTransactionsForMonth(year, month);
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expenses, net: income - expenses };
}
