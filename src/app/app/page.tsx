'use client';

// TEC Elite — Recognition home (C-127), read-only V1.
// Official, criteria-based recognition from verified evidence — earned, never
// bought. Middle link of Legend (evidence) → Elite (recognition) → VIP (experience).
import Link from 'next/link';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { RECOGNITIONS, PROGRAM_META, TIER_META, STATUS_META } from '@/lib/elite/recognition';
import ElitePro from './components/ElitePro';

export default function EliteHome() {
  const active = RECOGNITIONS.filter((r) => r.status === 'ACTIVE');
  const candidates = RECOGNITIONS.filter((r) => r.status === 'CANDIDATE');

  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: '#e7e7ea', padding: '32px 22px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <header style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 34 }}>🎖️</div>
          <h1 style={{ color: TEC_COLORS.gold, margin: '4px 0 2px', fontSize: 26 }}>TEC Elite</h1>
          <p style={{ opacity: 0.7, margin: 0, fontSize: 14 }}>
            Excellence Runtime — evidence before recognition. Earned, never bought.
          </p>
        </header>

        {/* Chain explainer */}
        <div style={{ marginTop: 20, padding: '12px 16px', background: TEC_COLORS.surface, borderRadius: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
          {['Legend · Evidence', 'Elite · Recognition', 'VIP · Experience'].map((s, i, a) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: i === 1 ? TEC_COLORS.gold : '#9ca3af' }}>{s}</span>
              {i < a.length - 1 && <span style={{ opacity: 0.4 }}>→</span>}
            </span>
          ))}
        </div>

        {/* Active recognitions */}
        <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 28, marginBottom: 12 }}>Your recognitions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
          {[...active, ...candidates].map((r) => {
            const pm = PROGRAM_META[r.program]; const tm = TIER_META[r.tier]; const sm = STATUS_META[r.status];
            const passed = r.criteria.filter((c) => c.passed).length;
            return (
              <Link key={r.id} href={`/recognition/${r.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: 16, background: TEC_COLORS.surface, borderRadius: 12, border: `1px solid ${tm.tone}33`, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{pm.icon}</span>
                    <span style={{ fontSize: 11, color: sm.tone, border: `1px solid ${sm.tone}55`, borderRadius: 20, padding: '2px 8px' }}>{sm.label}</span>
                  </div>
                  <div style={{ color: '#e7e7ea', fontWeight: 700, marginTop: 10 }}>{pm.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: tm.tone }}>{tm.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>· {tm.band}</span>
                  </div>
                  <div style={{ opacity: 0.55, fontSize: 11, marginTop: 10 }}>
                    Criteria {passed}/{r.criteria.length} · {r.grantedBy === 'PANEL' ? 'human review' : 'auto'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p style={{ opacity: 0.55, fontSize: 12, marginTop: 20, lineHeight: 1.6, borderLeft: `2px solid ${TEC_COLORS.gold}55`, paddingLeft: 12 }}>
          <strong>Earned, not bought (C-127).</strong> Recognition is criteria-based only — no overrides,
          no paid placement. Evidence comes from Legend, criteria are evaluated by Analytics, thresholds are
          governed by System; Gold/Platinum add human review. Elite recognition itself is free. Read-only sample.
        </p>

        {/* Elite certificate (adjacent premium — NOT recognition for sale) */}
        <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 32, marginBottom: 12 }}>Certificate</h2>
        <ElitePro />
      </div>
    </main>
  );
}
