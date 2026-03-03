import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore'

const CATEGORIES = [
    'Rent',
    'Utilities',
    'Salaries',
    'Marketing',
    'Inventory',
    'Maintenance',
    'Taxes',
    'Other'
]

function Expenses() {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingExpense, setEditingExpense] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    const fetchExpenses = async () => {
        try {
            const q = query(collection(db, 'expenses'), orderBy('date', 'desc'))
            const snapshot = await getDocs(q)
            setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const init = async () => {
            await fetchExpenses()
            setInitialLoading(false)
        }
        init()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addDoc(collection(db, 'expenses'), {
                ...form,
                amount: parseFloat(form.amount),
                createdAt: serverTimestamp()
            })
            setForm({
                title: '',
                amount: '',
                category: 'Other',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            })
            setShowForm(false)
            fetchExpenses()
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
            const expenseRef = doc(db, 'expenses', editingExpense.id)
            await updateDoc(expenseRef, {
                ...editingExpense,
                amount: parseFloat(editingExpense.amount),
                updatedAt: serverTimestamp()
            })
            setEditingExpense(null)
            fetchExpenses()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this expense record?')) {
            await deleteDoc(doc(db, 'expenses', id))
            fetchExpenses()
        }
    }

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             exp.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)

    if (initialLoading) {
        return (
            <Layout title="Expenses">
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading expenses...</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Expenses">
            <div className="mt-12">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Expenses</p>
                        <h3 className="text-3xl font-black text-gray-800 tracking-tight">
                            PKR {totalAmount.toLocaleString()}
                        </h3>
                        <p className="text-xs text-gray-500 mt-2">Based on current filters</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        + Record Expense
                    </button>
                </div>

                {/* Expense List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Title</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            No expense records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                {new Date(exp.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-800">{exp.title}</p>
                                                {exp.notes && <p className="text-xs text-gray-400 line-clamp-1">{exp.notes}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">
                                                PKR {exp.amount?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingExpense(exp)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(exp.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
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

            {/* Add Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Record Expense</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Monthly Rent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount *</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingExpense && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-blue-50">
                            <h3 className="text-xl font-black text-blue-800 uppercase tracking-tight">Edit Expense</h3>
                            <button onClick={() => setEditingExpense(null)} className="text-blue-400 hover:text-blue-600">✕</button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingExpense.title}
                                    onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount *</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={editingExpense.amount}
                                        onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                                    <select
                                        value={editingExpense.category}
                                        onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={editingExpense.date}
                                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes</label>
                                <textarea
                                    value={editingExpense.notes}
                                    onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingExpense(null)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default Expenses
