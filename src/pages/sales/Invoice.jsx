import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { handleError } from '../../utils/errorHandler'

function Invoice() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [sale, setSale] = useState(null)
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                // Fetch Sale
                const saleSnap = await getDoc(doc(db, 'sales', id))
                if (saleSnap.exists()) {
                    setSale({ id: saleSnap.id, ...saleSnap.data() })
                }

                // Fetch Settings (using a placeholder 'admin' or first user's settings)
                // In a real app, this would be based on the business owner's ID
                const settingsSnap = await getDoc(doc(db, 'settings', 'global'))
                if (settingsSnap.exists()) {
                    setSettings(settingsSnap.data())
                }
            } catch (err) {
                handleError(err, 'Fetch Invoice', 'Failed to load invoice')
            } finally {
                setLoading(false)
            }
        }
        fetchInvoice()
    }, [id])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    )

    if (!sale) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <p className="text-gray-500 mb-4 font-medium italic">Invoice not found or deleted.</p>
            <button onClick={() => navigate(-1)} className="text-blue-600 font-bold hover:underline">← Go Back</button>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0">

            {/* Action Buttons (Hidden on Print) */}
            <div className="max-w-xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button onClick={() => navigate(-1)} className="text-gray-600 font-medium hover:text-gray-800 transition">
                    ← Back to App
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
                    >
                        <span>🖨️</span> Print Invoice
                    </button>
                </div>
            </div>

            {/* The Invoice Paper */}
            <div className="max-w-xl mx-auto bg-white shadow-2xl rounded-2xl p-8 print:shadow-none print:rounded-none print:p-4">

                {/* Header */}
                <div className="text-center border-b pb-6 mb-6">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {settings?.businessName || 'GPOS Business'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase font-bold tracking-widest italic leading-tight">
                        Official Receipt
                    </p>
                    {settings?.loyaltyEnabled && (
                        <p className="text-[10px] text-blue-500 font-bold mt-2">✨ Member Program Active</p>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div className="space-y-1">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Bill To</p>
                        <p className="font-black text-gray-800 text-lg leading-tight">{sale.customerName}</p>
                        <p className="text-gray-500 font-medium">Type: {sale.customerId === 'walk-in' ? 'Walk-in' : 'Registered Member'}</p>
                        <p className="text-gray-400 font-bold uppercase text-[9px] mt-2 tracking-widest leading-none">Served By</p>
                        <p className="text-gray-600 font-bold italic">{sale.cashierName || 'Staff'}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Transaction</p>
                        <p className="font-bold text-gray-800">#{sale.id.slice(-6).toUpperCase()}</p>
                        <p className="text-gray-500 text-xs">
                            {sale.createdAt?.toDate().toLocaleDateString()} — {sale.createdAt?.toDate().toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-900 text-gray-900 text-[11px] font-black uppercase tracking-tighter">
                                <th className="py-2">Item Description</th>
                                <th className="py-2 text-center w-20">Qty</th>
                                <th className="py-2 text-right w-24">Price</th>
                                <th className="py-2 text-right w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sale.items?.map((item, idx) => (
                                <tr key={idx} className="text-sm">
                                    <td className="py-3 font-semibold text-gray-800">{item.name}</td>
                                    <td className="py-3 text-center text-gray-600 font-medium">{item.quantity}</td>
                                    <td className="py-3 text-right text-gray-600 font-medium">{item.price.toFixed(2)}</td>
                                    <td className="py-3 text-right font-black text-gray-800">{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="border-t-2 border-gray-900 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-bold uppercase text-[11px]">Subtotal</span>
                        <span className="font-bold text-gray-800">{sale.currency || 'PKR'} {sale.subtotal.toFixed(2)}</span>
                    </div>
                    {sale.tax > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-bold uppercase text-[11px]">{sale.taxLabel || 'Tax'}</span>
                            <span className="font-bold text-gray-800">{sale.currency || 'PKR'} {sale.tax.toFixed(2)}</span>
                        </div>
                    )}
                    {sale.discount > 0 && (
                        <div className="flex justify-between text-sm text-blue-600">
                            <span className="font-bold uppercase text-[11px]">Loyalty Discount</span>
                            <span className="font-bold">-{sale.currency || 'PKR'} {sale.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center py-2 bg-gray-50 rounded px-3 border-l-4 border-blue-600">
                        <span className="font-black text-gray-900 text-lg">Total Amount</span>
                        <span className="font-black text-gray-900 text-2xl">{sale.currency || 'PKR'} {sale.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Method</p>
                        <p className="text-sm font-black text-gray-800 uppercase italic tracking-widest">{sale.paymentMethod}</p>
                    </div>
                    {sale.paymentMethod === 'cash' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Change Returned</p>
                            <p className="text-sm font-black text-green-600 italic">{sale.currency || 'PKR'} {sale.change.toFixed(2)}</p>
                        </div>
                    )}
                </div>

                {/* Footer Message */}
                <div className="mt-10 pt-10 border-t border-dashed border-gray-200 text-center">
                    <p className="text-gray-600 font-medium text-sm italic">
                        "{settings?.receiptFooter || 'Thank you for shopping with us!'}"
                    </p>
                    <div className="mt-4 flex flex-col items-center">
                        <div className="w-16 h-1 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <p className="text-[9px] text-gray-400 font-black mt-2 uppercase tracking-[0.2em]">Generated by GPOS System v1.0</p>
                        <p className="text-[8px] text-blue-400 font-bold mt-1">Visit us again!</p>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Invoice
