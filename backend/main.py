from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from limiter import limiter
from routers import recommendations, users, rankings, profile, rejections, analytics

load_dotenv()

app = FastAPI(title="Drop API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vdmi.vercel.app",
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(rankings.router, prefix="/rankings", tags=["rankings"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(rejections.router, prefix="/rejections", tags=["rejections"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@app.get("/")
async def root():
    return {"status": "ok"}
