import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Sidebar       from '@/components/layout/Sidebar'
import TopBar        from '@/components/layout/TopBar'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { useSimulation } from '@/hooks/useSimulation'

// ─── SimulationRunner ─────────────────────────────────────────────
// Mounts one interval timer for the live data simulation.
// Placed inside BrowserRouter so hooks have router context if needed.
function SimulationRunner() {
  useSimulation(10_000)
  return null
}

import NationalOverview  from '@/pages/NationalOverview'
import OperatorDashboard from '@/pages/OperatorDashboard'
import SiteDirectory     from '@/pages/SiteDirectory'
import SiteDetail        from '@/pages/SiteDetail'
import DisasterResponse  from '@/pages/DisasterResponse'

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
        <TopBar title={title} />
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
      <Layout />
    </BrowserRouter>
  )
}
