import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { collection, getDocs, getDoc, query, where, Timestamp, doc } from 'firebase/firestore'

function Dashboard() {
    const [stats, setStats] = useState({
        todaySales: 0,
        yesterdaySales: 0,
        todayTransactions: 0,
        yesterdayTransactions: 0,
        totalProducts: 0,
        totalCustomers: 0,
        loading: true
    })
    const [settings, setSettings] = useState(null)
    const currency = settings?.currency || 'PKR'

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Settings
                const settingsSnap = await getDoc(doc(db, 'settings', 'global'))
                if (settingsSnap.exists()) setSettings(settingsSnap.data())

                // Get Total Products & Customers counts
                const productsSnap = await getDocs(collection(db, 'products'))
                const customersSnap = await getDocs(collection(db, 'customers'))

                // Define time ranges
                const now = new Date()
                const todayStart = new Date(now.setHours(0, 0, 0, 0))

                const yesterdayStart = new Date(todayStart)
                yesterdayStart.setDate(yesterdayStart.getDate() - 1)

                const yesterdayEnd = new Date(todayStart)

                // Query Today's Sales
                const todayQuery = query(
                    collection(db, 'sales'),
                    where('createdAt', '>=', Timestamp.fromDate(todayStart))
                )
                const todaySnap = await getDocs(todayQuery)
                const tSales = todaySnap.docs.reduce((sum, doc) => sum + doc.data().total, 0)

                // Query Yesterday's Sales
                const yesterdayQuery = query(
                    collection(db, 'sales'),
                    where('createdAt', '>=', Timestamp.fromDate(yesterdayStart)),
                    where('createdAt', '<', Timestamp.fromDate(yesterdayEnd))
                )
                const yesterdaySnap = await getDocs(yesterdayQuery)
                const ySales = yesterdaySnap.docs.reduce((sum, doc) => sum + doc.data().total, 0)

                setStats({
                    todaySales: tSales,
                    yesterdaySales: ySales,
                    todayTransactions: todaySnap.size,
                    yesterdayTransactions: yesterdaySnap.size,
                    totalProducts: productsSnap.size,
                    totalCustomers: customersSnap.size,
                    loading: false
                })
            } catch (err) {
                console.error("Dashboard fetch error:", err)
                setStats(prev => ({ ...prev, loading: false }))
            }
        }

        fetchStats()
    }, [])

    const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    }

    const salesGrowth = calculateGrowth(stats.todaySales, stats.yesterdaySales)
    const transGrowth = calculateGrowth(stats.todayTransactions, stats.yesterdayTransactions)

    if (stats.loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4 mt-12">

                {/* Stat Cards */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Today's Sales</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{currency} {stats.todaySales.toLocaleString()}</h3>
                    <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {salesGrowth >= 0 ? '↑' : '↓'} {Math.abs(salesGrowth).toFixed(1)}% <span className="text-gray-400 font-normal">from yesterday</span>
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Transactions</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.todayTransactions}</h3>
                    <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${transGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {transGrowth >= 0 ? '↑' : '↓'} {Math.abs(transGrowth).toFixed(1)}% <span className="text-gray-400 font-normal">from yesterday</span>
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Products</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</h3>
                    <p className="text-gray-400 text-xs mt-2 italic">Active items in inventory</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Customers</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalCustomers}</h3>
                    <p className="text-gray-400 text-xs mt-2 italic">Registered profiles</p>
                </div>

            </div>

            {/* Welcome / Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-lg text-white">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold mb-2">Welcome back to GPOS! 🚀</h2>
                    <p className="text-blue-100 mb-6 leading-relaxed text-lg">
                        Your business performance is looking great today. You have {stats.todayTransactions} new transactions to review.
                    </p>
                    <div className="flex gap-3 mb-4">
                        <button onClick={() => window.location.href = '/pos'} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition">
                            Open POS
                        </button>
                        <button onClick={() => window.location.href = '/inventory'} className="bg-blue-500 text-white border border-blue-400 px-6 py-2 rounded-lg font-bold hover:bg-blue-400 transition">
                            Manage Inventory
                        </button>
                    </div>
                </div>
            </div>

        </Layout>
    )
}

export default Dashboard
