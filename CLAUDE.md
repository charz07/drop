# Drop App — Taste-Matched CPG Discovery

## What this is
A taste-profile-driven CPG discovery platform. Users describe their taste in natural language, get matched to emerging food/beverage brands via OpenAI embeddings, receive a curated drop of 4 brands, and rank them to improve future recommendations.

## Stack
- Frontend: React (Vite)
- Backend: FastAPI (Python)
- Database: Supabase (Postgres)
- Embeddings: OpenAI API (text-embedding-3-small)
- Rationale generation: Anthropic Claude API
- Frontend hosting: Vercel
- Backend hosting: Railway

## Project structure
/frontend — React Vite app
/backend — FastAPI Python app

## Current build phase
Week 1: Brand catalog + embedding service + results screen

## Conventions
- Python: use async/await throughout FastAPI
- React: functional components only, no class components
- All API keys via environment variables, never hardcoded
- Brand vectors stored in Supabase alongside brand metadata