import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { collection, getDocs, getDoc, orderBy, query, updateDoc, doc, addDoc, serverTimestamp, where, limit } from 'firebase/firestore'
import useAuthStore from '../../store/authStore'
import { handleError, showSuccess } from '../../utils/errorHandler'
import { generateReceiptMessage, getWhatsAppLink, getSMSLink } from '../../utils/receiptHelper'

function Sales() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [initialLoading, setInitialLoading] = useState(true)
    const [settings, setSettings] = useState(null)
    const currency = settings?.currency || 'PKR'
    const { user } = useAuthStore()

    const fetchSales = async () => {
        setLoading(true)
        try {
            const [salesSnap, settingsSnap] = await Promise.all([
                getDocs(query(collection(db, 'sales'), orderBy('createdAt', 'desc'))),
                getDoc(doc(db, 'settings', 'global'))
            ])

            if (settingsSnap.exists()) setSettings(settingsSnap.data())

            const list = salesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setSales(list)
        } catch (err) {
            handleError(err, 'Fetch Sales', 'Failed to load sales history')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const init = async () => {
            await fetchSales()
            setInitialLoading(false)
        }
        init()
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

            showSuccess('Sale returned and stock restored successfully')
            fetchSales()
            setSelected(null)
        } catch (err) {
            handleError(err, 'Process Return', 'Failed to process return')
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

    if (initialLoading) {
        return (
            <Layout title="Sales History">
                <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-[9999]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Financial History...</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Sales History">

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-12">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Transactions</p>
                    <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{sales.length}</h3>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-black text-green-600 dark:text-green-400 uppercase tracking-tight">
                        {sales[0]?.currency || 'PKR'} {totalRevenue.toFixed(2)}
                    </h3>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Average Sale</p>
                    <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                        {sales[0]?.currency || 'PKR'} {sales.length ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
                    </h3>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Sales Table */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                                <tr>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Transaction</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Inventory</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Payment</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Revenue</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400 dark:text-gray-500 italic">
                                            Syncing with ledger...
                                        </td>
                                    </tr>
                                ) : sales.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400 dark:text-gray-500 italic">
                                            No sales yet. Make your first sale in POS!
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale, index) => (
                                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-6 py-4 text-gray-800 dark:text-gray-100 font-bold text-sm">#{sales.length - index}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-[11px] font-medium uppercase tracking-tight">{formatDate(sale.createdAt)}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs font-bold">{sale.items?.length} items sold</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sale.paymentMethod === 'cash'
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                    : sale.paymentMethod === 'card'
                                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                                    }`}>
                                                    {sale.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 dark:text-gray-100">{sale.currency || 'PKR'} {sale.total?.toLocaleString()}</span>
                                                    {sale.status === 'returned' && (
                                                        <span className="text-[10px] text-red-500 font-black uppercase tracking-tight">Returned</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelected(sale)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-black uppercase tracking-widest"
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/invoice/${sale.id}`, '_blank')}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-black text-[10px] uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-1.5 rounded-lg border dark:border-gray-700 transition"
                                                >
                                                    📜 Receipt
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
                    <div className="w-full lg:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 lg:sticky lg:top-24 lg:h-fit transition-all duration-300 animate-in slide-in-from-right">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Voucher Breakdown</h3>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >✕</button>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6 border-b dark:border-gray-800 pb-2">Issued: {formatDate(selected.createdAt)}</p>

                        {/* Items */}
                        <div className="space-y-4 mb-8">
                            {selected.items?.map((item, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{item.name}</span>
                                        <span className="text-[10px] text-gray-500 font-medium">Qty: {item.quantity} × {currency} {item.price}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-gray-100">{selected.currency || 'PKR'} {item.total}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t dark:border-gray-800 pt-6 space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                                <span className="uppercase tracking-widest">Subtotal</span>
                                <span>{selected.currency || 'PKR'} {selected.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                                <span className="uppercase tracking-widest">{selected.taxLabel || 'Tax'}</span>
                                <span>{selected.currency || 'PKR'} {selected.tax?.toFixed(2)}</span>
                            </div>
                            {selected.discount > 0 && (
                                <div className="flex justify-between text-xs font-black text-blue-600 dark:text-blue-400">
                                    <span className="uppercase tracking-widest">Discount Applied</span>
                                    <span>-{selected.currency || 'PKR'} {selected.discount?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 border-t dark:border-gray-800 pt-4 text-xl">
                                <span className="uppercase tracking-tighter">Net Total</span>
                                <span className="text-blue-600 dark:text-blue-400">{selected.currency || 'PKR'} {selected.total?.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 italic">
                                    <span>Paid Amount</span>
                                    <span>{selected.currency || 'PKR'} {selected.amountPaid?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-green-600 dark:text-green-400 italic">
                                    <span>Change Returned</span>
                                    <span>{selected.currency || 'PKR'} {selected.change?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${selected.paymentMethod === 'cash'
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                : selected.paymentMethod === 'card'
                                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                }`}>
                                Method: {selected.paymentMethod}
                            </span>

                            {selected.customerPhone && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            const msg = generateReceiptMessage(selected, settings)
                                            window.open(getWhatsAppLink(selected.customerPhone, msg), '_blank')
                                        }}
                                        className="bg-green-600 text-white py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    ><span>📱</span> WhatsApp</button>
                                    <button
                                        onClick={() => {
                                            const msg = generateReceiptMessage(selected, settings)
                                            window.location.href = getSMSLink(selected.customerPhone, msg)
                                        }}
                                        className="bg-gray-800 text-white py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 transition flex items-center justify-center gap-2"
                                    ><span>💬</span> SMS</button>
                                </div>
                            )}
                        </div>

                        {selected.status !== 'returned' && (user?.role === 'admin' || user?.role === 'manager') && (
                            <button
                                onClick={() => handleReturn(selected)}
                                disabled={loading}
                                className="w-full mt-8 bg-red-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition shadow-lg shadow-red-500/20 disabled:opacity-50"
                            >
                                🔄 Process Void Return
                            </button>
                        )}
                    </div>
                )}
            </div>

        </Layout>
    )
}

export default Sales