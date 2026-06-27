# Drop

**[vdmi.vercel.app](https://vdmi.vercel.app)**

Emerging food and drink brands make great products. Most of them never reach the right person.

**Drop is a taste-matched discovery platform that puts emerging CPG brands in front of consumers whose palate actually fits.** Brands get precision placement — not paid reach, not demographic guessing, but embedding-based matching against a real taste profile built from conversation. Consumers get a curated digital sample box, personalized to what they actually eat.

**For brands:** your product surfaces inside a drop of 4, sent to users whose taste profile matches your flavor vector. Every reaction (want / maybe / pass) is a signal — who wants you, who doesn't, and what that says about your audience.

**For consumers:** tell Drop what you eat, what you love, what you'd never touch. It builds your taste profile, then drops a box of 4 brands you've never heard of but will probably love. React to each one. Every future drop gets sharper.

## How it works

1. **Chat onboarding** — a conversational AI (Llama 3.3 via Groq) collects 5 taste signals: brands you love, what you avoid, dietary restrictions, health goals, and heat tolerance. It searches the web in real time when you mention a specific brand name (Tavily), so it always reacts with accurate flavor context rather than hallucinated descriptions.

2. **Embedding + matching** — your conversation is synthesized into a rich first-person taste profile, embedded via Google Gemini (`gemini-embedding-001`), and compared against brand vectors in Supabase using cosine similarity. Brands you've already seen or explicitly passed are excluded.

3. **The drop** — your box arrives: 4 brands, each one a card. Flip to read the description. React (want / maybe / pass). It's the digital equivalent of reaching into a sample box — but every item was put there for you specifically.

4. **Preference learning** — ranked brands build a weighted preference vector (want = higher weight, pass = negative weight) that blends with your taste embedding at 40/60 for future drops. A tag-affinity score (15% weight) adds a second signal on top of cosine similarity.

5. **Taste profile** — a persona card, superlative stats, and a collapsible log of every brand you've reacted to. Dietary restrictions and goals extracted from the conversation persist in localStorage and display separately from the flavor log.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, hosted on Vercel |
| Backend | FastAPI (Python), hosted on Railway |
| Database | Supabase (Postgres + pgvector) |
| Embeddings | Google Gemini `gemini-embedding-001` |
| Chat LLM | Groq `llama-3.3-70b-versatile` |
| Brand search | Tavily web search API |
| Rate limiting | slowapi |

## Project structure

```
/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── TasteInput.jsx   # conversational chat onboarding
│       │   ├── Drop.jsx         # animated box + flip cards + reactions
│       │   └── Profile.jsx      # persona, superlatives, brand log
│       ├── components/
│       │   ├── BrandSheet.jsx   # bottom sheet modal (full brand detail)
│       │   └── BrandCard.jsx
│       ├── api/
│       │   └── recommendations.js
│       ├── utils/
│       │   └── tagColor.js      # deterministic hash → 6-color tag palette
│       ├── App.jsx
│       └── index.css            # full design token system (OKLCH)
│
└── backend/
    ├── main.py                  # FastAPI app, CORS, rate limiter
    ├── routers/
    │   ├── chat.py              # LLM chat + tool call + synthesis
    │   ├── recommendations.py   # drop generation endpoint
    │   ├── profile.py           # user profile + brand log
    │   ├── rankings.py          # submit want/maybe reactions
    │   ├── rejections.py        # submit pass reactions
    │   ├── users.py             # user creation
    │   └── analytics.py
    ├── services/
    │   ├── embeddings.py        # Gemini embedding calls
    │   ├── matching.py          # cosine similarity, preference vector, drop generation
    │   └── database.py          # Supabase client
    └── models/
        └── schemas.py
```

## Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then fill in your keys
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

### Backend `.env`

```
GEMINI_API_KEY=        # Google AI Studio — used for embeddings
GROQ_API_KEY=          # Groq — used for chat LLM (llama-3.3-70b-versatile)
TAVILY_API_KEY=        # Tavily — used for brand web search (optional; chat degrades gracefully without it)
SUPABASE_URL=          # your Supabase project URL
SUPABASE_KEY=          # service role key (not anon — needs write access)
```

### Frontend

No `.env` required locally. The API base URL defaults to `http://localhost:8000`. For production, set `VITE_API_URL` to your Railway deployment URL.

## API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/chat/` | Send a chat message; returns AI reply + `[DONE]` signal + taste profile on completion |
| `POST` | `/recommendations/` | Generate a drop for a user (requires taste embedding in Supabase) |
| `POST` | `/users/` | Create or retrieve a user |
| `POST` | `/rankings/` | Submit want / maybe reactions |
| `POST` | `/rejections/` | Submit pass reactions |
| `GET` | `/profile/{user_id}` | Get brand reaction history + taste summary |

## Matching algorithm

**Drop generation** (`services/matching.py`):

1. Embed the synthesized taste description (Gemini `gemini-embedding-001`, 3072-dim)
2. If the user has prior reactions, build a weighted preference vector: `want` brands get weight proportional to rank position, `pass` brands get a negative weight equal to the max positive weight
3. Blend: `final_vector = 0.6 × taste_embedding + 0.4 × preference_vector` (normalized)
4. Score every brand in the catalog: `score = cosine_similarity + 0.15 × tag_affinity`
5. Exclude already-seen brands and explicit passes
6. Return the top 4

**Tag affinity** is a normalized weight map built from the tags of `want`-reacted brands — a fast secondary signal that doesn't require a re-embedding.

## Chat onboarding

The chat router (`routers/chat.py`) uses Groq's function-calling API with a `search_brand` tool backed by Tavily. When the model triggers the tool, the router:

1. Runs the Tavily search synchronously
2. Re-calls the LLM with the search result appended to the system prompt
3. Returns the follow-up response (the user never sees the search happened)

The model also sometimes leaks tool calls as inline XML into its content string (`<function=search_brand={"query": "..."}></function>`). The router catches both leakage formats with a regex fallback before returning any response to the client.

When the model signals `[DONE]`, the router runs two parallel calls:
- **Synthesis** — generates a rich first-person taste profile paragraph for embedding
- **Dietary extraction** — extracts restrictions and goals as structured JSON

Both results are returned in the same response payload. The taste description is embedded server-side and stored in Supabase. Dietary data is stored in the browser's `localStorage`.

## Design system

The visual system is fully documented in [`DESIGN.md`](DESIGN.md).

North Star: **"The Warm Curator"** — one saffron accent (Ripe Goldenrod, `oklch(0.82 0.20 80)`), two fonts (Bricolage Grotesque display + DM Sans UI), trust through restraint.

Key rules:
- Goldenrod accent on ≤10% of any screen
- Tonal depth (bg → surface → surface-raised) before shadows
- Shadows appear at exactly two moments: the drop box lift and the opening bloom
- Bricolage Grotesque for display headings only; DM Sans for all UI chrome

Component snippets for the live panel live in [`.impeccable/design.json`](.impeccable/design.json).

## Deployment

**Backend (Railway):** Configured via `railway.toml`. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Restart policy: `on_failure`.

**Frontend (Vercel):** Auto-deploys from `main`. Build command: `npm run build`. Output: `dist/`.

CORS is configured to allow `https://vdmi.vercel.app` in production and any `localhost:*` port in development.
