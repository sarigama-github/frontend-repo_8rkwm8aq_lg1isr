import QRLogin from './components/QRLogin'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">QR + Biometric Ready Login</h1>
        <p className="text-gray-600 max-w-md">Scan the QR with a signed-in device to approve the login. This demo creates a one-time session stored in the database and updates live as it’s approved.</p>
        <QRLogin />
        <a href="/test" className="inline-block text-sm text-blue-600 underline">Backend/DB status</a>
      </div>
    </div>
  )
}

export default App
