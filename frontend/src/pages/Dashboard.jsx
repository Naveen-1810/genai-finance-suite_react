import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { getDashboard } from '../services/api.js'
import MetricCard from '../components/MetricCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const COLORS = ['#22C7A9', '#F2B84B', '#FF6B6B', '#5B8DEF', '#B57EDC', '#4ECDC4']

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboard().then(setData).catch(() => setError('Could not load dashboard data. Is the backend running?'))
  }, [])

  if (error) return <p className="text-coral">{error}</p>
  if (!data) return <p className="text-muted">Loading dashboard…</p>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Welcome back, {user?.username || data.user?.username || 'User'}! 👋</h2>
        <p className="text-xs text-muted mt-1">Here is your isolated financial summary and analytics overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total Income" value={inr(data.total_income)} accent="text-mint" />
        <MetricCard label="Total Expenses" value={inr(data.total_expenses)} accent="text-coral" />
        <MetricCard label="Stock Net P/L" value={inr(data.total_stock_pl)} accent={data.total_stock_pl >= 0 ? 'text-mint' : 'text-coral'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm text-muted mb-4">Expense Distribution</h3>
          {data.expense_distribution.length === 0 ? (
            <p className="text-muted text-sm">No expenses logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.expense_distribution} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {data.expense_distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => inr(v)} contentStyle={{ background: '#111A2C', border: '1px solid #233150', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm text-muted mb-4">Stock Performance (₹)</h3>
          {data.stock_performance.length === 0 ? (
            <p className="text-muted text-sm">No stock trades logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.stock_performance}>
                <CartesianGrid stroke="#233150" strokeDasharray="3 3" />
                <XAxis dataKey="symbol" stroke="#8896B3" fontSize={12} />
                <YAxis stroke="#8896B3" fontSize={12} />
                <Tooltip formatter={(v) => inr(v)} contentStyle={{ background: '#111A2C', border: '1px solid #233150', borderRadius: 8 }} />
                <Bar dataKey="pl">
                  {data.stock_performance.map((s, i) => (
                    <Cell key={i} fill={s.pl >= 0 ? '#22C7A9' : '#FF6B6B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h3 className="text-sm text-muted mb-3">Recent Income</h3>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Source</th><th>Amount</th></tr></thead>
            <tbody>
              {data.recent_income.map((r, i) => (
                <tr key={i}><td>{r.date}</td><td>{r.source}</td><td className="text-mint">{inr(r.amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 className="text-sm text-muted mb-3">Recent Expenses</h3>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {data.recent_expenses.map((r, i) => (
                <tr key={i}><td>{r.date}</td><td>{r.category}</td><td className="text-coral">{inr(r.amount)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
