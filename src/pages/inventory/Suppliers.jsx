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
    serverTimestamp
} from 'firebase/firestore'

function Suppliers() {
    const [suppliers, setSuppliers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        category: '',
    })
    const [editingSupplier, setEditingSupplier] = useState(null)

    // Fetch Suppliers
    const fetchSuppliers = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'suppliers'))
            setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addDoc(collection(db, 'suppliers'), {
                ...form,
                createdAt: serverTimestamp()
            })
            setForm({ name: '', contactPerson: '', email: '', phone: '', address: '', category: '' })
            setShowForm(false)
            fetchSuppliers()
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
            const supplierRef = doc(db, 'suppliers', editingSupplier.id)
            await updateDoc(supplierRef, {
                ...editingSupplier,
                updatedAt: serverTimestamp()
            })
            setEditingSupplier(null)
            fetchSuppliers()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this supplier?')) {
            await deleteDoc(doc(db, 'suppliers', id))
            fetchSuppliers()
        }
    }

    return (
        <Layout title="Suppliers">

            <div className="flex justify-between items-center mb-6 mt-12">
                <p className="text-gray-500">{suppliers.length} vendors registered</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Add Supplier
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">New Supplier</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Company Name *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Contact Person</label>
                            <input
                                type="text"
                                value={form.contactPerson}
                                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Phone *</label>
                            <input
                                type="text"
                                required
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm text-gray-600">Address</label>
                            <textarea
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                            />
                        </div>
                        <div className="col-span-2 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Supplier'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {editingSupplier && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-blue-50">
                            <div>
                                <h3 className="text-xl font-black text-blue-800 uppercase tracking-tight">Edit Supplier</h3>
                            </div>
                            <button onClick={() => setEditingSupplier(null)} className="text-blue-800 hover:bg-blue-100 p-2 rounded-full transition">✕</button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Company Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingSupplier.name}
                                    onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Contact Person</label>
                                <input
                                    type="text"
                                    value={editingSupplier.contactPerson}
                                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Phone *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingSupplier.phone}
                                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <input
                                    type="email"
                                    value={editingSupplier.email}
                                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600">Address</label>
                                <textarea
                                    value={editingSupplier.address}
                                    onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                />
                            </div>
                            <div className="col-span-2 flex gap-3 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingSupplier(null)}
                                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-100">
                        No suppliers registered yet.
                    </div>
                ) : (
                    suppliers.map((s) => (
                        <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group hover:border-blue-500 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    🏭
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingSupplier(s)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1">{s.name}</h4>
                            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                <span className="opacity-60">👤</span> {s.contactPerson || 'No contact'}
                            </p>
                            <div className="space-y-2 border-t pt-4">
                                <p className="text-xs text-gray-600 flex items-center gap-2">
                                    <span className="text-blue-500">📞</span> {s.phone}
                                </p>
                                {s.email && (
                                    <p className="text-xs text-gray-600 flex items-center gap-2">
                                        <span className="text-blue-500">📧</span> {s.email}
                                    </p>
                                )}
                                {s.address && (
                                    <p className="text-xs text-gray-600 flex items-center gap-2 line-clamp-1">
                                        <span className="text-blue-500">📍</span> {s.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

        </Layout>
    )
}

export default Suppliers
