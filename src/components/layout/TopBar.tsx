import { useState, useEffect } from 'react'
import AlertBell from '@/components/alerts/AlertBell'
import { useFilterStore } from '@/store/filterStore'
import { useSiteStore }   from '@/store/siteStore'

// ─── Live clock fixed at demo reference timezone (UTC+6) ─────────
function LiveClock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
      {time.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      })} UTC+6
    </span>
  )
}

// ─── Synced-ago counter ───────────────────────────────────────────
// Resets to 0 on each simulation tick; counts up each second.
function SyncedAgo() {
  const tickCount = useSiteStore(s => s.tickCount)
  const [elapsed, setElapsed] = useState(0)

  // Reset elapsed whenever a new tick fires
  useEffect(() => {
    setElapsed(0)
  }, [tickCount])

  // Count up each second
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span style={{ fontSize: 10, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
      synced {elapsed}s ago
    </span>
  )
}

// ─── Active filter pill ───────────────────────────────────────────
function ActiveFilterBadge() {
  const hasActive    = useFilterStore(s => s.hasActiveFilters())
  const resetFilters = useFilterStore(s => s.resetFilters)

  if (!hasActive) return null

  return (
    <button
      onClick={resetFilters}
      title="Clear all filters"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 20,
        background: '#eff6ff', color: '#1d4ed8',
        border: '1px solid #bfdbfe',
        fontSize: 11, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      <span>Filters active</span>
      <span style={{ fontSize: 13, lineHeight: 1 }}>×</span>
    </button>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────
interface Props {
  title: string
}

export default function TopBar({ title }: Props) {
  return (
    <header style={{
      height: 50, minHeight: 50,
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
      gap: 12,
    }}>

      {/* Left: title + LIVE badge + synced indicator + active filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <h1 style={{
          margin: 0, fontSize: 14, fontWeight: 600,
          color: '#1e293b', whiteSpace: 'nowrap',
        }}>
          {title}
        </h1>

        {/* LIVE pulsing indicator */}
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 10, fontWeight: 700, padding: '2px 7px',
          borderRadius: 9999, background: '#f0fdf4', color: '#16a34a',
          border: '1px solid #bbf7d0', letterSpacing: '0.05em',
          flexShrink: 0,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 0 0 rgba(22,163,74,0.6)',
            animation: 'livePulse 2s infinite',
          }} />
          LIVE
        </span>

        <SyncedAgo />
        <ActiveFilterBadge />
      </div>

      {/* Right: clock + alert bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <LiveClock />
        <div style={{ width: 1, height: 18, background: '#e2e8f0' }} />
        <AlertBell />
      </div>

      {/* Pulse keyframe injected once */}
      <style>{`
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(22,163,74,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(22,163,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
        }
      `}</style>
    </header>
  )
}
