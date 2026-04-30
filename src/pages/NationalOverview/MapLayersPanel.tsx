import { useState } from 'react'
import type { AssetType } from '@/types/site'

interface Props {
  mapView:        'division' | 'district'
  setMapView:     (v: 'division' | 'district') => void
  showHeatmap:    boolean
  onToggleHeatmap:() => void
  visibleTypes:   Set<AssetType>
  onToggleAsset:  (t: AssetType) => void
  showOPGW:       boolean
  onToggleOPGW:   () => void
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
        gap: 5, width: '100%', padding: '4px 8px', borderRadius: 5,
        cursor: 'pointer', fontSize: 11, fontWeight: 600,
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
        padding: '3px 6px', borderRadius: 4, cursor: disabled ? 'default' : 'pointer',
        border: checked ? '1px solid #cbd5e1' : '1px solid #f1f5f9',
        background: checked ? '#f8fafc' : 'white',
        color: checked ? '#334155' : '#94a3b8',
        fontSize: 10, fontWeight: 600,
        transition: 'all 0.12s', width: '100%', textAlign: 'left',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {/* checkbox */}
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
      {/* colour dot */}
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

// ── Main panel ────────────────────────────────────────────────────

export default function MapLayersPanel({
  mapView, setMapView,
  showHeatmap, onToggleHeatmap,
  visibleTypes, onToggleAsset,
  showOPGW, onToggleOPGW,
  showBahon, onToggleBahon, bahonFilters, onToggleBahonFilter,
  showIS3, onToggleIS3, is3LineFilters, onToggleIS3Line, showIS3Nodes, onToggleIS3Nodes,
  showFHLFON, onToggleFHLFON, fhlfonLineFilters, onToggleFhlfonLine,
  fhlfonPointFilters, onToggleFhlfonPoint,
}: Props) {
  const [expanded, setExpanded] = useState(true)

  const activeCount = [
    showHeatmap,
    visibleTypes.has('tower'), visibleTypes.has('bts'), visibleTypes.has('nttn_pop'),
    showOPGW, showBahon, showIS3, showFHLFON,
  ].filter(Boolean).length

  return (
    <div style={{
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '8px 12px',
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? '1px solid #f1f5f9' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
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
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Body */}
      {expanded && (
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Boundaries */}
          <div>
            <SectionLabel>Boundaries</SectionLabel>
            <div style={{
              display: 'flex', borderRadius: 5, overflow: 'hidden',
              border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600,
            }}>
              {(['division', 'district'] as const).map(v => (
                <button key={v} onClick={() => setMapView(v)} style={{
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
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

              {/* OPGW — simple toggle */}
              <ToggleBtn on={showOPGW} onClick={onToggleOPGW} label="OPGW"
                activeColor={{ border: '#ca8a04', bg: '#fefce8', text: '#854d0e' }} />

              {/* Bahon — toggle + sub-filters */}
              <div>
                <ToggleBtn on={showBahon} onClick={onToggleBahon} label="Bahon"
                  activeColor={{ border: '#06b6d4', bg: '#ecfeff', text: '#0e7490' }} />
                {showBahon && (
                  <div style={{
                    marginTop: 5, padding: '6px 8px',
                    background: '#f8fafc', borderRadius: 5,
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      <CheckItem
                        checked={bahonFilters.has('OH')} onClick={() => onToggleBahonFilter('OH')}
                        label="Overhead" dotColor="#06b6d4"
                      />
                      <CheckItem
                        checked={bahonFilters.has('UG')} onClick={() => onToggleBahonFilter('UG')}
                        label="Underground" dotColor="#78350f"
                      />
                      <CheckItem
                        checked={bahonFilters.has('WC')} onClick={() => onToggleBahonFilter('WC')}
                        label="Wall Clamped" dotColor="#d97706"
                      />
                      <CheckItem
                        checked={bahonFilters.has('node')} onClick={() => onToggleBahonFilter('node')}
                        label="Network Node" dotColor="#06b6d4"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* IS3 FHL — toggle + sub-filters */}
              <div>
                <ToggleBtn on={showIS3} onClick={onToggleIS3} label="IS3 FHL"
                  activeColor={{ border: '#7c3aed', bg: '#f5f3ff', text: '#5b21b6' }} />
                {showIS3 && (
                  <div style={{
                    marginTop: 5, padding: '6px 8px',
                    background: '#f8fafc', borderRadius: 5,
                    border: '1px solid #e2e8f0',
                  }}>
                    <SubLabel>Lines</SubLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 4 }}>
                      <CheckItem checked={is3LineFilters.has('48')}   onClick={() => onToggleIS3Line('48')}   label="48 Core" dotColor="#dc2626" />
                      <CheckItem checked={is3LineFilters.has('24')}   onClick={() => onToggleIS3Line('24')}   label="24 Core" dotColor="#0d9488" />
                      <CheckItem checked={is3LineFilters.has('12')}   onClick={() => onToggleIS3Line('12')}   label="12 Core" dotColor="#ca8a04" />
                      <CheckItem checked={is3LineFilters.has('msg')}  onClick={() => onToggleIS3Line('msg')}  label="Messenger" dotColor="#c026d3" />
                      <CheckItem checked={is3LineFilters.has('ring')} onClick={() => onToggleIS3Line('ring')} label="Ring" dotColor="#16a34a" />
                      <CheckItem checked={is3LineFilters.has('cbd')}  onClick={() => onToggleIS3Line('cbd')}  label="CBD" dotColor="#4f46e5" />
                    </div>
                    <SubLabel>Nodes</SubLabel>
                    <CheckItem checked={showIS3Nodes} onClick={onToggleIS3Nodes} label="Network Nodes" dotColor="#7c3aed" />
                  </div>
                )}
              </div>

              {/* FHLFON — toggle + sub-filters */}
              <div>
                <ToggleBtn on={showFHLFON} onClick={onToggleFHLFON} label="FHLFON"
                  activeColor={{ border: '#4338ca', bg: '#eef2ff', text: '#3730a3' }} />
                {showFHLFON && (
                  <div style={{
                    marginTop: 5, padding: '6px 8px',
                    background: '#f8fafc', borderRadius: 5,
                    border: '1px solid #e2e8f0',
                  }}>
                    <SubLabel>Lines</SubLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 4 }}>
                      <CheckItem
                        checked={fhlfonLineFilters.has('Aerial')} onClick={() => onToggleFhlfonLine('Aerial')}
                        label="Aerial" dotColor="#4338ca"
                      />
                      <CheckItem
                        checked={fhlfonLineFilters.has('Burial')} onClick={() => onToggleFhlfonLine('Burial')}
                        label="Burial" dotColor="#4338ca"
                      />
                      <CheckItem
                        checked={fhlfonLineFilters.has('OPGW')} onClick={() => onToggleFhlfonLine('OPGW')}
                        label="OPGW" dotColor="#7c3aed"
                      />
                    </div>
                    <SubLabel>Points</SubLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                      <CheckItem
                        checked={fhlfonPointFilters.has('CO')} onClick={() => onToggleFhlfonPoint('CO')}
                        label="CO" dotColor="#1e1b4b"
                      />
                      <CheckItem
                        checked={fhlfonPointFilters.has('BTS')} onClick={() => onToggleFhlfonPoint('BTS')}
                        label="BTS" dotColor="#4338ca"
                      />
                      <CheckItem
                        checked={fhlfonPointFilters.has('FDH')} onClick={() => onToggleFhlfonPoint('FDH')}
                        label="FDH" dotColor="#818cf8"
                      />
                      <CheckItem
                        checked={fhlfonPointFilters.has('JE')} onClick={() => onToggleFhlfonPoint('JE')}
                        label="JE" dotColor="#6366f1"
                      />
                      <CheckItem
                        checked={fhlfonPointFilters.has('EP')} onClick={() => onToggleFhlfonPoint('EP')}
                        label="EP" dotColor="#a5b4fc"
                      />
                      <CheckItem
                        checked={fhlfonPointFilters.has('FAT')} onClick={() => onToggleFhlfonPoint('FAT')}
                        label="FAT" dotColor="#c7d2fe"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  )
}
