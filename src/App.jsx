import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import { onAuthChange } from './firebase/auth'
import { db } from './firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { handleError } from './utils/errorHandler'
import ProtectedRoute from './routes/ProtectedRoute'
import useAuthStore from './store/authStore'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PendingApproval from './pages/auth/PendingApproval'
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
import Documentation from './pages/settings/Documentation'
import UserSettings from './pages/auth/UserSettings'
import Suppliers from './pages/inventory/Suppliers'
import PurchaseOrders from './pages/inventory/PurchaseOrders'
import Import from './pages/settings/Import'

function App() {
  const { user, setUser, loading, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setLoading(true)
      try {
        if (currentUser) {
          // Use the authStore to update role once fetched
          const { setRole, role: cachedRole } = useAuthStore.getState()

          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
            if (userDoc.exists()) {
              const freshRole = userDoc.data().role
              setRole(freshRole)
              setUser({ ...currentUser, role: freshRole })
            } else {
              // Fallback to cached role or default
              const finalRole = cachedRole || 'pending'
              setUser({ ...currentUser, role: finalRole })
            }
          } catch (dbErr) {
            // Offline or network error - log for debugging, use cached role
            console.debug("Firestore role fetch failed (likely offline):", dbErr)
            // If offline, trust the cachedRole from authStore (localStorage)
            setUser({ ...currentUser, role: cachedRole || 'pending' })
          }
        } else {
          setUser(null)
          localStorage.removeItem('gpos_user_role')
        }
      } catch (err) {
        handleError(err, 'Auth Sync', 'Failed to sync authentication')
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
        <p className="text-gray-500 font-medium">GPOS Loading...</p>
      </div>
    )
  }
  const isPending = user && user.role === 'pending'

  return (
    <ErrorBoundary>
      <Toaster position="top-right" reverseOrder={false} />
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
        <Route path="/suppliers" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Suppliers /></ProtectedRoute>} />
        <Route path="/purchase-orders" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PurchaseOrders /></ProtectedRoute>} />
        <Route path="/invoice/:id" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
        <Route path="/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
        <Route path="/import" element={<ProtectedRoute allowedRoles={['admin']}><Import /></ProtectedRoute>} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App