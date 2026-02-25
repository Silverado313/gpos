import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { handleError, showSuccess } from '../../utils/errorHandler'
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore'
import useAuthStore from '../../store/authStore'

function Customers() {
    const { user } = useAuthStore()
    const [customers, setCustomers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })
    const [editingCustomer, setEditingCustomer] = useState(null)
    const [initialLoading, setInitialLoading] = useState(true)

    const fetchCustomers = async () => {
        const snapshot = await getDocs(collection(db, 'customers'))
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setCustomers(list)
    }

    useEffect(() => {
        const init = async () => {
            await fetchCustomers()
            setInitialLoading(false)
        }
        init()
    }, [])

    if (initialLoading) {
        return (
            <Layout title="Customers">
                <div className="min-h-screen bg-white flex flex-col items-center justify-center z-[9999]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading customers...</p>
                </div>
            </Layout>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addDoc(collection(db, 'customers'), {
                ...form,
                loyaltyPoints: 0,
                totalSpent: 0,
                totalVisits: 0,
                createdAt: serverTimestamp()
            })
            setForm({ name: '', phone: '', email: '', address: '' })
            setShowForm(false)
            showSuccess('Customer added successfully')
            fetchCustomers()
        } catch (err) {
            handleError(err, 'Add Customer', 'Failed to add customer')
        } finally {
            setLoading(false)
        }
    }

    // Update Customer
    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const customerRef = doc(db, 'customers', editingCustomer.id)
            await updateDoc(customerRef, {
                ...editingCustomer,
                updatedAt: serverTimestamp()
            })
            setEditingCustomer(null)
            showSuccess('Customer updated successfully')
            fetchCustomers()
        } catch (err) {
            handleError(err, 'Update Customer', 'Failed to update customer')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this customer?')) {
            await deleteDoc(doc(db, 'customers', id))
            fetchCustomers()
        }
    }

    return (
        <Layout title="Customers">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 mt-12">
                <p className="text-gray-500">{customers.length} customers found</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Add Customer
                </button>
            </div>

            {/* Add Customer Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">New Customer</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Ahmed Khan"
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
                                placeholder="+92300..."
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="optional"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Address</label>
                            <input
                                type="text"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="optional"
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3 justify-end">
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
                                {loading ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Customer Modal */}
            {editingCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Customer</h3>
                        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingCustomer.name}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Phone *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingCustomer.phone}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <input
                                    type="email"
                                    value={editingCustomer.email}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Address</label>
                                <input
                                    type="text"
                                    value={editingCustomer.address}
                                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="col-span-2 flex gap-3 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingCustomer(null)}
                                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <div className="min-w-[700px]">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Phone</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Loyalty Points</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total Spent</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">
                                        No customers yet. Click "Add Customer" to start!
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-800">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{customer.phone}</td>
                                        <td className="px-6 py-4 text-gray-500">{customer.email || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                                                ⭐ {customer.loyaltyPoints}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-green-600 font-medium">PKR {customer.totalSpent}</td>
                                        <td className="px-6 py-4">
                                            {(user?.role === 'admin' || user?.role === 'manager') && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setEditingCustomer(customer)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(customer.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                            {user?.role === 'cashier' && (
                                                <span className="text-gray-400 text-xs italic italic font-medium">Read Only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </Layout>
    )
}

export default Customers