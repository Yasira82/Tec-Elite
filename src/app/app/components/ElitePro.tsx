'use client';

// ElitePro — Elite's subscription surface.
//
// ── The Elite Certificate buy button was removed, and this is why ───────────────
//
// It charged 5π for `elite-certificate` and delivered NOTHING. Not a degraded
// product — there is no issuance, no record, no download, no backend, nowhere in
// this repo or in tec-core-backend. The buyer paid and received a status line
// saying the payment succeeded.
//
// `tec-commerce-service` ignoring the payment was CORRECT: a certificate is not a
// subscription, and C-127 forbids selling recognition. So this was never a parser
// bug to patch. It was a buy button in front of an unbuilt product.
//
// Two honest paths existed — stop the button, or build the issuance. Stopping it is
// what shipped, for three reasons:
//
//   · Selling something that does not exist is not revenue, it is a liability.
//   · Nothing is lost on compliance. The Pi Portal "Process a Transaction" gate was
//     passed long ago; it is not re-checked.
//   · A certificate certifies a recognition the holder has ALREADY EARNED (C-127).
//     Building the issuance before knowing how many recognitions exist would be
//     building a product whose addressable buyers might be zero.
//
// What replaces it is a sentence that is true, including the part users most need
// to hear: recognition itself is free and can never be bought.
//
// ── If the issuance is built later ─────────────────────────────────────────────
//
// The materials already exist: `EliteRecognition` in tec-identity-service carries
// owner, program, tier, granted_at, slug and the frozen criteria snapshot — every
// field a certificate would print. The missing pieces are a record of the purchase,
// a rendered artefact, and a route to fetch it. And the purchase must be gated on
// actually HOLDING the recognition being certified, or this comes straight back.

import { useEffect, useState } from 'react';
import { TEC_COLORS } from '@yasser172/tec-ui';

export default function ElitePro() {
  // Reflect the real subscription (activated by commerce-service when a Pro payment
  // completes). Pro ONLY while the period is live — no auto-renewal / no downgrade job.
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/bff/subscription', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json()).catch(() => ({}))
      .then((j: Record<string, unknown>) => {
        const d = (j?.data ?? j ?? {}) as Record<string, unknown>;
        const s = ((d?.subscription ?? d) ?? {}) as Record<string, unknown>;
        const end  = typeof s.current_period_end === 'string' ? new Date(s.current_period_end) : null;
        const live = s.isActive !== false && !(s.isExpired === true || (end !== null && end.getTime() < Date.now()));
        const plan = String(s.plan ?? '').toUpperCase();
        setIsSubscribed(live && (plan === 'PRO' || plan === 'ENTERPRISE'));
        // Renewal signal (Pi Pro is one-time, no auto-renewal) — commerce sends
        // daysRemaining; fall back to the period end. Drives a re-subscribe nudge.
        const days = typeof s.daysRemaining === 'number'
          ? s.daysRemaining
          : end ? Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000)) : null;
        setDaysRemaining(days);
      })
      .catch(() => {});
  }, []);

  if (isSubscribed) {
    return (
      <div style={{ background: TEC_COLORS.surface, border: `1px solid ${TEC_COLORS.gold}55`, borderRadius: 16, padding: 20, marginTop: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TEC_COLORS.gold }}>★ You&rsquo;re on Pro</div>
        <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 6 }}>
          Your subscription is active. Thanks for supporting TEC.
        </div>
        {typeof daysRemaining === 'number' && (
          <div style={{ fontSize: 12, fontWeight: daysRemaining <= 7 ? 700 : 600, color: daysRemaining <= 7 ? TEC_COLORS.gold : TEC_COLORS.subtext, marginTop: 8 }}>
            {daysRemaining <= 7 ? '⏳ ' : ''}Expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}{daysRemaining <= 7 ? ' — re-subscribe to keep Pro (one-time monthly, no auto-renewal).' : '.'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: 20, background: TEC_COLORS.surface, borderRadius: 14,
      border: `1px solid ${TEC_COLORS.gold}33`, maxWidth: 440,
    }}>
      <h2 style={{ margin: 0, color: TEC_COLORS.gold, fontSize: 18 }}>Elite recognition is free</h2>
      <p style={{ opacity: 0.75, fontSize: 13, margin: '8px 0 6px' }}>
        It is granted when the criteria pass — from verified evidence, never from a
        payment. There is nothing to buy here, and there never will be.
      </p>
      <p style={{ opacity: 0.55, fontSize: 11.5, margin: 0 }}>
        A printable certificate of a recognition you have earned is planned and not
        yet available. It will be listed here when it exists.
      </p>
    </div>
  );
}
