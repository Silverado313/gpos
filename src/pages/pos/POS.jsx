import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db, auth } from '../../firebase/config'
import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    increment,
    serverTimestamp,
    where,
    limit,
    query
} from 'firebase/firestore'

function POS() {
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [search, setSearch] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [amountPaid, setAmountPaid] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [settings, setSettings] = useState(null)
    const [taxEnabled, setTaxEnabled] = useState(true)
    const [redeemPoints, setRedeemPoints] = useState(false)
    const [suspendedSales, setSuspendedSales] = useState([])
    const [showHeldSales, setShowHeldSales] = useState(false)
    const [lastSaleId, setLastSaleId] = useState(null)

    const currency = settings?.currency || 'PKR'

    // Fetch Initial Data
    useEffect(() => {
        const fetchProducts = async () => {
            const snapshot = await getDocs(collection(db, 'products'))
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setProducts(list)
        }
        const fetchCustomers = async () => {
            const snapshot = await getDocs(collection(db, 'customers'))
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setCustomers(list)
        }
        const fetchSettings = async () => {
            const docSnap = await getDoc(doc(db, 'settings', 'global'))
            if (docSnap.exists()) setSettings(docSnap.data())
        }
        const fetchSuspendedSales = async () => {
            const snapshot = await getDocs(collection(db, 'suspended_sales'))
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setSuspendedSales(list)
        }
        fetchProducts()
        fetchCustomers()
        fetchSettings()
        fetchSuspendedSales()
    }, [])

    // Add to Cart
    const addToCart = (product) => {
        setSuccess(false)
        setLastSaleId(null)
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
    const activeTaxRate = (settings?.taxEnabled && taxEnabled) ? settings.taxRate : 0
    const tax = (subtotal * activeTaxRate) / 100

    // Loyalty Redemption Calculation
    const redemptionValue = (redeemPoints && selectedCustomer)
        ? selectedCustomer.loyaltyPoints * (settings?.pointsRedemptionRate || 0)
        : 0

    const total = Math.max(0, subtotal + tax - redemptionValue)
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
            const newSale = await addDoc(collection(db, 'sales'), {
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity
                })),
                subtotal,
                tax,
                taxLabel: settings?.taxLabel || 'Tax',
                discount: redemptionValue,
                total,
                currency,
                paymentMethod,
                amountPaid: parseFloat(amountPaid) || total,
                change: change > 0 ? change : 0,
                cashierId: auth.currentUser?.uid,
                cashierName: auth.currentUser?.displayName || 'Unknown Staff',
                customerId: selectedCustomer?.id || 'walk-in',
                customerName: selectedCustomer?.name || 'Walk-in Customer',
                status: 'completed',
                createdAt: serverTimestamp()
            })

            // Update Customer Loyalty & Points Redemption
            if (selectedCustomer && selectedCustomer.id !== 'walk-in') {
                const customerRef = doc(db, 'customers', selectedCustomer.id)
                const pointsPer100 = settings?.loyaltyPointsPerAmount || 1
                const earnedPoints = Math.floor((total / 100) * pointsPer100)

                await updateDoc(customerRef, {
                    totalSpent: increment(total),
                    loyaltyPoints: increment(earnedPoints - (redeemPoints ? selectedCustomer.loyaltyPoints : 0)),
                    totalVisits: increment(1),
                    lastVisit: serverTimestamp()
                })
            }

            // 3. Decrement Inventory Stock
            for (const item of cart) {
                const invQuery = query(
                    collection(db, 'inventory'),
                    where('productId', '==', item.id),
                    limit(1)
                )
                const invSnap = await getDocs(invQuery)

                if (!invSnap.empty) {
                    const invDoc = invSnap.docs[0]
                    await updateDoc(doc(db, 'inventory', invDoc.id), {
                        currentStock: increment(-item.quantity),
                        lastUpdated: serverTimestamp()
                    })
                }
            }

            setCart([])
            setAmountPaid('')
            setSelectedCustomer(null)
            setRedeemPoints(false)
            setSuccess(newSale.id)
            setLastSaleId(newSale.id)
            setTimeout(() => setSuccess(false), 15000)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Hold Sale
    const handleHoldSale = async () => {
        if (cart.length === 0) return alert('Cart is empty!')
        setLoading(true)
        try {
            await addDoc(collection(db, 'suspended_sales'), {
                items: cart,
                subtotal,
                tax,
                taxLabel: settings?.taxLabel || 'Tax',
                discount: redemptionValue,
                total,
                currency,
                customerId: selectedCustomer?.id || 'walk-in',
                customerName: selectedCustomer?.name || 'Walk-in Customer',
                cashierId: auth.currentUser?.uid,
                cashierName: auth.currentUser?.displayName || 'Unknown Staff',
                createdAt: serverTimestamp()
            })

            setCart([])
            setSelectedCustomer(null)
            setRedeemPoints(false)

            // Refresh suspended sales list
            const snapshot = await getDocs(collection(db, 'suspended_sales'))
            setSuspendedSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

            alert('Sale suspended successfully!')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Restore Held Sale
    const restoreHeldSale = async (heldSale) => {
        if (cart.length > 0) {
            const confirm = window.confirm('Current cart will be cleared. Continue?')
            if (!confirm) return
        }

        setCart(heldSale.items)
        const customer = customers.find(c => c.id === heldSale.customerId)
        setSelectedCustomer(customer || null)

        try {
            await deleteDoc(doc(db, 'suspended_sales', heldSale.id))
            setSuspendedSales(suspendedSales.filter(s => s.id !== heldSale.id))
            setShowHeldSales(false)
        } catch (err) {
            console.error(err)
        }
    }

    // Clear cart and Reset last sale print
    const clearCart = () => {
        setCart([])
        setLastSaleId(null)
        setSuccess(false)
    }

    return (
        <Layout title="POS">
            <div className="flex gap-6 h-full">

                {/* Left — Products */}
                <div className="flex-1">

                    {/* Search */}
                    <div className="flex gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="🔍 Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <button
                            onClick={() => setShowHeldSales(true)}
                            className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-200 transition relative"
                        >
                            <span>⏸️</span> Held
                            {suspendedSales.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                                    {suspendedSales.length}
                                </span>
                            )}
                        </button>
                    </div>

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
                                <p className="text-blue-600 font-bold mt-1">{currency} {product.price}</p>
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
                    <div className="p-4 border-b space-y-3">
                        <h3 className="font-bold text-gray-800 text-lg">
                            🛒 Cart ({cart.length} items)
                        </h3>

                        {/* Customer Selection */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Customer</label>
                            <select
                                className="w-full text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedCustomer?.id || ''}
                                onChange={(e) => {
                                    const customer = customers.find(c => c.id === e.target.value)
                                    setSelectedCustomer(customer || null)
                                }}
                            >
                                <option value="">Walk-in Customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                ))}
                            </select>
                        </div>
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
                                        <p className="text-blue-600 text-sm">{currency} {item.price}</p>
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
                                <span>{currency} {subtotal.toFixed(2)}</span>
                            </div>

                            {/* Dynamic Tax Toggle/Label */}
                            {settings?.taxEnabled && (
                                <div className="flex justify-between text-sm text-gray-500 items-center">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setTaxEnabled(!taxEnabled)}
                                            className={`w-8 h-4 rounded-full transition ${taxEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${taxEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
                                        </button>
                                        <span>{settings.taxLabel || 'Tax'} ({settings.taxRate}%)</span>
                                    </div>
                                    <span>{currency} {tax.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Loyalty Redemption UI */}
                            {settings?.loyaltyEnabled && selectedCustomer && selectedCustomer.loyaltyPoints > 0 && (
                                <div className="flex justify-between text-sm items-center py-1 bg-blue-50 px-2 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={redeemPoints}
                                            onChange={(e) => setRedeemPoints(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600"
                                        />
                                        <span className="text-blue-700 text-xs font-bold">Redeem {selectedCustomer.loyaltyPoints} pts</span>
                                    </div>
                                    <span className="text-blue-700 font-bold">-{currency} {redemptionValue.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-black text-xl text-gray-900 border-t-2 border-gray-900 pt-3 mt-1">
                                <span>Total</span>
                                <span>{currency} {total.toFixed(2)}</span>
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
                                        Change: {currency} {change.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Success Message or Last Sale Reprint */}
                        {(success || (lastSaleId && cart.length === 0)) && (
                            <div className={`bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex flex-col items-center gap-3 ${success ? 'animate-bounce' : ''}`}>
                                <div className="text-center">
                                    <p className="text-blue-800 font-black text-sm uppercase tracking-widest">
                                        {success ? 'Sale Completed! 🎉' : 'Last Sale Information'}
                                    </p>
                                    <p className="text-blue-600 text-[10px] font-bold mt-0.5">Receipt ID: #{(success || lastSaleId).slice(-6).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => window.open(`/invoice/${success || lastSaleId}`, '_blank')}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-md flex items-center gap-2 w-full justify-center"
                                >
                                    <span>📜</span> Print Receipt
                                </button>
                            </div>
                        )}

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={loading || cart.length === 0}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-700 transition shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Pay ${currency} ${total.toFixed(2)}`}
                        </button>

                        {/* Clear & Hold */}
                        {cart.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleHoldSale}
                                    disabled={loading}
                                    className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
                                >
                                    ⏸️ Hold Sale
                                </button>
                                <button
                                    onClick={clearCart}
                                    className="w-full text-red-400 hover:text-red-600 border border-red-100 rounded-lg py-2 text-sm"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Held Sales Modal */}
            {showHeldSales && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-orange-50">
                            <div>
                                <h3 className="text-xl font-black text-orange-800 uppercase tracking-tight">Suspended Sales</h3>
                                <p className="text-orange-600 text-xs font-bold">Pick up where you left off</p>
                            </div>
                            <button onClick={() => setShowHeldSales(false)} className="text-orange-800 hover:bg-orange-100 p-2 rounded-full transition">✕</button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {suspendedSales.length === 0 ? (
                                <div className="text-center py-12 opacity-50 italic">No held sales found</div>
                            ) : (
                                <div className="space-y-4">
                                    {suspendedSales.map((sale) => (
                                        <div key={sale.id} className="border rounded-2xl p-5 hover:border-orange-500 transition-all flex justify-between items-center group bg-gray-50/50">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-gray-800">#{sale.id.slice(-6).toUpperCase()}</span>
                                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase">{sale.items?.length} Items</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-600 italic leading-none">{sale.customerName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{sale.createdAt?.toDate().toLocaleString()}</p>
                                            </div>
                                            <div className="text-right flex items-center gap-6">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total</p>
                                                    <p className="text-xl font-black text-gray-900">{sale.currency} {sale.total?.toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={() => restoreHeldSale(sale)}
                                                    className="bg-orange-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition shadow-lg group-hover:scale-105"
                                                >
                                                    Retrieve
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}

export default POS