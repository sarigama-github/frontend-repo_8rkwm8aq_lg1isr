import { useState } from 'react'

const API = () => import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:8000'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [allowCredentials, setAllowCredentials] = useState([])

  const start = async (e) => {
    e.preventDefault()
    setStatus('starting')
    setMessage('')
    try {
      const res = await fetch(`${API()}/webauthn/login/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({}))
        throw new Error(err.detail || 'Failed to start login')
      }
      const data = await res.json()
      setChallenge(data.challenge)
      setAllowCredentials(data.allowCredentials || [])
      setStatus('challenge')
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  const doLogin = async () => {
    if (!challenge) return
    setStatus('authenticating')
    try {
      const publicKey = {
        challenge: Uint8Array.from(atob(challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
        rpId: window.location.hostname,
        allowCredentials: allowCredentials.map(c => ({ type: 'public-key', id: Uint8Array.from(atob(c.id.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0)) })),
        userVerification: 'preferred',
        timeout: 60000,
      }
      const assertion = await navigator.credentials.get({ publicKey })
      const payload = {
        email,
        id: assertion.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
        response: {
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData || []))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON || []))),
          signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature || []))),
          userHandle: assertion.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle))) : null,
        },
        type: assertion.type,
      }
      const res = await fetch(`${API()}/webauthn/login/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      setStatus('success')
      setMessage('Logged in!')
      localStorage.setItem('session', data.session)
      window.location.href = '/dashboard'
    } catch (e) {
      setStatus('error')
      setMessage(e.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Login</h2>
      <form onSubmit={start} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg" type="submit">Start login</button>
      </form>

      {status === 'challenge' && (
        <div className="mt-4">
          <button onClick={doLogin} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg">Use fingerprint / biometrics</button>
        </div>
      )}

      {status === 'authenticating' && <p className="mt-3 text-sm text-gray-600 text-center">Waiting for authenticator…</p>}
      {status === 'success' && <p className="mt-3 text-sm text-green-700 text-center">{message}</p>}
      {status === 'error' && <p className="mt-3 text-sm text-red-600 text-center">{message}</p>}

      <div className="mt-6 text-center text-sm text-gray-600">
        New here? <a href="/register" className="text-blue-600 underline">Create an account</a>
      </div>
    </div>
  )
}
