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
import { auth } from '../../firebase/config'

function Products() {
    const [products, setProducts] = useState([])
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

    const businessId = auth.currentUser?.uid

    // Fetch Products
    const fetchProducts = async () => {
        const snapshot = await getDocs(collection(db, 'products'))
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setProducts(list)
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    // Add Product
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addDoc(collection(db, 'products'), {
                ...form,
                price: parseFloat(form.price),
                costPrice: parseFloat(form.costPrice),
                businessId,
                active: true,
                createdAt: serverTimestamp()
            })
            setForm({ name: '', price: '', costPrice: '', category: '', unit: 'pcs', barcode: '' })
            setShowForm(false)
            fetchProducts()
        } catch (err) {
            console.error(err)
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
            await updateDoc(productRef, {
                ...editingProduct,
                price: parseFloat(editingProduct.price),
                costPrice: parseFloat(editingProduct.costPrice),
                updatedAt: serverTimestamp()
            })
            setEditingProduct(null)
            fetchProducts()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Delete Product
    const handleDelete = async (id) => {
        if (window.confirm('Delete this product?')) {
            await deleteDoc(doc(db, 'products', id))
            fetchProducts()
        }
    }

    return (
        <Layout title="Products">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
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
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Beverages"
                            />
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
                                <input
                                    type="text"
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cost</th>
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
                                    <td className="px-6 py-4 text-gray-500">{product.category || '-'}</td>
                                    <td className="px-6 py-4 text-green-600 font-medium">PKR {product.price}</td>
                                    <td className="px-6 py-4 text-gray-500">PKR {product.costPrice || '-'}</td>
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

        </Layout>
    )
}

export default Products