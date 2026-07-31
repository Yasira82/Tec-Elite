import {
  type Recognition, type EliteProgram, type EliteTier,
  type RecognitionStatus, type CriterionResult,
} from './recognition';

// Server-only Elite backend access (C-127). Calls the real Elite read-layer
// (identity-service) via the gateway with the inter-service key, and maps the
// backend rows to the frontend shape. Real data end-to-end (C-135 §4): an
// unreachable backend / no session resolves to `unavailable` (no recognitions) —
// never a fabricated sample. NEW-A: the gateway URL is server-only
// (API_GATEWAY_URL) — never shipped to the client.
const GW = process.env.API_GATEWAY_URL ?? '';

const gwHeaders = () => ({
  'Content-Type': 'application/json',
  'x-request-id': crypto.randomUUID(),
  ...(process.env.INTERNAL_SECRET && { 'x-internal-key': process.env.INTERNAL_SECRET }),
});

const day = (v: unknown) => (v ? String(v).slice(0, 10) : undefined); // ISO datetime → YYYY-MM-DD

function criteriaFromBackend(v: unknown): CriterionResult[] {
  if (!Array.isArray(v)) return [];
  return v.map((c) => {
    const o = (c ?? {}) as Record<string, unknown>;
    return {
      label:     String(o.label ?? ''),
      value:     (typeof o.value === 'boolean' ? o.value : Number(o.value ?? 0)) as number | boolean,
      threshold: (typeof o.threshold === 'boolean' ? o.threshold : Number(o.threshold ?? 0)) as number | boolean,
      passed:    Boolean(o.passed),
    };
  });
}

// backend (elite_recognitions) → frontend Recognition. Elite PRESENTS the recognition;
// the criteria snapshot is Analytics-produced, never recomputed here (C-127).
export function recognitionFromBackend(r: Record<string, unknown>): Recognition {
  return {
    id:         String(r.slug ?? ''),
    program:    String(r.program ?? '') as EliteProgram,
    tier:       String(r.tier ?? '') as EliteTier,
    status:     String(r.status ?? '') as RecognitionStatus,
    grantedBy:  String(r.granted_by ?? 'SYSTEM') === 'PANEL' ? 'PANEL' : 'SYSTEM',
    grantedAt:  day(r.granted_at),
    validUntil: day(r.valid_until),
    criteria:   criteriaFromBackend(r.criteria),
  };
}

export interface ResolvedRecognitions {
  recognitions: Recognition[];
  source:       'live' | 'unavailable';
}

// The caller's OWN recognitions — live backend only. `owner` is derived from the
// session by the BFF (never a client param, P6). No session or an unreachable
// backend resolves to (recognitions: [], source: 'unavailable') so the page shows
// an honest empty state — never a fabricated sample (C-135 §4).
export async function resolveOwnRecognitions(owner: string | null): Promise<ResolvedRecognitions> {
  if (GW && owner) {
    try {
      const res = await fetch(`${GW}/api/identity/elite/recognitions/${encodeURIComponent(owner)}`, {
        headers: gwHeaders(), cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const rows = data?.data?.recognitions;
        if (Array.isArray(rows)) {
          return { recognitions: rows.map((r) => recognitionFromBackend(r as Record<string, unknown>)), source: 'live' };
        }
      }
    } catch { /* unreachable → unavailable below */ }
  }
  return { recognitions: [], source: 'unavailable' };
}

export interface ResolvedRecognition {
  recognition: Recognition | null;
  source:      'live' | 'unavailable';
}

// One recognition by slug — live backend only. A live 404 is authoritative
// (recognition: null, source: 'live'); an unreachable backend resolves to
// (recognition: null, source: 'unavailable'). Publicly verifiable ("is X Elite?").
export async function resolveRecognition(id: string): Promise<ResolvedRecognition> {
  if (GW) {
    try {
      const res = await fetch(`${GW}/api/identity/elite/recognition/${encodeURIComponent(id)}`, {
        headers: gwHeaders(), cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const r = data?.data?.recognition;
        if (r) return { recognition: recognitionFromBackend(r as Record<string, unknown>), source: 'live' };
      }
      if (res.status === 404) return { recognition: null, source: 'live' };
    } catch { /* unreachable → unavailable below */ }
  }
  return { recognition: null, source: 'unavailable' };
}
