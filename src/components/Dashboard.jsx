export default function Dashboard() {
  const session = localStorage.getItem('session')
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        {session ? (
          <>
            <p className="text-gray-700">Welcome! Your session token is stored locally.</p>
            <div className="mt-4 p-3 bg-gray-50 rounded border text-xs break-all">{session}</div>
            <div className="mt-6 flex gap-3">
              <a href="/" className="px-3 py-2 rounded bg-gray-100">Home</a>
              <button onClick={() => { localStorage.removeItem('session'); window.location.reload() }} className="px-3 py-2 rounded bg-red-600 text-white">Log out</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700">You are not logged in.</p>
            <div className="mt-3 flex gap-3">
              <a href="/login" className="px-3 py-2 rounded bg-blue-600 text-white">Login</a>
              <a href="/register" className="px-3 py-2 rounded bg-emerald-600 text-white">Register</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
