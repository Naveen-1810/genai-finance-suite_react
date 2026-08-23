import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Income
export const getIncome = () => api.get('/income').then(r => r.data)
export const addIncome = (data) => api.post('/income', data).then(r => r.data)
export const updateIncome = (id, data) => api.put(`/income/${id}`, data).then(r => r.data)
export const deleteIncome = (id) => api.delete(`/income/${id}`).then(r => r.data)

// Expenses
export const getExpenses = () => api.get('/expenses').then(r => r.data)
export const addExpense = (data) => api.post('/expenses', data).then(r => r.data)
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data).then(r => r.data)
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then(r => r.data)

// Stocks
export const getStocks = () => api.get('/stocks').then(r => r.data)
export const addStock = (data) => api.post('/stocks', data).then(r => r.data)
export const updateStock = (id, data) => api.put(`/stocks/${id}`, data).then(r => r.data)
export const deleteStock = (id) => api.delete(`/stocks/${id}`).then(r => r.data)

// Dashboard
export const getDashboard = () => api.get('/dashboard').then(r => r.data)

// Advisor
export const askAdvisor = (question) => api.post('/advisor', { question }).then(r => r.data)

// Google Sheets
export const gsheetStatus = () => api.get('/gsheet/status').then(r => r.data)
export const syncGsheet = (url) => api.post('/gsheet/sync', { url }).then(r => r.data)

export default api
