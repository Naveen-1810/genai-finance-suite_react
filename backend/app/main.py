import os
from dotenv import load_dotenv

load_dotenv()  # loads backend/.env if present

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import income, expenses, stocks, dashboard, advisor, gsheet

# Creates tables only if they don't already exist -
# your existing finance_pro.db data is left untouched.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GenAI Finance Suite API")

origins = [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(income.router)
app.include_router(expenses.router)
app.include_router(stocks.router)
app.include_router(dashboard.router)
app.include_router(advisor.router)
app.include_router(gsheet.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
