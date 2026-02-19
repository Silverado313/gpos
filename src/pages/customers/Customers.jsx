import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore'

function Customers() {
    const [customers, setCustomers] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    const fetchCustomers = async () => {
        const snapshot = await getDocs(collection(db, 'customers'))
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setCustomers(list)
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

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
            fetchCustomers()
        } catch (err) {
            console.error(err)
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
            <div className="flex justify-between items-center mb-6">
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
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
                                {loading ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </Layout>
    )
}

export default Customers