import { useFilterStore } from '@/store/filterStore'
import { SITES, DIVISIONS } from '@/data/sites'

const SELECT_STYLE: React.CSSProperties = {
  height: 32, padding: '0 8px', fontSize: 12, borderRadius: 6,
  border: '1px solid #e2e8f0', background: 'white', color: '#374151',
  cursor: 'pointer', outline: 'none', minWidth: 120,
}

export default function DistrictSelect() {
  const division    = useFilterStore(s => s.division)
  const district    = useFilterStore(s => s.district)
  const setDivision = useFilterStore(s => s.setDivision)
  const setDistrict = useFilterStore(s => s.setDistrict)

  // Districts available in the selected division (or all if no division)
  const districts = division
    ? [...new Set(SITES.filter(s => s.division === division).map(s => s.district))].sort()
    : [...new Set(SITES.map(s => s.district))].sort()

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {/* Division */}
      <select
        value={division ?? ''}
        onChange={e => setDivision(e.target.value || null)}
        style={SELECT_STYLE}
        aria-label="Division"
      >
        <option value="">All Divisions</option>
        {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* District — only shown when division selected */}
      {division && (
        <select
          value={district ?? ''}
          onChange={e => setDistrict(e.target.value || null)}
          style={SELECT_STYLE}
          aria-label="District"
        >
          <option value="">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
    </div>
  )
}
