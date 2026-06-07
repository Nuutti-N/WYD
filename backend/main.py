from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from backend.routers.users import router as users_router
from backend.routers.dreams import router as dreams
from backend.routers.checkins import router as checkin
from backend.routers.paths import router as paths
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from backend.rate_limiter import limiter

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://wyd-sigma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(users_router)
app.include_router(dreams)
app.include_router(checkin)
app.include_router(paths)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many request. Please slow down and try again later."}
    )
