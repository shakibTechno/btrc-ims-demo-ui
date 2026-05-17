// ─── GPSitesOverlay ───────────────────────────────────────────────
// 23,864 Grameenphone BTS sites coloured by backhaul type.
// Fiber Connected (8,971) → blue   MW connected (14,893) → amber

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

export type GPTxType    = 'Fiber' | 'MW'
export type GPTxFilter  = Set<GPTxType>

export const GP_TX_COLORS: Record<GPTxType, string> = {
  Fiber: '#2563eb',
  MW:    '#f59e0b',
}

const GP_TX_LABELS: Record<GPTxType, string> = {
  Fiber: 'Fiber Connected',
  MW:    'MW Connected',
}

interface Props {
  visible:   boolean
  txFilter:  GPTxFilter
}

export default function GPSitesOverlay({ visible, txFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || data) return
    fetch('/data/gp-sites.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('GPSitesOverlay: fetch failed', err))
  }, [visible, data])

  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f => txFilter.has(f.properties?.tx as GPTxType)),
    }
  }, [data, txFilter])

  const filterKey = [...txFilter].sort().join(',')

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng): L.Layer => {
    const tx = _feat.properties?.tx as GPTxType
    return L.circleMarker(latlng, {
      radius:      2.5,
      fillColor:   GP_TX_COLORS[tx] ?? '#94a3b8',
      color:       'white',
      weight:      0.5,
      fillOpacity: 0.85,
      renderer,
    })
  }, [renderer])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p     = feat.properties ?? {}
    const tx    = p.tx as GPTxType
    const color = GP_TX_COLORS[tx] ?? '#94a3b8'
    const label = GP_TX_LABELS[tx] ?? tx
    const name  = String(p.name ?? '—')
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                  min-width:180px;max-width:280px;">
        <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px;
                    word-break:break-word;">${name}</div>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                     font-size:10px;font-weight:700;
                     background:${color}18;border:1px solid ${color}44;color:${color};">
          ${label}
        </span>
      </div>`, { maxWidth: 300, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${name}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`gp-sites-${filterKey}`}
      data={filtered}
      pointToLayer={pointToLayer}
      onEachFeature={onEach}
    />
  )
}
