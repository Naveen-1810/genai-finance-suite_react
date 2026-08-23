import { useEffect, useState } from 'react'
import { getStocks, addStock, updateStock, deleteStock } from '../services/api.js'

const today = () => new Date().toISOString().slice(0, 10)
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Stocks() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ date: today(), symbol: '', qty: '1', buy_price: '0', sell_price: '0' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => getStocks().then(setRows).catch(() => setError('Could not load stock data.'))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.symbol) return
    const payload = {
      date: form.date,
      symbol: form.symbol.toUpperCase(),
      qty: parseInt(form.qty || '0', 10),
      buy_price: parseFloat(form.buy_price || '0'),
      sell_price: parseFloat(form.sell_price || '0'),
    }
    try {
      if (editingId) {
        await updateStock(editingId, payload)
        setEditingId(null)
      } else {
        await addStock(payload)
      }
      setForm({ date: today(), symbol: '', qty: '1', buy_price: '0', sell_price: '0' })
      load()
    } catch {
      setError('Failed to save trade.')
    }
  }

  const edit = (row) => {
    setEditingId(row.id)
    setForm({ date: row.date, symbol: row.symbol, qty: String(row.qty), buy_price: String(row.buy_price), sell_price: String(row.sell_price) })
  }

  const remove = async (id) => {
    if (!confirm('Delete this trade?')) return
    await deleteStock(id)
    load()
  }

  const totalPl = rows.reduce((s, r) => s + r.pl, 0)

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">🇮🇳 Stock Portfolio</h2>
      <p className="text-xs text-muted mb-4">
        Prices here are entered manually (buy/sell), same as the original app — this project does not connect to a live market feed.
      </p>
      {error && <p className="text-coral mb-4">{error}</p>}

      <form onSubmit={submit} className="card mb-6 grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
        <div>
          <label className="text-xs text-muted block mb-1">Date</label>
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Symbol</label>
          <input className="input" placeholder="RELIANCE" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Qty</label>
          <input type="number" className="input" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Buy Price</label>
          <input type="number" step="0.01" className="input" value={form.buy_price} onChange={(e) => setForm({ ...form, buy_price: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Sell Price</label>
          <input type="number" step="0.01" className="input" value={form.sell_price} onChange={(e) => setForm({ ...form, sell_price: e.target.value })} />
        </div>
        <button className="btn-primary" type="submit">{editingId ? 'Update' : 'Add Trade'}</button>
      </form>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm text-muted">All Trades</h3>
          <span className={`font-semibold ${totalPl >= 0 ? 'text-mint' : 'text-coral'}`}>{inr(totalPl)}</span>
        </div>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Symbol</th><th>Qty</th><th>Buy</th><th>Sell</th><th>P/L</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.symbol}</td>
                <td>{r.qty}</td>
                <td>{inr(r.buy_price)}</td>
                <td>{inr(r.sell_price)}</td>
                <td className={r.pl >= 0 ? 'text-mint' : 'text-coral'}>{inr(r.pl)}</td>
                <td className="text-right space-x-3">
                  <button className="text-xs text-muted hover:text-mint" onClick={() => edit(r)}>Edit</button>
                  <button className="text-xs text-muted hover:text-coral" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="text-muted text-center py-6">No trades logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
