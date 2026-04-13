import { useState, type ReactNode } from 'react'

// ─── Generic column definition ────────────────────────────────────
export interface Column<T extends object> {
  key:       string
  header:    string
  render?:   (row: T) => ReactNode   // if omitted, uses row[key] as string
  sortable?: boolean
  width?:    string | number
  align?:    'left' | 'center' | 'right'
}

interface Props<T extends object> {
  columns:     Column<T>[]
  data:        T[]
  rowKey:      (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  maxHeight?:  number   // enables internal scroll when set
  compact?:    boolean
}

type SortDir = 'asc' | 'desc'

export default function DataTable<T extends object>({
  columns, data, rowKey, onRowClick, emptyMessage = 'No data', maxHeight, compact,
}: Props<T>) {
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<SortDir>('asc')

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = (a as Record<string, unknown>)[sortKey] as string | number
    const bv = (b as Record<string, unknown>)[sortKey] as string | number
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const cellPad = compact ? '6px 10px' : '9px 12px'
  const fontSize = compact ? 12 : 13

  return (
    <div style={{
      overflow: maxHeight ? 'auto' : undefined,
      maxHeight: maxHeight,
      border: '1px solid #e2e8f0',
      borderRadius: 8,
    }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontSize, tableLayout: 'fixed',
      }}>
        {/* Header */}
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                style={{
                  padding: compact ? '7px 10px' : '9px 12px',
                  textAlign: col.align ?? 'left',
                  fontSize: 11, fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  width: col.width,
                  borderRight: '1px solid #f1f5f9',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.header}
                  {col.sortable && (
                    <span style={{ color: sortKey === col.key ? '#003D7A' : '#cbd5e1', fontSize: 10 }}>
                      {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, idx) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: idx < sorted.length - 1 ? '1px solid #f1f5f9' : undefined,
                  cursor: onRowClick ? 'pointer' : 'default',
                  background: 'white',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      padding: cellPad,
                      textAlign: col.align ?? 'left',
                      color: '#334155',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      borderRight: '1px solid #f8fafc',
                    }}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
