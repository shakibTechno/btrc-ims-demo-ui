import { useMemo, useState, useCallback, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import PageWrapper        from '@/components/layout/PageWrapper'
import BaseMap            from '@/components/map/BaseMap'
import SiteMarkerLayer    from '@/components/map/SiteMarkerLayer'
import DivisionLayer      from '@/components/map/DivisionLayer'
import DistrictLayer      from '@/components/map/DistrictLayer'
import OPGWOverlay        from '@/components/map/OPGWOverlay'
import BahonOverlay       from '@/components/map/BahonOverlay'
import IS3Overlay         from '@/components/map/IS3Overlay'
import FHLFONOverlay      from '@/components/map/FHLFONOverlay'
import MapLegend          from '@/components/map/MapLegend'
import StatusHistoryChart from '@/components/charts/StatusHistoryChart'
import SectionHeader      from '@/components/shared/SectionHeader'
import KPIRow               from './KPIRow'
import MapLayersPanel       from './MapLayersPanel'
import PowerSummaryPanel    from './PowerSummaryPanel'
import OutageSummaryPanel   from './OutageSummaryPanel'
import DivisionBreakdownPanel from './DivisionBreakdownPanel'
import { useFilteredSites }   from '@/hooks/useFilteredSites'
import { useKPIs }            from '@/hooks/useKPIs'
import { getNationalHourlyCounts } from '@/data/statusHistory'
import type { AssetType } from '@/types/site'

// Bangladesh geographic bounds — SW corner to NE corner
const BD_BOUNDS: [[number, number], [number, number]] = [[20.5, 87.9], [26.7, 92.7]]
const BD_FIT_OPTIONS = { padding: [10, 10] as [number, number] }

// Fires once on mount: invalidates size (fixes Leaflet CSS-grid measure issue)
// then fits Bangladesh bounds to whatever map height is available.
function FitBangladesh() {
  const map = useMap()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      map.invalidateSize()
      map.fitBounds(BD_BOUNDS, BD_FIT_OPTIONS)
    })
    return () => cancelAnimationFrame(frame)
  }, [map])
  return null
}

function MapViewResetter({ trigger }: { trigger: number }) {
  const map = useMap()
  useEffect(() => {
    if (trigger > 0) map.fitBounds(BD_BOUNDS, BD_FIT_OPTIONS)
  }, [trigger, map])
  return null
}

export default function NationalOverview() {
  const sites       = useFilteredSites()
  const kpis        = useKPIs()
  const historyData = useMemo(() => getNationalHourlyCounts(), [])

  // ── Toggle state (all OFF by default) ────────────────────────
  const [resetView,   setResetView]  = useState(0)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showOPGW,    setShowOPGW]   = useState(false)
  const [showBahon,   setShowBahon]  = useState(false)
  const [showIS3,     setShowIS3]    = useState(false)
  const [showFHLFON,  setShowFHLFON] = useState(false)
  const [mapView,     setMapView]    = useState<'division' | 'district'>('division')
  const [visibleTypes, setVisibleTypes] = useState<Set<AssetType>>(() => new Set<AssetType>())

  // ── Sub-filters (all ON by default within each overlay) ──────
  const [bahonFilters,       setBahonFilters]       = useState(() => new Set(['OH', 'UG', 'WC', 'node']))
  const [is3LineFilters,     setIs3LineFilters]     = useState(() => new Set(['48', '24', '12', 'msg', 'ring', 'cbd', 'other']))
  const [showIS3Nodes,       setShowIS3Nodes]       = useState(true)
  const [fhlfonLineFilters,  setFhlfonLineFilters]  = useState(() => new Set(['Aerial', 'Burial', 'OPGW']))
  const [fhlfonPointFilters, setFhlfonPointFilters] = useState(() => new Set(['CO', 'BTS', 'FDH', 'JE', 'EP', 'FAT']))

  const toggleAssetType = useCallback((type: AssetType) => {
    setVisibleTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const toggleBahonFilter = useCallback((key: string) => {
    setBahonFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleIS3Line = useCallback((key: string) => {
    setIs3LineFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleFhlfonLine = useCallback((key: string) => {
    setFhlfonLineFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleFhlfonPoint = useCallback((key: string) => {
    setFhlfonPointFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const mapSites = useMemo(
    () => sites.filter(s => visibleTypes.has(s.type)),
    [sites, visibleTypes]
  )

  const showTower = visibleTypes.has('tower')
  const showBTS   = visibleTypes.has('bts')
  const showPoP   = visibleTypes.has('nttn_pop')

  return (
    <PageWrapper>

      {/* ── KPI row ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <KPIRow kpis={kpis} />
      </div>

      {/* ── Main body: map (left) + side panels (right) ──────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, marginBottom: 12 }}>

        {/* GIS Map */}
        <div style={{
          background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column',
          height: 'calc(100vh - 140px)', minHeight: 420,
        }}>
          {/* Map header — clean: just title + reset + site count */}
          <div style={{
            padding: '8px 14px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#475569',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Infrastructure Map
              </span>
              <button
                onClick={() => setResetView(v => v + 1)}
                title="Reset map to default view"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                  border: '1px solid #e2e8f0', background: 'white',
                  color: '#64748b', fontSize: 10, fontWeight: 600,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white';   e.currentTarget.style.color = '#64748b' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                Reset View
              </button>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {sites.length} site{sites.length !== 1 ? 's' : ''}
            </span>
          </div>

          <BaseMap height="100%" style={{ flex: 1, minHeight: 0 }}>
            <FitBangladesh />
            <MapViewResetter trigger={resetView} />
            {mapView === 'division'
              ? <DivisionLayer  sites={sites} heatmap={showHeatmap} />
              : <DistrictLayer  sites={sites} heatmap={showHeatmap} />
            }
            <OPGWOverlay   visible={showOPGW}   />
            <BahonOverlay
              visible={showBahon}
              lineFilters={bahonFilters}
              showNodes={bahonFilters.has('node')}
            />
            <IS3Overlay
              visible={showIS3}
              lineFilters={is3LineFilters}
              showNodes={showIS3Nodes}
            />
            <FHLFONOverlay
              visible={showFHLFON}
              lineFilters={fhlfonLineFilters}
              pointFilters={fhlfonPointFilters}
            />
            <SiteMarkerLayer sites={mapSites} />
            <MapLegend
              position="bottomright"
              showTower={showTower} showBTS={showBTS} showPoP={showPoP}
              showOPGW={showOPGW} showBahon={showBahon}
              showIS3={showIS3} showFHLFON={showFHLFON}
            />
          </BaseMap>
        </div>

        {/* Right panel — Map Layers only */}
        <div>
          <MapLayersPanel
            mapView={mapView}           setMapView={setMapView}
            showHeatmap={showHeatmap}   onToggleHeatmap={() => setShowHeatmap(v => !v)}
            visibleTypes={visibleTypes} onToggleAsset={toggleAssetType}
            showOPGW={showOPGW}         onToggleOPGW={()   => setShowOPGW(v   => !v)}
            showBahon={showBahon}       onToggleBahon={()  => setShowBahon(v  => !v)}
            bahonFilters={bahonFilters} onToggleBahonFilter={toggleBahonFilter}
            showIS3={showIS3}            onToggleIS3={()    => setShowIS3(v => !v)}
            is3LineFilters={is3LineFilters} onToggleIS3Line={toggleIS3Line}
            showIS3Nodes={showIS3Nodes}  onToggleIS3Nodes={() => setShowIS3Nodes(v => !v)}
            showFHLFON={showFHLFON}     onToggleFHLFON={() => setShowFHLFON(v => !v)}
            fhlfonLineFilters={fhlfonLineFilters}   onToggleFhlfonLine={toggleFhlfonLine}
            fhlfonPointFilters={fhlfonPointFilters} onToggleFhlfonPoint={toggleFhlfonPoint}
          />
        </div>
      </div>

      {/* ── Bottom row 1: division table + status history ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <DivisionBreakdownPanel />
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

      {/* ── Bottom row 2: power + outages ────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <PowerSummaryPanel kpis={kpis} />
        <OutageSummaryPanel />
      </div>
    </PageWrapper>
  )
}
