// ─── Shared geometry helpers ──────────────────────────────────────
// Point-in-polygon (ray casting), bounding boxes, and line/area
// intersection used by the geo-based report filters.

export type Coord = [number, number]
type Ring = Coord[]
export type Geometry = { type: string; coordinates?: unknown; geometries?: Geometry[] }
export type BBox = [number, number, number, number] // [minX, minY, maxX, maxY]

// ─── Point in polygon ─────────────────────────────────────────────
function raycast(pt: Coord, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as Coord
    const [xj, yj] = ring[j] as Coord
    if ((yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function pipPolygon(pt: Coord, rings: Ring[]): boolean {
  if (!rings.length || !raycast(pt, rings[0])) return false
  for (let i = 1; i < rings.length; i++) {
    if (raycast(pt, rings[i])) return false // inside a hole
  }
  return true
}

export function pointInGeometry(pt: Coord, geo: Geometry): boolean {
  if (geo.type === 'Polygon') {
    return pipPolygon(pt, geo.coordinates as Ring[])
  }
  if (geo.type === 'MultiPolygon') {
    return (geo.coordinates as Ring[][]).some(rings => pipPolygon(pt, rings))
  }
  if (geo.type === 'GeometryCollection') {
    return (geo.geometries ?? []).some(g => pointInGeometry(pt, g))
  }
  return false
}

// ─── Bounding boxes ───────────────────────────────────────────────
function extend(b: BBox, x: number, y: number): void {
  if (x < b[0]) b[0] = x
  if (y < b[1]) b[1] = y
  if (x > b[2]) b[2] = x
  if (y > b[3]) b[3] = y
}

function accumulate(coords: unknown, b: BBox): void {
  if (!Array.isArray(coords)) return
  // a coordinate pair is [number, number]
  if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    extend(b, coords[0], coords[1] as number)
    return
  }
  for (const c of coords) accumulate(c, b)
}

export function geometryBBox(geo: Geometry): BBox {
  const b: BBox = [Infinity, Infinity, -Infinity, -Infinity]
  if (geo.type === 'GeometryCollection') {
    for (const g of geo.geometries ?? []) {
      const gb = geometryBBox(g)
      extend(b, gb[0], gb[1]); extend(b, gb[2], gb[3])
    }
  } else {
    accumulate(geo.coordinates, b)
  }
  return b
}

function bboxOverlap(a: BBox, b: BBox): boolean {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]
}

// ─── Line geometry helpers ────────────────────────────────────────
// Flatten a LineString / MultiLineString into its vertex list.
function lineVertices(geo: Geometry): Coord[] {
  if (geo.type === 'LineString') {
    return geo.coordinates as Coord[]
  }
  if (geo.type === 'MultiLineString') {
    return (geo.coordinates as Coord[][]).flat()
  }
  if (geo.type === 'Point') {
    return [geo.coordinates as Coord]
  }
  return []
}

// Does any vertex of `lineGeo` fall inside `polyGeo`?
// `polyBBox` is the precomputed bounding box of the polygon — used as
// a fast reject so most lines never reach the per-vertex test.
export function lineTouchesArea(lineGeo: Geometry, polyGeo: Geometry, polyBBox: BBox): boolean {
  const verts = lineVertices(lineGeo)
  if (verts.length === 0) return false

  // bbox pre-filter
  const lb: BBox = [Infinity, Infinity, -Infinity, -Infinity]
  for (const v of verts) extend(lb, v[0], v[1])
  if (!bboxOverlap(lb, polyBBox)) return false

  for (const v of verts) {
    if (pointInGeometry(v, polyGeo)) return true
  }
  return false
}
