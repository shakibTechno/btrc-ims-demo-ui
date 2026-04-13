import { useMap } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { STATUS_COLORS } from '@/utils/statusColors'

// ─── MapLegend ────────────────────────────────────────────────────
// Leaflet Control injected via useEffect.
// Shows site status colors + asset type shapes.

interface Props {
  position?:  'bottomright' | 'bottomleft' | 'topright' | 'topleft'
  showFiber?: boolean
}

export default function MapLegend({ position = 'bottomright', showFiber = false }: Props) {
  const map        = useMap()
  const controlRef = useRef<L.Control | null>(null)

  useEffect(() => {
    const LegendControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create('div')
        div.style.cssText = [
          'background:rgba(255,255,255,0.95)',
          'backdrop-filter:blur(4px)',
          'border:1px solid #e2e8f0',
          'border-radius:8px',
          'padding:9px 11px',
          'font:11px/1.5 system-ui,sans-serif',
          'box-shadow:0 2px 10px rgba(0,0,0,0.12)',
          'min-width:110px',
        ].join(';')

        const statusRows = [
          { label: 'Active',    hex: STATUS_COLORS.active.hex },
          { label: 'Degraded',  hex: STATUS_COLORS.degraded.hex },
          { label: 'Down',      hex: STATUS_COLORS.down.hex },
        ]

        const typeRows = [
          { label: 'Tower co.', svg: `<svg width="10" height="9" viewBox="0 0 10 9"><polygon points="5,0.5 9.5,8.5 0.5,8.5" fill="#64748b"/></svg>` },
          { label: 'BTS',       svg: `<svg width="9" height="9" viewBox="0 0 9 9"><circle cx="4.5" cy="4.5" r="4" fill="#64748b"/></svg>` },
          { label: 'NTTN PoP',  svg: `<svg width="9" height="9" viewBox="0 0 9 9"><rect x="1" y="1" width="7" height="7" rx="0.5" fill="#64748b" transform="rotate(45 4.5 4.5)"/></svg>` },
        ]

        const fiberRows = [
          { label: 'Active',   color: '#3b82f6', dash: false },
          { label: 'Degraded', color: '#f59e0b', dash: true  },
          { label: 'Cut',      color: '#ef4444', dash: true  },
        ]

        const fiberSection = showFiber ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Fiber</div>
          ${fiberRows.map(r => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <svg width="18" height="6" viewBox="0 0 18 6">
                <line x1="0" y1="3" x2="18" y2="3"
                  stroke="${r.color}" stroke-width="2" stroke-linecap="round"
                  ${r.dash ? 'stroke-dasharray="4 3"' : ''}/>
              </svg>
              <span style="color:#334155">${r.label}</span>
            </div>
          `).join('')}
        ` : ''

        div.innerHTML = `
          <div style="font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;">Status</div>
          ${statusRows.map(r => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${r.hex};flex-shrink:0;"></span>
              <span style="color:#334155">${r.label}</span>
            </div>
          `).join('')}
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Type</div>
          ${typeRows.map(r => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:12px;flex-shrink:0;">${r.svg}</span>
              <span style="color:#334155">${r.label}</span>
            </div>
          `).join('')}
          ${fiberSection}
        `

        L.DomEvent.disableClickPropagation(div)
        return div
      },
    })

    const control = new LegendControl({ position })
    control.addTo(map)
    controlRef.current = control

    return () => { control.remove() }
  }, [map, position, showFiber])

  return null
}
