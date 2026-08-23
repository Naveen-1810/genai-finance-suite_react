import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/income', label: 'Income Tracker', icon: '💰' },
  { to: '/expenses', label: 'Expense Tracker', icon: '💸' },
  { to: '/stocks', label: "India's Stocks", icon: '🇮🇳' },
  { to: '/advisor', label: 'AI Advisor', icon: '🤖' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-border min-h-screen p-5 flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold tracking-tight">GenAI Finance</h1>
        <p className="text-xs text-muted">Suite</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive ? 'bg-mint/10 text-mint border border-mint/30' : 'text-muted hover:text-white hover:bg-panel2'
              }`
            }
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6 text-xs text-muted border-t border-border">
        Data stored locally in <span className="text-mint">finance_pro.db</span>
      </div>
    </aside>
  )
}
