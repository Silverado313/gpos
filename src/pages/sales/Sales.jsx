import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { collection, getDocs, orderBy, query, updateDoc, doc, addDoc, serverTimestamp, where, limit } from 'firebase/firestore'
import useAuthStore from '../../store/authStore'

function Sales() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const { user } = useAuthStore()

    const fetchSales = async () => {
        setLoading(true)
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

    useEffect(() => {
        fetchSales()
    }, [])

    const handleReturn = async (sale) => {
        if (!window.confirm('Are you sure you want to return this entire sale? This will restore items to inventory.')) return

        setLoading(true)
        try {
            // 1. Create Return Record
            await addDoc(collection(db, 'sales_returns'), {
                originalSaleId: sale.id,
                items: sale.items,
                totalReturned: sale.total,
                customerId: sale.customerId,
                customerName: sale.customerName,
                createdAt: serverTimestamp()
            })

            // 2. Update Sale Status
            await updateDoc(doc(db, 'sales', sale.id), {
                status: 'returned',
                returnedAt: serverTimestamp()
            })

            // 3. Restore Stock in Inventory
            for (const item of sale.items) {
                const invQuery = query(
                    collection(db, 'inventory'),
                    where('productId', '==', item.productId),
                    limit(1)
                )
                const invSnap = await getDocs(invQuery)

                if (!invSnap.empty) {
                    const invDoc = invSnap.docs[0]
                    await updateDoc(doc(db, 'inventory', invDoc.id), {
                        currentStock: invDoc.data().currentStock + item.quantity,
                        lastUpdated: serverTimestamp()
                    })
                }
            }

            alert('Sale returned and stock restored successfully!')
            fetchSales()
            setSelected(null)
        } catch (err) {
            console.error('Return error:', err)
            alert('Failed to process return.')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return '-'
        const date = timestamp.toDate()
        return date.toLocaleString()
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

    return (
        <Layout title="Sales History">

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-12">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Transactions</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{sales.length}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-green-600 mt-1">
                        {sales[0]?.currency || 'PKR'} {totalRevenue.toFixed(2)}
                    </h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Average Sale</p>
                    <h3 className="text-2xl font-bold text-blue-600 mt-1">
                        {sales[0]?.currency || 'PKR'} {sales.length ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
                    </h3>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Sales Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm overflow-x-auto">
                    <div className="min-w-[600px]">
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
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                <div className="flex flex-col">
                                                    <span>{sale.currency || 'PKR'} {sale.total?.toFixed(2)}</span>
                                                    {sale.status === 'returned' && (
                                                        <span className="text-[10px] text-red-500 font-black uppercase">Returned</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelected(sale)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/invoice/${sale.id}`, '_self')}
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase tracking-widest border-2 border-blue-100 px-2 py-1 rounded-md hover:border-blue-200 transition"
                                                >
                                                    📜 Invoice
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sale Detail Panel */}
                {selected && (
                    <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-20 lg:h-fit">
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
                                    <span className="font-medium">{selected.currency || 'PKR'} {item.total}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-3 space-y-1">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>{selected.currency || 'PKR'} {selected.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{selected.taxLabel || 'Tax'}</span>
                                <span>{selected.currency || 'PKR'} {selected.tax?.toFixed(2)}</span>
                            </div>
                            {selected.discount > 0 && (
                                <div className="flex justify-between text-sm text-blue-600">
                                    <span>Discount (Redeemed)</span>
                                    <span>-{selected.currency || 'PKR'} {selected.discount?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-gray-900 border-t pt-2 text-base">
                                <span>Total</span>
                                <span>{selected.currency || 'PKR'} {selected.total?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mt-2">
                                <span>Paid</span>
                                <span>{selected.currency || 'PKR'} {selected.amountPaid?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Change</span>
                                <span>{selected.currency || 'PKR'} {selected.change?.toFixed(2)}</span>
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

                        {selected.status !== 'returned' && (user?.role === 'admin' || user?.role === 'manager') && (
                            <button
                                onClick={() => handleReturn(selected)}
                                disabled={loading}
                                className="w-full mt-6 bg-red-50 text-red-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition border-2 border-red-100 disabled:opacity-50"
                            >
                                🔄 Return Sale
                            </button>
                        )}
                    </div>
                )}
            </div>

        </Layout>
    )
}

export default Sales