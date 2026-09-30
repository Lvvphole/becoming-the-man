# Becoming the Man She Can Trust — Website System Architecture Amendment v1.3

Status: **APPROVED FR-105 PRODUCT-ARCHITECTURE AMENDMENT**  
Approved: 30 September 2026  
Amends: Website System Architecture v1.0 — LOCKED, as amended by v1.1 and v1.2; FR-105 Contact only.

All architecture requirements outside the explicit FR-105 scope below remain unchanged. This amendment does not alter the 500-line reviewability limit, exact-head CI, independent Codex review, protected-branch expectations, or separate user merge authority.

## FR-105A — Contact privacy and provider boundary

For **POST /api/contact** only:

1. Required visitor fields remain inquiry type, name, email, and message.
2. Google reCAPTCHA is the selected human-verification provider for the Contact form. Its secret remains server-only.
3. Raw Contact inquiry content SHALL NOT be persisted in Supabase or analytics.
4. Permitted persistent anti-abuse state is limited to privacy-minimized metadata required to enforce and safely replay the Contact request, including keyed HMAC identifiers, request identity, and timestamps/status needed by the rate-limit contract.
5. Emailable remains the bounded email-plausibility provider.
6. Resend remains the Contact delivery provider. Operator delivery is required for Contact acceptance; the visitor receipt is best-effort after operator delivery succeeds.
7. Resend operator delivery SHALL remain idempotent by the stable Contact request ID.

## FR-105B — Contact execution order

The active Contact sequence is:

```text
validate fields / honeypot
-> reCAPTCHA
-> request-bound email/IP rate-limit claim
-> Emailable verification
-> idempotent Resend operator delivery
-> best-effort visitor receipt
-> return request_id + accepted/error state
```

No step creates a durable raw inquiry record.

## FR-105C — Request-bound rate-limit replay

The 24-hour Contact abuse limit remains independently keyed by normalized email and client IP.

A successful claim SHALL bind the active email/IP HMAC pair to the stable Contact request ID.

- A different request ID matching either active email or active IP remains rate-limited.
- The same request ID with the same bound identifiers MAY replay after a transient downstream failure.
- The same request ID with different identifiers SHALL fail closed.
- Replay authority does not waive reCAPTCHA, email verification, or provider idempotency.
- The database stores no raw email, raw IP, name, message, or inquiry type for this mechanism.

This replay rule prevents a transient Emailable or Resend failure from consuming the visitor's entire 24-hour opportunity while preserving the one-request abuse ceiling.

## FR-105D — Contact success and observability

For FR-105:

- API acceptance occurs only after the operator notification is accepted by Resend.
- Visitor-receipt failure after operator success does not convert the inquiry to failure and must not resend the operator message.
- The returned `request_id` is the stable delivery/replay correlation key; it is not a reference to a persisted raw inquiry.
- `contact_submit` may be emitted only after operator-delivery acceptance.
- `contact_error` may contain stable non-sensitive error/category metadata only.
- Raw email, name, message body, IP address, and inquiry text never enter analytics.

## Supersession boundary

This amendment supersedes only the following FR-105-specific v1.0 requirements:

- the global abuse-protection row insofar as it selects Cloudflare Turnstile for the Contact form;
- the **POST /api/contact** sequence requiring Turnstile and durable inquiry persistence;
- Contact analytics language requiring durable inquiry creation before success;
- any FR-105 success invariant that requires a persisted raw inquiry record.

All other v1.0, v1.1, and v1.2 requirements remain active.
