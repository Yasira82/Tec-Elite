import { NextResponse } from 'next/server';
import { RECOGNITIONS } from '@/lib/elite/recognition';

// GET /api/bff/elite/recognition — official recognitions (C-127), read-only.
// Elite grants CRITERIA-BASED recognition from verified evidence (never bought):
// evidence from Legend, criteria evaluated by Analytics, thresholds governed by
// System, GOLD/PLATINUM human-reviewed. This V1 serves a curated SAMPLE
// (source:'sample'); when live it serves the caller's OWN recognitions (identity
// from the session cookie, never a param — P6). Elite never computes scores or
// records achievements — it recognizes.
export function GET() {
  return NextResponse.json(
    { source: 'sample', recognitions: RECOGNITIONS },
    { headers: { 'Cache-Control': 'private, max-age=60' } },
  );
}
