// ─── IS3Overlay ────────────────────────────────────────────────────
// Renders FHL's Info Sarker-3 (IS3) rural fiber network.
// Each core-count category has a unique colour for easy identification:
//   48 Core   — red     (#dc2626)  2.5 px solid
//   24 Core   — teal    (#0d9488)  1.8 px solid
//   Messenger — fuchsia (#c026d3)  1.5 px dashed
//   12 Core   — amber   (#ca8a04)  1.2 px solid
//   Others    — slate   (#64748b)  1.0 px

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON, CircleMarker } from 'react-leaflet'
import type { FeatureCollection, Feature, LineString } from 'geojson'
import L from 'leaflet'

export const IS3_COLORS = {
  '48':   '#dc2626',
  '24':   '#0d9488',
  'msg':  '#c026d3',
  '12':   '#ca8a04',
  'other':'#64748b',
} as const

function coreColor(cores: string): string {
  return IS3_COLORS[cores as keyof typeof IS3_COLORS] ?? IS3_COLORS.other
}

function lineStyle(feature?: Feature): L.PathOptions {
  const cores = (feature?.properties?.cores as string) ?? 'other'

  let weight    = 1.0
  let dashArray: string | undefined
  let opacity   = 0.82

  switch (cores) {
    case '48':  weight = 2.5;                              break
    case '24':  weight = 1.8;                              break
    case 'msg': weight = 1.5; dashArray = '7 4'; opacity = 0.75; break
    case '12':  weight = 1.2; opacity = 0.78;              break
    default:    weight = 1.0; opacity = 0.55;
  }

  return {
    color:       coreColor(cores),
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
    const color = coreColor((f.properties?.cores as string) ?? 'other')
    if (!geom || geom.type !== 'LineString') continue
    const c = (geom as LineString).coordinates
    if (c.length >= 2) {
      pts.push({ pos: [c[0][1], c[0][0]],                  color })
      pts.push({ pos: [c[c.length - 1][1], c[c.length - 1][0]], color })
    }
  }
  return pts
}

// ── Component ─────────────────────────────────────────────────────

interface Props {
  visible: boolean
}

export default function IS3Overlay({ visible }: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/is3-lines.geojson')
      .then(r => r.json())
      .then(setGeo)
      .catch(err => console.warn('IS3Overlay: GeoJSON failed', err))
  }, [])

  const endpoints = useMemo(
    () => (geo ? extractEndpoints(geo.features) : []),
    [geo]
  )

  if (!visible || !geo) return null

  return (
    <>
      <GeoJSON
        key="is3-lines"
        data={geo}
        style={lineStyle}
      />
      {endpoints.map((ep, i) => (
        <CircleMarker
          key={`is3ep-${i}`}
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
