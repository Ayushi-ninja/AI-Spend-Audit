## Day 1 — 2026-05-06

**Hours worked:** 4

**What I did:**
Set up the Next.js 14 project with TypeScript and Tailwind CSS. Initialized the GitHub
repository and pushed the first commit. Created all required markdown files as empty
shells (README, ARCHITECTURE, REFLECTION, TESTS, PRICING_DATA, PROMPTS, GTM,
ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS). Researched and filled
PRICING_DATA.md by visiting each vendor's official pricing page — Cursor, GitHub
Copilot, Claude, Anthropic API, ChatGPT, OpenAI API, Gemini, and Windsurf — and
recorded verified prices with source URLs and today's date. Set up Vercel deployment
and confirmed the live URL is reachable. Added the GitHub Actions CI workflow file.
Chose Next.js 14 (App Router) as the framework given prior experience and its
built-in API routes, which simplifies the backend for lead capture and audit storage.

**What I learned:**
Windsurf's pricing structure changed recently — their free tier is more limited than I
initially assumed, which will affect how I write the audit recommendation logic for
users on that plan. Also confirmed that Anthropic API pricing is per-token (not flat
subscription), which means the audit engine needs a different evaluation approach
for API-direct users vs. claude.ai subscribers.

**Blockers / what I'm stuck on:**
Resend requires a verified domain to send emails from a custom address. The free
tier only allows sending to the account owner's email during development. Will
decide tomorrow whether to use a subdomain or accept this limitation for the MVP
and document it as a known constraint.

**Plan for tomorrow:**
Build the spend input form — tool selector, plan dropdown, monthly spend, seat
count, team size, and use case fields. Implement localStorage persistence so form
state survives page reloads. Define the full TypeScript types for AuditInput and
AuditResult. Begin sketching the audit engine rules for at least 3 tools.

## Day 2 — 2026-05-07

**Hours worked:** 5

**What I did:**
Defined all TypeScript types for AuditInput, ToolEntry, and UseCase. Built the
tool options config covering all 8 required tools with their respective plans.
Implemented a usePersistedForm hook that reads from localStorage on mount and
syncs on every state change — added a hydration flag to prevent the flash of
default values before localStorage loads. Built the full spend input form: tool
selector as toggle buttons, per-tool fields (plan dropdown, monthly spend, seats),
team size and use case selectors. Added validation before form submission.
Created the /audit/preview route as a placeholder for Day 3.

**What I learned:**
Next.js App Router requires 'use client' on any component using useState or
localStorage. Initially forgot this and got a hydration error. Also learned that
reading localStorage during SSR causes a mismatch — the hydrated flag pattern
solves this cleanly by deferring the read to useEffect.

**Blockers / what I'm stuck on:**
The plan dropdown for Anthropic API and OpenAI API only has one option
(Pay-as-you-go) since they are token-based. Need to decide how to handle spend
input for these — likely just a monthly spend field with no seats, since per-token
billing doesn't map to seat count. Will address this in the audit engine tomorrow.

**Plan for tomorrow:**
Build the audit engine as a pure TypeScript function. Write defensible rules for
all 8 tools covering wrong-plan-for-team-size, cheaper-same-vendor-plan, and
cheaper-alternative recommendations. Write all 5+ audit engine tests. Begin the
results page layout.

## Day 3 — 2026-05-08

**Hours worked:** 6

**What I did:**
Extended types/audit.ts with ToolAuditResult and AuditResult output types.
Built pricing constants in lib/pricing.ts sourced from verified vendor pages.
Implemented the full audit engine as a pure TypeScript function with individual
rule functions for all 8 tools. Rules cover three scenarios per tool: wrong plan
for team size, cheaper same-vendor alternative, and retail-vs-credits eligibility.
Wrote 6 Jest tests covering the main audit paths. Set up Jest with ts-jest and
confirmed all tests pass. Added a working results preview page that reads from
localStorage and renders the audit output.

**What I learned:**
Writing defensible audit logic is harder than it sounds. The first draft just said
"switch to X" without explaining why — had to rewrite every reason string to
include actual numbers and specific capability comparisons so a finance person
would agree. Also learned that API-direct users need a different evaluation model
since they don't pay per seat.

**Blockers / what I'm stuck on:**
The uuid package caused a module resolution issue with Jest — fixed by adding
moduleNameMapper in jest.config.js. Still need to decide how to handle the
case where a user inputs a monthly spend that doesn't match the expected
per-seat pricing — currently trusting the user's input as the source of truth.

**Plan for tomorrow:**
Build the full results page UI — hero savings numbers, per-tool breakdown cards,
Credex CTA for high-savings cases, honest messaging for already-optimal cases.
Integrate the Anthropic API for the personalized summary paragraph. Begin
Supabase schema and save audit results to the database.

## Day 4 — 2026-05-09

**Hours worked:** 2

**What I did:**
Set up Supabase project and created the audits table with public_url_id for
shareable URLs.

**What I learned:**
Also learned that Supabase
RLS needs to be configured carefully — disabled it for now and will revisit
before final submission.

**Blockers / what I'm stuck on:**
Need to implement the Supabase insert logic for saving audit results.
Also need to figure out how to handle the RLS configuration properly.

**Plan for tomorrow:**
Implement the Supabase insert logic for saving audit results.
Figure out how to handle the RLS configuration properly.

## Day 5 — 2026-05-11

**Hours worked:** 6

**What I did:**
Built the Resend email integration with a full HTML email template that
includes the savings hero, share URL, and conditional Credex CTA for
high-savings cases. Added IP-based rate limiting (5 requests/hour) and
honeypot spam protection to the lead capture route. Wrote all five
entrepreneurial markdown files: GTM.md with specific channels and
first-100-users plan, ECONOMICS.md with full conversion funnel math,
LANDING_COPY.md with headline and FAQ, METRICS.md with North Star
and input metrics, and USER_INTERVIEWS.md with notes from three real
conversations conducted this week.

**What I learned:**
The user interviews surfaced two things I hadn't anticipated: engineering
managers want a PDF they can send to their CFO, and indie founders
are suspicious of tool comparison sites because of affiliate bias. Both
changed the design — longer reason strings and a more prominent
already-optimal state.

**Blockers / what I'm stuck on:**
Resend free tier only allows sending to verified email addresses during
development. Using onboarding@resend.dev as sender for now. Need to
verify a domain before launch to send from a branded address.

**Plan for tomorrow:**
Polish the UI for mobile and Lighthouse scores. Write ARCHITECTURE.md
with Mermaid diagram. Write REFLECTION.md. Run Lighthouse on deployed
URL and fix any scores below threshold. Begin TESTS.md.
