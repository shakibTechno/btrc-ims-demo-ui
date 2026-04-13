// ─── Pre-built site marker icons ─────────────────────────────────
// All 9 combinations of status × asset type built once at module load.
// Using L.divIcon (HTML-based) instead of CircleMarker so we can
// apply CSS animations for pulsing on degraded/down sites.

import L from 'leaflet'
import type { SiteStatus, AssetType } from '@/types/site'

const STATUS_COLOR: Record<SiteStatus, string> = {
  active:   '#22c55e',
  degraded: '#f59e0b',
  down:     '#ef4444',
}

// SVG shape per asset type — inline so no external file dependency
function shapeSvg(type: AssetType, color: string): string {
  const s = color
  const w = 'white'
  switch (type) {
    case 'tower':
      // Upward triangle — tower co. / passive infrastructure
      return `<svg width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg" style="display:block">
        <polygon points="8,1 15,13 1,13" fill="${s}" stroke="${w}" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>`

    case 'bts':
      // Circle — active radio base station
      return `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" style="display:block">
        <circle cx="7" cy="7" r="5.5" fill="${s}" stroke="${w}" stroke-width="1.5"/>
      </svg>`

    case 'nttn_pop':
      // Diamond (rotated square) — NTTN point of presence
      return `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" style="display:block">
        <rect x="2.5" y="2.5" width="9" height="9" rx="1" fill="${s}" stroke="${w}" stroke-width="1.5" transform="rotate(45 7 7)"/>
      </svg>`
  }
}

// Pulse ring behind the icon for non-active sites
function pulseHtml(color: string, fast: boolean): string {
  const dur = fast ? '1.2s' : '2s'
  return `<div style="
    position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%);
    width:14px;height:14px;border-radius:50%;
    background:${color};
    animation:sitePulse ${dur} ease-out infinite;
    pointer-events:none;
  "></div>`
}

function buildIcon(status: SiteStatus, type: AssetType): L.DivIcon {
  const color   = STATUS_COLOR[status]
  const pulse   = status !== 'active' ? pulseHtml(color, status === 'down') : ''
  const shape   = shapeSvg(type, color)

  return L.divIcon({
    className:   '',          // suppress leaflet's default white-box class
    iconSize:    [24, 24],
    iconAnchor:  [12, 12],
    popupAnchor: [0, -14],
    html: `<div style="
      position:relative;width:24px;height:24px;
      display:flex;align-items:center;justify-content:center;
    ">${pulse}${shape}</div>`,
  })
}

// ── Static lookup table — built once, reused per render ───────────
const STATUSES: SiteStatus[] = ['active', 'degraded', 'down']
const TYPES:    AssetType[]  = ['tower', 'bts', 'nttn_pop']

export const SITE_ICONS: Record<SiteStatus, Record<AssetType, L.DivIcon>> = Object.fromEntries(
  STATUSES.map(s => [
    s,
    Object.fromEntries(TYPES.map(t => [t, buildIcon(s, t)])) as Record<AssetType, L.DivIcon>,
  ])
) as Record<SiteStatus, Record<AssetType, L.DivIcon>>
