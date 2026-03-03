import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { collection, getDocs, getDoc, doc, query, orderBy } from 'firebase/firestore'

function AccountsSummary() {
    const [sales, setSales] = useState([])
    const [expenses, setExpenses] = useState([])
    const [cashFlow, setCashFlow] = useState([])
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('month') // 'today', 'month', 'year'

    const currency = settings?.currency || 'PKR'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [salesSnap, expSnap, cashSnap, settingsSnap] = await Promise.all([
                    getDocs(collection(db, 'sales')),
                    getDocs(collection(db, 'expenses')),
                    getDocs(collection(db, 'cash_flow')),
                    getDoc(doc(db, 'settings', 'global'))
                ])

                setSales(salesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
                setExpenses(expSnap.docs.map(d => ({ id: d.id, ...d.data() })))
                setCashFlow(cashSnap.docs.map(d => ({ id: d.id, ...d.data() })))
                if (settingsSnap.exists()) setSettings(settingsSnap.data())
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filterByPeriod = (data, dateField = 'createdAt') => {
        const now = new Date()
        return data.filter(item => {
            if (!item[dateField]) return false
            // Handle both Firestore Timestamp and ISO strings
            const date = item[dateField].toDate ? item[dateField].toDate() : new Date(item[dateField])

            if (period === 'today') return date.toDateString() === now.toDateString()
            if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            if (period === 'year') return date.getFullYear() === now.getFullYear()
            return true
        })
    }

    const filteredSales = filterByPeriod(sales)
    const filteredExpenses = filterByPeriod(expenses, 'date')
    const filteredCashFlow = filterByPeriod(cashFlow)

    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0)
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const netProfit = totalRevenue - totalExpenses

    // Total cash balance is always cumulative
    const cashBalance = cashFlow.reduce((sum, c) => sum + (c.amount || 0), 0)

    if (loading) {
        return (
            <Layout title="Accounts Summary">
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Accounts Summary">
            <div className="mt-12">
                {/* Period Selector */}
                <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-xl mb-8 w-fit mx-auto">
                    {['today', 'month', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Primary Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <span className="text-8xl">💰</span>
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Total Revenue</p>
                                <h3 className="text-4xl font-black">{currency} {totalRevenue.toLocaleString()}</h3>
                                <div className="mt-6 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                                    <span>↑</span> From sales records
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Expenses</p>
                                    <h3 className="text-4xl font-black text-gray-800">{currency} {totalExpenses.toLocaleString()}</h3>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {/* Simple breakdown tags */}
                                    {[...new Set(filteredExpenses.map(e => e.category))].slice(0, 3).map(cat => (
                                        <span key={cat} className="text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-400 px-2 py-1 rounded-lg border border-gray-100">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Financial health card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Net Profit</p>
                                    <h3 className={`text-5xl font-black tracking-tight ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {currency} {netProfit.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Profit Margin</p>
                                    <p className="text-xl font-black text-gray-800">
                                        {totalRevenue ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar visual */}
                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-green-500 h-full transition-all duration-1000"
                                    style={{ width: `${totalRevenue ? (Math.max(0, netProfit) / totalRevenue) * 100 : 0}%` }}
                                ></div>
                                <div
                                    className="bg-red-500 h-full transition-all duration-1000"
                                    style={{ width: `${totalRevenue ? (totalExpenses / totalRevenue) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase">
                                <span>Profitability Visualizer</span>
                                <span>Exp. Ratio</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Stats / Register */}
                    <div className="space-y-8">
                        <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
                                <span className="text-9xl">🏧</span>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Register Balance</p>
                            <h3 className="text-3xl font-black mb-4">{currency} {cashBalance.toLocaleString()}</h3>
                            <p className="text-xs text-blue-400 font-bold leading-relaxed">
                                This balance tracks manual cash movements. It does not auto-deduct sales yet.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Recent Cash Moves</h4>
                            <div className="space-y-4">
                                {filteredCashFlow.slice(0, 5).map(m => (
                                    <div key={m.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 line-clamp-1">{m.reason}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{m.type}</p>
                                        </div>
                                        <p className={`text-xs font-black ${m.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                            {m.type === 'in' ? '+' : ''} {m.amount.toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {filteredCashFlow.length === 0 && <p className="text-center text-xs text-gray-400 italic py-4">No recent activity</p>}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    )
}

export default AccountsSummary
