// ─── OPGWOverlay ───────────────────────────────────────────────────
// Renders the Bangladesh Power Grid OPGW transmission network.
//
// Line colours by type:
//   400 kV T/L  — yellow  (#eab308)
//   230 kV T/L  — green   (#16a34a)
//   UG Cable    — blue    (#3b82f6)
//   Others      — orange  (#f97316)
//
// Endpoint markers (filled circle, 3 px, white border) are rendered
// at the first and last coordinate of every line feature.

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON, CircleMarker } from 'react-leaflet'
import type { FeatureCollection, Feature, LineString, MultiLineString } from 'geojson'
import L from 'leaflet'

// ── Colour map ────────────────────────────────────────────────────

function layerColor(layer: string): string {
  if (layer.includes('400kV')) return '#eab308'
  if (layer.includes('230kV')) return '#16a34a'
  if (layer === 'UG Cable')   return '#3b82f6'
  return '#f97316'
}

// ── Line style ────────────────────────────────────────────────────

function lineStyle(feature?: Feature): L.PathOptions {
  const layer = (feature?.properties?.layer as string) ?? ''
  const color = layerColor(layer)

  let weight    = 1.5
  let dashArray: string | undefined
  let opacity   = 0.85

  if (layer.includes('400kV'))         { weight = 2.8 }
  else if (layer.includes('230kV'))    { weight = 2.2 }
  else if (layer.includes('132kV'))    { weight = 1.8 }
  else if (layer === 'UG Cable')       { weight = 1.5; dashArray = '6 4'; opacity = 0.75 }
  else if (layer.startsWith('PS Con')) { weight = 1.2; opacity = 0.6 }

  return { color, weight, opacity, dashArray, lineCap: 'round', lineJoin: 'round', interactive: false }
}

// ── Endpoint extraction ───────────────────────────────────────────

interface Endpoint {
  pos:   [number, number]   // [lat, lng] for Leaflet
  color: string
}

function extractEndpoints(features: Feature[]): Endpoint[] {
  const pts: Endpoint[] = []

  for (const f of features) {
    const layer = (f.properties?.layer as string) ?? ''
    const color = layerColor(layer)
    const geom  = f.geometry

    if (!geom) continue

    if (geom.type === 'LineString') {
      const coords = (geom as LineString).coordinates
      if (coords.length >= 2) {
        pts.push({ pos: [coords[0][1],                  coords[0][0]],                  color })
        pts.push({ pos: [coords[coords.length - 1][1],  coords[coords.length - 1][0]],  color })
      }
    } else if (geom.type === 'MultiLineString') {
      const lines = (geom as MultiLineString).coordinates
      for (const line of lines) {
        if (line.length >= 2) {
          pts.push({ pos: [line[0][1],               line[0][0]],               color })
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

export default function OPGWOverlay({ visible }: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/opgw-lines.geojson')
      .then(r => r.json())
      .then(setGeo)
      .catch(err => console.warn('OPGWOverlay: GeoJSON failed', err))
  }, [])

  const endpoints = useMemo(
    () => (geo ? extractEndpoints(geo.features) : []),
    [geo]
  )

  if (!visible || !geo) return null

  return (
    <>
      {/* Lines */}
      <GeoJSON
        key="opgw-lines"
        data={geo}
        style={lineStyle}
      />

      {/* Endpoint dots */}
      {endpoints.map((ep, i) => (
        <CircleMarker
          key={`ep-${i}`}
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
