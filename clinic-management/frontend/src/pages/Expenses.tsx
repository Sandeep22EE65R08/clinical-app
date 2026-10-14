import { useCallback, useEffect, useState } from 'react';
import type { Expense, ExpenseCategory, ExpenseSummary } from '../types';
import {
  createExpense, deleteExpense, getExpenseSummary, getExpenses,
} from '../api/endpoints';
import { formatDate, rupee, today } from '../utils';
import StatCard from '../components/StatCard';

const CATEGORIES: ExpenseCategory[] = [
  'StaffSalary', 'Rent', 'Electricity', 'MedicalSupplies',
  'Equipment', 'Maintenance', 'Other',
];

const categoryLabel = (c: ExpenseCategory) =>
  c === 'StaffSalary' ? 'Staff Salary'
    : c === 'MedicalSupplies' ? 'Medical Supplies' : c;

const monthStart = () => today().slice(0, 8) + '01';

export default function Expenses() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [items, setItems] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [msg, setMsg] = useState('');
  const [ne, setNe] = useState({
    expenseDate: today(), category: 'Rent' as ExpenseCategory, amount: '', note: '',
  });

  const load = useCallback(() => {
    getExpenses({ from, to }).then(setItems).catch(() => setItems([]));
    getExpenseSummary({ from, to }).then(setSummary).catch(() => setSummary(null));
  }, [from, to]);
  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ne.amount || Number(ne.amount) <= 0) { setMsg('Enter a valid amount.'); return; }
    try {
      await createExpense({
        expenseDate: ne.expenseDate, category: ne.category,
        amount: Number(ne.amount), note: ne.note || null,
      });
      setNe({ expenseDate: today(), category: 'Rent', amount: '', note: '' });
      setMsg('');
      load();
    } catch { setMsg('Could not save expense.'); }
  };

  const remove = async (id: string) => {
    await deleteExpense(id);
    load();
  };

  return (
    <div>
      <h1 className="page-title">Expenses</h1>
      <div className="toolbar">
        <label className="muted">From</label>
        <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label className="muted">To</label>
        <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {summary && (
        <div className="grid cards" style={{ marginBottom: 16 }}>
          <StatCard label="Revenue" value={rupee(summary.revenue)} tone="green" />
          <StatCard label="Total Expenses" value={rupee(summary.totalExpenses)} tone="amber" />
          <StatCard label="Net" value={rupee(summary.net)} tone={summary.net < 0 ? 'amber' : 'green'} />
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card">
          <h3>Add Expense</h3>
          {msg && <div className="muted" style={{ color: 'var(--red)' }}>{msg}</div>}
          <form onSubmit={add}>
            <div className="row">
              <div className="field"><label>Date</label>
                <input className="input" type="date" value={ne.expenseDate}
                  onChange={(e) => setNe({ ...ne, expenseDate: e.target.value })} /></div>
              <div className="field"><label>Category</label>
                <select value={ne.category}
                  onChange={(e) => setNe({ ...ne, category: e.target.value as ExpenseCategory })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select></div>
            </div>
            <div className="field"><label>Amount (₹)</label>
              <input className="input" type="number" value={ne.amount} required min="1"
                onChange={(e) => setNe({ ...ne, amount: e.target.value })} /></div>
            <div className="field"><label>Note</label>
              <input className="input" value={ne.note}
                onChange={(e) => setNe({ ...ne, note: e.target.value })} /></div>
            <button className="btn btn-primary">Add Expense</button>
          </form>
        </div>

        {summary && summary.byCategory.length > 0 && (
          <div className="card">
            <h3>By Category</h3>
            {summary.byCategory.map((c) => (
              <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span className="muted">{categoryLabel(c.category)}</span>
                <span>{rupee(c.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Expenses</h3>
        <table className="table">
          <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="muted">No expenses in this period.</td></tr>
            )}
            {items.map((x) => (
              <tr key={x.id}>
                <td>{formatDate(x.expenseDate)}</td>
                <td>{categoryLabel(x.category)}</td>
                <td>{x.note || '-'}</td>
                <td>{rupee(x.amount)}</td>
                <td><button className="btn btn-ghost" onClick={() => remove(x.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
