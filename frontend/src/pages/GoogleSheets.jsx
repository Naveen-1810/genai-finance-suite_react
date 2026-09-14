import { useEffect, useState } from 'react'
import { gsheetStatus, updateGsheetConfig, syncGsheet } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function GoogleSheets() {
  const { user, updateUser } = useAuth()
  const [sheetUrl, setSheetUrl] = useState('')
  const [status, setStatus] = useState(null)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    gsheetStatus()
      .then((res) => {
        setStatus(res)
        if (res.user_sheet_url) {
          setSheetUrl(res.user_sheet_url)
        } else if (user?.gsheet_url) {
          setSheetUrl(user.gsheet_url)
        }
      })
      .catch(() => {
        setError('Could not connect to Google Sheets backend service.')
      })
  }, [user])

  const handleSaveUrl = async (e) => {
    e.preventDefault()
    if (!sheetUrl.trim()) return
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await updateGsheetConfig(sheetUrl.trim())
      await updateUser({ gsheet_url: sheetUrl.trim() })
      setMessage({ type: 'success', text: 'Google Sheet URL saved to your account!' })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save Google Sheet URL.')
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async () => {
    if (!sheetUrl.trim()) {
      setError('Please provide or save a Google Sheet URL first.')
      return
    }
    setSyncing(true)
    setMessage(null)
    setError(null)
    try {
      const res = await syncGsheet(sheetUrl.trim())
      const incCount = res.synced?.income || 0
      const expCount = res.synced?.expenses || 0
      setMessage({
        type: 'success',
        text: `Sync complete! Added ${incCount} income record(s) and ${expCount} expense record(s) to your account.`,
      })
      if (user?.gsheet_url !== sheetUrl.trim()) {
        await updateUser({ gsheet_url: sheetUrl.trim() })
      }
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to sync with Google Sheet.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">📄 Your Google Sheet Integration</h2>
        <p className="text-xs text-muted">
          Connect your individual Google Sheet to automatically sync your income and expenses into your personal dashboard.
        </p>
      </div>

      {/* Backend Status Alert */}
      {status && (
        <div className="card mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm font-medium">Server Sync Engine</p>
              <p className="text-xs text-muted">
                {status.read_write_active
                  ? 'Google Service Account credentials loaded and ready.'
                  : 'Backend service account JSON key is pending in backend/.env.'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              status.read_write_active
                ? 'bg-mint/15 text-mint border border-mint/30'
                : 'bg-coral/15 text-coral border border-coral/30'
            }`}
          >
            {status.read_write_active ? 'Active' : 'Setup Needed'}
          </span>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-mint/10 border border-mint/30 text-mint text-sm flex items-center gap-2">
          <span>✅</span>
          <span>{message.text}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Sheet Configuration Form */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold mb-3">Your Personal Google Sheet</h3>
        <form onSubmit={handleSaveUrl} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">Google Sheet URL</label>
            <input
              type="url"
              className="input w-full"
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
            >
              {saving ? 'Saving…' : 'Save Sheet URL'}
            </button>

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || !sheetUrl.trim()}
              className="bg-panel2 hover:bg-border text-white border border-border text-sm px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <span className="w-4 h-4 border-2 border-mint border-t-transparent rounded-full animate-spin"></span>
                  <span>Syncing with Sheet…</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Sync Data Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Instructions Card */}
      <div className="card bg-panel/50 border border-border">
        <h3 className="text-sm font-semibold mb-2">📋 How to set up your Google Sheet:</h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-muted leading-relaxed">
          <li>
            Create a Google Sheet with two tabs: named <strong className="text-white">Income</strong> and{' '}
            <strong className="text-white">Expenses</strong>.
          </li>
          <li>
            In the <strong className="text-white">Income</strong> tab, add columns:
            <code className="ml-1 px-1.5 py-0.5 bg-panel2 text-mint rounded">Date</code>,{' '}
            <code className="px-1.5 py-0.5 bg-panel2 text-mint rounded">Source</code>,{' '}
            <code className="px-1.5 py-0.5 bg-panel2 text-mint rounded">Amount</code>.
          </li>
          <li>
            In the <strong className="text-white">Expenses</strong> tab, add columns:
            <code className="ml-1 px-1.5 py-0.5 bg-panel2 text-coral rounded">Date</code>,{' '}
            <code className="px-1.5 py-0.5 bg-panel2 text-coral rounded">Category</code>,{' '}
            <code className="px-1.5 py-0.5 bg-panel2 text-coral rounded">Amount</code>,{' '}
            <code className="px-1.5 py-0.5 bg-panel2 text-coral rounded">Note</code>.
          </li>
          <li>
            Click <strong className="text-white">Share</strong> on your Google Sheet, and give access to your backend's Google Service Account email with Viewer or Editor access.
          </li>
          <li>Paste the sheet URL above and click <strong className="text-white">Sync Data Now</strong>.</li>
        </ol>
      </div>
    </div>
  )
}
