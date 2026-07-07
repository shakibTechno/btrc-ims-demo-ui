import { useState, useCallback } from 'react'
import type { FiberSegment, ReportFilters, OperatorKey, AdminLevel } from '@/types/fiberReport'
import {
  filterBTCL,
  filterBanglalink,
  filterBahon,
  filterBRFiber,
  filterIS3,
  filterOprLines,
  type AreaSel,
} from '@/utils/fiberReportFilter'
import { geometryBBox, type Geometry } from '@/utils/geo'

type GeoFeature = { properties: Record<string, unknown>; geometry: Geometry | null }
type GeoJSON    = { features: GeoFeature[] }

const cache: Record<string, GeoJSON> = {}

async function loadGeoJSON(url: string): Promise<GeoJSON> {
  if (cache[url]) return cache[url]
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  cache[url] = await res.json()
  return cache[url]
}

const DATA: Record<OperatorKey, string> = {
  btcl:       '/data/fiber-lines.geojson',
  banglalink: '/data/bl-lines.geojson',
  bahon:      '/data/bahon-lines.geojson',
  brfiber:    '/data/br-fiber-lines.geojson',
  is3:        '/data/is3-lines.geojson',
  oprlines:   '/data/opr-lines.geojson',
}

const BOUNDARY: Record<AdminLevel, string> = {
  division: '/data/bd-divisions.geojson',
  district: '/data/bd-districts.geojson',
  upazila:  '/data/bd-upazilas.geojson',
}
const NAME_FIELD: Record<AdminLevel, string> = {
  division: 'name',
  district: 'name',
  upazila:  'thana_name',
}

// Find the boundary polygon for a named area and precompute its bbox.
async function findAreaSel(level: AdminLevel, area: string): Promise<AreaSel | null> {
  if (!area) return null
  const geo   = await loadGeoJSON(BOUNDARY[level])
  const field = NAME_FIELD[level]
  const feat  = geo.features.find(
    f => String(f.properties[field] ?? '').toLowerCase() === area.toLowerCase()
  )
  if (!feat?.geometry) return null
  return { geo: feat.geometry, bbox: geometryBBox(feat.geometry) }
}

interface UseFiberReportResult {
  results:    FiberSegment[]
  loading:    boolean
  error:      string | null
  generate:   (filters: ReportFilters) => Promise<void>
  clear:      () => void
}

export function useFiberReport(): UseFiberReportResult {
  const [results, setResults] = useState<FiberSegment[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const generate = useCallback(async (filters: ReportFilters) => {
    const { level, origin, destination, operators, matchMode } = filters
    const endpointsOnly = matchMode === 'endpoints'
    // Single-point filtering: at least one of origin/destination is enough.
    if ((!origin && !destination) || operators.size === 0) return

    setLoading(true)
    setError(null)

    try {
      const keys = [...operators] as OperatorKey[]
      const [loaded, originSel, destSel] = await Promise.all([
        Promise.all(keys.map(k => loadGeoJSON(DATA[k]).then(g => ({ key: k, features: g.features })))),
        findAreaSel(level, origin),
        findAreaSel(level, destination),
      ])

      const segments: FiberSegment[] = []

      for (const { key, features } of loaded) {
        switch (key) {
          case 'btcl':
            segments.push(...filterBTCL(features, originSel, destSel, endpointsOnly))
            break
          case 'banglalink':
            segments.push(...filterBanglalink(features, originSel, destSel, endpointsOnly))
            break
          case 'bahon':
            segments.push(...filterBahon(features, originSel, destSel, endpointsOnly))
            break
          case 'brfiber':
            segments.push(...filterBRFiber(features, originSel, destSel, endpointsOnly))
            break
          case 'is3':
            segments.push(...filterIS3(features, originSel, destSel, endpointsOnly))
            break
          case 'oprlines':
            segments.push(...filterOprLines(features, originSel, destSel, endpointsOnly))
            break
        }
      }

      // Sort: both > origin > destination
      const order: Record<FiberSegment['matchSide'], number> = {
        both: 0, origin: 1, destination: 2, all: 3,
      }
      segments.sort((a, b) => order[a.matchSide] - order[b.matchSide])

      setResults(segments)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, loading, error, generate, clear }
}

// ─── Admin options loader ─────────────────────────────────────────
const adminCache: Record<string, string[]> = {}

export async function loadAdminOptions(level: AdminLevel): Promise<string[]> {
  if (adminCache[level]) return adminCache[level]

  const urls: Record<AdminLevel, string> = {
    division: '/data/bd-divisions.geojson',
    district: '/data/bd-districts.geojson',
    upazila:  '/data/bd-upazilas.geojson',
  }
  const nameField: Record<AdminLevel, string> = {
    division: 'name',
    district: 'name',
    upazila:  'thana_name',
  }

  const res = await fetch(urls[level])
  const geo: GeoJSON = await res.json()
  const field = nameField[level]
  const names = [...new Set(
    geo.features
      .map(f => String(f.properties[field] ?? ''))
      .filter(Boolean)
  )].sort()

  adminCache[level] = names
  return names
}
