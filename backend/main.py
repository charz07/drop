from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import recommendations, users, rankings

load_dotenv()

app = FastAPI(title="Drop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(rankings.router, prefix="/rankings", tags=["rankings"])


@app.get("/")
async def root():
    return {"status": "ok"}
