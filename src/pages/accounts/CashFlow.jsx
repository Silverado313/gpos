import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    doc,
    serverTimestamp,
    query,
    orderBy,
    limit
} from 'firebase/firestore'

function CashFlow() {
    const [movements, setMovements] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [type, setType] = useState('in') // 'in' or 'out'

    const [form, setForm] = useState({
        amount: '',
        reason: '',
        date: new Date().toISOString().split('T')[0]
    })

    const [editingMovement, setEditingMovement] = useState(null)

    const fetchMovements = async () => {
        try {
            const q = query(collection(db, 'cash_flow'), orderBy('createdAt', 'desc'), limit(50))
            const snapshot = await getDocs(q)
            setMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const init = async () => {
            await fetchMovements()
            setInitialLoading(false)
        }
        init()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const amount = parseFloat(form.amount)
            await addDoc(collection(db, 'cash_flow'), {
                ...form,
                amount: type === 'out' ? -Math.abs(amount) : Math.abs(amount),
                type,
                createdAt: serverTimestamp()
            })
            setForm({
                amount: '',
                reason: '',
                date: new Date().toISOString().split('T')[0]
            })
            setShowForm(false)
            fetchMovements()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const moveRef = doc(db, 'cash_flow', editingMovement.id)
            const amount = parseFloat(editingMovement.amount)
            await updateDoc(moveRef, {
                ...editingMovement,
                amount: editingMovement.type === 'out' ? -Math.abs(amount) : Math.abs(amount),
                updatedAt: serverTimestamp()
            })
            setEditingMovement(null)
            fetchMovements()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this cash flow record? This will affect the calculated balance.')) {
            try {
                await deleteDoc(doc(db, 'cash_flow', id))
                fetchMovements()
            } catch (err) {
                console.error(err)
            }
        }
    }

    const currentBalance = movements.reduce((sum, m) => sum + (m.amount || 0), 0)

    if (initialLoading) {
        return (
            <Layout title="Cash Flow">
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading cash flow data...</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Cash Flow">
            <div className="mt-12">
                {/* Balance Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Current Register Balance</p>
                        <h3 className={`text-4xl font-black tracking-tight ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            PKR {currentBalance.toLocaleString()}
                        </h3>
                        <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Manual Adjustments Only</p>
                    </div>
                    <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <button
                            onClick={() => window.location.href = '/register-reconciliation'}
                            className="flex-1 md:flex-none px-6 py-3 bg-white text-gray-600 border border-gray-200 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition shadow-sm"
                        >
                            📝 Register Close
                        </button>
                        <button
                            onClick={() => { setType('in'); setShowForm(true); }}
                            className="flex-1 md:flex-none px-8 py-3 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-100"
                        >
                            Cash In
                        </button>
                        <button
                            onClick={() => { setType('out'); setShowForm(true); }}
                            className="flex-1 md:flex-none px-8 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition shadow-lg shadow-red-100"
                        >
                            Cash Out
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Movement History</h4>
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-black uppercase tracking-widest">Recent 50</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-gray-50">
                                {movements.length === 0 ? (
                                    <tr>
                                        <td className="px-6 py-12 text-center text-gray-400 italic">No movements recorded yet.</td>
                                    </tr>
                                ) : (
                                    movements.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${m.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {m.type === 'in' ? '↓' : '↑'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">{m.reason}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : new Date(m.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                                <div className="flex items-center justify-end gap-6">
                                                    <span>{m.type === 'in' ? '+' : ''} {m.amount?.toLocaleString()}</span>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingMovement({ ...m, amount: Math.abs(m.amount) })}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(m.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className={`p-6 border-b flex justify-between items-center ${type === 'in' ? 'bg-green-50' : 'bg-red-50'}`}>
                            <h3 className={`text-xl font-black uppercase tracking-tight ${type === 'in' ? 'text-green-800' : 'text-red-800'}`}>
                                Cash {type === 'in' ? 'In' : 'Out'} Entry
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount *</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Reason / Notes *</label>
                                <textarea
                                    required
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                    placeholder={type === 'in' ? 'e.g. Adding change for register' : 'e.g. Buying tea for staff'}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 px-4 py-3 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition disabled:opacity-50 ${type === 'in' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                                >
                                    {loading ? 'Entering...' : `Confirm Cash ${type === 'in' ? 'In' : 'Out'}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingMovement && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className={`p-6 border-b flex justify-between items-center ${editingMovement.type === 'in' ? 'bg-green-50' : 'bg-red-50'}`}>
                            <h3 className={`text-xl font-black uppercase tracking-tight ${editingMovement.type === 'in' ? 'text-green-800' : 'text-red-800'}`}>
                                Edit Cash {editingMovement.type === 'in' ? 'In' : 'Out'}
                            </h3>
                            <button onClick={() => setEditingMovement(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount *</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={editingMovement.amount}
                                    onChange={(e) => setEditingMovement({ ...editingMovement, amount: e.target.value })}
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Reason / Notes *</label>
                                <textarea
                                    required
                                    value={editingMovement.reason}
                                    onChange={(e) => setEditingMovement({ ...editingMovement, reason: e.target.value })}
                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingMovement(null)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 px-4 py-3 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition disabled:opacity-50 ${editingMovement.type === 'in' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                                >
                                    {loading ? 'Updating...' : 'Update Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default CashFlow
