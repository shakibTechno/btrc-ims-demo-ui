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
  showOPGW?:  boolean
  showBahon?: boolean
}

export default function MapLegend({ position = 'bottomright', showFiber = false, showOPGW = false, showBahon = false }: Props) {
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

        // Mini teardrop pin previews matching the real map icons
        const PIN = (fill: string, border: string, icon: string) =>
          `<svg width="14" height="20" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg"
               style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">
             <path d="M15,40 C11,31 4,26 4,13 A11,11 0 1,1 26,13 C26,26 19,31 15,40 Z"
                   fill="${fill}" stroke="${border}" stroke-width="1.5"/>
             <path d="M9,8 Q11,5 15,7" stroke="rgba(255,255,255,0.55)"
                   stroke-width="2.5" fill="none" stroke-linecap="round"/>
             ${icon}
           </svg>`

        const TOWER_ICON = `
          <text x="15" y="20"
                text-anchor="middle"
                font-size="15"
                font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">🗼</text>`

        const BTS_ICON = `
          <line x1="15" y1="15" x2="15" y2="24" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="10" y1="15" x2="20" y2="15" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="15" cy="15" r="2" fill="white"/>
          <path d="M12,12.5 A4,4 0 0,1 18,12.5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M9.5,9.5 A7,7 0 0,1 20.5,9.5" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
          <path d="M7,6.5 A9.5,9.5 0 0,1 23,6.5" stroke="white" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.4"/>`

        const POP_ICON = `
          <circle cx="15" cy="13" r="3.8" fill="white"/>
          <line x1="15" y1="9.2" x2="15" y2="5"    stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="15" cy="4.5" r="1.5" fill="white"/>
          <line x1="17.7" y1="10.3" x2="20.5" y2="7"  stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="21" cy="6.5"  r="1.5" fill="white"/>
          <line x1="18.8" y1="13" x2="23" y2="13"   stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="23.5" cy="13" r="1.5" fill="white"/>
          <line x1="17.7" y1="15.7" x2="20.5" y2="19" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="21" cy="19.5" r="1.5" fill="white"/>
          <line x1="15" y1="16.8" x2="15" y2="22"   stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="15" cy="22.5" r="1.5" fill="white"/>
          <line x1="12.3" y1="15.7" x2="9.5" y2="19" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="9" cy="19.5"  r="1.5" fill="white"/>
          <line x1="11.2" y1="13" x2="7" y2="13"    stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="6.5" cy="13"  r="1.5" fill="white"/>
          <line x1="12.3" y1="10.3" x2="9.5" y2="7"  stroke="white" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="9" cy="6.5"   r="1.5" fill="white"/>`

        const typeRows = [
          { label: 'Tower co.', svg: PIN('#64748b', '#475569', TOWER_ICON) },
          { label: 'BTS',       svg: PIN('#64748b', '#475569', BTS_ICON)   },
          { label: 'NTTN PoP',  svg: PIN('#64748b', '#475569', POP_ICON)   },
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

        const opgwSection = showOPGW ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">OPGW</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#eab308" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#eab308" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#eab308" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">400 kV T/L</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#16a34a" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#16a34a" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">230 kV T/L</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4 3"/>
              <circle cx="2"  cy="4" r="2.5" fill="#3b82f6" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#3b82f6" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">UG Cable</span>
          </div>
        ` : ''

        const bahonSection = showBahon ? `
          <div style="margin:7px 0 5px;border-top:1px solid #f1f5f9;padding-top:6px;font-weight:700;color:#475569;font-size:9px;text-transform:uppercase;letter-spacing:0.07em;">Bahon Ltd</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="2"  cy="4" r="2.5" fill="#06b6d4" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#06b6d4" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Overhead (OH)</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <svg width="22" height="8" viewBox="0 0 22 8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#78350f" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="5 3"/>
              <circle cx="2"  cy="4" r="2.5" fill="#78350f" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="4" r="2.5" fill="#78350f" stroke="white" stroke-width="1.2"/>
            </svg>
            <span style="color:#334155">Underground (UG)</span>
          </div>
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
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:14px;flex-shrink:0;">${r.svg}</span>
              <span style="color:#334155">${r.label}</span>
            </div>
          `).join('')}
          ${fiberSection}
          ${opgwSection}
          ${bahonSection}
        `

        L.DomEvent.disableClickPropagation(div)
        return div
      },
    })

    const control = new LegendControl({ position })
    control.addTo(map)
    controlRef.current = control

    return () => { control.remove() }
  }, [map, position, showFiber, showOPGW, showBahon])

  return null
}
