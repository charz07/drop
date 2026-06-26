# Drop — Technical & Product Audit

---

## Executive Summary

**BLUF:** Drop has a working core loop and a genuinely differentiated idea, but it is not safe to share publicly in its current form. The backend has no authentication, no rate limiting, and a Supabase service-role key sitting one compromised environment away from full database access. The 40-brand catalog will exhaust in ~10 drops per user, eliminating the core retention mechanic. Fix the security surface this week, then immediately focus on catalog depth — everything else is secondary.

**Top 3 things to do this week:**
1. Add rate limiting to `/recommendations/` — one unprotected Gemini call per hit means a bot can drain your API budget in minutes.
2. Enable Supabase RLS with real policies — right now the entire database is open to anyone who knows your PostgREST URL and anon key.
3. Expand the brand catalog to at least 150 brands — 40 is not enough to sustain even casual usage.

**Overall state:** Functional MVP with a clean architecture and a legitimately interesting matching mechanism. The bones are good. The security posture is not ready for any real user load, and the product has one session of novelty before the catalog runs dry.

---

## Architecture Overview

Drop is a taste-profile-driven CPG brand discovery app. The core mechanic:

1. **Onboarding** — User completes a 6-step taste quiz (structured multiple-choice + one free-text question). Answers are synthesized client-side into a natural-language description via a template function (`synthesize()` in `TasteInput.jsx`).
2. **Embedding** — The taste description is sent to `POST /recommendations/`. The backend calls Gemini `gemini-embedding-001` to produce a 3072-dimension float vector.
3. **Matching** — The backend fetches all brand vectors from Supabase, computes cosine similarity in Python/numpy, applies a tag-affinity boost (0.15× weight on brands sharing tags with previously-ranked brands), and returns the top 4.
4. **Drop** — User sees 4 brand cards with name, description, tags, image, match %, and a 1-4 ranking UI.
5. **Feedback loop** — User ranks brands 1-4 or rejects them. Rankings are stored and used to build a weighted preference vector on the next request (`build_preference_vector()`, blended 60/40 with the query vector).
6. **Profile** — After ranking, Groq `llama-3.1-8b-instant` writes a 2-sentence taste summary from the top-ranked brands.

**Stack:**
- Frontend: React 19 / Vite, deployed on Vercel. No router library — screen state is a `useState` enum in `App.jsx`.
- Backend: FastAPI (Python 3.12), deployed on Railway. Synchronous Supabase-py calls inside async handlers.
- Database: Supabase (Postgres). Vectors stored as raw JSON arrays — no pgvector extension.
- Embeddings: Google Gemini `gemini-embedding-001` (3072-dim), called per request.
- Taste summaries: Groq `llama-3.1-8b-instant`, called on profile load.
- User identity: UUID generated in `localStorage`, passed as a query param on every API call.

**Data model (inferred from code):**
- `brands`: id, name, description, url, image_url, tags (text[]), vector (json array)
- `users`: id
- `drop_history`: user_id, brand_id
- `rankings`: user_id, brand_id, rank
- `rejections`: user_id, brand_id

---

## Technical Assessment

### Critical & High-Severity Issues (security first)

---

**[CRITICAL] No authentication — any user_id accepted by any endpoint**
`backend/routers/recommendations.py:11`, `rankings.py:9`, `rejections.py:9`, `profile.py:14`

`user_id` is a UUID from `localStorage`, passed as a URL query parameter. The API performs zero verification that the caller owns that `user_id`. Any request with any UUID is accepted. A caller can:
- Read any user's profile and ranked brands via `GET /profile/?user_id=<uuid>`
- Overwrite any user's rankings or rejections by guessing or enumerating UUIDs
- Poison another user's recommendation history

At MVP scale with zero public users this is low-exploitation risk, but it makes the system fundamentally insecure for any real launch. **Fix:** Add an auth layer — Supabase Auth (free, built-in, JWTs) is the obvious choice given the stack. User identifies with a JWT; the backend verifies it; RLS enforces row ownership at the DB level.

---

**[CRITICAL] Supabase service-role key used by backend, RLS not enforced**
`backend/.env` (not committed, but present on disk), `backend/services/database.py:7-10`

The `SUPABASE_KEY` in `.env` uses the `sb_secret_` prefix which is Supabase's service-role key format. A service-role key bypasses ALL RLS policies regardless of whether they're enabled. This means:
- If this key is ever exposed (Railway env var misconfiguration, log leak, etc.), an attacker has full read/write/delete on every table with no restrictions.
- RLS provides no defense while this key is in use — policies are irrelevant to it.

The immediate fix is two-part: (1) Enable RLS on all tables anyway as defense-in-depth (so the anon key can't be used directly against PostgREST); (2) consider whether the backend truly needs service-role or whether properly-scoped RLS policies + the anon key would suffice.

---

**[HIGH] No rate limiting on `/recommendations/`**
`backend/routers/recommendations.py`, `backend/main.py`

Every request to `/recommendations/` triggers a Gemini API call. There is no throttling, no per-IP limit, no per-user limit. A bot making 100 requests/minute would cost real money and could exhaust a free-tier Gemini quota. **Fix:** Add `slowapi` (FastAPI rate-limiting library, 10 min to integrate) — 5 req/min per IP is a reasonable starting point.

---

**[HIGH] Full brand catalog + 3072-dim vectors transferred from DB on every request**
`backend/services/database.py:61`, `backend/routers/recommendations.py:13`

`fetch_brand_catalog()` fetches all 40 brands including their raw 3072-float vectors on every single recommendation request. At 40 brands × 3072 floats × 8 bytes, that's ~1MB of JSON transferred from Supabase on every call, with no caching. This is the single biggest latency driver after the Gemini call, and it contributes zero value since brand vectors never change. **Fix:** Cache the catalog in-process with a module-level variable or `functools.lru_cache`. A 5-minute TTL is sufficient.

---

**[HIGH] 7 sequential synchronous DB calls in an async handler**
`backend/routers/recommendations.py:12-30`, `backend/services/database.py` (all functions are plain `def`)

The recommendations handler makes 7 Supabase round-trips sequentially:
1. `ensure_user_exists`
2. `fetch_brand_catalog`
3. `get_user_ranked_brands`
4. `get_user_rejected_brands`
5. `get_drop_history`
6. `get_user_rejection_ids`
7. `save_drop_history`

All database functions are synchronous (`def`, not `async def`), blocking the FastAPI event loop on every call. At 50-100ms per Supabase round-trip, this adds 350-700ms before the Gemini embed call even starts. Total estimated end-to-end latency: **2-4 seconds** on Railway → Supabase. **Fix:** Cache the brand catalog (eliminates call #2), merge the two rejections queries into one (eliminates call #6 or #4), and use `asyncio.gather` for the 3 independent user-state queries (#3, #4, #5).

---

### Architecture & Technical Debt

**[Medium] Dead ternary in App.jsx:28**
`frontend/src/App.jsx:28`
```js
const [screen, setScreen] = useState(savedTaste ? 'input' : 'input')
```
Both branches return `'input'`. This is presumably a leftover from an earlier design where returning users were sent directly to the drop screen. Harmless but confusing.

**[Medium] Brand rankings keyed by name, not ID**
`frontend/src/pages/Drop.jsx:11-18`

Local ranking state uses `brand.name` as the key (`rankings[b.name]`), but the API payload uses `brand_id`. Fragile: if two brands shared a name, rankings would silently collide. Should use `brand.id` consistently.

**[Medium] Catalog exhaustion is a silent dead end**
`backend/services/matching.py:59-68`

When all brands in the catalog have been seen (or rejected), `generate_drop` returns `[]`. The user gets no brands, no explanation, no recovery path. The crash was fixed (empty-insert guard removed), but the UX is still broken. **Fix:** Reset `drop_history` when catalog is exhausted, or show a "You've seen everything — reset?" message.

**[Medium] No error handling on Profile fetch**
`frontend/src/pages/Profile.jsx:10-14`

```js
getProfile(userId).then((data) => { ... })
```
No `.catch()`. If the profile endpoint fails, `fetching` stays `true` forever and the user sees an infinite loading spinner. **Fix:** Add `.catch(() => setFetching(false))`.

**[Low] Dead dependencies in requirements.txt**
`backend/requirements.txt`

`scikit-learn` is listed but never imported — cosine similarity is implemented manually in `matching.py`. Safe to remove. Reduces cold-start install time on Railway.

**[Low] Empty users router**
`backend/routers/users.py`

The file is literally `router = APIRouter()`. Either add the intended endpoints or delete the file and remove it from `main.py`.

**[Low] `groq` imported at module load in profile.py**
`backend/routers/profile.py:10`

`client = AsyncGroq(...)` initializes at import time, which means a missing `GROQ_API_KEY` will crash the entire app on startup, not just on profile requests. Move initialization inside the handler or use a lazy singleton.

---

### Embedding / Match Path

**Mechanism:** User taste description → Gemini `gemini-embedding-001` (3072-dim) → cosine similarity against all stored brand vectors → tag-affinity boost → top 4 returned. On subsequent requests, ranked brand vectors are blended with the query vector (60/40 blend), with rejected brands subtracted.

**What works:** The preference vector blending is more sophisticated than it looks. Inverse-rank weighting (rank 1 gets highest weight) + negative rejection weight is a reasonable approach for this catalog size. Tag affinity as a boosting layer is additive and interpretable.

**What doesn't:**

**Vectors not stored with pgvector** — Vectors are stored as raw JSON arrays in a standard Postgres column. There is no `pgvector` extension, no HNSW or IVFFlat index. Similarity search is done by fetching all vectors into Python and computing cosine in numpy. At 40 brands this is fine (~0ms). At 4,000 brands it starts to matter; at 40,000 it breaks. Not a today problem, but worth knowing.

**No Gemini API failure handling** — `embed_text()` has no try/catch, no retry, no fallback. A Gemini outage kills the entire recommendations endpoint with an unhandled exception. **Fix:** Wrap in try/except with a 503 response.

**Re-embedding on every request** — User taste descriptions are re-embedded on every `/recommendations/` call even if the description hasn't changed. Caching the embedding keyed on a hash of the taste description would eliminate a Gemini call for returning users. Low-effort optimization once the catalog cache is in place.

**Match score is not calibrated** — The match score is a raw cosine similarity (plus tag boost) rounded to 4 decimals, displayed as `Math.round(score * 100)%`. In practice, semantic embeddings produce scores in a narrow band — expect to see nearly all brands showing 75-85% regardless of actual fit. This will erode user trust quickly. Either don't show the score, calibrate it relative to the spread (min-max normalize), or show it differently (e.g., ranking indicators rather than absolute percentages).

---

### Test & Reliability Gaps

**Zero tests.** Across the entire codebase: no unit tests, no integration tests, no API tests, no frontend tests. The critical path — embed → match → return drop — is completely untested. This is acceptable at hackathon stage but becomes a maintenance liability the moment you onboard users and start iterating fast.

Minimum tests worth adding before any real launch:
- `test_generate_drop`: given a catalog and user vector, verify it returns the right number of brands, excludes already-received, excludes rejected
- `test_build_preference_vector`: weighted blending math
- `test_synthesize`: quiz answers → taste description output for each question permutation

---

## Product Assessment

### Positioning & Core User Journey

**What Drop is:** A personalized CPG brand discovery engine. The value prop is: "answer a few questions → get matched to emerging food/drink brands worth trying." The loop is: quiz → drop → rank → better next drop.

**Who the user is (inferred, unverified):** Likely 22-35, food-curious, follows CPG/wellness trends, overwhelmed by the exploding DTC brand landscape, values curation over search. Probably finds new brands via Instagram, Wirecutter, or word-of-mouth right now.

**The core journey works** — splash → quiz → drop → rank → profile is a coherent loop with a clear value exchange. The taste quiz improves on "describe yourself in a text box" for cold start. The free-text final step adding concrete brand references is high-signal.

**What's not clear:** Is Drop for consumers, or eventually for brands (B2B2C)? This changes the monetization path and who you optimize for.

---

### What's Blocking Growth / Usage

**1. The catalog is the product, and 40 brands isn't enough.**
A curious user doing 2-3 drops per week exhausts the catalog in under a month — and with the current `drop_history` logic, they'll hit every brand faster than that. Drop's entire value proposition depends on the catalog feeling deep and surprising. 40 brands is not deep.

**2. No reason to come back after the first session.**
After the first drop and ranking, why does a user return? The promise is "better next drop" — but without a notification, email, or any re-engagement mechanic, the user has to remember to come back. No push, no email, no hook. Re-engagement is entirely on the user.

**3. Ranking 1-4 is an awkward interaction.**
Ranking four brands on a 1-4 scale asks the user to do comparative work they don't naturally do. Most users will rank arbitrarily, generating low-signal feedback. Like/Love/Pass would produce higher-quality signal with less friction, and is how every successful recommendation system (Spotify, TikTok, Netflix) actually collects preference data — implicitly, through lightweight actions.

**4. Match score erodes trust.**
When three brands all show "78% match," users conclude the score is meaningless. A percentage implies calibration that doesn't exist here. Either remove it, or transform it into something more honest (e.g., "Strong match" / "Good match" buckets, or a normalized star rating).

**5. No action path from the brand cards.**
The user sees a brand they like, clicks "Visit →," and lands on the brand's website. Then what? There's no buy link, no price, no "add to list," no way to save it. The discovery loop ends at awareness with no path to action. This is fine for MVP but it means Drop doesn't capture any of the downstream value it generates for brands.

**6. Identity is localStorage.**
Clear your browser data → lose your entire taste profile. No account = no email = no re-engagement = no retention. This is the single biggest structural retention gap. Without account creation, Drop cannot build a relationship with its users.

---

### Competitive & Differentiation Notes

Drop's closest competition isn't an app — it's an Instagram scroll or a "best CPG brands" Substack. The differentiation is personalization + structure. Nobody does systematic taste-profile-to-brand matching for CPG at the consumer level. That's a real gap.

**Where Drop could win:** If the catalog grows to 500+ brands and the recommendation quality is meaningfully different person-to-person (someone who loves fermented funk gets completely different results than someone who wants clean-label basics), Drop becomes genuinely useful. The tech already does this — the question is whether the catalog is large enough to make the differentiation visible.

**Where Drop must reach parity fast:** "Where can I buy this?" is table stakes for a discovery product. Right now Drop generates interest and then abandons the user at the purchase decision.

**Risk:** OpenAI/Perplexity "what CPG brands match my taste" is a low-friction competitor for the same query. Drop wins only if the structured loop (rank → improve → next drop) delivers meaningfully better results than a chat interface. That requires catalog depth and demonstrated recommendation improvement, neither of which exist yet.

---

## Prioritized Roadmap (next 30/60/90 days)

Items marked 🔒 are **launch-blockers** — do not share publicly until resolved.

| # | Item | Type | ICE | Effort | Rationale | Window |
|---|------|------|-----|--------|-----------|--------|
| 1 | Add rate limiting on `/recommendations/` | Tech | 9×9×8 = **648** | 2h | One-line `slowapi` integration; unthrottled Gemini = open wallet | 🔒 Now |
| 2 | Enable Supabase RLS on all tables | Tech | 8×9×6 = **432** | 4h | Database fully open to PostgREST anon requests; defense-in-depth even with service key | 🔒 Now |
| 3 | Expand brand catalog to 150+ brands | Product | 9×9×4 = **324** | 1-2 days | Catalog is the product; 40 brands = ~10 drops per user before exhaustion | Now |
| 4 | Cache brand catalog in-process | Tech | 7×9×8 = **504** | 1h | Eliminates ~1MB Supabase fetch on every request; biggest latency win available | Now |
| 5 | Parallelize independent DB queries | Tech | 6×8×6 = **288** | 3h | `ensure_user_exists` + ranked/rejected/history can run concurrently; saves ~200ms | 30 days |
| 6 | Handle catalog exhaustion gracefully | Tech/UX | 7×9×8 = **504** | 2h | Silent broken state today; show reset option or cycle | 30 days |
| 7 | Replace 1-4 ranking with Like/Love/Pass | Product | 7×7×7 = **343** | 4h | Reduces friction; generates cleaner signal; matches how users naturally express preference | 30 days |
| 8 | Fix match score display | Product | 6×7×7 = **294** | 2h | "78% match" on every card destroys trust; normalize or replace with tiers | 30 days |
| 9 | Add user auth (Supabase Auth) | Tech | 8×7×3 = **168** | 1-2 days | Enables re-engagement and real identity; prerequisite for notifications and retention | 60 days |
| 10 | Add error handling on Profile fetch | Tech | 4×9×9 = **324** | 30min | Infinite spinner on error is a bug; `.catch()` is a one-liner | Now |
| 11 | Add Gemini API failure handling | Tech | 6×9×8 = **432** | 1h | Unhandled exception crashes recommendations on Gemini outage | Now |
| 12 | "Where to buy" links (Amazon/Thrive) | Product | 7×6×5 = **210** | 1 day | Closes the discovery-to-purchase gap; Drop currently strands users at awareness | 60 days |
| 13 | Email re-engagement ("Your next drop is ready") | Product | 7×5×3 = **105** | 2-3 days | Requires auth (#9) first; biggest retention lever once identity is solved | 90 days |
| 14 | Shareable drop card | Product | 6×5×5 = **150** | 1 day | Growth mechanic; requires something worth sharing (needs catalog depth first) | 90 days |
| 15 | pgvector + HNSW index | Tech | 3×8×4 = **96** | 4h | Not needed at <1000 brands; Python cosine on 40 brands takes microseconds | Skip for now |
| 16 | Remove scikit-learn from requirements.txt | Tech | 1×9×9 = **81** | 5min | Dead dependency; do it but don't prioritize | Now |

---

## Open Questions for Charlotte

The roadmap above is ranked on current assumptions. Your answers to these will shift priorities significantly:

1. **Who is the target user?** Consumer (B2C) looking for brands to try, or are you also thinking about brands paying for placement/discovery (B2B2C)? These are very different products with different roadmaps and monetization paths.

2. **What's the monetization hypothesis?** Subscription, affiliate/referral on brand purchases, brand partnerships, SaaS for brands to track consumer interest? This determines which features matter most: "where to buy" links for affiliate revenue, analytics for brand subscriptions, etc.

3. **Do you have any users besides yourself?** Current usage/traction shapes how much to invest in retention vs acquisition. If it's zero real users, catalog depth is more important than re-engagement mechanics.

4. **Is a public launch or demo (fundraise, competition, showcase) imminent?** If yes, the security items (#1 and #2) are non-negotiable before sharing the URL publicly. If you're still in private testing, they can wait a week.

5. **What's your API cost budget?** Gemini embedding on every `/recommendations/` call plus Groq on every profile load adds up. At 1,000 MAU with 3 sessions/month, rough estimate is ~$15-30/month in API costs today. At 10,000 MAU it's $150-300. Worth knowing before you scale.

6. **How do you plan to grow the brand catalog?** Manual curation (you research and add), community submission (brands self-submit), or scraping/crawling? Manual is the only way to ensure quality but doesn't scale. This is the most important strategic question for the product.

7. **Is there a distribution plan?** How does a user find Drop today? Word of mouth, social, SEO, something else? This determines whether growth or retention should come first.
