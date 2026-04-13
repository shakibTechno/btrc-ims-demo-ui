// ─── BGFCL NTTN Fiber Network Routes ─────────────────────────────
//
// Schematic representation of the national fiber backbone.
// Coordinates follow real geographic corridors (highways, river crossings)
// rather than straight lines — waypoints are intermediate lat/lng points
// along the route path.
//
// Tiers:
//   1 — National backbone  (high-capacity inter-division trunk)
//   2 — Regional branch    (division-level connectivity)
//   3 — Local spur         (last-mile / intra-division)
//
// Statuses reflect the current disaster scenario:
//   active   — fully operational
//   degraded — partial capacity / high latency
//   cut      — fiber severed (flood damage in Sylhet)

export type FiberStatus = 'active' | 'degraded' | 'cut'

export interface FiberRoute {
  id:       string
  name:     string
  tier:     1 | 2 | 3
  status:   FiberStatus
  nodeIds:  string[]              // NTTN PoP site IDs this route connects
  coords:   [number, number][]    // [lat, lng] waypoints along the route
}

export const FIBER_ROUTES: FiberRoute[] = [

  // ── TIER 1 — National Backbone ────────────────────────────────

  {
    id: 'FR-001', tier: 1, status: 'active',
    name: 'Dhaka–Chattogram National Backbone',
    nodeIds: ['DHK-004', 'CTG-006', 'CTG-003'],
    coords: [
      [23.8759, 90.3795],   // DHK-004 Uttara
      [23.91,   90.72 ],    // Narsingdi corridor
      [23.96,   91.11 ],    // Brahmanbaria
      [23.4607, 91.1809],   // CTG-006 Comilla
      [23.01,   91.40 ],    // Feni
      [22.4786, 91.8107],   // CTG-003 Hathazari
    ],
  },

  {
    id: 'FR-002', tier: 1, status: 'active',
    name: 'Dhaka Metro Ring',
    nodeIds: ['DHK-004', 'DHK-006'],
    coords: [
      [23.8759, 90.3795],   // DHK-004 Uttara
      [23.7400, 90.4200],   // Dhaka city mid
      [23.6238, 90.4996],   // DHK-006 Narayanganj
    ],
  },

  // ── TIER 2 — Regional Branches ────────────────────────────────

  {
    id: 'FR-003', tier: 2, status: 'active',
    name: 'Western Corridor (Rajshahi–Rangpur)',
    nodeIds: ['DHK-004', 'RAJ-003', 'RNG-002'],
    coords: [
      [23.8759, 90.3795],   // DHK-004 Uttara
      [24.10,   89.90 ],    // Sirajganj / Jamuna Bridge approach
      [24.45,   89.71 ],    // Jamuna crossing
      [24.4203, 88.9874],   // RAJ-003 Natore
      [25.00,   88.75 ],    // Chapai corridor
      [25.6279, 88.6337],   // RNG-002 Dinajpur
    ],
  },

  {
    id: 'FR-004', tier: 2, status: 'active',
    name: 'Northeast Branch (Mymensingh)',
    nodeIds: ['DHK-004', 'MYM-006', 'MYM-002'],
    coords: [
      [23.8759, 90.3795],   // DHK-004 Uttara
      [24.10,   90.60 ],    // Mymensingh city outskirts
      [24.4449, 90.7762],   // MYM-006 Kishoreganj
      [24.8702, 90.7299],   // MYM-002 Netrokona
    ],
  },

  {
    id: 'FR-005', tier: 2, status: 'degraded',
    name: 'Sylhet East Link (Comilla–Sylhet)',
    nodeIds: ['CTG-006', 'SYL-003'],
    coords: [
      [23.4607, 91.1809],   // CTG-006 Comilla
      [23.96,   91.11 ],    // Brahmanbaria
      [24.37,   91.42 ],    // Habiganj corridor
      [24.8837, 91.8752],   // SYL-003 Sylhet Central
    ],
  },

  {
    id: 'FR-006', tier: 2, status: 'degraded',
    name: 'Sylhet North Link (Netrokona–Sylhet)',
    nodeIds: ['MYM-002', 'SYL-003'],
    coords: [
      [24.8702, 90.7299],   // MYM-002 Netrokona
      [24.88,   91.20 ],    // Sunamganj approach
      [24.8837, 91.8752],   // SYL-003 Sylhet Central
    ],
  },

  {
    id: 'FR-007', tier: 2, status: 'active',
    name: 'Southern Branch (Barisal)',
    nodeIds: ['DHK-006', 'BAR-002'],
    coords: [
      [23.6238, 90.4996],   // DHK-006 Narayanganj
      [23.22,   90.65 ],    // Chandpur / Meghna crossing
      [22.90,   90.48 ],    // Barisal approach
      [22.3597, 90.3296],   // BAR-002 Patuakhali
    ],
  },

  {
    id: 'FR-008', tier: 2, status: 'active',
    name: 'Khulna Link',
    nodeIds: ['BAR-002', 'KHU-003'],
    coords: [
      [22.3597, 90.3296],   // BAR-002 Patuakhali
      [22.58,   89.97 ],    // Pirojpur / Baleswar crossing
      [22.4770, 89.5915],   // KHU-003 Mongla
    ],
  },

  // ── TIER 3 — Local Spurs ──────────────────────────────────────

  {
    id: 'FR-009', tier: 3, status: 'cut',
    name: 'Sylhet Local Ring',
    nodeIds: ['SYL-003', 'SYL-006'],
    coords: [
      [24.8837, 91.8752],   // SYL-003 Sylhet Central
      [24.9600, 91.9200],   // Companiganj approach
      [25.0271, 91.9764],   // SYL-006 Sylhet North (FLOOD DAMAGE)
    ],
  },

  {
    id: 'FR-010', tier: 3, status: 'active',
    name: 'Sundarbans Spur',
    nodeIds: ['KHU-003', 'KHU-007'],
    coords: [
      [22.4770, 89.5915],   // KHU-003 Mongla
      [22.4012, 89.7103],   // KHU-007 Sundarbans Remote
    ],
  },
]

// ── Style helpers ─────────────────────────────────────────────────

export const FIBER_COLOR: Record<FiberStatus, string> = {
  active:   '#3b82f6',   // blue
  degraded: '#f59e0b',   // amber
  cut:      '#ef4444',   // red
}

export const FIBER_WEIGHT: Record<1 | 2 | 3, number> = {
  1: 3,
  2: 2,
  3: 1.5,
}
