# Morning / grow (Meshulam) — Sandbox Payment Testing

Reference for testing the payment flow against Morning's **sandbox** (not production).

## Sandbox test credit card

Use on the `sandbox.meshulam.co.il/credit-checkout?...` page that the payment form redirects to. Declined on production — sandbox only.

| Field | Value |
|---|---|
| Card number | `4580 4580 4580 4580` |
| CVV (CVC) | `666` |
| Expiry | any **future** date (e.g. `12/30`) |
| ID / ת.ז | `458045804` |
| Cardholder name | anything (e.g. Israel Israel) |

Test customer (if a form asks): name `Israel Israel`, email `test@gmail.com`, phone `0500000000`.

Source: <https://www.wpdating.com/documentation/wp-dating-meshulam-payment-gateway-configuration/>

## Prerequisites for a payment form to generate (see [[project-morning-payment-form]])

1. Active clearing terminal connected at `/market/digital-payments` (grow) — else `errorCode 2600`.
2. `MORNING_PLUGIN_ID` = the terminal's `id` from `GET /plugins` (`dabe73b3-48af-43cb-b8d8-dd3d16f11413`), NOT `externalKey`.
3. Top-level `amount` on the request (handled in `src/lib/morning.ts`) — else `errorCode 2417`.
4. `https` callback URLs — Morning's WAF returns a 403 for any `http://localhost` success/failure/notify URL.

## Quick local check (no order, no DB)

```
npx tsx scripts/test-morning.ts
```

Prints the `sandbox.meshulam.co.il/credit-checkout` URL; open it to see the page.

## Full flow on Vercel

- Set all `MORNING_*` env vars in Vercel **without** surrounding quotes or inline `#` comments (bulk `.env` import mangles values with special chars), then redeploy.
- `NEXTAUTH_URL = https://lights-and-vessels.vercel.app` (localhost → WAF 403 on callbacks).
- Register the webhook in the sandbox (Developers → Webhooks) → `https://lights-and-vessels.vercel.app/api/webhooks/morning`, secret = `MORNING_WEBHOOK_SECRET`.
- A 401 `"גישה נדחתה"` at the token step = wrong/garbled `MORNING_API_KEY_ID` / `MORNING_API_SECRET` on Vercel.
