// ─── FiberOverlay ─────────────────────────────────────────────────
// Renders BGFCL NTTN fiber routes as styled Polylines.
//
// Visual encoding:
//   Thickness  — Tier 1 (3 px) > Tier 2 (2 px) > Tier 3 (1.5 px)
//   Color      — active (blue) / degraded (amber) / cut (red)
//   Dash       — Tier 3 and cut routes use dashed stroke
//   Animation  — cut routes animate the dash offset to signal disruption
//
// Props:
//   visible  — controlled by parent; parent also owns the toggle button
//              so the button can live outside the MapContainer if needed

import { Polyline } from 'react-leaflet'
import { FIBER_ROUTES, FIBER_COLOR, FIBER_WEIGHT } from '@/data/fiberRoutes'
import type { FiberRoute } from '@/data/fiberRoutes'

interface Props {
  visible: boolean
}

function routeOptions(route: FiberRoute) {
  const color   = FIBER_COLOR[route.status]
  const weight  = FIBER_WEIGHT[route.tier]
  const isDash  = route.tier === 3 || route.status === 'cut'
  const isCut   = route.status === 'cut'

  return {
    color,
    weight,
    opacity:      route.status === 'degraded' ? 0.7 : 0.9,
    dashArray:    isDash ? (isCut ? '6 5' : '8 6') : undefined,
    lineCap:      'round'  as const,
    lineJoin:     'round'  as const,
    // Cut routes get a CSS class for the animated dash-offset
    className:    isCut ? 'fiber-cut' : undefined,
    interactive:  false,
  }
}

export default function FiberOverlay({ visible }: Props) {
  if (!visible) return null

  return (
    <>
      {FIBER_ROUTES.map(route => (
        <Polyline
          key={route.id}
          positions={route.coords}
          pathOptions={routeOptions(route)}
        />
      ))}
    </>
  )
}
