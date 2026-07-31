import { NextRequest, NextResponse } from 'next/server';
import { resolveOwnRecognitions } from '@/lib/elite/server';

// GET /api/bff/elite/recognition — the caller's OWN recognitions (C-127), read-only.
// Elite grants CRITERIA-BASED recognition from verified evidence (never bought):
// evidence from Legend, criteria evaluated by Analytics, thresholds governed by
// System, GOLD/PLATINUM human-reviewed. Identity is derived from the `tec_user`
// session cookie server-side — NEVER a query param or body (P6). The owner is passed
// to the backend; on no session / unreachable backend the source is 'unavailable'
// with no recognitions (honest empty state, C-135 §4) — never a fabricated sample.
// Elite never computes scores or records achievements.
function ownerFromSession(req: NextRequest): string | null {
  try {
    const raw = req.cookies.get('tec_user')?.value ?? '';
    if (!raw) return null;
    let u: Record<string, unknown>;
    try { u = JSON.parse(raw); } catch { u = JSON.parse(decodeURIComponent(raw)); }
    const owner = (u.piUsername ?? u.username) as string | undefined;
    return owner && owner.trim() ? owner : null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const owner = ownerFromSession(req);
  const { recognitions, source } = await resolveOwnRecognitions(owner);
  return NextResponse.json(
    { source, recognitions },
    { headers: { 'Cache-Control': 'private, max-age=60' } },
  );
}
