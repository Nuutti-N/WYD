from fastapi import FastAPI
from backend.routers.users import router as users_router
from backend.routers.dreams import router as dreams
from backend.routers.checkins import router as checkin
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://wyd-sigma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "DELETE", "POST", "PUT"],
    allow_headers=["*"]
)

app.include_router(users_router)
app.include_router(dreams)
app.include_router(checkin)
