import { useFilterStore } from '@/store/filterStore'
import { OPERATORS } from '@/data/operators'
import type { OperatorType } from '@/types/operator'

const SELECT_STYLE: React.CSSProperties = {
  height: 32, padding: '0 8px', fontSize: 12, borderRadius: 6,
  border: '1px solid #e2e8f0', background: 'white', color: '#374151',
  cursor: 'pointer', outline: 'none', minWidth: 120,
}

const TYPE_LABELS: Record<OperatorType, string> = {
  mno:          'MNO',
  nttn:         'NTTN',
  tower_company: 'Tower Co.',
}

export default function OperatorSelect() {
  const operatorType    = useFilterStore(s => s.operatorType)
  const operatorId      = useFilterStore(s => s.operatorId)
  const setOperatorType = useFilterStore(s => s.setOperatorType)
  const setOperatorId   = useFilterStore(s => s.setOperatorId)

  // Filter operator list by selected type
  const filteredOps = operatorType
    ? OPERATORS.filter(o => o.type === operatorType)
    : OPERATORS

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {/* Operator type */}
      <select
        value={operatorType ?? ''}
        onChange={e => setOperatorType((e.target.value as OperatorType) || null)}
        style={SELECT_STYLE}
        aria-label="Operator type"
      >
        <option value="">All Types</option>
        {(Object.keys(TYPE_LABELS) as OperatorType[]).map(t => (
          <option key={t} value={t}>{TYPE_LABELS[t]}</option>
        ))}
      </select>

      {/* Specific operator */}
      <select
        value={operatorId ?? ''}
        onChange={e => setOperatorId(e.target.value || null)}
        style={SELECT_STYLE}
        aria-label="Operator"
      >
        <option value="">All Operators</option>
        {filteredOps.map(o => (
          <option key={o.id} value={o.id}>{o.shortName}</option>
        ))}
      </select>
    </div>
  )
}
