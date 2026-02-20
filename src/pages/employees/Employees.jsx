import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import {
    collection,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore'

function Employees() {
    const [employees, setEmployees] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        uid: '',
        name: '',
        email: '',
        role: 'cashier',
    })

    const fetchEmployees = async () => {
        const snapshot = await getDocs(collection(db, 'users'))
        const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
        setEmployees(list)
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await setDoc(doc(db, 'users', form.uid), {
                name: form.name,
                email: form.email,
                role: form.role,
                updatedAt: serverTimestamp()
            }, { merge: true })
            setForm({ uid: '', name: '', email: '', role: 'cashier' })
            setShowForm(false)
            fetchEmployees()
        } catch (err) {
            console.error(err)
            alert('Failed to save employee. Make sure the UID is correct.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Remove this employee?')) {
            await deleteDoc(doc(db, 'users', id))
            fetchEmployees()
        }
    }

    return (
        <Layout title="Employee Management">

            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">{employees.length} employees</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Add/Update Employee
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6 max-w-2xl">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Set Employee Permissions</h3>
                    <p className="text-xs text-gray-400 mb-4">Note: The UID must match the user's Firebase Authentication ID.</p>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm text-gray-600">User UID *</label>
                            <input
                                type="text"
                                required
                                value={form.uid}
                                onChange={(e) => setForm({ ...form, uid: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Paste user UID from Firebase console"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Email *</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm text-gray-600">Role</label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="cashier">Cashier (POS Only)</option>
                                <option value="manager">Manager (Inventory + Products)</option>
                                <option value="admin">Admin (Full Access)</option>
                            </select>
                        </div>
                        <div className="col-span-2 flex gap-3 justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                            >
                                {loading ? 'Saving...' : 'Save Permissions'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Employee</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Role</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees.map((emp) => (
                            <tr key={emp.uid} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                                            {emp.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-800">{emp.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{emp.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${emp.role === 'admin' ? 'bg-red-100 text-red-600' :
                                            emp.role === 'manager' ? 'bg-blue-100 text-blue-600' :
                                                'bg-green-100 text-green-600'
                                        }`}>
                                        {emp.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setForm({ uid: emp.uid, name: emp.name, email: emp.email, role: emp.role })
                                                setShowForm(true)
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp.uid)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </Layout>
    )
}

export default Employees
