import { NavLink } from 'react-router-dom'
import { logout } from '../../firebase/auth'
import { useNavigate } from 'react-router-dom'

const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/pos', icon: '🛒', label: 'POS' },
    { path: '/products', icon: '📦', label: 'Products' },
    { path: '/inventory', icon: '🏪', label: 'Inventory' },
    { path: '/sales', icon: '💰', label: 'Sales' },
    { path: '/customers', icon: '👥', label: 'Customers' },
    { path: '/employees', icon: '👨‍💼', label: 'Employees' },
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
]

function Sidebar() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0">

            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-blue-400">GPOS</h1>
                <p className="text-gray-400 text-xs mt-1">General Point of Sale</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition w-full text-sm font-medium"
                >
                    <span className="text-lg">🚪</span>
                    Logout
                </button>
            </div>

        </div>
    )
}

export default Sidebar