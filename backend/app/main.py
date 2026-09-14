import os
from dotenv import load_dotenv

load_dotenv()  # loads backend/.env if present

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import migrate_db
from .routers import auth, income, expenses, stocks, dashboard, advisor, gsheet

# Migrate tables and columns safely on startup
migrate_db()

app = FastAPI(title="GenAI Finance Suite API", version="2.0.0")

origins = [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(income.router)
app.include_router(expenses.router)
app.include_router(stocks.router)
app.include_router(dashboard.router)
app.include_router(advisor.router)
app.include_router(gsheet.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
