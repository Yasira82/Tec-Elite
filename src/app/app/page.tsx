'use client';

// TEC Elite — Recognition home (C-127), read-only V1.
// Official, criteria-based recognition from verified evidence — earned, never
// bought. Middle link of Legend (evidence) → Elite (recognition) → VIP (experience).
// App shell: Home / Awards / Certificate / Settings bottom nav.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { useTranslation } from '@/lib/i18n';
import { PROGRAM_META, TIER_META, STATUS_META, type Recognition } from '@/lib/elite/recognition';
import ElitePro from './components/ElitePro';
import { BottomNav, type EliteTab } from './components/BottomNav';
import { SettingsView } from './components/SettingsView';

export default function EliteHome() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<EliteTab>('home');

  // Real data end-to-end (C-135 §4): the caller's OWN recognitions (identity from
  // the session cookie, P6) or an honest empty state — never a fabricated sample.
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  useEffect(() => {
    let alive = true;
    fetch('/api/bff/elite/recognition', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        if (d && d.source === 'live' && Array.isArray(d.recognitions)) {
          setRecognitions(d.recognitions);
          setStatus('ready');
        } else {
          setStatus('unavailable');
        }
      })
      .catch(() => { if (alive) setStatus('unavailable'); });
    return () => { alive = false; };
  }, []);

  const active = recognitions.filter((r) => r.status === 'ACTIVE');
  const candidates = recognitions.filter((r) => r.status === 'CANDIDATE');

  const headerTitle =
    tab === 'recognitions' ? t.elite.nav.recognitions
    : tab === 'certificate' ? t.elite.nav.certificate
    : tab === 'settings' ? t.elite.nav.settings
    : t.elite.brand;

  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: '#e7e7ea', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 22px calc(96px + env(safe-area-inset-bottom))' }}>
        <header style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 34 }}>🎖️</div>
          <h1 style={{ color: TEC_COLORS.gold, margin: '4px 0 2px', fontSize: 26 }}>{headerTitle}</h1>
          {tab === 'home' && (
            <p style={{ opacity: 0.7, margin: 0, fontSize: 14 }}>{t.elite.tagline}</p>
          )}
        </header>

        {/* ── HOME ────────────────────────────────────────────────── */}
        {tab === 'home' && (<>
          {/* Chain explainer */}
          <div style={{ marginTop: 20, padding: '12px 16px', background: TEC_COLORS.surface, borderRadius: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
            {['Legend · Evidence', 'Elite · Recognition', 'VIP · Experience'].map((sname, i, a) => (
              <span key={sname} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: i === 1 ? TEC_COLORS.gold : '#9ca3af' }}>{sname}</span>
                {i < a.length - 1 && <span style={{ opacity: 0.4 }}>→</span>}
              </span>
            ))}
          </div>

          <p style={{ opacity: 0.55, fontSize: 12, marginTop: 20, lineHeight: 1.6, borderLeft: `2px solid ${TEC_COLORS.gold}55`, paddingLeft: 12 }}>
            <strong>Earned, not bought.</strong> Recognition is criteria-based only — no overrides,
            no paid placement. Evidence comes from Legend, criteria are evaluated by Analytics, and
            Gold and Platinum add a human review. Recognition itself is always free — see your
            awards in the Awards tab.
          </p>
        </>)}

        {/* ── AWARDS (recognitions) ───────────────────────────────── */}
        {tab === 'recognitions' && (<>
          <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 12, marginBottom: 12 }}>{t.elite.yourRecognitions}</h2>

          {status === 'loading' && (
            <div style={{ padding: 30, textAlign: 'center', opacity: 0.6, fontSize: 14 }}>Loading your recognitions…</div>
          )}
          {status === 'unavailable' && (
            <div style={{ padding: '36px 24px', background: TEC_COLORS.surface, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 26 }}>🎖️</div>
              <div style={{ color: '#e7e7ea', fontWeight: 800, marginTop: 8 }}>No recognitions yet</div>
              <p style={{ opacity: 0.65, fontSize: 13, lineHeight: 1.6, maxWidth: 420, margin: '8px auto 0' }}>
                Sign in with Pi to see your Elite recognitions. Recognition is earned from verified evidence
                (Legend) evaluated against governed criteria (Analytics · System) — it appears here once you qualify.
              </p>
            </div>
          )}
          {status === 'ready' && active.length === 0 && candidates.length === 0 && (
            <div style={{ padding: '36px 24px', background: TEC_COLORS.surface, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 26 }}>🎖️</div>
              <div style={{ color: '#e7e7ea', fontWeight: 800, marginTop: 8 }}>No recognitions yet</div>
              <p style={{ opacity: 0.65, fontSize: 13, lineHeight: 1.6, maxWidth: 420, margin: '8px auto 0' }}>
                Keep building verified evidence across the ecosystem — recognition is criteria-based and appears
                here automatically once you meet a program&apos;s thresholds.
              </p>
            </div>
          )}

          {status === 'ready' && (active.length > 0 || candidates.length > 0) && (
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
          )}

          <p style={{ opacity: 0.55, fontSize: 12, marginTop: 20, lineHeight: 1.6, borderLeft: `2px solid ${TEC_COLORS.gold}55`, paddingLeft: 12 }}>
            <strong>Earned, not bought.</strong> Recognition is criteria-based only — no overrides,
            no paid placement. Evidence comes from Legend, criteria are evaluated by Analytics.
            Gold and Platinum add a human review. Recognition itself is always free.
          </p>
        </>)}

        {/* ── CERTIFICATE ─────────────────────────────────────────── */}
        {tab === 'certificate' && (<>
          <h2 style={{ color: TEC_COLORS.gold, fontSize: 16, marginTop: 12, marginBottom: 12 }}>{t.elite.certificate}</h2>
          {/* Elite certificate (adjacent premium — NOT recognition for sale) */}
          <ElitePro />
        </>)}

        {/* ── SETTINGS ────────────────────────────────────────────── */}
        {tab === 'settings' && <SettingsView />}
      </div>

      <BottomNav active={tab} onSelect={setTab} />
    </main>
  );
}
