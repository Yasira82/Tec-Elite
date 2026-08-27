// TEC Elite — Excellence Runtime (C-127) — read-only V1 data.
//
// Elite = System of Recognition: it officially recognizes top performers based on
// VERIFIED EVIDENCE, never self-promotion or paid placement ("Are you among the
// best?"). It is the middle link of Legend (evidence) → Elite (recognition) →
// VIP (experience).
//
// CONSTITUTIONAL RULES (C-127):
//  • Recognition is CRITERIA-BASED only — no overrides, no paid recognition (FREE).
//  • Evidence comes from Legend; criteria are evaluated by Analytics; thresholds
//    are governed by System. GOLD/PLATINUM additionally require human review.
//  • Elite does NOT compute scores (Analytics), record achievements (Legend),
//    verify identity (Zone), or deliver benefits (VIP) — it grants recognition.
// This V1 is a curated read-only SAMPLE; when live it serves the caller's OWN
// recognitions (identity from the session cookie, never a param — P6).

export type EliteProgram =
  | 'TOP_MERCHANT' | 'TOP_CREATOR' | 'TOP_INVESTOR' | 'TOP_BUILDER'
  | 'TOP_COMMUNITY' | 'PI_LEGEND' | 'ZONE_PIONEER' | 'FOUNDING_MEMBER';

export type EliteTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// ACTIVE = granted + valid · CANDIDATE = criteria met, pending (review for GOLD+)
// · EXPIRED = criteria no longer met at renewal (never REVOKED unless governance)
export type RecognitionStatus = 'ACTIVE' | 'CANDIDATE' | 'EXPIRED';

export interface CriterionResult {
  label:     string;
  value:     number | boolean;
  threshold: number | boolean;
  passed:    boolean;
}

export interface Recognition {
  id:          string;
  program:     EliteProgram;
  tier:        EliteTier;
  status:      RecognitionStatus;
  grantedBy:   'SYSTEM' | 'PANEL';   // SYSTEM = automated · PANEL = human review (GOLD/PLATINUM)
  grantedAt?:  string;
  validUntil?: string;
  criteria:    CriterionResult[];
}

export const RECOGNITIONS: Recognition[] = [
  {
    id: 'top-merchant-bronze',
    program: 'TOP_MERCHANT',
    tier: 'BRONZE',
    status: 'ACTIVE',
    grantedBy: 'SYSTEM',
    grantedAt: '2026-05-14',
    validUntil: '2026-08-14',
    criteria: [
      { label: '100+ completed Commerce transactions', value: 500, threshold: 100, passed: true },
      { label: '95%+ completion rate',                  value: 96,  threshold: 95,  passed: true },
      { label: 'Zone-verified merchant',                value: true, threshold: true, passed: true },
      { label: 'Legend Merchant Score ≥ 70',            value: 82,  threshold: 70,  passed: true },
      { label: 'Active in last 90 days',                value: true, threshold: true, passed: true },
    ],
  },
  {
    id: 'top-community-silver',
    program: 'TOP_COMMUNITY',
    tier: 'SILVER',
    status: 'ACTIVE',
    grantedBy: 'SYSTEM',
    grantedAt: '2026-06-02',
    validUntil: '2026-09-02',
    criteria: [
      { label: 'Top 5% collaborators',            value: true, threshold: true, passed: true },
      { label: 'Legend Collaborator Score ≥ 80',  value: 88,  threshold: 80,  passed: true },
      { label: 'Zone-verified',                   value: true, threshold: true, passed: true },
    ],
  },
  {
    id: 'pi-legend-platinum',
    program: 'PI_LEGEND',
    tier: 'PLATINUM',
    status: 'CANDIDATE',
    grantedBy: 'PANEL',
    criteria: [
      { label: 'Top 0.1% across 3+ dimensions',   value: 2,   threshold: 3,   passed: false },
      { label: 'Legend composite score ≥ 95',     value: 79,  threshold: 95,  passed: false },
      { label: '2+ years consistent Pi activity', value: 1,   threshold: 2,   passed: false },
      { label: 'Zone verified (highest tier)',    value: true, threshold: true, passed: true },
      { label: 'Human review panel approval',     value: false, threshold: true, passed: false },
    ],
  },
];

export const PROGRAM_META: Record<EliteProgram, { label: string; icon: string }> = {
  TOP_MERCHANT:    { label: 'Top Merchant',     icon: '🛒' },
  TOP_CREATOR:     { label: 'Top Creator',      icon: '🎨' },
  TOP_INVESTOR:    { label: 'Top Investor',     icon: '💠' },
  TOP_BUILDER:     { label: 'Top Builder',      icon: '🛠️' },
  TOP_COMMUNITY:   { label: 'Top Community',    icon: '🤝' },
  PI_LEGEND:       { label: 'Pi Legend',        icon: '🏆' },
  ZONE_PIONEER:    { label: 'Zone Pioneer',     icon: '✓' },
  FOUNDING_MEMBER: { label: 'Founding Member',  icon: '🌱' },
};

// Tier = a percentile band; earned, never bought.
export const TIER_META: Record<EliteTier, { label: string; band: string; tone: string }> = {
  BRONZE:   { label: 'Bronze',   band: 'Top 10%',  tone: '#CD7F32' },
  SILVER:   { label: 'Silver',   band: 'Top 5%',   tone: '#C0C0C0' },
  GOLD:     { label: 'Gold',     band: 'Top 1%',   tone: '#FBB44A' },
  PLATINUM: { label: 'Platinum', band: 'Top 0.1%', tone: '#67E8F9' },
};

export const STATUS_META: Record<RecognitionStatus, { label: string; tone: string }> = {
  ACTIVE:    { label: 'Active',    tone: '#22C55E' },
  CANDIDATE: { label: 'Candidate', tone: '#FBB44A' },
  EXPIRED:   { label: 'Expired',   tone: '#9ca3af' },
};

export function getRecognition(id: string): Recognition | null {
  return RECOGNITIONS.find((r) => r.id === id) ?? null;
}
