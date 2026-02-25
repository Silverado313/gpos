import { useState } from 'react'
import Layout from '../../components/layout/Layout'

function Help() {
    const [activeTab, setActiveTab] = useState('overview')
    const [expandedFaq, setExpandedFaq] = useState(null)

    const tabs = ['overview', 'features', 'getting-started', 'faq', 'troubleshooting']

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id)
    }

    const faqItems = [
        {
            id: 1,
            question: "How do I access the POS system?",
            answer: "You can access GPOS by logging in with your email and password. Once approved by an admin, you'll have access to the dashboard and relevant modules based on your role."
        },
        {
            id: 2,
            question: "What are the different user roles?",
            answer: "GPOS supports Admin (full access), Manager (inventory & sales), and Cashier (POS only). Your role determines which features and pages you can access."
        },
        {
            id: 3,
            question: "How do I create a new product?",
            answer: "Go to Products → Click 'Add Product' → Fill in name, price, cost price, category, barcode, and unit → Click 'Save'. The system automatically creates an inventory record."
        },
        {
            id: 4,
            question: "Can I suspend a sale and resume it later?",
            answer: "Yes! In POS, click 'Hold Sale' to suspend your cart. Later, click 'View Held Sales' to resume any suspended sale and complete the transaction."
        },
        {
            id: 5,
            question: "How do loyalty points work?",
            answer: "Enable loyalty in Settings. Customers earn points based on their total spent. At checkout, you can redeem points to apply a discount based on the configured redemption rate."
        },
        {
            id: 6,
            question: "How do I process a product return?",
            answer: "Go to Sales → Find the sale → Click 'Return' → Confirm. The system creates a return record and restores inventory automatically."
        },
        {
            id: 7,
            question: "What if I need to reprint a receipt?",
            answer: "In POS, after completing a sale, a 'Reprint Receipt' button appears. Click it anytime to reprint the last transaction."
        },
        {
            id: 8,
            question: "How do I view sales analytics?",
            answer: "Go to Reports → Choose a time period → View sales trends, product performance, and purchase order status in charts and tables."
        }
    ]

    const features = [
        {
            title: "🛒 Point of Sale",
            items: ["Real-time inventory sync", "Hold/Resume sales", "Loyalty points", "Tax calculation", "Multiple payment methods"]
        },
        {
            title: "📦 Inventory Management",
            items: ["Stock tracking", "Low stock alerts", "Min/Max thresholds", "Auto-create on import", "Manual adjustments"]
        },
        {
            title: "👥 Customer Management",
            items: ["Customer profiles", "Loyalty balance", "Purchase history", "Contact details", "Total spent tracking"]
        },
        {
            title: "📊 Reports & Analytics",
            items: ["Sales by period", "Product performance", "Revenue trends", "Purchase orders", "Export data"]
        },
        {
            title: "⚙️ Settings & Configuration",
            items: ["Business info", "Tax settings", "Loyalty options", "Currency", "Theme & receipts"]
        },
        {
            title: "👨‍💼 Employee Management",
            items: ["Role assignment", "Multi-user support", "Approval workflow", "Access control"]
        }
    ]

    const gettingStarted = [
        {
            step: "1. Create Your Account",
            description: "Register with your email, name, and password. An admin must approve your account before access.",
            icon: "📝"
        },
        {
            step: "2. Set Up Business Info",
            description: "Go to Settings and configure your business name, currency, tax rate, and loyalty program settings.",
            icon: "🏢"
        },
        {
            step: "3. Add Products",
            description: "Navigate to Products, add each item with pricing, cost price, barcode, and category. Inventory records are created automatically.",
            icon: "📦"
        },
        {
            step: "4. Add Customers (Optional)",
            description: "Go to Customers to create customer profiles for loyalty tracking and purchase history.",
            icon: "👤"
        },
        {
            step: "5. Start Selling",
            description: "Go to POS, select products, adjust quantities, choose payment method, and complete the sale. Receipt prints automatically.",
            icon: "💳"
        },
        {
            step: "6. Monitor Sales & Reports",
            description: "Check Dashboard for daily metrics, go to Reports for detailed analytics, and Sales for transaction history.",
            icon: "📈"
        }
    ]

    const troubleshooting = [
        {
            issue: "Login not working",
            solutions: [
                "Check your internet connection",
                "Verify email and password are correct",
                "Clear browser cache and cookies",
                "Try a different browser",
                "Contact admin if account not approved"
            ]
        },
        {
            issue: "Products not showing in POS",
            solutions: [
                "Ensure products are added in the Products page",
                "Check internet connection and refresh",
                "Verify category is assigned to each product",
                "Try logging out and back in"
            ]
        },
        {
            issue: "Inventory not updating",
            solutions: [
                "Refresh the page to sync latest data",
                "Check Inventory page to verify stock levels",
                "Ensure no concurrent edits from other users",
                "Wait a few seconds for real-time sync from Firebase"
            ]
        },
        {
            issue: "Sale not completing",
            solutions: [
                "Verify internet connection",
                "Check if amount paid is greater than total",
                "Ensure at least one item is in cart",
                "Try a different payment method",
                "Check browser console for error details"
            ]
        },
        {
            issue: "Receipt won't print",
            solutions: [
                "Check printer is connected and online",
                "Verify printer drivers are installed",
                "Use 'Reprint Receipt' from POS page",
                "Check browser print settings",
                "Try browser's print preview first"
            ]
        },
        {
            issue: "Slow performance",
            solutions: [
                "Check internet speed (needs stable connection)",
                "Close unnecessary browser tabs",
                "Clear cache and cookies",
                "Reduce number of products/customers displayed",
                "Use latest version of Chrome, Firefox, or Safari"
            ]
        }
    ]

    return (
        <Layout title="Help & Support">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">GPOS Help Center</h1>
                    <p className="text-blue-100 text-lg">Learn how to use GPOS efficiently and resolve common issues</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-gray-300">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-semibold transition capitalize ${
                                activeTab === tab
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">📱 About GPOS</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                GPOS is a modern, cloud-based Point of Sale system designed for retail businesses. 
                                Built with React and Firebase, it offers real-time inventory sync, role-based access control, 
                                and powerful analytics to help you manage your business efficiently.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <div className="text-3xl mb-2">⚡</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Fast & Reliable</h3>
                                    <p className="text-gray-700 text-sm">Real-time data sync ensures accurate inventory and instant reporting.</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                    <div className="text-3xl mb-2">🔒</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Secure</h3>
                                    <p className="text-gray-700 text-sm">Firebase security with role-based access control protects your data.</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                                    <div className="text-3xl mb-2">📊</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Smart Analytics</h3>
                                    <p className="text-gray-700 text-sm">Comprehensive reports and dashboards to track business performance.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                                <ul className="space-y-2">
                                    {feature.items.map((item, i) => (
                                        <li key={i} className="flex items-center text-gray-700">
                                            <span className="text-blue-600 mr-2">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Getting Started Tab */}
                {activeTab === 'getting-started' && (
                    <div className="space-y-6">
                        {gettingStarted.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex gap-6">
                                <div className="text-5xl flex-shrink-0">{item.icon}</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.step}</h3>
                                    <p className="text-gray-700">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                    <div className="space-y-4">
                        {faqItems.map(item => (
                            <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <button
                                    onClick={() => toggleFaq(item.id)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                                >
                                    <h3 className="font-semibold text-gray-900 text-left">{item.question}</h3>
                                    <span className={`text-2xl transition ${expandedFaq === item.id ? 'rotate-45' : ''}`}>+</span>
                                </button>
                                {expandedFaq === item.id && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Troubleshooting Tab */}
                {activeTab === 'troubleshooting' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {troubleshooting.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-red-600 mb-4">❌ {item.issue}</h3>
                                <div className="space-y-2">
                                    {item.solutions.map((solution, i) => (
                                        <div key={i} className="flex items-start text-gray-700">
                                            <span className="text-green-600 mr-3 font-bold">•</span>
                                            <span>{solution}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Contact/Footer */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white text-center mt-12">
                    <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
                    <p className="text-gray-300 mb-4">Can't find the answer you're looking for? Contact your system administrator.</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                        📧 Contact Support
                    </button>
                </div>
            </div>
        </Layout>
    )
}

export default Help
