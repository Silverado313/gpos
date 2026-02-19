import { auth, db } from './firebase/config'

function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          GPOS is Ready! 🚀
        </h1>
        <p className="text-gray-500">Firebase Connected ✅</p>
        <p className="text-gray-400 text-sm mt-2">Project: gpos-web</p>
      </div>
    </div>
  )
}

export default App