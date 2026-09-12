# SEO/GEO Baseline Specification v1 — PROPOSED

**Status:** PROPOSED / NOT FROZEN  
**Date:** 2026-09-11  
**Repository baseline:** `main@ce64d1b82d1e803bf1a31ae2098dc7d0e47e8eb7`  
**Canonical production host under evaluation:** `https://www.becomingthemanshecantrust.com`

> This document is a proposed baseline contract. It does not supersede `AGENTS.md`, the locked Product Specification, the locked System Architecture, approved architecture amendments, or any later user-approved authority. It becomes governing only after explicit user approval/freeze.

## 1. Purpose

Establish a zero-trust, evidence-backed SEO/GEO baseline for the public website before implementation of Release 2 SEO/GEO infrastructure or publication of generated topical content.

The baseline must distinguish:

1. product/repository authority,
2. provider-defined crawler and indexing behavior,
3. peer-reviewed empirical evidence,
4. observed production/provider state,
5. hypotheses and experiments.

No generated content, vendor dashboard, crawler label, public SERP observation, or model response may self-certify compliance.

## 2. Authority bindings

This proposal binds existing requirements; it does not replace them.

### 2.1 Website Product Specification v1.0 — LOCKED

Relevant requirements:

- `FR-205 SEO infrastructure`: every indexable route supports unique title/meta, canonical URL, Open Graph, structured data where supported, sitemap inclusion, and robots controls; acceptance requires automated metadata/schema/crawl checks. See `docs/Website_Product_Specification_v1.0_LOCKED.md:258`.
- `FR-206 GEO content contract`: public topic content is answer-first, evidence-aware, source-attributable, internally linked, and dated/versioned where material. See `docs/Website_Product_Specification_v1.0_LOCKED.md:259`.
- `FR-207 Discoverability evidence`: operator can review indexability, qualified search/AI referrals where observable, and content-to-book/signup actions. See `docs/Website_Product_Specification_v1.0_LOCKED.md:260`.
- Machine-readable endpoints include `/sitemap.xml`, `/robots.txt`, and `/llms.txt`. See `docs/Website_Product_Specification_v1.0_LOCKED.md:232`.

### 2.2 Website System Architecture v1.0 — LOCKED

Relevant architecture:

- Public indexable routes are SSR-first and canonical metadata derives from `CANONICAL_ORIGIN`. See `docs/Website_System_Architecture_v1.0_LOCKED.md:318-325`.
- SEO metadata, structured data, sitemap, environment-aware robots, supplemental `llms.txt`, contextual internal linking, and Search Console/PostHog evidence are defined at `docs/Website_System_Architecture_v1.0_LOCKED.md:521-535`.
- Indexing acceptance checks require first-response content/title/canonical/structured data, canonical-only sitemap URLs, robots behavior, matching JSON-LD, and canonical stability. See `docs/Website_System_Architecture_v1.0_LOCKED.md:537-547`.
- Evidence precedence is acceptance tests and durable provider/database state, governed custom events, logs, diagnostic replay/heatmaps, then Search Console as external indexing/query evidence. See `docs/Website_System_Architecture_v1.0_LOCKED.md:565-575`.

## 3. Evidence hierarchy for this baseline

When claims conflict, use the narrowest authoritative source for the claim being tested.

| Class | Evidence | Permitted use | Not permitted |
|---|---|---|---|
| A | Repository authority: `AGENTS.md`, locked Product Spec, locked Architecture, approved amendments | Product obligations, release order, acceptance contract | Provider behavior not defined by repository |
| B | First-party platform/provider documentation | Meaning of crawler identities, provider controls, Search Console semantics | Ranking/GEO efficacy claims beyond provider documentation |
| C | Peer-reviewed empirical research | Empirical search/GEO findings, uncertainty, repeatability requirements | Overriding provider control semantics or repository authority |
| D | Durable observed provider/production state | Actual HTTP responses, Search Console state, Cloudflare state, CI results | Generalizing one observation into universal behavior |
| E | Hypotheses / experiments / vendor diagnostics | Candidate optimization and measurement | Acceptance proof without higher-class evidence |

A lower class cannot override a higher-class source within the higher source's authority domain.

## 4. Accepted before-state — 2026-09-11

### 4.1 Repository

At baseline SHA `ce64d1b82d1e803bf1a31ae2098dc7d0e47e8eb7`:

- Public application routes are currently `/`, `/book`, `/disclaimer`, and `/api/subscribe`.
- Current PR verification checks SSR-visible content but does not yet mechanically gate canonical tags, Open Graph, JSON-LD, sitemap membership, crawler-policy semantics, or `llms.txt`.
- No repository route for `/sitemap.xml` or `/llms.txt` is present at this baseline.
- Release 2 topic routes `/ideas`, `/ideas/:slug`, `/news`, and `/news/:slug` are not yet implemented.

### 4.2 Production robots state

Production `https://www.becomingthemanshecantrust.com/robots.txt` returned HTTP 200 on 2026-09-11 and was Cloudflare-managed.

Observed managed signal:

```text
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
```

Observed explicit disallows include:

- `Amazonbot`
- `Applebot-Extended`
- `Bytespider`
- `CCBot`
- `ClaudeBot`
- `CloudflareBrowserRenderingCrawler`
- `Google-Extended`
- `GPTBot`
- `meta-externalagent`

Cloudflare's managed content signal currently omits `ai-input`. Per Cloudflare's own Content Signals documentation, omission is not equivalent to either an explicit grant or an explicit denial. The baseline therefore records:

`AI_INPUT_SIGNAL = UNSPECIFIED_BY_MANAGED_ROBOTS`

This is a control limitation, not permission to claim `ai-input=yes`.

### 4.3 Search Console state

Operator-captured Google Search Console evidence on 2026-09-11 establishes:

- Domain-property ownership for `becomingthemanshecantrust.com`: **VERIFIED** through the domain name provider.
- `https://www.becomingthemanshecantrust.com/`: **URL is on Google / Page is indexed**.
- `https://www.becomingthemanshecantrust.com/book`: **URL is on Google / Page is indexed**.
- Site-wide Page Indexing report: **PENDING_GOOGLE_PROCESSING**.
- Search Performance/query report: **PENDING_GOOGLE_PROCESSING**.

The two inspected URLs are therefore individually confirmed indexed at capture time. The baseline must not extrapolate from those two URLs to whole-site index coverage.

Google documents URL Inspection as the tool that reports Google's indexed version of a specific page and Page Indexing as the site-wide coverage report. "URL is on Google" means the URL is indexed and eligible to appear, not a guarantee of appearance for every query.

### 4.4 Other production SEO state

Observed before-state from the approved reconnaissance:

- `/sitemap.xml`: **HTTP 404**.
- `/llms.txt`: **HTTP 404**.
- Homepage and `/book` return meaningful SSR HTML with unique titles/descriptions.
- Canonical tags were not observed on inspected first-response HTML.
- Open Graph metadata was not observed on inspected first-response HTML.
- JSON-LD was not observed on inspected first-response HTML.
- The Vercel production alias was observed serving equivalent public content without a canonical/noindex safeguard at that time; canonical-host control remains an explicit implementation obligation.

## 5. Explicit AI-crawler access policy v1

### 5.1 Semantic policy

```text
PUBLIC_SEARCH_DISCOVERY       = ALLOW
AI_SEARCH_RETRIEVAL           = ALLOW where separately controllable
USER_DIRECTED_AI_RETRIEVAL    = ALLOW where separately controllable
MODEL_TRAINING_CRAWLING       = DENY where separately controllable
CONTENT_REUSE_LEVEL           = REFERENCE
PRIVATE_PREVIEW_ADMIN_RESULTS = DENY / NOINDEX
GOOGLE_INDEX_QUERY_EVIDENCE   = SEARCH_CONSOLE
```

This policy is intentionally about use purpose, not company identity. Where a provider exposes separate search/user/training crawlers, the controls must preserve that separation.

### 5.2 Provider-specific controls

| Provider / crawler | Purpose supported by first-party evidence | Policy |
|---|---|---|
| Googlebot | Google Search crawling; Google Search AI features depend on normal Search eligibility | ALLOW on intended public indexable routes |
| Google-Extended | Separate control for Gemini model development and some Gemini/Vertex grounding uses; does not control Google Search inclusion/ranking | DENY |
| OAI-SearchBot | ChatGPT search discovery, snippets, and citations | ALLOW |
| ChatGPT-User | User-directed retrieval | ALLOW |
| GPTBot | Content that may be used for OpenAI model training | DENY |
| Claude-SearchBot | Anthropic search indexing/relevance | ALLOW |
| Claude-User | User-directed Claude retrieval | ALLOW |
| ClaudeBot | Content that could contribute to Anthropic model training | DENY |
| PerplexityBot | Search indexing; Perplexity states this crawler is not used for foundation-model pre-training | ALLOW |
| Perplexity-User | User-directed retrieval | ALLOW |
| Applebot | Apple search and current-context retrieval; Apple documents separate training opt-out via Applebot-Extended | ALLOW |
| Applebot-Extended | Apple foundation-model training opt-out control | DENY |
| Amazonbot | Classified/controlled as AI crawler in current Cloudflare policy | DENY pending contrary higher-quality evidence |
| Bytespider | Training-oriented/AI crawler under current control policy | DENY |
| CCBot | Broad web collection used in AI-data pipelines; not required for product search visibility | DENY |
| Meta-ExternalAgent | Meta AI crawler | DENY |
| Meta-ExternalFetch | User-triggered retrieval surface | ALLOW |
| Unknown crawler | No inferred permission beyond public-web access and declared signals | ALLOW ordinary public discovery only; no implied training grant |

### 5.3 Google-Extended exception is deliberate

The peer-reviewed SIGIR 2026 study by Grossman et al., *How Generative AI Disrupts Search: An Empirical Study of Google Search, Gemini, and AI Overviews* (DOI: 10.1145/3805712.3809667) found that sites blocking Google-Extended were significantly less likely to be retrieved by Gemini and AIO in its observed dataset, and also found generative source retrieval less consistent across repeated runs.

That empirical result is relevant to visibility risk, but it does not override Google's first-party definition of `Google-Extended`. The project currently chooses the no-training boundary over the possible Gemini-grounding visibility benefit. Google Search itself must remain accessible through Googlebot.

Changing `Google-Extended` from DENY to ALLOW is a policy change requiring explicit user approval; it is not an SEO implementation detail.

## 6. Search Console evidence contract

### 6.1 Accepted Google-side evidence

For Google indexation/query state:

- specific URL state: Search Console URL Inspection;
- whole-site index coverage: Search Console Page Indexing report;
- query, impression, click, CTR, position, and landing-page evidence: Search Console Performance report;
- sitemap processing: Search Console sitemap state after a valid production sitemap exists.

### 6.2 Supplemental evidence only

The following may diagnose or generate hypotheses but cannot establish Google indexation/query acceptance:

- manual Google searches,
- `site:` searches,
- screenshots of ordinary SERPs,
- AI Overview appearance alone,
- ChatGPT/Gemini/Perplexity answers,
- SerpAPI or another rank-tracking vendor,
- model assertions that a page "should be indexed."

### 6.3 Pending state rule

When Search Console has not finished processing a report, status must be:

`PENDING_EXTERNAL_EVIDENCE`

It must not be converted to PASS, FAIL, zero traffic, or "not indexed."

## 7. FR-205 / FR-206 / FR-207 mapping

| Requirement | Baseline predicate | Current state |
|---|---|---|
| FR-205 unique title/meta | each intended indexable route has unique SSR title + description | PARTIAL: `/` and `/book` observed; systematic gate absent |
| FR-205 canonical | absolute canonical equals approved production URL independent of analytics/client state | FAIL / not observed |
| FR-205 Open Graph | required OG metadata emitted in first response | FAIL / not observed |
| FR-205 structured data | only supported schema emitted and matches visible content | FAIL / absent |
| FR-205 sitemap | `/sitemap.xml` HTTP 200; canonical indexable URLs only | FAIL / 404 |
| FR-205 robots controls | public indexable routes crawlable; private/preview surfaces excluded; crawler policy matches Section 5 | PARTIAL: production crawler policy established; CI gate absent |
| FR-206 answer-first | public topic page directly answers mapped legitimate user question | NOT TESTABLE until R2 topic content |
| FR-206 evidence-aware/source-attributable | material claims map to approved sources with evidence class | NOT TESTABLE until R2 topic content |
| FR-206 internal links | contextual canonical-principle/related-content links; no keyword farms | NOT TESTABLE until R2 topic content |
| FR-206 dated/versioned | material public content exposes governed publish/update/version state | NOT TESTABLE until R2 publishing |
| FR-207 indexability | operator can inspect authoritative Google state | PARTIAL PASS: domain verified; two URLs indexed; site report pending |
| FR-207 search evidence | queries/landing/impressions/clicks observable | PENDING_EXTERNAL_EVIDENCE |
| FR-207 AI referral evidence | qualified AI referral evidence where observable | NOT YET BASELINED |
| FR-207 downstream action | content-to-book/signup governed events | NOT YET IMPLEMENTED for R2 |

## 8. Mechanical acceptance predicates

Future implementation must satisfy observable predicates. Examples below are normative for this proposed baseline once frozen.

### 8.1 Crawl and index infrastructure

```text
P1  GET(indexable_route) -> 200
P2  first_response_html contains primary visible content
P3  first_response_html contains exactly one expected absolute canonical
P4  canonical.host == approved_canonical_host
P5  canonical is invariant to analytics query parameters and client state
P6  title is present and unique within governed indexable route set
P7  meta description is present
P8  supported JSON-LD parses and every material entity/claim matches visible content
P9  GET(/sitemap.xml) -> 200 + valid XML
P10 sitemap_urls == canonical_indexable_route_set
P11 sitemap excludes API, preview, admin, private, result/session and noindex URLs
P12 production robots does not disallow intended public Googlebot/search retrieval
P13 preview/private/admin/result surfaces remain noindex/private as governed
P14 blocked training crawler set includes every policy-required DENY identity exposed by active controls
P15 allowed search/user crawler set is not accidentally blocked by project-owned controls
```

### 8.2 Search Console predicates

```text
SC1 domain_property_ownership == VERIFIED
SC2 inspected_critical_url state comes from Search Console URL Inspection
SC3 sitewide_index_state remains PENDING until Page Indexing report is processed
SC4 query/performance state remains PENDING until Performance report is processed
SC5 no public SERP observation may substitute for SC2-SC4
SC6 sitemap submission may occur only after production sitemap passes P9-P11
```

### 8.3 GEO measurement predicates

Because peer-reviewed evidence shows generative retrieval can vary across runs and query variants:

```text
G1 no single generative-engine response establishes GEO PASS
G2 benchmark query, engine, timestamp, locale/device where controllable, and result evidence are recorded
G3 repeated observations are required for claims about retrieval/citation stability
G4 raw observation != causal ranking proof
G5 vendor/API measurement cannot override first-party Search Console indexing state
```

## 9. Content-generation evidence contract

No generated article becomes publishable merely because a model produced citations.

For each material claim in an R2 topic page:

```text
claim
-> source
-> evidence class
-> source support
-> website requirement
-> implementation/content artifact
-> verification predicate
```

Publication must fail closed when a material claim:

- has no approved source,
- cites a source that does not support the claim,
- upgrades a hypothesis or practitioner assertion into empirical fact,
- represents non-peer-reviewed material as peer-reviewed evidence,
- attributes a book/framework doctrine to empirical research when the research does not support it,
- uses structured data to assert something not visible on the page.

Repository/book authority may define product doctrine. Peer-reviewed sources may substantiate empirical claims. Those are different evidence roles and must remain visibly distinguishable.

## 10. Negative controls / anti-reward-hacking cases

A future verifier must reject at least these cases:

1. Sitemap contains a preview or API URL.
2. Canonical points to a Vercel alias instead of approved production host.
3. Canonical changes when a UTM parameter is added.
4. JSON-LD contains an FAQ answer absent from visible content.
5. Training crawler marked ALLOW after policy says DENY.
6. OAI-SearchBot or Claude-SearchBot accidentally blocked while search/retrieval policy is ALLOW.
7. A public SERP screenshot is used to claim whole-site indexation.
8. Search Console "processing" is converted into zero impressions or FAIL.
9. One AI Overview/ChatGPT/Perplexity response is used to claim stable GEO visibility.
10. A generated article contains a plausible but unsupported research citation.

## 11. External services and bounded roles

- **Google Search Console:** authoritative external Google indexing/query evidence for this project.
- **PostHog:** governed downstream behavioral evidence; not indexing truth.
- **Cloudflare:** crawler-control and robots instrumentation/enforcement surface; not proof of search ranking.
- **SerpAPI:** optional repeatable SERP/AIO observation tooling if later approved; measurement automation only, never acceptance authority.

The SIGIR 2026 study used SerpAPI as a controlled retrieval proxy and validated that its source-list similarity was comparable to repeated manual/API retrieval for its experiment. This supports SerpAPI as a candidate measurement instrument, not as Google index truth.

## 12. Source register

### Repository authority

- `AGENTS.md`
- `docs/Website_Product_Specification_v1.0_LOCKED.md`
- `docs/Website_System_Architecture_v1.0_LOCKED.md`

### First-party provider documentation

- Cloudflare, Managed robots.txt / Content Signals: https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/
- OpenAI, Publishers and Developers FAQ: https://help.openai.com/en/articles/12627856
- Anthropic, crawler controls: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity, robots.txt behavior: https://www.perplexity.ai/help-center/en/articles/10354969-how-does-perplexity-follow-robots-txt
- Apple, Applebot / Applebot-Extended: https://support.apple.com/en-gb/119829
- Google, common crawlers / Google-Extended: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- Google Search Console, URL Inspection: https://support.google.com/webmasters/answer/9012289
- Google Search Console, Page Indexing: https://support.google.com/webmasters/answer/7440203

### Peer-reviewed empirical evidence

- Riley Grossman, Songjiang Liu, Michael K. Chen, Mike Smith, Cristian Borcea, Yi Chen. 2026. *How Generative AI Disrupts Search: An Empirical Study of Google Search, Gemini, and AI Overviews.* SIGIR '26. DOI: 10.1145/3805712.3809667.

## 13. Freeze blockers and next gate

This document remains **PROPOSED / NOT FROZEN**.

Before freeze:

1. user reviews and explicitly approves this baseline;
2. no unresolved contradiction may exist with higher repository authority;
3. the `ai-input` limitation must remain explicitly represented as UNSPECIFIED unless a supported control changes it;
4. current Search Console site-wide Page Indexing and Performance reports remain pending external evidence and must not be fabricated;
5. any material change to crawler policy must update this proposal before freeze.

After user approval/freeze, the first bounded implementation slice is the deterministic `/sitemap.xml` infrastructure required by FR-205, followed by canonical/metadata/schema verification.
