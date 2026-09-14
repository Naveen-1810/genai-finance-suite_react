import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/income', label: 'Income Tracker', icon: '💰' },
  { to: '/expenses', label: 'Expense Tracker', icon: '💸' },
  { to: '/stocks', label: "India's Stocks", icon: '🇮🇳' },
  { to: '/advisor', label: 'AI Advisor', icon: '🤖' },
  { to: '/sheets', label: 'Google Sheets', icon: '📄' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U'

  return (
    <aside className="w-64 shrink-0 bg-panel border-r border-border min-h-screen p-5 flex flex-col justify-between">
      <div>
        <div className="mb-8">
          <h1 className="text-lg font-bold tracking-tight text-white">GenAI Finance</h1>
          <p className="text-xs text-mint font-medium">Multi-User Suite</p>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-mint/10 text-mint border border-mint/30 font-medium'
                    : 'text-muted hover:text-white hover:bg-panel2'
                }`
              }
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile & Logout footer */}
      {user && (
        <div className="pt-4 border-t border-border mt-6">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-panel2/50 border border-border/50">
            <div className="w-9 h-9 rounded-xl bg-mint/20 text-mint font-bold flex items-center justify-center text-sm border border-mint/30">
              {initial}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.username}</p>
              <p className="text-[11px] text-muted truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-muted hover:text-coral hover:bg-coral/10 rounded-lg transition-colors border border-transparent hover:border-coral/20 font-medium"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      )}
    </aside>
  )
}
