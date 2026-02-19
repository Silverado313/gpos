import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore'

function Inventory() {
    const [inventory, setInventory] = useState([])
    const [products, setProducts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        productId: '',
        currentStock: '',
        minStock: '',
        maxStock: '',
    })

    const fetchData = async () => {
        const productSnap = await getDocs(collection(db, 'products'))
        const productList = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setProducts(productList)

        const inventorySnap = await getDocs(collection(db, 'inventory'))
        const inventoryList = inventorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setInventory(inventoryList)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId)
        return product ? product.name : 'Unknown'
    }

    const getStockStatus = (current, min) => {
        if (current <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-600' }
        if (current <= min) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-600' }
        return { label: 'In Stock', color: 'bg-green-100 text-green-600' }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addDoc(collection(db, 'inventory'), {
                productId: form.productId,
                currentStock: parseInt(form.currentStock),
                minStock: parseInt(form.minStock),
                maxStock: parseInt(form.maxStock),
                lastUpdated: serverTimestamp()
            })
            setForm({ productId: '', currentStock: '', minStock: '', maxStock: '' })
            setShowForm(false)
            fetchData()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStockUpdate = async (id, newStock) => {
        await updateDoc(doc(db, 'inventory', id), {
            currentStock: parseInt(newStock),
            lastUpdated: serverTimestamp()
        })
        fetchData()
    }

    const lowStockCount = inventory.filter(i => i.currentStock <= i.minStock).length
    const outOfStockCount = inventory.filter(i => i.currentStock <= 0).length

    return (
        <Layout title="Inventory">

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Products</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{inventory.length}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Low Stock</p>
                    <h3 className="text-2xl font-bold text-yellow-500 mt-1">{lowStockCount}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Out of Stock</p>
                    <h3 className="text-2xl font-bold text-red-500 mt-1">{outOfStockCount}</h3>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">{inventory.length} items tracked</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Add Stock
                </button>
            </div>

            {/* Add Stock Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Add Stock</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm text-gray-600">Product *</label>
                            <select
                                required
                                value={form.productId}
                                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Product</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Current Stock *</label>
                            <input
                                type="number"
                                required
                                value={form.currentStock}
                                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Min Stock (Alert) *</label>
                            <input
                                type="number"
                                required
                                value={form.minStock}
                                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="10"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Max Stock *</label>
                            <input
                                type="number"
                                required
                                value={form.maxStock}
                                onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="500"
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
                                {loading ? 'Saving...' : 'Save Stock'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Current Stock</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Min Stock</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Max Stock</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Quick Update</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inventory.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-400">
                                    No inventory yet. Click "Add Stock" to start!
                                </td>
                            </tr>
                        ) : (
                            inventory.map((item) => {
                                const status = getStockStatus(item.currentStock, item.minStock)
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {getProductName(item.productId)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-bold">
                                            {item.currentStock}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{item.minStock}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.maxStock}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    defaultValue={item.currentStock}
                                                    className="w-20 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    onBlur={(e) => handleStockUpdate(item.id, e.target.value)}
                                                />
                                                <span className="text-xs text-gray-400">blur to save</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

        </Layout>
    )
}

export default Inventory