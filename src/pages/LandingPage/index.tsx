import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import btrcLogo from '@/assets/Logo/btrcLogo.png'
import { SITES } from '@/data/sites'
import { OPERATORS } from '@/data/operators'
import SimplePieChart from '@/components/charts/SimplePieChart'

const ISP_POP_COUNT = 12_439

// ─── KPI Card ─────────────────────────────────────────────────────
interface KPIProps {
  label: string
  value: string | number
  sub?: string
  accent: string
  bg: string
  icon: string
}

function KPICard({ label, value, sub, accent, bg, icon }: KPIProps) {
  return (
    <div style={{
      background: 'white', borderRadius: 10,
      border: '1px solid #e2e8f0',
      borderTop: `3px solid ${accent}`,
      padding: '14px 16px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ─── Quick Nav Card ───────────────────────────────────────────────
interface NavCardProps {
  to: string
  label: string
  description: string
  icon: string
  color: string
}

function NavCard({ to, label, description, icon, color }: NavCardProps) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        background: 'white', borderRadius: 10,
        border: `1px solid #e2e8f0`,
        padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.15s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.1)`
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'none'
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{label}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{description}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────
export default function LandingPage() {
  const total    = SITES.length
  const active   = SITES.filter(s => s.status === 'active').length
  const down     = SITES.filter(s => s.status === 'down').length
  const degraded = SITES.filter(s => s.status === 'degraded').length

  const pieData = [
    { name: 'Active',   value: active,   color: '#22c55e' },
    { name: 'Down',     value: down,     color: '#ef4444' },
    { name: 'Degraded', value: degraded, color: '#f59e0b' },
  ]

  const divisionData = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of SITES) {
      map.set(s.division, (map.get(s.division) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([div, count]) => ({ div, count }))
      .sort((a, b) => b.count - a.count)
  }, [])

  const DIV_COLORS = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9','#f97316']

  const NAV_CARDS: NavCardProps[] = [
    { to: '/overview',  label: 'National Overview',  description: 'GIS map, site layers, division breakdown',  icon: '🗺️', color: '#003D7A' },
    { to: '/operators', label: 'Operator Dashboard', description: 'Per-operator KPIs, compliance, tenancy',    icon: '🏢', color: '#6366f1' },
    { to: '/sites',     label: 'Site Directory',     description: 'Full site list, filters, detail view',      icon: '📋', color: '#0891b2' },
    { to: '/reports',   label: 'Reports',            description: 'BTS, fiber line, tower reports',            icon: '📊', color: '#059669' },
    { to: '/disaster',  label: 'Disaster Response',  description: 'Active alerts, affected sites, recovery',   icon: '⚠️', color: '#ef4444' },
  ]

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #003D7A 0%, #1e3a5f 60%, #0f172a 100%)',
        borderRadius: 14, padding: '28px 32px',
        display: 'flex', alignItems: 'center', gap: 28,
        marginBottom: 24,
        boxShadow: '0 4px 24px rgba(0,61,122,0.3)',
      }}>
        <img
          src={btrcLogo}
          alt="BTRC"
          style={{ width: 80, height: 80, objectFit: 'contain', flexShrink: 0, filter: 'brightness(0) invert(1)' }}
        />
        <div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Bangladesh Telecommunication Regulatory Commission
          </div>
          <div style={{ color: 'white', fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
            BTRC IMS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.5, maxWidth: 580 }}>
            Infrastructure Monitoring System of Nationwide Tower and Optical Fiber Network
            including Disaster Response Cell
          </div>
          <div style={{
            marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)', borderRadius: 20,
            padding: '4px 12px', border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 0 0 rgba(34,197,94,0.5)',
              animation: 'livePulse 2s infinite', display: 'inline-block',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>
              LIVE MONITORING ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <KPICard label="Total Sites"         value={total}          accent="#003D7A" bg="#eff6ff" icon="📡" sub="All registered" />
        <KPICard label="Active Sites"        value={active}         accent="#16a34a" bg="#f0fdf4" icon="✅" sub={`${Math.round(active/total*100)}% uptime`} />
        <KPICard label="Down Sites"          value={down}           accent="#dc2626" bg="#fef2f2" icon="🔴" sub="Outage active" />
        <KPICard label="Degraded Sites"      value={degraded}       accent="#d97706" bg="#fffbeb" icon="🟡" sub="Partial service" />
        <KPICard label="Licensed Operators"  value={OPERATORS.length} accent="#7c3aed" bg="#faf5ff" icon="🏭" sub="MNO + NTTN + Tower" />
        <KPICard label="ISP POPs"            value={ISP_POP_COUNT}  accent="#059669" bg="#ecfdf5" icon="🌐" sub="Points of Presence" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Status Pie */}
        <SimplePieChart title="Site Status Distribution" data={pieData} />

        {/* Division Bar */}
        <div style={{
          background: 'white', borderRadius: 10, padding: '16px 16px 8px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            Sites by Division
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={divisionData} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="div" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(v) => [v, 'Sites']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {divisionData.map((_, i) => (
                  <Cell key={i} fill={DIV_COLORS[i % DIV_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Quick Navigation ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Quick Access
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {NAV_CARDS.map(card => (
            <NavCard key={card.to} {...card} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  )
}
