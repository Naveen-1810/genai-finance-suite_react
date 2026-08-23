import { useState } from 'react'
import { askAdvisor } from '../services/api.js'

export default function Advisor() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    const q = question
    setMessages((m) => [...m, { role: 'user', text: q }])
    setQuestion('')
    setLoading(true)
    setError('')
    try {
      const res = await askAdvisor(q)
      setMessages((m) => [...m, { role: 'ai', text: res.answer }])
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Something went wrong talking to Gemini.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'What are my biggest expenses?',
    'How is my portfolio performing?',
    'Which category has the highest spending?',
    'Show my income vs expense summary.',
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">🤖 Gemini AI Financial Advisor</h2>
      <p className="text-xs text-muted mb-6">Your question and financial data are sent to the backend, which calls Gemini. The API key never reaches the browser.</p>

      <div className="card mb-4 min-h-[260px] flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} className="btn-ghost text-xs" onClick={() => setQuestion(s)}>{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-mint/10 text-mint self-end' : 'bg-panel2 text-white self-start'}`}>
            {m.text}
          </div>
        ))}
        {loading && <p className="text-muted text-sm">Thinking…</p>}
        {error && <p className="text-coral text-sm">{error}</p>}
      </div>

      <form onSubmit={ask} className="flex gap-3">
        <input
          className="input"
          placeholder="Ask about your income, expenses, or portfolio…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="btn-primary shrink-0" type="submit" disabled={loading}>Ask</button>
      </form>
    </div>
  )
}
