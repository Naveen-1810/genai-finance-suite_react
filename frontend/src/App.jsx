import { Routes, Route, Navigate } from 'react-router-dom'
// GenAI Finance Suite - Production Build v2.0
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Income from './pages/Income.jsx'
import Expenses from './pages/Expenses.jsx'
import Stocks from './pages/Stocks.jsx'
import Advisor from './pages/Advisor.jsx'
import GoogleSheets from './pages/GoogleSheets.jsx'
import Auth from './pages/Auth.jsx'

function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/advisor" element={<Advisor />} />
          <Route path="/sheets" element={<GoogleSheets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
