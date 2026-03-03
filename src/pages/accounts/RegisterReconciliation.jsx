import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore'
import { handleError, showSuccess } from '../../utils/errorHandler'

function RegisterReconciliation() {
    const [cashFlow, setCashFlow] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [settings, setSettings] = useState(null)
    const [actualCash, setActualCash] = useState('')
    const [notes, setNotes] = useState('')
    const [lastReconciliation, setLastReconciliation] = useState(null)

    const currency = settings?.currency || 'PKR'

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch settings
                const settingsSnap = await getDoc(doc(db, 'settings', 'global'))
                if (settingsSnap.exists()) setSettings(settingsSnap.data())

                // Fetch last reconciliation query
                const lastRecSnap = await getDocs(query(
                    collection(db, 'reconciliations'),
                    orderBy('createdAt', 'desc'),
                    where('status', '==', 'completed')
                ))

                let startTime = null
                if (!lastRecSnap.empty) {
                    const last = lastRecSnap.docs[0].data()
                    setLastReconciliation({ ...last, id: lastRecSnap.docs[0].id })
                    startTime = last.createdAt
                }

                // Fetch cash flow since last reconciliation
                let cashQuery = query(collection(db, 'cash_flow'), orderBy('createdAt', 'desc'))

                // If we have a startTime, we should filter by it, but Firestore requires composite index for query + orderBy
                // For simplicity in this step, we'll fetch all and filter in JS if needed, or just fetch all for now
                const cashSnap = await getDocs(cashQuery)
                let cashList = cashSnap.docs.map(d => ({ id: d.id, ...d.data() }))

                if (startTime) {
                    cashList = cashList.filter(c => {
                        const cDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt)
                        return cDate > startTime.toDate()
                    })
                }

                setCashFlow(cashList)

            } catch (err) {
                handleError(err, 'Fetch Data', 'Failed to load reconciliation data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const cashIn = cashFlow.filter(c => c.type === 'in').reduce((sum, c) => sum + (c.amount || 0), 0)
    const cashOut = cashFlow.filter(c => c.type === 'out').reduce((sum, c) => sum + (c.amount || 0), 0)
    const openingBalance = lastReconciliation?.actualCash || 0
    const expectedCash = openingBalance + cashIn - cashOut
    const difference = parseFloat(actualCash || 0) - expectedCash

    const handleCloseRegister = async (e) => {
        e.preventDefault()
        if (!actualCash) return alert('Please enter actual cash counted')

        setSubmitting(true)
        try {
            const reportData = {
                openingBalance,
                cashIn,
                cashOut,
                expectedCash,
                actualCash: parseFloat(actualCash),
                difference,
                notes,
                status: 'completed',
                createdAt: serverTimestamp(),
                periodStart: lastReconciliation?.createdAt || null,
                periodEnd: serverTimestamp()
            }

            await addDoc(collection(db, 'reconciliations'), reportData)
            showSuccess('Register closed and report saved!')

            // Reset for next shift
            setActualCash('')
            setNotes('')
            setTimeout(() => {
                window.location.href = '/cash-flow'
            }, 1000)
        } catch (err) {
            handleError(err, 'Close Register', 'Failed to save reconciliation report')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Layout title="Register Reconciliation">
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Calculating cash positions...</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Register Reconciliation">
            <div className="mt-12 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                    <div className="p-10 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-60 mb-2">End of Day</h3>
                            <h2 className="text-4xl font-black tracking-tighter">Register Reconciliation</h2>
                            <p className="mt-4 text-blue-200 text-sm font-medium">
                                Last closed: {lastReconciliation ? new Date(lastReconciliation.createdAt.toDate()).toLocaleString() : 'Never'}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <span className="text-9xl">🏧</span>
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Summary side */}
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Financial Summary</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                        <span className="text-sm text-gray-500 font-bold">Opening Balance</span>
                                        <span className="font-bold text-gray-800">{currency} {openingBalance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                        <span className="text-sm text-gray-500 font-bold">Total Cash In (Sales + Manual)</span>
                                        <span className="font-bold text-green-600">+{currency} {cashIn.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                        <span className="text-sm text-gray-500 font-bold">Total Cash Out</span>
                                        <span className="font-bold text-red-600">-{currency} {cashOut.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 bg-gray-50 px-4 rounded-2xl mt-4">
                                        <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">Expected in Drawer</span>
                                        <span className="text-2xl font-black text-blue-600">{currency} {expectedCash.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                                <p className="text-xs text-blue-800 font-bold leading-relaxed">
                                    <span className="text-lg mr-1">💡</span>
                                    Expected cash is calculated based on your starting balance plus all recorded cash transactions since your last reconciliation.
                                </p>
                            </div>
                        </div>

                        {/* Audit side */}
                        <form onSubmit={handleCloseRegister} className="space-y-6">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Drawer Count</h4>

                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Actual Cash Counted *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">{currency}</span>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={actualCash}
                                        onChange={(e) => setActualCash(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-16 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all text-xl font-black"
                                    />
                                </div>
                            </div>

                            <div className={`p-6 rounded-2xl border-2 transition-all ${difference === 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-600">Difference (Over/Short)</span>
                                    <span className={`text-xl font-black ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {currency} {difference.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">
                                    {difference === 0 ? 'Perfect balance!' : difference > 0 ? 'Surplus detected' : 'Shortage detected'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1">Internal Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any reason for discrepancy..."
                                    rows="4"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Generating Report...' : 'Finalize & Close Register'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition"
                    >
                        ← Back to Cash Flow
                    </button>
                </div>
            </div>
        </Layout>
    )
}

export default RegisterReconciliation
