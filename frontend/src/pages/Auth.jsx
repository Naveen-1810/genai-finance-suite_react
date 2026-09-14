import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (!isLogin) {
      if (!username.trim()) {
        setError('Please enter your username.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), username.trim(), password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        (isLogin ? 'Failed to log in. Please check your credentials.' : 'Registration failed. Try a different email.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md card border border-border shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-mint/10 text-mint text-3xl mb-3 shadow-inner">
            💳
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">GenAI Finance Suite</h1>
          <p className="text-xs text-muted mt-1">Multi-user personal finance & AI advisory</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-panel2 p-1 rounded-xl mb-6 border border-border">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin ? 'bg-panel text-white shadow-sm' : 'text-muted hover:text-white'
            }`}
            onClick={() => {
              setIsLogin(true)
              setError('')
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin ? 'bg-panel text-white shadow-sm' : 'text-muted hover:text-white'
            }`}
            onClick={() => {
              setIsLogin(false)
              setError('')
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-coral/10 border border-coral/30 text-coral text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="text-xs text-muted block mb-1">Your Name / Username</label>
              <input
                type="text"
                required
                className="input w-full"
                placeholder="e.g. John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-muted block mb-1">Email Address</label>
            <input
              type="email"
              required
              className="input w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Password</label>
            <input
              type="password"
              required
              className="input w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs text-muted block mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="input w-full"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2 py-3 text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                <span>Please wait…</span>
              </>
            ) : isLogin ? (
              'Sign In to Dashboard'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted">
          {isLogin ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                className="text-mint hover:underline font-medium"
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                }}
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="text-mint hover:underline font-medium"
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                }}
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
