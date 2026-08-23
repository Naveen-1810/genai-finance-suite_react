import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google import genai

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/advisor", tags=["advisor"])


def build_context(db: Session, question: str) -> str:
    incomes = db.query(models.Income).all()
    expenses = db.query(models.Expense).all()
    stocks = db.query(models.Stock).all()

    total_income = sum(i.amount for i in incomes)
    total_expenses = sum(e.amount for e in expenses)
    total_pl = sum(s.pl for s in stocks)

    income_lines = "\n".join(f"{i.date} | {i.source} | ₹{i.amount:,.2f}" for i in incomes) or "No income entries."
    expense_lines = "\n".join(
        f"{e.date} | {e.category} | ₹{e.amount:,.2f} | {e.note}" for e in expenses
    ) or "No expense entries."
    stock_lines = "\n".join(
        f"{s.date} | {s.symbol} | qty {s.qty} | buy ₹{s.buy_price} | sell ₹{s.sell_price} | P/L ₹{s.pl:,.2f}"
        for s in stocks
    ) or "No stock holdings."

    return f"""You are a professional financial advisor. Below is the user's financial data.

SUMMARY:
- Total Income: ₹{total_income:,.2f}
- Total Expenses: ₹{total_expenses:,.2f}
- Net Stock P/L: ₹{total_pl:,.2f}

INCOME DETAILS:
{income_lines}

EXPENSE DETAILS:
{expense_lines}

STOCK PORTFOLIO:
{stock_lines}

User's Question: {question}
"""


@router.post("", response_model=schemas.AdvisorResponse)
def ask_advisor(payload: schemas.AdvisorQuery, db: Session = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY is not set on the server. Add it to backend/.env",
        )
    try:
        client = genai.Client(api_key=api_key)
        context = build_context(db, payload.question)
        response = client.models.generate_content(model="gemini-2.5-flash", contents=context)
        return {"answer": response.text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")
