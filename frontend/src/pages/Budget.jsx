import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import ChartWrapper from '../components/charts/ChartWrapper';
import { chartColors, commonAxisProps, commonTooltipStyle } from '../components/charts/chartTheme';
import { incomeCategories, expenseCategories } from '../data/budget';
import { formatCurrency, formatShortDate } from '../lib/utils';
import useBudget from '../hooks/useBudget';

const PIE_COLORS = [chartColors.sage, chartColors.amber, chartColors.rose, chartColors.slate, chartColors.cream,
  '#8b7355', '#5a7a5a', '#9e6b6b', '#6b7a8a', '#b5a58a'];

export default function Budget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const { transactions, targets, monthlyTotals, loading, error, create, remove } = useBudget(monthStr);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showTargets, setShowTargets] = useState(false);
  const [newTxn, setNewTxn] = useState({ date: '', amount: '', category: '', type: 'expense', description: '' });
  const [saving, setSaving] = useState(false);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  const displayed = useMemo(() => {
    let list = [...transactions];
    if (filterCategory) list = list.filter(t => t.category === filterCategory);
    if (filterType) list = list.filter(t => t.type === filterType);
    list.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'date') return mul * a.date.localeCompare(b.date);
      if (sortBy === 'amount') return mul * (a.amount - b.amount);
      return mul * (a[sortBy] || '').localeCompare(b[sortBy] || '');
    });
    return list;
  }, [transactions, filterCategory, filterType, sortBy, sortDir]);

  let runningBalance = 0;
  const displayedWithBalance = displayed.map(t => {
    runningBalance += t.type === 'income' ? t.amount : -t.amount;
    return { ...t, balance: runningBalance };
  });

  const categorySpending = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const sixMonthData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      let m = month - i, y = year;
      if (m <= 0) { m += 12; y--; }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const found = monthlyTotals.find(t => t.month === key);
      data.push({ month: new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short' }), income: found?.income || 0, expenses: found?.expense || 0 });
    }
    return data;
  }, [monthlyTotals, year, month]);

  const dailyCumulative = useMemo(() => {
    const expTxns = transactions.filter(t => t.type === 'expense').sort((a, b) => a.date.localeCompare(b.date));
    const totalBudget = targets.reduce((s, t) => s + (t.amount || 0), 0);
    const daysInMonth = new Date(year, month, 0).getDate();
    let cum = 0;
    return Array.from({ length: daysInMonth }, (_, idx) => {
      const d = idx + 1;
      const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
      expTxns.filter(t => t.date === dateStr).forEach(t => cum += t.amount);
      return { day: d, spent: cum, target: Math.round((totalBudget / daysInMonth) * d) };
    });
  }, [transactions, targets, year, month, monthStr]);

  const handleAddTxn = async () => {
    if (!newTxn.amount || !newTxn.category) return;
    setSaving(true);
    try {
      await create({ date: newTxn.date || new Date().toISOString().split('T')[0], amount: parseFloat(newTxn.amount), category: newTxn.category, type: newTxn.type, description: newTxn.description });
      setNewTxn({ date: '', amount: '', category: '', type: 'expense', description: '' });
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  if (loading) return <div className="text-text-tertiary py-12 text-center">Loading...</div>;
  if (error) return <div className="text-accent-rose py-12 text-center">{error}</div>;

  return (
    <div className="space-y-8 stagger-fade">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={prevMonth} className="text-text-tertiary hover:text-text-primary"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="font-display text-xl">{monthName}</h2>
        <button onClick={nextMonth} className="text-text-tertiary hover:text-text-primary"><ChevronRight className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={income} prefix="$" trend="up" trendValue={formatCurrency(income)} />
        <StatCard label="Total Expenses" value={expenses} prefix="$" />
        <StatCard label="Net Savings" value={net} prefix="$" trend={net >= 0 ? 'up' : 'down'} trendValue={formatCurrency(Math.abs(net))} />
        <div className="bg-bg-secondary border border-border p-4">
          <p className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Savings Rate</p>
          <p className="text-2xl font-mono font-semibold text-accent-sage">{savingsRate}%</p>
          <ProgressBar value={savingsRate} max={100} color={savingsRate > 20 ? 'sage' : 'amber'} className="mt-2" />
        </div>
      </div>

      <Card header="Add Transaction">
        <div className="flex flex-wrap gap-3 items-end">
          <Input label="Date" type="date" value={newTxn.date} onChange={e => setNewTxn({ ...newTxn, date: e.target.value })} />
          <Input label="Amount" type="number" placeholder="0" value={newTxn.amount} onChange={e => setNewTxn({ ...newTxn, amount: e.target.value })} />
          <Select label="Type" options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} value={newTxn.type} onChange={e => setNewTxn({ ...newTxn, type: e.target.value, category: '' })} />
          <Select label="Category" options={(newTxn.type === 'income' ? incomeCategories : expenseCategories).map(c => ({ value: c, label: c }))} value={newTxn.category} onChange={e => setNewTxn({ ...newTxn, category: e.target.value })} placeholder="Select..." />
          <Input label="Note" placeholder="Description" value={newTxn.description} onChange={e => setNewTxn({ ...newTxn, description: e.target.value })} />
          <Button onClick={handleAddTxn} disabled={saving}>{saving ? 'Adding...' : 'Add'}</Button>
        </div>
      </Card>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-xl">Transactions</h2>
          <div className="flex gap-2">
            <Select options={[...incomeCategories, ...expenseCategories].map(c => ({ value: c, label: c }))} value={filterCategory} onChange={e => setFilterCategory(e.target.value)} placeholder="All Categories" />
            <Select options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="All Types" />
          </div>
        </div>
        <Card>
          {displayed.length === 0 ? (
            <p className="text-text-tertiary text-sm py-6 text-center">No transactions this month.</p>
          ) : (
            <Table>
              <Thead>
                <Th sortable onClick={() => toggleSort('date')}>Date</Th>
                <Th>Description</Th>
                <Th>Category</Th>
                <Th sortable onClick={() => toggleSort('amount')}>Amount</Th>
                <Th>Balance</Th>
                <Th></Th>
              </Thead>
              <Tbody>
                {displayedWithBalance.map(t => (
                  <Tr key={t.id}>
                    <Td className="font-mono text-sm">{formatShortDate(t.date)}</Td>
                    <Td>{t.description}</Td>
                    <Td><Badge color={t.type === 'income' ? 'sage' : 'default'}>{t.category}</Badge></Td>
                    <Td className={`font-mono ${t.type === 'income' ? 'text-accent-sage' : 'text-accent-rose'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </Td>
                    <Td className="font-mono text-text-secondary">{formatCurrency(t.balance)}</Td>
                    <Td>
                      <button onClick={() => remove(t.id)} className="text-text-tertiary hover:text-accent-rose"><Trash2 className="w-4 h-4" /></button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card header="Spending by Category">
          <ChartWrapper height={280}>
            <PieChart>
              <Pie data={categorySpending} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {categorySpending.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...commonTooltipStyle} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ color: chartColors.text, fontFamily: 'DM Sans', fontSize: 11 }} />
            </PieChart>
          </ChartWrapper>
        </Card>

        <Card header="Income vs Expenses (6 Months)">
          <ChartWrapper height={280}>
            <BarChart data={sixMonthData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="month" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip {...commonTooltipStyle} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ color: chartColors.text, fontFamily: 'DM Sans', fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill={chartColors.sage} />
              <Bar dataKey="expenses" name="Expenses" fill={chartColors.rose} />
            </BarChart>
          </ChartWrapper>
        </Card>

        <Card header="Daily Spending vs Target">
          <ChartWrapper height={280}>
            <LineChart data={dailyCumulative}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="day" {...commonAxisProps} />
              <YAxis {...commonAxisProps} tickFormatter={v => `$${v}`} />
              <Tooltip {...commonTooltipStyle} formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ color: chartColors.text, fontFamily: 'DM Sans', fontSize: 12 }} />
              <Line type="monotone" dataKey="spent" name="Spent" stroke={chartColors.rose} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="target" name="Budget" stroke={chartColors.slate} strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ChartWrapper>
        </Card>

        <Card header={
          <button onClick={() => setShowTargets(!showTargets)} className="flex items-center gap-2 font-display text-lg text-text-primary w-full">
            Budget Targets
            <ChevronDown className={`w-4 h-4 transition-transform ${showTargets ? 'rotate-180' : ''}`} />
          </button>
        }>
          {showTargets && (
            targets.length === 0 ? (
              <p className="text-text-tertiary text-sm py-4 text-center">No budget targets set.</p>
            ) : (
              <div className="space-y-3">
                {targets.map(t => {
                  const spent = transactions.filter(txn => txn.type === 'expense' && txn.category === t.category).reduce((s, txn) => s + txn.amount, 0);
                  const pct = t.amount > 0 ? (spent / t.amount) * 100 : 0;
                  const color = pct > 100 ? 'rose' : pct > 80 ? 'amber' : 'sage';
                  return (
                    <div key={t.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">{t.category}</span>
                        <span className="font-mono text-text-primary">{formatCurrency(spent)} / {formatCurrency(t.amount)}</span>
                      </div>
                      <ProgressBar value={spent} max={t.amount} color={color} />
                    </div>
                  );
                })}
              </div>
            )
          )}
        </Card>
      </div>
    </div>
  );
}
