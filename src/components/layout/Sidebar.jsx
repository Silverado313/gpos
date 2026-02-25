import { NavLink } from 'react-router-dom'
import { logout } from '../../firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'

const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', roles: ['admin', 'manager', 'cashier'] },
    { path: '/pos', icon: '🛒', label: 'POS', roles: ['admin', 'manager', 'cashier'] },
    { path: '/products', icon: '📦', label: 'Products', roles: ['admin', 'manager'] },
    { path: '/inventory', icon: '🏪', label: 'Inventory', roles: ['admin', 'manager'] },
    { path: '/suppliers', icon: '🏭', label: 'Suppliers', roles: ['admin', 'manager'] },
    { path: '/purchase-orders', icon: '📝', label: 'PO', roles: ['admin', 'manager'] },
    { path: '/sales', icon: '💰', label: 'Sales', roles: ['admin', 'manager', 'cashier'] },
    { path: '/customers', icon: '👥', label: 'Customers', roles: ['admin', 'manager', 'cashier'] },
    { path: '/employees', icon: '👨‍💼', label: 'Employees', roles: ['admin'] },
    { path: '/reports', icon: '📈', label: 'Reports', roles: ['admin'] },
    { path: '/settings', icon: '⚙️', label: 'Settings', roles: ['admin'] },
    { path: '/import', icon: '⬆️', label: 'Import Data', roles: ['admin'] },
    { path: '/backup', icon: '🗄️', label: 'Backup & Restore', roles: ['admin'] },
    { path: '/documentation', icon: '📖', label: 'Documentation', roles: ['admin', 'manager', 'cashier'] },
    { path: '/user-settings', icon: '👤', label: 'Profile', roles: ['admin', 'manager', 'cashier'] },
]

function Sidebar({ isOpen, setIsOpen }) {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const filteredMenu = menuItems.filter(item =>
        !item.roles || item.roles.includes(user?.role)
    )

    const menuGroups = [
        { title: 'Main', paths: ['/dashboard', '/pos'] },
        { title: 'Management', paths: ['/products', '/inventory', '/suppliers', '/purchase-orders'] },
        { title: 'Sales', paths: ['/sales', '/customers'] },
        { title: 'Administration', paths: ['/employees', '/reports', '/settings', '/import', '/backup'] },
        { title: 'Help', paths: ['/documentation', '/user-settings'] },
    ]

    const [openGroups, setOpenGroups] = useState(() => {
        const initial = {}
        menuGroups.forEach(g => { initial[g.title] = g.title === 'Main' })
        return initial
    })

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

            {/* Menu (grouped) */}
            <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
                {menuGroups.map((group) => {
                    const items = filteredMenu.filter(i => group.paths.includes(i.path))
                    if (!items.length) return null
                    const open = !!openGroups[group.title]
                    return (
                        <div key={group.title}>
                            <button
                                type="button"
                                onClick={() => setOpenGroups(prev => ({ ...prev, [group.title]: !prev[group.title] }))}
                                className="w-full flex items-center justify-between px-2 mb-2 text-xs uppercase text-gray-400 font-black"
                                aria-expanded={open}
                            >
                                <span>{group.title}</span>
                                <span className={`transform transition-transform text-gray-300 ${open ? 'rotate-90' : ''}`}>▸</span>
                            </button>

                            {open && (
                                <div className="bg-gray-800 rounded-lg p-2 space-y-1">
                                    {items.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 rounded-md transition text-sm font-medium ${isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }`
                                            }
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
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