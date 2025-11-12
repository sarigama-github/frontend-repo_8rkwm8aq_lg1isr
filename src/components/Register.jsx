import { useEffect, useState } from 'react'

const API = () => import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:8000'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [rpId, setRpId] = useState('')
  const [userId, setUserId] = useState('')

  const start = async (e) => {
    e.preventDefault()
    setStatus('starting')
    setMessage('')
    try {
      const res = await fetch(`${API()}/webauthn/register/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      if (!res.ok) throw new Error('Failed to start registration')
      const data = await res.json()
      setChallenge(data.challenge)
      setRpId(data.rpId)
      setUserId(data.userId)
      setStatus('challenge')
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  const doRegister = async () => {
    if (!challenge) return
    setStatus('registering')
    try {
      const publicKey = {
        challenge: Uint8Array.from(atob(challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
        rp: { id: window.location.hostname, name: 'Demo RP' },
        user: { id: Uint8Array.from(atob(userId.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)), name: email, displayName: name || email },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { userVerification: 'preferred' },
        timeout: 60000,
        attestation: 'none',
      }
      const cred = await navigator.credentials.create({ publicKey })
      const payload = {
        email,
        name,
        id: cred.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(cred.rawId))),
        response: {
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(cred.response.attestationObject || []))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(cred.response.clientDataJSON || []))),
        },
        type: cred.type,
      }
      const res = await fetch(`${API()}/webauthn/register/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Registration failed')
      setStatus('success')
      setMessage('Registered! You can now login with fingerprint/biometrics.')
    } catch (e) {
      setStatus('error')
      setMessage(e.message || 'Registration failed')
    }
  }

  // QR of this registration page
  const regUrl = `${window.location.origin}/register`;
  const qrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=260x260&chl=${encodeURIComponent(regUrl)}`

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Register</h2>
      <form onSubmit={start} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg" type="submit">Start registration</button>
      </form>

      {status === 'challenge' && (
        <div className="mt-4">
          <button onClick={doRegister} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg">Use fingerprint / device biometrics</button>
        </div>
      )}

      {status === 'registering' && <p className="mt-3 text-sm text-gray-600 text-center">Waiting for authenticator…</p>}
      {status === 'success' && <p className="mt-3 text-sm text-green-700 text-center">{message}</p>}
      {status === 'error' && <p className="mt-3 text-sm text-red-600 text-center">{message}</p>}

      <div className="mt-6 text-center">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Scan to open registration on your phone</h3>
        <img src={qrSrc} alt="Register QR" className="mx-auto rounded border" />
      </div>
    </div>
  )
}
