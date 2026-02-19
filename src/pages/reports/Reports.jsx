import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

function Reports() {
    const [sales, setSales] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('today')

    useEffect(() => {
        const fetchData = async () => {
            try {
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

            {/* Period Filter */}
            <div className="flex gap-3 mb-6">
                {['today', 'week', 'month', 'all'].map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${period === p
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                            }`}
                    >
                        {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-green-600 mt-1">PKR {totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Transactions</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalTransactions}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Average Sale</p>
                    <h3 className="text-2xl font-bold text-blue-600 mt-1">PKR {avgSale.toFixed(2)}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Products</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{products.length}</h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">

                {/* Payment Breakdown */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">💳 Payment Breakdown</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-gray-600">Cash</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-800">{cashSales.length} sales</p>
                                <p className="text-sm text-gray-500">
                                    PKR {cashSales.reduce((s, i) => s + i.total, 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">Card</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-800">{cardSales.length} sales</p>
                                <p className="text-sm text-gray-500">
                                    PKR {cardSales.reduce((s, i) => s + i.total, 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-gray-600">Credit</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-800">{creditSales.length} sales</p>
                                <p className="text-sm text-gray-500">
                                    PKR {creditSales.reduce((s, i) => s + i.total, 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">🏆 Top Selling Products</h3>
                    {topProducts.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No sales data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map(([name, data], index) => (
                                <div key={name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                    index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                                            }`}>{index + 1}</span>
                                        <span className="text-gray-700 text-sm">{name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 text-sm">PKR {data.revenue}</p>
                                        <p className="text-xs text-gray-400">{data.quantity} units</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Sales Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden col-span-2">
                    <div className="px-6 py-4 border-b">
                        <h3 className="font-bold text-gray-800">📋 Recent Transactions</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Items</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Payment</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-400">Loading...</td>
                                </tr>
                            ) : filteredSales.slice(0, 8).map((sale, index) => (
                                <tr key={sale.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {sale.createdAt?.toDate().toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{sale.items?.length} items</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-600' :
                                                sale.paymentMethod === 'card' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                            }`}>{sale.paymentMethod}</span>
                                    </td>
                                    <td className="px-6 py-3 font-bold text-gray-800">PKR {sale.total?.toFixed(2)}</td>
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