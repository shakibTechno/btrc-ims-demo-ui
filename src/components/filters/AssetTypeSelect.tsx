import { useFilterStore } from '@/store/filterStore'
import type { AssetType } from '@/types/site'

const SELECT_STYLE: React.CSSProperties = {
  height: 32, padding: '0 8px', fontSize: 12, borderRadius: 6,
  border: '1px solid #e2e8f0', background: 'white', color: '#374151',
  cursor: 'pointer', outline: 'none', minWidth: 110,
}

const OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'tower',    label: 'Tower' },
  { value: 'bts',      label: 'BTS' },
  { value: 'nttn_pop', label: 'NTTN PoP' },
]

export default function AssetTypeSelect() {
  const assetType    = useFilterStore(s => s.assetType)
  const setAssetType = useFilterStore(s => s.setAssetType)

  return (
    <select
      value={assetType ?? ''}
      onChange={e => setAssetType((e.target.value as AssetType) || null)}
      style={SELECT_STYLE}
      aria-label="Asset type"
    >
      <option value="">All Assets</option>
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
