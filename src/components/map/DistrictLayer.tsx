// ─── DistrictLayer ────────────────────────────────────────────────
// Loads bd-districts.geojson (64 districts) and renders:
//   • One filled polygon per district, colored by dominant site status
//   • District name labels visible at zoom ≥ 8 (they overlap at lower zoom)
//
// Props:
//   sites             — current filtered/live site list
//   highlightDivision — shade the entire division in disaster color

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection } from 'geojson'
import type { Site } from '@/types/site'

// ── Name bridge: GeoJSON adm2_name → site.district ───────────────
// Mismatches between OCHA GeoJSON spelling and our site data
const NAME_MAP: Record<string, string> = {
  Chapainababganj: 'Chapainawabganj',
  Jhalokati:       'Jhalokathi',
  Netrakona:       'Netrokona',
}
function toSiteName(geoName: string): string {
  return NAME_MAP[geoName] ?? geoName
}

// ── Per-district status ───────────────────────────────────────────
type DistrictStatus = 'active' | 'degraded' | 'down' | 'empty'

function districtStatus(districtName: string, sites: Site[]): DistrictStatus {
  const matching = sites.filter(s => s.district === districtName)
  if (matching.length === 0)                      return 'empty'
  if (matching.some(s => s.status === 'down'))    return 'down'
  if (matching.some(s => s.status === 'degraded'))return 'degraded'
  return 'active'
}

// ── Polygon styles ────────────────────────────────────────────────
const DISTRICT_STYLE: Record<DistrictStatus, L.PathOptions> = {
  active: {
    fillColor: '#22c55e', fillOpacity: 0.10,
    color: '#16a34a', weight: 0.8, opacity: 0.55,
  },
  degraded: {
    fillColor: '#f59e0b', fillOpacity: 0.16,
    color: '#d97706', weight: 1.2, opacity: 0.75,
  },
  down: {
    fillColor: '#ef4444', fillOpacity: 0.22,
    color: '#dc2626', weight: 1.8, opacity: 0.90,
  },
  empty: {
    fillColor: '#94a3b8', fillOpacity: 0.06,
    color: '#cbd5e1', weight: 0.6, opacity: 0.4,
  },
}

const HIGHLIGHT_STYLE: L.PathOptions = {
  fillColor: '#ef4444', fillOpacity: 0.20,
  color: '#ef4444', weight: 2, opacity: 1,
  dashArray: '4 3',
}

// ── Label DivIcon ─────────────────────────────────────────────────
function makeLabelIcon(name: string, status: DistrictStatus): L.DivIcon {
  const colors: Record<DistrictStatus, string> = {
    active:   '#14532d',
    degraded: '#78350f',
    down:     '#7f1d1d',
    empty:    '#64748b',
  }
  return L.divIcon({
    className: '',
    iconSize:  [0, 0],
    iconAnchor:[0, 0],
    html: `<span style="
      display:inline-block;
      font:600 8px/1 system-ui,sans-serif;
      color:${colors[status]};
      text-shadow:0 1px 3px rgba(255,255,255,0.97),0 0 6px rgba(255,255,255,0.8);
      white-space:nowrap;
      pointer-events:none;
      transform:translate(-50%,-50%);
      position:absolute;
      letter-spacing:0.03em;
    ">${name}</span>`,
  })
}

// ─────────────────────────────────────────────────────────────────

interface Props {
  sites:              Site[]
  highlightDivision?: string
}

interface DistrictCentroid {
  name:     string
  division: string
  lat:      number
  lon:      number
  status:   DistrictStatus
}

// Zoom-aware label visibility — labels only at zoom ≥ 8
function useMapZoom() {
  const [zoom, setZoom] = useState(7)
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  })
  return zoom
}

export default function DistrictLayer({ sites, highlightDivision }: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const zoom = useMapZoom()

  useEffect(() => {
    fetch('/data/bd-districts.geojson')
      .then(r => r.json())
      .then(setGeoData)
      .catch(err => console.warn('DistrictLayer: failed to load districts', err))
  }, [])

  // Per-district status from live sites
  const distStats = useMemo(() => {
    if (!geoData) return {} as Record<string, DistrictStatus>
    return Object.fromEntries(
      geoData.features.map(f => {
        const geoName  = f.properties?.name as string
        const siteName = toSiteName(geoName)
        return [geoName, districtStatus(siteName, sites)]
      })
    )
  }, [geoData, sites])

  // Centroid labels
  const centroids = useMemo<DistrictCentroid[]>(() => {
    if (!geoData) return []
    return geoData.features.map(f => ({
      name:     f.properties?.name     as string,
      division: f.properties?.division as string,
      lat:      f.properties?.lat      as number,
      lon:      f.properties?.lon      as number,
      status:   distStats[f.properties?.name as string] ?? 'empty',
    }))
  }, [geoData, distStats])

  // Style function — stable ref via useCallback
  const styleFunc = useCallback((feature?: Feature) => {
    if (!feature) return DISTRICT_STYLE.empty
    const name = feature.properties?.name as string
    const div  = feature.properties?.division as string
    if (highlightDivision && div === highlightDivision) return HIGHLIGHT_STYLE
    return DISTRICT_STYLE[distStats[name] ?? 'empty']
  }, [distStats, highlightDivision])

  // Rekey forces GeoJSON remount when status distribution changes
  const statsKey = useMemo(
    () => Object.entries(distStats).map(([k, v]) => `${k}:${v}`).sort().join('|'),
    [distStats],
  )

  if (!geoData) return null

  return (
    <>
      {/* ── District polygons ──────────────────────────────── */}
      <GeoJSON
        key={statsKey}
        data={geoData}
        style={styleFunc as () => L.PathOptions}
      />

      {/* ── District name labels (only at zoom ≥ 8) ──────── */}
      {zoom >= 8 && centroids.map(c => (
        <Marker
          key={c.name}
          position={[c.lat, c.lon]}
          icon={makeLabelIcon(c.name, c.status)}
          interactive={false}
          zIndexOffset={-1000}
        />
      ))}
    </>
  )
}
