import { useMemo, useState } from 'react'
import PageWrapper        from '@/components/layout/PageWrapper'
import FilterBar          from '@/components/filters/FilterBar'
import BaseMap            from '@/components/map/BaseMap'
import SiteMarkerLayer    from '@/components/map/SiteMarkerLayer'
import DivisionLayer      from '@/components/map/DivisionLayer'
import FiberOverlay       from '@/components/map/FiberOverlay'
import MapLegend          from '@/components/map/MapLegend'
import StatusHistoryChart from '@/components/charts/StatusHistoryChart'
import SectionHeader      from '@/components/shared/SectionHeader'
import KPIRow               from './KPIRow'
import PowerSummaryPanel    from './PowerSummaryPanel'
import OutageSummaryPanel   from './OutageSummaryPanel'
import DivisionBreakdownPanel from './DivisionBreakdownPanel'
import { useFilteredSites }   from '@/hooks/useFilteredSites'
import { useKPIs }            from '@/hooks/useKPIs'
import { getNationalHourlyCounts } from '@/data/statusHistory'

// ─── NationalOverview ─────────────────────────────────────────────
// Hero dashboard. Shows GIS map + KPIs + power + outages + history.
// Every panel is driven by the global Zustand filter state.

export default function NationalOverview() {
  const sites       = useFilteredSites()
  const kpis        = useKPIs()
  const historyData = useMemo(() => getNationalHourlyCounts(), [])
  const [showFiber, setShowFiber] = useState(true)

  return (
    <PageWrapper>
      {/* ── Filter bar ───────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <FilterBar />
      </div>

      {/* ── KPI row ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <KPIRow kpis={kpis} />
      </div>

      {/* ── Main body: map (left) + side panels (right) ──────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, marginBottom: 12 }}>

        {/* GIS Map — flex column so the map fills whatever height the grid gives */}
        <div style={{
          background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Map card header */}
          <div style={{
            padding: '8px 14px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Infrastructure Map
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Fiber toggle */}
              <button
                onClick={() => setShowFiber(v => !v)}
                title={showFiber ? 'Hide fiber routes' : 'Show fiber routes'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  border: showFiber ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                  background: showFiber ? '#eff6ff' : 'white',
                  color: showFiber ? '#1d4ed8' : '#64748b',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                {/* Fiber icon: two nodes connected by a line */}
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"
                     stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="2"  cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <line x1="3.5" y1="5" x2="10.5" y2="5"/>
                </svg>
                Fiber
                {showFiber
                  ? <span style={{ fontSize: 9, opacity: 0.7 }}>ON</span>
                  : <span style={{ fontSize: 9, opacity: 0.5 }}>OFF</span>
                }
              </button>

              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                {sites.length} site{sites.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* flex:1 + minHeight:0 lets BaseMap grow to fill the card */}
          <BaseMap height="100%" style={{ flex: 1, minHeight: 0 }}>
            <DivisionLayer sites={sites} />
            <FiberOverlay visible={showFiber} />
            <SiteMarkerLayer sites={sites} />
            <MapLegend position="bottomright" showFiber={showFiber} />
          </BaseMap>
        </div>

        {/* Right panel stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PowerSummaryPanel kpis={kpis} />
          <OutageSummaryPanel />
        </div>
      </div>

      {/* ── Bottom row: division table + status history ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Division breakdown */}
        <DivisionBreakdownPanel />

        {/* Status history chart */}
        <div style={{
          background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
          padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <SectionHeader
            title="24-Hour Status Trend"
            subtitle="National hourly active / degraded / down counts"
          />
          <div style={{ marginTop: 8 }}>
            <StatusHistoryChart data={historyData} height={220} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
