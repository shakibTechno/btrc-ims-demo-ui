// ─── FiberOverlay ─────────────────────────────────────────────────
// Renders BGFCL NTTN fiber routes as styled polylines.
//
// Two-layer approach:
//   1. Highway geometry (bd-fiber-highways.geojson) — real OSM road geometry
//      for Tier 1 & 2 national routes (N1–N8). Each OSM segment is rendered
//      individually; shared endpoints make them visually continuous.
//   2. Manual coords (fiberRoutes.ts) — Tier 3 local spurs and disaster
//      cut routes that don't exist in trunk/primary highway data.
//
// Visual encoding:
//   Thickness  — Tier 1 (3.5 px) > Tier 2 (2.2 px) > Tier 3 (1.5 px)
//   Color      — active=blue / degraded=amber / cut=red
//   Dash       — cut routes use dashed stroke + CSS animation
//
// Props:
//   visible  — controlled by parent toggle

import { useState, useEffect } from 'react'
import { Polyline, GeoJSON }   from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import { FIBER_ROUTES, FIBER_COLOR, FIBER_WEIGHT } from '@/data/fiberRoutes'
import type { FiberStatus } from '@/data/fiberRoutes'
import L from 'leaflet'

// ── Style helpers ─────────────────────────────────────────────────

type Tier = 1 | 2 | 3

function highwayStyle(status: FiberStatus, tier: Tier): L.PathOptions {
  const color  = FIBER_COLOR[status]
  const weight = FIBER_WEIGHT[tier]
  return {
    color,
    weight,
    opacity:   status === 'degraded' ? 0.75 : 0.92,
    dashArray: status === 'degraded' ? '10 6' : undefined,
    lineCap:   'round',
    lineJoin:  'round',
    interactive: false,
  }
}

function manualRouteOptions(status: FiberStatus, tier: Tier) {
  const color  = FIBER_COLOR[status]
  const weight = FIBER_WEIGHT[tier]
  const isCut  = status === 'cut'
  return {
    color,
    weight,
    opacity:     status === 'degraded' ? 0.75 : 0.90,
    dashArray:   isCut ? '6 5' : (tier === 3 ? '8 6' : undefined),
    lineCap:     'round'  as const,
    lineJoin:    'round'  as const,
    className:   isCut ? 'fiber-cut' : undefined,
    interactive: false,
  }
}

// ── FiberOverlay ──────────────────────────────────────────────────

interface Props {
  visible: boolean
}

export default function FiberOverlay({ visible }: Props) {
  const [highwayGeo, setHighwayGeo] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/bd-fiber-highways.geojson')
      .then(r => r.json())
      .then(setHighwayGeo)
      .catch(err => console.warn('FiberOverlay: highway GeoJSON failed', err))
  }, [])

  if (!visible) return null

  return (
    <>
      {/* ── Layer 1: Real highway geometry (Tier 1 & 2) ─────────── */}
      {highwayGeo && (
        <GeoJSON
          key="fiber-highways"
          data={highwayGeo}
          style={(feature) => {
            const status = (feature?.properties?.status ?? 'active') as FiberStatus
            const tier   = (feature?.properties?.tier   ?? 2)        as Tier
            return highwayStyle(status, tier)
          }}
        />
      )}

      {/* ── Layer 2: Manual Tier-3 spurs + cut/degraded local ───── */}
      {FIBER_ROUTES.filter(r => r.tier === 3).map(route => (
        <Polyline
          key={route.id}
          positions={route.coords}
          pathOptions={manualRouteOptions(route.status, route.tier)}
        />
      ))}
    </>
  )
}
