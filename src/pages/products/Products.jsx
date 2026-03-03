import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { handleError, showSuccess } from '../../utils/errorHandler'
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    where
} from 'firebase/firestore'
import { auth } from '../../firebase/config'

function Products() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState(null)
    const currency = settings?.currency || 'PKR'
    const [form, setForm] = useState({
        name: '',
        price: '',
        costPrice: '',
        category: '',
        unit: 'pcs',
        barcode: '',
    })
    const [editingProduct, setEditingProduct] = useState(null)
    const [initialLoading, setInitialLoading] = useState(true)

    const businessId = auth.currentUser?.uid

    // Resolve category ID to name
    const getCategoryName = (catId) => {
        if (!catId) return '-'
        const cat = categories.find(c => c.id === catId)
        return cat ? cat.name : catId
    }

    // Fetch Products + Categories + Settings
    const fetchProducts = async () => {
        try {
            const [productSnapshot, inventorySnapshot, categorySnapshot, settingsSnap] = await Promise.all([
                getDocs(collection(db, 'products')),
                getDocs(collection(db, 'inventory')),
                getDocs(collection(db, 'categories')),
                getDoc(doc(db, 'settings', 'global'))
            ])

            if (settingsSnap.exists()) setSettings(settingsSnap.data())

            const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const inventoryList = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            const categoryList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

            setCategories(categoryList)

            const mergedList = productList.map(p => ({
                ...p,
                stock: inventoryList.find(i => i.productId === p.id)?.currentStock || 0
            }))
            setProducts(mergedList)
        } catch (err) {
            handleError(err, 'Fetch Products', 'Failed to load products')
        }
    }

    useEffect(() => {
        const init = async () => {
            await fetchProducts()
            setInitialLoading(false)
        }
        init()
    }, [])

    // Add Product
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const productData = {
                ...form,
                price: parseFloat(form.price),
                costPrice: parseFloat(form.costPrice),
                businessId,
                active: true,
                createdAt: serverTimestamp()
            }

            // Non-blocking add
            const productDocPromise = addDoc(collection(db, 'products'), productData)

            // UI Feedback: Optimistically add to local state
            const tempId = Date.now().toString()
            setProducts([{ id: tempId, ...productData, stock: 0 }, ...products])

            // Auto-create inventory record (Non-blocking)
            productDocPromise.then(docRef => {
                addDoc(collection(db, 'inventory'), {
                    productId: docRef.id,
                    currentStock: 0,
                    minStock: 10,
                    maxStock: 100,
                    lastUpdated: serverTimestamp()
                })
            })

            setForm({ name: '', price: '', costPrice: '', category: '', unit: 'pcs', barcode: '' })
            setShowForm(false)
            showSuccess('Product added successfully')
            fetchProducts() // Sync with Firestore local cache
        } catch (err) {
            handleError(err, 'Add Product', 'Failed to add product')
        } finally {
            setLoading(false)
        }
    }

    // Update Product
    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const productRef = doc(db, 'products', editingProduct.id)
            const updatedData = {
                ...editingProduct,
                price: parseFloat(editingProduct.price),
                costPrice: parseFloat(editingProduct.costPrice),
                updatedAt: serverTimestamp()
            }

            // Non-blocking update
            updateDoc(productRef, updatedData)

            // UI Feedback: Optimistically update local state
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...updatedData } : p))

            setEditingProduct(null)
            showSuccess('Product updated successfully')
            fetchProducts() // Sync with Firestore local cache
        } catch (err) {
            handleError(err, 'Update Product', 'Failed to update product')
        } finally {
            setLoading(false)
        }
    }

    // Delete Product
    const handleDelete = async (id) => {
        if (window.confirm('Delete this product? This will also remove its inventory data.')) {
            // Delete product
            await deleteDoc(doc(db, 'products', id))

            // Sync deletion with inventory
            const invSnap = await getDocs(query(collection(db, 'inventory'), where('productId', '==', id)))
            invSnap.forEach(async (invDoc) => {
                await deleteDoc(doc(db, 'inventory', invDoc.id))
            })

            fetchProducts()
        }
    }

    return (
        <Layout title="Products">

            {initialLoading && (
                <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-[9999]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Products Engine...</p>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6 mt-12">
                <p className="text-gray-500 dark:text-gray-400 font-medium">{products.length} products total</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                    + Add Product
                </button>
            </div>

            {/* Add Product Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 transition-all animate-in slide-in-from-top duration-300">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 uppercase tracking-tight">New Product Entry</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Product Name *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="e.g. Premium Item"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Sale Price *</label>
                            <input
                                type="number"
                                required
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Cost Price</label>
                            <input
                                type="number"
                                value={form.costPrice}
                                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Barcode</label>
                            <input
                                type="text"
                                value={form.barcode}
                                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Scan or type barcode"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Unit</label>
                            <select
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="kg">Kilogram (kg)</option>
                                <option value="ltr">Liter (ltr)</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                        <div className="col-span-1 md:col-span-2 flex gap-3 justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 border dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                            >
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl w-full max-w-2xl border dark:border-gray-800 border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Modify Product</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Category</label>
                                <select
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Sale Price *</label>
                                <input
                                    type="number"
                                    required
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-blue-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Cost Price</label>
                                <input
                                    type="number"
                                    value={editingProduct.costPrice}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: e.target.value })}
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Barcode</label>
                                <input
                                    type="text"
                                    value={editingProduct.barcode}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Unit</label>
                                <select
                                    value={editingProduct.unit}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                                    className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="pcs">Pieces (pcs)</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="ltr">Liter (ltr)</option>
                                    <option value="box">Box</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2 flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="px-6 py-2 border dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    {loading ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                            <tr>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Product Details</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Sale Price</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Availability</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-400 dark:text-gray-500 italic">
                                        No products yet. Click "Add Product" to start!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{product.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">SKU: {product.barcode || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg border dark:border-gray-700">
                                                {getCategoryName(product.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-blue-600 dark:text-blue-400">{currency} {product.price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block w-fit ${product.stock <= 5 ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-green-50 dark:bg-green-900/20 text-green-500'}`}>
                                                    {product.stock} {product.unit} Available
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setEditingProduct(product)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-black uppercase tracking-widest"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = '/inventory'}
                                                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-xs font-black uppercase tracking-widest"
                                                >
                                                    Supply
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-black uppercase tracking-widest"
                                                >
                                                    Delete
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

        </Layout>
    )
}

export default Products