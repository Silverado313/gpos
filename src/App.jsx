import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthChange } from './firebase/auth'
import { db } from './firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import ProtectedRoute from './routes/ProtectedRoute'
import useAuthStore from './store/authStore'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PendingApproval from './pages/auth/PendingApproval'
import UserSettings from './pages/auth/UserSettings'
import Invoice from './pages/sales/Invoice'
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
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          const role = userDoc.exists() ? userDoc.data().role : 'pending' // Default to pending for safety
          setUser({ ...currentUser, role })
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Auth sync error:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [setUser, setLoading])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center z-[9999]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Synchronizing GPOS...</p>
      </div>
    )
  }
  const isPending = user && user.role === 'pending'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (isPending ? '/pending' : '/dashboard') : '/login'} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/pending" element={user && isPending ? <PendingApproval /> : <Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Products /></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute allowedRoles={['admin']}><Employees /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Inventory /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
      <Route path="/user-settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
      <Route path="/invoice/:id" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
    </Routes>
  )
}

export default App