import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { SITES } from '@/data/sites'
import { OPERATORS } from '@/data/operators'
import { useAuthStore } from '@/store/authStore'

// ─── Nav item config ──────────────────────────────────────────────
interface NavItem {
  to:      string
  label:   string
  icon:    React.ReactNode
  end?:    boolean
  badge?:  React.ReactNode
}

// ─── SVG Icons ───────────────────────────────────────────────────
function IconMap() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  )
}
function IconBuilding() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  )
}
function IconList() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}
function IconDisaster() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────
function SidebarStats() {
  const total    = SITES.length
  const active   = SITES.filter(s => s.status === 'active').length
  const down     = SITES.filter(s => s.status === 'down').length
  const degraded = SITES.filter(s => s.status === 'degraded').length

  return (
    <div style={{
      margin: '12px 12px 4px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 6,
      padding: '10px 12px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ color: '#475569', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Network Status
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px' }}>
        {[
          { label: 'Total',    value: total,    color: '#94a3b8' },
          { label: 'Active',   value: active,   color: '#22c55e' },
          { label: 'Down',     value: down,     color: '#ef4444' },
          { label: 'Degraded', value: degraded, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ color, fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#475569', fontSize: 10, marginTop: 1 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Operator list ────────────────────────────────────────────────
function SidebarOperators() {
  return (
    <div style={{ margin: '4px 12px 0', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ color: '#475569', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Licensed Operators
      </div>
      {OPERATORS.map(op => {
        const siteCount = SITES.filter(s => s.operatorId === op.id).length
        return (
          <div key={op.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: op.color,
            }} />
            <div style={{ flex: 1, color: '#64748b', fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {op.shortName}
            </div>
            <div style={{ color: '#475569', fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}>
              {siteCount}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Sidebar user menu ────────────────────────────────────────────
function SidebarUserMenu() {
  const user   = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const [open, setOpen] = useState(false)

  if (!user) return null

  const roleColor: Record<string, string> = {
    admin: '#7c3aed', viewer: '#0284c7', operator: '#059669',
  }
  const color = roleColor[user.role] ?? '#64748b'

  return (
    <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b', flexShrink: 0, position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.07)',
          background: open ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.12s', outline: 'none',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 10, fontWeight: 700,
        }}>
          {user.initials}
        </div>
        <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.displayName}
          </div>
          <div style={{ fontSize: 9, color: '#475569', textTransform: 'capitalize', marginTop: 1 }}>
            {user.role}
          </div>
        </div>
        <span style={{ fontSize: 10, color: '#475569' }}>▾</span>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: 12, right: 12,
            background: '#1e293b', borderRadius: 8, border: '1px solid #334155',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #334155' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{user.displayName}</div>
              <div style={{
                display: 'inline-block', marginTop: 3, padding: '1px 7px', borderRadius: 9999,
                background: color + '28', color,
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
                cursor: 'pointer', fontSize: 12, color: '#f87171', fontWeight: 600,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
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

// ─── Main Sidebar ─────────────────────────────────────────────────
export default function Sidebar() {
  const NAV_ITEMS: NavItem[] = [
    { to: '/',          label: 'National Overview',  icon: <IconMap />,      end: true  },
    { to: '/operators', label: 'Operator Dashboard', icon: <IconBuilding />, end: false },
    { to: '/sites',     label: 'Site Directory',      icon: <IconList />,     end: false },
    {
      to: '/disaster', label: 'Disaster Response', icon: <IconDisaster />, end: false,
      badge: (
        <span style={{
          background: '#ef4444', color: 'white',
          fontSize: 9, fontWeight: 700,
          padding: '1px 5px', borderRadius: 9999,
        }}>
          ACTIVE
        </span>
      ),
    },
  ]

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: '#0f172a',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      borderRight: '1px solid #1e293b',
    }}>

      {/* ── Brand ── */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: '#003D7A', borderRadius: 7, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, flexDirection: 'column',
          }}>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: 1, lineHeight: 1 }}>IMS</span>
          </div>
          <div>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>BTRC IMS</div>
            <div style={{ color: '#475569', fontSize: 10, lineHeight: 1.4 }}>Infrastructure Monitor</div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ padding: '10px 8px', flexShrink: 0 }}>
        <div style={{ color: '#334155', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 4 }}>
          Dashboards
        </div>
        {NAV_ITEMS.map(({ to, label, icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 6, marginBottom: 1,
              fontSize: 12.5, textDecoration: 'none', transition: 'all 0.12s',
              background: isActive ? '#1e3a5f' : 'transparent',
              color:      isActive ? '#e2e8f0' : '#64748b',
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
            })}
          >
            <span style={{ flexShrink: 0, opacity: 0.85 }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge}
          </NavLink>
        ))}
      </nav>

      {/* ── Stats ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <SidebarStats />
        <SidebarOperators />
      </div>

      {/* ── User menu ── */}
      <SidebarUserMenu />

    </aside>
  )
}
