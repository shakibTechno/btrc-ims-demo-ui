import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Sidebar           from '@/components/layout/Sidebar'
import TopBar            from '@/components/layout/TopBar'
import ErrorBoundary     from '@/components/shared/ErrorBoundary'
import FilterBar         from '@/components/filters/FilterBar'
import { useSimulation } from '@/hooks/useSimulation'
import { useAuthStore }  from '@/store/authStore'
import { useFilterStore } from '@/store/filterStore'
import type { TimePeriod } from '@/types/filters'
import Login             from '@/pages/Login'
import NationalOverview  from '@/pages/NationalOverview'
import OperatorDashboard from '@/pages/OperatorDashboard'
import SiteDirectory     from '@/pages/SiteDirectory'
import SiteDetail        from '@/pages/SiteDetail'
import DisasterResponse  from '@/pages/DisasterResponse'

// ─── National overview topbar controls ───────────────────────────
const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'live', label: 'Live'     },
  { value: '24h',  label: 'Last 24h' },
  { value: '7d',   label: 'Last 7d'  },
  { value: '30d',  label: 'Last 30d' },
]

function NationalTopBarControls() {
  const period    = useFilterStore(s => s.period)
  const setPeriod = useFilterStore(s => s.setPeriod)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {PERIODS.map(({ value, label }) => {
          const active = period === value
          return (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={{
                padding: '2px 7px', borderRadius: 4, cursor: 'pointer',
                fontSize: 9, fontWeight: 600, border: 'none',
                background: active ? '#1d4ed8' : '#f1f5f9',
                color: active ? 'white' : '#64748b',
                transition: 'all 0.12s', whiteSpace: 'nowrap', lineHeight: '16px',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      <div style={{ width: 1, height: 16, background: '#e2e8f0', flexShrink: 0 }} />
      <FilterBar
        show={{ period: false, location: true, operator: true, asset: true }}
        compact
      />
    </div>
  )
}

// ─── SimulationRunner ─────────────────────────────────────────────
function SimulationRunner() {
  useSimulation(10_000)
  return null
}

// ─── Page title mapping ───────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/':          'National Overview',
  '/operators': 'Operator Dashboard',
  '/sites':     'Site Directory',
  '/disaster':  'Disaster Response Cell',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/sites/')) return 'Site Detail'
  return PAGE_TITLES[pathname] ?? 'BTRC IMS'
}

// ─── Protected route ──────────────────────────────────────────────
// Redirects to /login if not authenticated, passing the attempted
// path in location.state so Login can redirect back after sign-in.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user     = useAuthStore(s => s.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

// ─── Layout shell ─────────────────────────────────────────────────
function Layout() {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)

  useEffect(() => {
    document.title = `${title} — BTRC IMS`
  }, [title])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopBar title={title} extra={pathname === '/' ? <NationalTopBarControls /> : undefined} />
        <main style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/"              element={<NationalOverview />}  />
              <Route path="/operators"     element={<OperatorDashboard />} />
              <Route path="/sites"         element={<SiteDirectory />}     />
              <Route path="/sites/:siteId" element={<SiteDetail />}        />
              <Route path="/disaster"      element={<DisasterResponse />}  />
              <Route path="*"              element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <SimulationRunner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
