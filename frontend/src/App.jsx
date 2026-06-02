import { useState, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { buildTheme } from './theme'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GroupDetails from './pages/GroupDetails'
import AddExpense from './pages/AddExpense'
import ExpenseHistory from './pages/ExpenseHistory'
import Settlement from './pages/Settlement'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes({ darkMode, toggleDark }) {
  const { user } = useAuth()
  return (
    <>
      {user && <Navbar darkMode={darkMode} toggleDark={toggleDark} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/groups/:id" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
        <Route path="/groups/:id/add-expense" element={<PrivateRoute><AddExpense /></PrivateRoute>} />
        <Route path="/groups/:id/history" element={<PrivateRoute><ExpenseHistory /></PrivateRoute>} />
        <Route path="/groups/:id/settle" element={<PrivateRoute><Settlement /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  )
  const theme = useMemo(() => buildTheme(darkMode ? 'dark' : 'light'), [darkMode])

  function toggleDark() {
    setDarkMode((d) => {
      localStorage.setItem('theme', !d ? 'dark' : 'light')
      return !d
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes darkMode={darkMode} toggleDark={toggleDark} />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
