import { useMemo, useState, useCallback, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import PageWrapper        from '@/components/layout/PageWrapper'
import BaseMap            from '@/components/map/BaseMap'
import SiteMarkerLayer    from '@/components/map/SiteMarkerLayer'
import DivisionLayer      from '@/components/map/DivisionLayer'
import DistrictLayer      from '@/components/map/DistrictLayer'
import OPGWOverlay        from '@/components/map/OPGWOverlay'
import BahonOverlay       from '@/components/map/BahonOverlay'
import IS3Overlay         from '@/components/map/IS3Overlay'
import FHLFONOverlay      from '@/components/map/FHLFONOverlay'
import UpazilaLayer          from '@/components/map/UpazilaLayer'
import SummitOverlay, { type SummitLineFilters } from '@/components/map/SummitOverlay'
import BanglalinkTowersOverlay, { type BLGenFilter }  from '@/components/map/BanglalinkTowersOverlay'
import BanglalinkLinesOverlay,  { type BLLineFilter }  from '@/components/map/BanglalinkLinesOverlay'
import BTCLOverlay,             { type BTCLLineFilter } from '@/components/map/BTCLOverlay'
import BTCLNodesOverlay,        { type BTCLNodeFilter } from '@/components/map/BTCLNodesOverlay'
import BTCLUnionOverlay                                 from '@/components/map/BTCLUnionOverlay'
import RailwayOverlay        from '@/components/map/RailwayOverlay'
import RailwayFiberOverlay   from '@/components/map/RailwayFiberOverlay'
import OperatorLinesOverlay  from '@/components/map/OperatorLinesOverlay'
import MapLegend          from '@/components/map/MapLegend'
import MapLayersPanel       from './MapLayersPanel'
import PowerSummaryPanel    from './PowerSummaryPanel'
import OutageSummaryPanel   from './OutageSummaryPanel'
import { useFilteredSites }   from '@/hooks/useFilteredSites'
import { useKPIs }            from '@/hooks/useKPIs'
import { useFilterStore }     from '@/store/filterStore'
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

// Leaflet control button that resets the map view to Bangladesh bounds.
// Positioned at topleft so it stacks directly below the fullscreen button.
function ResetViewControl() {
  const map = useMap()
  useEffect(() => {
    const ResetControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
        const a   = L.DomUtil.create('a', '', div) as HTMLAnchorElement
        a.href    = '#'
        a.title   = 'Reset to Bangladesh view'
        a.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>`
        a.style.cssText = 'display:flex;align-items:center;justify-content:center;width:30px;height:30px;color:#555;cursor:pointer;'
        L.DomEvent.on(a, 'click', (e: Event) => {
          L.DomEvent.preventDefault(e)
          L.DomEvent.stopPropagation(e)
          map.fitBounds(BD_BOUNDS, BD_FIT_OPTIONS)
        })
        return div
      },
      onRemove() {},
    })
    const ctrl = new ResetControl({ position: 'topleft' })
    ctrl.addTo(map)
    return () => { ctrl.remove() }
  }, [map])
  return null
}

export default function NationalOverview() {
  const sites            = useFilteredSites()
  const kpis             = useKPIs()
  const selectedDivision = useFilterStore(s => s.division)

  // ── Toggle state (all OFF by default) ────────────────────────
  const [showOPGW,    setShowOPGW]   = useState(false)
  const [showBahon,   setShowBahon]  = useState(false)
  const [showIS3,     setShowIS3]    = useState(false)
  const [showFHLFON,  setShowFHLFON] = useState(false)
  const [showRailway,      setShowRailway]      = useState(false)
  const [showBRFiber,      setShowBRFiber]      = useState(false)
  const [brFiberCoreFilters, setBRFiberCoreFilters] = useState(
    () => new Set(['8', '16', '32', '48', '72', '96'])
  )
  const [showBRFiberNodes, setShowBRFiberNodes] = useState(true)
  const [showOprLines,    setShowOprLines]    = useState(false)
  const [oprLineFilters,  setOprLineFilters]  = useState(
    () => new Set(['1', '2', '3', '4', '5', '6'])
  )
  const [showSummit,         setShowSummit]         = useState(false)
  const [summitLineFilters,  setSummitLineFilters]  = useState<SummitLineFilters>(
    () => ({ backbone: true, major: true, pgcb: true, railway: true })
  )
  const [showSummitNodes, setShowSummitNodes] = useState(true)
  const [showSummitBTS,   setShowSummitBTS]   = useState(false)
  const [showBLTowers,    setShowBLTowers]    = useState(false)
  const [blGenFilter,     setBlGenFilter]     = useState<BLGenFilter>(
    () => new Set<'4G' | '3G' | '2G'>(['4G', '3G', '2G'])
  )
  const [showBLLines,     setShowBLLines]     = useState(false)
  const [blLineFilter,    setBlLineFilter]    = useState<BLLineFilter>(
    () => new Set<'72' | '48' | '32'>(['72', '48', '32'])
  )
  const [showBTCL,        setShowBTCL]        = useState(false)
  const [btclLineFilter,  setBtclLineFilter]  = useState<BTCLLineFilter>(
    () => new Set<'144' | '96' | '48' | '24' | 'other'>(['144', '96', '48', '24', 'other'])
  )
  const [showBTCLNodes,   setShowBTCLNodes]   = useState(false)
  const [btclNodeFilter,  setBtclNodeFilter]  = useState<BTCLNodeFilter>(
    () => new Set<'hop' | 'hh' | 'cp' | 'mh'>(['hop', 'hh', 'cp', 'mh'])
  )
  const [showBTCLUnion,   setShowBTCLUnion]   = useState(false)
  const [mapView,     setMapView]    = useState<'division' | 'district' | 'upazila' | null>(null)
  const [visibleTypes, setVisibleTypes] = useState<Set<AssetType>>(() => new Set<AssetType>())

  // ── Sub-filters (all ON by default within each overlay) ──────
  const [opgwFilters,        setOpgwFilters]        = useState(() => new Set(['400kV', '230kV', '132kV', 'UG', 'other']))
  const [bahonFilters,       setBahonFilters]       = useState(() => new Set(['OH', 'UG', 'WC', 'node']))
  const [is3LineFilters,     setIs3LineFilters]     = useState(() => new Set(['48', '24', '12', 'msg', 'ring', 'cbd', 'other']))
  const [showIS3Nodes,       setShowIS3Nodes]       = useState(true)
  const [fhlfonLineFilters,  setFhlfonLineFilters]  = useState(() => new Set(['Aerial', 'Burial']))
  const [fhlfonPointFilters, setFhlfonPointFilters] = useState(() => new Set(['CO', 'BTS', 'FDH', 'JE', 'EP', 'FAT']))


  const toggleOpgwFilter = useCallback((key: string) => {
    setOpgwFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
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

  const toggleBRFiberCore = useCallback((key: string) => {
    setBRFiberCoreFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleOprLineFilter = useCallback((key: string) => {
    setOprLineFilters(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleSummitLine = useCallback((key: keyof SummitLineFilters) => {
    setSummitLineFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const toggleBLGen = useCallback((key: '4G' | '3G' | '2G') => {
    setBlGenFilter(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleBLLine = useCallback((key: '72' | '48' | '32') => {
    setBlLineFilter(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleBTCLLine = useCallback((key: '144' | '96' | '48' | '24' | 'other') => {
    setBtclLineFilter(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleBTCLNode = useCallback((key: 'hop' | 'hh' | 'cp' | 'mh') => {
    setBtclNodeFilter(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const handleResetLayers = useCallback(() => {
    setMapView(null)
    setVisibleTypes(new Set())
    setShowOPGW(false)
    setOpgwFilters(new Set(['400kV', '230kV', '132kV', 'UG', 'other']))
    setShowBahon(false)
    setBahonFilters(new Set(['OH', 'UG', 'WC', 'node']))
    setShowIS3(false)
    setIs3LineFilters(new Set(['48', '24', '12', 'msg', 'ring', 'cbd', 'other']))
    setShowIS3Nodes(true)
    setShowFHLFON(false)
    setShowRailway(false)
    setShowBRFiber(false)
    setBRFiberCoreFilters(new Set(['8', '16', '32', '48', '72', '96']))
    setShowBRFiberNodes(true)
    setShowOprLines(false)
    setOprLineFilters(new Set(['1', '2', '3', '4', '5', '6']))
    setShowSummit(false)
    setSummitLineFilters({ backbone: true, major: true, pgcb: true, railway: true })
    setShowSummitNodes(true)
    setShowSummitBTS(false)
    setShowBLTowers(false)
    setBlGenFilter(new Set<'4G' | '3G' | '2G'>(['4G', '3G', '2G']))
    setShowBLLines(false)
    setBlLineFilter(new Set<'72' | '48' | '32'>(['72', '48', '32']))
    setShowBTCL(false)
    setBtclLineFilter(new Set<'144' | '96' | '48' | '24' | 'other'>(['144', '96', '48', '24', 'other']))
    setShowBTCLNodes(false)
    setBtclNodeFilter(new Set<'hop' | 'hh' | 'cp' | 'mh'>(['hop', 'hh', 'cp', 'mh']))
    setShowBTCLUnion(false)
    setFhlfonLineFilters(new Set(['Aerial', 'Burial']))
    setFhlfonPointFilters(new Set(['CO', 'BTS', 'FDH', 'JE', 'EP', 'FAT']))
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

      {/* ── Main body: map (full width) with layers panel overlay ── */}
      <div style={{ marginBottom: 12, position: 'relative' }}>

        {/* GIS Map */}
        <div style={{
          background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          height: 'calc(100vh - 60px)', minHeight: 420, position: 'relative',
        }}>
          <BaseMap height="100%" style={{ height: '100%' }}>
            <FitBangladesh />
            <ResetViewControl />
            {mapView === 'division' && <DivisionLayer sites={sites} heatmap={false} selectedDivision={selectedDivision} />}
            {mapView === 'district' && <DistrictLayer sites={sites} heatmap={false} />}
            {mapView === 'upazila'  && <UpazilaLayer />}
            <OPGWOverlay   visible={showOPGW} lineFilters={opgwFilters} />
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
            <RailwayOverlay visible={showRailway} />
            <RailwayFiberOverlay
              visible={showBRFiber}
              coreFilters={brFiberCoreFilters}
              showNodes={showBRFiberNodes}
            />
            <OperatorLinesOverlay
              visible={showOprLines}
              opFilters={oprLineFilters}
            />
            <SummitOverlay
              visible={showSummit}
              lineFilters={summitLineFilters}
              showNodes={showSummitNodes}
              showBTS={showSummitBTS}
            />
            <BanglalinkTowersOverlay
              visible={showBLTowers}
              genFilter={blGenFilter}
            />
            <BanglalinkLinesOverlay
              visible={showBLLines}
              lineFilter={blLineFilter}
            />
            <BTCLOverlay
              visible={showBTCL}
              lineFilter={btclLineFilter}
            />
            <BTCLNodesOverlay
              visible={showBTCLNodes}
              nodeFilter={btclNodeFilter}
            />
            <BTCLUnionOverlay visible={showBTCLUnion} />
            <SiteMarkerLayer sites={mapSites} />
            <MapLegend
              position="bottomleft"
              showTower={showTower} showBTS={showBTS} showPoP={showPoP}
              showOPGW={showOPGW} showBahon={showBahon}
              showIS3={showIS3} showFHLFON={showFHLFON} showRailway={showRailway}
              showBRFiber={showBRFiber} showOprLines={showOprLines}
              showSummit={showSummit}  showBLTowers={showBLTowers}  showBLLines={showBLLines}
              showBTCL={showBTCL}  showBTCLNodes={showBTCLNodes}  showBTCLUnion={showBTCLUnion}
            />
          </BaseMap>

          {/* Map layers panel — floats over the map on the right */}
          <div style={{
            position: 'absolute', top: 8, right: 8,
            zIndex: 1500,
            maxHeight: 'calc(100% - 16px)',
            overflowY: 'auto',
            overflowX: 'visible',
          }}>
            <MapLayersPanel
              mapView={mapView}           setMapView={setMapView}
              showOPGW={showOPGW}         onToggleOPGW={()   => setShowOPGW(v   => !v)}
              opgwFilters={opgwFilters}   onToggleOpgwFilter={toggleOpgwFilter}
              showBahon={showBahon}       onToggleBahon={()  => setShowBahon(v  => !v)}
              bahonFilters={bahonFilters} onToggleBahonFilter={toggleBahonFilter}
              showIS3={showIS3}            onToggleIS3={()    => setShowIS3(v => !v)}
              is3LineFilters={is3LineFilters} onToggleIS3Line={toggleIS3Line}
              showIS3Nodes={showIS3Nodes}  onToggleIS3Nodes={() => setShowIS3Nodes(v => !v)}
              showFHLFON={showFHLFON}     onToggleFHLFON={() => setShowFHLFON(v => !v)}
              fhlfonLineFilters={fhlfonLineFilters}   onToggleFhlfonLine={toggleFhlfonLine}
              fhlfonPointFilters={fhlfonPointFilters} onToggleFhlfonPoint={toggleFhlfonPoint}
              showRailway={showRailway}   onToggleRailway={() => setShowRailway(v => !v)}
              showBRFiber={showBRFiber}           onToggleBRFiber={() => setShowBRFiber(v => !v)}
              brFiberCoreFilters={brFiberCoreFilters} onToggleBRFiberCore={toggleBRFiberCore}
              showBRFiberNodes={showBRFiberNodes}  onToggleBRFiberNodes={() => setShowBRFiberNodes(v => !v)}
              showOprLines={showOprLines}          onToggleOprLines={() => setShowOprLines(v => !v)}
              oprLineFilters={oprLineFilters}      onToggleOprLineFilter={toggleOprLineFilter}
              showSummit={showSummit}              onToggleSummit={() => setShowSummit(v => !v)}
              summitLineFilters={summitLineFilters} onToggleSummitLine={toggleSummitLine}
              showSummitNodes={showSummitNodes}    onToggleSummitNodes={() => setShowSummitNodes(v => !v)}
              showSummitBTS={showSummitBTS}        onToggleSummitBTS={() => setShowSummitBTS(v => !v)}
              showBLTowers={showBLTowers}          onToggleBLTowers={() => setShowBLTowers(v => !v)}
              blGenFilter={blGenFilter}            onToggleBLGen={toggleBLGen}
              showBLLines={showBLLines}            onToggleBLLines={() => setShowBLLines(v => !v)}
              blLineFilter={blLineFilter}          onToggleBLLine={toggleBLLine}
              showBTCL={showBTCL}                  onToggleBTCL={() => setShowBTCL(v => !v)}
              btclLineFilter={btclLineFilter}      onToggleBTCLLine={toggleBTCLLine}
              showBTCLNodes={showBTCLNodes}        onToggleBTCLNodes={() => setShowBTCLNodes(v => !v)}
              btclNodeFilter={btclNodeFilter}      onToggleBTCLNode={toggleBTCLNode}
              showBTCLUnion={showBTCLUnion}        onToggleBTCLUnion={() => setShowBTCLUnion(v => !v)}
              onReset={handleResetLayers}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom row: power + outages ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <PowerSummaryPanel kpis={kpis} />
        <OutageSummaryPanel />
      </div>
    </PageWrapper>
  )
}
