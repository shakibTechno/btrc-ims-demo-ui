import type { DisasterScenario } from '@/types/disaster'

// ─── Sylhet Flash Flood 2026 — active disaster scenario ──────────
//
// Baseline captured: 2026-04-11 06:00 UTC+6 (just before flood onset)
// All 8 Sylhet sites were operational at baseline.
//
// Current state (2026-04-13 08:00):
//   SYL-001  active    (restored — running on generator)
//   SYL-002  active    (restored — running on generator)
//   SYL-003  active    (partially restored — battery)
//   SYL-004  active    (unaffected — Moulvibazar, south of flood zone)
//   SYL-005  DOWN      (Golapganj — power failure, ongoing)
//   SYL-006  DOWN      (North NTTN — fibre severed, ongoing)
//   SYL-007  DOWN      (Bishwanath — battery depleted, ongoing)
//   SYL-008  DEGRADED  (Sunamganj — battery at 30%, intermittent)
//
// Recovery: 4 active / 8 baseline = 50%

export const DISASTER_SCENARIO: DisasterScenario = {
  id: 'DIS-2026-001',
  name: 'Sylhet Flash Flood 2026',
  affectedDistrict: 'Sylhet',
  affectedDivision: 'Sylhet',
  activatedAt: '2026-04-11T06:35:00+06:00',
  activatedBy: 'Mohammad Rohol Amin — BTRC Director Administration',
  status: 'active',

  baseline: {
    totalSites: 8,
    activeSites: 8,
    downSites: 0,
    degradedSites: 0,
    snapshotTime: '2026-04-11T06:00:00+06:00',
  },

  current: {
    totalSites: 8,
    activeSites: 4,
    downSites: 3,
    degradedSites: 1,
    lastUpdated: '2026-04-13T08:00:00+06:00',
  },

  recoveryPercent: 50,   // 4 / 8 active × 100

  operatorImpact: [
    {
      operatorId: 'OP-GP',
      totalSitesInDistrict: 2,   // SYL-001 (tenant), SYL-002 (owner)
      affectedSites: 0,
      restoredSites: 2,
      percentRestored: 100,
    },
    {
      operatorId: 'OP-ROBI',
      totalSitesInDistrict: 2,   // SYL-001 (tenant), SYL-005 (owner)
      affectedSites: 1,
      restoredSites: 1,
      percentRestored: 50,
    },
    {
      operatorId: 'OP-BL',
      totalSitesInDistrict: 2,   // SYL-007 (tenant), SYL-008 (owner)
      affectedSites: 2,
      restoredSites: 0,
      percentRestored: 0,
    },
    {
      operatorId: 'OP-BGFCL',
      totalSitesInDistrict: 2,   // SYL-003, SYL-006
      affectedSites: 1,
      restoredSites: 1,
      percentRestored: 50,
    },
    {
      operatorId: 'OP-EDOTCO',
      totalSitesInDistrict: 4,   // SYL-001, SYL-004, SYL-007, tenants
      affectedSites: 1,
      restoredSites: 3,
      percentRestored: 75,
    },
  ],
}
