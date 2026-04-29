// ─── FHLFONOverlay ─────────────────────────────────────────────────
// Renders Fiber@Home Limited's national fiber optic network (FHLFON).
// 18,405 line features (Route ≥ 1 km, Core ≥ 12) + 6,922 hub points.
//
// Colour family: indigo — distinct from BTCL blue, IS3 red/teal/amber,
// Bahon cyan/brown, and OPGW yellow/green.
//
// Lines by core count:
//   hc  (≥ 216 core) — #3730a3  3.0 px
//   48  (48–215 core) — #4338ca  2.2 px
//   24  (24–47 core)  — #6366f1  1.6 px
//   12  (12–23 core)  — #818cf8  1.2 px
//   Burial lines rendered with a subtle dash regardless of core count.
//
// Points by type:
//   CO  (Central Office)       — large dot  #1e1b4b
//   BTS (Base Transceiver Stn) — medium dot #4338ca
//   FDH (Fiber Distrib. Hub)   — small dot  #818cf8

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON, CircleMarker } from 'react-leaflet'
import type { FeatureCollection, Feature, LineString, MultiLineString, Point } from 'geojson'
import L from 'leaflet'

// ── Colour / style helpers ────────────────────────────────────────

const LINE_STYLES: Record<string, { color: string; weight: number }> = {
  hc:  { color: '#3730a3', weight: 3.0 },
  '48':{ color: '#4338ca', weight: 2.2 },
  '24':{ color: '#6366f1', weight: 1.6 },
  '12':{ color: '#818cf8', weight: 1.2 },
}

const PT_STYLES: Record<string, { color: string; radius: number }> = {
  CO:  { color: '#1e1b4b', radius: 5 },
  BTS: { color: '#4338ca', radius: 3 },
  FDH: { color: '#818cf8', radius: 3 },
}

function lineStyle(feature?: Feature): L.PathOptions {
  const cat  = (feature?.properties?.cat  as string) ?? '12'
  const lt   = (feature?.properties?.lt   as string) ?? ''
  const s    = LINE_STYLES[cat] ?? LINE_STYLES['12']
  const isBurial = lt === 'B'

  return {
    color:       s.color,
    weight:      s.weight,
    opacity:     0.82,
    dashArray:   isBurial ? '6 4' : undefined,
    lineCap:     'round',
    lineJoin:    'round',
    interactive: false,
  }
}

// ── Endpoint extraction (lines) ───────────────────────────────────

interface LinePt { pos: [number, number]; color: string }

function extractLineEndpoints(features: Feature[]): LinePt[] {
  const pts: LinePt[] = []
  for (const f of features) {
    const geom  = f.geometry
    const cat   = (f.properties?.cat as string) ?? '12'
    const color = LINE_STYLES[cat]?.color ?? '#818cf8'
    if (!geom) continue

    if (geom.type === 'LineString') {
      const c = (geom as LineString).coordinates
      if (c.length >= 2) {
        pts.push({ pos: [c[0][1], c[0][0]], color })
        pts.push({ pos: [c[c.length - 1][1], c[c.length - 1][0]], color })
      }
    } else if (geom.type === 'MultiLineString') {
      for (const line of (geom as MultiLineString).coordinates) {
        if (line.length >= 2) {
          pts.push({ pos: [line[0][1], line[0][0]], color })
          pts.push({ pos: [line[line.length - 1][1], line[line.length - 1][0]], color })
        }
      }
    }
  }
  return pts
}

// ── Component ─────────────────────────────────────────────────────

interface Props { visible: boolean }

export default function FHLFONOverlay({ visible }: Props) {
  const [lines,  setLines]  = useState<FeatureCollection | null>(null)
  const [points, setPoints] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/fhlfon-lines.geojson')
      .then(r => r.json()).then(setLines)
      .catch(err => console.warn('FHLFONOverlay lines failed', err))
    fetch('/data/fhlfon-points.geojson')
      .then(r => r.json()).then(setPoints)
      .catch(err => console.warn('FHLFONOverlay points failed', err))
  }, [])

  const lineEndpoints = useMemo(
    () => (lines ? extractLineEndpoints(lines.features) : []),
    [lines]
  )

  if (!visible) return null

  return (
    <>
      {/* Lines */}
      {lines && (
        <GeoJSON key="fhlfon-lines" data={lines} style={lineStyle} />
      )}

      {/* Line endpoint dots */}
      {lineEndpoints.map((ep, i) => (
        <CircleMarker key={`flep-${i}`} center={ep.pos} radius={2.5}
          pathOptions={{ color:'white', weight:1.2, fillColor:ep.color,
            fillOpacity:1, opacity:0.85, interactive:false }} />
      ))}

      {/* Hub points */}
      {points && points.features.map((f, i) => {
        const pt   = (f.properties?.pt as string) ?? 'CO'
        const s    = PT_STYLES[pt] ?? PT_STYLES.CO
        const geom = f.geometry as Point
        if (!geom) return null
        const pos: [number, number] = [geom.coordinates[1], geom.coordinates[0]]
        return (
          <CircleMarker key={`flpt-${i}`} center={pos} radius={s.radius}
            pathOptions={{ color:'white', weight:1.5, fillColor:s.color,
              fillOpacity:0.9, opacity:0.9, interactive:false }} />
        )
      })}
    </>
  )
}
