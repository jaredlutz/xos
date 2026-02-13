# xOS — CEO Operating System

Decision-first operating layer: **Commitments → Proof → Slippage → Decision Queue**, with a dual-mode **Command Center** (operations view) and **Hyperfocus** (decision-first view).

## CEO Mode (Command Center vs Hyperfocus)

- **CEO Mode OFF — Command Center**: Operations-focused dashboard with CEO Actions Today, Live Scoreboard (KPIs), Momentum Risks (signals), Proof Inbox (for CEO/EXEC), and Operating Rhythm (L10, top commitments).
- **CEO Mode ON — Hyperfocus**: Minimalist view with a “You have X decisions to clear” banner, Decision Queue (≤7), Slippage card, Proof Inbox, and a compact Commitments snapshot. KPIs and signals are hidden.

The CEO mode toggle is persisted in the database (`user_prefs.ceo_mode`) and synced to localStorage for instant UI. Use the toggle in the layout to switch; the dashboard re-renders accordingly.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, shadcn-style UI
- Neon Postgres, Drizzle ORM
- WorkOS AuthKit
- Vercel Cron (slippage detection every 15 min)

## Local development

1. **Install**

   ```bash
   cd apps/xos && bun install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `DATABASE_URL` — Neon Postgres connection string
   - `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_COOKIE_PASSWORD`, `WORKOS_REDIRECT_URI` (e.g. `http://localhost:3000/callback`)
   - `CRON_SECRET` — any secret string (for local cron trigger)
   - `CEO_EMAIL` — used by seed for CEO user

3. **Database**

   ```bash
   bun run db:push
   bun run seed
   ```

   Seed creates demo data: systems, owners, commitments (including one past-due for slippage), a “Greenlight SMS campaign?” decision, KPI metrics, signals, CEO actions (one linked to that decision), and optional CEO user prefs with CEO mode OFF. Re-running `bun run seed` is idempotent for commitments and decisions; it replaces KPI values, and replaces all signals and CEO actions with the demo set.

4. **Run**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in via WorkOS; dashboard at `/dashboard`.

5. **Build** (optional). For `bun run build` to succeed without a real DB, set placeholder env vars:
   `DATABASE_URL`, `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`, `WORKOS_COOKIE_PASSWORD`.

## Deploy (Vercel)

1. Connect repo to Vercel.
2. Set env vars (same as above). For cron, set `CRON_SECRET`; Vercel Cron will send it when invoking `/api/cron/detect-slippage`.
3. Deploy. Run migrations (or `db:push`) against production DB, then run seed if needed.

## Webhooks

### Commitments

```bash
# Sign payload with HMAC SHA256 using the system's secret; put result in x-xos-signature.
curl -X POST http://localhost:3000/api/webhooks/commitments \
  -H "Content-Type: application/json" \
  -H "x-xos-signature: <hex-hmac-sha256>" \
  -d '{
    "systemKey": "investor-portal",
    "externalRef": "abc123",
    "title": "Reduce onboarding steps",
    "outcome": "Investor Portal onboarding reduced from 7 to 3 steps",
    "owner": { "email": "jared@example.com", "displayName": "Jared" },
    "dueDate": "2026-02-15T00:00:00Z",
    "blastRadius": "HIGH",
    "priority": "P0"
  }'
```

### Proofs

```bash
curl -X POST http://localhost:3000/api/webhooks/proofs \
  -H "Content-Type: application/json" \
  -H "x-xos-signature: <hex-hmac-sha256>" \
  -d '{
    "systemKey": "investor-portal",
    "externalRef": "abc123",
    "proofs": [
      { "type": "URL", "label": "Live flow", "url": "https://portal.example.com/onboard" }
    ]
  }'
```

Signature: `HMAC-SHA256(secret, rawRequestBody)` encoded as hex.

## Security

- All dashboard and admin routes require WorkOS session.
- Webhooks require valid `x-xos-signature` (HMAC SHA256 per system secret).
- Cron route protected by `CRON_SECRET`.
- Roles: CEO (full + decide), EXEC (view + verify proof), OWNER (own commitments + proof + slippage reason), VIEWER (read-only).
- **Admin** (KPIs, Signals, CEO Actions) is restricted to CEO and EXEC via `requireRole(['CEO','EXEC'])` in `/admin` layout.

## Admin (CEO/EXEC only)

- **KPIs** (`/admin/kpis`): Create and edit KPI metrics (key, label, value, delta, period). Live Scoreboard on the Command Center uses fixed keys (e.g. `capital.pipeline_usd`, `marketing.forms_today`).
- **Signals** (`/admin/signals`): Create and edit signals (type, severity, title, description, related commitment/decision/system). Momentum Risks card shows OPEN signals.
- **CEO Actions** (`/admin/ceo-actions`): Create and edit CEO actions (title, why it matters, impact, due date, owner, action buttons, linked decision/commitment). CEO Actions Today card shows OPEN actions.

## Tests

```bash
bun run test
```

- Slippage detection: past-due commitment gets slippage row; second slip escalates and creates decision.
- Webhook signature: valid/invalid signature verification.
