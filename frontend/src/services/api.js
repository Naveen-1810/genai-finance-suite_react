import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

const api = axios.create({ baseURL: API_BASE })

// Attach token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on auth page, clean session and redirect
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== Auth API ====================
export const registerUser = (data) => api.post('/auth/register', data).then((r) => r.data)
export const loginUser = (data) => api.post('/auth/login', data).then((r) => r.data)
export const getMe = () => api.get('/auth/me').then((r) => r.data)
export const updateProfile = (data) => api.put('/auth/profile', data).then((r) => r.data)

// ==================== Income ====================
export const getIncome = () => api.get('/income').then((r) => r.data)
export const addIncome = (data) => api.post('/income', data).then((r) => r.data)
export const updateIncome = (id, data) => api.put(`/income/${id}`, data).then((r) => r.data)
export const deleteIncome = (id) => api.delete(`/income/${id}`).then((r) => r.data)

// ==================== Expenses ====================
export const getExpenses = () => api.get('/expenses').then((r) => r.data)
export const addExpense = (data) => api.post('/expenses', data).then((r) => r.data)
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data).then((r) => r.data)
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then((r) => r.data)

// ==================== Stocks ====================
export const getStocks = () => api.get('/stocks').then((r) => r.data)
export const addStock = (data) => api.post('/stocks', data).then((r) => r.data)
export const updateStock = (id, data) => api.put(`/stocks/${id}`, data).then((r) => r.data)
export const deleteStock = (id) => api.delete(`/stocks/${id}`).then((r) => r.data)

// ==================== Dashboard ====================
export const getDashboard = () => api.get('/dashboard').then((r) => r.data)

// ==================== Advisor ====================
export const askAdvisor = (question) => api.post('/advisor', { question }).then((r) => r.data)

// ==================== Google Sheets ====================
export const gsheetStatus = () => api.get('/gsheet/status').then((r) => r.data)
export const updateGsheetConfig = (url) => api.put('/gsheet/config', { url }).then((r) => r.data)
export const syncGsheet = (url) => api.post('/gsheet/sync', { url }).then((r) => r.data)

export default api
