import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Income from './pages/Income.jsx'
import Expenses from './pages/Expenses.jsx'
import Stocks from './pages/Stocks.jsx'
import Advisor from './pages/Advisor.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/advisor" element={<Advisor />} />
        </Routes>
      </main>
    </div>
  )
}
