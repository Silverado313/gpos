import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthChange } from './firebase/auth'
import { db } from './firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import ProtectedRoute from './routes/ProtectedRoute'
import useAuthStore from './store/authStore'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Products from './pages/products/Products'
import POS from './pages/pos/POS'
import Sales from './pages/sales/Sales'
import Customers from './pages/customers/Customers'
import Inventory from './pages/inventory/Inventory'
import Employees from './pages/employees/Employees'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'

function App() {
  const { user, setUser, loading, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setLoading(true)
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        const role = userDoc.exists() ? userDoc.data().role : 'admin'
        setUser({ ...currentUser, role })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [setUser, setLoading])

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
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Products /></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute allowedRoles={['admin']}><Employees /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Inventory /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
    </Routes>
  )
}

export default App