import { useState, useEffect } from 'react'
import Layout from '../../components/layout/Layout'
import { db } from '../../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth } from '../../firebase/config'
import { handleError, showSuccess } from '../../utils/errorHandler'

function Settings() {
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState({
        businessName: '',
        businessType: 'retail',
        currency: 'PKR',
        taxEnabled: false,
        taxLabel: 'Tax',
        taxRate: 0,
        loyaltyEnabled: false,
        loyaltyPointsPerAmount: 1,
        pointsRedemptionRate: 0.1, // 1 point = 0.1 currency unit
        receiptFooter: 'Thank you for your business!',
        lowStockAlert: true,
        theme: 'light'
    })

    const settingsId = 'global'

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', settingsId)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setSettings(docSnap.data())
                }
            } catch (err) {
                handleError(err, 'Fetch Settings', 'Failed to load settings')
            }
        }
        fetchSettings()
    }, [settingsId])

    const handleSave = async () => {
        setLoading(true)
        try {
            await setDoc(doc(db, 'settings', settingsId), settings)
            setSaved(true)
            showSuccess('Settings saved successfully')
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            handleError(err, 'Save Settings', 'Failed to save settings')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout title="Settings">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Business Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm mt-12">
                    <h3 className="font-bold text-gray-800 mb-4">🏪 Business Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600">Business Name</label>
                            <input
                                type="text"
                                value={settings.businessName}
                                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="My Shop"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Business Type</label>
                            <select
                                value={settings.businessType}
                                onChange={(e) => setSettings({ ...settings, businessType: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="retail">Retail Shop</option>
                                <option value="restaurant">Restaurant / Cafe</option>
                                <option value="service">Service Based</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Currency</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PKR">PKR — Pakistani Rupee</option>
                                <option value="USD">USD — US Dollar</option>
                                <option value="EUR">EUR — Euro</option>
                                <option value="GBP">GBP — British Pound</option>
                                <option value="AED">AED — UAE Dirham</option>
                                <option value="SAR">SAR — Saudi Riyal</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tax Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">💰 Tax Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Enable Tax</p>
                                <p className="text-xs text-gray-400">Apply tax to all sales</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, taxEnabled: !settings.taxEnabled })}
                                className={`w-12 h-6 rounded-full transition ${settings.taxEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.taxEnabled ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                        {settings.taxEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Tax Label (e.g. GST, VAT)</label>
                                    <input
                                        type="text"
                                        value={settings.taxLabel}
                                        onChange={(e) => setSettings({ ...settings, taxLabel: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tax"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Tax Rate (%)</label>
                                    <input
                                        type="number"
                                        value={settings.taxRate}
                                        onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loyalty Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">⭐ Loyalty Program</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Enable Loyalty Points</p>
                                <p className="text-xs text-gray-400">Reward customers with points</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, loyaltyEnabled: !settings.loyaltyEnabled })}
                                className={`w-12 h-6 rounded-full transition ${settings.loyaltyEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.loyaltyEnabled ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                        {settings.loyaltyEnabled && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Points per 100 {settings.currency} spent</label>
                                    <input
                                        type="number"
                                        value={settings.loyaltyPointsPerAmount}
                                        onChange={(e) => setSettings({ ...settings, loyaltyPointsPerAmount: parseInt(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Value of 1 Point (in {settings.currency})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={settings.pointsRedemptionRate}
                                        onChange={(e) => setSettings({ ...settings, pointsRedemptionRate: parseFloat(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.10"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Receipt Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">🧾 Receipt Settings</h3>
                    <div>
                        <label className="text-sm text-gray-600">Receipt Footer Message</label>
                        <textarea
                            value={settings.receiptFooter}
                            onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="2"
                            placeholder="Thank you for your business!"
                        />
                    </div>
                </div>

                {/* Other Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">🔔 Other Settings</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Low Stock Alerts</p>
                            <p className="text-xs text-gray-400">Get notified when stock is low</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, lowStockAlert: !settings.lowStockAlert })}
                            className={`w-12 h-6 rounded-full transition ${settings.lowStockAlert ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings.lowStockAlert ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                {saved && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-center font-medium">
                        ✅ Settings saved successfully!
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>

            </div>
        </Layout>
    )
}

export default Settings