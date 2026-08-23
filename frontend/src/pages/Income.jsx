import { useEffect, useState } from 'react'
import { getIncome, addIncome, updateIncome, deleteIncome } from '../services/api.js'

const today = () => new Date().toISOString().slice(0, 10)
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Income() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ date: today(), source: '', amount: '' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => getIncome().then(setRows).catch(() => setError('Could not load income data.'))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.source || !form.amount) return
    const payload = { date: form.date, source: form.source, amount: parseFloat(form.amount) }
    try {
      if (editingId) {
        await updateIncome(editingId, payload)
        setEditingId(null)
      } else {
        await addIncome(payload)
      }
      setForm({ date: today(), source: '', amount: '' })
      load()
    } catch {
      setError('Failed to save entry.')
    }
  }

  const edit = (row) => {
    setEditingId(row.id)
    setForm({ date: row.date, source: row.source, amount: String(row.amount) })
  }

  const remove = async (id) => {
    if (!confirm('Delete this income entry?')) return
    await deleteIncome(id)
    load()
  }

  const total = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">💰 Income Management</h2>
      {error && <p className="text-coral mb-4">{error}</p>}

      <form onSubmit={submit} className="card mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-muted block mb-1">Date</label>
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Source</label>
          <input className="input" placeholder="Salary, freelance…" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Amount (₹)</label>
          <input type="number" step="0.01" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <button className="btn-primary" type="submit">{editingId ? 'Update' : 'Add Income'}</button>
      </form>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm text-muted">All Entries</h3>
          <span className="text-mint font-semibold">{inr(total)}</span>
        </div>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Source</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.source}</td>
                <td className="text-mint">{inr(r.amount)}</td>
                <td className="text-right space-x-3">
                  <button className="text-xs text-muted hover:text-mint" onClick={() => edit(r)}>Edit</button>
                  <button className="text-xs text-muted hover:text-coral" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="text-muted text-center py-6">No income entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
