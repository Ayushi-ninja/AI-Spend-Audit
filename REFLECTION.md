# Reflection

## 1. The Hardest Bug

The hardest bug was the localStorage hydration flash on the results page.
When a user submitted the form and landed on /audit/preview, the page
briefly showed "No audit data found" before redirecting back to the home
page — even when valid form data existed in localStorage.

My first hypothesis was that the router.push('/') was firing too early,
before useEffect had a chance to read localStorage. I added a console.log
inside the useEffect and confirmed the data was there — it was being read
correctly. So the redirect was not the problem.

Second hypothesis: the component was rendering twice due to React Strict
Mode, and the second render was hitting a different code path. I disabled
Strict Mode temporarily — same behaviour. Not the cause.

Third hypothesis: localStorage.getItem was returning null on the first
render because the component was mounting before the browser had hydrated.
This turned out to be correct. In Next.js App Router, server components
render first, and 'use client' components still do an initial render on
the server where localStorage does not exist. The fix was to initialize
state as null and check typeof window !== 'undefined' before reading
localStorage, then set a hydrated flag in useEffect. Once hydrated was
true, the real data loaded and the UI updated correctly. No more flash.

## 2. A Decision I Reversed

I initially built the results page to wait for the full API response —
including the Anthropic summary and Supabase save — before showing
anything. The logic was: show complete results or nothing.

I reversed this after testing it myself and feeling how slow it was.
The Anthropic API call takes 2–4 seconds. Sitting on a loading spinner
for that long after clicking "Run My Audit" felt broken, even though
everything was working correctly.

The reversal: run the audit engine locally in the browser immediately on
page load (it's a pure function, takes <5ms), display those results
instantly, then call the API in the background to get the summary and
save to Supabase. When the API responds, update the summary block and
share URL without re-rendering the rest of the page.

This pattern — optimistic local computation with background API
enrichment — made the app feel instant. The user sees their savings
number in under 100ms while the API does its work quietly.

## 3. What I Would Build in Week 2

The three highest-value additions in priority order:

**PDF export:** The user interview with the Series A engineering manager
made this clear — he wanted something he could attach to a Slack message
for his CFO. A one-page PDF with the audit summary, per-tool breakdown,
and total savings is more shareable in a B2B context than a link. I would
use react-pdf to generate it client-side.

**Benchmark mode:** "Your AI spend per developer is $X — companies your
size average $Y." This requires aggregating anonymized data from completed
audits. Even with 50 audits, patterns emerge — average Cursor spend for
5-person teams, most common ChatGPT plan for writing-focused teams. This
makes the audit feel more authoritative and gives users context they
cannot get anywhere else.

**Embeddable widget:** A <script> tag a blogger or newsletter writer
could drop into their site. "Audit your AI spend" as an embedded form.
This turns every AI tool comparison article into a distribution channel.

## 4. How I Used AI Tools

I used Claude (Sonnet) throughout the week as a coding assistant and
thinking partner.

**What I used it for:**
- Generating boilerplate for API routes and TypeScript types
- Debugging the hydration issue — described the symptom and asked for
  hypotheses, which pointed me toward the SSR/localStorage conflict
- Drafting the initial audit engine rules, which I then rewrote to be
  more defensible with actual numbers
- Suggesting the email HTML template structure

**What I did not trust it with:**
- The audit logic reasoning strings — every "reason" field was written
  by me because the AI versions were too generic and not defensible
  enough for a finance-literate reader
- The ECONOMICS.md numbers — I ran the math myself and used Claude only
  to check my arithmetic
- The user interview notes — those were real conversations

**One specific time the AI was wrong:**
Claude initially suggested using the uuid package for generating audit
IDs and provided a standard import. This caused a Jest test failure
because uuid v9+ uses ES modules which Jest cannot parse by default.
The fix Claude suggested (transformIgnorePatterns) did not work either.
I solved it by replacing uuid entirely with a simple Math.random() +
Date.now() string — no external dependency, no ESM conflict. The AI
assumed the standard library recommendation would work in all contexts
without accounting for the Jest + ESM incompatibility.

## 5. Self-Rating

**Discipline: 7/10**
Committed code on 6 of 7 days and kept the DEVLOG updated daily. Lost
half a day to the hydration bug which I could have avoided by reading
the Next.js documentation on SSR and localStorage upfront.

**Code quality: 7/10**
The audit engine is clean, typed, and tested. The API routes are readable.
The component files got long toward the end of the week — the results
page in particular should be split into smaller components in a refactor.

**Design sense: 6/10**
The UI is clean and functional but not remarkable. I prioritized shipping
all six MVP features over visual polish. The results page hero works well
but the form page needs more visual hierarchy.

**Problem-solving: 8/10**
Debugged the hydration issue systematically through three hypotheses
before finding the root cause. Made the right call reversing the
loading-state decision quickly after feeling it myself. Used the user
interviews to change actual design decisions, not just write them up.

**Entrepreneurial thinking: 7/10**
The GTM plan is specific and actionable. The economics math is real,
not TAM hand-waving. The user interviews changed the product. Where I
underinvested was in the viral loop — the share URL exists but the
page could be designed more explicitly to make sharing feel compelling.