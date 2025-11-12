import { useEffect, useMemo, useState } from 'react'

// Very small QR generator: we will render a QR via Google Chart API fallback to avoid extra deps
// In production you might prefer a local generator like 'qrcode' npm package.

const getBaseUrl = () => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function QRLogin() {
  const [token, setToken] = useState(null)
  const [approveUrl, setApproveUrl] = useState('')
  const [status, setStatus] = useState('creating')
  const [expiresAt, setExpiresAt] = useState(null)

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/qr/start`, { method: 'POST' })
        if (!res.ok) throw new Error('Failed to start session')
        const data = await res.json()
        setToken(data.token)
        setApproveUrl(data.approve_url)
        setExpiresAt(data.expires_at)
        setStatus('pending')
      } catch (e) {
        setStatus('error')
      }
    }
    createSession()
  }, [])

  useEffect(() => {
    if (!token) return
    let interval
    const poll = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/qr/status/${token}`)
        if (!res.ok) throw new Error('status failed')
        const data = await res.json()
        setStatus(data.status)
      } catch (e) {
        // ignore
      }
    }
    poll()
    interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [token])

  const qrSrc = useMemo(() => {
    if (!approveUrl) return ''
    const encoded = encodeURIComponent(approveUrl)
    return `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encoded}`
  }, [approveUrl])

  const consume = async () => {
    if (!token) return
    await fetch(`${getBaseUrl()}/qr/consume/${token}`, { method: 'POST' })
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white/80 backdrop-blur p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">QR Login</h2>
      {status === 'creating' && <p className="text-center text-gray-600">Preparing QR session…</p>}
      {status === 'error' && <p className="text-center text-red-600">Could not create session.</p>}
      {approveUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={qrSrc} alt="QR code" className="rounded-lg border border-gray-200" />
          <p className="text-sm text-gray-600 text-center">Scan with your signed-in mobile device to approve.</p>
          <a href={approveUrl} className="text-xs text-blue-600 underline break-all">Open approve link</a>
        </div>
      )}
      <div className="mt-4 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status === 'approved' ? 'bg-green-100 text-green-700' : status === 'expired' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
          {status}
        </span>
      </div>
      {status === 'approved' && (
        <button onClick={consume} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Continue</button>
      )}
      {expiresAt && (
        <p className="mt-3 text-xs text-center text-gray-500">Expires at {new Date(expiresAt).toLocaleTimeString()}</p>
      )}
    </div>
  )
}
