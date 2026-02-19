import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

function Sales() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'))
                const snapshot = await getDocs(q)
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setSales(list)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSales()
    }, [])

    const formatDate = (timestamp) => {
        if (!timestamp) return '-'
        const date = timestamp.toDate()
        return date.toLocaleString()
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

    return (
        <Layout title="Sales History">

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Transactions</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{sales.length}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-green-600 mt-1">PKR {totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Average Sale</p>
                    <h3 className="text-2xl font-bold text-blue-600 mt-1">
                        PKR {sales.length ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
                    </h3>
                </div>
            </div>

            <div className="flex gap-6">

                {/* Sales Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">#</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Items</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Payment</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">
                                        Loading sales...
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">
                                        No sales yet. Make your first sale in POS!
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale, index) => (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500 text-sm">#{index + 1}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(sale.createdAt)}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{sale.items?.length} items</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${sale.paymentMethod === 'cash'
                                                    ? 'bg-green-100 text-green-600'
                                                    : sale.paymentMethod === 'card'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">PKR {sale.total?.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelected(sale)}
                                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Sale Detail Panel */}
                {selected && (
                    <div className="w-72 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Sale Detail</h3>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >✕</button>
                        </div>

                        <p className="text-xs text-gray-400 mb-4">{formatDate(selected.createdAt)}</p>

                        {/* Items */}
                        <div className="space-y-2 mb-4">
                            {selected.items?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                    <span className="font-medium">PKR {item.total}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-3 space-y-1">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>PKR {selected.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax</span>
                                <span>PKR {selected.tax?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
                                <span>Total</span>
                                <span>PKR {selected.total?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Paid</span>
                                <span>PKR {selected.amountPaid?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Change</span>
                                <span>PKR {selected.change?.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${selected.paymentMethod === 'cash'
                                    ? 'bg-green-100 text-green-600'
                                    : selected.paymentMethod === 'card'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                {selected.paymentMethod}
                            </span>
                        </div>
                    </div>
                )}
            </div>

        </Layout>
    )
}

export default Sales