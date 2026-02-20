import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { collection, getDocs, getDoc, query, orderBy, doc } from 'firebase/firestore'

function Reports() {
    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('today')

    const currency = settings?.currency || 'PKR'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const settingsSnap = await getDoc(doc(db, 'settings', 'global'))
                if (settingsSnap.exists()) setSettings(settingsSnap.data())

                const salesSnap = await getDocs(query(collection(db, 'sales'), orderBy('createdAt', 'desc')))
                const salesList = salesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setSales(salesList)

                const productsSnap = await getDocs(collection(db, 'products'))
                const productsList = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setProducts(productsList)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Filter sales by period
    const getFilteredSales = () => {
        const now = new Date()
        return sales.filter(sale => {
            if (!sale.createdAt) return false
            const saleDate = sale.createdAt.toDate()
            if (period === 'today') {
                return saleDate.toDateString() === now.toDateString()
            } else if (period === 'week') {
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
                return saleDate >= weekAgo
            } else if (period === 'month') {
                return saleDate.getMonth() === now.getMonth() &&
                    saleDate.getFullYear() === now.getFullYear()
            }
            return true
        })
    }

    const filteredSales = getFilteredSales()
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0)
    const totalTransactions = filteredSales.length
    const avgSale = totalTransactions ? totalRevenue / totalTransactions : 0

    // CSV Export Logic
    const handleExportCSV = () => {
        const headers = ['Date', 'Transaction ID', `Total (${currency})`, 'Payment Method', 'Items Count']
        const csvData = filteredSales.map(sale => [
            sale.createdAt?.toDate().toLocaleString(),
            sale.id,
            sale.total.toFixed(2),
            sale.paymentMethod,
            sale.items?.length || 0
        ])

        const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `gpos_report_${period}_${new Date().toLocaleDateString()}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Daily Sales Chart Data (Last 7 Days)
    const getLast7Days = () => {
        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            d.setDate(d.getDate() - i)
            days.push({
                date: d,
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: 0
            })
        }

        sales.forEach(sale => {
            if (!sale.createdAt) return
            const saleDate = sale.createdAt.toDate()
            const day = days.find(d => d.date.toDateString() === saleDate.toDateString())
            if (day) day.revenue += sale.total
        })

        const maxRevenue = Math.max(...days.map(d => d.revenue), 1)
        return days.map(d => ({ ...d, percent: (d.revenue / maxRevenue) * 100 }))
    }

    const chartData = getLast7Days()

    // Payment method breakdown
    const cashSales = filteredSales.filter(s => s.paymentMethod === 'cash')
    const cardSales = filteredSales.filter(s => s.paymentMethod === 'card')
    const creditSales = filteredSales.filter(s => s.paymentMethod === 'credit')

    // Top selling products
    const productSales = {}
    filteredSales.forEach(sale => {
        sale.items?.forEach(item => {
            if (productSales[item.name]) {
                productSales[item.name].quantity += item.quantity
                productSales[item.name].revenue += item.total
            } else {
                productSales[item.name] = { quantity: item.quantity, revenue: item.total }
            }
        })
    })

    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)

    return (
        <Layout title="Reports">

            {/* Header / Export */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                    {['today', 'week', 'month', 'all'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${period === p
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                }`}
                        >
                            {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{currency} {totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Transactions</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{totalTransactions}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Average Ticket</p>
                    <h3 className="text-2xl font-black text-blue-600 mt-1">{currency} {avgSale.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Unique Items</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{Object.keys(productSales).length}</h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Daily Trend Chart (CSS based) */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">📅 Weekly Revenue Trend</h3>
                        <p className="text-xs text-gray-400 font-medium">Last 7 days</p>
                    </div>
                    <div className="flex items-end justify-between h-48 px-2">
                        {chartData.map((day) => (
                            <div key={day.label} className="flex flex-col items-center flex-1 group gap-2">
                                <div className="relative w-full flex justify-center items-end h-32">
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                        {currency} {day.revenue.toLocaleString()}
                                    </div>
                                    <div
                                        style={{ height: `${day.percent}%` }}
                                        className="w-10 bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Composition */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">📊 Sales Composition</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Cash', val: cashSales.length, color: 'bg-green-500' },
                            { label: 'Card', val: cardSales.length, color: 'bg-blue-500' },
                            { label: 'Credit', val: creditSales.length, color: 'bg-yellow-500' }
                        ].map(item => {
                            const percent = totalTransactions ? (item.val / totalTransactions) * 100 : 0
                            return (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>{item.label}</span>
                                        <span>{percent.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`${item.color} h-full transition-all duration-700`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* Top Products */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🏆</span> Top Selling Products
                    </h3>
                    <div className="flex-1 space-y-5">
                        {topProducts.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No data available</p>
                        ) : (
                            topProducts.map(([name, data], index) => {
                                const revPercent = (data.revenue / totalRevenue) * 100
                                return (
                                    <div key={name} className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700 font-medium truncate max-w-[140px]">{name}</span>
                                            <span className="font-bold text-gray-900">{currency} {data.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full opacity-70 ${index === 0 ? 'bg-yellow-500' : 'bg-blue-400'}`}
                                                style={{ width: `${revPercent}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-400">
                                            <span>{data.quantity} units sold</span>
                                            <span>{revPercent.toFixed(1)}% of total</span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Recent Sales Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden col-span-2">
                    <div className="px-6 py-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">📋 Recent Transactions</h3>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Showing Latest 10</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 font-semibold text-gray-500">Date/Time</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-500">Items</th>
                                <th className="text-left px-6 py-3 font-semibold text-gray-500">Mode</th>
                                <th className="text-right px-6 py-3 font-semibold text-gray-500">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="text-gray-400 text-xs">Loading sales...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-gray-400 italic">No transactions in this period</td>
                                </tr>
                            ) : filteredSales.slice(0, 10).map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-3 text-gray-600">
                                        {sale.createdAt?.toDate().toLocaleDateString()}
                                        <span className="block text-[10px] text-gray-400">{sale.createdAt?.toDate().toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-600">{sale.items?.length || 0}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sale.paymentMethod === 'cash' ? 'text-green-600 bg-green-50' :
                                            sale.paymentMethod === 'card' ? 'text-blue-600 bg-blue-50' :
                                                'text-yellow-600 bg-yellow-50'
                                            }`}>{sale.paymentMethod}</span>
                                    </td>
                                    <td className="px-6 py-3 font-bold text-gray-900 text-right">
                                        {sale.currency || currency} {sale.total?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </Layout>
    )
}

export default Reports