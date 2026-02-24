import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    where,
    limit,
    increment,
    orderBy
} from 'firebase/firestore'

function PurchaseOrders() {
    const [pos, setPos] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [products, setProducts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form state
    const [selectedSupplier, setSelectedSupplier] = useState('')
    const [orderItems, setOrderItems] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch Data
    const fetchData = async () => {
        try {
            const poSnap = await getDocs(query(collection(db, 'purchase_orders'), orderBy('createdAt', 'desc')))
            setPos(poSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

            const supplierSnap = await getDocs(collection(db, 'suppliers'))
            setSuppliers(supplierSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))

            const productSnap = await getDocs(collection(db, 'products'))
            setProducts(productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const addToOrder = (product) => {
        const existing = orderItems.find(item => item.productId === product.id)
        if (existing) {
            setOrderItems(orderItems.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setOrderItems([...orderItems, {
                productId: product.id,
                name: product.name,
                costPrice: product.costPrice || 0,
                quantity: 1
            }])
        }
    }

    const updateItem = (id, field, value) => {
        setOrderItems(orderItems.map(item =>
            item.productId === id ? { ...item, [field]: value } : item
        ))
    }

    const removeItem = (id) => {
        setOrderItems(orderItems.filter(item => item.productId !== id))
    }

    const totalCost = orderItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedSupplier) return alert('Select a supplier')
        if (orderItems.length === 0) return alert('Add items to order')

        setLoading(true)
        try {
            const supplier = suppliers.find(s => s.id === selectedSupplier)
            await addDoc(collection(db, 'purchase_orders'), {
                supplierId: selectedSupplier,
                supplierName: supplier.name,
                items: orderItems,
                totalAmount: totalCost,
                status: 'pending', // pending, received, cancelled
                createdAt: serverTimestamp()
            })
            setShowForm(false)
            setOrderItems([])
            setSelectedSupplier('')
            fetchData()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleReceive = async (po) => {
        if (!window.confirm('Mark this order as received? This will automatically add items to your inventory.')) return

        setLoading(true)
        try {
            // 1. Update PO status
            await updateDoc(doc(db, 'purchase_orders', po.id), {
                status: 'received',
                receivedAt: serverTimestamp()
            })

            // 2. Update Inventory for each item
            for (const item of po.items) {
                const invQuery = query(
                    collection(db, 'inventory'),
                    where('productId', '==', item.productId),
                    limit(1)
                )
                const invSnap = await getDocs(invQuery)

                if (!invSnap.empty) {
                    await updateDoc(doc(db, 'inventory', invSnap.docs[0].id), {
                        currentStock: increment(item.quantity),
                        lastUpdated: serverTimestamp()
                    })
                } else {
                    // Fallback: create inventory if missing
                    await addDoc(collection(db, 'inventory'), {
                        productId: item.productId,
                        currentStock: item.quantity,
                        minStock: 10,
                        maxStock: 100,
                        lastUpdated: serverTimestamp()
                    })
                }
            }

            alert('Order received and inventory updated!')
            fetchData()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Layout title="Purchase Orders">

            <div className="flex justify-between items-center mb-6 mt-12">
                <p className="text-gray-500">{pos.length} total orders</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    {showForm ? 'Cancel' : '+ Create Purchase Order'}
                </button>
            </div>

            {showForm && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">

                    {/* Item Picker */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                        <div className="p-4 border-b bg-gray-50">
                            <input
                                type="text"
                                placeholder="🔍 Search products to add..."
                                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addToOrder(p)}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        📦
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                                        <p className="text-xs text-blue-600 font-bold">Cost: {p.costPrice || 0}</p>
                                    </div>
                                    <span className="text-blue-600 font-black">+</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
                        <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm mb-4">New Order Summary</h3>

                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Supplier</label>
                            <select
                                className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedSupplier}
                                onChange={(e) => setSelectedSupplier(e.target.value)}
                            >
                                <option value="">Select Vendor</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                            {orderItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                                    <div className="text-4xl mb-2">🛒</div>
                                    <p className="text-xs font-bold">Your order list is empty. Click items on the left to add them.</p>
                                </div>
                            ) : (
                                orderItems.map(item => (
                                    <div key={item.productId} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-bold text-gray-800 truncate flex-1">{item.name}</p>
                                            <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                                                <input
                                                    type="number"
                                                    className="w-full border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(item.productId, 'quantity', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Cost</label>
                                                <input
                                                    type="number"
                                                    className="w-full border rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={item.costPrice}
                                                    onChange={(e) => updateItem(item.productId, 'costPrice', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-400 uppercase text-xs">Total Order Value</span>
                                <span className="text-xl font-black text-blue-600">{totalCost.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || orderItems.length === 0}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Order ID</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Supplier</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Total</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pos.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No purchase orders found.</td>
                            </tr>
                        ) : (
                            pos.map(po => (
                                <tr key={po.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-black text-gray-800">#{po.id.slice(-6).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{po.supplierName}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                        {po.createdAt?.toDate().toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-blue-600">
                                        {po.totalAmount?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${po.status === 'received' ? 'bg-green-100 text-green-700' :
                                                po.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {po.status === 'pending' && (
                                            <button
                                                onClick={() => handleReceive(po)}
                                                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition shadow-sm"
                                            >
                                                📥 Receive
                                            </button>
                                        )}
                                        {po.status === 'received' && (
                                            <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">Received ✅</span>
                                        )}
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

export default PurchaseOrders
