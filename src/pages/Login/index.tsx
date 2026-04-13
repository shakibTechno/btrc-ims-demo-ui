import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// ─── Login ────────────────────────────────────────────────────────
// Full-screen login page. Redirects to the originally requested URL
// (or "/" if none) after successful authentication.

const DEMO_ACCOUNTS = [
  { username: 'admin',    password: 'btrc2026', role: 'Admin'    },
  { username: 'viewer',   password: 'btrc2026', role: 'Viewer'   },
  { username: 'operator', password: 'btrc2026', role: 'Operator' },
]

export default function Login() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const login      = useAuthStore(s => s.login)
  const error      = useAuthStore(s => s.error)
  const clearError = useAuthStore(s => s.clearError)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Where to redirect after login
  const from = (location.state as { from?: string })?.from ?? '/'

  // Clear any stale error on mount
  useEffect(() => { clearError() }, [clearError])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    // Small delay for UX feedback
    setTimeout(() => {
      const ok = login(username, password)
      setLoading(false)
      if (ok) navigate(from, { replace: true })
    }, 350)
  }

  function fillDemo(u: string, p: string) {
    setUsername(u)
    setPassword(p)
    clearError()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #003D7A 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Card */}
      <div style={{
        background: 'white', borderRadius: 14,
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        width: '100%', maxWidth: 400,
        overflow: 'hidden',
      }}>

        {/* Header band */}
        <div style={{
          background: '#003D7A', padding: '28px 32px 24px',
          textAlign: 'center',
        }}>
          {/* IMS logo mark */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>IMS</span>
          </div>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            BTRC IMS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            Infrastructure Monitoring System
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '28px 32px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>
            Sign in to your account
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
                color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); clearError() }}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%', height: 40, padding: '0 12px',
                  borderRadius: 7, fontSize: 13,
                  border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
                  outline: 'none', color: '#1e293b', background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20, position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600,
                color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError() }}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{
                  width: '100%', height: 40, padding: '0 40px 0 12px',
                  borderRadius: 7, fontSize: 13,
                  border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
                  outline: 'none', color: '#1e293b', background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 10, bottom: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', fontSize: 14, padding: 0, lineHeight: 1,
                }}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 14, padding: '8px 12px', borderRadius: 6,
                background: '#fef2f2', border: '1px solid #fca5a5',
                fontSize: 12, color: '#dc2626', fontWeight: 500,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: '100%', height: 42, borderRadius: 8,
                background: loading ? '#93c5fd' : (!username || !password) ? '#cbd5e1' : '#003D7A',
                color: 'white', border: 'none', cursor: loading || !username || !password ? 'default' : 'pointer',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 22, padding: '12px 14px', borderRadius: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Demo Accounts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {DEMO_ACCOUNTS.map(a => (
                <button
                  key={a.username}
                  type="button"
                  onClick={() => fillDemo(a.username, a.password)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                    background: username === a.username ? '#eff6ff' : 'white',
                    border: username === a.username ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    transition: 'all 0.12s', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>
                    {a.username}
                  </span>
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    {a.role} · {a.password}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
              Click a row to fill credentials
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 32px 16px', textAlign: 'center',
          borderTop: '1px solid #f1f5f9',
        }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            Bangladesh Telecommunication Regulatory Commission
          </span>
        </div>
      </div>
    </div>
  )
}
