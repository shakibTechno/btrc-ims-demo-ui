import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper   from '@/components/layout/PageWrapper'
import FilterBar     from '@/components/filters/FilterBar'
import DataTable, { type Column } from '@/components/shared/DataTable'
import StatusBadge   from '@/components/cards/StatusBadge'
import PowerBadge    from '@/components/cards/PowerBadge'
import EmptyState    from '@/components/shared/EmptyState'
import { useFilteredSites } from '@/hooks/useFilteredSites'
import { useFilterStore }   from '@/store/filterStore'
import { OPERATOR_MAP } from '@/data/operators'
import OperatorLogo     from '@/components/cards/OperatorLogo'
import { formatTimeAgo, formatAssetType } from '@/utils/formatters'
import type { Site } from '@/types/site'

// ─── SiteDirectory ────────────────────────────────────────────────
// Searchable, sortable table of all sites.
// Filters from Zustand FilterBar + local text search.
// Clicking a row navigates to /sites/:siteId

const COLUMNS: Column<Site>[] = [
  {
    key: 'id', header: 'Site ID', width: 100, sortable: true,
    render: row => (
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569',
        background: '#f1f5f9', borderRadius: 4, padding: '2px 6px' }}>
        {row.id}
      </span>
    ),
  },
  {
    key: 'name', header: 'Site Name', sortable: true,
    render: row => (
      <span style={{ fontWeight: 500, color: '#1e293b' }}>{row.name}</span>
    ),
  },
  {
    key: 'type', header: 'Type', width: 90, sortable: true,
    render: row => (
      <span style={{ fontSize: 11, color: '#64748b',
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 4, padding: '2px 7px' }}>
        {formatAssetType(row.type)}
      </span>
    ),
  },
  {
    key: 'operatorId', header: 'Operator', width: 120, sortable: true,
    render: row => {
      const op = OPERATOR_MAP[row.operatorId]
      if (!op) return row.operatorId
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <OperatorLogo operator={op} size={20} />
          <span style={{ fontSize: 12, color: op.color, fontWeight: 600 }}>{op.shortName}</span>
        </div>
      )
    },
  },
  {
    key: 'division', header: 'Division', width: 110, sortable: true,
    render: row => <span style={{ color: '#374151' }}>{row.division}</span>,
  },
  {
    key: 'district', header: 'District', width: 120, sortable: true,
    render: row => <span style={{ color: '#374151' }}>{row.district}</span>,
  },
  {
    key: 'status', header: 'Status', width: 100, sortable: true,
    render: row => <StatusBadge status={row.status} variant="pill" size="sm" />,
  },
  {
    key: 'powerSource', header: 'Power', width: 110, sortable: true,
    render: row => <PowerBadge source={row.powerSource} />,
  },
  {
    key: 'submissionStatus', header: 'Submission', width: 100, sortable: true,
    render: row => {
      const color = row.submissionStatus === 'on_time' ? '#22c55e'
                  : row.submissionStatus === 'late'    ? '#f59e0b' : '#ef4444'
      const label = row.submissionStatus === 'on_time' ? '✓ On Time'
                  : row.submissionStatus === 'late'    ? '⚠ Late' : '✗ Missing'
      return <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    },
  },
  {
    key: 'lastSubmission', header: 'Last Seen', width: 100,
    render: row => (
      <span style={{ fontSize: 11, color: '#94a3b8' }}>
        {formatTimeAgo(row.lastSubmission)}
      </span>
    ),
  },
]

export default function SiteDirectory() {
  const navigate      = useNavigate()
  const sites         = useFilteredSites()
  const resetFilters  = useFilterStore(s => s.resetFilters)
  const [search, setSearch] = useState('')

  // Local text search across id, name, district, division
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sites
    return sites.filter(s =>
      s.id.toLowerCase().includes(q)      ||
      s.name.toLowerCase().includes(q)    ||
      s.district.toLowerCase().includes(q)||
      s.division.toLowerCase().includes(q)
    )
  }, [sites, search])

  // Status summary counts
  const counts = useMemo(() => ({
    active:   filtered.filter(s => s.status === 'active').length,
    degraded: filtered.filter(s => s.status === 'degraded').length,
    down:     filtered.filter(s => s.status === 'down').length,
  }), [filtered])

  return (
    <PageWrapper>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', marginBottom: 12, gap: 16,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
            Site Directory
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
            All monitored telecommunications infrastructure sites
          </p>
        </div>

        {/* Status summary pills */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {[
            { label: 'Active',   count: counts.active,   color: '#22c55e', bg: '#f0fdf4' },
            { label: 'Degraded', count: counts.degraded, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Down',     count: counts.down,     color: '#ef4444', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 7,
              background: s.bg, border: `1px solid ${s.color}33`,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%',
                background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.count}</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters + search row ────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 8, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <FilterBar show={{ period: false }} />

        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search ID, name, district…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              height: 32, padding: '0 10px 0 30px', fontSize: 12,
              borderRadius: 6, border: '1px solid #e2e8f0',
              background: 'white', color: '#374151', outline: 'none',
              width: 220,
            }}
          />
          <span style={{
            position: 'absolute', left: 9, top: '50%',
            transform: 'translateY(-50%)', fontSize: 13, color: '#94a3b8',
            pointerEvents: 'none',
          }}>
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 6, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 14,
                color: '#94a3b8', padding: 0, lineHeight: 1,
              }}
            >×</button>
          )}
        </div>
      </div>

      {/* ── Result count ───────────────────────────────────────── */}
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
        Showing {filtered.length} of {sites.length} sites
        {search && <span> matching "<strong style={{ color: '#475569' }}>{search}</strong>"</span>}
      </div>

      {/* ── Site table / empty state ───────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No sites match your filters"
          message={
            search
              ? `No sites found for "${search}". Try a different search term or clear your filters.`
              : 'The current filter combination returned no results. Adjust the filters above.'
          }
          action={
            <button
              onClick={() => { setSearch(''); resetFilters() }}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: '#003D7A', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              Clear all filters
            </button>
          }
        />
      ) : (
        <>
          <DataTable<Site>
            columns={COLUMNS}
            data={filtered}
            rowKey={s => s.id}
            onRowClick={s => navigate(`/sites/${s.id}`)}
            maxHeight={560}
            compact
          />
          <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
            Click any row to view site detail
          </div>
        </>
      )}
    </PageWrapper>
  )
}
