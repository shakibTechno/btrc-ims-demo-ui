import { NavLink } from 'react-router-dom'
import { SITES } from '@/data/sites'
import { OPERATORS } from '@/data/operators'

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

      {/* ── Demo badge ── */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          background: 'rgba(245,158,11,0.10)', color: '#f59e0b',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 6, padding: '5px 8px', fontSize: 10, fontWeight: 600,
        }}>
          ⚡ DEMO — Simulated Data
        </div>
      </div>

    </aside>
  )
}
