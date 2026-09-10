**LOVE \| PURPOSE \| FLOURISH**

**BECOMING THE MAN SHE CAN TRUST**

**Website Product Specification**

**Version 1.0 • APPROVED & LOCKED**

*Subordinate to the locked Website Governing Product Specification v1.0*

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PURPOSE</strong></p>
<p>Translate the locked product outcome, user stories, Definition of Done, experience, and release contract into testable product requirements. This document does not authorize implementation and does not change the governing baseline.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Prepared 26 August 2026

# 01 • Document Control and Contract

| **Field**      | **Specification**                                                                                                                                                                           |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Authority      | Subordinate to BTMSCT Website Governing Product Specification v1.0 — LOCKED 26 August 2026.                                                                                                 |
| Status         | APPROVED & LOCKED — explicit approval and lock recorded. No implementation is authorized by this document alone.                                                                            |
| Purpose        | Decompose the locked outcome, user stories, DoD, experience, and releases into testable requirements, data/product contracts, operator workflows, and release backlog.                      |
| Precedence     | If this specification conflicts with the locked governing baseline, the baseline controls and the conflict is escalated.                                                                    |
| Admission rule | Every product requirement must map to a verified desired-state gap, governed user story, DoD capability, release, observable behavior, acceptance evidence, invariants, and stop condition. |
| Change rule    | Implementation details may change downstream only when the governed outcome, release contract, trust constraints, and acceptance criteria remain satisfied.                                 |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>INHERITED SYSTEM OBJECTIVE</strong></p>
<p>Create an owned digital system that turns attention around the ideas in Becoming the Man She Can Trust into readers, subscribers, customers, and an enduring audience relationship — and ultimately helps people apply the framework to become more trustworthy in real relationships.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>INHERITED TRANSFORMATION</strong></p>
<p>discover → understand → choose → buy/join → learn → apply → return → deepen</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>NON-NEGOTIABLE STOP</strong></p>
<p>Do not begin implementation until this Product Specification is approved and the subordinate System Architecture is produced and approved. Any downstream conflict with the locked Goal, User Stories, Experience, DoD, release sequence, or AI constitutional behavior is escalated rather than silently resolved.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Traceability to the locked Definition of Done

| **DoD** | **Capability**                 | **Owning release**            | **Primary proof**                                                                    |
|---------|--------------------------------|-------------------------------|--------------------------------------------------------------------------------------|
| DOD-01  | Consent-based audience capture | R1                            | Production signup → persisted consent → reachable subscriber.                        |
| DOD-02  | Email audience and campaigns   | R1 foundation / R2 operations | Delivery evidence + unsubscribe/preferences verification.                            |
| DOD-03  | Book purchase                  | R1                            | Entry page → correct live purchase destination.                                      |
| DOD-04  | Publishing and announcements   | R2                            | Operator publishes/updates without code deployment.                                  |
| DOD-05  | SEO + GEO                      | R2                            | Crawlable/indexable structured topic page + internal links + query/landing evidence. |
| DOD-06  | Author contact                 | R1                            | Legitimate inquiry reaches operator workflow with abuse protection.                  |
| DOD-07  | Merchandise commerce           | R3                            | Catalog → checkout → confirmation → fulfillment handoff.                             |
| DOD-08  | Becoming the Man AI            | R4                            | Scenario evals + grounding + safety routes + usefulness feedback.                    |
| DOD-09  | Measurement                    | All                           | Verified events and operator-visible reporting for every critical journey.           |

# 02 • Technology Stack Verification

Verification basis: official vendor documentation current as of 26 August 2026, interpreted against the locked DoD rather than treated as an end in itself.

## Core platform

| **Layer**        | **Requested / selected technology**               | **Verdict**         | **Product decision**                                                                                                                                                                                                                                                                                                  |
|------------------|---------------------------------------------------|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Frontend         | React 18 + Vite; user requested “single-file JSX” | PASS WITH CONDITION | Freeze React 18.3.1 if React 18 is intentional. React 18 is a previous major version; React 19.2 is current. Vite remains compatible. “Single-file JSX” may be used for a prototype or thin shell, but SHALL NOT be a production-wide constraint for this multi-release product; production UI must be componentized. |
| Public rendering | Vite React application                            | REQUIREMENT ADDED   | Indexable public routes must return meaningful HTML, metadata, and structured data without depending on client-only rendering. Exact SSR/SSG/prerender mechanism belongs in System Architecture.                                                                                                                      |
| Backend / API    | Vercel Serverless Functions (Node.js)             | PASS                | Use Node.js Functions for validated writes, secret-bearing integrations, webhooks, AI proxying, and server-side rendering endpoints where selected.                                                                                                                                                                   |
| Database         | Supabase PostgreSQL + Row Level Security          | PASS                | Use PostgreSQL as canonical application data store. RLS on exposed tables; least-privilege grants; service/secret key server-side only; admin access authenticated.                                                                                                                                                   |
| AI runtime       | “Codex” via OpenAI API proxy                      | REVISE              | Codex is optimized for agentic coding. Keep Codex for engineering/review. User-facing relationship guidance SHALL use a general-purpose GPT-5.6 model through the OpenAI Responses API via the Vercel proxy, with File Search grounding and eval-gated model promotion.                                               |
| AI grounding     | Not specified                                     | SELECT              | OpenAI File Search / vector store for versioned canonical sources; return source references into the product response contract.                                                                                                                                                                                       |
| Email            | Resend API + branded HTML                         | PASS                | Use verified sending domain, branded HTML + plain-text fallback, idempotency keys, Contacts/Segments/Topics or equivalent list controls, unsubscribe, and delivery webhooks.                                                                                                                                          |
| Hosting          | Vercel, GitHub auto-deploy                        | PASS                | Use Vercel preview deployments for change review; production promotion from the protected production branch after required verification.                                                                                                                                                                              |

## Measurement, identity, and change control

| **Layer**       | **Requested / selected technology** | **Verdict**     | **Product decision**                                                                                                                                                                            |
|-----------------|-------------------------------------|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Analytics       | Not established                     | SELECT: POSTHOG | PostHog satisfies product analytics + session replay + heatmaps in one system. Governed custom events are source of truth. Replay disabled on /ai and /admin; sensitive fields excluded/masked. |
| Domain          | Not established                     | OPEN / BLOCKER  | Do not invent a domain. Final owned domain is a Release 1 production blocker because it controls canonical host, SEO identity, Vercel DNS, and Resend SPF/DKIM.                                 |
| Version control | GitHub                              | PASS            | Protected main/production branch, pull requests, required checks, deployment previews, versioned migrations and product evidence.                                                               |

## Technology corrections do not change governance

- Replacing Codex as the user-facing runtime is an implementation correction, not a product-governance change; the locked baseline intentionally left the AI model/provider open.

- Rejecting a production-wide single-file JSX constraint preserves maintainability and release reliability; it does not change any user outcome or release scope.

- Selecting PostHog is admitted because DOD-09 requires observable journeys and the user specifically requires session recordings and heatmaps.

- The final domain remains intentionally unresolved until a separate selection decision is made.

## Verified source notes

| **Ref** | **Vendor evidence used**                                                                                               | **Implication**                                                                                     |
|---------|------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| V-01    | React official versions: React 19.2 current; React 18.3.1 previous major.                                              | React 18 remains usable, but it is not the current major.                                           |
| V-02    | Vercel Vite and Functions documentation: Vite deployments, Git previews, /api Functions, Node.js runtime, SSR options. | Requested frontend/backend/hosting combination is supported.                                        |
| V-03    | Supabase RLS/security documentation.                                                                                   | RLS + least-privilege grants are mandatory; secret/service role stays server-side.                  |
| V-04    | OpenAI Models/Responses/File Search/GPT-5-Codex documentation.                                                         | Codex is coding-optimized; Responses API + File Search supports the production advice architecture. |
| V-05    | Resend Node API, templates, webhooks, idempotency, Contacts/Audiences controls.                                        | Requested branded delivery, list operations, retries, and delivery evidence are supported.          |
| V-06    | PostHog product/web analytics, session replay, and heatmaps documentation.                                             | One analytics platform can satisfy behavior analytics + replay + heatmaps.                          |

# 03 • Users and Governing User Journeys

| **User**                      | **Need**                                              | **Success state**                                                                                                                  |
|-------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Prospective reader            | Understand relevance and obtain the book easily.      | Can decide, buy, or continue learning without unnecessary friction.                                                                |
| Subscriber / returning reader | Stay connected and go deeper.                         | Receives useful communication and can find new content/resources.                                                                  |
| Advice seeker                 | Apply the framework to a real relationship situation. | Leaves with a grounded, safer, more trustworthy next action — not generic reassurance.                                             |
| Author / operator             | Own and operate the audience system.                  | Can publish, campaign, communicate, review performance, manage commerce, and govern the AI without routine developer intervention. |

## Reader journey

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>JOURNEY</strong></p>
<p>DISCOVER → ORIENT → CHOOSE → CONVERT → LEARN → APPLY → RETURN → EXTEND</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Stage** | **User question**                     | **Required product behavior**                                                                                            |
|-----------|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Discover  | Why am I here?                        | Landing page matches source/search/referral intent and identifies the body of work.                                      |
| Orient    | What is this and is it for me?        | Book promise, author, principle relevance, and page purpose are clear before commitment.                                 |
| Choose    | What should I do next?                | One primary contextual CTA plus visible non-coercive alternatives: buy, join, learn, contact, AI, or shop when relevant. |
| Convert   | Can I complete this without friction? | Purchase click, signup, contact, checkout, or AI start works reliably with visible success/failure.                      |
| Learn     | Can I go deeper?                      | Topic pages connect real questions to canonical principles, chapters, and relevant resources.                            |
| Apply     | What do I do in my situation?         | Practical content, assessment, or AI converts principle into a responsible next action.                                  |
| Return    | What is useful now?                   | Email, content, and announcements create durable value without spam or artificial engagement loops.                      |
| Extend    | What else belongs here?               | Merchandise, future books, resources, events, and offers appear as coherent extensions rather than forced upsells.       |

## AI advice journey

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>GOVERNED SEQUENCE</strong></p>
<p>SITUATION → CLARIFY → SEPARATE FACT / INTERPRETATION → MAP PRINCIPLES → OWN RESPONSIBILITY → NEXT ACTION → EXPLAIN / SOURCE → REFLECT</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

The product objective is the user’s ability to act more trustworthily in the real relationship. Conversation length with the AI is not a success metric.

## Operator journey

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>OPERATOR LOOP</strong></p>
<p>AUTHENTICATE → REVIEW STATE → PUBLISH / CAMPAIGN / RESPOND → VERIFY DELIVERY → REVIEW OUTCOME → IDENTIFY GAP → CHANGE MINIMUM NECESSARY → KEEP / REVERT</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 04 • Information Architecture

| **Route**               | **Release** | **Purpose**                                                                  | **Primary behavior**                                               |
|-------------------------|-------------|------------------------------------------------------------------------------|--------------------------------------------------------------------|
| /                       | R1          | Immediate orientation to the book and body of work.                          | Buy book / Explore ideas / Join list.                              |
| /book                   | R1          | Book promise, who it is for, evidence-calibrated positioning, purchase path. | Buy on approved retailer.                                          |
| /about                  | R1          | Author identity, philosophy, media credibility.                              | Explore book / Contact.                                            |
| /contact                | R1          | Reader, media, speaking, or business inquiry.                                | Submit legitimate inquiry.                                         |
| /newsletter             | R1          | Consent-based owned audience opt-in.                                         | Subscribe.                                                         |
| /privacy, /terms        | R1          | Privacy, terms, analytics/email disclosures.                                 | Understand data and use boundaries.                                |
| /ideas                  | R2          | Canonical topic hub tied to the book’s principles.                           | Read / Buy / Join.                                                 |
| /ideas/:slug            | R2          | Search/GEO landing pages with attributable answers and internal links.       | Read deeper / Buy / Join.                                          |
| /news                   | R2          | Announcements, launches, media, events, campaigns.                           | Read / Join.                                                       |
| /news/:slug             | R2          | Persistent announcement/campaign page.                                       | Context-specific action.                                           |
| /shop                   | R3          | Merchandise catalog.                                                         | View product.                                                      |
| /shop/:slug             | R3          | Product detail.                                                              | Checkout.                                                          |
| /ai                     | R4          | Becoming the Man AI modes and grounded advice experience.                    | Start grounded guidance.                                           |
| /assessment             | R4          | Optional Trust Practice Readiness reflection.                                | Complete assessment.                                               |
| /assessment/results/:id | R4          | Readiness level, dimension breakdowns, gaps, recommendations.                | Apply next action / optionally email report.                       |
| /ai-disclaimer          | R4          | Educational scope, privacy, safety/referral boundaries.                      | Understand limits before sensitive use.                            |
| /admin                  | All         | Authenticated operator console.                                              | Operate content, audience, campaigns, analytics, AI, and commerce. |

Machine-readable endpoints: /sitemap.xml, /robots.txt, /llms.txt. The final domain name remains TBD. Route labels may be refined later if the governed journeys remain unchanged.

# 05 • Functional Requirements by Release

## Release 1 — Revenue + Audience

| **ID** | **Requirement**         | **Observable behavior**                                                                                                                     | **Acceptance evidence**                              |
|--------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| FR-101 | Home / book orientation | A new visitor understands the book, author, trust-centered promise, and relevant next choices before any forced opt-in.                     | Moderated user test + CTA instrumentation.           |
| FR-102 | Book purchase path      | Primary book CTAs resolve to the correct live purchase destination and preserve approved campaign attribution.                              | Production click test to live destination.           |
| FR-103 | Audience signup         | Collect email + optional first name + explicit marketing consent; persist source, consent version, and timestamp; show clear success/error. | Persisted consent record + reachable Resend contact. |
| FR-104 | Consent / preferences   | Every marketing message supports unsubscribe/preferences; suppression state is honored before future sends.                                 | End-to-end unsubscribe and suppression test.         |
| FR-105 | Author contact          | Collect inquiry type, name, email, message; apply abuse controls; send operator notification and visitor receipt.                           | Production submission + receipt + abuse test.        |
| FR-106 | Privacy / legal         | Disclose analytics, email, contact, and future AI/assessment data practices at the point they become relevant.                              | Content review + production-link check.              |
| FR-107 | Core analytics          | Track discovery, book CTA, signup, contact, and critical errors without sending sensitive payloads.                                         | Event verification in operator reporting.            |
| FR-108 | Domain readiness        | Before public launch, configure an owned canonical domain, redirects, TLS, Vercel DNS, and Resend sender authentication.                    | Canonical-host test + SPF/DKIM verification.         |
| FR-109 | R1 operator readout     | Operator can see R1 journey status: traffic source, book CTA, signup, contact delivery, and errors.                                         | Authenticated dashboard test with known fixtures.    |

## Release 2 — Distribution Engine

| **ID** | **Requirement**                | **Observable behavior**                                                                                                                               | **Acceptance evidence**                              |
|--------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| FR-201 | Operator publishing            | Create, edit, preview, publish, update, and unpublish topical/news content without code deployment.                                                   | Operator publishes and updates a production item.    |
| FR-202 | Topic pages                    | Each topic page answers a legitimate user question, maps to canonical principle(s), attributes the author/book, and offers relevant next action.      | Editorial mapping + crawl + link check.              |
| FR-203 | Announcements / campaign pages | Operator can publish durable launch, event, media, and campaign landing pages.                                                                        | Publish/update test with canonical URL.              |
| FR-204 | Campaign operations            | Operator selects an eligible audience, previews branded email, sends, and observes delivery/unsubscribe outcomes.                                     | Test campaign + delivery + suppression verification. |
| FR-205 | SEO infrastructure             | Every indexable route supports unique title/meta, canonical URL, Open Graph, structured data where supported, sitemap inclusion, and robots controls. | Automated metadata/schema/crawl checks.              |
| FR-206 | GEO content contract           | Public topic content is answer-first, evidence-aware, source-attributable, internally linked, and dated/versioned where material.                     | Content fixture + source/structure review.           |
| FR-207 | Discoverability evidence       | Operator can review indexability, qualified search/AI referrals where observable, and content-to-book/signup actions.                                 | Known test page appears in discoverability report.   |

## Release 3 — Commerce Expansion

| **ID** | **Requirement**                  | **Observable behavior**                                                                                     | **Acceptance evidence**                             |
|--------|----------------------------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| FR-301 | Merchandise catalog              | Visitor can discover approved products and understand price, fulfillment expectation, and variants.         | Catalog/product route test.                         |
| FR-302 | Checkout handoff                 | Visitor can enter checkout through the selected commerce provider without app handling raw card data.       | Provider sandbox/production checkout test.          |
| FR-303 | Order confirmation / fulfillment | Customer receives authoritative confirmation and operator can observe fulfillment handoff/state.            | End-to-end order + confirmation + handoff evidence. |
| FR-304 | Commerce analytics               | Track product view, checkout start, purchase confirmation, and fulfillment handoff without payment secrets. | Verified commerce events.                           |

## Release 4 — Becoming the Man AI

| **ID** | **Requirement**                     | **Observable behavior**                                                                                                                                                       | **Acceptance evidence**                                                     |
|--------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| FR-401 | Mode-based AI experience            | User selects Conversation Coach, Conflict & Repair, Message Review, Trust Builder, or Reflection and states situation/outcome.                                                | Mode contract tests.                                                        |
| FR-402 | Canonical grounding                 | Responses cite/refer to versioned canonical sources and distinguish book doctrine, Operating-System protocol, evidence, and general inference.                                | Grounding/source-reference evals.                                           |
| FR-403 | Governed advice sequence            | AI clarifies material ambiguity, separates facts from interpretations, maps principles, centers user responsibility, recommends minimum useful next action, and explains why. | Scenario eval suite.                                                        |
| FR-404 | Safety / scope routing              | Safety, coercion, violence, crisis, diagnosis, and professional-scope situations route before ordinary relationship optimization.                                             | Unsafe/out-of-scope eval suite.                                             |
| FR-405 | Usefulness feedback                 | User can rate whether the guidance was useful and optionally name the reason without being pressured to continue.                                                             | Feedback persistence test.                                                  |
| FR-406 | Trust Practice Readiness assessment | Optional deterministic reflection maps answers to canonical practice dimensions; no clinical diagnosis or personality labeling.                                               | Fixed-fixture scoring tests + content review.                               |
| FR-407 | Personalized results page           | Show readiness level, dimension breakdowns, gaps, and source-linked recommendations without requiring email.                                                                  | Deterministic fixture → stable results page.                                |
| FR-408 | Optional results email              | User may explicitly request a branded results report; report consent is separate from newsletter consent.                                                                     | One report request → one delivered email; no silent marketing subscription. |
| FR-409 | AI / assessment admin               | Operator can review aggregate usefulness, safety routes, source/grounding status, assessment dimension trends, and consented conversations.                                   | Authenticated admin fixture test.                                           |
| FR-410 | R4 analytics                        | Measure AI start/mode/completion/safety/usefulness and assessment start/progress/completion/results/report request without sending private text to analytics.                 | Event payload inspection.                                                   |

# 06 • Assessment and Personalized Results — Alignment-Gate Admission

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>STATUS</strong></p>
<p>ADMITTED TO RELEASE 4 as an optional application/reflection feature only. It is not a new commercial objective and it is not a diagnostic product.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Alignment field**      | **Decision**                                                                                                                                                                                       |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Desired-state gap        | The governed product must help users move from learning to application. The current state lacks a structured self-reflection path that can identify practice gaps before or alongside AI guidance. |
| User story               | US-01 and US-02: move from consuming advice to practicing trustworthy behavior; choose a safer, more trustworthy next action.                                                                      |
| DoD mapping              | DOD-08 primarily; DOD-09 for measurable use.                                                                                                                                                       |
| Release mapping          | R4 — Becoming the Man AI/application layer.                                                                                                                                                        |
| Expected behavior        | User completes an optional structured reflection, receives deterministic nonclinical results, sees practice gaps and relevant next actions, and may continue to content/AI.                        |
| Acceptance evidence      | Versioned scoring fixtures produce identical results; source mapping reviewed; results accessible without email; report email requires explicit separate consent.                                  |
| Constraints / invariants | No diagnosis; no “good/bad partner” labeling; no guarantee of relationship outcomes; no email gate; AI cannot calculate or silently alter scores; no deceptive scoring pressure.                   |
| Stop condition           | If scoring cannot remain deterministic, explainable, canonical, nonclinical, and independent of email capture, the assessment is deferred rather than weakening the baseline.                      |

## Assessment dimensions

| **Dimension**                 | **Evaluates**                                                       | **Canonical emphasis**                                                     |
|-------------------------------|---------------------------------------------------------------------|----------------------------------------------------------------------------|
| Character & Integrity         | Alignment between stated values, promises, and behavior.            | Character; Integrity Creates Predictability; Trust Is Built Daily.         |
| Purpose & Self-Leadership     | Direction, self-governance, responsibility before partnership.      | Purpose Before Partnership; Responsibility Precedes Influence.             |
| Emotional Safety & Regulation | Ability to reduce escalation and preserve dignity/safety.           | Emotional Safety Comes Before Emotional Intensity; Conflict Is Inevitable. |
| Curiosity & Shared Meaning    | Listening, assumption checking, mutual understanding.               | Curiosity Is Stronger Than Assumption; Communication Is Shared Meaning.    |
| Repair & Accountability       | Ownership, apology, correction, follow-through.                     | Repair Is More Important Than Perfection; Responsibility.                  |
| Boundaries & Respect          | Self-governing limits, voluntary choice, respect, no control.       | Boundaries Protect Love; Respect Is Practiced.                             |
| Consistency & Trust           | Reliable repeated behavior under ordinary and difficult conditions. | Trust Is Built Daily; Adversity Reveals Character.                         |
| Growth & Practice             | Learning, adaptation, gratitude, friendship, repeated practice.     | Growth Is Continuous; Love Is a Practice.                                  |

Scoring contract: numeric scores and readiness levels are deterministic from versioned rules. The AI may explain or contextualize results using canonical sources but SHALL NOT calculate or change the score. Initial neutral levels: Foundation, Developing, Practicing, Consistent. These labels describe practice state, not clinical condition or human worth.

# 07 • Database and Data-Capture Product Contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>THREE-TABLE CLARIFICATION</strong></p>
<p>The user-requested three tables are approved as the three core visitor-capture tables. They are not the total database schema. DOD-04, DOD-02, operator governance, and auditability require additional operational tables.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Core visitor-capture tables

| **Table**        | **Required logical fields**                                                                                                                                                                              | **Privacy / retention rule**                                                                                                                        | **Authorized write path**                                               |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| assessments      | id; session_id; assessment_version; answers_jsonb; dimension_scores_jsonb; readiness_level; gaps_jsonb; recommendations_jsonb; report_email_request_id nullable; created_at                              | Prefer structured answers over free text. No clinical fields. Do not duplicate email. Retention policy is versioned and disclosed.                  | Validated POST /api/assessment only.                                    |
| ai_conversations | id; session_id; mode; consent_to_store; transcript_jsonb nullable; source_refs_jsonb; grounding_status; safety_route; model_version; prompt_version; helpfulness; feedback_reason; created_at/updated_at | Transcript stored only with explicit consent. Without consent, retain only permitted operational aggregates needed for safety/reliability/evidence. | Validated /api/ai path; admin read only when authorized.                |
| email_requests   | id; request_type; email; first_name; consent_scope; consent_version; source; payload_jsonb; resend_message_id; delivery_status; error_code; created_at/updated_at                                        | Marketing consent and transactional/report purpose are separate. Store minimum necessary payload.                                                   | Subscribe/contact/report/campaign functions + verified Resend webhooks. |

## Supporting operational tables required by the product

| **Table**                      | **Purpose**                                                                                     | **Public access**                               |
|--------------------------------|-------------------------------------------------------------------------------------------------|-------------------------------------------------|
| content_items                  | R2 ideas/news/campaign landing content, publish state, SEO metadata, canonical principle links. | Published rows/fields only; writes admin-only.  |
| campaigns                      | Draft/schedule/send state, selected audience, template/version, aggregate delivery outcomes.    | None.                                           |
| site_settings                  | Canonical host, approved book purchase URL, contact routing, public metadata, feature flags.    | Narrow read of explicitly public settings only. |
| admin_audit_log                | Publish, send, export, AI-config/source, and other consequential operator actions.              | None.                                           |
| commerce_mirror (R3 if needed) | Minimal provider order/fulfillment reference when provider status cannot be queried reliably.   | None.                                           |

## Data invariants

- Enable RLS on every table in an exposed Supabase schema and revoke default privileges before granting only required operations.

- No public SELECT on assessments, ai_conversations, email_requests, campaigns, admin_audit_log, or commerce mirrors.

- Browser never receives Supabase service-role/secret key, Resend API key, OpenAI key, or commerce secret.

- Sensitive public writes go through validated Vercel Functions unless a narrowly scoped RLS client write is explicitly proven safer and equivalent.

- Operator identity is authenticated; admin authorization is least privilege and auditable.

- Consent state is purpose-specific. Requesting a receipt, report, or contact response does not create marketing consent.

- Deletion/retention procedures must be defined before production collection of AI or assessment data.

# 08 • Email System Product Contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DELIVERY FLOW</strong></p>
<p>USER ACTION → VERCEL FUNCTION → VALIDATE / PERSIST REQUEST → RESEND API → MESSAGE ID / STATUS → RESEND WEBHOOK → UPDATE DELIVERY STATE → ADMIN VISIBILITY</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Message**             | **Trigger**                         | **Recipient**              | **Required behavior**                                                                                  |
|-------------------------|-------------------------------------|----------------------------|--------------------------------------------------------------------------------------------------------|
| Welcome                 | Confirmed audience signup           | Subscriber                 | Branded welcome; expectations; unsubscribe/preferences; no deceptive urgency.                          |
| Contact receipt         | Successful contact submission       | Visitor                    | Acknowledge receipt; do not promise response time unless operationally true.                           |
| Contact notification    | Successful legitimate contact       | Operator                   | Minimum necessary metadata + secure admin link when message sensitivity warrants it.                   |
| Assessment report       | Explicit “email my results” request | Visitor                    | Branded HTML summary + secure results link; separate from newsletter consent.                          |
| Campaign / announcement | Operator-approved send              | Selected eligible audience | Preview before send; suppression/unsubscribe enforced; delivery/click evidence visible.                |
| AI summary              | Explicit future user request only   | User                       | No automatic sending of sensitive relationship text; requires clear consent and safe content handling. |
| Order confirmation      | Successful commerce event           | Customer                   | Exactly one authoritative confirmation from the selected commerce/email path.                          |

## Email invariants

- Use a project-owned verified sending domain before production. SPF/DKIM and required DNS records must pass.

- Templates visually match the book: white, deep navy, restrained teal, editorial typography, plain-text fallback.

- Use a unique idempotency key per logical send so retries do not duplicate delivery.

- Persist provider message ID and delivery/error state, and process signed/verified delivery webhooks.

- Marketing messages always honor unsubscribe/preferences and suppression before subsequent sends.

- Do not embed full sensitive AI/assessment content in admin notification email when a secure dashboard link is sufficient.

# 09 • Analytics, Session Replay, Heatmaps, and Evidence

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>SELECTED ANALYTICS PLATFORM</strong></p>
<p>PostHog. Selection is based on its ability to support product/web analytics, custom events, session replay, and heatmaps in one system. Metrics remain evidence about the governed journeys; they do not replace the product outcome.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Event family** | **Core events**                                                                          | **Privacy rule**                                                 |
|------------------|------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| Discovery        | page_view; landing_source; content_view                                                  | No sensitive payloads in URLs/properties.                        |
| Book             | book_cta_view; book_cta_click; destination_ok                                            | Campaign attribution permitted; no raw identity required.        |
| Audience         | signup_start; signup_complete; signup_error; unsubscribe                                 | Never send raw email as analytics event property.                |
| Contact          | contact_start; contact_submit; contact_error                                             | Never record message body in analytics or replay.                |
| Content          | topic_view; related_click; content_to_book; content_to_signup                            | Track page IDs/slugs, not private reader text.                   |
| Commerce         | product_view; checkout_start; purchase_confirmed; fulfillment_handoff                    | No card/payment secrets in application analytics.                |
| Assessment       | assessment_start; question_progress; assessment_complete; results_view; report_requested | Track aggregate progress/dimensions only; no free text or email. |
| AI               | ai_start; mode; response_complete; safety_route; usefulness                              | Never send conversation transcript; replay disabled on /ai.      |
| Operator         | publish; campaign_send; export                                                           | Admin events support audit; replay disabled on /admin.           |

## Session replay and heatmap constraints

- Disable session replay on /ai and /admin entirely.

- Mask or exclude email, contact form fields, assessment inputs, and all free-text relationship content from replay.

- Heatmaps diagnose navigation and CTA friction on public non-sensitive pages; they are not a justification for dark-pattern conversion tactics.

- Custom governed events, persisted operational state, and acceptance tests are authoritative for DoD evidence; replay is diagnostic context only.

# 10 • Design System Direction and Progressive UX

## Visual direction

- Use the published cover as the primary visual reference: strong white space, deep navy typography, restrained teal accent, editorial rather than “dating app” aesthetics.

- Prioritize the book’s trust-centered promise and usefulness before promotional urgency.

- Use one primary CTA per context with visible secondary choices. Avoid modal traps, repeated full-screen opt-ins, and forced funnels.

- Public pages should feel calm and readable; AI and assessment should feel like guided tools, not gamified engagement loops.

- Use recurring metaphors such as Harbor, Compass, Lighthouse, Bridge, Garden, Forge, Fire, and Hearth only when they clarify canonical meaning, not as decorative clutter.

## Progressive enhancements and trust constraints

| **Enhancement**      | **Allowed implementation**                                                                    | **Prohibited regression**                                                                     |
|----------------------|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Progress tracking    | Assessment steps, long forms, uploads, or AI processing states show truthful progress/status. | False completion pressure, gamified streak pressure, or urgency.                              |
| Social proof         | Verified reviews, media quotes, reader evidence, or sales evidence with source/context.       | Invented testimonials, unverified counters, fake scarcity, anonymous “live purchase” popups.  |
| Browser exit warning | Only when the user has unsaved authored input that would otherwise be lost.                   | Exit-intent marketing popup or blocking ordinary navigation.                                  |
| localStorage         | Non-sensitive draft/progress identifiers and UI preferences; time-limit where practical.      | Persisting email, full contact message, assessment free text, or AI transcript by default.    |
| Animation            | Subtle transitions that improve orientation and show state change.                            | Animation that delays reading, hides controls, triggers motion discomfort, or impairs access. |

## Responsive and accessibility acceptance

- Core journeys work on current mobile and desktop layouts, including touch, keyboard, and reduced viewport widths.

- Target WCAG 2.2 AA for core journeys: semantic landmarks, labeled forms, visible focus, meaningful alt text, sufficient contrast, and keyboard operability.

- No critical action depends on hover, color alone, or an animation completing.

# 11 • Admin Dashboard Product Contract

The admin dashboard is not the operator outcome by itself. It exists to make the governed operator capabilities independently usable and evidence-visible.

| **Module**           | **Required capability**                                                                                                                                                                                       | **Acceptance behavior**                                                                         |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| KPI cards            | Qualified visits; book CTA conversion; signup conversion; contact delivery; campaign delivery/click/unsubscribe; content downstream action; commerce conversion; AI usefulness/safety; assessment completion. | Known fixtures produce correct period/filter totals and link to underlying operational state.   |
| Dimension analytics  | Aggregate assessment dimension distributions, recurring gaps, and trend by version/time.                                                                                                                      | No clinical ranking; no exposure of private answers in aggregate view.                          |
| Conversation viewer  | Review only conversations stored with explicit consent; filter by mode, safety route, usefulness, model/prompt version, and source references.                                                                | Authorized operator sees consented record + source refs; unconsented transcript is unavailable. |
| CSV export           | Export filtered operational/aggregate data for legitimate analysis.                                                                                                                                           | Default excludes secrets and raw transcript; export action is audited.                          |
| Content publishing   | Create/edit/preview/publish/unpublish ideas/news/campaign pages.                                                                                                                                              | Production item can be changed without deployment.                                              |
| Audience / campaigns | Review consent status, subscriber operations, campaign previews, send state, delivery, unsubscribe.                                                                                                           | Suppressed user cannot be sent a marketing campaign.                                            |
| Contact workflow     | Review legitimate inquiries and delivery status; mark handling state.                                                                                                                                         | Submission and receipt are traceable without emailing sensitive bodies unnecessarily.           |
| Commerce visibility  | Observe provider order reference, confirmation, and fulfillment handoff.                                                                                                                                      | End-to-end test order visible.                                                                  |
| AI governance        | Review source manifest/version, eval results, safety/grounding failures, prompt/model version, usefulness.                                                                                                    | A model/prompt/source change is version-visible before promotion.                               |
| Site settings        | Manage approved public metadata, canonical host, purchase URL, contact routing, feature flags.                                                                                                                | Consequential changes are authenticated and audited.                                            |

## Admin security requirements

- Authenticated operator access with least privilege; no anonymous admin route data.

- Session replay disabled on /admin.

- Consequential operator actions are logged to admin_audit_log with actor, action, target, timestamp, and relevant version/reference.

- CSV and sensitive conversation access require explicit operator action; browser URLs and analytics never include private record content.

# 12 • SEO, GEO, and Discoverability Product Contract

| **Requirement**             | **Product behavior**                                                                                                                                                           |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Search-intent alignment     | Each indexable idea page answers a specific legitimate user question and states the relevant principle before promotional copy.                                                |
| Entity consistency          | Book title, author name, ISBN/edition where appropriate, canonical URLs, and topic relationships remain consistent across pages and metadata.                                  |
| Attribution                 | Public informational content names the author/body of work and distinguishes published book doctrine, Operating-System protocol, evidence, and interpretation.                 |
| Structured data             | Use schema types only when supported by visible page content: Book, Person, Article/BlogPosting, BreadcrumbList, FAQPage for visible Q&A, and Product for merchandise.         |
| Technical crawlability      | Indexable public routes return meaningful first-response HTML; unique title/description; canonical URL; sitemap; robots rules; no orphan pages; normalized canonical host.     |
| Open Graph                  | Every shareable public route has truthful page-specific Open Graph title, description, canonical URL, and approved image where available.                                      |
| llms.txt                    | Publish a concise machine-readable index of important public entities and canonical pages. llms.txt is supplemental discoverability infrastructure, not “GEO by itself.”       |
| GEO answer structure        | Answer-first summary, explicit question, concise evidence-aware explanation, canonical source references, related concepts, and visible published/updated date where material. |
| Internal linking            | Topic → principle/chapter/body-of-work; related topics; relevant Buy/Join path. Avoid generic keyword link farms.                                                              |
| Trending-topic rule         | Connect trends only when a legitimate canonical principle match exists. No opportunistic keyword hijacking.                                                                    |
| Discoverability measurement | Review indexability, qualified search/AI referral where observable, and downstream content-to-book/signup actions.                                                             |

## Indexing acceptance tests

- A crawler fetching an indexable route without executing app JavaScript receives the page’s primary content, title, canonical, and required structured data.

- sitemap.xml contains only canonical indexable URLs and updates when publish state changes.

- robots.txt does not accidentally block intended public content and explicitly protects non-public routes where appropriate.

- JSON-LD validates and does not claim properties or schema types unsupported by visible content.

- Canonical URLs do not vary by analytics parameters, preview hosts, or client state.

# 13 • Non-Functional Requirements

| **ID** | **Quality attribute** | **Acceptance target**                                                                                                                                            |
|--------|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NFR-01 | Responsive usability  | All critical R1-R4 user journeys function on current mobile and desktop viewport classes without horizontal clipping or hidden critical controls.                |
| NFR-02 | Accessibility         | Target WCAG 2.2 AA for core journeys: semantic structure, keyboard navigation, labels, visible focus, alt text, contrast, reduced-motion respect.                |
| NFR-03 | Performance           | Public entry pages target LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75 where field data is available; avoid unnecessary blocking client bundles.                    |
| NFR-04 | Privacy               | Purpose-limited collection; explicit consent separation; disclosed retention/deletion; no sensitive replay capture; no private text in analytics payloads.       |
| NFR-05 | Security              | Secrets server-side; least privilege; RLS/grants; authenticated admin; abuse/rate controls; validated inputs; signed webhook verification; no raw card handling. |
| NFR-06 | Reliability           | Critical writes and email sends are idempotent; errors visible; delivery state persists; retry does not create duplicate records/messages.                       |
| NFR-07 | Observability         | Critical API, email delivery, publish, commerce handoff, AI grounding/safety, and ingestion/eval failures are operator-visible.                                  |
| NFR-08 | Release regression    | Earlier release exit gates remain continuously testable and must pass before later release promotion.                                                            |
| NFR-09 | Canonical integrity   | Website content and AI guidance never silently alter the published book principles or Operating-System safety/evidence hierarchy.                                |

# 14 • Release Backlog and Exit Evidence

| **Release**              | **Product epics**                                                                                                                                                                          | **Exit evidence**                                                                                                                               |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| R1 — Revenue + Audience  | Brand shell; home/book/about/contact; signup; Resend foundation; privacy/legal; canonical domain; core PostHog events; baseline admin readout.                                             | Real visitor: orient → book destination; signup → consented reachable contact; contact → operator/receipt; all observable and failures visible. |
| R2 — Distribution Engine | Supabase-backed publishing; ideas/news; public rendering/metadata; sitemap/robots/llms; campaign operations; internal links; discoverability dashboard.                                    | Operator publishes without rebuild; page is crawlable/indexable; test campaign reaches eligible audience; unsubscribe works.                    |
| R3 — Commerce Expansion  | Commerce/fulfillment provider selection; catalog; product routes; hosted checkout; confirmation; fulfillment visibility; commerce analytics.                                               | Sandbox/production order completes and operator observes confirmation/handoff.                                                                  |
| R4 — Becoming the Man AI | Canonical source ingestion; File Search; AI modes; eval harness; Trust Practice Readiness assessment; deterministic results; optional report email; AI admin; usefulness/safety analytics. | Representative + unsafe + ambiguous scenarios pass; assessment fixtures stable; sensitive data controls verified; user feedback captured.       |

## Open decisions / blockers before implementation or production

| **Decision**                                                            | **State**                    | **Required before**                                                                           |
|-------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| Final domain name                                                       | OPEN                         | R1 production launch + verified Resend sender + canonical SEO host.                           |
| Exact public rendering mechanism (SSR/SSG/prerender within Vite/Vercel) | OPEN FOR SYSTEM ARCHITECTURE | R2 indexable content implementation; R1 home/book should already be crawl-safe.               |
| Final GPT-5.6 runtime model                                             | EVAL-GATED                   | R4 production. Default candidate: GPT-5.6 Terra; GPT-5.6 Sol as quality challenger/reference. |
| Commerce / payment provider                                             | OPEN                         | R3 build.                                                                                     |
| Fulfillment provider / process                                          | OPEN                         | R3 build.                                                                                     |
| AI/assessment retention durations                                       | OPEN POLICY DETAIL           | Before collecting production R4 sensitive data.                                               |

## Implementation admission sequence

1.  Approve or revise this Website Product Specification.

2.  Produce the subordinate System Architecture from the approved Product Specification.

3.  Run architecture regression review against DOD-01 through DOD-09 and Releases 1 through 4.

4.  Approve architecture and repo/data/security boundaries.

5.  Only then create epics/stories/tasks that pass the eight-field Outcome Alignment Gate.

6.  Implement release-by-release and require each release exit evidence before promotion.

# 15 • Outcome Alignment and Regression Review

## Requested capability admission results

| **Requested capability**              | **Gap / user mapping**                                                                    | **DoD / release**                             | **Verdict**                                            |
|---------------------------------------|-------------------------------------------------------------------------------------------|-----------------------------------------------|--------------------------------------------------------|
| Resend branded automated email        | Owned audience, reliable contact/report/campaign communication; US-01/US-03.              | DOD-01/02/06; R1-R2; report in R4.            | ADMIT                                                  |
| Three Supabase visitor-capture tables | Persist assessment/AI/email request evidence; US-01/02/03.                                | DOD-01/06/08/09; R1/R4.                       | ADMIT AS CORE TABLES, NOT TOTAL SCHEMA                 |
| Admin KPI cards                       | Operator must see whether journeys work; US-03.                                           | DOD-09; all.                                  | ADMIT                                                  |
| Dimension analytics                   | Structured assessment reflection supports application and operator evidence; US-01/02/03. | DOD-08/09; R4.                                | ADMIT WITH NONCLINICAL CONSTRAINT                      |
| Conversation viewer                   | AI governance/usefulness review; US-03.                                                   | DOD-08/09; R4.                                | ADMIT ONLY FOR EXPLICITLY CONSENTED STORED TRANSCRIPTS |
| CSV export                            | Operator analysis/audit; US-03.                                                           | DOD-09; all where applicable.                 | ADMIT WITH SENSITIVE-DATA DEFAULT EXCLUSIONS           |
| Personalized results page             | Structured reflection closes learn→apply gap; US-01/02.                                   | DOD-08/09; R4.                                | ADMIT AS OPTIONAL DETERMINISTIC TOOL                   |
| SEO infrastructure + llms.txt         | Discoverability and DOD-05.                                                               | DOD-05/09; R2.                                | ADMIT; llms.txt supplemental only                      |
| Session recordings / heatmaps         | Diagnose friction and abandonment; US-03.                                                 | DOD-09; all.                                  | ADMIT WITH PRIVACY ZONES                               |
| Progress tracking                     | Reduce uncertainty in legitimate multi-step tasks.                                        | Supports quality gates; R4/contact as needed. | ADMIT                                                  |
| Social proof                          | Help orient/choose when evidence is genuine.                                              | Supports US-01/R1-R2.                         | ADMIT ONLY WHEN VERIFIED                               |
| Browser exit warnings                 | Prevent loss of user-authored work.                                                       | Supports reliability/UX.                      | ADMIT ONLY FOR UNSAVED DATA LOSS                       |
| localStorage persistence              | Resume non-sensitive progress/preferences.                                                | Supports reliability/UX.                      | ADMIT WITH SENSITIVE-DATA EXCLUSIONS                   |

## Regression check against governing invariants

| **Invariant**              | **Result** | **Reason**                                                                                                                |
|----------------------------|------------|---------------------------------------------------------------------------------------------------------------------------|
| System over local reward   | PASS       | Every requested artifact is tied to a governed journey/DoD; no feature count or event volume becomes the objective.       |
| Gap before action          | PASS       | Capabilities admitted only where a stated user/operator gap exists; domain and commerce remain open rather than invented. |
| User before artifact       | PASS       | Admin, assessment, analytics, and SEO are defined as enabling capabilities, not outcomes themselves.                      |
| Evidence before completion | PASS       | Every release and major requirement has observable acceptance evidence.                                                   |
| Preserve canonical meaning | PASS       | R4 source hierarchy, deterministic scoring, and content attribution prevent silent doctrinal drift.                       |
| Owned relationship         | PASS       | Website, consented email audience, publishing, and campaigns are central.                                                 |
| Trust before extraction    | PASS       | No email-gated assessment; no exit-intent marketing; social proof verified; consent separated.                            |
| Release discipline         | PASS       | R4 does not delay or relax R1-R3 exit gates; later releases extend prior verified states.                                 |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PRODUCT-SPECIFICATION VERDICT</strong></p>
<p>APPROVED & LOCKED v1.0 is internally aligned with the locked governing baseline and the user’s requested capability set. Explicit approval and lock are recorded. No implementation is authorized by this document alone.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Next authorized artifact after approval

Website System Architecture v1.0: select the exact rendering/runtime topology, repository layout, API contracts, database migrations/RLS policies, email webhook architecture, PostHog instrumentation boundaries, admin authentication, SEO rendering path, R4 File Search/eval/security architecture, deployment topology, and observability. It must remain subordinate to this Product Specification and the locked governing baseline.

# Appendix A • Evidence Basis

Governing sources

- BTMSCT Website Governing Product Specification v1.0 — LOCKED 26 August 2026.

- Published Becoming the Man She Can Trust manuscript — public book identity and Twenty-Four Non-Negotiables.

- LOVE • PURPOSE • FLOURISH Master Relationship Operating System v1.4 — evidence calibration, safety hierarchy, protocols, decision/referral boundaries.

- Project Architecture, Master Story Bible, and Product Vision — narrative/thematic continuity and book/Operating-System synchronization.

Current technology verification sources

- React official version and release documentation.

- Vercel documentation for Vite deployments, Git previews, Node.js Functions, and server rendering options.

- Supabase documentation for Row Level Security, API keys, grants, and service-role handling.

- OpenAI documentation for GPT-5.6 models, Responses API, File Search, and GPT-5-Codex.

- Resend documentation for Node email API, templates, idempotency, Contacts/Audiences controls, and webhooks.

- PostHog documentation for product/web analytics, session replay, and heatmaps.

Evidence rule: vendor capability verification proves feasibility of the selected technology. It does not prove the website is done. Product completion remains governed by DOD-01 through DOD-09 and production acceptance evidence.
