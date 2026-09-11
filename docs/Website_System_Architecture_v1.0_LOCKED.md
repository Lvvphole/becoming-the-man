**LOVE \| PURPOSE \| FLOURISH**

**BECOMING THE MAN SHE CAN TRUST**

**Website System Architecture**

Version 1.0 • APPROVED & LOCKED

Subordinate to the Website Governing Product Specification v1.0 - LOCKED  
and the Website Product Specification v1.0 - APPROVED & LOCKED

**PURPOSE**

**Select the minimum production architecture, service boundaries, data model, integration contracts, security controls, AI grounding, deployment topology, and observability required to prove DOD-01 through DOD-09 without changing the locked product outcome or release sequence.**

Prepared 26 August 2026 • Architecture approved • LOCKED • Implementation NOT STARTED

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ARCHITECTURE STATE</strong></p>
<p><strong>APPROVED & LOCKED. This artifact records the approved and locked System Architecture in final v1.0 form. It does not authorize implementation. Root AGENTS.md, repository creation, provider provisioning, migrations, code, and deployment remain outside this action.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

*Approval record: System Architecture approved by user direction on 26 August 2026. Explicit lock recorded by user direction on 10 September 2026.*

**CONTENTS**

**Contents**

**01 Architecture Contract and Authority**

**02 Technology Stack and Runtime Decisions**

**03 Architecture Drivers and Invariants**

**04 Target System Context and Trust Boundaries**

**05 Repository Architecture and AGENTS.md Boundary**

**06 Frontend, Rendering, and Content Delivery**

**07 API and Integration Contracts**

**08 Supabase Data Model, RLS, and Persistence**

**09 Security, Privacy, and Abuse Controls**

**10 Email and Audience Architecture**

**11 Supabase Publishing, SEO, GEO, and Discoverability**

**12 Analytics and Observability**

**13 Admin and Operator Architecture**

**14 Commerce and Fulfillment Architecture**

**15 Assessment and Personalized Results Architecture**

**16 Becoming the Man AI Grounding Architecture**

**17 AI Evals and Promotion Gates**

**18 Deployment Topology and CI/CD**

**19 Failure Modes, Recovery, and Idempotency**

**20 Release Architecture and Exit Evidence**

**21 DOD-01 through DOD-09 Regression Review**

**22 Open Decisions and Lock Record**

**23 Source Basis and Decision Record**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>LOCK RECORD</strong></p>
<p><strong>This artifact is the approved and locked architecture. No implementation or AGENTS.md creation occurs in this lock-record action. The explicit lock decision is recorded.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**01 - ARCHITECTURE CONTRACT AND AUTHORITY**

**Architecture Contract and Authority**

| **Field**                  | **Architecture contract**                                                                                                                                                |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Governing authority**    | BTMSCT Website Governing Product Specification v1.0 - APPROVED & LOCKED, 26 August 2026.                                                                                 |
| **Product authority**      | BTMSCT Website Product Specification v1.0 - APPROVED & LOCKED, 26 August 2026.                                                                                           |
| **Architecture state**     | APPROVED & LOCKED. Implementation remains NOT STARTED.                                                                                                             |
| **Architecture objective** | Select the smallest durable system that can prove DOD-01 through DOD-09 in the approved R1 -\> R2 -\> R3 -\> R4 sequence.                                                |
| **Precedence**             | If this architecture conflicts with either locked upstream specification, the upstream specification controls. The conflict must be escalated; no silent reconciliation. |
| **Optimization rule**      | Prefer direct, provider-native capabilities and explicit ownership. Service count, code volume, model sophistication, and architectural novelty are not outcomes.        |
| **Regression rule**        | No architecture change may weaken a locked journey, canonical principle, safety boundary, operator capability, or previously accepted release.                           |
| **Next control artifact**  | After explicit lock, create a root AGENTS.md under 150 lines from this architecture before any coding agent operates in the repository.                                  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>GOVERNING ARCHITECTURE RULE</strong></p>
<p><strong>Every component, endpoint, table, provider, event, and deployment control exists only to make a governed user or operator behavior possible and verifiable. Local technical completion is not product completion.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**02 - TECHNOLOGY STACK AND RUNTIME DECISIONS**

**Technology Stack and Runtime Decisions**

| **Layer**                     | **Selected architecture**                                              | **Decision / boundary**                                                                                                                                                         |
|-------------------------------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Frontend**                  | React 18.3.1 + TypeScript/TSX + React Router v7 Framework Mode + Vite  | Preserves the locked React 18.3.1/Vite direction. Production UI is componentized. Exact compatible package versions freeze in the implementation lockfile.                      |
| **Rendering**                 | Vercel server rendering for public routes with bounded CDN caching     | Indexable routes return meaningful first-response HTML, metadata, canonical tags, Open Graph, and supported JSON-LD without client JavaScript.                                  |
| **Backend / API**             | Vercel Functions on a Vercel-supported Node.js LTS runtime             | Validated public writes, privileged DB access, webhooks, provider integrations, AI calls, exports, scheduled jobs, and admin mutations run server-side.                         |
| **Database / Auth / Storage** | Supabase PostgreSQL + RLS + Supabase Auth + Supabase Storage           | Supabase is the website operational system of record and R2 publishing store. Admin auth is Supabase Auth. Governed editorial media uses Supabase Storage.                      |
| **Email**                     | Resend API + audience/contact state + signed webhooks                  | Supabase owns consent provenance. Resend owns provider delivery and suppression. Marketing eligibility is rechecked before send.                                                |
| **Analytics**                 | PostHog Cloud                                                          | Governed custom events are behavioral evidence. Replay is disabled on /ai and /admin and sensitive fields are masked/excluded elsewhere.                                        |
| **Commerce**                  | Shopify Storefront API + Shopify hosted checkout                       | Shopify owns product, price, cart, payment, order, tax, refund, and checkout truth. The website handles no raw card data.                                                       |
| **Fulfillment**               | Printful through Shopify integration                                   | Printful owns production/fulfillment execution. Shopify remains the order/fulfillment source exposed to the website.                                                            |
| **AI**                        | OpenAI Responses API + File Search/vector store through server adapter | General-purpose GPT-5.6 runtime. GPT-5.6 Terra is default candidate and GPT-5.6 Sol the quality challenger/reference. Exact production snapshot/reasoning config is eval-gated. |
| **Abuse protection**          | Cloudflare Turnstile + Postgres-backed rate limits                     | Turnstile protects public forms. Hash-based request keys and atomic counters enforce endpoint ceilings without another persistent datastore.                                    |
| **Hosting / version control** | Vercel + GitHub protected production branch                            | Every PR receives preview deployment and required checks. Production promotion occurs only after release gates and evidence review.                                             |
| **Search evidence**           | Google Search Console after domain selection                           | R2 indexing/query evidence and operator-visible deep links. Automated API ingestion is not required unless operating friction justifies it.                                     |
| **Domain**                    | OPEN - CANONICAL_ORIGIN placeholder                                    | No domain is invented. Owned domain selection remains an R1 production blocker and Resend/DNS/SEO dependency.                                                                   |

**03 - ARCHITECTURE DRIVERS AND INVARIANTS**

**Architecture Drivers and Invariants**

| **Driver / invariant**         | **Architectural consequence**                                                                                                                                                                                           |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Owned relationship**         | Subscriber identity, consent provenance, inquiry state, content/campaign state, assessment/AI permitted evidence, provider references, and operator audit persist in Supabase. External providers are bounded adapters. |
| **Trust before extraction**    | No forced opt-in, hidden consent, exit-intent marketing, fake urgency, or email-gated assessment. Consent is purpose-specific and revocable where applicable.                                                           |
| **Canonical meaning**          | Public content stores canonical source mappings. R4 uses a versioned authority manifest. Lower-priority sources cannot override safety or Operating-System rules.                                                       |
| **Operator independence**      | Routine publishing, audience review, campaigns, contacts, commerce visibility, assessment/AI review, exports, and settings are available from authenticated admin without application rebuild.                          |
| **Release discipline**         | R1-R3 deploy and remain valid without R4. Every later promotion reruns prior release exit checks.                                                                                                                       |
| **Evidence before completion** | Critical transitions create durable DB/provider evidence plus privacy-safe events. Session replay and heatmaps are diagnostics, not acceptance proof.                                                                   |
| **Privacy minimization**       | Email addresses, contact bodies, assessment answers, and AI transcripts never enter PostHog event properties. Raw AI transcript persistence requires explicit consent.                                                  |
| **Provider truth**             | Supabase owns website operational provenance; Resend delivery/suppression; Shopify commerce/order truth; Printful fulfillment execution; OpenAI inference/indexing, not doctrine or product governance.                 |
| **Visible failure**            | Failed writes, sends, webhooks, publishes, checkout handoffs, AI requests, and retention jobs cannot silently disappear. Operator sees unresolved state and bounded recovery.                                           |
| **Minimum change**             | Post-launch architecture changes are admitted only for a verified gap and must preserve prior release and DOD evidence.                                                                                                 |

**Explicit non-goals**

> • No microservice decomposition, queue cluster, Kubernetes, or custom data platform is introduced for its own sake.
>
> • No public reader account is required to read, buy, subscribe, contact, use the initial AI, or receive assessment results.
>
> • No custom payment processing, card storage, or order-management system duplicates Shopify.
>
> • No model training or fine-tuning is required for the first valid R4; grounding and evals govern behavior.
>
> • No sensitive relationship content is used as an analytics optimization asset.
>
> • No provider dashboard or local metric becomes the product objective.

**04 - TARGET SYSTEM CONTEXT AND TRUST BOUNDARIES**

**Target System Context and Trust Boundaries**

The product is one owned web application deployed on Vercel. Visitors use public server-rendered routes and same-origin APIs. The operator uses the same application behind Supabase Auth. Provider integrations are explicit adapters around bounded responsibilities.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>VISITOR / READER / ADVICE SEEKER AUTHOR / OPERATOR<br />
| |<br />
+---------------------- HTTPS ----------------------+<br />
|<br />
VERCEL CDN + REACT SSR APP<br />
|<br />
+--------------+--------------+<br />
| |<br />
PUBLIC ROUTES /admin/*<br />
| |<br />
+----------- SAME-ORIGIN /api +<br />
|<br />
VERCEL SERVER FUNCTIONS / ROUTE ACTIONS<br />
|<br />
+-----------+----------+---------+---------+---------+---------+<br />
| | | | | |<br />
SUPABASE RESEND OPENAI SHOPIFY TURNSTILE POSTHOG<br />
DB/Auth/ Email + Responses Catalog + Abuse Events /<br />
Storage delivery File Search Checkout proof diagnostics<br />
|<br />
PRINTFUL<br />
Fulfillment<br />
<br />
durable website state / consent / evidence / audit / recovery</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Trust boundaries**

| **Boundary**            | **Allowed crossing**                                                      | **Prohibited crossing**                                                                           |
|-------------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **Browser -\> server**  | Validated JSON, public route requests, auth token, provider-neutral IDs   | Provider secrets, service-role credentials, raw admin authorization decisions in client code.     |
| **Server -\> Supabase** | Purpose-limited reads/writes, audit/evidence, RLS-aware admin access      | Unbounded service-role access without named repository method and audit where consequential.      |
| **Server -\> Resend**   | Minimum email payload, purpose/eligibility, idempotency key               | Silent marketing consent or duplicate logical sends.                                              |
| **Server -\> OpenAI**   | Current request/context needed for answer, canonical retrieval references | Analytics use of transcript, implicit durable provider memory, unsupported doctrine as canonical. |
| **Server -\> Shopify**  | Product/cart/checkout/order references                                    | Raw payment credentials or duplicated authoritative order ledger.                                 |
| **App -\> PostHog**     | Pseudonymous journey events and non-sensitive diagnostic metadata         | Raw email, contact body, assessment answers/free text, AI transcript, admin secrets.              |

**05 - REPOSITORY ARCHITECTURE AND AGENTS.MD BOUNDARY**

**Repository Architecture and AGENTS.md Boundary**

The production repository is a single GitHub repository. Product boundaries map directly to directories so UI code cannot hide provider calls, canonical rules, privileged data access, or safety logic.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>/<br />
|-- AGENTS.md # AFTER lock; &lt;150 lines; not created here<br />
|-- package.json<br />
|-- vite.config.ts<br />
|-- react-router.config.ts<br />
|-- vercel.json<br />
|-- src/<br />
| |-- routes/ # public and admin route modules<br />
| |-- components/ # presentation only<br />
| |-- features/ # book, audience, contact, content, commerce,<br />
| | # assessment, ai, admin<br />
| |-- layouts/ # public/admin shells<br />
| |-- lib/ # browser-safe api/auth/analytics/seo helpers<br />
| `-- styles/<br />
|-- api/ # Vercel function entry points where needed<br />
|-- server/<br />
| |-- domain/ # deterministic use-cases and invariants<br />
| |-- schemas/ # Zod request/response validation<br />
| |-- repositories/ # Supabase data access by aggregate/use-case<br />
| |-- adapters/ # resend, openai, shopify, posthog, turnstile<br />
| |-- email/ # template + send contracts<br />
| |-- ai/ # retrieval, prompt contract, verifier, safety route<br />
| `-- security/ # auth, origin, rate limit, webhook verification<br />
|-- contracts/ # API/event/error/schema constants<br />
|-- supabase/<br />
| |-- migrations/ # schema, grants, RLS, functions<br />
| |-- seed/ # non-production fixtures<br />
| `-- tests/ # RLS/grant/migration tests<br />
|-- config/<br />
| |-- assessment/ # deterministic scoring versions<br />
| `-- ai/ # constitution, source/prompt/eval manifests<br />
|-- tests/ # unit, contract, integration, e2e, ai<br />
|-- docs/<br />
| `-- evidence/ # release and DOD verification artifacts<br />
`-- scripts/ # bounded build/release/evidence utilities</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Dependency rules**

> • Routes/components call feature/use-case interfaces; they do not import provider SDKs or service credentials.
>
> • Domain code is deterministic where possible and cannot import UI or provider SDK modules.
>
> • Provider adapters implement explicit interfaces; provider-specific types do not escape into product-domain contracts.
>
> • Supabase migrations are the only authoritative database schema path. Production schema changes are never ad hoc console edits.
>
> • AI constitutional config lives under config/ai, is versioned, and is evaluated before promotion.
>
> • Release proofs live under docs/evidence or are referenced there by stable IDs; secrets and sensitive content are excluded.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>AGENTS.MD BOUNDARY</strong></p>
<p><strong>This architecture defines what the future root AGENTS.md must summarize, but AGENTS.md itself is intentionally not created or finalized in this action.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**06 - FRONTEND, RENDERING, AND CONTENT DELIVERY**

**Frontend, Rendering, and Content Delivery**

| **Route class**                                   | **Rendering strategy**                                            | **Cache / indexing rule**                                                                                        |
|---------------------------------------------------|-------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| **R1 public: /, /book, /about, /privacy, /terms** | SSR first response; cache at Vercel CDN with bounded revalidation | Indexable. Canonical metadata derives from CANONICAL_ORIGIN. Primary copy and CTA exist in HTML.                 |
| **R1 forms: /contact, /newsletter**               | SSR shell; same-origin POST for mutation                          | Indexable where appropriate. No PII in URL. POST never cached.                                                   |
| **R2: /ideas, /ideas/:slug, /news, /news/:slug**  | SSR from Supabase published content projection                    | Index only published rows. Cache invalidates on publish/update/unpublish without code rebuild.                   |
| **R3: /shop, /shop/:slug**                        | SSR product data through server Shopify adapter                   | Index approved live products. Canonical product URL. Price/availability TTL is bounded and provider-safe.        |
| **R4: /ai**                                       | SSR informational shell + client interaction                      | Public shell may be indexable. Requests/responses no-store, excluded from replay, never sitemap session content. |
| **R4: /assessment**                               | SSR informational shell + client step flow                        | Public shell may be indexable. Answer payloads are no-store in browser persistence.                              |
| **R4 results**                                    | SSR/authless tokenized results lookup                             | noindex, nofollow, private/no-store. High-entropy result IDs excluded from sitemap.                              |
| **/admin/\***                                     | Server/auth gated                                                 | noindex, nofollow, private/no-store; replay disabled.                                                            |

> • Every indexable page returns main heading, primary body/answer content, title, description, canonical link, truthful Open Graph metadata, and supported JSON-LD in the first HTML response.
>
> • Client-side fetching may enhance rendered content but is never the only path to indexable primary content.
>
> • Public editorial media uses Supabase Storage public-read paths controlled by publication state; draft/private assets use private buckets or signed URLs.
>
> • localStorage is limited to non-sensitive UI preferences, anonymous progress identifiers, and temporary route state. Email, contact body, assessment answers/free text, and AI transcript are excluded.
>
> • Responsive behavior covers current mobile/desktop, keyboard usability, reduced motion, and no critical action dependent on hover, color, or animation.

**07 - API AND INTEGRATION CONTRACTS**

**API and Integration Contracts**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>MUTATION CONTRACT</strong></p>
<p><strong>Every mutation accepts or derives a request_id, validates a versioned JSON schema, enforces size ceilings and authorization, returns stable error codes, and is idempotent whenever duplicate execution could create duplicate state, delivery, cost, or user harm.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Endpoint**                           | **Release** | **Responsibility / authority**                                                                                                                                          |
|----------------------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **POST /api/subscribe**                | R1          | Validate email + explicit marketing consent -\> persist request/consent -\> upsert subscriber -\> sync Resend eligibility -\> return durable state.                     |
| **POST /api/preferences**              | R1-R2       | Authenticate signed preference token/provider callback -\> update consent/suppression projection -\> enforce on future sends.                                           |
| **POST /api/contact**                  | R1          | Validate fields + Turnstile/rate limit -\> persist inquiry -\> send receipt + operator notification -\> return inquiry reference.                                       |
| **POST /api/resend/webhook**           | R1-R2       | Verify signature -\> dedupe event -\> update delivery, bounce, complaint, unsubscribe/suppression projections.                                                          |
| **GET/POST /api/admin/content/\***     | R2          | Admin-only create/edit/preview/publish/update/unpublish Supabase content. Consequential mutations are audited.                                                          |
| **POST /api/admin/campaigns/:id/send** | R2          | Re-evaluate eligibility -\> freeze campaign version -\> send/schedule through Resend -\> persist provider reference and evidence.                                       |
| **POST /api/shop/cart**                | R3          | Validate live Shopify variant -\> create/update provider cart -\> return checkout URL; no payment data.                                                                 |
| **POST /api/shopify/webhook**          | R3          | Verify HMAC -\> dedupe event -\> update minimal commerce mirror -\> emit server-side purchase/fulfillment evidence.                                                     |
| **POST /api/assessment**               | R4          | Validate assessment version + answers -\> deterministic scoring -\> persist result -\> return stable result token.                                                      |
| **POST /api/assessment/:id/report**    | R4          | Verify explicit report-purpose consent -\> create email request -\> send one branded results report; never create marketing consent.                                    |
| **POST /api/ai**                       | R4          | Validate mode/input/consent -\> safety gate -\> canonical retrieval -\> structured generation -\> post-verify -\> optionally persist transcript under explicit consent. |
| **POST /api/ai/:id/feedback**          | R4          | Persist usefulness/issue category without conditioning access or requiring continued conversation.                                                                      |

**Stable response envelope**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"request_id": "uuid",<br />
"status": "ok | accepted | error",<br />
"data": { ... } | null,<br />
"error": {<br />
"code": "STABLE_MACHINE_CODE",<br />
"message": "safe user-facing message",<br />
"retryable": true | false<br />
} | null<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**08 - SUPABASE DATA MODEL, RLS, AND PERSISTENCE**

**Supabase Data Model, RLS, and Persistence**

**Locked core visitor-capture tables**

| **Table**            | **Required logical fields / role**                                                                                                                                                            | **Write and privacy rule**                                                                                                                         |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| **assessments**      | id; session_id; assessment_version; answers_jsonb; dimension_scores_jsonb; readiness_level; gaps_jsonb; recommendations_jsonb; report_email_request_id; created_at                            | POST /api/assessment only. Prefer structured answers. No clinical fields. Retention/deletion policy approved before production R4 collection.      |
| **ai_conversations** | id; session_id; mode; consent_to_store; transcript_jsonb nullable; source_refs_jsonb; grounding_status; safety_route; model_version; prompt_version; helpfulness; feedback_reason; timestamps | POST /api/ai only. Raw transcript persists only with explicit consent. Unconsented transcript content never enters admin viewer.                   |
| **email_requests**   | id; request_type; email; first_name; consent_scope; consent_version; source; payload_jsonb; resend_message_id; delivery_status; error_code; timestamps                                        | Subscribe/contact/report/campaign/email flows + verified Resend webhooks. Marketing consent is separate from contact/report/transactional purpose. |

**Supporting operational tables**

| **Table**              | **Purpose**                                                                                                       | **Public access**                                |
|------------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| **subscribers**        | Normalized owned audience profile and current deliverability projection.                                          | None; public actions through API.                |
| **consent_events**     | Append-only consent grant/revoke/version/source evidence by purpose.                                              | None.                                            |
| **content_items**      | R2 ideas/news/campaign content, status, slug, structured body, source mapping, SEO metadata, canonical relations. | Published projection via SSR; admin writes only. |
| **content_revisions**  | Versioned snapshot for preview/history/revert/canonical audit.                                                    | None.                                            |
| **campaigns**          | Draft/scheduled/sent state, audience rule, content/template version, provider ref, aggregate outcomes.            | None.                                            |
| **email_events**       | Resend delivery/bounce/complaint/suppression projection.                                                          | None.                                            |
| **site_settings**      | Canonical host, approved book URL, contact routing, public metadata, feature flags.                               | Narrow server-rendered public settings only.     |
| **admin_users**        | Allowlisted operator identity, role, active state, MFA requirement.                                               | None.                                            |
| **admin_audit_log**    | Consequential operator actions: publish/send/export/settings/AI review/config emergency actions.                  | None.                                            |
| **commerce_mirror**    | Minimal Shopify order/fulfillment reference/status for observability/reconciliation.                              | None.                                            |
| **integration_events** | Provider webhook id/type/status/attempts/correlation/last error.                                                  | None.                                            |
| **idempotency_keys**   | Scope/key/request hash/status/result reference/expiry.                                                            | None.                                            |
| **system_failures**    | Open/recovered critical failure records visible to operator.                                                      | None.                                            |
| **rate_limits**        | Hashed request key, endpoint scope, window, count/expiry.                                                         | None.                                            |
| **ai_eval_runs**       | Git commit, candidate model/config, prompt/source/fixture versions, gate results, promotion decision.             | None.                                            |

**08 - SUPABASE DATA MODEL, RLS, AND PERSISTENCE - CONTINUED**

**RLS and privilege model**

| **Actor**               | **Allowed**                                                                                                                                     | **Denied / invariant**                                                                                             |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| **anon browser**        | No direct sensitive writes. Public route loaders read only published content and explicit public settings through server path.                  | No SELECT on assessments, AI conversations, email requests, audience, campaigns, audit, failures, commerce mirror. |
| **authenticated admin** | Role-scoped read/write through server with Supabase Auth JWT for authorized content/audience/contact/campaign/analytics/AI/commerce operations. | No privilege by URL/record ID alone. Sensitive reads and exports audited.                                          |
| **service actor**       | Verified webhooks, retention/reconciliation jobs, provider syncs with server-only privileged credentials through named repository methods.      | Service role never exposed to browser and never used as authorization shortcut for user/admin requests.            |

> • Every exposed table has RLS enabled; default privileges are revoked before minimum grants are applied.
>
> • Migrations are versioned under supabase/migrations. Policy tests live under supabase/tests and run before production promotion.
>
> • Sensitive exports are server-generated, purpose-limited, and default-exclude raw AI transcripts and private message bodies.
>
> • Deletion/retention jobs are testable and fail visibly. R4 production collection remains blocked until AI/assessment retention values and disclosures are approved.

**09 - SECURITY, PRIVACY, AND ABUSE CONTROLS**

**Security, Privacy, and Abuse Controls**

| **Threat / boundary**             | **Required control**                                                                                                                                                                                                            |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Secrets**                       | OPENAI_API_KEY, RESEND_API_KEY, Supabase service credential, Shopify secrets, webhook secrets, and Turnstile secret exist only in environment-scoped Vercel server variables. Never expose through VITE\_\* or browser bundles. |
| **Admin takeover**                | No public admin registration. Pre-authorized Supabase admin account; TOTP MFA required for production; short-lived sessions; role/active state rechecked for consequential actions.                                             |
| **Broken access control**         | Server verifies JWT/role; RLS defense-in-depth; private routes no-store/noindex; every sensitive read/export purpose-bound and auditable.                                                                                       |
| **Public-form abuse**             | Turnstile, schema/length limits, honeypot where low-friction, hash-based rate limiting, idempotency, explicit user-visible error states.                                                                                        |
| **Webhook forgery/replay**        | Resend signature verification; Shopify HMAC; unique provider event ID; stale/invalid events rejected; integration event persisted before side effects.                                                                          |
| **Injection / malformed content** | Zod validation, parameterized queries/RPC, allowlisted rich-content renderer, sanitized links/embeds, no arbitrary script fields.                                                                                               |
| **Sensitive analytics leakage**   | No raw email, contact body, assessment answer, AI transcript, auth token, or payment PII in PostHog. URL/query sanitization; replay blocked on /ai and /admin.                                                                  |
| **AI privacy**                    | Provider persistence disabled where supported; no provider conversation-memory dependency; logs redact input/output; transcript persistence only after explicit consent_to_store.                                               |
| **Assessment privacy**            | Structured answers; no diagnosis/personality labeling; no email gate; answers excluded from localStorage and PostHog event properties.                                                                                          |
| **Payment data**                  | Shopify-hosted checkout. Website stores only provider references/status needed for observable handoff.                                                                                                                          |
| **Browser hardening**             | TLS via Vercel; HSTS after canonical domain; CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and frame restrictions appropriate to provider embeds.                                                           |
| **Retention**                     | Purpose-specific values configured before collection. R4 sensitive collection is blocked until approved retention/deletion behavior and disclosure exist.                                                                       |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PRIVACY INVARIANT</strong></p>
<p><strong>Sensitive relationship content is treated as user data to protect, not telemetry to mine. Product analytics proves journeys without ingesting the private text that created them.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**10 - EMAIL AND AUDIENCE ARCHITECTURE**

**Email and Audience Architecture**

| USER ACTION -\> VALIDATE + PURPOSE CONSENT -\> PERSIST REQUEST / CONSENT / AUDIENCE STATE -\> RESEND WITH IDEMPOTENCY KEY -\> PERSIST PROVIDER ID / STATUS -\> VERIFIED RESEND WEBHOOK -\> UPDATE DELIVERY / SUPPRESSION PROJECTION -\> ADMIN VISIBILITY + SAFE RETRY |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

| **Message / operation**     | **Authority and behavior**                                                                                                                                                                              |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Newsletter signup**       | Persist marketing consent first, upsert subscriber, then sync eligible contact/topic to Resend. Do not claim reachable subscription if provider sync is failed/pending; show recoverable pending state. |
| **Welcome**                 | Exactly one logical send per new eligible subscription transition. Branded HTML + plain text, expectations, preference/unsubscribe links.                                                               |
| **Contact receipt**         | One acknowledgement after durable inquiry creation. No response-time promise unless operationally true.                                                                                                 |
| **Operator notification**   | Minimum necessary metadata plus secure admin link when message content is sensitive. Failure never deletes the inquiry.                                                                                 |
| **Campaign / announcement** | Admin previews and freezes content/version and audience rule. Send path rechecks current consent/suppression before provider submission. Scheduled sends use idempotent Vercel job.                     |
| **Assessment report**       | Explicit report-purpose consent only. One report request -\> one send. No newsletter side effect. Prefer results link + safe summary over full sensitive detail.                                        |
| **AI summary**              | Not part of initial R4. No automatic sensitive transcript email. Any future summary requires separate admission and consent.                                                                            |
| **Delivery evidence**       | Provider message/broadcast ID + verified webhook events persisted. Bounce/complaint/suppression is operator-visible and blocks future marketing sends.                                                  |

> • Production sending domain is project-owned and verified with required DNS records before R1 exit.
>
> • Templates follow locked visual direction: white, deep navy, restrained teal, editorial typography, accessible plain-text fallback.
>
> • A logical send key is stable across retries. Retry never creates a second message for the same logical event.
>
> • Resend is delivery infrastructure; Supabase consent_events is the authoritative proof of why marketing delivery is permitted.

**11 - SUPABASE PUBLISHING, SEO, GEO, AND DISCOVERABILITY**

**Supabase Publishing, SEO, GEO, and Discoverability**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>R2 PUBLISHING DECISION</strong></p>
<p><strong>The website admin + Supabase content_items/content_revisions is the Release 2 CMS. The operator can create, preview, publish, update, unpublish, and revert structured public content without code deployment or application rebuild.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Concern**                  | **Architecture**                                                                                                                                                                                                                       |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Authoring**                | Authenticated /admin/content editor supports Book/Author references, Topic/Idea, News/Announcement, Campaign Landing, verified Testimonial/Social Proof, SEO fields, canonical principle/source mappings, and reusable CTA references. |
| **Structured body**          | Allowlisted JSON block model in content_items.body_jsonb: headings, paragraphs, lists, quotes, callouts, source references, links, images, Q&A. No arbitrary HTML/script fields.                                                       |
| **Publish model**            | status = draft \| published \| archived, plus version/revision, published_at, updated_at. Preview is authenticated/noindex; public loaders read published projection only.                                                             |
| **No-rebuild behavior**      | Publish/update/unpublish changes Supabase state. SSR reads published state on request. Vercel cache tag/path invalidation occurs via authenticated admin mutation. No Git commit/app rebuild required.                                 |
| **Canonical source mapping** | Each topical item stores mapped principle/chapter/source references and related-content IDs. Marketing/trend content cannot silently redefine book/Operating-System hierarchy.                                                         |
| **SEO metadata**             | Unique title, description, canonical path, Open Graph fields, robots directive, breadcrumbs, author/book refs, and supported JSON-LD input validated before publish.                                                                   |
| **Structured data**          | Book, Person, Article/BlogPosting, BreadcrumbList, FAQPage only for visible Q&A, and Product only for visible merchandise. Never emit unsupported claims.                                                                              |
| **Sitemap**                  | /sitemap.xml server-generated from canonical public route registry + Supabase published inventory + approved Shopify product routes. Private/noindex/admin/result URLs excluded.                                                       |
| **robots.txt**               | Environment-aware. Production allows intended public content and blocks private tool paths; every Vercel preview is noindex.                                                                                                           |
| **llms.txt**                 | Server-generated concise index of canonical public entities/pages. Supplemental discoverability only; never treated as GEO success by itself.                                                                                          |
| **Internal linking**         | Topic/principle/related-content relations generate contextual links to deeper content and relevant Buy/Join actions. No keyword link farms.                                                                                            |
| **Trend rule**               | A trend becomes content only when a legitimate canonical principle match exists. No opportunistic keyword hijacking.                                                                                                                   |
| **Discoverability evidence** | Search Console supplies indexed-page/query/landing evidence after domain selection; PostHog supplies downstream content -\> book/signup action. Operator can review both.                                                              |

**Indexing acceptance checks**

> • Fetch an indexable route without executing JavaScript and receive primary content, title, canonical URL, and required structured data.
>
> • sitemap.xml contains only canonical indexable URLs and updates after publish/unpublish.
>
> • robots.txt does not block intended public routes and preview deployments remain noindex.
>
> • JSON-LD validates and matches visible page content.
>
> • Canonical URLs never vary by analytics parameters, preview hosts, or client state.

**12 - ANALYTICS AND OBSERVABILITY**

**Analytics and Observability**

| **Event family** | **Governed events**                                                                      | **Privacy / evidence rule**                                                                         |
|------------------|------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| **Discovery**    | page_view; landing_source; content_view                                                  | Path/content/referrer class only. No sensitive query payloads.                                      |
| **Book**         | book_cta_view; book_cta_click; destination_ok                                            | Campaign attribution allowed; no raw identity required.                                             |
| **Audience**     | signup_start; signup_complete; signup_error; unsubscribe                                 | No raw email. signup_complete only after defined durable success condition.                         |
| **Contact**      | contact_start; contact_submit; contact_error                                             | Never record message body. Server success follows durable inquiry creation.                         |
| **Content**      | topic_view; related_click; content_to_book; content_to_signup                            | Use content IDs/slugs and source category, not private reader text.                                 |
| **Commerce**     | product_view; checkout_start; purchase_confirmed; fulfillment_handoff                    | Purchase/fulfillment evidence is server-side from verified Shopify events; no card/payment secrets. |
| **Assessment**   | assessment_start; question_progress; assessment_complete; results_view; report_requested | Progress/dimension aggregates only. No answer text or email.                                        |
| **AI**           | ai_start; mode; response_complete; safety_route; usefulness                              | No transcript. Server emits grounding/safety categories only. Replay disabled on /ai.               |
| **Operator**     | publish; campaign_send; export; settings_change                                          | Admin events supplement admin_audit_log. Replay disabled on /admin.                                 |

**Evidence hierarchy**

> 1\. Acceptance tests and durable provider/database state prove critical behavior.
>
> 2\. Governed custom events prove observable transitions and funnel movement.
>
> 3\. Vercel structured logs/correlation IDs diagnose request and provider failures while redacting private text.
>
> 4\. PostHog replay and heatmaps diagnose friction only on permitted non-sensitive surfaces.
>
> 5\. Search Console provides external indexing/query evidence for R2 discoverability.

**Operator-visible health**

> • Open system_failures by type, age, provider, and retryability.
>
> • Latest successful/failed provider webhook and reconciliation state.
>
> • Email delivery/suppression and campaign outcomes.
>
> • Content publication/indexing checks and downstream action evidence.
>
> • Commerce handoff state and unmatched provider events.
>
> • AI grounding/safety/eval status, runtime versions, usefulness, and retention-job state.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>MEASUREMENT RULE</strong></p>
<p><strong>Metrics answer whether governed journeys work. They do not replace the locked end condition, trust boundaries, or user stories.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**13 - ADMIN AND OPERATOR ARCHITECTURE**

**Admin and Operator Architecture**

The /admin surface is the operator console for cross-system control and evidence. Content authoring is native to this admin because Release 2 publishing is Supabase-backed.

| **Module**        | **Read / action path**                                                                                           | **Security / evidence rule**                                                                               |
|-------------------|------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| **Overview**      | DOD journey KPIs, open failures, provider health, release evidence links                                         | Admin-only; metrics tied to governed journeys, not vanity.                                                 |
| **Content**       | Create/edit/preview/publish/update/unpublish/revert content_items and revisions                                  | Admin role; canonical/source fields validated; every publish/unpublish/revert audited.                     |
| **Audience**      | Subscriber state, source, consent purpose/version, suppression/delivery summary, preference corrections          | No casual bulk PII exposure; consequential changes audited.                                                |
| **Campaigns**     | Draft/preview/schedule/send, audience rule, frozen version, provider outcomes                                    | Eligibility rechecked at send; send/schedule audited and idempotent.                                       |
| **Contacts**      | Inquiry list/detail/status, resend notification where safe, filtered export                                      | Raw message access limited and audited; notification failure does not lose inquiry.                        |
| **Commerce**      | Recent provider order refs, confirmation/fulfillment state, reconciliation failures, Shopify/Printful deep links | No card/payment data duplicated.                                                                           |
| **Assessment**    | Completion/dimension aggregates, version distribution, report requests                                           | No diagnosis labels. Raw answers hidden unless specifically authorized for support.                        |
| **AI review**     | Permitted retained conversations, mode, safety route, source refs, grounding, runtime versions, feedback         | Only explicitly consented transcripts viewable. Every raw transcript view/export audited.                  |
| **AI governance** | Active runtime/eval/source-manifest status, critical failures, emergency AI disable flag                         | Model/prompt/source promotion release-gated; operator can suspend unsafe/unavailable AI without code edit. |
| **Exports**       | Server-generated filtered CSV for approved datasets/date ranges                                                  | Explicit action; sensitive body/transcript default exclusion; audit log required.                          |
| **Settings**      | Canonical host, book URL, contact routing, public metadata, feature flags                                        | Validated; consequential changes audited; release blockers surfaced.                                       |
| **System health** | Webhook failures, retries, unresolved integrations, retention job state, latest deployment/eval evidence         | Only safe retryable operations are operator-retryable.                                                     |

**Admin authentication sequence**

| /admin -\> Supabase Auth (no public self-registration) -\> TOTP MFA required in production -\> server verifies token + active admin_users role -\> every data request re-authorized -\> RLS + server use-case authorization -\> consequential action -\> admin_audit_log |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

**14 - COMMERCE AND FULFILLMENT ARCHITECTURE**

**Commerce and Fulfillment Architecture**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>R3 PROVIDER SELECTION</strong></p>
<p><strong>Shopify is the commerce/payment system of record and Printful is print-on-demand fulfillment through Shopify. This minimizes PCI/payment, order, tax, refund, and fulfillment complexity while preserving owned discovery and observable handoff.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Step**                  | **System**                                        | **Evidence / failure behavior**                                                                                                 |
|---------------------------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **Catalog render**        | Website SSR -\> server Shopify Storefront adapter | Approved product/variant/price/availability shown. Provider error renders visible unavailable state rather than stale checkout. |
| **Cart / checkout start** | Server adapter -\> Shopify cart -\> checkoutUrl   | checkout_start + cart reference. Cart ref kept in secure cookie/server state; user leaves only to trusted Shopify checkout.     |
| **Payment / order**       | Shopify hosted checkout                           | Shopify owns payment and order confirmation. Website never receives card data.                                                  |
| **Purchase confirmation** | Verified Shopify webhook                          | Unique event dedupe -\> commerce_mirror -\> server-side purchase_confirmed event.                                               |
| **Fulfillment handoff**   | Shopify \<-\> Printful integration                | Printful receives eligible order; fulfillment/tracking flows back through Shopify.                                              |
| **Operator visibility**   | Admin commerce module + provider deep links       | Website shows minimum order/fulfillment state; authoritative detail remains in Shopify.                                         |
| **Recovery**              | Webhook replay + bounded reconciliation job       | Unmatched/failed events remain in integration_events/system_failures; operator reconciles from Shopify order reference.         |

**Commerce boundaries**

> • Merchandise assortment and pricing remain open product inputs and are not invented by architecture.
>
> • The application does not duplicate tax, payment, refund, inventory, or fulfillment truth.
>
> • Only minimum provider references/status needed for DOD-07/DOD-09 evidence persist in Supabase.
>
> • Production provider accounts, products, keys, webhooks, and Printful integration are implementation work after architecture lock.

**15 - ASSESSMENT AND PERSONALIZED RESULTS ARCHITECTURE**

**Assessment and Personalized Results Architecture**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>R4 PRODUCT BOUNDARY</strong></p>
<p><strong>Trust Practice Readiness is an optional deterministic reflection/application tool. It is nonclinical, not a compatibility or partner verdict, not email-gated, and AI cannot calculate or silently alter its score.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Component**        | **Architecture rule**                                                                                                                                                                               |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Definition**       | Versioned JSON under config/assessment/\<version\>.json: questions, dimensions, weights/rules, readiness thresholds, canonical recommendation IDs.                                                  |
| **Scoring**          | Pure deterministic server function. Same version + same answers -\> identical score/result. No model call in scoring path.                                                                          |
| **Dimensions**       | Character & Integrity; Purpose & Self-Leadership; Emotional Safety & Regulation; Curiosity & Shared Meaning; Repair & Accountability; Boundaries & Respect; Consistency & Trust; Growth & Practice. |
| **Readiness levels** | Foundation; Developing; Practicing; Consistent. Labels describe current practice state, not clinical status or human worth.                                                                         |
| **Persistence**      | POST /api/assessment validates versioned answers, scores deterministically, writes assessments, returns high-entropy result ID/token.                                                               |
| **Results**          | Show readiness level, dimension breakdowns, gaps, canonical source-linked recommendations, and next action without requiring email.                                                                 |
| **Results email**    | Separate explicit report-purpose consent. Creates email_requests entry and one Resend delivery. No marketing consent side effect.                                                                   |
| **AI explanation**   | AI may explain an already-computed result using canonical sources. Score/result is immutable input; AI may not recompute, alter, or relabel it.                                                     |
| **Privacy**          | Structured answers preferred; no diagnosis/personality labeling; answers excluded from PostHog/localStorage; production retention/deletion policy approved first.                                   |
| **Verification**     | Fixed fixtures assert exact dimension scores, level, gaps, and recommendation IDs for every assessment version.                                                                                     |

**16 - BECOMING THE MAN AI GROUNDING ARCHITECTURE**

**Becoming the Man AI Grounding Architecture**

**Release 4 is an application layer over the Becoming the Man body of work. The runtime must not become a generic relationship chatbot with branded styling.**

**Canonical authority manifest**

| **Priority** | **Source**                                                               | **Runtime rule**                                                                                                                                                                                     |
|--------------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**        | Safety and ethical constitution derived from locked governing boundaries | Always injected. Autonomy, voluntary/revocable consent, dignity, nonviolence, legality, health, privacy, accessibility, physical/emotional safety, and right to stop override ordinary optimization. |
| **2**        | LOVE • PURPOSE • FLOURISH Master Relationship Operating System v1.4      | Primary protocol, decision-gate, evidence-calibration, conflict/repair, and referral source.                                                                                                         |
| **3**        | Published Twenty-Four Non-Negotiables                                    | Primary public constitutional principles and reader-facing names.                                                                                                                                    |
| **4**        | Published Becoming the Man She Can Trust chapters/examples               | Narrative explanation, examples, metaphors, chapter framing.                                                                                                                                         |
| **5**        | Authorized author reference/evidence files                               | Only files explicitly admitted to active source manifest/version.                                                                                                                                    |
| **6**        | General model knowledge                                                  | Supplemental only; never silently overrides canonical sources or presents itself as book doctrine.                                                                                                   |

**Runtime pipeline**

> 1\. Validate mode, input size, request_id, storage consent, and abuse/rate controls.
>
> 2\. Apply safety/scope pre-gate for coercion, violence, stalking, suicidality, severe misuse/crisis, diagnosis/treatment, and other must-route conditions before ordinary relationship optimization.
>
> 3\. Load the active versioned authority manifest and retrieve relevant canonical chunks through OpenAI File Search with source/version metadata.
>
> 4\. If material facts are missing, separate observable facts from interpretations and ask for clarification or expose uncertainty instead of inventing context.
>
> 5\. Generate a strict structured response centered on user-controllable responsibility and the minimum useful next action.
>
> 6\. Post-verify schema, source references, authority order, prohibited behavior, safety-route consistency, and unsupported doctrinal claims.
>
> 7\. Render user-facing guidance with relevant principle/source references and a reflection/next-step check without manufacturing dependence.
>
> 8\. Persist only permitted operational evidence; raw transcript persists only when consent_to_store is explicitly true.

**First valid modes**

| **Mode**               | **Output contract emphasis**                                                                                      |
|------------------------|-------------------------------------------------------------------------------------------------------------------|
| **Conversation Coach** | Goal clarification; listening/shared-meaning strategy; principle mapping; optional language; minimum next action. |
| **Conflict & Repair**  | Facts vs interpretations; controllable responsibility; repair step; timing/de-escalation; boundary/safety checks. |
| **Message Review**     | Trust/shared-meaning risk; revision strategy; optional rewritten message; never manipulation/coercion.            |
| **Trust Builder**      | Specific credibility/consistency gap; repair action; repeatable observable evidence of reliability.               |
| **Reflection**         | Questions, self-observation, principle mapping, behavior experiment; no diagnosis or partner labeling.            |

**16 - BECOMING THE MAN AI GROUNDING ARCHITECTURE - CONTINUED**

**Structured response contract**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"mode": "...",<br />
"situation_summary": "...",<br />
"observable_facts": ["..."],<br />
"interpretations_or_unknowns": ["..."],<br />
"relevant_principles": [{"name":"...","source_ref":"..."}],<br />
"user_responsibility": "...",<br />
"next_action": "...",<br />
"optional_language": "..." | null,<br />
"rationale": "...",<br />
"safety_route": "ordinary | safety | crisis | professional_scope",<br />
"uncertainty": "..." | null,<br />
"reflection": "..." | null,<br />
"source_refs": ["..."],<br />
"grounding_status": "grounded | partial | insufficient",<br />
"model_version": "...",<br />
"prompt_version": "..."<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> • Production requests do not rely on provider conversation memory. Current-session history stays in browser memory and is resent only as needed for continuity.
>
> • If canonical support is insufficient for a doctrinal claim, the verifier forces visible uncertainty/clarification rather than hallucinated doctrine.
>
> • Model, prompt, corpus, retrieval, safety policy, and response schema are versioned as one promoted runtime bundle.

**17 - AI EVALS AND PROMOTION GATES**

**AI Evals and Promotion Gates**

The R4 runtime is promoted because it passes the frozen release contract, not because a sample answer sounds good. Candidate comparison occurs only after hard contract, grounding, safety, and governed-behavior gates pass.

| **Eval layer**                 | **Required verification**                                                                                                                                                  | **Release effect**                                            |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| **G0 - Contract**              | Strict response schema; required model/prompt/source versions; stable fields; no malformed output.                                                                         | Any structural failure blocks candidate.                      |
| **G1 - Grounding**             | Doctrinal claims resolve to active canonical source refs; authority tier visible; lower-priority material cannot override higher-tier rules.                               | Unsupported doctrinal claim or authority inversion blocks.    |
| **G2 - Safety / scope**        | Consent/coercion/abuse/crisis/diagnosis/professional-boundary fixtures route correctly before ordinary advice.                                                             | Any safety-critical failure blocks.                           |
| **G3 - Governed behavior**     | Ordinary misunderstanding, broken promise, boundaries, conflict, message review, blame-seeking, ambiguity follow required sequence and center controllable responsibility. | Every mandatory assertion in release contract must pass.      |
| **G4 - Usefulness comparison** | Passing candidate vs current production/challenger rated on specificity, minimum useful next action, uncertainty, proportionality, fidelity.                               | Chooses among passing candidates only; cannot override G0-G3. |
| **Assessment fixtures**        | Known answer sets -\> exact versioned scores/levels/gaps/recommendations.                                                                                                  | Any nondeterminism blocks assessment release.                 |

**Promotion and rollback rules**

> • Critical safety and canonical-integrity assertions are zero-tolerance. A higher aggregate score cannot offset one critical failure.
>
> • Changes to model, prompt, authority manifest, vector-store corpus, retrieval policy, safety rules, or output schema rerun the full relevant eval suite.
>
> • Promotion persists ai_eval_runs evidence containing git commit, candidate model/config, prompt version, source-manifest version, fixture version, gate results, and decision.
>
> • Exact GPT-5.6 production snapshot and reasoning configuration are pinned only after the approved R4 eval suite passes. Terra begins as candidate; Sol is challenger/reference.
>
> • Rollback restores the previous compatible model + prompt + authority manifest + retrieval config as a bundle; partial rollback that breaks contract compatibility is prohibited.
>
> • Operator can emergency-disable AI through an audited feature flag if production behavior or provider availability creates a safety/reliability concern.

**18 - DEPLOYMENT TOPOLOGY AND CI/CD**

**Deployment Topology and CI/CD**

| **Environment**    | **Topology / data rule**                                                                                                                                                                                                                |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Local**          | Developer workstation + local/isolated Supabase dev stack or dedicated dev project; provider test keys only; no production user data.                                                                                                   |
| **Vercel Preview** | Every PR gets a preview. Uses non-production Supabase, Resend test/allowed recipients, PostHog dev project, Shopify dev store/test checkout, OpenAI non-production project/vector store, Turnstile test mode. Preview globally noindex. |
| **Production**     | Protected main branch -\> Vercel Production. Production Supabase, verified Resend domain, PostHog, Shopify/Printful, OpenAI project/vector store, Search Console property, and owned canonical domain.                                  |
| **Secrets**        | Vercel environment variables separately scoped to Development/Preview/Production. Provider credentials are not copied between scopes by default.                                                                                        |
| **Database**       | Committed migrations only. Dev/preview migration + RLS tests before production. Production migration stops on failure; no destructive reset.                                                                                            |
| **Content**        | Supabase content is operational data, not code. Publishing changes DB state through admin; normal publishing is deliberately separate from code deployment.                                                                             |
| **Evidence**       | Release evidence is committed/referenced under docs/evidence with safe provider IDs, test results, and regression verdict; no secrets/private content.                                                                                  |

**CI and promotion gate order**

> 1\. Static checks: formatting, lint, typecheck, schema/config validation.
>
> 2\. Unit and contract tests: domain rules, provider adapters, API/event/error schemas, privacy guards, idempotency.
>
> 3\. Supabase migration and RLS/grant tests against isolated database.
>
> 4\. AI eval suite when AI prompts, source manifest/corpus, model config, safety policy, retrieval, or response contract changes.
>
> 5\. Build React Router/Vite application.
>
> 6\. Preview deploy; run critical Playwright journeys, accessibility checks, metadata/schema/crawl checks, privacy payload inspection, and targeted performance tests.
>
> 7\. Human review of preview and release evidence.
>
> 8\. Approved merge to protected main creates production deployment.
>
> 9\. Production smoke tests verify critical transitions with bounded non-destructive fixtures. Keep deployment only while release gate remains green; otherwise revert/disable affected capability.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DEPLOYMENT RULE</strong></p>
<p><strong>A green build is not a release. Promotion requires release-specific user/operator exit evidence plus continuing pass of every earlier release gate.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**19 - FAILURE MODES, RECOVERY, AND IDEMPOTENCY**

**Failure Modes, Recovery, and Idempotency**

| **Failure**                                  | **Durable state / user behavior**                                                                                                           | **Recovery**                                                                                               |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| **Resend unavailable during signup**         | Consent/subscriber/request remains durable; UI does not falsely claim reachable subscription; system_failure records pending provider sync. | Retry job uses same logical idempotency key; admin sees unresolved state.                                  |
| **Contact notification fails**               | Inquiry already persisted; visitor sees received inquiry reference with notification-delay state if needed.                                 | Retry notification; operator views inquiry directly in admin.                                              |
| **Duplicate form submit**                    | request_id/idempotency scope maps duplicate to same logical result.                                                                         | Return prior result; no duplicate record/send.                                                             |
| **Campaign send retries**                    | Campaign version and audience rule frozen; send key = campaign + version.                                                                   | Retry does not duplicate accepted provider send; reconciliation updates outcomes.                          |
| **Content publish validation fails**         | Draft remains unchanged; no public cache invalidation.                                                                                      | Operator fixes validation/source/SEO error and republishes.                                                |
| **Content publish succeeds but cache stale** | Published DB state remains authoritative.                                                                                                   | Invalidate affected paths/tags; bounded stale-while-revalidate expires; health surfaces stale-cache issue. |
| **Shopify webhook missing/duplicate**        | integration_events dedupes; commerce_mirror may remain pending and visible.                                                                 | Periodic reconciliation queries authoritative Shopify state.                                               |
| **AI provider/retrieval failure**            | No fabricated advice. UI returns retryable failure or grounding-insufficient response; non-sensitive failure evidence persists.             | Retry with same turn request_id; never silently degrade to ungrounded generic advice.                      |
| **AI safety verifier fails**                 | Response is not delivered as ordinary advice.                                                                                               | Return governed safety/error state; issue becomes operator/eval evidence and may trigger feature disable.  |
| **Assessment duplicate/retry**               | Scoring is pure and request idempotent; same request returns same result ID/result.                                                         | No duplicate report unless new explicit report request.                                                    |
| **Retention job fails**                      | Expired sensitive rows remain flagged as overdue; failure visible.                                                                          | Retry bounded deletion job; R4 health remains degraded until backlog clears.                               |
| **Analytics unavailable**                    | Primary operation continues; acceptance evidence still exists in DB/provider state.                                                         | Backfill only permitted non-sensitive server events when feasible; never duplicate user action.            |

**Idempotency contract**

> • Client supplies a UUID request_id for retryable mutations; server may create one when absent before side effects.
>
> • idempotency_keys stores scope, key, request hash, state, result reference, and expiry. Reusing a key with a different request hash is rejected.
>
> • Provider webhook event IDs have a unique constraint before handler side effects.
>
> • Email logical sends, campaign versions, assessment scoring requests, and AI turns each have explicit idempotency scopes.
>
> • Retries are bounded, exponential where appropriate, and stop on non-retryable validation/auth/safety failures.

**20 - RELEASE ARCHITECTURE AND EXIT EVIDENCE**

**Release Architecture and Exit Evidence**

| **Release**                  | **Architecture activated**                                                                                                                                                       | **Exit evidence required before next release**                                                                                                                                                                                  |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **R1 - Revenue + Audience**  | React SSR/Vercel; Supabase audience/consent/email/contact/settings/admin/audit/idempotency/failure state; Resend; PostHog core events; Turnstile; owned domain when selected.    | Real visitor/production fixture: orient -\> verified live book destination; signup -\> persisted consent + reachable eligible subscriber; contact -\> durable inquiry + receipt/operator path; failures visible and measurable. |
| **R2 - Distribution Engine** | Supabase content_items/revisions + admin authoring; ideas/news SSR; SEO/GEO metadata; sitemap/robots/llms; internal links; campaigns; Search Console evidence.                   | Operator publishes/updates/unpublishes without rebuild; representative page crawlable/indexable/structured/attributed; test campaign reaches eligible audience; unsubscribe/preferences honored.                                |
| **R3 - Commerce Expansion**  | Shopify catalog/cart/hosted checkout; Printful integration; verified Shopify webhook; commerce mirror/reconciliation; commerce events/admin.                                     | Approved test order completes through Shopify confirmation + Printful handoff; operator observes authoritative order/fulfillment reference/status; no raw card data handled.                                                    |
| **R4 - Becoming the Man AI** | Canonical authority manifest/vector store; safety router; Responses API; structured verifier; eval harness; assessment/results/report email; AI admin/feedback/privacy controls. | Representative ordinary + ambiguous + must-route safety scenarios pass; grounding/source hierarchy verified; assessment fixtures deterministic; retention/exclusions verified; usefulness feedback captured.                    |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>SEQUENCE INVARIANT</strong></p>
<p><strong>R2 does not weaken R1. R3 does not weaken R1-R2. R4 does not delay or relax R1-R3. Every production promotion reruns the earlier release exit suite.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**21 - DOD-01 THROUGH DOD-09 REGRESSION REVIEW**

**DOD-01 through DOD-09 Regression Review**

| **DoD**                             | **Architecture proof path**                                                                                                                                       | **Regression verdict**                                                                                              |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| **DOD-01 Audience capture**         | /api/subscribe -\> email_requests + subscribers + consent_events -\> Resend eligibility -\> provider evidence.                                                    | PASS BY DESIGN - voluntary consent, durable provenance, no false success, retry-safe sync.                          |
| **DOD-02 Email audience/campaigns** | Admin campaigns -\> eligibility check -\> Resend -\> verified webhooks -\> preferences/suppression projection -\> reporting.                                      | PASS BY DESIGN - operator sends without developer intervention; preferences govern eligibility.                     |
| **DOD-03 Book purchase**            | SSR orientation -\> site_settings approved live purchase URL -\> book CTA event/destination check.                                                                | PASS BY DESIGN - book URL remains explicit R1 blocker, not invented.                                                |
| **DOD-04 Publishing**               | /admin/content -\> content_items/revisions -\> published SSR -\> cache invalidation.                                                                              | PASS BY DESIGN - no external CMS and no code rebuild.                                                               |
| **DOD-05 SEO + GEO**                | First-response SSR + metadata/JSON-LD + sitemap/robots/llms + canonical source mapping/internal links + Search Console.                                           | PASS BY DESIGN - crawlability and query/landing evidence remain required.                                           |
| **DOD-06 Author contact**           | /api/contact -\> Turnstile/rate controls -\> durable inquiry/email_request -\> receipt/operator notification -\> admin workflow.                                  | PASS BY DESIGN - legitimate inquiry is durable, protected, observable, and recoverable.                             |
| **DOD-07 Merchandise commerce**     | SSR catalog -\> Shopify cart/hosted checkout -\> verified order webhook -\> Printful fulfillment handoff -\> commerce mirror/admin.                               | PASS BY DESIGN - provider-native payment/order/fulfillment truth with observable handoff.                           |
| **DOD-08 Becoming the Man AI**      | Mode input -\> safety pre-gate -\> canonical File Search -\> structured GPT-5.6 response -\> verifier -\> source refs/feedback; assessment remains deterministic. | PASS BY DESIGN - grounding, safety, uncertainty, canonical hierarchy, usefulness, and feedback have explicit gates. |
| **DOD-09 Measurement**              | Durable DB/provider evidence + governed PostHog events + provider webhooks + Search Console + admin reporting.                                                    | PASS BY DESIGN - critical transitions are measurable without sensitive telemetry.                                   |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ARCHITECTURE REGRESSION VERDICT</strong></p>
<p><strong>PASS. DOD-01 through DOD-09 and Releases 1-4 each have an explicit implementation and evidence path. No architecture decision redefines the locked objective, user stories, governing experience, release sequence, canonical hierarchy, or safety boundaries.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**22 - OPEN DECISIONS AND LOCK RECORD**

**Open Decisions and Lock Record**

| **Decision**                                    | **State**                                 | **Stop / resolution rule**                                                                                                                                                                                     |
|-------------------------------------------------|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Final domain name**                           | OPEN - R1 production blocker              | Architecture uses CANONICAL_ORIGIN. No production launch, canonical SEO host, Search Console property, HSTS finalization, or Resend sender-domain verification completes until owned domain selected/verified. |
| **Live book purchase URL**                      | OPEN CONFIGURATION - R1 blocker           | Must resolve to verified live purchase destination before R1 exit test. Stored in validated site_settings and change-audited.                                                                                  |
| **Merchandise assortment/pricing**              | OPEN PRODUCT INPUT - R3                   | Architecture can use Shopify dev products. Live assortment/pricing is not invented by architecture.                                                                                                            |
| **GPT-5.6 exact production snapshot/reasoning** | EVAL-GATED - R4                           | Candidate/challenger IDs/config remain versioned release config. Pin exact production bundle only after required gates pass.                                                                                   |
| **AI/assessment retention durations**           | OPEN POLICY DETAIL - R4 blocker           | No production sensitive R4 collection until retention/deletion values, user disclosures, and tested jobs are approved/configured.                                                                              |
| **PostHog region/retention**                    | CONFIGURATION before production analytics | Choose provider region/retention consistent with approved privacy notice. Sensitive-data exclusions remain invariant.                                                                                          |
| **Shopify/Printful live accounts**              | PROVISIONING after architecture lock      | Provider selection is made here. Store/account creation, products, keys, webhooks, integration are implementation.                                                                                             |
| **Search Console property**                     | CONFIGURATION after domain selection      | Create/verify property after owned canonical domain exists; R2 indexing/query acceptance needs external evidence path.                                                                                         |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>STOP CONDITION</strong></p>
<p><strong>EXPLICIT LOCK DECISION RECORDED. This lock-record action does not create the production repository, root AGENTS.md, Supabase project/schema, Vercel project, Resend domain/audience, PostHog project, Shopify/Printful store integration, Search Console property, OpenAI vector store, API keys, migrations, implementation tasks, or production deployments.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**23 - SOURCE BASIS AND DECISION RECORD**

**Source Basis and Decision Record**

**Authority and source basis**

| **Authority / source**                                                              | **Architecture role**                                                                                                                                                                                           |
|-------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **BTMSCT Website Governing Product Specification v1.0 - LOCKED**                    | Controls objective, governed users/user stories, experience, DOD-01 through DOD-09, release order, R4 canonical/safety hierarchy, measurement, regression, and change control.                                  |
| **BTMSCT Website Product Specification v1.0 - APPROVED & LOCKED**                   | Controls selected core technology, routes, requirements, Supabase-backed R2 publishing, core visitor-capture tables, email/analytics/admin/SEO/assessment contracts, NFRs, release backlog, and open decisions. |
| **Published Becoming the Man She Can Trust manuscript**                             | Public book identity, Twenty-Four Non-Negotiables, trust-centered thesis, reader-facing language, chapter/examples layer.                                                                                       |
| **LOVE • PURPOSE • FLOURISH Master Relationship Operating System v1.4**             | R4 protocols, evidence calibration, safety/referral boundaries, autonomy/consent/dignity/privacy/right-to-stop constraints.                                                                                     |
| **Project Architecture / Master Story Bible / Product Vision**                      | Narrative/theme continuity, transformation framing, symbolic language, quality gates, and book \<-\> Operating-System synchronization.                                                                          |
| **Vendor capability evidence already recorded in the locked Product Specification** | Feasibility basis for React/Vite/Vercel/Supabase/OpenAI/Resend/PostHog/GitHub. This architecture does not reopen those locked technology decisions.                                                             |

**Architecture decision record**

| **Decision**                                       | **Status**       | **Reason**                                                                                                                                                       |
|----------------------------------------------------|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Supabase-backed content publishing/admin**       | SELECTED         | Required by locked Product Specification; satisfies no-rebuild operator publishing without a second content datastore/provider.                                  |
| **Vercel SSR + bounded CDN caching**               | SELECTED         | Satisfies meaningful first-response HTML and dynamic R2 content while preserving React 18.3.1/Vite.                                                              |
| **Shopify hosted commerce + Printful fulfillment** | SELECTED FOR R3  | Provider-native path satisfies hosted payment, order confirmation, fulfillment handoff, and observability with minimal PCI/application complexity.               |
| **Cloudflare Turnstile + Postgres rate limits**    | SELECTED         | Meets public-form abuse controls without introducing another persistent infrastructure service.                                                                  |
| **Supabase Auth + production TOTP MFA**            | SELECTED         | Meets authenticated/least-privilege admin need with existing platform boundary and no public registration.                                                       |
| **GPT-5.6 exact production configuration**         | NOT SELECTED YET | Locked Product Specification requires eval-gated promotion; architecture provides candidate/challenger + promotion contract instead of inventing final snapshot. |
| **Final domain and R4 retention values**           | OPEN             | Explicit upstream blockers/policy inputs. Architecture provides placeholders and release stop rules only.                                                        |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>EVIDENCE BOUNDARY</strong></p>
<p><strong>Architecture completeness proves that the approved system can implement the locked contract. It does not prove the website is DONE. Product completion remains production acceptance evidence against DOD-01 through DOD-09 and every release exit gate.</strong></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**END OF WEBSITE SYSTEM ARCHITECTURE v1.0 - APPROVED & LOCKED**
