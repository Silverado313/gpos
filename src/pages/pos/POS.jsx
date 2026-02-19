import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db, auth } from '../../firebase/config'
import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from 'firebase/firestore'

function POS() {
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [search, setSearch] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [amountPaid, setAmountPaid] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            const snapshot = await getDocs(collection(db, 'products'))
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setProducts(list)
        }
        fetchProducts()
    }, [])

    // Add to Cart
    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id)
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }
    }

    // Remove from Cart
    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id))
    }

    // Update Quantity
    const updateQty = (id, qty) => {
        if (qty < 1) return removeFromCart(id)
        setCart(cart.map(item =>
            item.id === id ? { ...item, quantity: qty } : item
        ))
    }

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = 0
    const total = subtotal + tax
    const change = amountPaid ? parseFloat(amountPaid) - total : 0

    // Filtered Products
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    // Checkout
    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Cart is empty!')
        if (paymentMethod === 'cash' && parseFloat(amountPaid) < total) {
            return alert('Amount paid is less than total!')
        }
        setLoading(true)
        try {
            await addDoc(collection(db, 'sales'), {
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity
                })),
                subtotal,
                tax,
                total,
                paymentMethod,
                amountPaid: parseFloat(amountPaid) || total,
                change: change > 0 ? change : 0,
                cashierId: auth.currentUser?.uid,
                status: 'completed',
                createdAt: serverTimestamp()
            })
            setCart([])
            setAmountPaid('')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout title="POS">
            <div className="flex gap-6 h-full">

                {/* Left — Products */}
                <div className="flex-1">

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="🔍 Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-500 border-2 border-transparent transition text-left"
                            >
                                <div className="w-full h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                                    <span className="text-3xl">📦</span>
                                </div>
                                <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                                <p className="text-blue-600 font-bold mt-1">PKR {product.price}</p>
                                <p className="text-gray-400 text-xs">{product.category || 'General'}</p>
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <div className="col-span-4 text-center py-12 text-gray-400">
                                No products found
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Cart */}
                <div className="w-80 bg-white rounded-xl shadow-sm flex flex-col">

                    {/* Cart Header */}
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-800 text-lg">
                            🛒 Cart ({cart.length} items)
                        </h3>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <p className="text-gray-400 text-center mt-8">
                                Click products to add them here
                            </p>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                        <p className="text-blue-600 text-sm">PKR {item.price}</p>
                                    </div>


                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQty(item.id, item.quantity - 1)}
                                            className="w-6 h-6 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
                                        >-</button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                                            className="w-12 text-center border rounded-lg text-sm py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                        />
                                        <button
                                            onClick={() => updateQty(item.id, item.quantity + 1)}
                                            className="w-6 h-6 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
                                        >+</button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-400 hover:text-red-600 text-xs"
                                    >✕</button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Footer */}
                    <div className="p-4 border-t space-y-3">

                        {/* Totals */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>PKR {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax</span>
                                <span>PKR {tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-gray-800 border-t pt-2">
                                <span>Total</span>
                                <span>PKR {total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="grid grid-cols-3 gap-2">
                            {['cash', 'card', 'credit'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2 rounded-lg text-xs font-medium capitalize transition ${paymentMethod === method
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>

                        {/* Amount Paid */}
                        {paymentMethod === 'cash' && (
                            <div>
                                <input
                                    type="number"
                                    placeholder="Amount paid"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {change > 0 && (
                                    <p className="text-green-600 text-sm mt-1 font-medium">
                                        Change: PKR {change.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 text-green-600 text-sm p-2 rounded-lg text-center font-medium">
                                ✅ Sale completed successfully!
                            </div>
                        )}

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={loading || cart.length === 0}
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Checkout — PKR ${total.toFixed(2)}`}
                        </button>

                        {/* Clear Cart */}
                        {cart.length > 0 && (
                            <button
                                onClick={() => setCart([])}
                                className="w-full text-red-400 hover:text-red-600 text-sm"
                            >
                                Clear Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default POS