import { useFilterStore } from '@/store/filterStore'
import PeriodSelect   from './PeriodSelect'
import DistrictSelect from './DistrictSelect'
import OperatorSelect from './OperatorSelect'
import AssetTypeSelect from './AssetTypeSelect'

// ─── FilterBar ────────────────────────────────────────────────────
// Horizontal strip with all filter selects + reset button.
// Reads hasActiveFilters() from Zustand to show/hide reset.

interface Props {
  /** Which filter groups to show (default: all) */
  show?: {
    period?:   boolean
    location?: boolean
    operator?: boolean
    asset?:    boolean
  }
}

export default function FilterBar({ show = {} }: Props) {
  const {
    period:   showPeriod   = true,
    location: showLocation = true,
    operator: showOperator = true,
    asset:    showAsset    = true,
  } = show

  const hasActive   = useFilterStore(s => s.hasActiveFilters())
  const resetFilters = useFilterStore(s => s.resetFilters)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: 8, padding: '8px 0',
    }}>
      {showPeriod && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Period</span>
          <PeriodSelect />
        </div>
      )}

      {showPeriod && (showLocation || showOperator || showAsset) && (
        <div style={{ width: 1, height: 24, background: '#e2e8f0', flexShrink: 0 }} />
      )}

      {showLocation && <DistrictSelect />}
      {showOperator && <OperatorSelect />}
      {showAsset    && <AssetTypeSelect />}

      {hasActive && (
        <button
          onClick={resetFilters}
          style={{
            height: 32, padding: '0 10px', fontSize: 12,
            borderRadius: 6, border: '1px solid #fca5a5',
            background: '#fef2f2', color: '#dc2626',
            cursor: 'pointer', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          aria-label="Reset all filters"
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
          Reset
        </button>
      )}
    </div>
  )
}
