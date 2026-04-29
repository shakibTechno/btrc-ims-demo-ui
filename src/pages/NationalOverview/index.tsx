import { useMemo, useState, useCallback } from 'react'
import PageWrapper        from '@/components/layout/PageWrapper'
import FilterBar          from '@/components/filters/FilterBar'
import BaseMap            from '@/components/map/BaseMap'
import SiteMarkerLayer    from '@/components/map/SiteMarkerLayer'
import DivisionLayer      from '@/components/map/DivisionLayer'
import DistrictLayer     from '@/components/map/DistrictLayer'
import FiberOverlay       from '@/components/map/FiberOverlay'
import OPGWOverlay        from '@/components/map/OPGWOverlay'
import BahonOverlay       from '@/components/map/BahonOverlay'
import IS3Overlay         from '@/components/map/IS3Overlay'
import FHLFONOverlay      from '@/components/map/FHLFONOverlay'
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
import type { AssetType } from '@/types/site'

const ASSET_TOGGLES: Array<{ type: AssetType; label: string; emoji: string }> = [
  { type: 'tower',    label: 'Tower', emoji: '🗼' },
  { type: 'bts',      label: 'BTS',   emoji: '📡' },
  { type: 'nttn_pop', label: 'PoP',   emoji: '🌐' },
]

// ─── NationalOverview ─────────────────────────────────────────────
// Hero dashboard. Shows GIS map + KPIs + power + outages + history.
// Every panel is driven by the global Zustand filter state.

export default function NationalOverview() {
  const sites       = useFilteredSites()
  const kpis        = useKPIs()
  const historyData = useMemo(() => getNationalHourlyCounts(), [])
  const [showFiber,    setShowFiber]   = useState(true)
  const [showOPGW,     setShowOPGW]    = useState(false)
  const [showBahon,    setShowBahon]   = useState(false)
  const [showIS3,      setShowIS3]     = useState(false)
  const [showFHLFON,   setShowFHLFON]  = useState(false)
  const [mapView,      setMapView]    = useState<'division' | 'district'>('division')
  const [visibleTypes, setVisibleTypes] = useState<Set<AssetType>>(
    () => new Set<AssetType>(['tower', 'bts', 'nttn_pop'])
  )

  const toggleAssetType = useCallback((type: AssetType) => {
    setVisibleTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  // Map sites filtered by visible asset types (KPI counts remain unaffected)
  const mapSites = useMemo(
    () => sites.filter(s => visibleTypes.has(s.type)),
    [sites, visibleTypes]
  )

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

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* Division / District toggle */}
              <div style={{
                display: 'flex', borderRadius: 6, overflow: 'hidden',
                border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600,
              }}>
                {(['division', 'district'] as const).map(view => (
                  <button
                    key={view}
                    onClick={() => setMapView(view)}
                    style={{
                      padding: '4px 10px', cursor: 'pointer', border: 'none',
                      background: mapView === view ? '#1d4ed8' : 'white',
                      color:      mapView === view ? 'white'   : '#64748b',
                      transition: 'all 0.15s', textTransform: 'capitalize',
                    }}
                  >
                    {view}
                  </button>
                ))}
              </div>

              {/* Asset type toggles — Tower / BTS / PoP */}
              {ASSET_TOGGLES.map(({ type, label, emoji }) => {
                const on = visibleTypes.has(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleAssetType(type)}
                    title={`${on ? 'Hide' : 'Show'} ${label} sites`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                      border: on ? '1px solid #64748b' : '1px solid #e2e8f0',
                      background: on ? '#f1f5f9' : 'white',
                      color: on ? '#334155' : '#94a3b8',
                      fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 13, lineHeight: 1 }}>{emoji}</span>
                    {label}
                    <span style={{ fontSize: 9, opacity: on ? 0.7 : 0.5 }}>
                      {on ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )
              })}

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

              {/* OPGW toggle */}
              <button
                onClick={() => setShowOPGW(v => !v)}
                title={showOPGW ? 'Hide OPGW transmission lines' : 'Show OPGW transmission lines'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  border: showOPGW ? '1px solid #eab308' : '1px solid #e2e8f0',
                  background: showOPGW ? '#fefce8' : 'white',
                  color: showOPGW ? '#854d0e' : '#64748b',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" strokeLinecap="round">
                  <line x1="1" y1="9" x2="4" y2="1" stroke="currentColor" strokeWidth="1.6"/>
                  <line x1="4" y1="1" x2="7" y2="5" stroke="currentColor" strokeWidth="1.6"/>
                  <line x1="7" y1="5" x2="10" y2="1" stroke="currentColor" strokeWidth="1.6"/>
                  <line x1="10" y1="1" x2="13" y2="9" stroke="currentColor" strokeWidth="1.6"/>
                  <line x1="1" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5"/>
                </svg>
                OPGW
                {showOPGW
                  ? <span style={{ fontSize: 9, opacity: 0.7 }}>ON</span>
                  : <span style={{ fontSize: 9, opacity: 0.5 }}>OFF</span>
                }
              </button>

              {/* Bahon toggle */}
              <button
                onClick={() => setShowBahon(v => !v)}
                title={showBahon ? 'Hide Bahon fiber network' : 'Show Bahon fiber network'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  border: showBahon ? '1px solid #06b6d4' : '1px solid #e2e8f0',
                  background: showBahon ? '#ecfeff' : 'white',
                  color: showBahon ? '#0e7490' : '#64748b',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"
                     stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="2"  cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <line x1="3.5" y1="5" x2="10.5" y2="5"/>
                </svg>
                Bahon
                {showBahon
                  ? <span style={{ fontSize: 9, opacity: 0.7 }}>ON</span>
                  : <span style={{ fontSize: 9, opacity: 0.5 }}>OFF</span>
                }
              </button>

              {/* IS3 toggle */}
              <button
                onClick={() => setShowIS3(v => !v)}
                title={showIS3 ? 'Hide IS3 FHL fiber network' : 'Show IS3 FHL fiber network'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  border: showIS3 ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                  background: showIS3 ? '#f5f3ff' : 'white',
                  color: showIS3 ? '#5b21b6' : '#64748b',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"
                     stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="2"  cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <line x1="3.5" y1="5" x2="10.5" y2="5"/>
                </svg>
                IS3 FHL
                {showIS3
                  ? <span style={{ fontSize: 9, opacity: 0.7 }}>ON</span>
                  : <span style={{ fontSize: 9, opacity: 0.5 }}>OFF</span>
                }
              </button>

              {/* FHLFON toggle */}
              <button
                onClick={() => setShowFHLFON(v => !v)}
                title={showFHLFON ? 'Hide FHLFON fiber network' : 'Show FHLFON fiber network'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  border: showFHLFON ? '1px solid #4338ca' : '1px solid #e2e8f0',
                  background: showFHLFON ? '#eef2ff' : 'white',
                  color: showFHLFON ? '#3730a3' : '#64748b',
                  fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"
                     stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="2"  cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <line x1="3.5" y1="5" x2="10.5" y2="5"/>
                </svg>
                FHLFON
                {showFHLFON
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
            {mapView === 'division'
              ? <DivisionLayer  sites={sites} />
              : <DistrictLayer  sites={sites} />
            }
            <FiberOverlay visible={showFiber} />
            <OPGWOverlay visible={showOPGW} />
            <BahonOverlay visible={showBahon} />
            <IS3Overlay visible={showIS3} />
            <FHLFONOverlay visible={showFHLFON} />
            <SiteMarkerLayer sites={mapSites} />
            <MapLegend position="bottomright" showFiber={showFiber} showOPGW={showOPGW} showBahon={showBahon} showIS3={showIS3} showFHLFON={showFHLFON} />
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
