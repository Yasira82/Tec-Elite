'use client';

// ElitePro — the real Pi U2A payment surface (the Pi Portal "Process a
// Transaction" gate). IMPORTANT (C-127): Elite recognition itself is FREE and
// can NEVER be purchased — it is earned from verified evidence. This is an
// Elite-ADJACENT premium (enhanced Elite page / printable + NFT certificate),
// not recognition for sale. Keeps the ADR-007 dual-mode guard.
import { useEffect, useState } from 'react';
import { TEC_COLORS } from '@yasser172/tec-ui';
import {
  isHubNavigation,
  redirectToHubPayment,
  createPaymentRecord,
  createU2APayment,
} from '@/lib/pi-payment';

const ELITE_CERT = { id: 'elite-certificate', name: 'Elite Certificate (printable)', price: 5 };

export default function ElitePro() {
  const [piReady, setPiReady] = useState(false);
  const [status, setStatus]   = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as { __TEC_PI_READY?: boolean }).__TEC_PI_READY) setPiReady(true);
    const onReady = () => setPiReady(true);
    window.addEventListener('tec-pi-ready', onReady);
    return () => window.removeEventListener('tec-pi-ready', onReady);
  }, []);

  const handleBuy = async () => {
    const { id, name, price } = ELITE_CERT;

    // ── ADR-007 guard — ALWAYS before touching window.Pi ──
    if (isHubNavigation() || !(window as { Pi?: unknown }).Pi || !piReady) {
      redirectToHubPayment({ amount: price, itemId: id, memo: name });   // Mode 1
      return;
    }

    // ── Mode 2: standalone Pi Browser payment ──
    setStatus('Creating payment…');
    const internalId = await createPaymentRecord(price, id, name);
    if (!internalId) { setStatus('Could not start payment.'); return; }

    setStatus('Awaiting Pi approval…');
    const result = await createU2APayment(price, name, { item_id: id }, internalId);
    setStatus(
      result.success ? `✅ Purchased — txid ${result.txid}` :
      result.status === 'cancelled' ? 'Payment cancelled.' :
      `❌ ${result.message ?? 'Payment failed.'}`,
    );
  };

  return (
    <div style={{
      padding: 20, background: TEC_COLORS.surface, borderRadius: 14,
      border: `1px solid ${TEC_COLORS.gold}33`, maxWidth: 440,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h2 style={{ margin: 0, color: TEC_COLORS.gold, fontSize: 18 }}>Elite Certificate</h2>
        <span style={{ color: TEC_COLORS.gold, fontWeight: 800 }}>π 5</span>
      </div>
      <p style={{ opacity: 0.75, fontSize: 13, margin: '8px 0 6px' }}>
        A printable / NFT certificate of an Elite recognition you have already earned.
      </p>
      <p style={{ opacity: 0.55, fontSize: 11.5, margin: '0 0 14px' }}>
        Recognition itself is free and cannot be bought — only earned from evidence (C-127).
      </p>
      <button
        onClick={handleBuy}
        style={{
          background: `linear-gradient(135deg, ${TEC_COLORS.gold}, ${TEC_COLORS.goldDark})`,
          color: '#0a0800', border: 'none', borderRadius: 10,
          padding: '11px 20px', fontWeight: 700, cursor: 'pointer',
        }}>
        Buy certificate with Pi
      </button>
      <p style={{ opacity: 0.5, fontSize: 11, marginTop: 10 }}>Pi SDK: {piReady ? 'ready' : 'loading…'}</p>
      {status && <p style={{ marginTop: 8, fontSize: 13 }}>{status}</p>}
    </div>
  );
}
