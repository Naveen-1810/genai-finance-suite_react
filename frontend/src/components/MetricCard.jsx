export default function MetricCard({ label, value, accent = 'text-white', sub }) {
  return (
    <div className="card">
      <p className="text-muted text-xs uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-display font-semibold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}
