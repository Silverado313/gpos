import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { handleError, showSuccess } from '../../utils/errorHandler'
import {
    collection,
    addDoc,
    getDocs,
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

    // Fetch Products + Categories
    const fetchProducts = async () => {
        try {
            const [productSnapshot, inventorySnapshot, categorySnapshot] = await Promise.all([
                getDocs(collection(db, 'products')),
                getDocs(collection(db, 'inventory')),
                getDocs(collection(db, 'categories')),
            ])

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
                <div className="min-h-screen bg-white flex flex-col items-center justify-center z-[9999]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading products...</p>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6 mt-12">
                <p className="text-gray-500">{products.length} products found</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Add Product
                </button>
            </div>

            {/* Add Product Form */}
            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">New Product</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Product Name *</label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Coca Cola"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Sale Price *</label>
                            <input
                                type="number"
                                required
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Cost Price</label>
                            <input
                                type="number"
                                value={form.costPrice}
                                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Barcode</label>
                            <input
                                type="text"
                                value={form.barcode}
                                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="optional"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Unit</label>
                            <select
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pcs">Pieces</option>
                                <option value="kg">Kilogram</option>
                                <option value="ltr">Liter</option>
                                <option value="box">Box</option>
                            </select>
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
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Product</h3>
                        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Category</label>
                                <select
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Sale Price *</label>
                                <input
                                    type="number"
                                    required
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Cost Price</label>
                                <input
                                    type="number"
                                    value={editingProduct.costPrice}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Barcode</label>
                                <input
                                    type="text"
                                    value={editingProduct.barcode}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Unit</label>
                                <select
                                    value={editingProduct.unit}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pcs">Pieces</option>
                                    <option value="kg">Kilogram</option>
                                    <option value="ltr">Liter</option>
                                    <option value="box">Box</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex gap-3 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <div className="min-w-[800px]">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Unit</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">
                                        No products yet. Click "Add Product" to start!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{getCategoryName(product.category)}</td>
                                        <td className="px-6 py-4 text-green-600 font-bold">PKR {product.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {product.stock} {product.unit}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{product.unit}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setEditingProduct(product)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = '/inventory'}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                >
                                                    Stock
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
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