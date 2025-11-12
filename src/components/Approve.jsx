import { useEffect, useState } from 'react'

const getApiBase = () =>
  import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:8000'

export default function Approve() {
  const [status, setStatus] = useState('approving')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Missing token in URL')
      return
    }

    const approve = async () => {
      try {
        const res = await fetch(`${getApiBase()}/qr/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.detail || 'Approval failed')
        }
        const data = await res.json()
        setStatus('success')
        setMessage(`Session ${data.status}`)
      } catch (e) {
        setStatus('error')
        setMessage(e.message)
      }
    }

    approve()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur p-6 rounded-xl shadow text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Approve Login</h1>
        {status === 'approving' && <p className="text-gray-600">Approving session…</p>}
        {status === 'success' && (
          <p className="text-green-700">Approved! You can return to the other device.</p>
        )}
        {status === 'error' && (
          <p className="text-red-600">{message || 'Could not approve this session.'}</p>
        )}
      </div>
    </div>
  )
}
