// ─── DivisionLayer ────────────────────────────────────────────────
// Loads bd-divisions.geojson and renders:
//   • One filled polygon per division, colored by dominant site status
//   • Permanent division name label at the centroid
//
// Props:
//   sites            — current filtered/live site list (from siteStore)
//   highlightDivision — name of a division to emphasize (disaster mode)

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON, Marker } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection } from 'geojson'
import type { Site } from '@/types/site'

// ── Name bridge between GeoJSON and our site data ─────────────────
// The only mismatch is Barishal (GeoJSON) vs Barisal (sites)
const NAME_MAP: Record<string, string> = {
  Barishal: 'Barisal',
}
function toSiteName(geoName: string): string {
  return NAME_MAP[geoName] ?? geoName
}

// ── Per-division status computation ──────────────────────────────
type DivisionStatus = 'active' | 'degraded' | 'down' | 'empty'

function divisionStatus(divName: string, sites: Site[]): DivisionStatus {
  const div = sites.filter(s => s.division === divName)
  if (div.length === 0) return 'empty'
  if (div.some(s => s.status === 'down'))     return 'down'
  if (div.some(s => s.status === 'degraded')) return 'degraded'
  return 'active'
}

// ── Style per status ──────────────────────────────────────────────
const DIVISION_STYLE: Record<DivisionStatus, L.PathOptions> = {
  active: {
    fillColor: '#22c55e', fillOpacity: 0.07,
    color: '#22c55e', weight: 1, opacity: 0.5,
  },
  degraded: {
    fillColor: '#f59e0b', fillOpacity: 0.12,
    color: '#f59e0b', weight: 1.5, opacity: 0.7,
  },
  down: {
    fillColor: '#ef4444', fillOpacity: 0.18,
    color: '#ef4444', weight: 2, opacity: 0.85,
  },
  empty: {
    fillColor: '#94a3b8', fillOpacity: 0.05,
    color: '#cbd5e1', weight: 1, opacity: 0.4,
  },
}

// Neutral style when heatmap is off (border only, no status colour)
const NEUTRAL_STYLE: L.PathOptions = {
  fillColor: 'transparent', fillOpacity: 0,
  color: '#94a3b8', weight: 1, opacity: 0.55,
}

// Boost the highlighted division (disaster zone)
const HIGHLIGHT_STYLE: L.PathOptions = {
  fillColor: '#ef4444', fillOpacity: 0.22,
  color: '#ef4444', weight: 2.5, opacity: 1,
  dashArray: '4 3',
}

// ── Label DivIcon ─────────────────────────────────────────────────
function makeLabelIcon(name: string, status: DivisionStatus, highlighted: boolean, heatmap: boolean): L.DivIcon {
  const colors: Record<DivisionStatus, string> = {
    active:   '#166534',
    degraded: '#92400e',
    down:     '#991b1b',
    empty:    '#475569',
  }
  const color = highlighted ? '#991b1b' : heatmap ? colors[status] : '#64748b'

  return L.divIcon({
    className: '',
    iconSize:  [0, 0],
    iconAnchor:[0, 0],
    html: `<span style="
      display:inline-block;
      font:700 9px/1 system-ui,sans-serif;
      text-transform:uppercase;
      letter-spacing:0.07em;
      color:${color};
      text-shadow:0 1px 3px rgba(255,255,255,0.95),0 0 6px rgba(255,255,255,0.7);
      white-space:nowrap;
      pointer-events:none;
      transform:translate(-50%,-50%);
      position:absolute;
    ">${name.toUpperCase()}</span>`,
  })
}

// ─────────────────────────────────────────────────────────────────

interface Props {
  sites:              Site[]
  highlightDivision?: string
  heatmap?:           boolean
}

interface DivisionCentroid {
  name: string
  lat:  number
  lon:  number
  status: DivisionStatus
}

export default function DivisionLayer({ sites, highlightDivision, heatmap = false }: Props) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/bd-divisions.geojson')
      .then(r => r.json())
      .then(setGeoData)
      .catch(err => console.warn('DivisionLayer: failed to load divisions', err))
  }, [])

  // Compute per-division status from current site list
  const divStats = useMemo(() => {
    if (!geoData) return {} as Record<string, DivisionStatus>
    return Object.fromEntries(
      geoData.features.map(f => {
        const geoName  = f.properties?.name as string
        const siteName = toSiteName(geoName)
        return [geoName, divisionStatus(siteName, sites)]
      })
    )
  }, [geoData, sites])

  // Centroid labels — derived from GeoJSON center_lat / center_lon props
  const centroids = useMemo<DivisionCentroid[]>(() => {
    if (!geoData) return []
    return geoData.features.map(f => ({
      name:   f.properties?.name as string,
      lat:    f.properties?.lat  as number,
      lon:    f.properties?.lon  as number,
      status: divStats[f.properties?.name as string] ?? 'empty',
    }))
  }, [geoData, divStats])

  // Rekey when division-level status changes so GeoJSON re-styles
  const statsKey = useMemo(
    () => Object.entries(divStats).map(([k, v]) => `${k}:${v}`).sort().join('|'),
    [divStats],
  )

  if (!geoData) return null

  return (
    <>
      {/* ── Division polygons ──────────────────────────────── */}
      <GeoJSON
        key={statsKey}
        data={geoData}
        // @ts-expect-error react-leaflet accepts PathOptions or StyleFunction
        style={(feature: Feature) => {
          const name = feature.properties?.name as string
          if (highlightDivision && name === highlightDivision) return HIGHLIGHT_STYLE
          if (!heatmap) return NEUTRAL_STYLE
          return DIVISION_STYLE[divStats[name] ?? 'empty']
        }}
      />

      {/* ── Division name labels ───────────────────────────── */}
      {centroids.map(c => (
        <Marker
          key={c.name}
          position={[c.lat, c.lon]}
          icon={makeLabelIcon(c.name, c.status, c.name === highlightDivision, heatmap)}
          interactive={false}
          zIndexOffset={-1000}
        />
      ))}
    </>
  )
}
