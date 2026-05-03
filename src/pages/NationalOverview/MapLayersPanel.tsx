import { useState } from 'react'
import type { AssetType } from '@/types/site'

interface Props {
  mapView:        'division' | 'district' | null
  setMapView:     (v: 'division' | 'district' | null) => void
  showHeatmap:    boolean
  onToggleHeatmap:() => void
  visibleTypes:   Set<AssetType>
  onToggleAsset:  (t: AssetType) => void
  showOPGW:            boolean
  onToggleOPGW:        () => void
  opgwFilters:         Set<string>
  onToggleOpgwFilter:  (key: string) => void
  showBahon:           boolean
  onToggleBahon:       () => void
  bahonFilters:        Set<string>
  onToggleBahonFilter: (key: string) => void
  showIS3:             boolean
  onToggleIS3:         () => void
  is3LineFilters:      Set<string>
  onToggleIS3Line:     (key: string) => void
  showIS3Nodes:        boolean
  onToggleIS3Nodes:    () => void
  showFHLFON:           boolean
  onToggleFHLFON:       () => void
  fhlfonLineFilters:    Set<string>
  onToggleFhlfonLine:   (key: string) => void
  fhlfonPointFilters:   Set<string>
  onToggleFhlfonPoint:  (key: string) => void
  onReset:              () => void
}

// ── small helpers ─────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 5,
    }}>
      {children}
    </div>
  )
}

function SubLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.06em', color: '#cbd5e1', marginBottom: 3, marginTop: 4,
    }}>
      {children}
    </div>
  )
}

interface ToggleBtnProps {
  on:       boolean
  onClick:  () => void
  label:    string
  emoji?:   string
  activeColor?: { border: string; bg: string; text: string }
}
function ToggleBtn({ on, onClick, label, emoji, activeColor }: ToggleBtnProps) {
  const ac = activeColor ?? { border: '#64748b', bg: '#f1f5f9', text: '#334155' }
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 5, width: '100%', padding: '3px 7px', borderRadius: 4,
        cursor: 'pointer', fontSize: 10.5, fontWeight: 600,
        border: on ? `1px solid ${ac.border}` : '1px solid #e2e8f0',
        background: on ? ac.bg : 'white',
        color: on ? ac.text : '#94a3b8',
        transition: 'all 0.13s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {emoji && <span style={{ fontSize: 12, lineHeight: 1 }}>{emoji}</span>}
        {label}
      </span>
      <span style={{ fontSize: 9, opacity: on ? 0.65 : 0.45 }}>
        {on ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

interface CheckItemProps {
  checked:  boolean
  onClick:  () => void
  label:    string
  dotColor?: string
  disabled?: boolean
}
function CheckItem({ checked, onClick, label, dotColor, disabled }: CheckItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '2px 6px', borderRadius: 3, cursor: disabled ? 'default' : 'pointer',
        border: checked ? '1px solid #cbd5e1' : '1px solid #f1f5f9',
        background: checked ? '#f8fafc' : 'white',
        color: checked ? '#334155' : '#94a3b8',
        fontSize: 10, fontWeight: 600,
        transition: 'all 0.12s', width: '100%', textAlign: 'left',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <span style={{
        width: 11, height: 11, borderRadius: 3, flexShrink: 0,
        border: checked ? '1.5px solid #3b82f6' : '1.5px solid #cbd5e1',
        background: checked ? '#3b82f6' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s',
      }}>
        {checked && (
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
            <polyline points="2,5 4,7 8,3" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {dotColor && (
        <span style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: dotColor, opacity: checked ? 1 : 0.35,
        }} />
      )}
      {label}
    </button>
  )
}

// ── Icons ─────────────────────────────────────────────────────────

function IconLayers() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

// ── Main panel ────────────────────────────────────────────────────

export default function MapLayersPanel({
  mapView, setMapView,
  showHeatmap, onToggleHeatmap,
  visibleTypes, onToggleAsset,
  showOPGW, onToggleOPGW, opgwFilters, onToggleOpgwFilter,
  showBahon, onToggleBahon, bahonFilters, onToggleBahonFilter,
  showIS3, onToggleIS3, is3LineFilters, onToggleIS3Line, showIS3Nodes, onToggleIS3Nodes,
  showFHLFON, onToggleFHLFON, fhlfonLineFilters, onToggleFhlfonLine,
  fhlfonPointFilters, onToggleFhlfonPoint,
  onReset,
}: Props) {
  const [collapsed, setCollapsed] = useState(true)

  const activeCount = [
    showHeatmap,
    visibleTypes.has('tower'), visibleTypes.has('bts'), visibleTypes.has('nttn_pop'),
    showOPGW, showBahon, showIS3, showFHLFON,
  ].filter(Boolean).length

  // ── Collapsed strip ───────────────────────────────────────────
  if (collapsed) {
    return (
      <div style={{
        width: 44, minWidth: 44,
        background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 0', gap: 8,
      }}>
        {/* Layers icon */}
        <div style={{ color: '#475569' }}>
          <IconLayers />
        </div>

        {/* Active count badge */}
        {activeCount > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 9999,
            background: '#1d4ed8', color: 'white', lineHeight: 1.4,
          }}>
            {activeCount}
          </span>
        )}

        {/* Expand button */}
        <button
          onClick={() => setCollapsed(false)}
          title="Expand map layers"
          style={{
            width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid #e2e8f0',
            borderRadius: 5, cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.color = '#334155'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          {/* Chevron left — open panel */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    )
  }

  // ── Expanded panel ────────────────────────────────────────────
  return (
    <div style={{
      width: 210, minWidth: 210,
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: '#475569' }}><IconLayers /></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#334155',
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Map Layers
          </span>
          {activeCount > 0 && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 9999,
              background: '#1d4ed8', color: 'white',
            }}>
              {activeCount}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Reset button */}
          {activeCount > 0 && (
            <button
              onClick={onReset}
              title="Reset all layers"
              style={{
                width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid #e2e8f0',
                borderRadius: 5, cursor: 'pointer',
                color: '#94a3b8',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fef2f2'
                e.currentTarget.style.color = '#ef4444'
                e.currentTarget.style.borderColor = '#fca5a5'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse map layers"
            style={{
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid #e2e8f0',
              borderRadius: 5, cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.color = '#334155'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>

        {/* Boundaries */}
        <div>
          <SectionLabel>Boundaries</SectionLabel>
          <div style={{
            display: 'flex', borderRadius: 5, overflow: 'hidden',
            border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600,
          }}>
            {(['division', 'district'] as const).map(v => (
              <button key={v} onClick={() => setMapView(mapView === v ? null : v)} style={{
                flex: 1, padding: '4px 0', cursor: 'pointer', border: 'none',
                background: mapView === v ? '#1d4ed8' : 'white',
                color: mapView === v ? 'white' : '#64748b',
                textTransform: 'capitalize', transition: 'all 0.13s',
              }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Status heatmap */}
        <div>
          <SectionLabel>Status</SectionLabel>
          <ToggleBtn
            on={showHeatmap} onClick={onToggleHeatmap} label="Heatmap"
            emoji="🌡"
            activeColor={{ border: '#16a34a', bg: '#f0fdf4', text: '#15803d' }}
          />
        </div>

        {/* Site markers */}
        <div>
          <SectionLabel>Site Markers</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {([
              { type: 'tower'    as AssetType, label: 'Tower', emoji: '🗼' },
              { type: 'bts'      as AssetType, label: 'BTS',   emoji: '📡' },
              { type: 'nttn_pop' as AssetType, label: 'PoP',   emoji: '🌐' },
            ]).map(({ type, label, emoji }) => (
              <ToggleBtn
                key={type}
                on={visibleTypes.has(type)}
                onClick={() => onToggleAsset(type)}
                label={label} emoji={emoji}
              />
            ))}
          </div>
        </div>

        {/* Fiber networks */}
        <div>
          <SectionLabel>Fiber Networks</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

            {/* PGCB — toggle + sub-filters */}
            <div>
              <ToggleBtn on={showOPGW} onClick={onToggleOPGW} label="PGCB"
                activeColor={{ border: '#ca8a04', bg: '#fefce8', text: '#854d0e' }} />
              {showOPGW && (
                <div style={{
                  marginTop: 4, padding: '5px 7px',
                  background: '#f8fafc', borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  <CheckItem checked={opgwFilters.has('400kV')} onClick={() => onToggleOpgwFilter('400kV')} label="400 kV T/L" dotColor="#dc2626" />
                  <CheckItem checked={opgwFilters.has('230kV')} onClick={() => onToggleOpgwFilter('230kV')} label="230 kV T/L" dotColor="#16a34a" />
                  <CheckItem checked={opgwFilters.has('132kV')} onClick={() => onToggleOpgwFilter('132kV')} label="132 kV T/L" dotColor="#f97316" />
                  <CheckItem checked={opgwFilters.has('UG')}    onClick={() => onToggleOpgwFilter('UG')}    label="UG Cable"   dotColor="#3b82f6" />
                  <CheckItem checked={opgwFilters.has('other')} onClick={() => onToggleOpgwFilter('other')} label="Others"     dotColor="#eab308" />
                </div>
              )}
            </div>

            {/* Bahon — toggle + sub-filters */}
            <div>
              <ToggleBtn on={showBahon} onClick={onToggleBahon} label="Bahon"
                activeColor={{ border: '#06b6d4', bg: '#ecfeff', text: '#0e7490' }} />
              {showBahon && (
                <div style={{
                  marginTop: 4, padding: '5px 7px',
                  background: '#f8fafc', borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  <CheckItem checked={bahonFilters.has('OH')}   onClick={() => onToggleBahonFilter('OH')}   label="Overhead"     dotColor="#dc2626" />
                  <CheckItem checked={bahonFilters.has('UG')}   onClick={() => onToggleBahonFilter('UG')}   label="Underground"  dotColor="#78350f" />
                  <CheckItem checked={bahonFilters.has('WC')}   onClick={() => onToggleBahonFilter('WC')}   label="Wall Clamped" dotColor="#d97706" />
                  <CheckItem checked={bahonFilters.has('node')} onClick={() => onToggleBahonFilter('node')} label="Network Node" dotColor="#16a34a" />
                </div>
              )}
            </div>

            {/* InfoSarkar-3 — toggle + sub-filters */}
            <div>
              <ToggleBtn on={showIS3} onClick={onToggleIS3} label="InfoSarkar-3"
                activeColor={{ border: '#7c3aed', bg: '#f5f3ff', text: '#5b21b6' }} />
              {showIS3 && (
                <div style={{
                  marginTop: 4, padding: '5px 7px',
                  background: '#f8fafc', borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  <SubLabel>Lines</SubLabel>
                  <CheckItem checked={is3LineFilters.has('48')}   onClick={() => onToggleIS3Line('48')}   label="48 Core"    dotColor="#dc2626" />
                  <CheckItem checked={is3LineFilters.has('24')}   onClick={() => onToggleIS3Line('24')}   label="24 Core"    dotColor="#0d9488" />
                  <CheckItem checked={is3LineFilters.has('12')}   onClick={() => onToggleIS3Line('12')}   label="12 Core"    dotColor="#ca8a04" />
                  <CheckItem checked={is3LineFilters.has('msg')}  onClick={() => onToggleIS3Line('msg')}  label="Messenger"  dotColor="#c026d3" />
                  <CheckItem checked={is3LineFilters.has('ring')} onClick={() => onToggleIS3Line('ring')} label="Ring"       dotColor="#16a34a" />
                  <CheckItem checked={is3LineFilters.has('cbd')}  onClick={() => onToggleIS3Line('cbd')}  label="CBD"        dotColor="#4f46e5" />
                  <SubLabel>Nodes</SubLabel>
                  <CheckItem checked={showIS3Nodes} onClick={onToggleIS3Nodes} label="Network Nodes" dotColor="#7c3aed" />
                </div>
              )}
            </div>

            {/* Fiber@Home — toggle + sub-filters */}
            <div>
              <ToggleBtn on={showFHLFON} onClick={onToggleFHLFON} label="Fiber@Home"
                activeColor={{ border: '#4338ca', bg: '#eef2ff', text: '#3730a3' }} />
              {showFHLFON && (
                <div style={{
                  marginTop: 4, padding: '5px 7px',
                  background: '#f8fafc', borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  <SubLabel>Lines</SubLabel>
                  <CheckItem checked={fhlfonLineFilters.has('Aerial')} onClick={() => onToggleFhlfonLine('Aerial')} label="Aerial" dotColor="#4338ca" />
                  <CheckItem checked={fhlfonLineFilters.has('Burial')} onClick={() => onToggleFhlfonLine('Burial')} label="Burial" dotColor="#fbbf24" />
                  <SubLabel>Points</SubLabel>
                  <CheckItem checked={fhlfonPointFilters.has('CO')}  onClick={() => onToggleFhlfonPoint('CO')}  label="CO"  dotColor="#1e1b4b" />
                  <CheckItem checked={fhlfonPointFilters.has('BTS')} onClick={() => onToggleFhlfonPoint('BTS')} label="BTS" dotColor="#4338ca" />
                  <CheckItem checked={fhlfonPointFilters.has('FDH')} onClick={() => onToggleFhlfonPoint('FDH')} label="FDH" dotColor="#818cf8" />
                  <CheckItem checked={fhlfonPointFilters.has('JE')}  onClick={() => onToggleFhlfonPoint('JE')}  label="JE"  dotColor="#6366f1" />
                  <CheckItem checked={fhlfonPointFilters.has('EP')}  onClick={() => onToggleFhlfonPoint('EP')}  label="EP"  dotColor="#a5b4fc" />
                  <CheckItem checked={fhlfonPointFilters.has('FAT')} onClick={() => onToggleFhlfonPoint('FAT')} label="FAT" dotColor="#c7d2fe" />
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
