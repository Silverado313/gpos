import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuthStore()

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-blue-600 text-xl font-semibold">Checking permissions...</p>
        </div>
    )

    if (!user) {
        return <Navigate to="/login" />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" />
    }

    return children
}

export default ProtectedRoute