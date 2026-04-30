import { type ReactNode, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import BangladeshOverlay from './BangladeshOverlay'
import FullscreenControl from './FullscreenControl'

// ─── InvalidateSize ───────────────────────────────────────────────
// Leaflet measures its container synchronously on mount, before the
// browser has finished painting the surrounding CSS grid/flex layout.
// This causes tiles to load for the wrong (smaller) dimensions.
// Calling invalidateSize() on the next animation frame — after layout
// is complete — forces Leaflet to re-measure and fill the container.
function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(frame)
  }, [map])
  return null
}

// Bangladesh geographic center
const BD_CENTER: LatLngExpression = [23.685, 90.356]
const BD_DEFAULT_ZOOM = 7

interface Props {
  center?:   LatLngExpression
  zoom?:     number
  height?:   number | string   // defaults to 100%
  style?:    React.CSSProperties  // extra styles merged onto the wrapper div
  children?: ReactNode
  minZoom?:  number
  maxZoom?:  number
}

// ─── BaseMap ──────────────────────────────────────────────────────
// Wraps MapContainer with OpenStreetMap tiles and sane Bangladesh defaults.
// Leaflet CSS is already imported globally in main.tsx.
//
// Gotcha: MapContainer must render in a div with an explicit height.
// The parent is responsible for setting that height — BaseMap accepts
// a height prop and applies it to its wrapper div.

export default function BaseMap({
  center   = BD_CENTER,
  zoom     = BD_DEFAULT_ZOOM,
  height   = '100%',
  style,
  minZoom  = 5,
  maxZoom  = 18,
  children,
}: Props) {
  return (
    <div style={{ height, width: '100%', position: 'relative', ...style }}>
      {/* Ensure the Leaflet container fills the viewport when fullscreen */}
      <style>{`
        .leaflet-container:-webkit-full-screen { width: 100% !important; height: 100% !important; }
        .leaflet-container:fullscreen           { width: 100% !important; height: 100% !important; }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        style={{ height: '100%', width: '100%' }}
        // Bounds: restrict to Bangladesh + surrounding area
        maxBounds={[[20.0, 87.0], [27.0, 93.5]]}
        maxBoundsViscosity={0.8}
      >
        <InvalidateSize />
        <FullscreenControl />

        {/* OpenStreetMap standard — natural colours (green land, blue water, roads) */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Bangladesh border highlight + world dimmer */}
        <BangladeshOverlay />

        {children}
      </MapContainer>
    </div>
  )
}
