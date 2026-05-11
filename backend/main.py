from fastapi import FastAPI

from backend.routers.users import router as users_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "DELETE", "POST", "PUT"],
    allow_headers=["Authorization", "Content-type"]
)

app.include_router(users_router)
