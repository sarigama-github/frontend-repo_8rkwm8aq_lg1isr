import QRLogin from './components/QRLogin'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Auth Demo</h1>
        <p className="text-gray-600 max-w-md">Choose a path below. You can login with biometrics, register a new device, or use QR approval from another device.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          <a href="/login" className="block bg-white/80 hover:bg-white text-gray-800 rounded-xl shadow p-6">
            <div className="text-lg font-semibold mb-1">Login</div>
            <div className="text-sm text-gray-600">Sign in with fingerprint/biometric.</div>
          </a>
          <a href="/register" className="block bg-white/80 hover:bg-white text-gray-800 rounded-xl shadow p-6">
            <div className="text-lg font-semibold mb-1">Register</div>
            <div className="text-sm text-gray-600">Create an account and register a device.</div>
          </a>
          <div className="bg-white/80 rounded-xl shadow p-3 flex items-center justify-center">
            <QRLogin />
          </div>
        </div>
        <a href="/test" className="inline-block text-sm text-blue-600 underline">Backend/DB status</a>
      </div>
    </div>
  )
}
