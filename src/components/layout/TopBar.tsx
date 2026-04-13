import { useState, useEffect } from 'react'
import AlertBell from '@/components/alerts/AlertBell'
import { useFilterStore } from '@/store/filterStore'
import { useSiteStore }   from '@/store/siteStore'
import { useAuthStore }   from '@/store/authStore'

// ─── Live clock fixed at demo reference timezone (UTC+6) ─────────
function LiveClock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
      {time.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })} UTC+6
    </span>
  )
}

// ─── Synced-ago counter ───────────────────────────────────────────
// Resets to 0 on each simulation tick; counts up each second.
function SyncedAgo() {
  const tickCount = useSiteStore(s => s.tickCount)
  const [elapsed, setElapsed] = useState(0)

  // Reset elapsed whenever a new tick fires
  useEffect(() => {
    setElapsed(0)
  }, [tickCount])

  // Count up each second
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span style={{ fontSize: 10, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
      synced {elapsed}s ago
    </span>
  )
}

// ─── Active filter pill ───────────────────────────────────────────
function ActiveFilterBadge() {
  const hasActive    = useFilterStore(s => s.hasActiveFilters())
  const resetFilters = useFilterStore(s => s.resetFilters)

  if (!hasActive) return null

  return (
    <button
      onClick={resetFilters}
      title="Clear all filters"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 20,
        background: '#eff6ff', color: '#1d4ed8',
        border: '1px solid #bfdbfe',
        fontSize: 11, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      <span>Filters active</span>
      <span style={{ fontSize: 13, lineHeight: 1 }}>×</span>
    </button>
  )
}

// ─── User avatar + logout ─────────────────────────────────────────
function UserMenu() {
  const user   = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const [open, setOpen] = useState(false)

  if (!user) return null

  const roleColor: Record<string, string> = {
    admin: '#7c3aed', viewer: '#0284c7', operator: '#059669',
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '4px 8px', borderRadius: 7, cursor: 'pointer',
          border: '1px solid #e2e8f0', background: open ? '#f8fafc' : 'white',
          transition: 'all 0.12s', outline: 'none',
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: roleColor[user.role] ?? '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 10, fontWeight: 700,
        }}>
          {user.initials}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
            {user.displayName}
          </div>
          <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'capitalize' }}>
            {user.role}
          </div>
        </div>
        <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <>
          {/* Click-outside backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100,
            minWidth: 180, overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{user.displayName}</div>
              <div style={{
                display: 'inline-block', marginTop: 3, padding: '1px 7px', borderRadius: 9999,
                background: roleColor[user.role] + '18', color: roleColor[user.role],
                fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
              }}>
                {user.role}
              </div>
            </div>
            <button
              onClick={() => { setOpen(false); logout() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '9px 14px', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: 12, color: '#ef4444', fontWeight: 600,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────
interface Props {
  title: string
}

export default function TopBar({ title }: Props) {
  return (
    <header style={{
      height: 50, minHeight: 50,
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
      gap: 12,
    }}>

      {/* Left: title + LIVE badge + synced indicator + active filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <h1 style={{
          margin: 0, fontSize: 14, fontWeight: 600,
          color: '#1e293b', whiteSpace: 'nowrap',
        }}>
          {title}
        </h1>

        {/* LIVE pulsing indicator */}
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 10, fontWeight: 700, padding: '2px 7px',
          borderRadius: 9999, background: '#f0fdf4', color: '#16a34a',
          border: '1px solid #bbf7d0', letterSpacing: '0.05em',
          flexShrink: 0,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 0 0 rgba(22,163,74,0.6)',
            animation: 'livePulse 2s infinite',
          }} />
          LIVE
        </span>

        <SyncedAgo />
        <ActiveFilterBadge />
      </div>

      {/* Right: clock + alert bell + user menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <LiveClock />
        <div style={{ width: 1, height: 18, background: '#e2e8f0' }} />
        <AlertBell />
        <div style={{ width: 1, height: 18, background: '#e2e8f0' }} />
        <UserMenu />
      </div>

      {/* Pulse keyframe injected once */}
      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
        }
      `}</style>
    </header>
  )
}
