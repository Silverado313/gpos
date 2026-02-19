import Layout from '../../components/layout/Layout'

function Dashboard() {
    return (
        <Layout title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

                {/* Stat Cards */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Today's Sales</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">PKR 0</h3>
                    <p className="text-green-500 text-xs mt-1">↑ 0% from yesterday</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Transactions</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">0</h3>
                    <p className="text-green-500 text-xs mt-1">↑ 0% from yesterday</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Products</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">0</h3>
                    <p className="text-gray-400 text-xs mt-1">Total products</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-gray-500 text-sm">Customers</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">0</h3>
                    <p className="text-gray-400 text-xs mt-1">Total customers</p>
                </div>

            </div>

            {/* Welcome Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <h2 className="text-2xl font-bold text-blue-600">Welcome to GPOS! 🚀</h2>
                <p className="text-gray-400 mt-2">Your Point of Sale system is ready. Start by adding products.</p>
            </div>

        </Layout>
    )
}

export default Dashboard