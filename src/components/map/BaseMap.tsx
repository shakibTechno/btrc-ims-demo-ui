import { type ReactNode, useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import BangladeshOverlay from './BangladeshOverlay'
import FullscreenControl from './FullscreenControl'

// ─── InvalidateSize ───────────────────────────────────────────────
function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => cancelAnimationFrame(frame)
  }, [map])
  return null
}

// ─── TileModeControl ─────────────────────────────────────────────
// Two stacked buttons: CARTO and LOCAL. Active = blue, inactive = white.
type TileMode = 'osm' | 'carto' | 'local'

function TileModeControl({ mode, onSet }: { mode: TileMode; onSet: (m: TileMode) => void }) {
  const map = useMap()

  useEffect(() => {
    const Ctrl = L.Control.extend({
      onAdd() {
        const wrap = L.DomUtil.create('div', 'leaflet-bar leaflet-control')

        const makeBtn = (label: string, key: TileMode, title: string) => {
          const a = L.DomUtil.create('a', '', wrap) as HTMLAnchorElement
          a.href  = '#'
          a.title = title
          a.style.cssText = [
            'display:flex', 'align-items:center', 'justify-content:center',
            'width:30px', 'height:30px', 'cursor:pointer',
            'font-size:8px', 'font-weight:700', 'letter-spacing:0.04em',
            'text-decoration:none', 'line-height:1',
            mode === key
              ? 'background:#1d4ed8;color:white;'
              : 'background:white;color:#475569;',
          ].join(';')
          a.textContent = label
          L.DomEvent.on(a, 'click', (e: Event) => {
            L.DomEvent.preventDefault(e)
            L.DomEvent.stopPropagation(e)
            onSet(key)
          })
        }

        makeBtn('OSM',   'osm',   'OpenStreetMap')
        makeBtn('CARTO', 'carto', 'CartoDB light map')
        return wrap
      },
      onRemove() {},
    })
    const ctrl = new Ctrl({ position: 'topleft' })
    ctrl.addTo(map)
    return () => { ctrl.remove() }
  }, [map, mode, onSet])
  return null
}

// Bangladesh geographic center
const BD_CENTER: LatLngExpression = [23.685, 90.356]
const BD_DEFAULT_ZOOM = 7

interface Props {
  center?:   LatLngExpression
  zoom?:     number
  height?:   number | string
  style?:    React.CSSProperties
  children?: ReactNode
  minZoom?:  number
  maxZoom?:  number
}

export default function BaseMap({
  center   = BD_CENTER,
  zoom     = BD_DEFAULT_ZOOM,
  height   = '100%',
  style,
  minZoom  = 5,
  maxZoom  = 18,
  children,
}: Props) {
  const [tileMode, setTileMode] = useState<TileMode>('osm')

  return (
    <div style={{ height, width: '100%', position: 'relative', ...style }}>
      <style>{`
        .leaflet-container:-webkit-full-screen { width: 100% !important; height: 100% !important; }
        .leaflet-container:fullscreen           { width: 100% !important; height: 100% !important; }
        *:-webkit-full-screen .leaflet-container { width: 100% !important; height: 100% !important; }
        *:fullscreen .leaflet-container          { width: 100% !important; height: 100% !important; }
        ${tileMode === 'carto' ? '.leaflet-tile-pane { filter: saturate(1.8); }' : ''}
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        style={{ height: '100%', width: '100%' }}
        maxBounds={[[20.0, 87.0], [27.0, 93.5]]}
        maxBoundsViscosity={0.8}
      >
        <InvalidateSize />
        <FullscreenControl />
        <TileModeControl mode={tileMode} onSet={setTileMode} />

        {tileMode === 'carto' && (
          <TileLayer
            key="carto"
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
        )}
        {tileMode === 'local' && (
          <TileLayer
            key="local"
            url="http://localhost:8090/styles/osm-nolabels/{z}/{x}/{y}.png"
            attribution='Local TileServer &copy; OpenMapTiles &copy; OpenStreetMap contributors'
            maxZoom={18}
          />
        )}
        {tileMode === 'osm' && (
          <TileLayer
            key="osm"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        <BangladeshOverlay />
        {children}
      </MapContainer>
    </div>
  )
}
