import { NavLink } from 'react-router-dom'
import { logout } from '../../firebase/auth'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['admin', 'manager', 'cashier'] },
    { path: '/pos', icon: '🛒', label: 'POS', roles: ['admin', 'manager', 'cashier'] },
    { path: '/products', icon: '📦', label: 'Products', roles: ['admin', 'manager'] },
    { path: '/inventory', icon: '🏪', label: 'Inventory', roles: ['admin', 'manager'] },
    { path: '/sales', icon: '💰', label: 'Sales', roles: ['admin', 'manager', 'cashier'] },
    { path: '/customers', icon: '👥', label: 'Customers', roles: ['admin', 'manager', 'cashier'] },
    { path: '/employees', icon: '👨‍💼', label: 'Employees', roles: ['admin'] },
    { path: '/reports', icon: '📈', label: 'Reports', roles: ['admin'] },
    { path: '/settings', icon: '⚙️', label: 'Settings', roles: ['admin'] },
    { path: '/documentation', icon: '📖', label: 'Documentation', roles: ['admin', 'manager', 'cashier'] },
    { path: '/user-settings', icon: '👤', label: 'Profile', roles: ['admin', 'manager', 'cashier'] },
]

function Sidebar({ isOpen, setIsOpen }) {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const filteredMenu = menuItems.filter(item =>
        !item.roles || item.roles.includes(user?.role)
    )

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className={`h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 z-[50] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-blue-400">GPOS</h1>
                <p className="text-gray-400 text-xs mt-1">General Point of Sale</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
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