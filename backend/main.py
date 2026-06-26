from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from routers import recommendations, users, rankings, profile, rejections

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Drop API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vdmi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(rankings.router, prefix="/rankings", tags=["rankings"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(rejections.router, prefix="/rejections", tags=["rejections"])


@app.get("/")
async def root():
    return {"status": "ok"}
