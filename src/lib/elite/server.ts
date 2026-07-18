import {
  RECOGNITIONS, getRecognition,
  type Recognition, type EliteProgram, type EliteTier,
  type RecognitionStatus, type CriterionResult,
} from './recognition';

// Server-only Elite backend access (C-127). Calls the real Elite read-layer
// (identity-service) via the gateway with the inter-service key, and maps the
// backend rows to the frontend shape. Everything degrades to the curated sample so
// the page is never blank / never 500s. NEW-A: the gateway URL is server-only
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
  source:       'live' | 'sample';
}

// The caller's OWN recognitions — live backend first, curated sample as fallback.
// `owner` is derived from the session by the BFF (never a client param, P6); when
// absent or unknown, the sample is served so the page is never blank.
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
    } catch { /* fall through to the curated sample */ }
  }
  return { recognitions: RECOGNITIONS, source: 'sample' };
}

export interface ResolvedRecognition {
  recognition: Recognition | null;
  source:      'live' | 'sample';
}

// One recognition by slug — live backend first, sample fallback. A live 404 is
// authoritative (recognition: null, source: 'live'). Publicly verifiable ("is X Elite?").
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
    } catch { /* fall through to the curated sample */ }
  }
  return { recognition: getRecognition(id), source: 'sample' };
}
