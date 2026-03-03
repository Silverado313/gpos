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
    const [categories, setCategories] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        productId: '',
        currentStock: '',
        minStock: '',
        maxStock: '',
    })

    const [initialLoading, setInitialLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState('')

    const fetchData = async () => {
        const [productSnap, inventorySnap, categorySnap] = await Promise.all([
            getDocs(collection(db, 'products')),
            getDocs(collection(db, 'inventory')),
            getDocs(collection(db, 'categories')),
        ])

        const productList = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const inventoryList = inventorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const categoryList = categorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        setProducts(productList)
        setCategories(categoryList)

        // Auto-create missing inventory records for imported products
        const inventoryProductIds = new Set(inventoryList.map(i => i.productId))
        const missing = productList.filter(p => !inventoryProductIds.has(p.id))
        if (missing.length > 0) {
            await Promise.all(missing.map(p =>
                addDoc(collection(db, 'inventory'), {
                    productId: p.id,
                    currentStock: 0,
                    minStock: 10,
                    maxStock: 100,
                    lastUpdated: serverTimestamp()
                })
            ))
            // Refetch after creating missing records
            const freshSnap = await getDocs(collection(db, 'inventory'))
            const freshList = freshSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setInventory(freshList)
        } else {
            setInventory(inventoryList)
        }
    }

    useEffect(() => {
        const init = async () => {
            await fetchData()
            setInitialLoading(false)
        }
        init()
    }, [])

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId)
        return product ? product.name : 'Unknown Product'
    }

    const getProductCategory = (productId) => {
        const product = products.find(p => p.id === productId)
        if (!product?.category) return ''
        const cat = categories.find(c => c.id === product.category)
        return cat ? cat.name : product.category
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

    if (initialLoading) {
        return (
            <Layout title="Inventory">
                <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-[9999]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Stock Database...</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Inventory">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 mt-12">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">Total Inventory Items</p>
                    <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100 mt-1 uppercase tracking-tight">{inventory.length}</h3>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-l-4 border-l-yellow-400 border border-gray-100 dark:border-gray-800">
                    <p className="text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-1">Low Stock Warning</p>
                    <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{lowStockCount}</h3>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border-l-4 border-l-red-500 border border-gray-100 dark:border-gray-800">
                    <p className="text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">Critical Depletion</p>
                    <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{outOfStockCount}</h3>
                </div>
            </div>

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex-1 w-full max-w-md">
                    <input
                        type="text"
                        placeholder="🔍 Search products in inventory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                    + Add Stock Record
                </button>
            </div>

            {/* Add Stock Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 transition-all animate-in slide-in-from-top duration-300">
                    <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-6 uppercase tracking-tight">📦 New Stock Record</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Select Product *</label>
                            <select
                                required
                                value={form.productId}
                                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                <option value="">Select Product</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Current Stock *</label>
                            <input
                                type="number"
                                required
                                value={form.currentStock}
                                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Threshold (Min Stock) *</label>
                            <input
                                type="number"
                                required
                                value={form.minStock}
                                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="10"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Target (Max Stock) *</label>
                            <input
                                type="number"
                                required
                                value={form.maxStock}
                                onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="500"
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-3 justify-end mt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 rounded-xl border dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gray-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Confirm Stock Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Product Ledger</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Level</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Safety Bounds</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Alerts</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Adjustment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-gray-400 dark:text-gray-500 italic">
                                        {searchTerm ? 'No matches found for your search' : 'No inventory records found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => {
                                    const status = getStockStatus(item.currentStock, item.minStock)
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{getProductName(item.productId)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{getProductCategory(item.productId) || `ID: ${item.productId.slice(-8)}`}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xl font-black text-gray-900 dark:text-gray-100">{item.currentStock}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase ml-1">UNITS</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-4 text-xs font-bold">
                                                    <div className="text-center">
                                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 block uppercase tracking-tighter">Min</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{item.minStock}</span>
                                                    </div>
                                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative border dark:border-gray-700">
                                                        <div
                                                            className={`absolute inset-0 transition-all ${item.currentStock <= item.minStock ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${Math.min((item.currentStock / (item.maxStock || 1)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 block uppercase tracking-tighter">Max</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{item.maxStock}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${status.color.includes('red') ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : status.color.includes('yellow') ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' : 'bg-green-50 dark:bg-green-900/20 text-green-600'}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <input
                                                        type="number"
                                                        defaultValue={item.currentStock}
                                                        className="w-24 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl px-3 py-2 text-sm font-black text-gray-800 dark:text-gray-100 focus:outline-none transition-all text-right shadow-inner"
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