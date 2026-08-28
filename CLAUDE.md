# TEC Elite — Claude Code Instructions

> ⚡ **SESSION START:** اقرأ `knowledge-base/C-02___CURRENT_STATE_.md` + **app charter
> `knowledge-base/C-127___ELITE_EXCELLENCE_RUNTIME.md`** من `yasira82/tec-knowledge-base` (branch: `main`).

## What This App Is

**The Excellence Runtime** of the Pi economy (C-127) — the **System of
Recognition**. Elite answers one question:

```
"Are you among the best?"
```

Elite officially recognizes top performers based on **verified evidence, never
self-promotion or paid placement**. It is the middle link of the value chain
**Legend (evidence) → Elite (recognition) → VIP (experience)**.

Built from `tec-template-base` (Next.js 15 frontend).

**Current Phase: Elite V0/V1 — Recognition preview (read-only).** Identity /
domain / slug / legal + a themed **recognition home** (programs · tiers
BRONZE→PLATINUM · criteria-met status) + a `/recognition/[id]` detail page (full
criteria breakdown) + **Elite Certificate** (the Pi Portal "Process a
Transaction" gate — an *adjacent* premium, NOT recognition for sale). Real
recognition (Analytics-evaluated criteria + human review) is Phase 3. Deployed (Mainnet) · Pi App ID registered · env set · payment live · referral growth loop wired (C-133).

---

## Pi App Identity

| Field | Value |
|-------|-------|
| **App** | TEC Elite |
| **Domain** | `https://elite.tecosystem.app` |
| **Pi App ID** | ✅ Registered (Mainnet) · Vercel `NEXT_PUBLIC_PI_APP_ID` |
| **APP_SOURCE slug** | `elite` (payment-service resolves `PI_API_KEY_ELITE`) |
| **PI_SANDBOX** | `false` (Mainnet) |

---

## Elite-Specific Rules (C-127)

### 🔴 Constitutional rule — recognition is CRITERIA-BASED, earned not bought
Elite recognition **cannot be purchased** — it is **free** and granted only when
**all criteria pass**. No overrides, no paid placement. The pipeline:
- **Evidence** → Legend (C-126) provides the achievement record.
- **Criteria evaluation** → Analytics (C-105) computes whether thresholds are met.
- **Thresholds / governance** → System (C-110) sets and governs them.
- **GOLD + PLATINUM** additionally require **human review** (1 reviewer / 3-person panel).

The only paid surface is an **Elite-adjacent** premium (a printable / NFT
certificate of a recognition already earned) — never the recognition itself.

### The ownership boundary
Elite **OWNS**: recognition programs + tiers, recognition records + lifecycle,
certificates/badges. Elite does **NOT OWN**:
- **Score computation** → Analytics. **Achievement records** → Legend.
- **Identity / verification** → Hub + Zone. **Benefit delivery** → VIP (C-128).
- **Governance** → System. **Economic execution** → payment-service.

### Isolation (P6)
A user sees their OWN recognitions — identity from the `tec_user` session cookie
server-side, **never** a query param or body. Public verification (is X Elite?) is
allowed read-only. No session → own-scope fails closed.

**Reference of record:** `yasira82/tec-knowledge-base` —
`C-127___ELITE_EXCELLENCE_RUNTIME.md` (charter) + `C-12_Dual_Mode_Payment.md`
(payment anti-regression) + `C-123` (session/cookies).

---

## Stack

- Next.js 15 App Router + TypeScript strict · React 18
- `@yasser172/tec-ui` (design system) · `@yasser172/tec-auth` · `@yasser172/tec-sdk`
- Vitest (unit) + Playwright (e2e) · Deployment: Vercel

---

## Architecture Rules (non-negotiable)

### CSRF — middleware ONLY (P2 single source of truth)
CSRF is enforced in **`middleware.ts`** and **nowhere else**: a request is trusted
if the double-submit token matches **OR** it is first-party (Origin host === Host /
`*.tecosystem.app`).
- ❌ **NEVER** add a CSRF check inside a route handler (`csrfCookie !== csrfHeader`
  → 403). It 403's legit Mode-2 payments in Pi Browser (drops `sameSite=None`
  cookies). The CI `payment-policy` job fails the build if you do. (KB C-12 §11)
- ✅ A route may *forward* `x-csrf-token` to a downstream call; it must never *validate* it.

### ADR-007 — Dual-mode payment (Pi foreign session)
Every buy handler MUST guard before touching `window.Pi`:
```typescript
const isHubNavigation = () =>
  document.referrer.toLowerCase().includes('hub.tecosystem.app');
if (isHubNavigation() || !(window as any).Pi || !piReady) {
  redirectToHubPayment(...);   // Mode 1: Hub modal → /hub?pay=1&...
  return;
}
// Mode 2: standalone — createPaymentRecord() then createU2APayment() (src/lib/pi-payment.ts)
```
> Elite Certificate (adjacent premium) is the only buy flow — never recognition
> itself. Approve under `PI_API_KEY_ELITE` (never the default Hub key — the
> Analytics approve→502 lesson, C-12 §11).

### ADR-009 — Unified payment contract
`amount` is a **number**; gateway path is **`/api/payment/*`** (singular); the only
inter-service header is **`x-internal-key`** + `INTERNAL_SECRET`. Don't re-declare
payment Zod locally — shapes live in `@yasser172/tec-sdk`.

### Two-SDK boundary
```
Client components → src/lib-client/*  (browser state, Pi hooks)
API routes (BFF)  → @yasser172/tec-sdk via /api/bff/*  (server-only)
```

### Auth / cookies (LOCKED)
SSO via Hub cookies `tec_access_token`, `tec_csrf`, `tec_user`. Never localStorage.
Identity is derived from the `tec_user` cookie server-side — **never from the request body**.

---

## Setup status + Roadmap (C-127)

```
Elite V0/V1 — Recognition preview (customized from template):
  ✅ package.json name = tec-elite · APP_SOURCE = 'elite'
  ✅ sso-callback ALLOWED_AUDIENCES → elite.tecosystem.app + tec-elite.vercel.app
  ✅ privacy + terms → TEC Elite / elite.tecosystem.app
  ✅ NEW-A: no NEXT_PUBLIC_API_GATEWAY_URL / Railway host in the client bundle
  ✅ /app themed: recognition programs + tiers + criteria status + Elite Certificate (real Pi U2A)
  ✅ /recognition/[id] detail (full criteria breakdown) + BFF /api/bff/elite/recognition

Live on Mainnet — all complete (SSoT: architecture/app-fleet.yaml):
  ✅ Register Pi App ID (Pi Developer Portal) → Vercel NEXT_PUBLIC_PI_APP_ID +
    API_GATEWAY_URL · INTERNAL_SECRET · SSO_SECRET · PI_SANDBOX=false.
  ✅ payment-service: set PI_API_KEY_ELITE on Railway (approve→502 otherwise, C-12 §11).
  ✅ Hub SSO: add elite.tecosystem.app + tec-elite.vercel.app to Hub /api/auth/sso
    ALLOWED_TARGETS + Hub domain registry.
  ✅ Deploy (Vercel) + runtime-verify login (C-123) + a real Elite Certificate payment
    Mode 1 (Hub) AND Mode 2 (standalone).

Elite V1+ (post-Portal — C-127): Analytics-evaluated criteria (daily/weekly/monthly
  by tier) → CANDIDATE flagging → human review (GOLD/PLATINUM) → certificate issuance
  → renewal cycles. Gated on Legend + Analytics + Zone operational + 5k users.
```

---

## What NOT To Do

- Do NOT sell or grant recognition for payment — criteria-based only, free (C-127)
- Do NOT compute scores in Elite — Analytics evaluates; Legend supplies evidence
- Do NOT auto-grant GOLD/PLATINUM — they require human review
- Do NOT mint verification — present Zone's verified flag, never create it
- Do NOT validate CSRF in a route handler — middleware only (CI blocks it)
- Do NOT send `amount` as a string, or use `/payments` / `x-service-secret`
- Do NOT skip the ADR-007 `isHubNavigation()` guard before `window.Pi`
- Do NOT store tokens in localStorage; do NOT derive identity from the body
- Do NOT add `NEXT_PUBLIC_*` for internal service URLs or `INTERNAL_SECRET`

---

## Commit Convention

```
feat(elite):  new recognition feature   fix(payment): payment flow fix (test carefully)
fix(elite):   bug fix                    chore(scope):  build/config
```

---

## Skills

Available via plugin — invoke automatically when the situation matches:

| Situation | Skill |
|-----------|-------|
| Writing new feature or fixing a bug → use TDD | `/tdd` |
| Bug, regression, or unexpected behavior | `/diagnose` |
| Writing or modifying tests | `/test-guard` |
| Writing or modifying BFF routes, payment handlers, or API contracts | `/clean-code-guard` |
| Updating docs, CLAUDE.md, or knowledge-base entries | `/docs-guard` |
| Planning a new feature or architectural decision | `/grill-with-docs` |
| Breaking down a roadmap item into GitHub Issues | `/to-issues` |
| Session is getting long or context is filling up | `/handoff` |
| Adding pre-commit hooks to this repo | `/setup-pre-commit` |
