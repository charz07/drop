# Drop

A taste-profile-driven discovery platform for emerging food and beverage brands. Describe what you like to eat and drink in natural language — Drop matches you to brands you've never heard of but will probably love.

## How it works

1. User describes their taste in a free-text prompt
2. Prompt is embedded via Google Gemini and compared against brand vectors using cosine similarity
3. Top 4 matching brands are returned as a "drop"
4. User ranks the brands 1–4; rankings are saved to improve future drops

## Stack

- **Frontend:** React + Vite, hosted on Vercel
- **Backend:** FastAPI (Python), hosted on Railway
- **Database:** Supabase (Postgres)
- **Embeddings:** Google Gemini (`gemini-embedding-001`)
- **Rationale generation:** Groq (`llama-3.1-8b-instant`)

## Project structure

```
/frontend   React Vite app
/backend    FastAPI Python app
```

## Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

Backend `.env`:

```
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
GROQ_API_KEY=
```
