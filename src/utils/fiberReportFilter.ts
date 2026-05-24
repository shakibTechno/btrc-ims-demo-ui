import type { FiberSegment, OperatorKey, AdminLevel } from '@/types/fiberReport'

type Props = Record<string, unknown>

function n(v: unknown): number | null {
  return typeof v === 'number' ? v : null
}
function s(v: unknown): string {
  return v == null ? '' : String(v)
}

function ci(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}
function contains(haystack: unknown, needle: string): boolean {
  if (typeof haystack !== 'string') return false
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function side(
  mo: boolean,
  md: boolean,
): FiberSegment['matchSide'] | null {
  if (mo && md) return 'both'
  if (mo)       return 'origin'
  if (md)       return 'destination'
  return null
}

// ─── BTCL (fiber-lines.geojson) ───────────────────────────────────
// name: "Ghatail - Madhupur (19 Km)" — text search only
export function filterBTCL(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const name = s(p.name)
    const ms = side(contains(name, origin), contains(name, destination))
    if (!ms) return []
    const parts = name.split(' - ')
    return [{
      id:          `btcl-${i}`,
      operatorKey: 'btcl' as OperatorKey,
      operator:    'BTCL',
      lineName:    name,
      lineType:    '',
      fromNode:    parts[0]?.trim() ?? '',
      toNode:      parts[1]?.replace(/\s*\(.*\)/, '').trim() ?? '',
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
// Has division/district/upazila fields — direct equality match
export function filterBanglalink(
  features: { properties: Props }[],
  level: AdminLevel,
  origin: string,
  destination: string,
): FiberSegment[] {
  const fieldMap: Record<AdminLevel, string> = {
    division: 'division',
    district: 'district',
    upazila:  'upazila',
  }
  const field = fieldMap[level]

  return features.flatMap((f, i) => {
    const p = f.properties
    const val = s(p[field])
    const mo = ci(val, origin)
    const md = ci(val, destination)
    const ms = side(mo, md)
    if (!ms) return []
    const coreno = n(p.coreno)
    const coreuse = n(p.coreuse)
    const coreready = n(p.coreready)
    return [{
      id:          `bl-${i}`,
      operatorKey: 'banglalink' as OperatorKey,
      operator:    'Banglalink',
      lineName:    s(p.linename),
      lineType:    s(p.linetype),
      fromNode:    s(p.division) + ' › ' + s(p.district) + ' › ' + s(p.upazila),
      toNode:      '',
      coreCount:   coreno,
      coresUsed:   coreuse,
      coresFree:   coreready,
      routeKm:     n(p.routelenkm),
      division:    s(p.division),
      district:    s(p.district),
      upazila:     s(p.upazila),
      matchSide:   ms,
    }]
  })
}

// ─── Bahon (bahon-lines.geojson) ─────────────────────────────────
// div/dist — direct match for div/dist level; text search in a/b for upazila
export function filterBahon(
  features: { properties: Props }[],
  level: AdminLevel,
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    let mo = false
    let md = false

    if (level === 'division') {
      mo = ci(s(p.div), origin)
      md = ci(s(p.div), destination)
    } else if (level === 'district') {
      mo = ci(s(p.dist), origin)
      md = ci(s(p.dist), destination)
    } else {
      // upazila — fall back to text search in node names
      mo = contains(p.a, origin) || contains(p.b, origin)
      md = contains(p.a, destination) || contains(p.b, destination)
    }

    const ms = side(mo, md)
    if (!ms) return []
    const cn = n(p.cn)
    const cu = n(p.cu)
    return [{
      id:          `bahon-${i}`,
      operatorKey: 'bahon' as OperatorKey,
      operator:    'Bahon',
      lineName:    s(p.a) + ' – ' + s(p.b),
      lineType:    s(p.ct),
      fromNode:    s(p.a),
      toNode:      s(p.b),
      coreCount:   cn,
      coresUsed:   cu,
      coresFree:   cn !== null && cu !== null ? cn - cu : null,
      routeKm:     n(p.m) !== null ? Math.round((n(p.m) as number) / 100) / 10 : null,
      division:    s(p.div),
      district:    s(p.dist),
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── BR Fiber (br-fiber-lines.geojson) ───────────────────────────
// name_a, name_b — text search
export function filterBRFiber(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const na = s(p.name_a)
    const nb = s(p.name_b)
    const mo = contains(na, origin)  || contains(nb, origin)
    const md = contains(na, destination) || contains(nb, destination)
    const ms = side(mo, md)
    if (!ms) return []
    const total  = n(p.total_core)
    const used   = n(p.used_core)
    const unused = n(p.unused_core)
    return [{
      id:          `br-${i}`,
      operatorKey: 'brfiber' as OperatorKey,
      operator:    'BR Fiber',
      lineName:    na + ' – ' + nb,
      lineType:    '',
      fromNode:    na,
      toNode:      nb,
      coreCount:   total,
      coresUsed:   used,
      coresFree:   unused,
      routeKm:     n(p.len_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── IS3 (is3-lines.geojson) ─────────────────────────────────────
// name — text search
export function filterIS3(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const name = s(p.name)
    const ms = side(contains(name, origin), contains(name, destination))
    if (!ms) return []
    const cores = n(p.cores)
    return [{
      id:          `is3-${i}`,
      operatorKey: 'is3' as OperatorKey,
      operator:    'IS3',
      lineName:    name,
      lineType:    s(p.layer),
      fromNode:    name.split(' – ')[0]?.trim() ?? name,
      toNode:      name.split(' – ')[1]?.trim() ?? '',
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

// ─── FHLFON (fhlfon-lines.geojson) ───────────────────────────────
// No geographic fields — include all when selected
export function filterFHLFON(
  features: { properties: Props }[],
): FiberSegment[] {
  return features.map((f, i) => {
    const p = f.properties
    const cn = n(p.cn)
    const cu = n(p.cu)
    return {
      id:          `fhlfon-${i}`,
      operatorKey: 'fhlfon' as OperatorKey,
      operator:    'Fiber@Home',
      lineName:    `Route ${i + 1}`,
      lineType:    s(p.lt),
      fromNode:    '',
      toNode:      '',
      coreCount:   cn,
      coresUsed:   cu,
      coresFree:   cn !== null && cu !== null ? cn - cu : null,
      routeKm:     n(p.km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   'all',
    }
  })
}

// ─── Operator Lines (opr-lines.geojson) ──────────────────────────
// line_name — text search
export function filterOprLines(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const lname = s(p.line_name)
    const ms = side(contains(lname, origin), contains(lname, destination))
    if (!ms) return []
    return [{
      id:          `opr-${i}`,
      operatorKey: 'oprlines' as OperatorKey,
      operator:    s(p.op_name),
      lineName:    lname,
      lineType:    '',
      fromNode:    lname.split('-')[0]?.trim() ?? lname,
      toNode:      lname.split('-').slice(1).join('-').trim(),
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
