import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthChange } from './firebase/auth'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Products from './pages/products/Products'
import POS from './pages/pos/POS'
import Sales from './pages/sales/Sales'
import Customers from './pages/customers/Customers'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-blue-600 text-xl font-semibold">Loading GPOS...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/products" element={user ? <Products /> : <Navigate to="/login" />} />
      <Route path="/pos" element={user ? <POS /> : <Navigate to="/login" />} />
      <Route path="/sales" element={user ? <Sales /> : <Navigate to="/login" />} />
      <Route path="/customers" element={user ? <Customers /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App