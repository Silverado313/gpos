function Navbar({ title }) {
    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">

            {/* Page Title */}
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">admin@gpos.com</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    A
                </div>
            </div>

        </div>
    )
}

export default Navbar