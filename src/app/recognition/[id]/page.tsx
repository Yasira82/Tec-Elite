// TEC Elite — recognition detail (C-127), read-only. Shows the criteria breakdown:
// recognition is criteria-based only. Rendered dynamically from the live Elite
// read-layer — real data end-to-end (C-135 §4): a live 404 is "not found"; an
// unreachable backend is an honest "couldn't load". Never a fabricated sample.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { PROGRAM_META, TIER_META, STATUS_META } from '@/lib/elite/recognition';
import { resolveRecognition } from '@/lib/elite/server';

export const dynamic = 'force-dynamic';

function fmt(v: number | boolean): string {
  return typeof v === 'boolean' ? (v ? 'yes' : 'no') : String(v);
}

export default async function RecognitionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { recognition: r, source } = await resolveRecognition(id);

  if (!r) {
    if (source === 'live') notFound();
    return (
      <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: '#e7e7ea', padding: '32px 22px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link href="/app" style={{ color: TEC_COLORS.gold, fontSize: 13, textDecoration: 'none' }}>← Back</Link>
          <div style={{ marginTop: 40, padding: '40px 24px', background: TEC_COLORS.surface, borderRadius: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>🎖️</div>
            <div style={{ color: '#e7e7ea', fontWeight: 800, marginTop: 8 }}>Couldn&apos;t load this recognition</div>
            <p style={{ opacity: 0.65, fontSize: 13.5, marginTop: 6 }}>The Elite read-layer is unavailable right now. Please try again.</p>
          </div>
        </div>
      </main>
    );
  }

  const pm = PROGRAM_META[r.program];
  const tm = TIER_META[r.tier];
  const sm = STATUS_META[r.status];

  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: '#e7e7ea', padding: '32px 22px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/app" style={{ color: TEC_COLORS.gold, fontSize: 13, textDecoration: 'none' }}>← Back</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <span style={{ fontSize: 30 }}>{pm.icon}</span>
          <h1 style={{ color: TEC_COLORS.gold, margin: 0, fontSize: 23 }}>{pm.label}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: tm.tone, border: `1px solid ${tm.tone}66`, borderRadius: 20, padding: '3px 10px' }}>{tm.label} · {tm.band}</span>
          <span style={{ fontSize: 12, color: sm.tone, border: `1px solid ${sm.tone}55`, borderRadius: 20, padding: '3px 10px' }}>{sm.label}</span>
          <span style={{ fontSize: 12, opacity: 0.7, border: '1px solid #ffffff22', borderRadius: 20, padding: '3px 10px' }}>{r.grantedBy === 'PANEL' ? 'Human review panel' : 'Automated (System)'}</span>
        </div>

        {r.grantedAt && (
          <p style={{ opacity: 0.6, fontSize: 13, marginTop: 12 }}>
            Granted {r.grantedAt}{r.validUntil ? ` · valid until ${r.validUntil} (renewal re-evaluates criteria)` : ''}
          </p>
        )}

        {/* Criteria breakdown */}
        <h2 style={{ color: TEC_COLORS.gold, fontSize: 15, marginTop: 22 }}>Criteria</h2>
        <div style={{ marginTop: 8 }}>
          {r.criteria.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid #ffffff10', fontSize: 13.5 }}>
              <span style={{ display: 'flex', gap: 8 }}>
                <span>{c.passed ? '✅' : '⬜'}</span>
                <span style={{ opacity: c.passed ? 1 : 0.7 }}>{c.label}</span>
              </span>
              <span style={{ color: c.passed ? '#22C55E' : '#9ca3af', whiteSpace: 'nowrap' }}>
                {fmt(c.value)} / {fmt(c.threshold)}
              </span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, opacity: 0.55, lineHeight: 1.6, borderLeft: `2px solid ${TEC_COLORS.gold}55`, paddingLeft: 12 }}>
          {r.status === 'CANDIDATE'?
            'Candidate — some criteria are not yet met, or human review is pending. Recognition is granted only when ALL criteria pass.'
            : 'Criteria are evaluated on rolling periods by Analytics from Legend evidence; thresholds are governed by System. Recognition is earned, never bought.'}
        </p>
      </div>
    </main>
  );
}
