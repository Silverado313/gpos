import { useState, useEffect } from 'react'
import useAuthStore from '../../store/authStore'

function Navbar({ title, onMenuClick }) {
    const { user } = useAuthStore()
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 lg:left-64 right-0 z-[30]">

            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                    <span className="text-xl">☰</span>
                </button>
                {/* Page Title */}
                <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{title}</h2>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
                {/* Offline Badge */}
                {!isOnline && (
                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-2 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        Offline Mode
                    </div>
                )}
                {isOnline && (
                    <div className="hidden md:flex bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        Online
                    </div>
                )}
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800 leading-none">{user?.displayName || 'User'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{user?.role || 'Staff'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 ring-2 ring-white">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
            </div>

        </div>
    )
}

export default Navbar