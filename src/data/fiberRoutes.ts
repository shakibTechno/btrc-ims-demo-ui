// ─── BGFCL NTTN Fiber Network Routes ─────────────────────────────
//
// Routes follow actual national highway Right-of-Way (RoW) corridors.
// Waypoints are geo-accurate inflection points along each highway.
//
// Highway references:
//   N1  — Dhaka → Comilla → Chittagong          (Asian Highway AH1)
//   N2  — Dhaka → Narsingdi → Brahmanbaria → Sylhet
//   N3  — Dhaka → Gazipur → Mymensingh
//   N4  — Dhaka → Tangail → Jamuna Bridge → Rajshahi
//   N5  — Jamuna Bridge → Bogura → Rangpur       (N4 extension north)
//   N6  — Dhaka → Mawa → Padma Bridge → Barisal  (new 2022 route)
//   N7  — Khulna → Jessore → Kushtia → Pabna → Rajshahi
//   N8  — Barisal → Pirojpur → Khulna
//
// Tiers:
//   1 — National backbone  (high-capacity inter-division trunk)
//   2 — Regional branch    (division-level connectivity)
//   3 — Local spur         (district / last-mile)
//
// Statuses reflect current disaster scenario (Sylhet flood):
//   active   — fully operational
//   degraded — partial capacity / re-routed
//   cut      — fiber severed (flood damage, Sylhet north)

export type FiberStatus = 'active' | 'degraded' | 'cut'

export interface FiberRoute {
  id:      string
  name:    string
  tier:    1 | 2 | 3
  status:  FiberStatus
  nodeIds: string[]            // NTTN PoP site IDs this route connects
  coords:  [number, number][]  // [lat, lng] waypoints along the highway
}

export const FIBER_ROUTES: FiberRoute[] = [

  // ════════════════════════════════════════════════════════════════
  //  TIER 1 — National Backbone
  // ════════════════════════════════════════════════════════════════

  {
    // N1: Dhaka–Comilla–Feni–Chittagong  (Asian Highway AH1)
    // The primary national trunk; highest-capacity route.
    id: 'FR-001', tier: 1, status: 'active',
    name: 'N1 Backbone — Dhaka → Chittagong',
    nodeIds: ['DHK-004', 'CTG-006', 'CTG-003'],
    coords: [
      [23.811, 90.413],   // Dhaka (Motijheel / Jatrabari gate)
      [23.774, 90.558],   // Kanchpur Bridge crossing
      [23.566, 90.909],   // Daudkandi
      [23.461, 91.182],   // Comilla
      [23.241, 91.126],   // Laksam junction
      [23.023, 91.396],   // Feni
      [22.783, 91.570],   // Mirsarai (coastal highway bend)
      [22.623, 91.656],   // Sitakundu
      [22.449, 91.786],   // Pahartali / Chittagong north
      [22.337, 91.832],   // Chittagong (Agrabad)
    ],
  },

  {
    // N4 + N5: Dhaka → Tangail → Jamuna Bridge → Rajshahi → Rangpur
    // The western corridor backbone; crosses Jamuna (Brahmaputra) river.
    id: 'FR-002', tier: 1, status: 'active',
    name: 'N4/N5 Backbone — Dhaka → Rajshahi → Rangpur',
    nodeIds: ['DHK-004', 'RAJ-003', 'RNG-002'],
    coords: [
      [23.811, 90.413],   // Dhaka
      [23.988, 90.417],   // Gazipur (N4 diverges north-west)
      [24.253, 89.921],   // Tangail
      [24.404, 89.831],   // Elenga (Tangail bypass junction)
      [24.470, 89.778],   // Jamuna Bridge (north approach)
      [24.454, 89.706],   // Sirajganj (bridge south end, N5 north)
      [24.420, 88.987],   // Natore (N4 west to Rajshahi)
      [24.374, 88.603],   // Rajshahi
      // N5 northward leg
      [24.851, 89.372],   // Bogura
      [25.119, 89.369],   // Joypurhat
      [25.327, 89.546],   // Gaibandha
      [25.742, 89.253],   // Rangpur
    ],
  },

  {
    // Dhaka Metro Ring — intra-city backbone loop
    id: 'FR-003', tier: 1, status: 'active',
    name: 'Dhaka Metro Ring — Uttara ↔ Narayanganj',
    nodeIds: ['DHK-004', 'DHK-006'],
    coords: [
      [23.876, 90.379],   // Uttara (DHK-004)
      [23.811, 90.413],   // Motijheel
      [23.740, 90.420],   // Sadarghat
      [23.623, 90.500],   // Narayanganj (DHK-006)
    ],
  },

  // ════════════════════════════════════════════════════════════════
  //  TIER 2 — Division Connectors
  // ════════════════════════════════════════════════════════════════

  {
    // N2: Dhaka → Kanchpur → Narsingdi → Brahmanbaria → Habiganj → Sylhet
    id: 'FR-004', tier: 2, status: 'active',
    name: 'N2 Corridor — Dhaka → Sylhet',
    nodeIds: ['DHK-004', 'SYL-003'],
    coords: [
      [23.811, 90.413],   // Dhaka
      [23.774, 90.558],   // Kanchpur (N2 diverges north-east from N1)
      [23.921, 90.714],   // Narsingdi
      [24.052, 90.975],   // Bhairab Bazar (Meghna crossing)
      [23.957, 91.112],   // Brahmanbaria
      [24.147, 91.267],   // Habiganj bypass
      [24.373, 91.415],   // Habiganj district
      [24.524, 91.534],   // Shaistaganj junction
      [24.749, 91.707],   // Moulvibazar
      [24.900, 91.865],   // Sylhet
    ],
  },

  {
    // N3: Dhaka → Gazipur → Mymensingh
    id: 'FR-005', tier: 2, status: 'active',
    name: 'N3 Corridor — Dhaka → Mymensingh',
    nodeIds: ['DHK-004', 'MYM-002'],
    coords: [
      [23.876, 90.379],   // Uttara / Dhaka north
      [23.988, 90.417],   // Gazipur
      [24.237, 90.426],   // Tangail–Mymensingh fork (N3 straight)
      [24.748, 90.408],   // Mymensingh
      [24.870, 90.730],   // Netrokona (district spur along highway)
    ],
  },

  {
    // N6 (new): Dhaka → Mawa → Padma Bridge → Faridpur → Barisal
    // Padma Bridge opened June 2022 — new fiber route deployed along it.
    id: 'FR-006', tier: 2, status: 'active',
    name: 'N6 Padma Bridge Corridor — Dhaka → Barisal',
    nodeIds: ['DHK-006', 'BAR-002'],
    coords: [
      [23.623, 90.500],   // Narayanganj (DHK-006)
      [23.438, 90.385],   // Mawa (Padma north bank)
      [23.212, 90.183],   // Padma Bridge (mid-span)
      [23.073, 89.957],   // Bhanga junction (south bank)
      [23.140, 90.000],   // Madaripur approach
      [23.160, 90.210],   // Jhalakathi
      [22.701, 90.370],   // Barisal
    ],
  },

  {
    // N8: Barisal → Pirojpur → Khulna
    id: 'FR-007', tier: 2, status: 'active',
    name: 'N8 Corridor — Barisal → Khulna',
    nodeIds: ['BAR-002', 'KHU-003'],
    coords: [
      [22.701, 90.370],   // Barisal
      [22.580, 90.200],   // Barisal south / Muladi
      [22.578, 89.975],   // Pirojpur
      [22.660, 89.800],   // Bagerhat approach
      [22.651, 89.756],   // Bagerhat
      [22.820, 89.552],   // Khulna
    ],
  },

  {
    // N7 (west): Khulna → Jessore → Kushtia → Pabna → Sirajganj (connects to N4/N5)
    id: 'FR-008', tier: 2, status: 'active',
    name: 'N7 West Corridor — Khulna → Rajshahi',
    nodeIds: ['KHU-003', 'RAJ-003'],
    coords: [
      [22.820, 89.552],   // Khulna
      [23.168, 89.213],   // Jessore
      [23.420, 89.108],   // Jhenaidah
      [23.660, 88.933],   // Chuadanga
      [23.901, 89.120],   // Kushtia
      [24.006, 89.244],   // Pabna
      [24.420, 88.987],   // Natore (connects to N4)
      [24.374, 88.603],   // Rajshahi
    ],
  },

  {
    // Mymensingh → Netrokona → Sunamganj → Sylhet (east cross-link)
    // Follows the district roads through the Haor basin.
    id: 'FR-009', tier: 2, status: 'degraded',
    name: 'North-East Cross-link — Mymensingh → Sylhet',
    nodeIds: ['MYM-002', 'SYL-003'],
    coords: [
      [24.870, 90.730],   // Netrokona
      [24.883, 91.000],   // Kendua
      [24.882, 91.399],   // Sunamganj
      [24.892, 91.628],   // Sunamganj east
      [24.900, 91.865],   // Sylhet
    ],
  },

  {
    // Comilla → Brahmanbaria → Habiganj (alternate Sylhet feed, degraded)
    id: 'FR-010', tier: 2, status: 'degraded',
    name: 'East Spur — Comilla → Sylhet (via B-Baria)',
    nodeIds: ['CTG-006', 'SYL-003'],
    coords: [
      [23.461, 91.182],   // Comilla
      [23.957, 91.112],   // Brahmanbaria
      [24.147, 91.267],   // Habiganj bypass
      [24.373, 91.415],   // Habiganj
      [24.900, 91.865],   // Sylhet
    ],
  },

  {
    // Chittagong → Cox's Bazar (N1 southern coastal extension)
    id: 'FR-011', tier: 2, status: 'active',
    name: 'Coastal Extension — Chittagong → Cox\'s Bazar',
    nodeIds: ['CTG-003', 'CTG-006'],
    coords: [
      [22.337, 91.832],   // Chittagong (Agrabad)
      [22.119, 91.879],   // Anwara / Patiya
      [21.918, 92.002],   // Chakoria
      [21.750, 92.009],   // Dulahazara
      [21.441, 92.013],   // Cox's Bazar
    ],
  },

  {
    // Dhaka → Faridpur → Jessore → Khulna (alternate south-west backbone)
    id: 'FR-012', tier: 2, status: 'active',
    name: 'N7 South Corridor — Dhaka → Khulna via Jessore',
    nodeIds: ['DHK-006', 'KHU-003'],
    coords: [
      [23.623, 90.500],   // Narayanganj
      [23.073, 89.957],   // Bhanga
      [23.240, 89.836],   // Faridpur
      [23.607, 89.841],   // Magura
      [23.168, 89.213],   // Jessore
      [22.820, 89.552],   // Khulna
    ],
  },

  // ════════════════════════════════════════════════════════════════
  //  TIER 3 — District Spurs
  // ════════════════════════════════════════════════════════════════

  {
    // Rangpur → Nilphamari → Dinajpur (district highway spur)
    id: 'FR-013', tier: 3, status: 'active',
    name: 'Rangpur → Dinajpur District Spur',
    nodeIds: ['RNG-002'],
    coords: [
      [25.742, 89.253],   // Rangpur
      [25.940, 88.940],   // Nilphamari
      [25.625, 88.634],   // Dinajpur
    ],
  },

  {
    // Rajshahi → Chapai Nawabganj (N6 extension west)
    id: 'FR-014', tier: 3, status: 'active',
    name: 'Rajshahi → Chapai Nawabganj Spur',
    nodeIds: ['RAJ-003'],
    coords: [
      [24.374, 88.603],   // Rajshahi
      [24.590, 88.274],   // Chapai Nawabganj
    ],
  },

  {
    // Sylhet city ring — FLOOD DAMAGE (cut)
    id: 'FR-015', tier: 3, status: 'cut',
    name: 'Sylhet Local Ring (FLOOD — CUT)',
    nodeIds: ['SYL-003', 'SYL-006'],
    coords: [
      [24.900, 91.865],   // Sylhet Central (SYL-003)
      [24.940, 91.900],   // Sylhet north highway
      [24.960, 91.921],   // Companiganj approach
      [25.027, 91.976],   // Sylhet North (SYL-006) — SEVERED
    ],
  },

  {
    // Khulna → Mongla port highway spur
    id: 'FR-016', tier: 3, status: 'active',
    name: 'Khulna → Mongla Port Spur',
    nodeIds: ['KHU-003', 'KHU-007'],
    coords: [
      [22.820, 89.552],   // Khulna
      [22.651, 89.756],   // Bagerhat
      [22.477, 89.591],   // Mongla port
      [22.401, 89.710],   // Sundarbans Remote (KHU-007)
    ],
  },

  {
    // Barisal → Patuakhali (highway spur south)
    id: 'FR-017', tier: 3, status: 'active',
    name: 'Barisal → Patuakhali Coastal Spur',
    nodeIds: ['BAR-002'],
    coords: [
      [22.701, 90.370],   // Barisal
      [22.530, 90.370],   // Barisal south
      [22.360, 90.329],   // Patuakhali
    ],
  },

  {
    // Mymensingh → Kishoreganj district spur (highway east)
    id: 'FR-018', tier: 3, status: 'active',
    name: 'Mymensingh → Kishoreganj District Spur',
    nodeIds: ['MYM-006'],
    coords: [
      [24.748, 90.408],   // Mymensingh
      [24.600, 90.590],   // Kishoreganj approach
      [24.445, 90.776],   // Kishoreganj (MYM-006)
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
  1: 3.5,
  2: 2.2,
  3: 1.5,
}
