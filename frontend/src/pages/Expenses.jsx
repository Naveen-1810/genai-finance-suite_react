import { useEffect, useState } from 'react'
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../services/api.js'

const today = () => new Date().toISOString().slice(0, 10)
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Expenses() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ date: today(), category: '', amount: '', note: '' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => getExpenses().then(setRows).catch(() => setError('Could not load expense data.'))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.category || !form.amount) return
    const payload = { date: form.date, category: form.category, amount: parseFloat(form.amount), note: form.note }
    try {
      if (editingId) {
        await updateExpense(editingId, payload)
        setEditingId(null)
      } else {
        await addExpense(payload)
      }
      setForm({ date: today(), category: '', amount: '', note: '' })
      load()
    } catch {
      setError('Failed to save entry.')
    }
  }

  const edit = (row) => {
    setEditingId(row.id)
    setForm({ date: row.date, category: row.category, amount: String(row.amount), note: row.note || '' })
  }

  const remove = async (id) => {
    if (!confirm('Delete this expense entry?')) return
    await deleteExpense(id)
    load()
  }

  const total = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">💸 Expense Logging</h2>
      {error && <p className="text-coral mb-4">{error}</p>}

      <form onSubmit={submit} className="card mb-6 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="text-xs text-muted block mb-1">Date</label>
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Category</label>
          <input className="input" placeholder="Food, Rent…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Amount (₹)</label>
          <input type="number" step="0.01" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Note</label>
          <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <button className="btn-primary" type="submit">{editingId ? 'Update' : 'Add Expense'}</button>
      </form>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm text-muted">All Entries</h3>
          <span className="text-coral font-semibold">{inr(total)}</span>
        </div>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.category}</td>
                <td className="text-coral">{inr(r.amount)}</td>
                <td className="text-muted">{r.note}</td>
                <td className="text-right space-x-3">
                  <button className="text-xs text-muted hover:text-mint" onClick={() => edit(r)}>Edit</button>
                  <button className="text-xs text-muted hover:text-coral" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="text-muted text-center py-6">No expense entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
