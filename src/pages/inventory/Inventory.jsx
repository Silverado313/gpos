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

    const [searchTerm, setSearchTerm] = useState('')

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
        return product ? product.name : 'Unknown Product'
    }

    const getStockStatus = (current, min) => {
        if (current <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-600' }
        if (current <= min) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-600' }
        return { label: 'In Stock', color: 'bg-green-100 text-green-600' }
    }

    const filteredInventory = inventory.filter(item =>
        getProductName(item.productId).toLowerCase().includes(searchTerm.toLowerCase())
    )

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
            <div className="grid grid-cols-3 gap-6 mb-6 mt-12">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Items</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{inventory.length}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-yellow-400">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-yellow-600">Low Stock</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{lowStockCount}</h3>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-red-600">Out of Stock</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{outOfStockCount}</h3>
                </div>
            </div>

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex-1 w-full max-w-md">
                    <input
                        type="text"
                        placeholder="🔍 Search products in inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                    + Add Stock Record
                </button>
            </div>

            {/* Add Stock Form */}
            {showForm && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <h3 className="text-lg font-black text-gray-800 mb-6">📦 New Stock Record</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Select Product *</label>
                            <select
                                required
                                value={form.productId}
                                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                <option value="">Select Product</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Current Stock *</label>
                            <input
                                type="number"
                                required
                                value={form.currentStock}
                                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Threshold (Min Stock) *</label>
                            <input
                                type="number"
                                required
                                value={form.minStock}
                                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="10"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Target (Max Stock) *</label>
                            <input
                                type="number"
                                required
                                value={form.maxStock}
                                onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="500"
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3 justify-end mt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Confirm Stock Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Level</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">In/Out Range</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Update Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-gray-400 italic">
                                        {searchTerm ? 'No matches found for your search' : 'No inventory records found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => {
                                    const status = getStockStatus(item.currentStock, item.minStock)
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <p className="font-black text-gray-800">{getProductName(item.productId)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">ID: {item.productId.slice(-8)}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xl font-black text-gray-900">{item.currentStock}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Units</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-4 text-xs font-bold">
                                                    <div className="text-center">
                                                        <span className="text-[10px] text-gray-400 block uppercase">Min</span>
                                                        <span className="text-gray-600">{item.minStock}</span>
                                                    </div>
                                                    <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden relative">
                                                        <div
                                                            className="absolute inset-0 bg-blue-500 transition-all"
                                                            style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-[10px] text-gray-400 block uppercase">Max</span>
                                                        <span className="text-gray-600">{item.maxStock}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <input
                                                        type="number"
                                                        defaultValue={item.currentStock}
                                                        className="w-24 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none transition-all text-right"
                                                        onBlur={(e) => handleStockUpdate(item.id, e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </Layout>
    )
}

export default Inventory