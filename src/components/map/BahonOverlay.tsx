// ─── BahonOverlay ──────────────────────────────────────────────────
// Renders Bahon Limited's national fiber network from the converted
// Shapefile (7,763 features ≥ 200 m, simplified).
//
// Colour: cyan (#06b6d4) — distinct from BTCL fiber (blue) and OPGW.
// Style variants:
//   OH  — Overhead,  solid,  1.8 px
//   UG  — Underground, dashed, 1.8 px
//   WC* — Wall-clamp variants, solid, 1.2 px
//   Others — solid, 1 px
//
// Endpoint markers (3 px filled circle, white border) at each
// line's start and end coordinate.

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON, CircleMarker } from 'react-leaflet'
import type { FeatureCollection, Feature, LineString, MultiLineString } from 'geojson'
import L from 'leaflet'

export const BAHON_COLOR    = '#06b6d4'
const BAHON_UG_COLOR = '#78350f'

function lineStyle(feature?: Feature): L.PathOptions {
  const ct = ((feature?.properties?.ct as string) ?? '').toUpperCase()

  let color     = BAHON_COLOR
  let weight    = 1.0
  let dashArray: string | undefined
  let opacity   = 0.82

  if (ct === 'UG') {
    color     = BAHON_UG_COLOR
    weight    = 1.8
    dashArray = '6 4'
    opacity   = 0.85
  } else if (ct === 'OH') {
    weight  = 1.8
  } else if (ct.startsWith('WC') || ct.startsWith('WALL')) {
    weight  = 1.2
    opacity = 0.65
  }

  return {
    color,
    weight,
    opacity,
    dashArray,
    lineCap:     'round',
    lineJoin:    'round',
    interactive: false,
  }
}

// ── Endpoint extraction ───────────────────────────────────────────

interface Endpoint { pos: [number, number]; color: string }

function extractEndpoints(features: Feature[]): Endpoint[] {
  const pts: Endpoint[] = []
  for (const f of features) {
    const geom  = f.geometry
    const ct    = ((f.properties?.ct as string) ?? '').toUpperCase()
    const color = ct === 'UG' ? BAHON_UG_COLOR : BAHON_COLOR
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

interface Props {
  visible: boolean
}

export default function BahonOverlay({ visible }: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/bahon-lines.geojson')
      .then(r => r.json())
      .then(setGeo)
      .catch(err => console.warn('BahonOverlay: GeoJSON failed', err))
  }, [])

  const endpoints = useMemo(
    () => (geo ? extractEndpoints(geo.features) : []),
    [geo]
  )

  if (!visible || !geo) return null

  return (
    <>
      <GeoJSON
        key="bahon-lines"
        data={geo}
        style={lineStyle}
      />
      {endpoints.map((ep, i) => (
        <CircleMarker
          key={`bep-${i}`}
          center={ep.pos}
          radius={3}
          pathOptions={{
            color:       'white',
            weight:      1.5,
            fillColor:   ep.color,
            fillOpacity: 1,
            opacity:     0.9,
            interactive: false,
          }}
        />
      ))}
    </>
  )
}
