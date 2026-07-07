import type { FiberSegment, OperatorKey } from '@/types/fiberReport'
import { lineTouchesArea, type Geometry, type BBox } from '@/utils/geo'

type Props = Record<string, unknown>
type Feat  = { properties: Props; geometry: Geometry | null }

// A selected admin area: its boundary geometry + precomputed bbox.
export interface AreaSel {
  geo:  Geometry
  bbox: BBox
}

function n(v: unknown): number | null {
  return typeof v === 'number' ? v : null
}
function s(v: unknown): string {
  return v == null ? '' : String(v)
}

// ─── Geo match ────────────────────────────────────────────────────
// A line is matched if a vertex falls inside a selected area. Origin
// and/or destination may be null (single-point filtering). Returns the
// matchSide label, or null when the line touches no selected area.
function matchSideFor(
  geometry: Geometry | null,
  origin: AreaSel | null,
  dest:   AreaSel | null,
  endpointsOnly: boolean,
): FiberSegment['matchSide'] | null {
  if (!geometry) return null
  const inO = origin ? lineTouchesArea(geometry, origin.geo, origin.bbox, endpointsOnly) : false
  const inD = dest   ? lineTouchesArea(geometry, dest.geo,   dest.bbox,   endpointsOnly) : false

  if (origin && dest) {
    if (inO && inD) return 'both'
    if (inO)        return 'origin'
    if (inD)        return 'destination'
    return null
  }
  if (origin) return inO ? 'origin' : null
  if (dest)   return inD ? 'destination' : null
  return null
}

// ─── BTCL (fiber-lines.geojson) ───────────────────────────────────
export function filterBTCL(features: Feat[], origin: AreaSel | null, dest: AreaSel | null, endpointsOnly: boolean): FiberSegment[] {
  return features.flatMap((f, i) => {
    const ms = matchSideFor(f.geometry, origin, dest, endpointsOnly)
    if (!ms) return []
    const p = f.properties
    const name = s(p.name)
    const parts = name.split(' - ')
    const from = parts[0]?.trim() || name
    const to   = parts[1]?.replace(/\s*\(.*\)/, '').trim() || from
    return [{
      id:          `btcl-${i}`,
      operatorKey: 'btcl' as OperatorKey,
      operator:    'BTCL',
      lineName:    name,
      lineType:    '',
      fromNode:    from,
      toNode:      to,
      coreCount:   null,
      coresUsed:   null,
      coresFree:   null,
      routeKm:     n(p.dist_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── Banglalink (bl-lines.geojson) ───────────────────────────────
export function filterBanglalink(features: Feat[], origin: AreaSel | null, dest: AreaSel | null, endpointsOnly: boolean): FiberSegment[] {
  return features.flatMap((f, i) => {
    const ms = matchSideFor(f.geometry, origin, dest, endpointsOnly)
    if (!ms) return []
    const p = f.properties
    const district = s(p.district)
    const upazila  = s(p.upazila)
    const division = s(p.division)
    return [{
      id:          `bl-${i}`,
      operatorKey: 'banglalink' as OperatorKey,
      operator:    'Banglalink',
      lineName:    s(p.linename),
      lineType:    s(p.linetype),
      fromNode:    district || division,
      toNode:      upazila  || district || division,
      coreCount:   n(p.coreno),
      coresUsed:   n(p.coreuse),
      coresFree:   n(p.coreready),
      routeKm:     n(p.routelenkm),
      division,
      district,
      upazila,
      matchSide:   ms,
    }]
  })
}

// ─── Bahon (bahon-lines.geojson) ─────────────────────────────────
export function filterBahon(features: Feat[], origin: AreaSel | null, dest: AreaSel | null, endpointsOnly: boolean): FiberSegment[] {
  return features.flatMap((f, i) => {
    const ms = matchSideFor(f.geometry, origin, dest, endpointsOnly)
    if (!ms) return []
    const p = f.properties
    const cn   = n(p.cn)
    const cu   = n(p.cu)
    const a    = s(p.a)
    const b    = s(p.b)
    const div  = s(p.div)
    const dist = s(p.dist)
    const fallback = dist || div
    return [{
      id:          `bahon-${i}`,
      operatorKey: 'bahon' as OperatorKey,
      operator:    'Bahon',
      lineName:    (a && b) ? a + ' – ' + b : fallback,
      lineType:    s(p.ct),
      fromNode:    a || fallback,
      toNode:      b || fallback,
      coreCount:   cn,
      coresUsed:   cu,
      coresFree:   cn !== null && cu !== null ? cn - cu : null,
      routeKm:     n(p.m) !== null ? Math.round((n(p.m) as number) / 100) / 10 : null,
      division:    div,
      district:    dist,
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── BR Fiber (br-fiber-lines.geojson) ───────────────────────────
export function filterBRFiber(features: Feat[], origin: AreaSel | null, dest: AreaSel | null, endpointsOnly: boolean): FiberSegment[] {
  return features.flatMap((f, i) => {
    const ms = matchSideFor(f.geometry, origin, dest, endpointsOnly)
    if (!ms) return []
    const p = f.properties
    const na = s(p.name_a)
    const nb = s(p.name_b)
    return [{
      id:          `br-${i}`,
      operatorKey: 'brfiber' as OperatorKey,
      operator:    'BR Fiber',
      lineName:    na + ' – ' + nb,
      lineType:    '',
      fromNode:    na,
      toNode:      nb,
      coreCount:   n(p.total_core),
      coresUsed:   n(p.used_core),
      coresFree:   n(p.unused_core),
      routeKm:     n(p.len_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── IS3 (is3-lines.geojson) ─────────────────────────────────────
export function filterIS3(features: Feat[], origin: AreaSel | null, dest: AreaSel | null, endpointsOnly: boolean): FiberSegment[] {
  return features.flatMap((f, i) => {
    const ms = matchSideFor(f.geometry, origin, dest, endpointsOnly)
    if (!ms) return []
    const p = f.properties
    const name = s(p.name)
    const cores = typeof p.cores === 'number' ? p.cores : (parseInt(String(p.cores)) || null)
    const layer = s(p.layer)
    const toIdx = name.toLowerCase().indexOf(' to ')
    const from  = toIdx >= 0 ? name.slice(0, toIdx).trim()  : (layer || name)
    const to    = toIdx >= 0 ? name.slice(toIdx + 4).trim() : (layer || name)
    return [{
      id:          `is3-${i}`,
      operatorKey: 'is3' as OperatorKey,
      operator:    'IS3',
      lineName:    name,
      lineType:    layer,
      fromNode:    from,
      toNode:      to,
      coreCount:   cores,
      coresUsed:   null,
      coresFree:   null,
      routeKm:     n(p.len_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── Operator Lines (opr-lines.geojson) ──────────────────────────
export function filterOprLines(features: Feat[], origin: AreaSel | null, dest: AreaSel | null, endpointsOnly: boolean): FiberSegment[] {
  return features.flatMap((f, i) => {
    const ms = matchSideFor(f.geometry, origin, dest, endpointsOnly)
    if (!ms) return []
    const p = f.properties
    const lname = s(p.line_name)
    const dashIdx = lname.indexOf('-')
    const from = dashIdx >= 0 ? lname.slice(0, dashIdx).trim()  : lname
    const to   = dashIdx >= 0 ? lname.slice(dashIdx + 1).trim() : lname
    return [{
      id:          `opr-${i}`,
      operatorKey: 'oprlines' as OperatorKey,
      operator:    s(p.op_name),
      lineName:    lname,
      lineType:    '',
      fromNode:    from,
      toNode:      to,
      coreCount:   n(p.total_core),
      coresUsed:   null,
      coresFree:   null,
      routeKm:     n(p.route_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}
